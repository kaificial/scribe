import { TranscriptionBench, type Phase } from '../figures/bench/Bench';
import { STATIONS, cssVar, stationStates } from './content';
import { Scrawl } from './icons';
import { SectionHead } from './SectionHead';

/** Figure 1: the bench, which reports its current phase so the method section can follow it. */
export function FigureOne({ onPhase }: { onPhase: (phase: Phase) => void }) {
    return (
        <section id="research" className="max-w-6xl mx-auto px-6 pt-20 md:pt-28 scroll-mt-20" aria-label="Figure 1">
            <div className="relative">
                <div className="note-wrap hidden md:flex absolute -top-11 right-4 items-end gap-1 text-zinc-500 rotate-2">
                    <span className="note">hover to scrub, or use ← →</span>
                    <Scrawl className="w-9 h-8 rotate-[100deg] translate-y-3" />
                </div>
                <div data-reveal className="figure-1">
                    <TranscriptionBench title="Ink to LaTeX" fig="Fig. 1" onPhase={onPhase} />
                </div>
            </div>
        </section>
    );
}

const STATE_COLOR = { active: 'text-zinc-950', done: 'text-zinc-500', queued: 'text-zinc-300' } as const;

/** §1: the four stations, with the one the bench is running highlighted. */
export function Method({ phase }: { phase: Phase }) {
    const states = stationStates(phase);
    return (
        <section className="max-w-6xl mx-auto px-6 pt-24 md:pt-32" aria-labelledby="method-title">
            <SectionHead n="1" kicker="Method" id="method-title" title={<>Four stations, <em className="italic">one pass.</em></>} />
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                {STATIONS.map((station, i) => (
                    <li key={station.title} className="station" data-state={states[i]} data-reveal style={cssVar('--d', `${i * 90}ms`)}>
                        <div className="flex items-center justify-between font-mono text-[12px] mb-4">
                            <span className="text-zinc-400">1.{i + 1}</span>
                            <span className={`station-state uppercase tracking-[0.08em] ${STATE_COLOR[states[i]]}`}>
                                {states[i] === 'active' ? '● running' : states[i]}
                            </span>
                        </div>
                        <h3 className="font-serif text-[28px] leading-none tracking-[-0.02em] text-zinc-950 mb-3"><span className="hl-live">{station.title}</span></h3>
                        <p className="text-[15px] leading-relaxed text-zinc-600">{station.body}</p>
                    </li>
                ))}
            </ol>
        </section>
    );
}
