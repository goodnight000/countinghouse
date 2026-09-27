// States and tools. The -off icons break their outline where the slash crosses it, and the round
// states share the open ring. Motion in states.css.

export const title = "States and tools";
export const icons = {
  unlock: `
    <path class="i-shackle" d="M8 10.5V7.5a4 4 0 0 1 7.9-.9"/>
    <g class="i-body"><rect x="4.5" y="10.5" width="15" height="10.5" rx="3"/>
    <path class="i-keyhole" d="M12 13.3a1.5 1.5 0 0 0-.75 2.8l-.25 1.9h2l-.25-1.9a1.5 1.5 0 0 0-.75-2.8z" fill="currentColor" stroke-width="1"/></g>`,
  "eye-off": `
    <path class="i-upper" d="M2.4 12C3.17 10.37 4.23 8.99 5.49 7.92M8.53 6.13C9.62 5.72 10.79 5.5 12 5.5C16.1 5.5 19.7 8 21.6 12"/>
    <path class="i-fx i-lid i-lid-1" d="M2.4 12C3.41 10.72 4.91 9.76 6.7 9.13M10.76 8.34C11.16 8.31 11.58 8.3 12 8.3C16.1 8.3 19.7 9.6 21.6 12"/>
    <path class="i-fx i-lid i-lid-2" d="M2.4 12C4.22 13.05 7.6 13.83 11.48 13.9M16.04 13.63C18.4 13.31 20.36 12.72 21.6 12"/>
    <path class="i-fx i-lid i-lid-3" d="M2.4 12C4.3 14.6 7.9 16.3 12 16.3C12.6 16.3 13.2 16.26 13.78 16.19M17.58 15.15C19.25 14.4 20.64 13.31 21.6 12"/>
    <path d="M2.4 12C4.3 16 7.9 18.5 12 18.5C13.21 18.5 14.38 18.28 15.47 17.87M18.51 16.08C19.77 15.01 20.83 13.63 21.6 12"/>
    <path class="i-fx i-lashes" d="M4.97 15.61 3.9 17M9.04 18.05l-.44 1.75M14.96 18.05l.44 1.75M19.03 15.61 20.1 17" stroke-width="1.5"/>
    <path class="i-iris" d="M11.21 8.8C11.46 8.73 11.73 8.7 12 8.7C13.82 8.7 15.3 10.18 15.3 12C15.3 12.27 15.27 12.54 15.2 12.79M12.79 15.2C12.54 15.27 12.27 15.3 12 15.3C10.18 15.3 8.7 13.82 8.7 12C8.7 11.73 8.73 11.46 8.8 11.21"/>
    <path class="i-slash" pathLength="1" d="M3.5 3.5l17 17"/>`,
  "bell-off": `
    <g class="i-shell"><path d="M12 2.6v1.4"/>
    <path d="M15.59 18H4.6C3.9 18 3.5 17.1 4 16.6C5 15.6 6 14 6 10C6 9.51 6.06 9.04 6.17 8.58M7.97 5.55C9.04 4.59 10.45 4 12 4C15.31 4 18 6.69 18 10C18 14 19 15.6 20 16.6C20.3 16.9 20.28 17.34 20.06 17.65"/></g>
    <circle class="i-clapper" cx="12" cy="20.5" r="1.5" fill="currentColor" stroke="none"/>
    <path class="i-slash" d="M3.5 3.5l17 17"/>
    <path class="i-snooze i-fx" d="M17.5 1.5h2.2l-2.2 2.6h2.2" stroke-width="1.25"/>`,
  "check-circle": `
    <path class="i-ring" d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <path class="i-tick" pathLength="1" d="M8.1 12.4l2.55 2.55 5.4-5.4"/>
    <path class="i-flick i-fx" d="M17.3 8.1l1.5-1.6"/>`,
  "x-circle": `
    <path class="i-ring" d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <path class="i-cross" d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6"/>`,
  ban: `
    <path class="i-ring" d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <path class="i-bar" d="M6 6l12 12"/>`,
  history: `
    <g class="i-face"><path d="M12.44 3.51A8.5 8.5 0 1 0 18.51 6.54"/>
    <path d="M17.07 10.71C17.83 9.77 18.47 8 18.51 6.54C19.69 7.41 21.47 7.99 22.68 7.98"/></g>
    <path class="i-minute" d="M12 12V6.8"/><path class="i-hour" d="M12 12l3 1.8"/>
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>`,
  printer: `
    <path d="M7 8V5.5A2.5 2.5 0 0 1 9.5 3h5A2.5 2.5 0 0 1 17 5.5V8"/>
    <g class="i-body"><path d="M7 17.5H6a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3.5a3 3 0 0 1-3 3h-1"/>
    <circle class="i-light" cx="17.5" cy="11" r="1" fill="currentColor" stroke="none"/></g>
    <path class="i-sheet" d="M7 14h10v5.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19.5z"/>
    <g class="i-print"><path class="i-ink i-line-1" pathLength="1" d="M9.5 16.2h5"/><path class="i-ink i-line-2" pathLength="1" d="M9.5 18.4h3"/></g>`,
  "qr-code": `
    <g class="i-finder i-finder-1"><rect x="3.5" y="3.5" width="6" height="6" rx="1.5"/><rect x="5.6" y="5.6" width="1.8" height="1.8" rx=".5" fill="currentColor" stroke="none"/></g>
    <g class="i-finder i-finder-2"><rect x="14.5" y="3.5" width="6" height="6" rx="1.5"/><rect x="16.6" y="5.6" width="1.8" height="1.8" rx=".5" fill="currentColor" stroke="none"/></g>
    <g class="i-finder i-finder-3"><rect x="3.5" y="14.5" width="6" height="6" rx="1.5"/><rect x="5.6" y="16.6" width="1.8" height="1.8" rx=".5" fill="currentColor" stroke="none"/></g>
    <path class="i-bits i-bits-1" d="M14.5 14.5H17M20.5 14.5V17"/>
    <path class="i-bits i-bits-2" d="M17.5 17.5h0M14.5 17.5v3M17.5 20.5h3"/>
    <path class="i-scan i-fx" d="M2.5 12h19" stroke-width="1.25"/>`,
  wand: `
    <g class="i-stick"><path d="M4 20l8.5-8.5"/><path d="M14 10l1.6-1.6"/></g>
    <path class="i-star" d="M18.5 3.3l.65 1.85 1.85.65-1.85.65-.65 1.85-.65-1.85L16 5.8l1.85-.65z" fill="currentColor" stroke-width="1"/>
    <path class="i-glint i-glint-1" d="M20.5 10.7v2.8M19.1 12.1h2.8" stroke-width="1.25"/>
    <path class="i-glint i-glint-2" d="M10 2.7v2.8M8.6 4.1h2.8" stroke-width="1.25"/>
    <path class="i-burst i-fx" d="M18 9.8l1.3 1M14.2 6l-1-1.3" stroke-width="1.25"/>`,
  cursor: `
    <g class="i-pointer"><path d="M4.5 4.5l6.3 15.1 2.2-6.6 6.6-2.2z"/><path d="M13.5 13.5 19 19"/></g>
    <path class="i-click i-fx" d="M5.5 2.2V.9M2.2 5.5H.9M2.6 2.6l-.9-.9"/>`,
};

export const motion = {
  unlock: "The keyhole turns, the shackle springs up and swings open on its hinge, then swings back to rest.",
  "eye-off": "The upper lid drops shut onto the lower one, the slash wipes away and draws back across the closed eye, and the lid lifts open again.",
  "bell-off": "The bell starts to swing but the slash stifles it to a shiver, and a small z drifts up.",
  "check-circle": "The tick writes itself again, its last stroke flicks out through the gap in the ring, and the ring gives a small stamp.",
  "x-circle": "The ring shakes its head no, and the x inside lags a beat behind like something loose.",
  ban: "The bar lifts like a barrier arm, slams back down across the ring, and the ring jolts from the impact.",
  history: "The hands sweep a full turn backward, the ring winds back with them, and the minute hand ticks forward into place.",
  printer: "The printer hums, feeds the sheet out one line at a time as each line prints, and the light blinks.",
  "qr-code": "A scan line sweeps down the code, and each corner square locks on as it passes.",
  wand: "The wand winds back and flicks, the star at its tip spins, and sparks fly off as the glints twinkle.",
  cursor: "The pointer lifts, clicks down, and a small burst of rays marks the click at its tip.",
};
