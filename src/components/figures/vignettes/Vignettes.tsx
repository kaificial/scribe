// Small isometric scenes for the two input cards: a slate with a stylus (draw)
// and a sheet feeder taking a photo (upload). The art is static; hover motion
// is CSS driven by the card's `.group:hover`.

import * as React from 'react';
import {
    corners, cylinder, dotGrid, fitProjection, insetPlan, iso, knurl, pathOf, planOutline, ring, roundedPlan,
    axisVector, sideArc, sideSeam, slabOf, translateAlong, type Flat, type Plan, type Point3, type Projection,
} from '../../iso/iso-kit';
import { Dots, Line, Solid } from '../../iso/react/draw';
import './vignettes.css';

const W = 220;
const H = 150;

/** A world offset as a CSS translate value, so hover motion can stay in CSS. */
const cssOffset = (P: Projection, by: Point3) => axisVector(P, by).map((v) => `${Math.round(v * 100) / 100}px`).join(', ');

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <svg className="iso-svg vg-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} focusable="false">
            {children}
        </svg>
    );
}

// ---- draw: a slate on feet, a stroke on it, the stylus above ----------------------

const D = (() => {
    const BASE: Plan = { x: -60, y: -40, w: 120, d: 80, r: 5 };
    const TOP = 5;
    const FIELD = insetPlan(BASE, 7);
    const P: Projection = fitProjection(
        [[BASE.x, BASE.y, -4], [BASE.x + BASE.w, BASE.y + BASE.d, -4], [BASE.x, BASE.y + BASE.d, -4], [BASE.x + BASE.w, BASE.y, -4], [22, 18, TOP + 46]],
        W, H, { pad: 12, azimuth: 52 },
    );
    const at = (p: Point3) => iso(p, P);
    const STRIP: Plan = { x: FIELD.x, y: FIELD.y + FIELD.d + 1.4, w: FIELD.w, d: 3.6, r: 0.6 };
    const ticks: string[] = [];
    for (let x = STRIP.x + 4; x < STRIP.x + STRIP.w - 2; x += 4) {
        const big = Math.round((x - STRIP.x) / 4) % 5 === 0;
        ticks.push(pathOf([at([x, STRIP.y + 0.5, TOP + 0.5]), at([x, STRIP.y + 0.5 + (big ? 2.2 : 1.1), TOP + 0.5])]));
    }
    // a hand-drawn "x² + y" on the slate, the last stroke ending where the stylus comes down
    const curve = (pts: [number, number][]) => pathOf(pts.map(([x, y]) => at([x, y, TOP + 0.05])));
    const strokes = [
        curve([[-34, -12], [-28, -4], [-22, 4], [-16, 12]]),
        curve([[-16, -12], [-23, -3], [-29, 5], [-35, 13]]),
        curve([[-12, -19], [-10, -23], [-4, -23], [-5, -18], [-12, -11], [-3, -11]]),
        curve([[2, 0], [14, 0]]),
        curve([[8, -6], [8, 6]]),
        curve([[20, -6], [24, 2], [27, 6]]),
        curve([[33, -6], [28, 6], [22, 18]]),
    ];
    const PEN: Array<[number, number, number, 'hi' | 'mid']> = [[0.6, 0, 1.6, 'hi'], [1.4, 1.6, 2, 'mid'], [2.3, 3.6, 9, 'mid'], [2.5, 12.6, 1.2, 'mid'], [2.5, 13.8, 16, 'hi'], [2.7, 29.8, 4, 'mid']];
    return {
        P,
        halo: slabOf(BASE, -4, 4, P).fill,
        feet: corners(BASE, 10).map(([x, y]) => cylinder(x, y, 4, -4, 2, P, 20)),
        body: slabOf(BASE, -2, TOP + 2, P, 6, 1),
        seam: sideSeam(BASE, 0.4, P, 6),
        field: planOutline(FIELD, TOP, P, 3),
        grid: dotGrid(FIELD.x + 5, FIELD.y + 5, 18, 10, 5.6, TOP, P),
        screws: corners(BASE, 3).map(([x, y]) => at([x, y, TOP])),
        strip: slabOf(STRIP, TOP, 0.5, P, 2),
        stripEdge: pathOf([at([STRIP.x + 0.6, STRIP.y + 0.5, TOP + 0.5]), at([STRIP.x + STRIP.w - 0.6, STRIP.y + 0.5, TOP + 0.5])]),
        ticks: ticks.join(''),
        ink: strokes.slice(0, 6).join(''),
        live: strokes[6],
        pen: PEN.map(([r, z, h, tone]) => ({ paths: cylinder(0, 0, r, z, h, P, 20), tone })),
        grip: knurl(0, 0, 2.3, 3.6, 12.6, 18, P),
        seams: sideArc(0, 0, 2.5, 20, P, 16),
        clip: slabOf({ x: -0.5, y: 2.3, w: 1, d: 1.2, r: 0.3 }, 20, 10, P, 2),
        penAt: translateAlong(P, [22, 18, TOP]),
        penLift: cssOffset(P, [0, 0, 8]),
    };
})();

export function DrawVignette() {
    return (
        <Frame label="A slate with a hand-drawn x squared on it and a stylus coming down to finish the stroke.">
            <path className="iso-halo" d={D.halo} />
            {D.feet.map((paths, i) => <Solid key={i} paths={paths} tone="lo" />)}
            <Solid paths={D.body} tone="mid" inner={<Line d={D.seam} tone="faint" />} />
            <Line d={D.field} tone="faint" />
            <Dots points={D.grid} size={0.3} tone="faint" />
            <Dots points={D.screws} size={0.45} tone="mid" />
            <Solid paths={D.strip} tone="lo" crease="none" />
            <Line d={D.stripEdge} tone="lo" />
            <Line d={D.ticks} tone="lo" />
            <path className="vg-ink" d={D.ink} />
            <path className="vg-ink vg-live" d={D.live} pathLength={1} />
            <g transform={D.penAt}>
                <g className="vg-lift" style={{ '--vg-lift': D.penLift } as React.CSSProperties}>
                    {D.pen.map((part, i) => (
                        <Solid key={i} paths={part.paths} tone={part.tone} inner={i === 2 ? <Line d={D.grip} tone="faint" /> : i === 4 ? <Line d={D.seams} tone="faint" /> : undefined} />
                    ))}
                    <Solid paths={D.clip} tone="mid" />
                </g>
            </g>
        </Frame>
    );
}

// ---- upload: a sheet feeder with a photo half-way into its slot ---------------------

const U = (() => {
    const BASE: Plan = { x: -56, y: -34, w: 112, d: 68, r: 6 };
    const BODY: Plan = { x: -46, y: -26, w: 92, d: 46, r: 5 };
    const BODY_H = 18;
    const SLOT_Y = -4;
    const PHOTO: Plan = { x: -26, y: SLOT_Y - 0.4, w: 52, d: 0.8, r: 0.2 };
    const PHOTO_H = 40;
    const REST = 24;          // how far the photo stands out of the slot at rest
    const P: Projection = fitProjection(
        [[BASE.x, BASE.y, -4], [BASE.x + BASE.w, BASE.y + BASE.d, -4], [BASE.x, BASE.y + BASE.d, -4], [BASE.x + BASE.w, BASE.y, -4], [PHOTO.x, SLOT_Y, BODY_H + REST + 22], [PHOTO.x + PHOTO.w, SLOT_Y, BODY_H + REST + 22]],
        W, H, { pad: 12, azimuth: 50 },
    );
    const at = (p: Point3) => iso(p, P);
    const FACE = BODY.y + BODY.d;
    const onFace = ({ x, y, w, d, r }: Plan) => pathOf(roundedPlan({ x, y, w, d, r }, 3).map(([a, b]) => at([a, FACE, b])), true);
    const SLOT: Plan = { x: PHOTO.x - 3, y: SLOT_Y - 1.6, w: PHOTO.w + 6, d: 3.2, r: 1.2 };
    const top = BODY_H + REST;      // photo top edge at rest
    const face = SLOT_Y + 0.4;
    const seg = (a: Point3, b: Point3) => pathOf([at(a), at(b)]);
    // the picture on the photo: a written line of math as rule marks plus a frame
    const pic: Plan = { x: PHOTO.x + 3, y: top - 3 - 20, w: PHOTO.w - 6, d: 20, r: 0.6 };
    return {
        P,
        halo: slabOf(BASE, -4, 4, P).fill,
        base: slabOf(BASE, -4, 4, P, 6, 1),
        baseGroove: planOutline(insetPlan(BASE, 3.4), 0, P, 6),
        screws: corners(BASE, 4).map(([x, y]) => at([x, y, 0])),
        body: slabOf(BODY, 0, BODY_H, P, 6, 0.8),
        plinth: sideSeam(BODY, 3, P, 6),
        slot: planOutline(SLOT, BODY_H, P, 3),
        void: slabOf(insetPlan(SLOT, 0.6), BODY_H, 0.01, P, 3).fill,
        guides: [-1, 1].map((side) => slabOf({ x: side < 0 ? SLOT.x - 4 : SLOT.x + SLOT.w + 1, y: SLOT_Y - 3, w: 3, d: 6, r: 0.8 }, BODY_H, 2.4, P, 2, 0.3)),
        vents: [0, 1, 2, 3, 4].map((i) => onFace({ x: -38 + i * 4.4, y: 4, w: 1.6, d: 9, r: 0.8 })).join(''),
        led: cylinder(34, 12, 1.5, BODY_H, 0.8, P, 16),
        ledRing: ring(34, 12, 2.6, BODY_H, P, 18),
        button: cylinder(26, 12, 2.4, BODY_H, 1.4, P, 18),
        photo: slabOf({ ...PHOTO }, top - PHOTO_H, PHOTO_H, P, 2),
        frame: pathOf(roundedPlan(pic, 2).map(([a, b]) => at([a, face, b])), true),
        marks: [
            seg([pic.x + 5, face, pic.y + 14], [pic.x + 12, face, pic.y + 6]),
            seg([pic.x + 12, face, pic.y + 14], [pic.x + 5, face, pic.y + 6]),
            seg([pic.x + 16, face, pic.y + 11.4], [pic.x + 23, face, pic.y + 11.4]),
            seg([pic.x + 16, face, pic.y + 8.6], [pic.x + 23, face, pic.y + 8.6]),
            seg([pic.x + 27, face, pic.y + 14], [pic.x + 32, face, pic.y + 10]),
            seg([pic.x + 37, face, pic.y + 14], [pic.x + 29, face, pic.y + 5]),
        ].join(''),
        clip: pathOf(([[SLOT.x - 2, BODY_H], [SLOT.x + SLOT.w + 2, BODY_H], [SLOT.x + SLOT.w + 2, BODY_H + 80], [SLOT.x - 2, BODY_H + 80]] as Flat[]).map(([x, z]) => at([x, face, z])), true),
        sink: cssOffset(P, [0, 0, -(REST - 3)]),
    };
})();

export function UploadVignette() {
    const id = `vg-photo-${React.useId().replace(/:/g, '')}`;
    return (
        <Frame label="A sheet feeder with a photo of a handwritten equation standing in its slot, about to be fed in.">
            <defs>
                <clipPath id={id} clipPathUnits="userSpaceOnUse"><path d={U.clip} /></clipPath>
            </defs>
            <path className="iso-halo" d={U.halo} />
            <Solid paths={U.base} tone="lo" />
            <Line d={U.baseGroove} tone="faint" />
            <Dots points={U.screws} size={0.45} tone="mid" />
            <Solid paths={U.body} tone="mid" inner={<Line d={U.plinth} tone="faint" />} />
            <Line d={U.vents} tone="lo" />
            <path className="vg-void" d={U.void} />
            <Line d={U.slot} tone="lo" />
            {U.guides.map((paths, i) => <Solid key={i} paths={paths} tone="mid" />)}
            <Line d={U.ledRing} tone="faint" />
            <g className="vg-led"><Solid paths={U.led} tone="hi" /></g>
            <Solid paths={U.button} tone="mid" />
            <g clipPath={`url(#${id})`}>
                <g className="vg-sink" style={{ '--vg-sink': U.sink } as React.CSSProperties}>
                    <Solid paths={U.photo} tone="hi" />
                    <Line d={U.frame} tone="faint" />
                    <Line d={U.marks} tone="mid" free />
                </g>
            </g>
        </Frame>
    );
}
