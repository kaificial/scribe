import type { ProcessingMode } from '../../types';
import { SlidingPill } from '../ui/micro';

interface Props {
    mode: ProcessingMode;
    /** null while WebGPU support is still being checked */
    webgpuSupported: boolean | null;
    onChange: (mode: ProcessingMode) => void;
}

/** The Local / Cloud switch at the top of the console, with a one-line note about the current mode. */
export function ModeSwitch({ mode, webgpuSupported, onChange }: Props) {
    const localUnavailable = webgpuSupported === false;
    return (
        <div className="px-4 md:px-6 h-16 flex items-center justify-between gap-4 border-b border-zinc-100">
            <div className="ui-seg" role="group" aria-label="Processing mode">
                <SlidingPill />
                <button
                    onClick={() => !localUnavailable && onChange('local')}
                    disabled={localUnavailable}
                    data-on={mode === 'local' ? '' : undefined}
                    aria-pressed={mode === 'local'}
                    title={localUnavailable ? 'WebGPU not supported in this browser' : 'Process locally using WebGPU'}
                >
                    Local AI
                </button>
                <button
                    onClick={() => onChange('cloud')}
                    data-on={mode === 'cloud' ? '' : undefined}
                    aria-pressed={mode === 'cloud'}
                    title="Process using Claude AI (cloud)"
                >
                    Cloud AI
                </button>
            </div>
            <span className="hidden sm:inline-flex items-center gap-2 text-[13px] text-zinc-500 truncate">
                <span className="ui-dot" aria-hidden="true" />
                {mode === 'local' ? 'Runs on your device with WebGPU' : 'Powered by Claude, nothing stored'}
            </span>
        </div>
    );
}
