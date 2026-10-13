import { useRef, useEffect } from 'react';
import katex from 'katex';
import { useCopied } from '../ui/micro';

interface Props {
    latex: string;
    processedImage: string | null;
    onLatexChange: (value: string) => void;
    onBack: () => void;
}

// strips $...$, $$...$$, \(...\) and \[...\] wrappers so KaTeX gets the bare expression
function stripMathDelimiters(latex: string) {
    return latex
        .replace(/^(\$|\\\[|\\\(|\$\$)/g, '')
        .replace(/(\$|\\\]|\\\)| \$\$)$/g, '')
        .trim();
}

export function ResultView({ latex, processedImage, onLatexChange, onBack }: Props) {
    const previewRef = useRef<HTMLDivElement>(null);
    const [copied, flashCopied] = useCopied();

    useEffect(() => {
        if (!previewRef.current) return;
        const sanitized = stripMathDelimiters(latex);
        try {
            if (sanitized) {
                katex.render(sanitized, previewRef.current, { throwOnError: false, displayMode: true });
            } else {
                previewRef.current.innerHTML = '<span class="text-sm text-zinc-300">Preview appears here</span>';
            }
        } catch (e) {
            console.error('KaTeX error', e);
        }
    }, [latex]);

    return (
        <>
            <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="ui-label">LaTeX</h3>
                        <button
                            onClick={() => { navigator.clipboard.writeText(latex); flashCopied(); }}
                            className="ui-btn ui-btn-sm min-w-[7.5rem]"
                            aria-live="polite"
                        >
                            {copied ? <span key="done" className="check-pop">Copied ✓</span> : 'Copy LaTeX'}
                        </button>
                    </div>
                    <div className="copy-flash rounded-xl" data-flash={copied ? '' : undefined}>
                        <textarea
                            value={latex}
                            onChange={(e) => onLatexChange(e.target.value)}
                            className="w-full h-32 p-4 bg-zinc-950 border border-zinc-950 rounded-xl font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all text-zinc-100 caret-brand"
                            placeholder="No data available..."
                        />
                    </div>
                    <button
                        onClick={onBack}
                        className="ui-btn-ghost w-full"
                    >
                        Convert another
                    </button>
                </div>

                <div className="flex-1 flex flex-col">
                    <h3 className="ui-label mb-4">Preview</h3>
                    <div className="flex-1 min-h-[220px] border border-zinc-200 rounded-xl bg-white flex items-center justify-center p-8 overflow-auto">
                        <div ref={previewRef} className="latex-preview text-2xl text-zinc-950" />
                    </div>
                </div>
            </div>

            {processedImage && (
                <div className="px-4 md:px-6 pb-6">
                    <h3 className="ui-label mb-4">Your input</h3>
                    <div className="border border-zinc-200 rounded-xl bg-zinc-50 p-4 flex items-center justify-center">
                        <img src={processedImage} alt="Original input" className="max-h-48 rounded object-contain" />
                    </div>
                </div>
            )}
        </>
    );
}
