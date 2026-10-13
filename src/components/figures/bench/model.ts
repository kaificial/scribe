// The bench's model: the strokes on the slate, the numbers the real pipeline
// gives for them, and the timeline that drives every moving part.
// No DOM here. All motion, readouts and printed text come from this file.

import { computeScaledDimensions } from '../../../utils/imageProcessing';

// the slate's writing area stands for a canvas this size, in css px
export const CANVAS_W = 806;
export const CANVAS_H = 520;
export const CROP_PAD = 40;      // findContentBoundingBox padding
export const MAX_DIM = 512;      // getCroppedCanvas resize bound
export const THRESHOLD = 180;    // thresholdPixels luminance cut
export const LATEX = '\\int_0^1 x^2\\,dx';
// how far the printed slip rises out of the lid, and how far below
// its top edge the LaTeX line is printed
export const PAPER_RISE = 27;
export const LATEX_DEPTH = 14.2;

type Uv = [number, number];

function bezier(p0: Uv, p1: Uv, p2: Uv, p3: Uv, steps = 14): Uv[] {
    const out: Uv[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps, s = 1 - t;
        out.push([
            s * s * s * p0[0] + 3 * s * s * t * p1[0] + 3 * s * t * t * p2[0] + t * t * t * p3[0],
            s * s * s * p0[1] + 3 * s * s * t * p1[1] + 3 * s * t * t * p2[1] + t * t * t * p3[1],
        ]);
    }
    return out;
}

const chain = (...parts: Uv[][]) => parts.flatMap((part, i) => (i ? part.slice(1) : part));

function loop(cx: number, cy: number, rx: number, ry: number, from = -Math.PI / 2, steps = 22): Uv[] {
    const out: Uv[] = [];
    for (let i = 0; i <= steps; i++) {
        const a = from - (i / steps) * Math.PI * 2;
        out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    }
    return out;
}

// ∫₀¹ x² dx, written the way a hand writes it: ten strokes, in canvas px (y down)
export const STROKES: Uv[][] = [
    chain(
        bezier([286, 150], [282, 108], [244, 104], [238, 160]),
        bezier([238, 160], [234, 240], [228, 320], [222, 384]),
        bezier([222, 384], [218, 424], [184, 428], [180, 392]),
    ),
    [[298, 128], [306, 120], [311, 113], [311, 140], [311, 168]],
    loop(268, 392, 10, 15),
    bezier([360, 238], [384, 262], [398, 290], [420, 316], 10),
    bezier([420, 236], [398, 262], [382, 292], [358, 318], 10),
    chain(bezier([436, 206], [440, 186], [468, 188], [459, 212], 10), [[447, 226], [436, 238], [464, 236]]),
    loop(530, 292, 17, 21, 0),
    [[548, 214], [548, 250], [548, 286], [549, 304], [553, 313], [559, 310]],
    bezier([580, 262], [596, 280], [608, 298], [624, 316], 10),
    bezier([624, 262], [606, 280], [594, 298], [578, 318], 10),
];

const lengthOf = (pts: Uv[]) => pts.reduce((sum, p, i) => (i ? sum + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
export const STROKE_LENGTHS = STROKES.map(lengthOf);
export const INK_LENGTH = STROKE_LENGTHS.reduce((a, b) => a + b, 0);

// the crop box, computed the same way as findContentBoundingBox
const all = STROKES.flat();
export const INK_BOX = {
    minX: Math.min(...all.map((p) => p[0])),
    minY: Math.min(...all.map((p) => p[1])),
    maxX: Math.max(...all.map((p) => p[0])),
    maxY: Math.max(...all.map((p) => p[1])),
};
export const CROP_BOX = {
    minX: Math.max(0, Math.floor(INK_BOX.minX) - CROP_PAD),
    minY: Math.max(0, Math.floor(INK_BOX.minY) - CROP_PAD),
    maxX: Math.min(CANVAS_W, Math.ceil(INK_BOX.maxX) + CROP_PAD),
    maxY: Math.min(CANVAS_H, Math.ceil(INK_BOX.maxY) + CROP_PAD),
};
export const CROP_W = CROP_BOX.maxX - CROP_BOX.minX;
export const CROP_H = CROP_BOX.maxY - CROP_BOX.minY;
export const SENT = computeScaledDimensions(CROP_W, CROP_H, MAX_DIM);

// ---- timeline ------------------------------------------------------------

export type Phase = 'ready' | 'reach' | 'write' | 'park' | 'crop' | 'scan' | 'print' | 'done' | 'clear';

// seconds; the tour plays them in order and loops
export interface PhaseSpan { phase: Phase; at: number; until: number }

export const PHASES: PhaseSpan[] = [
    { phase: 'ready', at: 0, until: 0.7 },
    { phase: 'reach', at: 0.7, until: 1.4 },
    { phase: 'write', at: 1.4, until: 5.0 },
    { phase: 'park', at: 5.0, until: 5.8 },
    { phase: 'crop', at: 5.8, until: 6.9 },
    { phase: 'scan', at: 6.9, until: 9.0 },
    { phase: 'print', at: 9.0, until: 11.2 },
    { phase: 'done', at: 11.2, until: 12.8 },
    { phase: 'clear', at: 12.8, until: 13.6 },
];
export const CYCLE = 13.6;
export const STOPS = PHASES.map((p) => p.at);

const smoothstep = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/** 0 before `a`, 1 after `b`, eased in between. */
const span = (t: number, a: number, b: number) => smoothstep((t - a) / (b - a));
const phaseAt = (t: number) => PHASES.find((p) => t >= p.at && t < p.until) ?? PHASES[PHASES.length - 1];
const SPANS = Object.fromEntries(PHASES.map((p) => [p.phase, p])) as Record<Phase, PhaseSpan>;

/** The start and end time of a phase. */
export const phaseWindow = (name: Phase) => SPANS[name];

export interface Pose {
    phase: Phase;
    ink: number;          // canvas px of stroke written, 0..INK_LENGTH
    inkAlpha: number;     // fades on clear
    pen: Uv | null;       // pen tip in canvas px while on the slate, null when docked
    penDock: number;      // 0 = on the slate, 1 = in its dock (blend for travel)
    penLift: number;      // world units above the surface
    crop: number;         // 0 = jaws at the slate ends, 1 = on the crop box
    scan: number;         // 0 = bridge parked, 1 = past the far edge
    lamp: number;         // scan lamp brightness 0..1
    tape: number;         // 0..1 of the tape fed out
    tapeAlpha: number;
    stroke: number;       // index of the stroke in progress
}

/** Where the pen tip is after `d` canvas px of ink, and which stroke it is on. */
function penAlong(d: number): { at: Uv; stroke: number } {
    let left = d;
    for (let s = 0; s < STROKES.length; s++) {
        const pts = STROKES[s], len = STROKE_LENGTHS[s];
        if (left <= len) {
            for (let i = 1; i < pts.length; i++) {
                const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
                if (left <= seg || i === pts.length - 1) {
                    const f = seg ? Math.min(1, left / seg) : 0;
                    return { at: [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f], stroke: s };
                }
                left -= seg;
            }
        }
        left -= len;
    }
    const last = STROKES[STROKES.length - 1];
    return { at: last[last.length - 1], stroke: STROKES.length - 1 };
}

export function poseAt(t: number): Pose {
    const { phase } = phaseAt(t);
    const write = SPANS.write, reachSpan = SPANS.reach, parkSpan = SPANS.park;
    const writing = (t - write.at) / (write.until - write.at);
    const ink = INK_LENGTH * Math.min(1, Math.max(0, writing));
    const along = penAlong(ink);

    // the pen lifts a little between strokes
    let penLift = 0;
    if (phase === 'write') {
        let acc = 0;
        for (const len of STROKE_LENGTHS.slice(0, -1)) {
            acc += len;
            const gap = Math.abs(ink - acc) / 14;
            if (gap < 1) penLift = Math.max(penLift, 3 * (1 - gap * gap));
        }
    }

    // the pen also lifts as it travels to and from its dock
    const reach = span(t, reachSpan.at, reachSpan.until);
    const park = span(t, parkSpan.at, parkSpan.until);
    const penDock = t < write.at ? 1 - reach : t >= parkSpan.at ? park : 0;
    if (t < write.at && t >= reachSpan.at) penLift = 8 * Math.sin(reach * Math.PI);
    if (t >= parkSpan.at && t < parkSpan.until) penLift = 8 * Math.sin(park * Math.PI);

    const { crop, scan, print } = SPANS;
    const clear = span(t, SPANS.clear.at, SPANS.clear.until);
    return {
        phase,
        ink: t < write.at ? 0 : ink,
        inkAlpha: 1 - clear,
        pen: phase === 'ready' ? null : (t < write.at ? penAlong(0).at : along.at),
        penDock,
        penLift,
        crop: span(t, crop.at, crop.until) * (1 - clear),
        scan: bridgeAt(t),
        lamp: span(t, scan.at - 0.1, scan.at + 0.2) * (1 - span(t, scan.until - 0.3, scan.until)),
        tape: span(t, print.at, print.until - 0.2),
        tapeAlpha: 1 - clear,
        stroke: along.stroke,
    };
}

/** The scan bridge's position: 0 parked, 1 past the slate. It sweeps during the scan and returns during the print. */
export function bridgeAt(t: number): number {
    const { scan, print } = SPANS;
    if (t < scan.at) return 0;
    if (t < scan.until - 0.15) return span(t, scan.at, scan.until - 0.15);
    if (t < print.at) return 1;
    return 1 - span(t, print.at, print.at + 1.6);
}

const fmt = (n: number) => Math.round(n).toString();

/** The readout text at time `t`, read from where the parts are. */
export function readoutOf(t: number): string {
    const p = poseAt(t);
    switch (p.phase) {
        case 'ready': return `ready · canvas ${CANVAS_W} × ${CANVAS_H} px`;
        case 'reach': return 'pen down';
        case 'write': return `writing · stroke ${p.stroke + 1} of ${STROKES.length}`;
        case 'park': return `pen up · ${STROKES.length} strokes`;
        case 'crop': {
            const w = CANVAS_W + (CROP_W - CANVAS_W) * p.crop;
            const h = CANVAS_H + (CROP_H - CANVAS_H) * p.crop;
            return `crop ${fmt(w)} × ${fmt(h)} px`;
        }
        case 'scan': {
            const done = Math.round(bridgeAt(t) * 100);
            return `threshold ${THRESHOLD} · ${done}%`;
        }
        case 'print':
            return p.tape * PAPER_RISE >= LATEX_DEPTH ? LATEX : `${SENT.width} × ${SENT.height} px sent`;
        case 'done': return LATEX;
        case 'clear': return 'clearing';
    }
}

export const PHASE_WORDS: Record<Phase, string> = {
    ready: 'Ready',
    reach: 'Pen down',
    write: 'Writing on the slate',
    park: 'Pen returned to its dock',
    crop: `Cropping to the ink, ${CROP_W} by ${CROP_H} pixels`,
    scan: `Scanning to black and white at threshold ${THRESHOLD}`,
    print: 'Printing LaTeX onto the tape',
    done: `Printed ${LATEX}`,
    clear: 'Clearing the slate',
};

