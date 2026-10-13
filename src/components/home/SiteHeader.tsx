import { Logo } from '../ui/Logo';
import { SlidingPill, useScrollProgress, useScrollSpy } from '../ui/micro';
import { NAV, PORTFOLIO_URL, REPO_URL, SECTION_IDS } from './content';
import { ExternalLink, GitHubIcon } from './icons';

/** The floating nav bar: logo, centred section links that track the scroll, and the main actions. */
export function SiteHeader() {
    const current = useScrollSpy(SECTION_IDS);
    const progress = useScrollProgress<HTMLElement>();

    return (
        <header className="sticky top-3 md:top-4 z-40 px-3 md:px-6">
            <nav ref={progress} className="relative max-w-6xl mx-auto h-14 px-3 flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-white/75 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(15,23,42,0.22)]">
                <a href="#top" aria-label="Scribe home" className="flex items-center"><Logo wordmark className="w-7 h-7" /></a>

                {/* centred in the bar regardless of what sits on either side */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2 nav-link nav-links">
                    <SlidingPill className="nav-pill" selector="[aria-current]" />
                    {NAV.map(({ id, label }) => (
                        <a key={id} href={`#${id}`} aria-current={current === id ? 'location' : undefined}>{label}</a>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <ExternalLink href={PORTFOLIO_URL} className="hidden lg:inline nav-link mr-3">More work ↗</ExternalLink>
                    <ExternalLink href={REPO_URL} className="p-2 rounded-full text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors" title="View source on GitHub">
                        <GitHubIcon />
                    </ExternalLink>
                    <a href="#console" data-magnetic className="ui-btn ui-btn-sm">Try Scribe</a>
                </div>
                <span className="nav-progress" aria-hidden="true" />
            </nav>
        </header>
    );
}
