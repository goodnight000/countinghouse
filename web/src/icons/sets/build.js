// Build and system: code, terminal, git-branch, bug, cpu, server, plug, power, bluetooth, toggle,
// loader, command, puzzle, bot, keyboard, monitor. Motion in build.css.

export const title = "Build and system";
export const icons = {
  code: `
    <path class="i-lt" d="M8.5 7 3.5 12l5 5"/>
    <path class="i-gt" d="M15.5 7l5 5-5 5"/>
    <path class="i-slash" d="M13.6 5 10.4 19"/>`,
  terminal: `
    <rect x="2.5" y="4" width="19" height="16" rx="3"/>
    <path class="i-prompt" d="M6.5 9.5 9 12l-2.5 2.5"/>
    <path class="i-typed i-ink" pathLength="1" d="M12.3 12h3.4"/>
    <rect class="i-caret" x="11.5" y="13.7" width="3.2" height="1.6" rx=".8" fill="currentColor" stroke="none"/>`,
  "git-branch": `
    <path d="M6.5 8.2v7.6"/>
    <circle cx="6.5" cy="6" r="2.2"/>
    <circle cx="6.5" cy="18" r="2.2"/>
    <path class="i-branch" pathLength="1" d="M8.1 16.4c3.1-3.9 9.4-3.1 9.4-8.2"/>
    <circle class="i-ripple i-fx" cx="17.5" cy="6" r="2.2"/>
    <circle class="i-tip" cx="17.5" cy="6" r="2.2" fill="currentColor"/>`,
  bug: `
    <g class="i-bug"><g class="i-feelers"><path d="M10.5 6.9 9 4.5M13.5 6.9 15 4.5"/></g>
    <path d="M9.5 8.9a2.5 2.5 0 0 1 5 0z" fill="currentColor" stroke-width="1.25"/>
    <rect x="7.5" y="8.2" width="9" height="12.3" rx="4.5"/>
    <path d="M12 11.4v9.1"/>
    <path class="i-legs i-legs-a" d="M8.1 10.6 5 9M16.5 14.5h3M8 18l-3 1.8"/>
    <path class="i-legs i-legs-b" d="M15.9 10.6 19 9M7.5 14.5h-3M16 18l3 1.8"/></g>`,
  cpu: `
    <rect x="5.5" y="5.5" width="13" height="13" rx="3"/>
    <rect class="i-heat i-fx" x="9.6" y="9.6" width="4.8" height="4.8" rx="1.2"/>
    <rect class="i-core" x="9.6" y="9.6" width="4.8" height="4.8" rx="1.2" fill="currentColor" stroke="none"/>
    <path class="i-pins i-pins-t" d="M9.5 2.5v3M14.5 2.5v3"/>
    <path class="i-pins i-pins-r" d="M18.5 9.5h3M18.5 14.5h3"/>
    <path class="i-pins i-pins-b" d="M14.5 18.5v3M9.5 18.5v3"/>
    <path class="i-pins i-pins-l" d="M5.5 14.5h-3M5.5 9.5h-3"/>`,
  server: `
    <g class="i-unit i-unit-t"><rect x="3" y="3.5" width="18" height="7.5" rx="2.5"/>
    <circle class="i-led i-led-t" cx="7" cy="7.25" r="1" fill="currentColor" stroke="none"/>
    <path d="M13.5 7.25h4"/></g>
    <g class="i-unit i-unit-b"><rect x="3" y="13" width="18" height="7.5" rx="2.5"/>
    <circle class="i-led i-led-b" cx="7" cy="16.75" r="1" fill="currentColor" stroke="none"/>
    <path d="M13.5 16.75h4"/></g>`,
  plug: `
    <g class="i-plug"><path d="M9.5 2.8v4.7M14.5 2.8v4.7"/>
    <path d="M6.5 7.5h11v3a5.5 5.5 0 0 1-11 0z"/></g>
    <path class="i-cord" d="M12 16v5.5"/>
    <path class="i-spark i-fx" d="M12 .2V-1M8.2 .6 7.3-.3M15.8.6l.9-.9"/>`,
  power: `
    <path class="i-half i-half-l" pathLength="1" d="M12 20.5A8 8 0 0 1 6.86 6.37"/>
    <path class="i-half i-half-r" pathLength="1" d="M12 20.5A8 8 0 0 0 17.14 6.37"/>
    <path class="i-stem" d="M12 3v8"/>`,
  bluetooth: `
    <path class="i-rune" pathLength="1" d="M6.5 7.5 17 16.5 12 21V3l5 4.5-10.5 9"/>
    <path class="i-trace i-fx" pathLength="1" d="M6.5 7.5 17 16.5 12 21V3l5 4.5-10.5 9"/>
    <path class="i-ping i-fx" d="M3.8 9.8c-1.1 1.3-1.1 3.1 0 4.4M20.2 9.8c1.1 1.3 1.1 3.1 0 4.4"/>`,
  toggle: `
    <rect class="i-tint i-fx" x="2" y="6.5" width="20" height="11" rx="5.5" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <rect x="2" y="6.5" width="20" height="11" rx="5.5"/>
    <circle class="i-knob" cx="16.5" cy="12" r="3" fill="currentColor" stroke="none"/>`,
  loader: `
    <path class="i-spoke i-s1" opacity=".2" d="M15.18 8.82 18.01 5.99"/>
    <path class="i-spoke i-s2" opacity=".25" d="M16.5 12h4"/>
    <path class="i-spoke i-s3" opacity=".3" d="M15.18 15.18l2.83 2.83"/>
    <path class="i-spoke i-s4" opacity=".4" d="M12 16.5v4"/>
    <path class="i-spoke i-s5" opacity=".5" d="M8.82 15.18 5.99 18.01"/>
    <path class="i-spoke i-s6" opacity=".65" d="M7.5 12h-4"/>
    <path class="i-spoke i-s7" opacity=".8" d="M8.82 8.82 5.99 5.99"/>
    <path class="i-spoke i-s8" d="M12 7.5v-4"/>`,
  command: `
    <path class="i-middle" d="M9 9h6v6H9z"/>
    <path class="i-loop i-loop-tl" d="M9 9H6a3 3 0 1 1 3-3z"/>
    <path class="i-loop i-loop-tr" d="M15 9V6a3 3 0 1 1 3 3z"/>
    <path class="i-loop i-loop-br" d="M15 15h3a3 3 0 1 1-3 3z"/>
    <path class="i-loop i-loop-bl" d="M9 15v3a3 3 0 1 1-3-3z"/>`,
  puzzle: `
    <path class="i-slot i-fx" fill="currentColor" fill-opacity=".14" stroke="none" d="M5.6 7.4h3A2.2 2.2 0 1 1 11.6 7.4h3a2.5 2.5 0 0 1 2.5 2.5v2.5a2.2 2.2 0 1 1 0 3v2.5a2.5 2.5 0 0 1-2.5 2.5h-3a2.2 2.2 0 1 0-3 0h-3a2.5 2.5 0 0 1-2.5-2.5v-8a2.5 2.5 0 0 1 2.5-2.5z"/>
    <path class="i-piece" d="M5.6 7.4h3A2.2 2.2 0 1 1 11.6 7.4h3a2.5 2.5 0 0 1 2.5 2.5v2.5a2.2 2.2 0 1 1 0 3v2.5a2.5 2.5 0 0 1-2.5 2.5h-3a2.2 2.2 0 1 0-3 0h-3a2.5 2.5 0 0 1-2.5-2.5v-8a2.5 2.5 0 0 1 2.5-2.5z"/>`,
  bot: `
    <g class="i-antenna"><path d="M12 8V5.3"/>
    <circle cx="12" cy="4" r="1.4" fill="currentColor" stroke="none"/></g>
    <path class="i-beep i-fx" d="M8.8 2.4c-.8 1-.8 2.2 0 3.2M15.2 2.4c.8 1 .8 2.2 0 3.2"/>
    <rect x="4" y="8" width="16" height="12" rx="3"/>
    <path class="i-eyes" d="M9 12.6v2M15 12.6v2"/>
    <path d="M2 12.8v2.8M22 12.8v2.8"/>`,
  keyboard: `
    <path class="i-text i-ink" pathLength="1" d="M7 2.6h10"/>
    <rect x="2.5" y="6" width="19" height="12" rx="3"/>
    <path class="i-key i-k1" d="M6 9.8h.01"/><path class="i-key i-k2" d="M9 9.8h.01"/>
    <path class="i-key i-k3" d="M12 9.8h.01"/><path class="i-key i-k4" d="M15 9.8h.01"/>
    <path class="i-key i-k5" d="M18 9.8h.01"/>
    <path class="i-key i-k6" d="M7.5 12.6h.01"/><path class="i-key i-k7" d="M10.5 12.6h.01"/>
    <path class="i-key i-k8" d="M13.5 12.6h.01"/><path class="i-key i-k9" d="M16.5 12.6h.01"/>
    <path class="i-space" d="M8.5 15.3h7"/>`,
  monitor: `
    <rect class="i-glow i-fx" x="4" y="5" width="16" height="10" rx="1.5" fill="currentColor" fill-opacity=".18" stroke="none"/>
    <path class="i-glint i-fx" d="M11 13.5l3-7"/>
    <rect x="2.5" y="3.5" width="19" height="13" rx="3"/>
    <path d="M12 16.5v4M8.5 20.5h7"/>`,
};

export const motion = {
  code: "The brackets spring apart, the slash spins a half turn between them, and they clamp back in.",
  terminal: "The cursor blinks, a command types out behind it, the prompt nudges forward to run it, and the line clears.",
  "git-branch": "The branch pulls back into the trunk, grows out again, and its tip commit pops into place.",
  bug: "The bug scurries forward on alternating legs with its feelers twitching, then backs into place.",
  cpu: "A pulse runs clockwise round the pins, and the core flashes with heat when the lap closes.",
  server: "The top unit slides out like a drawer while the lights blink with traffic, then slides back in with a clunk.",
  plug: "The plug dips, pushes up into the socket with a spark at the prongs, and drops back down on its cord.",
  power: "The stem presses down, the ring drains to the bottom and fills back up to the top, and the stem springs back.",
  bluetooth: "The rune dims while a spark runs along its single stroke, then it lights back up and pairing waves blink on both sides.",
  toggle: "The knob stretches as it slides off, then slides back on with a squash and the track lights up.",
  loader: "A bright pulse runs once around the spokes, each one reaching out as it passes, and the lap ends on the lead spoke.",
  command: "The four loops pull in toward the middle one after another like a knot tightening, then spring back out.",
  puzzle: "The piece lifts out of its slot and turns, then drops back in and clicks.",
  bot: "The robot blinks, its antenna boings on its spring, and it beeps.",
  keyboard: "Keys tap down in a quick typing run, a line of text appears above, and the space bar thumps at the end.",
  monitor: "The screen switches on from a bright line that opens to fill it, a glint sweeps across, and it goes dark again.",
};
