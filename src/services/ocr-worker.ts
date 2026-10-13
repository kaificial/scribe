
import { pipeline, env, RawImage } from '@huggingface/transformers';
import { sanitizeLatex } from './sanitizeLatex';

// holds the ai model once it's loaded
let ocrPipeline: any = null;

env.allowLocalModels = false;

// loads the model if it isn't already loaded; throws on failure so callers can report it
const init = async () => {
    if (ocrPipeline) return;

    self.postMessage({ status: 'loading', message: 'initializing texify model...' });

    // texify works better for math formulas
    ocrPipeline = await pipeline('image-to-text', 'Xenova/texify', {
        dtype: 'q8',
        progress_callback: (progress: any) => {
            if (progress.status === 'progress') {
                self.postMessage({
                    status: 'download_progress',
                    message: `downloading ${progress.file}...`,
                    progress: progress.progress,
                    file: progress.file
                });
            }
        }
    });
};

const preprocessImage = async (imageSource: string): Promise<RawImage> => {
    const img = await RawImage.fromURL(imageSource);
    // texify performs best when the formula is prominent.
    // The pipeline handles resizing, but we ensure the image is clean.
    return img;
};

self.onmessage = async (event) => {
    const { type, id, image } = event.data;

    if (type === 'init') {
        try {
            await init();
            self.postMessage({ status: 'ready', id, message: 'ai ready' });
        } catch (error: any) {
            self.postMessage({ status: 'error', id, message: error.message });
        }
        return;
    }

    if (type === 'process') {
        try {
            if (!ocrPipeline) {
                await init();
            }

            self.postMessage({ status: 'processing', message: 'analyzing formula...' });

            const processedImage = await preprocessImage(image);

            // optimized parameters for texify
            const result = await ocrPipeline(processedImage, {
                num_beams: 5,
                max_new_tokens: 384,
                repetition_penalty: 1.3,
                temperature: 0.1,
            });

            let output = result[0].generated_text;
            output = sanitizeLatex(output);

            self.postMessage({ status: 'success', id, result: output });
        } catch (error: any) {
            self.postMessage({ status: 'error', id, message: error.message });
        }
    }
};
