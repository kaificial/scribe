// The bench's static drawing, as JSX built once at module load.
// Parts are listed back to front, so nearer parts draw over farther ones.

import { Dots, Line, Solid, Wire } from '../../iso/react/draw';
import { BASE_ART, BRIDGE_BACK, CABLE, DOCK_ART, PEN_ART, PRINTER_ART, RAIL_ART, RIDER_ART, SLATE_ART } from './geometry';

export const BASE = (
    <g key="base">
        <path className="iso-halo" d={BASE_ART.halo} />
        {BASE_ART.feet.map((parts, i) => (
            <g key={i}>
                {parts.map((paths, part) => <Solid key={part} paths={paths} tone={part ? 'mid' : 'lo'} />)}
            </g>
        ))}
        <Solid paths={BASE_ART.slab} tone="mid" />
        <Line d={BASE_ART.groove} tone="lo" />
        <Line d={BASE_ART.screwRings} tone="lo" />
        <Dots points={BASE_ART.screws} size={0.5} tone="mid" />
        <Solid paths={BASE_ART.label} tone="lo" crease="none" />
        <Line d={BASE_ART.labelLine} tone="faint" />
        <Line d={BASE_ART.labelRule} tone="lo" free />
        <Dots points={BASE_ART.labelScrews} size={0.45} tone="mid" />
    </g>
);

export const RAIL_BACK = (
    <g key="rail-back">
        <Solid paths={RAIL_ART.back} tone="mid" inner={<Line d={RAIL_ART.backSeam} tone="faint" />} />
        <Dots points={RAIL_ART.backScrews} size={0.45} tone="mid" />
        {RAIL_ART.backStops.map((paths, i) => <Solid key={i} paths={paths} tone="mid" />)}
    </g>
);

export const DOCK = (
    <g key="dock">
        <Solid paths={DOCK_ART.block} tone="mid" />
        <Line d={DOCK_ART.seat} tone="lo" />
        <Line d={DOCK_ART.seatInner} tone="faint" />
        <Dots points={DOCK_ART.screws} size={0.45} tone="mid" />
    </g>
);

export const BRIDGE_A = (
    <g key="bridge-a">
        <Solid paths={BRIDGE_BACK.carriage} tone="mid" />
        <Dots points={BRIDGE_BACK.carScrews} size={0.45} tone="mid" />
        <Solid paths={BRIDGE_BACK.upright} tone="mid" inner={<Line d={BRIDGE_BACK.uprightSeam} tone="faint" />} />
    </g>
);

export const SLATE_BODY = (
    <g key="slate">
        <path className="iso-halo" d={SLATE_ART.halo} />
        <Solid paths={SLATE_ART.body} tone="mid" inner={<Line d={SLATE_ART.seam} tone="faint" />} />
        <Line d={SLATE_ART.field} tone="faint" />
        <Dots points={SLATE_ART.grid} size={0.32} tone="faint" />
        <Dots points={SLATE_ART.screws} size={0.5} tone="mid" />
        <Solid paths={SLATE_ART.stripX} tone="lo" crease="none" />
        <Solid paths={SLATE_ART.stripY} tone="lo" crease="none" />
        <Line d={SLATE_ART.edges} tone="lo" />
        <Line d={SLATE_ART.ticksMinor} tone="lo" />
        <Line d={SLATE_ART.ticksMajor} tone="mid" />
        <Solid paths={SLATE_ART.connector} tone="mid" />
        <Line d={SLATE_ART.connectorFace} tone="lo" />
    </g>
);

export const RAIL_FRONT = (
    <g key="rail-front">
        <Solid paths={RAIL_ART.front} tone="mid" inner={<Line d={RAIL_ART.frontSeam} tone="faint" />} />
        <Line d={RAIL_ART.ruleEdge} tone="faint" />
        <Line d={RAIL_ART.ticksMinor} tone="lo" />
        <Line d={RAIL_ART.ticksMajor} tone="mid" />
        {RAIL_ART.frontStops.map((paths, i) => <Solid key={i} paths={paths} tone="mid" />)}
    </g>
);

export const RIDER_X = (
    <g data-part="jaws">
        <Solid paths={RIDER_ART.x} tone="hi" />
        <Line d={RIDER_ART.xIndex} tone="hi" />
    </g>
);
export const RIDER_Y = (
    <g data-part="jaws">
        <Solid paths={RIDER_ART.y} tone="hi" />
        <Line d={RIDER_ART.yIndex} tone="hi" />
    </g>
);

export const PEN = (
    <g key="pen-art" data-part="pen">
        {PEN_ART.parts.map((part, i) => (
            <Solid key={i} paths={part.paths} tone={part.tone} inner={i === 2 ? <Line d={PEN_ART.grip} tone="faint" /> : i === 4 ? <Line d={PEN_ART.barrelSeams} tone="faint" /> : undefined} />
        ))}
        <Solid paths={PEN_ART.clip} tone="mid" />
        <Solid paths={PEN_ART.button} tone="hi" />
    </g>
);

export const CABLE_ART = <Wire key="cable" from={CABLE.from} to={CABLE.to} via={CABLE.via} tone="lo" size={0.9} />;

export const PRINTER_BODY = (
    <g key="printer-body">
        <path className="iso-halo" d={PRINTER_ART.halo} />
        <Solid paths={PRINTER_ART.jack} tone="mid" />
        <Dots points={PRINTER_ART.jackScrew} size={0.5} tone="mid" />
        <Solid paths={PRINTER_ART.body} tone="mid" inner={<Line d={PRINTER_ART.plinth} tone="faint" />} />
        <Line d={PRINTER_ART.vents} tone="lo" />
        <Line d={PRINTER_ART.sideVents} tone="lo" />
        <Dots points={PRINTER_ART.sideScrews} size={0.45} tone="mid" />
        <Solid paths={PRINTER_ART.plate} tone="lo" crease="none" />
        <Line d={PRINTER_ART.plateRule} tone="lo" free />
        <Dots points={PRINTER_ART.plateScrews} size={0.4} tone="mid" />
        <Solid paths={PRINTER_ART.lid} tone="mid" />
        <Dots points={PRINTER_ART.lidScrews} size={0.45} tone="mid" />
        <path className="sb-void" d={PRINTER_ART.slotVoid} />
        <Line d={PRINTER_ART.slot} tone="lo" />
        <Solid paths={PRINTER_ART.reelFlange} tone="mid" />
        <Solid paths={PRINTER_ART.reelRoll} tone="hi" crease="lo" />
        <Line d={PRINTER_ART.reelLayers} tone="faint" />
        <Solid paths={PRINTER_ART.reelHub} tone="mid" />
        <Line d={PRINTER_ART.ledRing} tone="faint" />
        <g data-part="led">
            <Solid paths={PRINTER_ART.led} tone="hi" />
        </g>
    </g>
);

export const KNOB = (
    <g key="knob">
        <Solid paths={PRINTER_ART.knob} tone="mid" inner={<><Line d={PRINTER_ART.knobKnurl} tone="faint" /><Line d={PRINTER_ART.knobBand} tone="faint" /></>} />
    </g>
);

export const LABEL =
    'A transcription bench that shows how Scribe turns handwriting into LaTeX. A stylus writes an integral onto a slate that stands for the drawing canvas. ' +
    'Sliding jaws on two rulers close on the ink plus a 40 pixel margin, the crop. A scan head on a gantry sweeps across the slate and the grey ink turns solid black, the threshold. ' +
    'A small printer then feeds out a slip with the LaTeX printed on it.';
