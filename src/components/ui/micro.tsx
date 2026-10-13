// Site-wide micro interactions. None of them re-render React per frame,
// and all of them stay still when the reader prefers reduced motion.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const still = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Adds `data-inview` to `[data-reveal]` and `.hl` elements the first time they
 * scroll into view. CSS uses it to fade sections in and draw highlights.
 */
export function useReveal() {
    useEffect(() => {
        const nodes = () => document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-inview]), .hl:not([data-inview])');
        if (still() || !('IntersectionObserver' in window)) {
            nodes().forEach((n) => n.setAttribute('data-inview', ''));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.isIntersecting) {
                    e.target.setAttribute('data-inview', '');
                    io.unobserve(e.target);
                }
            }
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
        const watch = () => nodes().forEach((n) => io.observe(n));
        watch();
        // also watch content that mounts later, like history items
        const mo = new MutationObserver(watch);
        mo.observe(document.body, { childList: true, subtree: true });
        return () => { io.disconnect(); mo.disconnect(); };
    }, []);
}

/** Elements with `[data-magnetic]` lean a few pixels toward the pointer, then spring back. */
export function useMagnetic(strength = 0.22, reach = 5) {
    useEffect(() => {
        if (still() || window.matchMedia('(pointer: coarse)').matches) return;
        let frame = 0;
        let target: HTMLElement | null = null;
        let x = 0, y = 0;
        const apply = () => {
            frame = 0;
            if (!target) return;
            target.style.transform = `translate(${x}px, ${y}px)`;
        };
        const onMove = (e: PointerEvent) => {
            const el = (e.target as Element | null)?.closest<HTMLElement>('[data-magnetic]') ?? null;
            if (target && target !== el) target.style.transform = '';
            target = el;
            if (!el) return;
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            x = Math.max(-reach, Math.min(reach, dx * strength));
            y = Math.max(-reach, Math.min(reach, dy * strength));
            if (!frame) frame = requestAnimationFrame(apply);
        };
        const onLeave = () => { if (target) target.style.transform = ''; target = null; };
        document.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('pointerleave', onLeave);
        return () => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerleave', onLeave);
            cancelAnimationFrame(frame);
        };
    }, [strength, reach]);
}

/** The id of the section the reader is in. `ids` must be in page order and stable across renders. */
export function useScrollSpy(ids: readonly string[]) {
    const [active, setActive] = useState<string | null>(null);
    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            const line = window.innerHeight * 0.35;
            let current: string | null = null;
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= line) current = id;
            }
            setActive(current);
        };
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            cancelAnimationFrame(frame);
        };
    }, [ids]);
    return active;
}

/** Writes the page's scroll progress (0 to 1) to `--progress` on the returned ref's element. */
export function useScrollProgress<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            ref.current?.style.setProperty('--progress', String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
        };
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            cancelAnimationFrame(frame);
        };
    }, []);
    return ref;
}

/** A pill that slides under the sibling matching `selector`. Place it first inside a positioned row. */
export function SlidingPill({ className = 'seg-pill', selector = '[data-on]' }: { className?: string; selector?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    useLayoutEffect(() => {
        const pill = ref.current;
        const row = pill?.parentElement;
        if (!pill || !row) return;
        let first = true;
        const place = () => {
            const on = row.querySelector<HTMLElement>(selector);
            if (!on) { pill.style.opacity = '0'; return; }
            const r = row.getBoundingClientRect();
            const b = on.getBoundingClientRect();
            if (first) pill.style.transition = 'none';
            pill.style.opacity = '1';
            pill.style.width = `${b.width}px`;
            pill.style.height = `${b.height}px`;
            pill.style.transform = `translate(${b.left - r.left - row.clientLeft}px, ${b.top - r.top - row.clientTop}px)`;
            if (first) { void pill.offsetWidth; pill.style.transition = ''; first = false; }
        };
        place();
        const mo = new MutationObserver(place);
        mo.observe(row, { attributes: true, subtree: true, attributeFilter: ['data-on', 'aria-current', 'class'] });
        const ro = new ResizeObserver(place);
        ro.observe(row);
        document.fonts?.ready.then(place);
        return () => { mo.disconnect(); ro.disconnect(); };
    }, [selector]);
    return <span ref={ref} className={className} aria-hidden="true" />;
}

/** Outlined text that fills with ink around the pointer. The ink is a second copy of the text, masked by a soft circle. */
export function InkWordmark({ text, className = '' }: { text: string; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || still()) return;
        let frame = 0, mx = 0, my = 0;
        const apply = () => {
            frame = 0;
            el.style.setProperty('--mx', `${mx}px`);
            el.style.setProperty('--my', `${my}px`);
        };
        const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            mx = e.clientX - r.left;
            my = e.clientY - r.top;
            el.dataset.inking = '';
            if (!frame) frame = requestAnimationFrame(apply);
        };
        const onLeave = () => { delete el.dataset.inking; };
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);
        return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerleave', onLeave);
            cancelAnimationFrame(frame);
        };
    }, []);
    return (
        <div ref={ref} className={`ink-wordmark ${className}`} aria-hidden="true">
            <span className="ink-wordmark-outline">{text}</span>
            <span className="ink-wordmark-ink">{text}</span>
        </div>
    );
}

/**
 * A "copied" flag that clears itself after `ms`. Pass a value to `flash` to
 * remember which item was copied (for example a list item id).
 */
export function useCopied<T = true>(ms = 1600) {
    const [copied, setCopied] = useState<T | null>(null);
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);
    const flash = (value: T = true as T) => {
        setCopied(value);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(null), ms);
    };
    return [copied, flash] as const;
}
