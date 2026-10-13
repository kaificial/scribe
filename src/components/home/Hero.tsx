import { FACTS, REPO_URL, cssVar } from './content';
import { ExternalLink, Scrawl } from './icons';

/** The LaTeX logo set in the headline serif: a small raised A and a dropped E. */
const LatexLogo = () => (
    <span className="tex-logo" aria-label="LaTeX">L<span className="tex-a" aria-hidden="true">a</span>T<span className="tex-e" aria-hidden="true">e</span>X</span>
);

export function Hero() {
    return (
        <section className="max-w-6xl mx-auto px-6 pt-14 md:pt-20">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-zinc-500 mb-10">
                <span className="inline-flex items-center gap-2 text-zinc-950"><span className="ui-dot" aria-hidden="true" /> Research preview</span>
                <span className="text-zinc-300">/</span>
                <span>Handwriting → LaTeX</span>
                <span className="text-zinc-300">/</span>
                <span>Open source</span>
            </p>

            <div className="relative">
                <h1 className="serif-classic font-light tracking-[-0.035em] leading-[0.95] text-[clamp(3.1rem,8vw,7rem)] text-zinc-950 max-w-5xl">
                    Hand-drawn math,
                    <br />
                    <em className="italic font-light">instantly</em> to{' '}
                    <span className="hl" style={cssVar('--hl-delay', '450ms')}><LatexLogo /></span>.
                </h1>
                <ExternalLink href={REPO_URL} className="note-wrap hidden lg:flex absolute right-0 bottom-3 items-end gap-1 text-zinc-500 hover:text-zinc-950 transition-colors -rotate-3">
                    <Scrawl className="w-10 h-9 -scale-x-100 translate-y-1" />
                    <span className="note !text-inherit">star the repo<br />if you {'<3'} LaTeX</span>
                </ExternalLink>
            </div>

            <div data-reveal style={cssVar('--d', '150ms')} className="mt-14 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                <div className="lg:col-span-6">
                    <p className="ui-label mb-4">Abstract</p>
                    <p className="font-serif text-[21px] leading-[1.5] text-zinc-800">
                        Scribe reads handwritten and photographed equations and returns clean, copy-ready LaTeX. Every input is cropped to its ink,
                        thresholded to black and white, and resized before a model reads it. That model is either <span className="italic">Texify</span>, running in your browser
                        on WebGPU, or <span className="italic">Claude</span> in the cloud.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <a href="#console" data-magnetic className="ui-btn">Try the research preview <span className="ui-arrow">→</span></a>
                        <a href="#research" className="ui-btn-ghost">Read the method</a>
                    </div>
                </div>
                <dl className="lg:col-span-6 self-end border-t border-zinc-200">
                    {FACTS.map(([key, value]) => (
                        <div key={key} className="row-sweep grid grid-cols-[9rem_1fr] gap-4 py-3 px-2 -mx-2 border-b border-zinc-200">
                            <dt className="ui-label pt-0.5">{key}</dt>
                            <dd className="font-mono text-[13px] text-zinc-900">{value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
