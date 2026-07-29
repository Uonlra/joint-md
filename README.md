# Joint MD

A **local-only** client that joins multiple Markdown source files into one **Merged Document**, or imports **EPUB** books for in-app reading. Preview uses GitHub Flavored Markdown (Markdown mode). Export **Markdown** or **Print to PDF** (browser print → Save as PDF). There is no backend, account system, or cloud storage.

## Features

- Drag or pick `.md` / `.markdown` / `.epub` into the queue (one kind per session — no mixed queue)
- **Markdown mode**
  - Reorder (drag, up/down), remove, jump to a source’s start in the preview
  - **Join Mode**: Plain (blank lines), Rule (horizontal rule), Filename Heading
  - Live GFM preview (tables, code, blockquotes, task lists, …)
  - **Export Markdown** download of the merged result
  - TOC (H1–H3) from the merged document
- **EPUB mode**
  - Parse EPUB in the browser (chapters + inlined assets for preview)
  - Reading queue; Join Mode / Export Markdown do not apply
  - **Print to PDF** of the rendered EPUB body (same browser print flow)
- Shared: **Print to PDF**, **Reader Mode**, font size, soft paper tint
- **Reader Preferences** and **Reading Progress** in browser storage (not file bodies)
- Size limits: Markdown **5 MB** / file, EPUB **50 MB** / file
- Installable **PWA** (standalone window; app shell cache only)

## Stack

- React 19 + TypeScript + Vite
- `vite-plugin-pwa`
- `react-markdown` + `remark-gfm`
- `fflate` (EPUB ZIP)
- `lucide-react`
- Browser File / Blob / `localStorage` / Drag and Drop APIs

## Requirements

Node.js **20+**

## Scripts

```bash
npm install
npm run dev       # development server
npm run build     # typecheck + production build (includes PWA assets)
npm run preview   # serve dist (use this to test PWA install)
npm run lint      # oxlint
npm test          # vitest
```

Dev server is usually at `http://127.0.0.1:5173`.

## Usage

### Markdown

1. Add `.md` / `.markdown` files to the File Queue (left).
2. Set order and **Join Mode**; set **Export Name**.
3. Preview the Merged Document (right).
4. Click a queue file name to scroll the preview to that source’s start.
5. **Export Markdown** or **Print to PDF** (then choose “Save as PDF”).
6. Use **Reader Mode** for immersive reading (TOC, font size, paper tint).

### EPUB

1. Add `.epub` file(s) only (clear the queue first if it already has Markdown).
2. Preview chapters in the right pane; use font size / paper tint / Reader Mode as needed.
3. **Print to PDF** if desired. **Export Markdown** is disabled in EPUB mode.

## Print to PDF

PDF uses the **browser print flow** (no headless Chromium or PDF library). After **Print to PDF**:

```text
Destination: Save as PDF
```

Selectable text is preserved better than screenshot-style PDF tools.

See `docs/adr/0001-print-to-pdf-via-browser.md`.

## Install as a PWA

1. `npm run build && npm run preview` (or host `dist` over **HTTPS** / `localhost`)
2. In a supported browser, use **Install app** / **Install Joint MD**
3. Launch from the desktop or app list (standalone window)

Notes:

- The service worker caches the **app shell** only (HTML/JS/CSS/fonts/icons). It does **not** store Source File or EPUB content.
- Closing or reloading clears the queue (**Session Content**). Preferences and reading progress stay in **Browser Memory** (`localStorage`).
- PWA is disabled in `npm run dev`; use `build` + `preview` to verify install.

## Project layout

```text
joint-md/
├─ src/
│  ├─ workbench/     # Workbench, merge/EPUB derive, export, reading progress
│  ├─ components/    # File queue & preview UI
│  ├─ pages/         # MergePage adapter
│  ├─ utils/         # join, TOC, source acceptance, EPUB parse, download/print
│  ├─ types/         # shared domain types
│  ├─ main.tsx       # entry + PWA registration
│  └─ index.css      # design tokens
├─ public/           # icons & PWA assets
├─ docs/             # agent docs & ADRs
├─ CONTEXT.md        # domain glossary
├─ package.json
└─ vite.config.ts
```

## Privacy

Files are read with the File API and held in page memory only. They are not uploaded to a Joint MD server. Reload/close clears source content; only small preferences and per-document scroll positions may remain in `localStorage`.

See `docs/adr/0002-local-only-no-server-file-processing.md`.

## Out of scope (v1)

- PDF → Markdown, OCR, faithful complex PDF layout
- Cloud storage, accounts, collaboration
- Server-side processing of user files
- Resolving relative assets against each Markdown source file’s original path
- Exporting EPUB as Markdown, or full EPUB authoring / re-packaging

## License

Private project (`private: true` in `package.json`) unless otherwise stated.
