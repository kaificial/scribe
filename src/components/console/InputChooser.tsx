import type { ChangeEventHandler, ReactNode, RefObject } from 'react';
import { DrawVignette, UploadVignette } from '../figures/vignettes/Vignettes';

const CARD = 'group relative text-left rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-[0_12px_32px_-16px_rgba(15,23,42,0.25)] transition-all';

/** The shared inside of an input card: a vignette, a title, a line of copy and a call to action. */
function CardBody({ art, title, body, action }: { art: ReactNode; title: string; body: string; action: string }) {
    return (
        <>
            <div className="m-2 rounded-lg bg-gradient-to-b from-zinc-50 to-white px-6 pt-4">
                {art}
            </div>
            <div className="px-6 pb-6 pt-3">
                <h3 className="font-serif text-[26px] leading-tight tracking-[-0.02em] text-zinc-950 mb-1">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-5">
                    {body}
                </p>
                <span className="text-sm font-medium text-brand flex items-center gap-1.5">
                    {action} <span className="ui-arrow">→</span>
                </span>
            </div>
        </>
    );
}

interface Props {
    onDraw: () => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onFileChange: ChangeEventHandler<HTMLInputElement>;
}

/** The two ways in: open the drawing canvas, or upload / paste an image. */
export function InputChooser({ onDraw, fileInputRef, onFileChange }: Props) {
    return (
        <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={onDraw}
                    className={`${CARD} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
                >
                    <CardBody
                        art={<DrawVignette />}
                        title="Draw a formula"
                        body="Sketch equations directly on the canvas with your mouse or touchscreen."
                        action="Open canvas"
                    />
                </button>

                <label className="group relative text-left cursor-pointer rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-[0_12px_32px_-16px_rgba(15,23,42,0.25)] transition-all focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand">
                    <input ref={fileInputRef} type="file" className="sr-only" accept="image/*" onChange={onFileChange} />
                    <CardBody
                        art={<UploadVignette />}
                        title="Upload or paste"
                        body="Drop in a photo, or paste (Ctrl+V) straight from your clipboard."
                        action="Choose a file"
                    />
                </label>
            </div>
        </div>
    );
}
