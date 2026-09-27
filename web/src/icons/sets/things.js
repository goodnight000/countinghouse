// Devices and status: laptop, watch, wifi, battery, headphones, camera, bulb, target, info, alert, help. Motion in things.css.

export const title = "Devices and status";
export const icons = {
  laptop: `
    <g class="i-lid"><rect x="4" y="4.5" width="16" height="11" rx="2.5"/>
    <path class="i-ink i-ink-1" pathLength="1" d="M7.5 8.5h5"/>
    <path class="i-ink i-ink-2" pathLength="1" d="M7.5 11.5h8"/></g>
    <path class="i-deck" d="M2 19h20"/>
    <circle class="i-sleep i-fx" cx="12" cy="17.2" r=".8" fill="currentColor" stroke="none"/>`,
  watch: `
    <g class="i-case"><path d="M16.65 8.21A6 6 0 1 0 17.98 11.5"/>
    <path d="M9.2 6.7l.5-2.6c.1-.6.6-1 1.2-1h2.2c.6 0 1.1.4 1.2 1l.5 2.6M9.2 17.3l.5 2.6c.1.6.6 1 1.2 1h2.2c.6 0 1.1-.4 1.2-1l.5-2.6"/>
    <path class="i-hour" d="M12 12l2.1 1.3"/><path class="i-minute" d="M12 12V8.4"/>
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/></g>
    <path class="i-buzz i-fx" d="M4 9.8c-.9 1.4-.9 3 0 4.4M20 9.8c.9 1.4.9 3 0 4.4"/>`,
  wifi: `
    <circle class="i-node" cx="12" cy="18" r="1.4" fill="currentColor" stroke="none"/>
    <path class="i-arc i-arc-1" d="M9.17 15.17a4 4 0 0 1 5.66 0"/>
    <path class="i-arc i-arc-2" d="M6.34 12.34a8 8 0 0 1 11.32 0"/>
    <path class="i-arc i-arc-3" d="M3.51 9.51a12 12 0 0 1 16.98 0"/>
    <path class="i-wave i-fx" d="M3.51 9.51a12 12 0 0 1 16.98 0"/>`,
  battery: `
    <rect x="2.5" y="7" width="16.5" height="10" rx="3"/>
    <rect class="i-nub" x="20.4" y="10" width="1.8" height="4" rx=".9" fill="currentColor" stroke="none"/>
    <path class="i-bar i-bar-1" d="M6.3 10.3v3.4"/>
    <path class="i-bar i-bar-2" d="M9.4 10.3v3.4"/>
    <path class="i-bar i-bar-3" d="M12.5 10.3v3.4"/>
    <path class="i-bolt i-fx" d="M11.9 8.9 9.6 12.3h3l-2.1 3"/>`,
  headphones: `
    <path class="i-band" d="M4 15v-3a8 8 0 0 1 16 0v3"/>
    <rect class="i-cup i-cup-l" x="4" y="13" width="3.8" height="7.5" rx="1.9"/>
    <rect class="i-cup i-cup-r" x="16.2" y="13" width="3.8" height="7.5" rx="1.9"/>
    <g class="i-note i-fx"><circle cx="11" cy="16.6" r="1.1" fill="currentColor" stroke="none"/>
    <path d="M12 16.4V12.2l1.9.9" stroke-width="1.25"/></g>`,
  camera: `
    <path class="i-body" d="M3 9c0-1.4 1.1-2.5 2.5-2.5h2.2l1.2-1.8c.3-.4.7-.7 1.2-.7h3.8c.5 0 .9.3 1.2.7l1.2 1.8h2.2C19.9 6.5 21 7.6 21 9v8.5c0 1.4-1.1 2.5-2.5 2.5h-13C4.1 20 3 18.9 3 17.5z"/>
    <circle class="i-lens" cx="12" cy="13.2" r="3.7"/>
    <circle class="i-led" cx="17.6" cy="9.6" r="1" fill="currentColor" stroke="none"/>
    <path class="i-flash i-fx" d="M21.3 5.2l1.1-1.1M22.6 8.1h1.3M19.2 3.8V2.5"/>`,
  bulb: `
    <circle class="i-glow i-fx" cx="12" cy="9.3" r="5.6" fill="currentColor" fill-opacity=".18" stroke="none"/>
    <g class="i-glass"><path d="M9 16.8v-.3c0-1.3-.6-2.2-1.5-3.1a6.3 6.3 0 1 1 9 0c-.9.9-1.5 1.8-1.5 3.1v.3"/>
    <path class="i-filament" d="M10.4 13.4l1.6-1.8 1.6 1.8"/></g>
    <path d="M9.2 19.2h5.6M10.6 21.7h2.8"/>
    <path class="i-ray i-fx" d="M12 1V-.3M17.8 3.5l.9-.9M6.2 3.5l-.9-.9M20.2 9.3h1.3M3.8 9.3H2.5"/>`,
  target: `
    <path class="i-outer" d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <circle class="i-inner" cx="12" cy="12" r="4.6"/>
    <circle class="i-eye" cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <g class="i-dart i-fx"><path d="M12.8 11.2 19.2 4.8M18.4 3v2.6H21"/></g>`,
  info: `
    <path class="i-ring" d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <path class="i-stem" d="M12 11.3v5.5"/>
    <circle class="i-tittle" cx="12" cy="8" r="1.2" fill="currentColor" stroke="none"/>`,
  alert: `
    <path class="i-sign" d="M10.2 4.6c.8-1.5 2.8-1.5 3.6 0l7 12.4c.8 1.5-.2 3.3-1.9 3.3H5.1c-1.7 0-2.7-1.8-1.9-3.3z"/>
    <path class="i-bar" d="M12 9.4v4"/>
    <circle class="i-dot" cx="12" cy="16.7" r="1.1" fill="currentColor" stroke="none"/>
    <path class="i-flare i-fx" d="M6.3 3.6 5 2.3M17.7 3.6 19 2.3M12 1.2V-.1"/>`,
  help: `
    <path class="i-ring" d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <g class="i-query"><path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1 1-1.1 1.7v.3"/>
    <circle class="i-dot" cx="12" cy="16.7" r="1.15" fill="currentColor" stroke="none"/></g>`,
};

export const motion = {
  laptop: "The lid swings shut, the sleep light glows, and it springs back open as two lines of text type across the screen.",
  watch: "The minute hand winds back, sweeps a full hour, and the watch buzzes on the wrist when it reaches the top.",
  wifi: "The dot dips and sends a ripple out through each arc in turn, and the last wave carries on past the edge.",
  battery: "The bars drain from right to left, a bolt flashes in the empty case, and the bars charge back up one by one.",
  headphones: "The band stretches as the cups pull apart, they snap back on, and a note floats up between them to the beat.",
  camera: "The body presses down, the lens iris snaps shut and reopens, and the light flares with a flash at the corner.",
  bulb: "The filament flickers twice, catches, and the bulb glows with rays before it dims again.",
  target: "A dart flies in through the gap in the ring, thunks into the bullseye so the rings shudder, quivers, and is pulled out.",
  info: "The stem crouches and throws the dot up, then catches it with a small squash as it lands.",
  alert: "The mark jolts up to attention while the dot blinks twice like a hazard light and flares flash around the sign.",
  help: "The question mark cocks its head one way, then the other, like a puzzled dog, before it straightens up.",
};
