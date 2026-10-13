
let worker: Worker | null = null;
let statusCallback: (status: string) => void = () => {};
let progressCallback: (progress: number) => void = () => {};
// memoized so concurrent/repeated init calls share one in-flight (or completed) load
let readyPromise: Promise<void> | null = null;

const pendingRequests = new Map<string, {
    resolve: (value: string) => void;
    reject: (reason: Error) => void;
}>();

function ensureWorker(): Worker {
    if (worker) return worker;

    worker = new Worker(new URL('./ocr-worker.ts', import.meta.url), {
        type: 'module'
    });

    worker.onmessage = (event) => {
        const { status, message, result, progress, id } = event.data;

        if (status === 'download_progress') {
            progressCallback(progress);
        }

        statusCallback(message || status);

        if (id && pendingRequests.has(id)) {
            const pending = pendingRequests.get(id)!;
            pendingRequests.delete(id);
            if (status === 'success' || status === 'ready') {
                pending.resolve(result);
            } else if (status === 'error') {
                pending.reject(new Error(message));
            }
        }
    };

    return worker;
}

// resolves once the model is loaded and ready to run - safe to call repeatedly,
// callers always await this before sending 'process' so the worker never races
// itself into loading the model twice on first use
export const initLocalAI = (onStatusChange?: (status: string) => void, onProgress?: (progress: number) => void): Promise<void> => {
    if (onStatusChange) statusCallback = onStatusChange;
    if (onProgress) progressCallback = onProgress;

    const w = ensureWorker();

    if (!readyPromise) {
        readyPromise = new Promise<void>((resolve, reject) => {
            const id = crypto.randomUUID();
            pendingRequests.set(id, {
                resolve: () => resolve(),
                reject: (err) => {
                    readyPromise = null; // allow a retry instead of staying stuck on one failure
                    reject(err);
                },
            });
            w.postMessage({ type: 'init', id });
        });
    }

    return readyPromise;
};

export const convertImageLocally = (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const w = ensureWorker();
        const id = crypto.randomUUID();
        pendingRequests.set(id, { resolve, reject });
        w.postMessage({ type: 'process', id, image: imageDataUrl });
    });
};
