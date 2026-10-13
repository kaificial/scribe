import * as React from 'react';
import { axisVector, planOutline, translateAlong } from '../../iso/iso-kit';
import { Dots, FaceText, IsoFigure, Line, Plate, Solid } from '../../iso/react/draw';
import { follow, useInView, useLoop, useReadout } from '../../iso/react/live';
import {
    BASE, BRIDGE_A, CABLE_ART, DOCK, KNOB, LABEL, PEN, PRINTER_BODY, RAIL_BACK, RAIL_FRONT, RIDER_X, RIDER_Y, SLATE_BODY,
} from './art';
import { BRIDGE_FRONT, INK_FULL, KNOB_TOP, PAPER_ART, PAPER_CLIP, REEL_HUB_TOP } from './geometry';
import {
    CANVAS_H, CANVAS_W, CROP_BOX, CROP_H, CROP_PAD, CROP_W, CYCLE, LATEX, PAPER_RISE, PHASES, PHASE_WORDS, SENT, STOPS,
    THRESHOLD, phaseWindow, poseAt, readoutOf, type Phase, type Pose,
} from './model';
import { DEFAULT_WORK_BOX, fitOnCanvas, jawPositions, lerp, lerp3, partialInk, pointerAt, round3, scannedRegion, type Box } from './frame';
import { BRIDGE_END, BRIDGE_PARK, DOCK_AT, HEIGHT, KPX, P, SLATE, SLATE_TOP, WIDTH, at, onSlate } from './view';
import './bench.css';

const EX = axisVector(P, [1, 0, 0]);
const EY = axisVector(P, [0, 1, 0]);

// which part carries the lit accent in each phase
const LIT: Record<Phase, string | null> = {
    ready: null, reach: 'pen', write: 'pen', park: 'pen', crop: 'jaws', scan: null, print: 'led', done: null, clear: null,
};

const DONE = phaseWindow('done');
const CROP_AT = phaseWindow('crop').at;
const CLEAR_AT = phaseWindow('clear').at;
const SCANNED_PHASES: Phase[] = ['print', 'done', 'clear'];
const STILL_TOUR = DONE.at + 0.6;              // the still frame shown under reduced motion
const STILL_WORK = phaseWindow('print').at;
const RESUME_TOUR_MS = 3600;

type Refs = ReturnType<typeof useBenchRefs>;

function useBenchRefs() {
    return {
        bridgeA: React.useRef<SVGGElement>(null),
        bridgeB: React.useRef<SVGGElement>(null),
        lamp: React.useRef<SVGPathElement>(null),
        lens: React.useRef<SVGPathElement>(null),
        inkRaw: React.useRef<SVGPathElement>(null),
        raw: React.useRef<SVGGElement>(null),
        crisp: React.useRef<SVGGElement>(null),
        scan: React.useRef<SVGPathElement>(null),
        crop: React.useRef<SVGPathElement>(null),
        jawLeft: React.useRef<SVGGElement>(null),
        jawRight: React.useRef<SVGGElement>(null),
        jawTop: React.useRef<SVGGElement>(null),
        jawBottom: React.useRef<SVGGElement>(null),
        pen: React.useRef<SVGGElement>(null),
        paper: React.useRef<SVGGElement>(null),
        spoke: React.useRef<SVGPathElement>(null),
        knob: React.useRef<SVGPathElement>(null),
    };
}

/** Loads the processed image to learn its size, then fits it onto the slate. */
function useSlateImage(image: string | null, enabled: boolean) {
    const [size, setSize] = React.useState<{ w: number; h: number } | null>(null);
    React.useEffect(() => {
        if (!enabled || !image) {
            setSize(null);
            return;
        }
        const img = new Image();
        img.onload = () => setSize({ w: img.naturalWidth, h: img.naturalHeight });
        img.src = image;
    }, [enabled, image]);

    return React.useMemo(() => {
        if (!size) return null;
        const box = fitOnCanvas(size.w, size.h);
        const [ox, oy] = at(onSlate([box.minX, box.minY], SLATE_TOP + 0.05));
        const sx = (box.maxX - box.minX) / KPX / size.w;
        const sy = (box.maxY - box.minY) / KPX / size.h;
        const matrix = `matrix(${EX[0] * sx} ${EX[1] * sx} ${EY[0] * sy} ${EY[1] * sy} ${ox} ${oy})`;
        return { size, box, matrix };
    }, [size]);
}

// ---- drawing one frame -----------------------------------------------------------------

const setAttr = (ref: React.RefObject<Element | null>, name: string, value: string) => ref.current?.setAttribute(name, value);

function drawInk(r: Refs, pose: Pose, t: number, working: boolean) {
    if (!working) setAttr(r.inkRaw, 'd', partialInk(pose.ink) || 'M0 0');
    setAttr(r.raw, 'opacity', String(working ? 1 : round3(pose.inkAlpha)));
    // in work mode the scanned image fades out as the loop clears
    const crispAlpha = working ? 1 - Math.max(0, (t - CLEAR_AT) / 0.8) : pose.inkAlpha;
    setAttr(r.crisp, 'opacity', String(round3(crispAlpha)));

    const bridgeX = lerp(BRIDGE_PARK, BRIDGE_END, pose.scan);
    const scannedTo = SCANNED_PHASES.includes(pose.phase) ? SLATE.x + SLATE.w : pose.phase === 'scan' ? bridgeX : SLATE.x;
    setAttr(r.scan, 'd', scannedRegion(scannedTo));
}

function drawCrop(r: Refs, pose: Pose, box: Box) {
    const jaws = jawPositions(box, pose.crop);
    setAttr(r.jawLeft, 'transform', translateAlong(P, [jaws.left, 0, 0]));
    setAttr(r.jawRight, 'transform', translateAlong(P, [jaws.right, 0, 0]));
    setAttr(r.jawTop, 'transform', translateAlong(P, [0, jaws.top, 0]));
    setAttr(r.jawBottom, 'transform', translateAlong(P, [0, jaws.bottom, 0]));
    const outline = { x: jaws.left, y: jaws.top, w: jaws.right - jaws.left, d: jaws.bottom - jaws.top, r: 0 };
    setAttr(r.crop, 'd', planOutline(outline, SLATE_TOP + 0.05, P, 2));
    setAttr(r.crop, 'opacity', String(round3(Math.min(1, pose.crop * 4))));
}

function drawGantry(r: Refs, pose: Pose) {
    const bridge = translateAlong(P, [lerp(BRIDGE_PARK, BRIDGE_END, pose.scan), 0, 0]);
    setAttr(r.bridgeA, 'transform', bridge);
    setAttr(r.bridgeB, 'transform', bridge);
    setAttr(r.lamp, 'opacity', String(round3(pose.lamp)));
    setAttr(r.lens, 'data-tone', pose.lamp > 0.5 ? 'lit' : 'lo');
}

function drawPen(r: Refs, pose: Pose, working: boolean) {
    // in work mode the pen stays in its dock
    const onPaper = pose.pen && !working ? onSlate(pose.pen) : DOCK_AT;
    const tip = lerp3(onPaper, DOCK_AT, working ? 1 : pose.penDock);
    tip[2] += working ? 0 : pose.penLift;
    setAttr(r.pen, 'transform', translateAlong(P, tip));
}

function drawPrinter(r: Refs, pose: Pose) {
    setAttr(r.paper, 'transform', translateAlong(P, [0, 0, PAPER_RISE * pose.tape]));
    setAttr(r.paper, 'opacity', String(round3(pose.tapeAlpha)));
    setAttr(r.spoke, 'd', pointerAt(REEL_HUB_TOP, 3.2, pose.tape * Math.PI * 1.6));
    setAttr(r.knob, 'd', pointerAt(KNOB_TOP, 4.2, 0.6 + pose.tape * Math.PI * 2.8));
}

/** Moves the lit accent to the part at work, and updates the slider's spoken value. */
function markPhase(root: HTMLElement, phase: Phase, working: boolean) {
    root.dataset.phase = phase;
    root.querySelectorAll('[data-part] > .iso-solid').forEach((node) => node.removeAttribute('data-lit'));
    const lit = LIT[phase];
    if (lit) root.querySelectorAll(`[data-part="${lit}"] > .iso-solid`).forEach((node) => node.setAttribute('data-lit', ''));
    if (!working) root.setAttribute('aria-valuetext', PHASE_WORDS[phase]);
}

/** The time to jump to for a navigation key, or null for other keys. Lands inside the phase, not on its first frame. */
function keyTarget(key: string, now: number): number | null {
    let goal: number;
    if (key === 'ArrowRight') goal = STOPS.find((s) => s > now + 0.05) ?? DONE.at;
    else if (key === 'ArrowLeft') goal = [...STOPS].reverse().find((s) => s < now - 0.05) ?? 0;
    else if (key === 'Home') return 0;
    else if (key === 'End') return DONE.at + 0.4;
    else return null;
    if (goal === 0) return 0;
    const until = PHASES.find((p) => p.at === goal)?.until ?? goal;
    return goal + Math.min(0.9, until - goal);
}

// ---- component ---------------------------------------------------------------------------

export interface BenchProps {
    /** 'tour' explains the pipeline on its own; 'work' loops crop, scan and print while the app processes */
    mode?: 'tour' | 'work';
    /** in work mode, the image being processed, shown on the slate */
    image?: string | null;
    /** in work mode, the readout text (real progress or status) */
    status?: string;
    fig?: string;
    title?: string;
    hint?: string;
    caption?: React.ReactNode;
    legend?: boolean;
    /** called whenever the machine moves into a new phase */
    onPhase?: (phase: Phase) => void;
}

export function TranscriptionBench({ mode = 'tour', image = null, status = '', fig = 'Fig 1', title = 'Ink to LaTeX', hint, caption, legend = true, onPhase }: BenchProps) {
    const working = mode === 'work';
    const { anchor, say } = useReadout<HTMLDivElement>();
    const visible = useInView(anchor);
    const uid = React.useId().replace(/:/g, '');
    const scanId = `sb-scan-${uid}`;
    const paperId = `sb-paper-${uid}`;
    const refs = useBenchRefs();
    const slateImage = useSlateImage(image, working);

    // the loop reads the latest props through refs, so it never restarts
    const cropBox: Box = working ? slateImage?.box ?? DEFAULT_WORK_BOX : CROP_BOX;
    const latest = React.useRef({ cropBox, status, onPhase });
    latest.current = { cropBox, status, onPhase };

    const state = React.useRef({ t: working ? CROP_AT : 0, goal: 0, touring: true, phase: '' as Phase | '', resume: 0 });

    const draw = React.useCallback((t: number) => {
        const pose = poseAt(t);
        drawInk(refs, pose, t, working);
        drawCrop(refs, pose, latest.current.cropBox);
        drawGantry(refs, pose);
        drawPen(refs, pose, working);
        drawPrinter(refs, pose);
        say(working ? latest.current.status : readoutOf(t));

        if (pose.phase !== state.current.phase) {
            state.current.phase = pose.phase;
            latest.current.onPhase?.(pose.phase);
            if (anchor.current) markPhase(anchor.current, pose.phase, working);
        }
    }, [working, say, anchor]);

    const kick = useLoop((dt, calm) => {
        const s = state.current;
        if (working) {
            // loop crop, scan, print and clear until the work is done
            s.t = calm ? STILL_WORK : s.t + dt;
            if (s.t >= CYCLE) s.t = CROP_AT;
            draw(s.t);
            return !calm;
        }
        if (s.touring) {
            s.t = calm ? STILL_TOUR : (s.t + dt) % CYCLE;
            draw(s.t);
            return !calm;
        }
        s.t = follow(s.t, s.goal, dt, 0.22, calm);
        draw(s.t);
        return s.t !== s.goal;
    }, visible);

    // paint the first frame before the loop starts
    React.useLayoutEffect(() => { draw(state.current.t); }, [draw]);
    React.useEffect(() => { if (working) say(status); }, [working, status, say]);
    React.useEffect(() => () => window.clearTimeout(state.current.resume), []);

    /** The reader takes control: stop the tour, ease to `goal`, resume the tour after a pause. */
    const takeOver = (goal: number) => {
        const s = state.current;
        s.touring = false;
        s.goal = Math.max(0, Math.min(DONE.until - 0.01, goal));
        window.clearTimeout(s.resume);
        s.resume = window.setTimeout(() => { s.touring = true; kick(); }, RESUME_TOUR_MS);
        kick();
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (working || e.pointerType === 'touch') return;
        const box = e.currentTarget.getBoundingClientRect();
        takeOver(((e.clientX - box.left) / box.width) * DONE.until);
    };

    const onPointerLeave = () => {
        if (!working && !state.current.touring) takeOver(state.current.goal);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (working) return;
        const now = state.current.touring ? state.current.t : state.current.goal;
        const goal = keyTarget(e.key, now);
        if (goal === null) return;
        e.preventDefault();
        takeOver(goal);
    };

    const showImage = working && slateImage;
    const imageProps = slateImage && {
        href: image ?? undefined,
        width: slateImage.size.w,
        height: slateImage.size.h,
        preserveAspectRatio: 'none',
        transform: slateImage.matrix,
    };

    const defaultCaption = (
        <>
            The stylus writes ∫₀¹ x² dx on a slate that stands for an {CANVAS_W} × {CANVAS_H} px canvas. The jaws close on the ink plus {CROP_PAD} px
            ({CROP_W} × {CROP_H}), the scan head turns everything darker than {THRESHOLD} solid black, the crop is scaled to {SENT.width} × {SENT.height},
            and the printer types <code>{LATEX}</code>.
        </>
    );

    return (
        <Plate
            fig={fig}
            title={title}
            hint={hint ?? (working ? 'Working' : 'Hover to scrub · ← →')}
            readout={working ? status : readoutOf(0)}
            keys={legend ? [
                { mark: 'lit', label: 'The part at work' },
                { mark: 'dotted', label: `Crop box, ink + ${CROP_PAD} px` },
                { mark: 'edge', label: `Ink after the ${THRESHOLD} threshold` },
            ] : []}
            caption={legend ? caption ?? defaultCaption : undefined}
        >
            <div
                ref={anchor}
                className="sb"
                data-mode={mode}
                tabIndex={working ? -1 : 0}
                role={working ? 'group' : 'slider'}
                aria-label={working ? 'The transcription bench while your image is processed' : 'Transcription bench. Move across it or use the arrow keys to step through drawing, cropping, scanning and printing.'}
                aria-valuemin={working ? undefined : 0}
                aria-valuemax={working ? undefined : Math.round(DONE.until)}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onKeyDown={onKeyDown}
            >
                <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
                    <defs>
                        <clipPath id={scanId} clipPathUnits="userSpaceOnUse"><path ref={refs.scan} d="M0 0Z" /></clipPath>
                        <clipPath id={paperId} clipPathUnits="userSpaceOnUse"><path d={PAPER_CLIP} /></clipPath>
                    </defs>
                    {BASE}
                    {RAIL_BACK}
                    {DOCK}
                    <g ref={refs.bridgeA}>{BRIDGE_A}</g>
                    {SLATE_BODY}
                    <g ref={refs.raw} className="sb-raw">
                        {showImage ? <image className="sb-image" {...imageProps} /> : <path ref={refs.inkRaw} className="sb-ink" d="M0 0" />}
                    </g>
                    <g ref={refs.crisp} clipPath={`url(#${scanId})`}>
                        {showImage ? <image className="sb-image" data-crisp="" {...imageProps} /> : <path className="sb-ink" data-crisp="" d={INK_FULL} />}
                    </g>
                    <path ref={refs.crop} className="iso-line" data-tone="hi" data-dotted="" d="" opacity={0} />
                    <g ref={refs.jawLeft}>{RIDER_X}</g>
                    <g ref={refs.jawRight}>{RIDER_X}</g>
                    <g ref={refs.jawTop}>{RIDER_Y}</g>
                    <g ref={refs.jawBottom}>{RIDER_Y}</g>
                    {RAIL_FRONT}
                    <g ref={refs.bridgeB}>
                        <path ref={refs.lamp} className="iso-line sb-lamp" data-tone="lit" d={BRIDGE_FRONT.lamp} opacity={0} />
                        <Solid paths={BRIDGE_FRONT.head} tone="hi" inner={<Line d={BRIDGE_FRONT.headSeam} tone="faint" />} />
                        <path ref={refs.lens} className="iso-line" data-tone="lo" d={BRIDGE_FRONT.lens} />
                        <Dots points={BRIDGE_FRONT.headScrews} size={0.45} tone="mid" />
                        {BRIDGE_FRONT.hangerCollars.map((paths, i) => <Solid key={`c${i}`} paths={paths} tone="mid" />)}
                        {BRIDGE_FRONT.hangers.map((paths, i) => <Solid key={`h${i}`} paths={paths} tone="mid" crease="none" />)}
                        <Solid paths={BRIDGE_FRONT.carriage} tone="mid" />
                        <Dots points={BRIDGE_FRONT.carScrews} size={0.45} tone="mid" />
                        <Line d={BRIDGE_FRONT.pointer} tone="hi" />
                        <Solid paths={BRIDGE_FRONT.upright} tone="mid" inner={<Line d={BRIDGE_FRONT.uprightSeam} tone="faint" />} />
                        <Solid paths={BRIDGE_FRONT.beam} tone="mid" />
                        <Line d={BRIDGE_FRONT.beamGroove} tone="faint" />
                        <Dots points={BRIDGE_FRONT.beamScrews} size={0.45} tone="mid" />
                    </g>
                    <g ref={refs.pen}>{PEN}</g>
                    {CABLE_ART}
                    {PRINTER_BODY}
                    <path ref={refs.spoke} className="iso-line" data-tone="mid" d="" />
                    <Dots points={[at(REEL_HUB_TOP)]} size={0.55} tone="hi" />
                    <g clipPath={`url(#${paperId})`}>
                        <g ref={refs.paper} data-part="paper">
                            <Solid paths={PAPER_ART.sheet} tone="mid" />
                            <Line d={PAPER_ART.header} tone="lo" free />
                            <Line d={PAPER_ART.rule} tone="faint" />
                            {working ? (
                                <Line d={PAPER_ART.pending} tone="lo" free />
                            ) : (
                                <g>
                                    <FaceText transform={PAPER_ART.text} size={3.1} tone="hi">{LATEX}</FaceText>
                                </g>
                            )}
                            <Line d={PAPER_ART.footer} tone="lo" free />
                        </g>
                    </g>
                    {KNOB}
                    <path ref={refs.knob} className="iso-line" data-tone="hi" d="" />
                </IsoFigure>
            </div>
        </Plate>
    );
}

export type { Phase };
