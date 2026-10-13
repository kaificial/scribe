// World layout of the transcription bench (units ≈ 1 px of the real thing,
// x along the bench, y toward the viewer, z up) and its one camera.

import { boxCorners, fitProjection, iso, type Flat, type Plan, type Point3 } from '../../iso/iso-kit';
import { CANVAS_W, PAPER_RISE } from './model';

export const WIDTH = 600;
export const HEIGHT = 330;
export const AZIMUTH = 57;

// base plate on four feet
export const BASE: Plan = { x: -160, y: -78, w: 272, d: 156, r: 9 };
export const BASE_H = 9;
export const FOOT_H = 5;

// the slate and the area of it that stands for the canvas
export const SLATE: Plan = { x: -132, y: -50, w: 140, d: 96, r: 5 };
export const SLATE_TOP = 6;
export const WRITE: Plan = { x: -124, y: -42, w: 124, d: 80, r: 2 };
export const KPX = CANVAS_W / WRITE.w;                       // canvas px per world unit
export const STRIP_X: Plan = { x: WRITE.x, y: 39.6, w: WRITE.w, d: 4.8, r: 0.8 };   // crop ruler, front margin
export const STRIP_Y: Plan = { x: 1.6, y: WRITE.y, w: 4.8, d: WRITE.d, r: 0.8 };    // crop ruler, right margin
export const STRIP_TOP = SLATE_TOP + 0.6;

// gantry: two rails, a bridge that rides them carrying the scan head
export const RAIL_BACK: Plan = { x: -150, y: -67, w: 178, d: 7, r: 1.5 };
export const RAIL_FRONT: Plan = { x: -150, y: 52, w: 178, d: 7, r: 1.5 };
export const RAIL_H = 6;
export const BRIDGE_PARK = -142;
export const BRIDGE_END = 6;
export const UPRIGHT_TOP = 46;
export const BEAM_H = 7;
export const HEAD_Z = 16;
export const HEAD_H = 10;

// the stylus and its dock
export const DOCK: Plan = { x: 13, y: -60, w: 14, d: 14, r: 3 };
export const DOCK_H = 5;
export const DOCK_AT: Point3 = [DOCK.x + DOCK.w / 2, DOCK.y + DOCK.d / 2, DOCK_H];
export const PEN_LEN = 37;

// the printer
export const BODY: Plan = { x: 36, y: -40, w: 64, d: 76, r: 4 };
export const BODY_H = 30;
export const LID: Plan = { x: 37.5, y: -38.5, w: 61, d: 73, r: 3 };
export const LID_TOP = 33;
export const PAPER_Y = 10;
export const PAPER_X0 = 48;
export const PAPER_W = 40;
export const PAPER_H = 30;

export const P = fitProjection(
    [
        ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
        ...boxCorners({ x: BRIDGE_PARK - 7, y: -69, w: BRIDGE_END - BRIDGE_PARK + 14, d: 131, r: 0 }, 0, UPRIGHT_TOP + BEAM_H),
        [DOCK_AT[0], DOCK_AT[1], DOCK_H + PEN_LEN + 9],
        ...boxCorners({ x: PAPER_X0, y: PAPER_Y, w: PAPER_W, d: 1, r: 0 }, LID_TOP, LID_TOP + PAPER_RISE + 2),
    ],
    WIDTH,
    HEIGHT,
    { pad: 26, azimuth: AZIMUTH },
);

export const at = (point: Point3): Flat => iso(point, P);

// canvas px → the world point on the slate's writing surface
export const onSlate = ([u, v]: [number, number], z = SLATE_TOP): Point3 => [WRITE.x + u / KPX, WRITE.y + v / KPX, z];

