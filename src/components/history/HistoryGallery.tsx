import type { HistoryItem } from '../../types';
import { useCopied } from '../ui/micro';

interface Props {
    items: HistoryItem[];
    onCopy: (latex: string) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
}

const CheckIcon = () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-zinc-950 check-pop" aria-hidden="true">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);

export function HistoryGallery({ items, onCopy, onDelete, onClearAll }: Props) {
    const [copiedId, flashCopied] = useCopied<string>(1400);
    const copy = (item: HistoryItem) => {
        onCopy(item.latex);
        flashCopied(item.id);
    };

    if (items.length === 0) return null;

    return (
        <div className="mt-10 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl tracking-[-0.02em] text-zinc-950">Recent <span className="text-zinc-400 font-normal">{items.length}</span></h3>
                <button
                    onClick={onClearAll}
                    className="text-[13px] font-medium text-zinc-400 hover:text-brand transition-colors"
                >
                    Clear All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item) => (
                    <div key={item.id} data-reveal className="group relative bg-white/90 border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 hover:shadow-[0_12px_32px_-16px_rgba(15,23,42,0.25)] transition-all duration-200">
                        <div className="flex justify-between items-center mb-3">
                            <div className="font-mono text-[11px] text-zinc-400 tabular-nums">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copy(item)}
                                    className="p-1.5 text-zinc-400 hover:text-zinc-950 transition-colors"
                                    title={copiedId === item.id ? 'Copied' : 'Copy LaTeX'}
                                >
                                    {copiedId === item.id ? <CheckIcon key="done" /> : <CopyIcon />}
                                </button>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="p-1.5 text-zinc-400 hover:text-brand transition-colors"
                                    title="Remove"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="bg-zinc-950 rounded-lg p-3 flex items-center min-h-[72px]">
                            <div className="text-zinc-200 font-mono text-[11px] truncate max-w-full leading-relaxed">
                                {item.latex}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
