# Countinghouse web

## Run
```
cd web && npm install && npx vite        # http://localhost:5190 (strictPort; 5173/5174 held by another project)
```
The Vite dev proxy sends `/api` to the Bun server at `http://localhost:4001` (see `vite.config.ts`).
"Ask Countinghouse" opens the QM chat at `http://localhost:8081` in a new tab.
Types come from `../shared/types.ts`. There is no mock layer: every screen fetches the real API and retries every 2s until it answers.

## Screens (hash routes)
- `#/overview`: cash, runway and zero-cash month, net burn, MRR/ARR; money in vs. out (12 months, hover tooltip); spend by category; cash by account; top vendors with sparklines; cash runway projection; an insights rail that links each item to the screen that resolves it.
- `#/transactions`: all 731 rows in one windowed list (fixed 56px rows; only the visible rows render). Search, month/category/source filters, flag chips with counts, and a detail rail with Mark reviewed (`POST /api/transactions/:id/review`) for Unusual and Needs review. On phones the detail opens as a bottom sheet. Supports `?q=`, `?flag=`, `?category=` deep links.
- `#/taxes`: Delaware franchise tax reveal (notice vs. assumed par value method vs. savings), a 12-month calendar you can click for deadline detail, a "coming up" list, estimated taxes, and 1099 contractors with W-9 status.
- `#/integrations`: status, live/sample mode, last sync, records, balance; per-row Sync and Sync all. The refresh icon spins while a sync runs, with no layout shift.
- `#/memory`: GBrain pages grouped by type, with rendered markdown on the right. Refreshes every 10s so pages the agent writes show up.

## Design
- Geist Variable. Type scale 12/13/14/16/20/28/44 and spacing 4/8/12/16/24/32/48, both in `src/index.css`. Tabular figures on numbers.
- Radii are 10 outer and 6 inner. Rail plus document layout.
- Charade icons live in `src/icons/` and play on hover of their row or button. `.ic-loop` loops the refresh icon during sync.
- Charts are hand-built SVG in `src/charts.tsx`, using the validated dataviz slots 1 and 2 for money in and out.

- Dark mode follows `prefers-color-scheme`. The rail toggle saves an explicit choice in `localStorage.theme`. Dark uses its own tokens (`[data-theme=dark]` in `index.css`): #E0E0E0 text, desaturated accents, lighter surfaces for elevation.
- Responsive: at 1180px and below the rail collapses to icons. At 720px and below there is a top bar plus a bottom tab bar, and rows stack. The calendar shows 4, 3 or 2 months per row depending on width.

## Known gaps
- Mark reviewed has no undo, and the UI can't add a note yet (the API accepts `{note}`).
- The 390px layout is usable but not tuned for landscape.
