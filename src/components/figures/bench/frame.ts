// Pure helpers that turn a moment of the model into SVG paths and transforms.

import { pathOf, type Flat, type Point3 } from '../../iso/iso-kit';
import { CANVAS_H, CANVAS_W, STROKES, STROKE_LENGTHS } from './model';
import { INK_POINTS } from './geometry';
import { KPX, SLATE, SLATE_TOP, WRITE, at } from './view';

export interface Box { minX: number; minY: number; maxX: number; maxY: number }

export const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
export const lerp3 = (a: Point3, b: Point3, f: number): Point3 => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];

/** Rounds to 3 decimals, for opacity attributes. */
export const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** The ink written so far, as a path. `length` is in canvas px and may end mid-segment. */
export function partialInk(length: number) {
    if (length <= 0) return '';
    let left = length;
    let out = '';
    for (let s = 0; s < STROKES.length && left > 0; s++) {
        const uv = STROKES[s];
        const pts = INK_POINTS[s];
        if (left >= STROKE_LENGTHS[s]) {
            out += pathOf(pts);
            left -= STROKE_LENGTHS[s];
            continue;
        }
        const keep: Flat[] = [pts[0]];
        for (let i = 1; i < uv.length; i++) {
            const seg = Math.hypot(uv[i][0] - uv[i - 1][0], uv[i][1] - uv[i - 1][1]);
            if (left >= seg) {
                keep.push(pts[i]);
                left -= seg;
                continue;
            }
            const f = seg ? left / seg : 0;
            keep.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]);
            break;
        }
        out += pathOf(keep);
        left = 0;
    }
    return out;
}

/** The slate surface from its left edge to `x`. Used to clip the scanned ink. */
export function scannedRegion(x: number) {
    if (x <= SLATE.x) return 'M0 0Z';
    const { x: x0, y: y0, d } = SLATE;
    return pathOf([at([x0, y0, SLATE_TOP]), at([x, y0, SLATE_TOP]), at([x, y0 + d, SLATE_TOP]), at([x0, y0 + d, SLATE_TOP])], true);
}

/** A short pointer line on a round top face, turned to `angle`. */
export const pointerAt = (center: Point3, r: number, angle: number) =>
    pathOf([at(center), at([center[0] + r * Math.sin(angle), center[1] - r * Math.cos(angle), center[2]])]);

/** Where the four crop jaws sit, in world units, as they close from the slate edges onto `box`. */
export function jawPositions(box: Box, closed: number) {
    return {
        left: WRITE.x + lerp(0, box.minX, closed) / KPX,
        right: WRITE.x + lerp(CANVAS_W, box.maxX, closed) / KPX,
        top: WRITE.y + lerp(0, box.minY, closed) / KPX,
        bottom: WRITE.y + lerp(CANVAS_H, box.maxY, closed) / KPX,
    };
}

/** Contain-fits an image of `w` x `h` px onto the canvas with a margin, in canvas px. */
export function fitOnCanvas(w: number, h: number, margin = 40): Box {
    const k = Math.min((CANVAS_W - margin * 2) / w, (CANVAS_H - margin * 2) / h);
    const fw = w * k;
    const fh = h * k;
    return { minX: (CANVAS_W - fw) / 2, minY: (CANVAS_H - fh) / 2, maxX: (CANVAS_W + fw) / 2, maxY: (CANVAS_H + fh) / 2 };
}

/** The crop box used in work mode before the image size is known. */
export const DEFAULT_WORK_BOX: Box = { minX: 60, minY: 60, maxX: CANVAS_W - 60, maxY: CANVAS_H - 60 };
