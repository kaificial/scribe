import { SlidingPill } from '../ui/micro';

interface Props {
    isEraser: boolean;
    strokeSize: number;
    canUndo: boolean;
    canRedo: boolean;
    onSetEraser: (eraser: boolean) => void;
    onStrokeSizeChange: (size: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    onProcess: () => void;
    onBack: () => void;
}

const iconButton = 'p-2 rounded-full text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-950 transition-colors disabled:opacity-30 disabled:cursor-not-allowed';

export function DrawingToolbar({
    isEraser, strokeSize, canUndo, canRedo,
    onSetEraser, onStrokeSizeChange, onUndo, onRedo, onClear, onProcess, onBack,
}: Props) {
    return (
        <>
            <div className="flex justify-between items-center gap-4 mb-4">
                <button
                    onClick={onBack}
                    className="text-[13px] font-medium text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-2"
                >
                    <span aria-hidden="true">←</span>
                    Back
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={onClear} className="ui-btn-ghost ui-btn-sm hover:!text-rose-600">Reset</button>
                    <button onClick={onProcess} className="ui-btn ui-btn-sm">
                        Convert to LaTeX <span className="ui-arrow">→</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-4 px-2 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="flex gap-1">
                    <button onClick={onUndo} disabled={!canUndo} className={iconButton} title="Undo" aria-label="Undo">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                    </button>
                    <button onClick={onRedo} disabled={!canRedo} className={iconButton} title="Redo" aria-label="Redo">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                        </svg>
                    </button>
                </div>

                <div className="w-px h-6 bg-zinc-200" />

                <div className="ui-seg" role="group" aria-label="Tool">
                    <SlidingPill />
                    <button onClick={() => onSetEraser(false)} data-on={!isEraser ? '' : undefined} aria-pressed={!isEraser} title="Brush">Brush</button>
                    <button onClick={() => onSetEraser(true)} data-on={isEraser ? '' : undefined} aria-pressed={isEraser} title="Eraser">Eraser</button>
                </div>

                <div className="w-px h-6 bg-zinc-200" />

                <label className="flex items-center gap-3">
                    <span className="ui-label">Size</span>
                    <input
                        type="range" min="1" max="20" value={strokeSize}
                        onChange={(e) => onStrokeSizeChange(parseInt(e.target.value))}
                        className="w-24 h-1 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-brand"
                    />
                    <span className="font-mono text-xs text-zinc-950 w-6 tabular-nums">{strokeSize}</span>
                </label>
            </div>
        </>
    );
}
