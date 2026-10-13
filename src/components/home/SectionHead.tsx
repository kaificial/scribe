import type { ReactNode } from 'react';

interface Props {
    n: string;
    title: ReactNode;
    kicker?: string;
    id?: string;
}

/** A numbered section heading: "§n KICKER" on the left, the serif title on the right. */
export function SectionHead({ n, title, kicker, id }: Props) {
    return (
        <div data-reveal className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-zinc-200 pt-6 mb-12">
            <p className="md:col-span-3 section-index">§{n}{kicker ? <span className="ml-3 uppercase tracking-[0.08em] text-zinc-400">{kicker}</span> : null}</p>
            <h2 id={id} className="md:col-span-9 font-serif text-4xl md:text-5xl font-normal tracking-[-0.025em] leading-[1.05] text-zinc-950">{title}</h2>
        </div>
    );
}
