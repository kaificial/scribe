import { TranscriptionBench, type Phase } from '../figures/bench/Bench';
import { STATIONS, cssVar, stationStates } from './content';
import { Scrawl } from './icons';
import { SectionHead } from './SectionHead';

/** §1: the Figure 1 demo. It reports its phase so the steps below can follow along. */
export function FigureOne({ onPhase }: { onPhase: (phase: Phase) => void }) {
    return (
        <section id="research" className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 scroll-mt-20" aria-labelledby="method-title">
            <SectionHead
                n="1"
                kicker="How it works"
                id="method-title"
                title={<>From pen stroke to LaTeX, <em className="hand">in four steps.</em></>}
                lede="The bench below runs the same pipeline your input goes through. Let it play, or take the controls."
            />
            <div className="relative mt-16">
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

/** The four steps under Figure 1. Each one fills in as the demo reaches it. */
export function Method({ phase }: { phase: Phase }) {
    const states = stationStates(phase);
    return (
        <section className="max-w-6xl mx-auto px-6 pt-12" aria-label="The four steps">
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {STATIONS.map((station, i) => (
                    <li key={station.title} className="station" data-state={states[i]} data-reveal style={cssVar('--d', `${i * 90}ms`)}>
                        <span className="station-track" aria-hidden="true" />
                        <div className="flex items-center justify-between font-mono text-[12px] mt-4 mb-3">
                            <span className="text-zinc-400">Step {i + 1}</span>
                            <span className={`station-state uppercase tracking-[0.08em] ${STATE_COLOR[states[i]]}`}>
                                {states[i] === 'active' ? '● running' : states[i]}
                            </span>
                        </div>
                        <h3 className="font-serif text-[26px] leading-none tracking-[-0.02em] text-zinc-950 mb-3"><span className="hl-live">{station.title}</span></h3>
                        <p className="text-[15px] leading-relaxed text-zinc-600">{station.body}</p>
                    </li>
                ))}
            </ol>
        </section>
    );
}
