// Arrows and actions. Every arrowhead is the same swept head: two barbs that curve in toward the
// shaft and meet at a soft tip. Motion in arrows.css.

export const title = "Arrows and actions";
export const icons = {
  "arrow-left": `
    <path class="i-shaft" d="M19.5 12H5"/>
    <path class="i-head" d="M11 6C10 8.1 7.5 10.7 5 12C7.5 13.3 10 15.9 11 18"/>
    <path class="i-whoosh i-fx" d="M21.5 9.5h1.5M21 14.5h2"/>`,
  "arrow-right": `
    <path class="i-shaft" d="M4.5 12H19"/>
    <path class="i-head" d="M13 18C14 15.9 16.5 13.3 19 12C16.5 10.7 14 8.1 13 6"/>
    <path class="i-whoosh i-fx" d="M2.5 9.5H1M3 14.5H1"/>`,
  "arrow-down": `
    <path class="i-shaft" d="M12 4.5V19"/>
    <path class="i-head" d="M6 13C8.1 14 10.7 16.5 12 19C13.3 16.5 15.9 14 18 13"/>
    <path class="i-dust i-fx" d="M9 21.5l-2 .6M15 21.5l2 .6"/>`,
  "arrow-up": `
    <path class="i-shaft" d="M12 19.5V5"/>
    <path class="i-head" d="M18 11C15.9 10 13.3 7.5 12 5C10.7 7.5 8.1 10 6 11"/>
    <path class="i-puff i-fx" d="M10.5 22l-.6 1.4M13.5 22l.6 1.4"/>`,
  refresh: `
    <g class="i-loop">
    <path class="i-trail" pathLength="1" d="M20.49 11.56A8.5 8.5 0 1 1 17.46 5.49"/>
    <path d="M13.29 6.93C14.23 6.17 16 5.53 17.46 5.49C16.59 4.31 16.01 2.53 16.02 1.32"/></g>`,
  undo: `
    <path class="i-tape" pathLength="1" d="M11 19h4a4.5 4.5 0 0 0 0-9H4.5"/>
    <path class="i-head" d="M9 5.5C8.25 7.08 6.38 9.03 4.5 10C6.38 10.97 8.25 12.93 9 14.5"/>`,
  redo: `
    <path class="i-tape" pathLength="1" d="M13 19H9a4.5 4.5 0 0 1 0-9h10.5"/>
    <path class="i-head" d="M15 14.5C15.75 12.93 17.63 10.97 19.5 10C17.63 9.03 15.75 7.08 15 5.5"/>`,
  download: `
    <path class="i-fill i-fx" d="M4 16.5h16v1a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <g class="i-tray"><path d="M4 14.5v3A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5v-3"/></g>
    <g class="i-arrow"><path d="M12 3.5v11"/><path d="M7.5 10C9.07 10.75 11.03 12.63 12 14.5C12.97 12.63 14.93 10.75 16.5 10"/></g>`,
  upload: `
    <path class="i-fill i-fx" d="M4 16.5h16v1a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <g class="i-tray"><path d="M4 14.5v3A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5v-3"/></g>
    <g class="i-arrow"><path d="M12 14.5v-11"/><path d="M16.5 8C14.93 7.25 12.97 5.38 12 3.5C11.03 5.38 9.07 7.25 7.5 8"/></g>`,
  share: `
    <circle class="i-packet i-packet-1 i-fx" cx="6" cy="12" r="1.2" fill="currentColor" stroke="none"/>
    <circle class="i-packet i-packet-2 i-fx" cx="6" cy="12" r="1.2" fill="currentColor" stroke="none"/>
    <path d="M8.2 10.85 15.3 7.15M8.2 13.15 15.3 16.85"/>
    <circle class="i-leaf i-leaf-1" cx="17.5" cy="6" r="2.5"/>
    <circle class="i-leaf i-leaf-2" cx="17.5" cy="18" r="2.5"/>
    <circle class="i-hub" cx="6" cy="12" r="2.2" fill="currentColor" stroke="none"/>`,
  external: `
    <path class="i-box" d="M18.5 13.5v4a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 17.5V8a2.5 2.5 0 0 1 2.5-2.5h4.5"/>
    <g class="i-arrow"><path d="M12 12l8.5-8.5"/><path d="M20.5 9.44C19.96 7.91 19.91 5.38 20.5 3.5C18.62 4.09 16.09 4.04 14.56 3.5"/></g>`,
  minus: `
    <path class="i-bar" d="M5 12h14"/>
    <path class="i-fx i-chip" d="M15.5 12H19"/>`,
  "log-in": `
    <g class="i-door"><path d="M14 4h3.5A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5H14"/></g>
    <g class="i-arrow"><path d="M3.5 12h11"/><path d="M10.3 16.2C11 14.73 12.75 12.91 14.5 12C12.75 11.09 11 9.27 10.3 7.8"/></g>`,
};

export const motion = {
  "arrow-left": "The head darts left, the shaft stretches after it like elastic and pulls it back, and a whoosh trails off the tail.",
  "arrow-right": "The head darts right, the shaft stretches after it like elastic and pulls it back, and a whoosh trails off the tail.",
  "arrow-down": "It hops up, drops, lands tip first so the shaft squashes and the head spreads, kicks up two bits of dust, and bounces once.",
  "arrow-up": "It crouches, launches up with a puff under its tail, and floats back down to land.",
  refresh: "It winds back, then the head races a full turn around, reeling its tail in at speed and letting it out again as it slows.",
  undo: "The line reels back into the arrowhead like a tape measure, the head nods back, and the line unspools again.",
  redo: "The line reels forward into the arrowhead like a tape measure, the head nods on, and the line unspools again.",
  download: "The arrow drops into the tray, which dips under the weight and fills for a moment, and the next arrow falls in from above.",
  upload: "The tray crouches and flings the arrow up and away, emptying as it goes, and a fresh arrow rises out of it.",
  share: "The hub gathers itself and sends a copy of itself down each branch, and each node pops as its copy arrives.",
  external: "The arrow fires out through the open corner and the box kicks back the other way like a recoiling cannon.",
  minus: "A piece snaps off the end of the bar and falls away, and the bar grows back.",
  "log-in": "The arrow knocks twice on the door, the door swings open, and it steps inside as the door closes after it.",
};
