import { useState } from 'react';
import InteractiveBackground from './components/InteractiveBackground';
import type { Phase } from './components/figures/bench/Bench';
import { Hero } from './components/home/Hero';
import { FigureOne, Method } from './components/home/Research';
import { Citation, Console, ModelCard, Privacy } from './components/home/Sections';
import { SiteFooter } from './components/home/SiteFooter';
import { SiteHeader } from './components/home/SiteHeader';
import { useMagnetic, useReveal } from './components/ui/micro';

export default function App() {
    // Figure 1 reports its phase so the Method section can highlight the running station
    const [phase, setPhase] = useState<Phase>('ready');
    useReveal();
    useMagnetic();

    return (
        <div data-theme="light" className="iso min-h-screen relative font-sans antialiased text-zinc-950">
            <InteractiveBackground />
            <SiteHeader />
            <main id="top" className="relative z-10">
                <Hero />
                <FigureOne onPhase={setPhase} />
                <Method phase={phase} />
                <Console />
                <ModelCard />
                <Privacy />
                <Citation />
            </main>
            <SiteFooter />
        </div>
    );
}
