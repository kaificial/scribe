import { useState, useCallback } from 'react';
import { initLocalAI, convertImageLocally } from '../services/localAI';
import { convertImageViaCloud } from '../services/cloudAI';
import type { ProcessingMode } from '../types';

interface OcrWorkerState {
    status: string;
    progress: number;
}

export function useOcrWorker(mode: ProcessingMode = 'local') {
    const [state, setState] = useState<OcrWorkerState>({
        status: '',
        progress: 0,
    });

    // only needed for local mode (downloads the model). Resolves once the model
    // is actually ready - callers must await this before convert() for local mode,
    // so a 'process' request never races the initial model download.
    const init = useCallback((): Promise<void> => {
        if (mode === 'cloud') return Promise.resolve();

        return initLocalAI(
            (message) => setState(prev => ({ ...prev, status: message })),
            (progress) => setState(prev => ({ ...prev, progress })),
        );
    }, [mode]);

    // routes to local or cloud based on current mode
    const convert = useCallback((dataUrl: string): Promise<string> => {
        if (mode === 'cloud') {
            return convertImageViaCloud(dataUrl);
        }
        return convertImageLocally(dataUrl);
    }, [mode]);

    // cloud is always "ready" (no model to download)
    const status = mode === 'cloud' ? 'Cloud AI ready' : state.status;

    return {
        convert,
        init,
        status,
        progress: state.progress,
    };
}
