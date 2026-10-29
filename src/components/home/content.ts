// Copy and data for the homepage sections.

import type { CSSProperties } from 'react';
import type { Phase } from '../figures/bench/Bench';

export const REPO_URL = 'https://github.com/kaificial/Scribe';
export const PORTFOLIO_URL = 'https://kaificial.vercel.app';

/** Sections the nav links to and tracks, in page order. */
export const NAV: Array<{ id: string; label: string }> = [
    { id: 'research', label: 'How it works' },
    { id: 'console', label: 'Try it' },
    { id: 'model-card', label: 'Models' },
    { id: 'privacy', label: 'Privacy' },
];
export const SECTION_IDS = NAV.map((item) => item.id);

/** The example in the hero: what you write and what Scribe gives back. */
export const SPECIMEN = {
    handwritten: 'x = −b ± √(b²−4ac) / 2a',
    latex: String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`,
};

/** The bench's four stations, in the order it runs them. */
export const STATIONS: Array<{ title: string; body: string; phases: Phase[] }> = [
    { title: 'Write', body: 'You draw on the canvas, upload a photo, or paste a screenshot.', phases: ['reach', 'write', 'park'] },
    { title: 'Crop', body: 'Scribe trims the image to the ink and leaves a 40 px border, so the model sees the equation and nothing else.', phases: ['crop'] },
    { title: 'Clean', body: 'Pixels darker than 180 turn solid black and the rest turn white. The image is then scaled to 512 px at most.', phases: ['scan'] },
    { title: 'Transcribe', body: 'Texify reads it in your browser, or Claude reads it in the cloud, and the LaTeX comes back.', phases: ['print', 'done'] },
];

export type StationState = 'queued' | 'active' | 'done';

/** Each station's state while the bench is in `phase`. */
export function stationStates(phase: Phase): StationState[] {
    if (phase === 'ready') return STATIONS.map(() => 'queued');
    if (phase === 'clear') return STATIONS.map(() => 'done');
    const active = STATIONS.findIndex((s) => s.phases.includes(phase));
    return STATIONS.map((_, i) => (i < active ? 'done' : i === active ? 'active' : 'queued'));
}

export const FACTS: Array<[string, string]> = [
    ['Reads', 'Drawings, photos, screenshots'],
    ['Returns', 'LaTeX, with a live preview'],
    ['Runs', 'In your browser, or in the cloud'],
    ['Costs', 'Nothing. It’s open source'],
];

export const MODEL_CARD: Array<[string, string, string]> = [
    ['Model', 'Xenova/texify', 'Claude (Anthropic)'],
    ['Runs on', 'Your browser, via Transformers.js + WebGPU', 'A Vercel serverless function'],
    ['Image leaves your device', 'No', 'Yes, over HTTPS'],
    ['Image stored', 'Never', 'Never'],
    ['First run', 'One-time model download (a few hundred MB)', 'Instant'],
    ['Chosen by default when', 'WebGPU is available', 'WebGPU is unavailable'],
];

export const PRIVACY_POINTS: Array<[string, string]> = [
    ['Local comes first', 'If your browser supports WebGPU, the model runs on your machine and the image never leaves it.'],
    ['Cloud keeps nothing', 'In Cloud mode the cropped image goes to the server over HTTPS, gets transcribed, and is thrown away.'],
    ['History lives here', 'Past conversions are saved in this browser’s IndexedDB. Clear them whenever you like.'],
];

export const CITATION = `@software{scribe,
  title  = {Scribe: hand-drawn math to LaTeX},
  author = {kaificial},
  url    = {${REPO_URL}},
  year   = {${new Date().getFullYear()}}
}`;

/** Sets a CSS custom property inline, for stagger delays and highlight timing. */
export const cssVar = (name: string, value: string) => ({ [name]: value }) as CSSProperties;
