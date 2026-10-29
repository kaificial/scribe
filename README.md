<img src="/assets/readme/banner.svg" width="100%" alt="Scribe: write the math by hand, paste it as LaTeX. A handwritten quadratic formula, the LaTeX Scribe returns for it, and how that renders.">

![Scribe](/assets/image.png)

I got tired of retyping equations from my notes so I built this. Draw an equation, take a picture of one, or paste a screenshot of your notebook, and Scribe gives you LaTeX you can drop straight into Overleaf, Notion, your thesis, etc. You see a live preview of the result and can fix it by hand if the model gets something slightly wrong.

There's nothing to install. It's a website with a canvas and a model behind it.

**Content:** [What it does](#what-it-does) · [How it works](#how-it-works) · [Getting started](#getting-started) · [A tour of the code](#a-tour-of-the-code) · [Privacy](#privacy) · [Credits](#credits)

---

## What it does

- **Three ways in.** Draw on the canvas, upload a photo, or press `ctrl+v` with a screenshot on your clipboard.
- **Two models, your choice.** **Local** runs in your browser and keeps everything on your machine. **Cloud** sends the image to Claude and is instant on any device. 
- **Cleanup before reading.** Drawings are cropped and then shrunk before the model sees them. 
- **Live preview.** The LaTeX is rendered with KaTeX as you edit it so you can fix mistakes and see the result straight away.
- **History.** Every conversion is saved in your browser so you can copy it again later.
- **A forgiving canvas.** It has undo, redo, an eraser and adjustable stroke sizes.

## How it works

Every conversion goes through the same four steps. The homepage shows them as an animated figure.

<img src="/assets/readme/pipeline.svg" width="100%" alt="The four steps. 1 Write: draw, upload or paste. 2 Crop: trim with a 40 px border. 3 Clean: pixels darker than 180 turn black, the rest white, scaled to 512 px at most. 4 Transcribe: Texify in your browser or Claude in the cloud.">

Uploaded and pasted images skip the crop and clean steps. They're only scaled down to 512 px. Before anything is sent to a model, Scribe shows you the exact image it's about to send and asks you to confirm. 

### Local or Cloud

|                                | Local                                                                 | Cloud                                         |
| ------------------------------ | --------------------------------------------------------------------- | --------------------------------------------- |
| Model                          | [`Xenova/texify`](https://huggingface.co/Xenova/texify)               | Claude Sonnet (Anthropic)                     |
| Runs on                        | Your browser, through [Transformers.js](https://huggingface.co/docs/transformers.js) and WebGPU, in a Web Worker | A small Vercel serverless function (`api/convert.ts`) |
| Does the image leave your device? | No                                                                 | Yes, over HTTPS                               |
| Is the image stored?           | Never                                                                 | Never                                         |
| First run                      | A one-time model download of a few hundred MB, then it's cached       | Instant                                       |
| Chosen by default when         | Your browser supports WebGPU                                          | It doesn't                                    |

You can switch between them at any time with the toggle at the top of the console.

## Getting started

### What you need

- Node.js 20 or newer, and npm
- An [Anthropic API key](https://console.anthropic.com/settings/keys), but only if you want Cloud mode to work locally. Local mode doesnt need a key

### Set it up

```bash
git clone https://github.com/kaificial/Scribe.git
cd Scribe
npm install
```

For Cloud mode, create a `.env.local` file in the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### Run it

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The dev server also runs the `/api/convert` function, so Cloud mode works without `vercel dev` (see [`vite.config.ts`](vite.config.ts)).

> The first time you use Local mode, your browser downloads the model. Give it a minute depending on your networks download speed then after that it's cached and starts instantly.

### Other commands

| Command              | What it does                                |
| -------------------- | ------------------------------------------- |
| `npm test`           | Runs the test suite once (Vitest + jsdom)   |
| `npm run test:watch` | Re-runs the tests as you edit               |
| `npm run build`      | Builds the production site into `dist/`     |
| `npm run preview`    | Serves that production build locally        |

## A tour of the code

Scribe is a single-page React app built with Vite, plus one serverless function:

```
api/
  convert.ts            The Cloud endpoint. It validates the image, rate-limits by IP, and asks Claude for LaTeX.

src/
  main.tsx, App.tsx     Entry point. App lays out the homepage sections in order.
  types.ts              Shared types: app states, history items, Local or Cloud.

  components/
    FormulaTool.tsx     The converter itself. It runs the whole draw → crop → convert → result flow.
    canvas/             The drawing canvas and its toolbar (pen, eraser, stroke size, undo/redo).
    console/            The Local/Cloud switch and the "draw or upload" cards.
    result/             The result view: editable LaTeX and a live KaTeX preview.
    history/            The gallery of past conversions.
    home/               Homepage sections: header, hero, how-it-works, models, privacy, citation, footer.
                        The words live in content.ts, so copy changes don't touch the layout.
    figures/bench/      The animated "Figure 1" on the homepage. It's a working model of the real pipeline,
                        using the same crop, threshold and resize numbers.
    figures/vignettes/  The small isometric drawings on the input cards.
    iso/                A tiny isometric drawing kit used by the figures (MIT, see its LICENSE).
    ui/                 Small shared pieces: logo, modal, error boundary, and micro.tsx (scroll reveals,
                        smooth scrolling, the copy button and other small interactions).
    InteractiveBackground.tsx   The dot grid behind the page that reacts to the pointer.

  hooks/                React hooks: WebGPU detection, canvas undo history, image input,
                        the model worker and saved history.
  services/
    localAI.ts          Starts the Web Worker and passes messages to and from it.
    ocr-worker.ts       Runs inside the worker. It loads Texify and transcribes images off the main thread.
    cloudAI.ts          Calls /api/convert with a 30s timeout and turns errors into plain messages.
    sanitizeLatex.ts    Removes code fences and $…$ wrappers from model output, and catches garbled output.
    storage.ts          Saves history in IndexedDB (via idb).
    webgpu.ts           Checks whether the browser can run Local mode.
  utils/
    imageProcessing.ts  The pixel math: threshold, find the ink's bounding box, scale to fit.
  styles/index.css      Tailwind plus the site's own styles: type, figures, animations, reduced-motion fallbacks.
```

### Following one conversion through the code

<img src="/assets/readme/architecture.svg" width="100%" alt="One conversion, file by file: FormulaTool, imageProcessing, ConfirmationModal, then useOcrWorker picks a path. Local: localAI, ocr-worker, sanitizeLatex. Cloud: cloudAI, api/convert, Claude. Both end in ResultView, which saves to storage.">

1. **`FormulaTool`** gets a picture from the canvas, or from a file or paste through `useImageInput`.
2. For drawings, `getCroppedCanvas` uses the helpers in **`utils/imageProcessing.ts`** to crop, clean and scale the image.
3. A confirmation modal shows the exact image that's about to be sent.
4. **`useOcrWorker`** sends it to the chosen model:
   - **Local:** `localAI.ts` → `ocr-worker.ts`. Transformers.js runs Texify on WebGPU, and the output goes through `sanitizeLatex`.
   - **Cloud:** `cloudAI.ts` → `POST /api/convert` → Claude.
5. **`ResultView`** shows the LaTeX in an editable box with a live preview, and **`useTranscriptionHistory`** saves it to IndexedDB.

### Stack

| Layer          | Choice                                              |
| -------------- | --------------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite                          |
| Styling        | Tailwind CSS, plus hand-written CSS for the figures and animations |
| Local model    | Transformers.js (`Xenova/texify`), WebGPU, Web Worker |
| Cloud model    | Anthropic Claude API, through a Vercel function     |
| Math rendering | KaTeX                                               |
| Storage        | IndexedDB (via `idb`)                               |
| Tests          | Vitest, jsdom, Testing Library                      |
| Hosting        | Vercel                                              |

## Privacy

- **Local mode** never touches the network once the model is downloaded. The model runs in your browser.
- **Cloud mode** sends the cropped image to the server over HTTPS. Claude transcribes it and nothing is logged or kept.
- **History** is stored in your browser's IndexedDB and never leaves it. You can clear it from the history panel.

## Credits

- [Texify](https://github.com/VikParuchuri/texify) by Vik Paruchuri, and the [`Xenova/texify`](https://huggingface.co/Xenova/texify) port to run in the browser
- [Transformers.js](https://huggingface.co/docs/transformers.js) by Hugging Face
- [KaTeX](https://katex.org) for rendering
- [Claude](https://www.anthropic.com/claude) by Anthropic for Cloud mode
- The isometric kit in `src/components/iso` is MIT-licensed by Ryan. See its [LICENSE](src/components/iso/LICENSE).

## License

MIT. Do whatever you want with it. 

<img src="/assets/readme/wordmark.svg" width="100%" alt="Scribe">
