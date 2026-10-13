// Copy and data for the homepage sections.

import type { CSSProperties } from 'react';
import type { Phase } from '../figures/bench/Bench';

export const REPO_URL = 'https://github.com/kaificial/Scribe';
export const PORTFOLIO_URL = 'https://kaificial.vercel.app';

/** Sections the nav links to and tracks, in page order. */
export const NAV: Array<{ id: string; label: string }> = [
    { id: 'research', label: 'Research' },
    { id: 'console', label: 'Console' },
    { id: 'model-card', label: 'Model card' },
    { id: 'privacy', label: 'Privacy' },
];
export const SECTION_IDS = NAV.map((item) => item.id);

/** The bench's four stations, in the order it runs them. */
export const STATIONS: Array<{ title: string; body: string; phases: Phase[] }> = [
    { title: 'Write', body: 'Ink arrives from the canvas, a photo, or the clipboard.', phases: ['reach', 'write', 'park'] },
    { title: 'Crop', body: 'The frame is cut to the ink’s bounding box, plus a 40 px margin.', phases: ['crop'] },
    { title: 'Threshold', body: 'Anything darker than 180 becomes solid black; the crop is scaled to at most 512 px.', phases: ['scan'] },
    { title: 'Transcribe', body: 'Texify on your device, or Claude in the cloud, writes the LaTeX.', phases: ['print', 'done'] },
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
    ['Input', 'Canvas · photo · clipboard'],
    ['Output', 'LaTeX + live KaTeX preview'],
    ['Models', 'Xenova/texify · Claude'],
    ['Pre-processing', 'crop +40 px → threshold 180 → ≤ 512 px'],
    ['Data', 'On-device by default'],
];

export const MODEL_CARD: Array<[string, string, string]> = [
    ['Model', 'Xenova/texify', 'Claude (Anthropic)'],
    ['Runs on', 'Your browser, via Transformers.js + WebGPU', 'A Vercel serverless function'],
    ['Image leaves your device', 'No', 'Yes — over HTTPS'],
    ['Image stored', 'Never', 'Never'],
    ['First run', 'One-time model download (a few hundred MB)', 'Instant'],
    ['Chosen by default when', 'WebGPU is available', 'WebGPU is unavailable'],
];

export const PRIVACY_POINTS: Array<[string, string]> = [
    ['On-device first', 'When your browser supports WebGPU, recognition runs locally and nothing leaves your machine.'],
    ['Nothing retained', 'In Cloud mode the cropped image is sent over HTTPS to be transcribed, and no data is kept.'],
    ['History stays local', 'Past conversions live in IndexedDB in your own browser, and you can clear them anytime.'],
];

export const CITATION = `@software{scribe,
  title  = {Scribe: hand-drawn math to LaTeX},
  author = {kaificial},
  url    = {${REPO_URL}},
  year   = {${new Date().getFullYear()}}
}`;

/** Sets a CSS custom property inline, for stagger delays and highlight timing. */
export const cssVar = (name: string, value: string) => ({ [name]: value }) as CSSProperties;
