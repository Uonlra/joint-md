# Joint MD

A **local-only** client that joins multiple Markdown source files into one **Merged Document**, previews it with GitHub Flavored Markdown, and supports **Export Markdown** or **Print to PDF** (browser print → Save as PDF). There is no backend, account system, or cloud storage.

## Features

- Drag or pick multiple `.md` / `.markdown` files into a **File Queue**
- Reorder (drag, up/down), remove, and jump to a source’s start in the preview
- **Join Mode**: Plain (blank lines), Rule (horizontal rule), Filename Heading
- Live GFM preview (tables, code, blockquotes, task lists, …)
- **Export Markdown** download of the merged result
- **Print to PDF** via the browser print dialog
- **Reader Mode**, table of contents (H1–H3), font size, soft paper tint
- **Reader Preferences** and **Reading Progress** in browser storage (not file bodies)
- Installable **PWA** (standalone window; app shell cache only)

## Stack

- React 19 + TypeScript + Vite
- `vite-plugin-pwa`
- `react-markdown` + `remark-gfm`
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

1. Add Markdown files to the File Queue (left).
2. Set order and **Join Mode**; set **Export Name**.
3. Preview the Merged Document (right).
4. Click a queue file name to scroll the preview to that source’s start.
5. **Export Markdown** or **Print to PDF** (then choose “Save as PDF” in the system dialog).
6. Use **Reader Mode** for immersive reading (TOC, font size, paper tint).

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

- The service worker caches the **app shell** only (HTML/JS/CSS/fonts/icons). It does **not** store Source File content.
- Closing or reloading clears the File Queue (**Session Content**). Preferences and reading progress stay in **Browser Memory** (`localStorage`).
- PWA is disabled in `npm run dev`; use `build` + `preview` to verify install.

## Project layout

```text
joint-md/
├─ src/
│  ├─ workbench/     # Workbench orchestration, export, reading progress
│  ├─ components/    # File queue & preview UI
│  ├─ pages/         # MergePage adapter
│  ├─ utils/         # join, TOC, source acceptance
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
- Resolving relative assets against each source file’s original path

## License

Private project (`private: true` in `package.json`) unless otherwise stated.
