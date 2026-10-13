import { Logo } from '../ui/Logo';
import { InkWordmark } from '../ui/micro';
import { NAV, PORTFOLIO_URL, REPO_URL } from './content';
import { ExternalLink, HeartIcon } from './icons';

export function SiteFooter() {
    return (
        <footer className="relative z-10 mt-28 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-zinc-200 pt-8 text-sm text-zinc-500">
                    <Logo wordmark className="w-6 h-6" />
                    <div className="flex flex-wrap gap-x-6 gap-y-2 nav-link">
                        {NAV.map(({ id, label }) => <a key={id} href={`#${id}`}>{label}</a>)}
                        <ExternalLink href={REPO_URL}>GitHub</ExternalLink>
                        <ExternalLink href={PORTFOLIO_URL}>More work</ExternalLink>
                    </div>
                    <span className="flex items-center gap-1.5">
                        Made w/
                        <HeartIcon />
                    </span>
                </div>
            </div>
            {/* oversized wordmark, cropped by the page edge */}
            <InkWordmark text="Scribe." className="justify-center text-center serif-classic italic font-light leading-[0.78] tracking-[-0.05em] text-[24vw] mt-10 -mb-[4vw]" />
        </footer>
    );
}
