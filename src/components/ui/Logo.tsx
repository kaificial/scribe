// The Scribe mark: an integral sign with a full stop, read as "math, done."
// The yellow dot is the identity's one accent color.
export function LogoMark({ className = 'w-8 h-8' }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
            <rect width="32" height="32" rx="9" fill="#0B0B0C" />
            <path className="logo-stroke" pathLength={1} d="M20.6 9.3C20.1 6.6 16 6.4 15.6 10.1L14.8 21.9C14.4 25.6 10.3 25.4 9.8 22.7" fill="none" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" />
            <circle className="logo-dot" cx="21.6" cy="22.4" r="2.3" fill="#FFF0A6" />
        </svg>
    );
}

interface LogoProps {
    className?: string;
    /** show the "Scribe" wordmark next to the mark */
    wordmark?: boolean;
}

export function Logo({ className = 'w-8 h-8', wordmark = false }: LogoProps) {
    if (!wordmark) return <LogoMark className={className} />;
    return (
        <span className="inline-flex items-center gap-2.5" aria-label="Scribe">
            <LogoMark className={className} />
            <span className="font-serif text-[22px] leading-none tracking-[-0.02em] text-zinc-950">Scribe</span>
        </span>
    );
}
