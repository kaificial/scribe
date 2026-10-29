import FormulaTool from '../FormulaTool';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { CopyButton, useCopied } from '../ui/micro';
import { CITATION, MODEL_CARD, PRIVACY_POINTS, REPO_URL, cssVar } from './content';
import { ExternalLink, GitHubIcon, Scrawl } from './icons';
import { SectionHead, SectionIndex } from './SectionHead';

/** §2: the live converter. */
export function Console() {
    return (
        <section id="console" className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 scroll-mt-20" aria-labelledby="console-title">
            <SectionHead
                n="2"
                kicker="Try it"
                id="console-title"
                title={<>Draw something. <span className="hl" style={cssVar('--hl-delay', '200ms')}>Get LaTeX back.</span></>}
                lede="Write on the canvas, drop in a photo, or press Ctrl+V with a screenshot on your clipboard. Each result is saved below so you can copy it again later."
            />
            <div className="relative">
                <div className="note-wrap hidden md:flex absolute -top-12 right-6 items-end gap-1 text-zinc-500 rotate-2">
                    <span className="note">try a messy integral</span>
                    <Scrawl className="w-9 h-8 rotate-[100deg] translate-y-3" />
                </div>
                <ErrorBoundary>
                    <div data-reveal><FormulaTool /></div>
                </ErrorBoundary>
            </div>
        </section>
    );
}

// same order as the value columns in MODEL_CARD
const MODELS = [
    { name: 'Local', tag: 'default', blurb: 'Private and offline once the model is cached.' },
    { name: 'Cloud', tag: null, blurb: 'Instant on any device, no download needed.' },
] as const;

/** §3: one card each for Local and Cloud. */
export function ModelCard() {
    return (
        <section id="model-card" className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 scroll-mt-20" aria-labelledby="card-title">
            <SectionHead
                n="3"
                kicker="Models"
                id="card-title"
                title={<>Two models. <em className="hand">You choose where it runs.</em></>}
                lede="Scribe picks Local when your browser supports WebGPU and falls back to Cloud when it doesn’t. You can switch at any time in the console."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {MODELS.map((model, i) => (
                    <div key={model.name} data-reveal style={cssVar('--d', `${i * 90}ms`)} className="ui-panel overflow-hidden">
                        <div className="px-6 pt-6 pb-5 border-b border-zinc-200">
                            <h3 className="font-serif text-[30px] leading-none tracking-[-0.02em] text-zinc-950">
                                {model.name}
                                {model.tag ? <span className="ml-3 align-middle rounded-full bg-highlight px-2 py-0.5 font-sans text-[11px] font-medium tracking-normal">{model.tag}</span> : null}
                            </h3>
                            <p className="mt-2 text-[14px] text-zinc-500">{model.blurb}</p>
                        </div>
                        <dl className="divide-y divide-zinc-100">
                            {MODEL_CARD.map(([label, ...values]) => (
                                <div key={label} className="row-sweep grid grid-cols-[11rem_1fr] gap-4 px-6 py-3.5">
                                    <dt className="ui-label pt-0.5">{label}</dt>
                                    <dd className="text-[15px] text-zinc-800">{values[i]}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ))}
            </div>
        </section>
    );
}

/** §4: how images and history are handled. */
export function Privacy() {
    return (
        <section id="privacy" className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 scroll-mt-20" aria-labelledby="privacy-title">
            <SectionHead n="4" kicker="Privacy" id="privacy-title" title={<>Your notes stay <em className="hand">your notes.</em></>} />
            <ol className="border-b border-zinc-200">
                {PRIVACY_POINTS.map(([title, body], i) => (
                    <li key={title} data-reveal style={cssVar('--d', `${i * 90}ms`)} className="row-sweep grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-2 border-t border-zinc-200 py-7">
                        <span className="md:col-span-1 font-mono text-[12px] text-zinc-400 pt-2">0{i + 1}</span>
                        <h3 className="md:col-span-5 font-serif text-[26px] leading-tight tracking-[-0.02em] text-zinc-950">{title}</h3>
                        <p className="md:col-span-6 text-[16px] leading-relaxed text-zinc-600 md:pt-1">{body}</p>
                    </li>
                ))}
            </ol>
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
                <CopyButton copied={!!copied} onClick={copy} />
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
                    <SectionIndex n="5" kicker="Cite" className="mb-6" />
                    <h2 id="cite-title" className="font-serif text-4xl tracking-[-0.025em] leading-[1.05] mb-5">Writing a paper or a thesis?</h2>
                    <p className="text-[15px] leading-relaxed text-zinc-600 mb-8">If Scribe saved you some typing, cite it. Found an equation it got wrong? Open an issue with the image and we’ll take a look.</p>
                    <ExternalLink href={REPO_URL} data-magnetic className="ui-btn-ghost"><GitHubIcon className="w-4 h-4" /> View on GitHub</ExternalLink>
                </div>
                <div className="lg:col-span-7">
                    <CiteBox />
                </div>
            </div>
        </section>
    );
}
