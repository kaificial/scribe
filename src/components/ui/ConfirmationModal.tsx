import type { ReactNode } from 'react';
import type { ProcessingMode } from '../../types';

interface Props {
    open: boolean;
    mode: ProcessingMode;
    onConfirm: () => void;
    onCancel: () => void;
}

const CloudIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const COPY: Record<ProcessingMode, { icon: ReactNode; title: string; body: string; confirm: string }> = {
    cloud: {
        icon: <CloudIcon />,
        title: 'Send to Cloud AI',
        body: 'Your image will be sent securely to Claude AI for processing. No images are stored.',
        confirm: 'Send',
    },
    local: {
        icon: <DownloadIcon />,
        title: 'Download Required',
        body: 'To process images locally on your device, we need to download AI models. This may take a moment but only needs to happen once.',
        confirm: 'Download & run',
    },
};

export function ConfirmationModal({ open, mode, onConfirm, onCancel }: Props) {
    if (!open) return null;
    const { icon, title, body, confirm } = COPY[mode];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-zinc-200 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                <div className="p-6">
                    <div className="flex flex-col items-start text-left space-y-3">
                        <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand mb-2">
                            {icon}
                        </div>
                        <h3 id="confirm-title" className="font-serif text-[28px] leading-tight tracking-[-0.02em] text-zinc-950">
                            {title}
                        </h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            {body}
                        </p>
                        <div className="flex w-full gap-3 pt-4">
                            <button onClick={onCancel} className="ui-btn-ghost flex-1">
                                Cancel
                            </button>
                            <button onClick={onConfirm} className="ui-btn flex-1">
                                {confirm}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
