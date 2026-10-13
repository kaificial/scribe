// Every static path of the transcription bench, computed once at module load.
// Moving parts are built at their rest position and moved with a transform.

import {
    corners,
    cylinder,
    dotGrid,
    insetPlan,
    knurl,
    onTop,
    pathOf,
    planOutline,
    ring,
    roundedPlan,
    sideArc,
    sideSeam,
    sideMatrix,
    slabOf,
    topTicks,
    type Flat,
    type Plan,
    type Plane,
    type Point3,
} from '../../iso/iso-kit';
import { CANVAS_H, CANVAS_W, LATEX_DEPTH, STROKES } from './model';
import {
    BASE, BASE_H, BEAM_H, BODY, BODY_H, DOCK, DOCK_AT, DOCK_H, FOOT_H, HEAD_H, HEAD_Z, LID, LID_TOP,
    P, PAPER_H, PAPER_W, PAPER_X0, PAPER_Y, RAIL_BACK, RAIL_FRONT, RAIL_H, SLATE, SLATE_TOP,
    KPX, STRIP_TOP, STRIP_X, STRIP_Y, UPRIGHT_TOP, WRITE, at, onSlate,
} from './view';

const slab = (plan: Plan, z: number, h: number, steps = 4, bevel = 0) => slabOf(plan, z, h, P, steps, bevel);
const round = (cx: number, cy: number, r: number, z: number, h: number, steps = 32, bevel = 0) => cylinder(cx, cy, r, z, h, P, steps, bevel);
const seg = (a: Point3, b: Point3) => pathOf([at(a), at(b)]);
const join = (paths: string[]) => paths.filter(Boolean).join('');
const dots = (points: Point3[]): Flat[] => points.map(at);

// a closed rounded outline drawn on a front face (at y = Y) or a side face (at x = X)
const onFaceY = (Y: number, { x, y, w, d, r }: Plan) => pathOf(roundedPlan({ x, y, w, d, r }, 3).map(([a, b]) => at([a, Y, b])), true);
const onFaceX = (X: number, { x, y, w, d, r }: Plan) => pathOf(roundedPlan({ x, y, w, d, r }, 3).map(([a, b]) => at([X, a, b])), true);

// ---- base -----------------------------------------------------------------

const FEET = corners(BASE, 20);
const LABEL: Plan = { x: -140, y: 64, w: 50, d: 9, r: 1.5 };

export const BASE_ART = {
    halo: slab(BASE, -BASE_H - FOOT_H, BASE_H).fill,
    feet: FEET.map(([x, y]) => [round(x, y, 7, -BASE_H - FOOT_H, 1.6, 28), round(x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, 28)]),
    slab: slab(BASE, -BASE_H, BASE_H, 9, 1.6),
    groove: planOutline(insetPlan(BASE, 4.5), 0, P, 9),
    screwRings: join(corners(BASE, 9).map(([x, y]) => ring(x, y, 2.2, 0, P, 16))),
    screws: dots(corners(BASE, 9).map(([x, y]) => [x, y, 0])),
    label: slab(LABEL, 0, 0.8, 3),
    labelLine: planOutline(insetPlan(LABEL, 1.6), 0.8, P, 3),
    labelRule: join([0, 1, 2].map((row) => onTop([[LABEL.x + 7, LABEL.y + 2.8 + row * 1.7], [LABEL.x + (row === 1 ? 30 : 41), LABEL.y + 2.8 + row * 1.7]], 0.8, P))),
    labelScrews: dots([[LABEL.x + 3.2, LABEL.y + LABEL.d / 2, 0.8], [LABEL.x + LABEL.w - 3.2, LABEL.y + LABEL.d / 2, 0.8]]),
};

// ---- rails ------------------------------------------------------------------

const railStops = (rail: Plan) => [rail.x + 1, rail.x + rail.w - 4].map((x) => slab({ x, y: rail.y - 0.6, w: 3, d: rail.d + 1.2, r: 0.8 }, RAIL_H, 3, 3, 0.4));
const railScrews = (rail: Plan) => dots([-130, -90, -50, -10].map((x) => [x, rail.y + rail.d / 2, RAIL_H] as Point3));
const RAIL_TICKS = topTicks(-144, 24, 4, 5, RAIL_FRONT.y + 0.7, RAIL_H, [1.6, 3.2], P);

export const RAIL_ART = {
    back: slab(RAIL_BACK, 0, RAIL_H, 3, 0.6),
    backStops: railStops(RAIL_BACK),
    backScrews: railScrews(RAIL_BACK),
    backSeam: sideSeam(RAIL_BACK, 1.6, P, 3),
    front: slab(RAIL_FRONT, 0, RAIL_H, 3, 0.6),
    frontStops: railStops(RAIL_FRONT),
    frontSeam: sideSeam(RAIL_FRONT, 1.6, P, 3),
    ticksMinor: RAIL_TICKS.minor,
    ticksMajor: RAIL_TICKS.major,
    ruleEdge: onTop([[-144, RAIL_FRONT.y + 0.7], [24, RAIL_FRONT.y + 0.7]], RAIL_H, P),
};

// ---- bridge (built at x = 0) ---------------------------------------------------

const CAR_BACK: Plan = { x: -7, y: -69, w: 14, d: 11, r: 2 };
const CAR_FRONT: Plan = { x: -7, y: 50, w: 14, d: 11, r: 2 };
const UP_BACK: Plan = { x: -4, y: -66, w: 8, d: 6, r: 1 };
const UP_FRONT: Plan = { x: -4, y: 52.5, w: 8, d: 6, r: 1 };
const BEAM: Plan = { x: -5, y: -68, w: 10, d: 129, r: 1.5 };
const HEAD: Plan = { x: -4.5, y: -44, w: 9, d: 84, r: 2 };
const CAR_TOP = RAIL_H + 6;
const carScrews = (plan: Plan) => dots(corners(plan, 2.4).map(([x, y]) => [x, y, CAR_TOP] as Point3));
const HANGERS: Plane[] = [[0, -30], [0, 26]];

export const BRIDGE_BACK = {
    carriage: slab(CAR_BACK, RAIL_H, 6, 3, 0.6),
    carScrews: carScrews(CAR_BACK),
    upright: slab(UP_BACK, CAR_TOP, UPRIGHT_TOP - CAR_TOP, 3),
    uprightSeam: sideSeam(UP_BACK, CAR_TOP + 6, P, 3),
};

export const BRIDGE_FRONT = {
    head: slab(HEAD, HEAD_Z, HEAD_H, 4, 0.6),
    headSeam: sideSeam(HEAD, HEAD_Z + 3.6, P, 4),
    headScrews: dots([[0, HEAD.y + 3, HEAD_Z + HEAD_H], [0, HEAD.y + HEAD.d - 3, HEAD_Z + HEAD_H]]),
    lens: onFaceX(HEAD.x + HEAD.w, { x: HEAD.y + 4, y: HEAD_Z + 1.2, w: HEAD.d - 8, d: 1.8, r: 0.9 }),
    lamp: onTop([[0, WRITE.y], [0, WRITE.y + WRITE.d]], SLATE_TOP, P),
    hangers: HANGERS.map(([x, y]) => round(x, y, 1.3, HEAD_Z + HEAD_H, UPRIGHT_TOP - HEAD_Z - HEAD_H, 16)),
    hangerCollars: HANGERS.map(([x, y]) => round(x, y, 2.2, HEAD_Z + HEAD_H, 1.6, 20)),
    carriage: slab(CAR_FRONT, RAIL_H, 6, 3, 0.6),
    carScrews: carScrews(CAR_FRONT),
    upright: slab(UP_FRONT, CAR_TOP, UPRIGHT_TOP - CAR_TOP, 3),
    uprightSeam: sideSeam(UP_FRONT, CAR_TOP + 6, P, 3),
    pointer: seg([0, CAR_FRONT.y + CAR_FRONT.d, RAIL_H + 4.6], [0, CAR_FRONT.y + CAR_FRONT.d, RAIL_H + 1]),
    beam: slab(BEAM, UPRIGHT_TOP, BEAM_H, 4, 0.8),
    beamGroove: onTop([[0, BEAM.y], [0, BEAM.y + BEAM.d]], UPRIGHT_TOP + BEAM_H, P),
    beamScrews: dots([[0, BEAM.y + 2.6, UPRIGHT_TOP + BEAM_H], [0, BEAM.y + BEAM.d - 2.6, UPRIGHT_TOP + BEAM_H], ...HANGERS.map(([x, y]) => [x - 2.6, y, UPRIGHT_TOP + BEAM_H] as Point3)]),
};

// ---- slate -------------------------------------------------------------------

// the crop rulers read in canvas px: a tick every 25 px, a major one every 100
function pxTicks(axis: 'x' | 'y') {
    const minor: string[] = [];
    const major: string[] = [];
    const span = axis === 'x' ? CANVAS_W : CANVAS_H;
    for (let px = 25; px < span - 10; px += 25) {
        const big = px % 100 === 0;
        const len = big ? 2.6 : 1.3;
        if (axis === 'x') {
            const x = WRITE.x + px / KPX, edge = STRIP_X.y + 0.6;
            (big ? major : minor).push(onTop([[x, edge], [x, edge + len]], STRIP_TOP, P));
        } else {
            const y = WRITE.y + px / KPX, edge = STRIP_Y.x + 0.6;
            (big ? major : minor).push(onTop([[edge, y], [edge + len, y]], STRIP_TOP, P));
        }
    }
    return { minor: join(minor), major: join(major) };
}
const STRIP_X_TICKS = pxTicks('x');
const STRIP_Y_TICKS = pxTicks('y');
const CONNECTOR: Plan = { x: SLATE.x + SLATE.w, y: 20, w: 3, d: 8, r: 0.8 };

export const SLATE_ART = {
    halo: slab(insetPlan(SLATE, 2), 0, 0.2).fill,
    body: slab(SLATE, 0, SLATE_TOP, 6, 1),
    seam: sideSeam(SLATE, 2, P, 6),
    field: planOutline(WRITE, SLATE_TOP, P, 3),
    grid: dotGrid(WRITE.x + 6.2, WRITE.y + 5, 19, 12, 6.2, SLATE_TOP, P),
    screws: dots(corners(SLATE, 3.6).map(([x, y]) => [x, y, SLATE_TOP] as Point3)),
    stripX: slab(STRIP_X, SLATE_TOP, 0.6, 2),
    stripY: slab(STRIP_Y, SLATE_TOP, 0.6, 2),
    ticksMinor: STRIP_X_TICKS.minor + STRIP_Y_TICKS.minor,
    ticksMajor: STRIP_X_TICKS.major + STRIP_Y_TICKS.major,
    edges: onTop([[STRIP_X.x + 0.8, STRIP_X.y + 0.6], [STRIP_X.x + STRIP_X.w - 0.8, STRIP_X.y + 0.6]], STRIP_TOP, P)
        + onTop([[STRIP_Y.x + 0.6, STRIP_Y.y + 0.8], [STRIP_Y.x + 0.6, STRIP_Y.y + STRIP_Y.d - 0.8]], STRIP_TOP, P),
    connector: slab(CONNECTOR, 1, 4, 2, 0.3),
    connectorFace: onFaceX(CONNECTOR.x + CONNECTOR.w, { x: CONNECTOR.y + 1.4, y: 2.2, w: CONNECTOR.d - 2.8, d: 1.6, r: 0.6 }),
};

// the ink as screen points, one list per stroke
export const INK_POINTS: Flat[][] = STROKES.map((stroke) => stroke.map((uv) => at(onSlate(uv, SLATE_TOP + 0.05))));
export const INK_FULL = join(INK_POINTS.map((pts) => pathOf(pts)));

// crop jaws: two riders on each ruler strip, built at 0 along their strip
const RIDER_X: Plan = { x: -1.8, y: STRIP_X.y - 0.8, w: 3.6, d: STRIP_X.d + 1.6, r: 0.8 };
const RIDER_Y: Plan = { x: STRIP_Y.x - 0.8, y: -1.8, w: STRIP_Y.w + 1.6, d: 3.6, r: 0.8 };
export const RIDER_ART = {
    x: slab(RIDER_X, STRIP_TOP, 1.8, 2, 0.3),
    xIndex: onTop([[0, RIDER_X.y + 0.8], [0, RIDER_X.y + RIDER_X.d - 0.8]], STRIP_TOP + 1.8, P),
    y: slab(RIDER_Y, STRIP_TOP, 1.8, 2, 0.3),
    yIndex: onTop([[RIDER_Y.x + 0.8, 0], [RIDER_Y.x + RIDER_Y.w - 0.8, 0]], STRIP_TOP + 1.8, P),
};

// ---- stylus (built with its tip at the origin) and its dock --------------------------

const PEN_PARTS: Array<{ r: number; z: number; h: number; tone: 'hi' | 'mid' | 'lo' }> = [
    { r: 0.7, z: 0, h: 1.6, tone: 'hi' },     // nib
    { r: 1.5, z: 1.6, h: 2, tone: 'mid' },    // nib collar
    { r: 2.4, z: 3.6, h: 10, tone: 'mid' },   // grip
    { r: 2.6, z: 13.6, h: 1.2, tone: 'mid' }, // band
    { r: 2.6, z: 14.8, h: 18, tone: 'hi' },   // barrel
    { r: 2.8, z: 32.8, h: 4.2, tone: 'mid' }, // cap
];
export const PEN_ART = {
    parts: PEN_PARTS.map((part) => ({ paths: round(0, 0, part.r, part.z, part.h, 24), tone: part.tone })),
    grip: knurl(0, 0, 2.4, 3.6, 13.6, 22, P),
    barrelSeams: join([20, 26].map((z) => sideArc(0, 0, 2.6, z, P, 18))),
    clip: slab({ x: -0.6, y: 2.4, w: 1.2, d: 1.4, r: 0.4 }, 22, 12, 2),
    button: round(0, 0, 1.2, 37, 0.9, 16),
};

export const DOCK_ART = {
    block: slab(DOCK, 0, DOCK_H, 4, 0.6),
    seat: ring(DOCK_AT[0], DOCK_AT[1], 3.4, DOCK_H, P, 24),
    seatInner: ring(DOCK_AT[0], DOCK_AT[1], 1.6, DOCK_H, P, 18),
    screws: dots([[DOCK.x + 2.6, DOCK.y + 2.6, DOCK_H], [DOCK.x + DOCK.w - 2.6, DOCK.y + DOCK.d - 2.6, DOCK_H]]),
};

// ---- printer -------------------------------------------------------------------

const FRONT = BODY.y + BODY.d;
const SIDE = BODY.x + BODY.w;
const REEL: Plane = [64, -22];
const KNOB: Plane = [91, 23];
const LED: Plane = [91, -29];
const PLATE: Plan = { x: 74, y: FRONT, w: 20, d: 0.8, r: 0.3 };
const JACK: Plan = { x: 28.4, y: 21, w: 6.6, d: 8, r: 1.2 };
const SLOT: Plan = { x: PAPER_X0 - 2, y: PAPER_Y - 1.6, w: PAPER_W + 4, d: 3.2, r: 1.2 };

export const PRINTER_ART = {
    halo: slab(insetPlan(BODY, 3), 0, 0.2).fill,
    body: slab(BODY, 0, BODY_H, 6, 0.8),
    plinth: sideSeam(BODY, 3.4, P, 6),
    vents: join([0, 1, 2, 3, 4, 5, 6].map((i) => onFaceY(FRONT, { x: 42 + i * 4.2, y: 7, w: 1.7, d: 13, r: 0.8 }))),
    plate: slab(PLATE, 17, 8, 2),
    plateRule: join([0, 1, 2].map((row) => seg([PLATE.x + 3, FRONT + 0.8, 22.6 - row * 1.8], [PLATE.x + (row === 1 ? 11 : 16), FRONT + 0.8, 22.6 - row * 1.8]))),
    plateScrews: dots([[PLATE.x + 1.4, FRONT + 0.8, 21], [PLATE.x + PLATE.w - 1.4, FRONT + 0.8, 21]]),
    sideVents: join([0, 1, 2].map((i) => onFaceX(SIDE, { x: -26 + i * 9, y: 9, w: 5.6, d: 1.6, r: 0.8 }))),
    sideScrews: dots([[SIDE, -32, 26], [SIDE, 28, 26], [SIDE, -32, 6.6], [SIDE, 28, 6.6]]),
    lid: slab(LID, BODY_H, LID_TOP - BODY_H, 5, 0.8),
    lidScrews: dots(corners(LID, 3).map(([x, y]) => [x, y, LID_TOP] as Point3)),
    slot: planOutline(SLOT, LID_TOP, P, 3),
    slotVoid: slab(insetPlan(SLOT, 0.6), LID_TOP, 0.01, 3).fill,
    reelFlange: round(REEL[0], REEL[1], 13.6, LID_TOP, 1.2, 48, 0.4),
    reelRoll: round(REEL[0], REEL[1], 11.2, LID_TOP + 1.2, 6.4, 48),
    reelLayers: join([5.6, 7.8, 9.8].map((r) => ring(REEL[0], REEL[1], r, LID_TOP + 7.6, P, 40))),
    reelHub: round(REEL[0], REEL[1], 3.4, LID_TOP + 7.6, 1.6, 24),
    knob: round(KNOB[0], KNOB[1], 4.6, LID_TOP, 4.4, 32),
    knobKnurl: knurl(KNOB[0], KNOB[1], 4.6, LID_TOP, LID_TOP + 4.4, 30, P),
    knobBand: sideArc(KNOB[0], KNOB[1], 4.6, LID_TOP + 1.2, P, 24),
    ledRing: ring(LED[0], LED[1], 2.8, LID_TOP, P, 20),
    led: round(LED[0], LED[1], 1.6, LID_TOP, 0.9, 18),
    jack: slab(JACK, 0, 5, 3, 0.4),
    jackScrew: dots([[JACK.x + JACK.w / 2, JACK.y + JACK.d / 2, 5]]),
};

export const REEL_HUB_TOP: Point3 = [REEL[0], REEL[1], LID_TOP + 9.2];
export const KNOB_TOP: Point3 = [KNOB[0], KNOB[1], LID_TOP + 4.4];

// the ribbon cable from the slate's connector to the printer's jack, lying on the base
export const CABLE = {
    from: at([CONNECTOR.x + CONNECTOR.w, CONNECTOR.y + CONNECTOR.d / 2, 3]),
    via: [at([15, 24, 0.5]), at([22, 27, 0.5])],
    to: at([JACK.x + JACK.w / 2, JACK.y + JACK.d / 2, 5]),
};

// ---- paper (built at rest with its top just under the lid) --------------

const PAPER_FACE = PAPER_Y + 0.4;
const PAPER_TOP = LID_TOP - 1;
export const PAPER_ART = {
    sheet: slab({ x: PAPER_X0, y: PAPER_Y - 0.4, w: PAPER_W, d: 0.8, r: 0.2 }, PAPER_TOP - PAPER_H, PAPER_H, 2),
    // printed rows, top to bottom: a header, the LaTeX line, a footer
    header: join([0, 1].map((row) => seg([PAPER_X0 + 4, PAPER_FACE, PAPER_TOP - 3 - row * 1.8], [PAPER_X0 + (row ? 16 : 22), PAPER_FACE, PAPER_TOP - 3 - row * 1.8]))),
    rule: seg([PAPER_X0, PAPER_FACE, PAPER_TOP - 7.6], [PAPER_X0 + PAPER_W, PAPER_FACE, PAPER_TOP - 7.6]),
    text: sideMatrix([PAPER_X0 + 3.4, PAPER_FACE], PAPER_TOP - (LATEX_DEPTH - 1), P, 'left'),
    pending: join([0, 1].map((row) => seg([PAPER_X0 + 4, PAPER_FACE, PAPER_TOP - 11 - row * 2.2], [PAPER_X0 + (row ? 24 : 34), PAPER_FACE, PAPER_TOP - 11 - row * 2.2]))),
    footer: seg([PAPER_X0 + 4, PAPER_FACE, PAPER_TOP - 18], [PAPER_X0 + 19, PAPER_FACE, PAPER_TOP - 18]),
};
// clips the paper so it only shows above the lid
export const PAPER_CLIP = pathOf(
    ([[PAPER_X0 - 3, LID_TOP], [PAPER_X0 + PAPER_W + 3, LID_TOP], [PAPER_X0 + PAPER_W + 3, LID_TOP + 80], [PAPER_X0 - 3, LID_TOP + 80]] as Plane[]).map(([x, z]) => at([x, PAPER_FACE, z])),
    true,
);
