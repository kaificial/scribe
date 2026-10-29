import katex from 'katex';
import { CopyButton, useCopied } from '../ui/micro';
import { FACTS, REPO_URL, SPECIMEN, cssVar } from './content';
import { ExternalLink, Scrawl } from './icons';

/** The LaTeX logo set in the headline serif: a small raised A and a dropped E. */
const LatexLogo = () => (
    <span className="tex-logo" aria-label="LaTeX">L<span className="tex-a" aria-hidden="true">a</span>T<span className="tex-e" aria-hidden="true">e</span>X</span>
);

// the example never changes, so render it once
const SPECIMEN_HTML = katex.renderToString(SPECIMEN.latex, { displayMode: true, throwOnError: false });

/** A worked example: what you write, the LaTeX you get, and how it renders. */
function Specimen() {
    const [copied, flashCopied] = useCopied();
    const copy = () => {
        navigator.clipboard.writeText(SPECIMEN.latex);
        flashCopied();
    };
    return (
        <figure className="ui-panel overflow-hidden">
            <div className="grid grid-cols-[7.5rem_1fr] items-center border-b border-zinc-200">
                <span className="ui-label px-5 whitespace-nowrap">You write</span>
                <span className="note !text-zinc-900 !text-[30px] py-4 pr-5">{SPECIMEN.handwritten}</span>
            </div>
            <div className="grid grid-cols-[7.5rem_1fr_auto] items-center border-b border-zinc-200">
                <span className="ui-label px-5 whitespace-nowrap">You get</span>
                <code data-flash={copied ? '' : undefined} className="copy-flash block py-4 font-mono text-[13px] text-zinc-900 overflow-x-auto whitespace-nowrap">{SPECIMEN.latex}</code>
                <CopyButton copied={!!copied} onClick={copy} className="px-5" />
            </div>
            <div className="grid grid-cols-[7.5rem_1fr] items-center bg-zinc-50/60">
                <span className="ui-label px-5 whitespace-nowrap">It renders</span>
                <div className="latex-preview py-5 pr-5 text-[19px] text-zinc-950 overflow-x-auto" dangerouslySetInnerHTML={{ __html: SPECIMEN_HTML }} />
            </div>
        </figure>
    );
}

export function Hero() {
    return (
        <section className="max-w-6xl mx-auto px-6 pt-24 md:pt-36">
            <div className="relative">
                <h1 className="serif-classic tracking-[-0.03em] leading-[0.98] text-[clamp(2.9rem,7.2vw,6.25rem)] text-zinc-950 max-w-5xl">
                    Write the math by hand.
                    <br />
                    Paste it as <span className="hl" style={cssVar('--hl-delay', '450ms')}><LatexLogo /></span>.
                </h1>
                <ExternalLink href={REPO_URL} className="note-wrap hidden lg:flex absolute right-0 bottom-1 items-end gap-1 text-zinc-500 hover:text-zinc-950 transition-colors -rotate-3">
                    <Scrawl className="w-10 h-9 -scale-x-100 translate-y-1" />
                    <span className="note !text-inherit">star the repo<br />if it saves you time</span>
                </ExternalLink>
            </div>

            <div className="mt-12 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                <div data-reveal style={cssVar('--d', '120ms')} className="lg:col-span-5">
                    <p className="text-[18px] leading-[1.6] text-zinc-700">
                        Retyping an equation from your notes takes minutes and a dozen backslashes. Draw it, snap it, or paste a screenshot,
                        and Scribe gives you LaTeX you can drop straight into Overleaf, Notion, or your thesis.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <a href="#console" data-magnetic className="ui-btn">Convert an equation <span className="ui-arrow">→</span></a>
                        <a href="#research" className="ui-btn-ghost">See how it works</a>
                    </div>
                </div>
                <div data-reveal style={cssVar('--d', '240ms')} className="lg:col-span-7">
                    <Specimen />
                </div>
            </div>

            <dl data-reveal style={cssVar('--d', '320ms')} className="mt-14 grid grid-cols-2 lg:grid-cols-4 border-y border-zinc-200 divide-x divide-zinc-200">
                {FACTS.map(([key, value]) => (
                    <div key={key} className="row-sweep px-4 py-4 [&:nth-child(3)]:border-l-0 lg:[&:nth-child(3)]:border-l">
                        <dt className="ui-label mb-1.5">{key}</dt>
                        <dd className="text-[15px] text-zinc-900">{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
