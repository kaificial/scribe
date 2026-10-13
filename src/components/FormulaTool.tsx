
import React, { useRef, useState } from 'react';
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory';
import { useOcrWorker } from '../hooks/useOcrWorker';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import { useImageInput } from '../hooks/useImageInput';
import { useWebGPU } from '../hooks/useWebGPU';
import { DrawingToolbar } from './canvas/DrawingToolbar';
import { DrawingCanvas } from './canvas/DrawingCanvas';
import { ResultView } from './result/ResultView';
import { HistoryGallery } from './history/HistoryGallery';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { TranscriptionBench } from './figures/bench/Bench';
import { ModeSwitch } from './console/ModeSwitch';
import { InputChooser } from './console/InputChooser';
import { AppState, type HistoryItem, type ProcessingMode } from '../types';
import { thresholdPixels, findContentBoundingBox, computeScaledDimensions } from '../utils/imageProcessing';

// what the working bench says while an image is processed
function processingText(mode: ProcessingMode, ocr: { progress: number; status: string }) {
    if (mode === 'cloud') return { status: 'sending to claude…', title: 'Cloud AI Processing' };
    if (ocr.progress > 0 && ocr.progress < 100) {
        return { status: `downloading model · ${Math.round(ocr.progress)}%`, title: 'Initializing AI Model' };
    }
    return { status: (ocr.status || 'running inference…').toLowerCase(), title: 'Transformer Layer Processing' };
}

const FormulaTool: React.FC = () => {
    const [state, setState] = useState<AppState>(AppState.IDLE);
    const [latex, setLatex] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // default to local when WebGPU is supported, cloud otherwise
    const webgpu = useWebGPU();
    const defaultMode: ProcessingMode = webgpu.loading ? 'local' : (webgpu.supported ? 'local' : 'cloud');
    const [mode, setMode] = useState<ProcessingMode>(defaultMode);

    // sync default mode once webgpu detection finishes
    React.useEffect(() => {
        if (!webgpu.loading && !webgpu.supported) {
            setMode('cloud');
        }
    }, [webgpu.loading, webgpu.supported]);

    const ocr = useOcrWorker(mode);
    const [strokeSize, setStrokeSize] = useState<number>(4);
    const [isEraser, setIsEraser] = useState<boolean>(false);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasHistory = useCanvasHistory(canvasRef);

    // Downscale helper to reduce token usage and payload size
    const resizeImage = (dataUrl: string, maxDim: number = 512): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const { width, height } = computeScaledDimensions(img.width, img.height, maxDim);
                if (width === img.width && height === img.height) {
                    resolve(dataUrl);
                    return;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/png'));
                } else {
                    resolve(dataUrl); // fallback
                }
            };
            img.src = dataUrl;
        });
    };

    const imageInput = useImageInput(async (dataUrl) => { 
        const resized = await resizeImage(dataUrl);
        setPendingImageData(resized); 
        setShowConfirmation(true); 
    });
    const history_ = useTranscriptionHistory();
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const [pendingImageData, setPendingImageData] = useState<string | null>(null);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d', { willReadFrequently: true });
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvasHistory.save();
        }
        setLatex('');
    };

    const preprocessImage = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return canvas;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        thresholdPixels(imageData.data);
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    };

    const getCroppedCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement | null => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return canvas;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const bbox = findContentBoundingBox(imageData, 40);
        if (!bbox) return null;
        const { minX, minY, maxX, maxY } = bbox;
        const cw = maxX - minX, ch = maxY - minY;

        // Resize if too large to save tokens
        const MAX_DIM = 512;
        const { width: finalWidth, height: finalHeight } = computeScaledDimensions(cw, ch, MAX_DIM);

        const cropped = document.createElement('canvas');
        cropped.width = finalWidth; cropped.height = finalHeight;
        const cCtx = cropped.getContext('2d', { willReadFrequently: true });
        if (cCtx) {
            cCtx.fillStyle = '#FFFFFF';
            cCtx.fillRect(0, 0, finalWidth, finalHeight);
            cCtx.drawImage(canvas, minX, minY, cw, ch, 0, 0, finalWidth, finalHeight);
        }
        return preprocessImage(cropped);
    };

    const handleProcess = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const cropped = getCroppedCanvas(canvas);
        if (!cropped) { setError('Please draw something first'); return; }
        setPendingImageData(cropped.toDataURL('image/png'));
        setShowConfirmation(true);
    };

    const handleProcessWithImage = async (dataUrl: string) => {
        setState(AppState.PROCESSING);
        setError(null);
        setProcessedImage(dataUrl);
        try {
            // for local mode, make sure the model is actually loaded before sending a
            // process request - otherwise the first-ever request races the initial
            // model download inside the worker
            if (mode === 'local') {
                await ocr.init();
            }
            const result = await ocr.convert(dataUrl);
            setLatex(result);
            setState(AppState.RESULT);
            if (result && !result.includes('failed') && !result.includes('unclear')) {
                const newItem: HistoryItem = {
                    id: crypto.randomUUID(),
                    latex: result,
                    timestamp: Date.now(),
                    image: dataUrl,
                };
                history_.add(newItem);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
            setState(AppState.IDLE);
        }
    };

    const handleConfirmProcess = () => {
        setShowConfirmation(false);
        if (pendingImageData) {
            handleProcessWithImage(pendingImageData);
            setPendingImageData(null);
        }
    };

    const handleCancelProcess = () => {
        setShowConfirmation(false);
        setPendingImageData(null);
    };

    const processing = processingText(mode, ocr);

    return (
        <div className="w-full relative z-10">
            <div className="ui-panel overflow-hidden">

                <ModeSwitch mode={mode} webgpuSupported={webgpu.supported} onChange={setMode} />

                {state === AppState.IDLE && (
                    <InputChooser
                        onDraw={() => setState(AppState.DRAWING)}
                        fileInputRef={imageInput.fileInputRef}
                        onFileChange={imageInput.onFileChange}
                    />
                )}

                {state === AppState.DRAWING && (
                    <div className="p-4 md:p-6">
                        <DrawingToolbar
                            isEraser={isEraser}
                            strokeSize={strokeSize}
                            canUndo={canvasHistory.canUndo}
                            canRedo={canvasHistory.canRedo}
                            onSetEraser={setIsEraser}
                            onStrokeSizeChange={setStrokeSize}
                            onUndo={canvasHistory.undo}
                            onRedo={canvasHistory.redo}
                            onClear={clearCanvas}
                            onProcess={handleProcess}
                            onBack={() => { canvasHistory.reset(); setState(AppState.IDLE); }}
                        />
                        <DrawingCanvas
                            canvasRef={canvasRef}
                            isEraser={isEraser}
                            strokeSize={strokeSize}
                            onStrokeEnd={canvasHistory.save}
                        />
                    </div>
                )}

                {state === AppState.PROCESSING && (
                    <div className="p-4 md:p-6 sb-working" aria-live="polite">
                        <TranscriptionBench
                            mode="work"
                            image={processedImage}
                            status={processing.status}
                            fig="Converting"
                            title={processing.title}
                            legend={false}
                        />
                    </div>
                )}

                {state === AppState.RESULT && (
                    <ResultView
                        latex={latex}
                        processedImage={processedImage}
                        onLatexChange={setLatex}
                        onBack={() => setState(AppState.IDLE)}
                    />
                )}

                {error && (
                    <div className="px-4 md:px-6 pb-6">
                        <div className="bg-brand-soft text-zinc-900 p-4 rounded-md text-sm border border-brand/30 flex items-center gap-3 font-mono text-[12px]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}
            </div>

            <HistoryGallery
                items={history_.items}
                onCopy={(text) => navigator.clipboard.writeText(text)}
                onDelete={history_.remove}
                onClearAll={history_.clear}
            />

            <ConfirmationModal
                open={showConfirmation}
                mode={mode}
                onConfirm={handleConfirmProcess}
                onCancel={handleCancelProcess}
            />
        </div>
    );
};

export default FormulaTool;
