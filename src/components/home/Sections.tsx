import FormulaTool from '../FormulaTool';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useCopied } from '../ui/micro';
import { CITATION, MODEL_CARD, PRIVACY_POINTS, REPO_URL, cssVar } from './content';
import { ExternalLink, GitHubIcon, Scrawl } from './icons';
import { SectionHead } from './SectionHead';

/** §2: the live converter. */
export function Console() {
    return (
        <section id="console" className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 scroll-mt-20" aria-labelledby="console-title">
            <SectionHead n="2" kicker="Console" id="console-title" title={<>Try the <span className="hl" style={cssVar('--hl-delay', '200ms')}>research preview</span>.</>} />
            <div className="relative">
                <div className="note-wrap hidden md:flex absolute -top-12 right-6 items-end gap-1 text-zinc-500 rotate-2">
                    <span className="note">try an integral</span>
                    <Scrawl className="w-9 h-8 rotate-[100deg] translate-y-3" />
                </div>
                <ErrorBoundary>
                    <div data-reveal><FormulaTool /></div>
                </ErrorBoundary>
            </div>
        </section>
    );
}

/** §3: Local and Cloud side by side. */
export function ModelCard() {
    return (
        <section id="model-card" className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 scroll-mt-20" aria-labelledby="card-title">
            <SectionHead n="3" kicker="Model card" id="card-title" title={<>Two models. <em className="italic">You pick where it runs.</em></>} />
            <div data-reveal className="ui-panel overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                    <thead>
                        <tr className="border-b border-zinc-200">
                            <th scope="col" className="ui-label font-normal px-6 py-4 w-[30%]">&nbsp;</th>
                            <th scope="col" className="px-6 py-4 font-serif text-2xl font-normal tracking-[-0.02em]">Local <span className="ml-2 align-middle rounded-full bg-highlight px-2 py-0.5 font-sans text-[11px] font-medium tracking-normal">default</span></th>
                            <th scope="col" className="px-6 py-4 font-serif text-2xl font-normal tracking-[-0.02em]">Cloud</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {MODEL_CARD.map(([row, local, cloud]) => (
                            <tr key={row} className="row-sweep">
                                <th scope="row" className="ui-label font-normal px-6 py-4 align-top">{row}</th>
                                <td className="px-6 py-4 text-[15px] text-zinc-800 align-top">{local}</td>
                                <td className="px-6 py-4 text-[15px] text-zinc-800 align-top">{cloud}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

/** §4: how images and history are handled. */
export function Privacy() {
    return (
        <section id="privacy" className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 scroll-mt-20" aria-labelledby="privacy-title">
            <SectionHead n="4" kicker="Privacy" id="privacy-title" title={<>Your notes are <em className="italic">your notes.</em></>} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {PRIVACY_POINTS.map(([title, body], i) => (
                    <div key={title} data-reveal style={cssVar('--d', `${i * 90}ms`)}>
                        <h3 className="font-serif text-2xl tracking-[-0.02em] text-zinc-950 mb-3">{title}</h3>
                        <p className="text-[15px] leading-relaxed text-zinc-600">{body}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function CiteBox() {
    const [copied, flashCopied] = useCopied();
    const copy = () => {
        navigator.clipboard.writeText(CITATION);
        flashCopied();
    };
    return (
        <div className="ui-panel overflow-hidden">
            <div className="flex items-center justify-between px-5 h-11 border-b border-zinc-200">
                <span className="ui-label">BibTeX</span>
                <button onClick={copy} className="font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500 hover:text-zinc-950 transition-colors">
                    {copied ? <span key="done" className="check-pop">Copied ✓</span> : 'Copy'}
                </button>
            </div>
            <pre data-flash={copied ? '' : undefined} className="copy-flash px-5 py-5 font-mono text-[13px] leading-relaxed text-zinc-700 overflow-x-auto">{CITATION}</pre>
        </div>
    );
}

/** How to cite the project, with a copyable BibTeX entry. */
export function Citation() {
    return (
        <section className="max-w-6xl mx-auto px-6 pt-24 md:pt-32" aria-labelledby="cite-title">
            <div data-reveal className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start border-t border-zinc-200 pt-6">
                <div className="lg:col-span-5">
                    <p className="section-index mb-6">Citation</p>
                    <h2 id="cite-title" className="font-serif text-4xl tracking-[-0.025em] leading-[1.05] mb-5">Using Scribe in your notes or thesis?</h2>
                    <p className="text-[15px] leading-relaxed text-zinc-600 mb-8">It’s open source. Cite it, fork it, or open an issue with an equation it got wrong.</p>
                    <ExternalLink href={REPO_URL} data-magnetic className="ui-btn-ghost"><GitHubIcon className="w-4 h-4" /> View on GitHub</ExternalLink>
                </div>
                <div className="lg:col-span-7">
                    <CiteBox />
                </div>
            </div>
        </section>
    );
}
