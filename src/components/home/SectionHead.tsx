import type { ReactNode } from 'react';

interface Props {
    n: string;
    title: ReactNode;
    kicker?: string;
    id?: string;
    /** a short intro shown next to the title on wide screens */
    lede?: ReactNode;
}

/** The small "§n KICKER" label above a section title. */
export function SectionIndex({ n, kicker, className = '' }: { n: string; kicker?: string; className?: string }) {
    return <p className={`section-index ${className}`}>§{n}{kicker ? <span className="ml-3 uppercase tracking-[0.08em] text-zinc-400">{kicker}</span> : null}</p>;
}

/** A numbered section heading: the §n label, the title, and an optional lede beside it. */
export function SectionHead({ n, title, kicker, id, lede }: Props) {
    return (
        <div data-reveal className="section-head border-t border-zinc-200 pt-5 mb-12">
            <SectionIndex n={n} kicker={kicker} className="mb-5" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4 items-end">
                <h2 id={id} className="md:col-span-7 font-serif text-[2.4rem] md:text-[3.25rem] font-normal tracking-[-0.025em] leading-[1.04] text-zinc-950">{title}</h2>
                {lede ? <p className="md:col-span-5 text-[16px] leading-relaxed text-zinc-600 md:pb-1.5">{lede}</p> : null}
            </div>
        </div>
    );
}
