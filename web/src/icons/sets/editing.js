// Editing and layout: zoom-in, zoom-out, maximize, minimize, sidebar, columns, table, layers, crop, scissors, type, bold, italic, underline, align-left, list-ordered, palette. Motion in editing.css.

export const title = "Editing and layout";
export const icons = {
  "zoom-in": `
    <g class="i-lens"><path d="M14.03 4.46A7 7 0 1 0 16.54 6.97"/><path d="M15.5 15.5 20.5 20.5"/>
    <path class="i-sign" d="M10.5 7.8v5.4M7.8 10.5h5.4"/></g>`,
  "zoom-out": `
    <g class="i-lens"><path d="M14.03 4.46A7 7 0 1 0 16.54 6.97"/><path d="M15.5 15.5 20.5 20.5"/>
    <path class="i-sign" d="M7.8 10.5h5.4"/></g>`,
  maximize: `
    <rect class="i-window i-fx" x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <path class="i-corner i-tl" d="M8.5 3.5H6A2.5 2.5 0 0 0 3.5 6v2.5"/>
    <path class="i-corner i-tr" d="M15.5 3.5H18A2.5 2.5 0 0 1 20.5 6v2.5"/>
    <path class="i-corner i-bl" d="M3.5 15.5V18A2.5 2.5 0 0 0 6 20.5h2.5"/>
    <path class="i-corner i-br" d="M20.5 15.5V18a2.5 2.5 0 0 1-2.5 2.5h-2.5"/>`,
  minimize: `
    <rect class="i-window i-fx" x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <path class="i-corner i-tl" d="M8.5 3.5V6A2.5 2.5 0 0 1 6 8.5H3.5"/>
    <path class="i-corner i-tr" d="M15.5 3.5V6a2.5 2.5 0 0 0 2.5 2.5h2.5"/>
    <path class="i-corner i-bl" d="M3.5 15.5H6A2.5 2.5 0 0 1 8.5 18v2.5"/>
    <path class="i-corner i-br" d="M20.5 15.5H18a2.5 2.5 0 0 0-2.5 2.5v2.5"/>`,
  sidebar: `
    <path class="i-panel i-fx" fill="currentColor" fill-opacity=".14" stroke="none" d="M9.5 4H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h3.5z"/>
    <rect x="3" y="4" width="18" height="16" rx="3"/>
    <path class="i-divider" d="M9.5 4v16"/>`,
  columns: `
    <path class="i-fill i-fill-1 i-fx" fill="currentColor" fill-opacity=".14" stroke="none" d="M9 4H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h3z"/>
    <path class="i-fill i-fill-2 i-fx" fill="currentColor" fill-opacity=".14" stroke="none" d="M9 4h6v16H9z"/>
    <path class="i-fill i-fill-3 i-fx" fill="currentColor" fill-opacity=".14" stroke="none" d="M15 4h3a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-3z"/>
    <rect x="3" y="4" width="18" height="16" rx="3"/>
    <path d="M9 4v16M15 4v16"/>`,
  table: `
    <rect class="i-cell i-fx" x="4.4" y="10.6" width="6.2" height="3" rx="1" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <rect x="3" y="4" width="18" height="16" rx="3"/>
    <path d="M3 9.3h18M3 14.7h18M12 4v16"/>`,
  layers: `
    <path class="i-layer i-bottom" d="M3.5 16.5l7.4 3.7a2.4 2.4 0 0 0 2.2 0l7.4-3.7"/>
    <path class="i-layer i-middle" d="M3.5 12l7.4 3.7a2.4 2.4 0 0 0 2.2 0l7.4-3.7"/>
    <path class="i-layer i-top" d="M10.9 3.5a2.4 2.4 0 0 1 2.2 0l7.2 3.6c.7.4.7 1.4 0 1.8l-7.2 3.6a2.4 2.4 0 0 1-2.2 0L3.7 8.9c-.7-.4-.7-1.4 0-1.8z"/>`,
  crop: `
    <rect class="i-keep i-fx" x="8.5" y="8.5" width="7" height="7" rx="1" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <path class="i-handle i-near" d="M6.5 2.5V15A2.5 2.5 0 0 0 9 17.5h12.5"/>
    <path class="i-handle i-far" d="M17.5 21.5V9A2.5 2.5 0 0 0 15 6.5H2.5"/>`,
  scissors: `
    <path class="i-bit i-fx" d="M21.6 11.2l.8 1.4"/>
    <g class="i-blade i-blade-a"><circle cx="6" cy="6" r="2.8"/><path d="M8 8l12 12"/></g>
    <g class="i-blade i-blade-b"><circle cx="6" cy="18" r="2.8"/><path d="M8 16 20 4"/></g>
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>`,
  type: `
    <g class="i-stem"><path d="M12 4.5v15M9.5 19.5h5"/></g>
    <g class="i-bar"><path class="i-arm i-arm-l" d="M12 4.5H7A1.5 1.5 0 0 0 5.5 6v1.5"/>
    <path class="i-arm i-arm-r" d="M12 4.5h5A1.5 1.5 0 0 1 18.5 6v1.5"/></g>`,
  bold: `
    <path d="M7 4.5v15"/>
    <path class="i-bowl i-bowl-top" d="M7 4.5h5.5a3.75 3.75 0 0 1 0 7.5H7"/>
    <path class="i-bowl i-bowl-bottom" d="M7 12h6.5a3.75 3.75 0 0 1 0 7.5H7"/>`,
  italic: `
    <g class="i-letter"><path class="i-serif i-serif-top" d="M10.5 4.5h8"/><path d="M14.5 4.5 9.5 19.5"/>
    <path class="i-serif i-serif-bottom" d="M5.5 19.5h8"/></g>`,
  underline: `
    <path class="i-letter" d="M7 4v6.5a5 5 0 0 0 10 0V4"/>
    <path class="i-rule" pathLength="1" d="M5 20h14"/>`,
  "align-left": `
    <path class="i-guide i-fx" stroke-width="1" d="M2.4 3.5v17"/>
    <path class="i-line i-line-1" d="M4.5 5h15.5"/>
    <path class="i-line i-line-2" d="M4.5 9.7h9.5"/>
    <path class="i-line i-line-3" d="M4.5 14.3h13"/>
    <path class="i-line i-line-4" d="M4.5 19h7.5"/>`,
  "list-ordered": `
    <path class="i-num i-num-1" stroke-width="1.4" d="M4.3 4.7 6.1 3.5v5"/>
    <path class="i-num i-num-2" stroke-width="1.4" d="M4.1 16.8c.3-.8 1-1.3 1.8-1.3 1 0 1.7.6 1.7 1.5 0 .7-.4 1.2-1.1 1.8l-2.4 1.9h3.6"/>
    <path d="M10.5 6h9.5M10.5 12h9.5M10.5 18h9.5"/>`,
  palette: `
    <g class="i-board"><path d="M12 20.5A8.5 8.5 0 1 1 20.5 12c0 2.2-1.8 3.5-3.8 3.5h-1.9a1.9 1.9 0 0 0-1.5 3.1l.3.4c.6.8 0 1.5-1.6 1.5z"/>
    <circle class="i-paint i-paint-1" cx="7.6" cy="12.4" r="1.25" fill="currentColor" stroke="none"/>
    <circle class="i-paint i-paint-2" cx="8.8" cy="8.1" r="1.25" fill="currentColor" stroke="none"/>
    <circle class="i-paint i-paint-3" cx="13" cy="6.8" r="1.25" fill="currentColor" stroke="none"/>
    <circle class="i-paint i-paint-4" cx="16.6" cy="9.4" r="1.25" fill="currentColor" stroke="none"/></g>`,
};

export const motion = {
  "zoom-in": "The plus shrinks back, then swells big as the lens leans closer, and settles.",
  "zoom-out": "The minus stretches, then shrinks as the lens pulls back, and settles.",
  maximize: "The corners wind in, then fling out to the edges as a window grows to fill the frame.",
  minimize: "The corners wind out, then pinch in toward the middle as the window shrinks away.",
  sidebar: "The sidebar tucks into the edge and slides back out to its width.",
  columns: "Each column fills with content in turn, left to right, then clears.",
  table: "A selected cell hops across the grid like arrow keys, then clears.",
  layers: "The top sheet lifts off and the stack fans apart, then the layers settle back in order.",
  crop: "The two crop handles close in to frame a smaller area, then ease back out.",
  scissors: "The blades snip twice around the pivot, and a trimmed bit drops away.",
  type: "The crossbar hops up and lands back on the stem, its arms dipping on impact.",
  bold: "The B puffs out its bowls one after the other, as if flexing.",
  italic: "The letter stands up straight, then leans hard into its slant and springs back.",
  underline: "The underline is struck again from left to right, and the U dips as the pen passes under it.",
  "align-left": "The lines drift out to the right by different amounts, then snap flush against the left edge.",
  "list-ordered": "Each number flips over in turn like a counter card, 1 then 2.",
  palette: "A brush dabs each paint well in turn around the palette, and the palette tips in the hand.",
};
