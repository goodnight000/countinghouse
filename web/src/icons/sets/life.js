// Food, health and travel: coffee, utensils, bike, train, rocket, graduation, pill, first-aid, paw,
// bed. Motion in life.css.

export const title = "Food, health and travel";
export const icons = {
  coffee: `
    <path d="M4.5 10h11v5.5a4.5 4.5 0 0 1-4.5 4.5H9a4.5 4.5 0 0 1-4.5-4.5z"/>
    <path d="M15.5 11.5h1.5a2.5 2.5 0 0 1 0 5h-1.8"/>
    <path class="i-steam i-steam-1" d="M8 2.8c-.9.9-.9 1.9 0 2.8s.9 1.9 0 2.8"/>
    <path class="i-steam i-steam-2" d="M12 2.8c-.9.9-.9 1.9 0 2.8s.9 1.9 0 2.8"/>`,
  utensils: `
    <g class="i-fork"><path d="M5.5 3v5a2.5 2.5 0 0 0 5 0V3M8 3v18"/></g>
    <g class="i-knife"><path d="M17.5 21V3c-2.5 1.2-4 4.2-4 7.5 0 1.4.9 2.5 2.2 2.5h1.8"/></g>
    <path class="i-clink i-fx" d="M12.5 1.2v-1.5M10.3 1.8l-1-1M14.7 1.8l1-1"/>`,
  bike: `
    <path class="i-speed i-fx" d="M.5 10.5h2.5M0 13.5h2"/>
    <g class="i-ride">
    <circle cx="5.5" cy="16.5" r="3.6"/><circle cx="18.5" cy="16.5" r="3.6"/>
    <path d="M5.5 16.5H11L9 10.2h6.7M11 16.5l4.7-6.3M5.5 16.5 9 10.2M18.5 16.5 14.6 7.8M13.4 7.8h2.4M8 8.2h2.5M9 10.2l-.5-2"/>
    <path class="i-crank" d="M11 16.5l1.4 2.4"/>
    <circle cx="11" cy="16.5" r="1.1" fill="currentColor" stroke="none"/></g>`,
  train: `
    <path d="M8.5 17l-2 4M15.5 17l2 4"/><path class="i-tie" d="M7.5 19h9"/>
    <g class="i-car"><rect x="5" y="3" width="14" height="14" rx="3"/>
    <rect x="7.5" y="5.5" width="9" height="5" rx="1.5"/>
    <circle cx="12" cy="13.8" r="1.2" fill="currentColor" stroke="none"/>
    <circle class="i-glow i-fx" cx="12" cy="13.8" r="2.4" stroke-width="1"/></g>`,
  rocket: `
    <g transform="rotate(45 12 12) translate(12 12) scale(1.1) translate(-12 -12)">
    <circle class="i-puff i-puff-1 i-fx" cx="9.5" cy="20.5" r="1.5" fill="currentColor" fill-opacity=".14" stroke-width="1"/>
    <circle class="i-puff i-puff-2 i-fx" cx="14.5" cy="20.5" r="1.5" fill="currentColor" fill-opacity=".14" stroke-width="1"/>
    <g class="i-ship"><path d="M12 2.5c2.1 1.6 3.2 4.1 3.2 7V14a2 2 0 0 1-2 2h-2.4a2 2 0 0 1-2-2V9.5c0-2.9 1.1-5.4 3.2-7z"/>
    <path d="M8.8 11.2 6.9 13v2.6l1.9-1.1M15.2 11.2l1.9 1.8v2.6l-1.9-1.1M10.6 16l.3 1.5h2.2l.3-1.5"/>
    <circle cx="12" cy="8.6" r="1.3" fill="currentColor" stroke="none"/>
    <path class="i-thrust i-fx" d="M11 18.4l1 2.3 1-2.3"/></g></g>`,
  graduation: `
    <g class="i-cap"><path d="M12 4 2.5 8.5 12 13l9.5-4.5z"/>
    <path d="M6.5 10.8v4.4c0 1.5 2.5 3.3 5.5 3.3s5.5-1.8 5.5-3.3v-4.4"/>
    <g class="i-tassel"><path d="M21.5 8.5v4.8"/><rect x="20.6" y="13" width="1.8" height="3" rx=".9" fill="currentColor" stroke="none"/></g></g>`,
  pill: `
    <g transform="rotate(-45 12 12)">
    <g class="i-half-l"><path d="M12 8.5H7.5a3.5 3.5 0 0 0 0 7H12z"/></g>
    <g class="i-half-r"><path d="M12 8.5h4.5a3.5 3.5 0 0 1 0 7H12M15.5 10.8h1"/></g></g>
    <circle class="i-grain i-grain-1 i-fx" cx="12" cy="12" r=".7" fill="currentColor" stroke="none"/>
    <circle class="i-grain i-grain-2 i-fx" cx="12" cy="12" r=".7" fill="currentColor" stroke="none"/>
    <circle class="i-grain i-grain-3 i-fx" cx="12" cy="12" r=".7" fill="currentColor" stroke="none"/>`,
  "first-aid": `
    <g class="i-kit"><rect x="3.5" y="6.5" width="17" height="13.5" rx="3"/>
    <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5"/></g>
    <path class="i-cross" d="M12 10v6.5M8.75 13.25h6.5"/>`,
  paw: `
    <g class="i-print i-fx" fill="currentColor" fill-opacity=".14" stroke="none"><path d="M12 12.5c-2.6 0-5.5 3.2-5.5 5.6 0 1.6 1.3 2.4 2.7 2.4 1.1 0 1.8-.5 2.8-.5s1.7.5 2.8.5c1.4 0 2.7-.8 2.7-2.4 0-2.4-2.9-5.6-5.5-5.6z"/>
    <ellipse cx="4.8" cy="11" rx="1.7" ry="2.1" transform="rotate(-25 4.8 11)"/><ellipse cx="9" cy="6" rx="1.8" ry="2.3" transform="rotate(-8 9 6)"/>
    <ellipse cx="15" cy="6" rx="1.8" ry="2.3" transform="rotate(8 15 6)"/><ellipse cx="19.2" cy="11" rx="1.7" ry="2.1" transform="rotate(25 19.2 11)"/></g>
    <g class="i-foot"><path class="i-pad" d="M12 12.5c-2.6 0-5.5 3.2-5.5 5.6 0 1.6 1.3 2.4 2.7 2.4 1.1 0 1.8-.5 2.8-.5s1.7.5 2.8.5c1.4 0 2.7-.8 2.7-2.4 0-2.4-2.9-5.6-5.5-5.6z"/>
    <g class="i-toe i-toe-1"><ellipse cx="4.8" cy="11" rx="1.7" ry="2.1" transform="rotate(-25 4.8 11)"/></g>
    <g class="i-toe i-toe-2"><ellipse cx="9" cy="6" rx="1.8" ry="2.3" transform="rotate(-8 9 6)"/></g>
    <g class="i-toe i-toe-3"><ellipse cx="15" cy="6" rx="1.8" ry="2.3" transform="rotate(8 15 6)"/></g>
    <g class="i-toe i-toe-4"><ellipse cx="19.2" cy="11" rx="1.7" ry="2.1" transform="rotate(25 19.2 11)"/></g></g>`,
  bed: `
    <path d="M3 5v15.5M3 12.5h15.5a2.5 2.5 0 0 1 2.5 2.5v5.5M3 17h18"/>
    <rect class="i-pillow" x="5.5" y="9.2" width="5" height="3.3" rx="1.4"/>
    <path class="i-zz i-zz-1 i-fx" d="M12.5 5.5h3l-3 3.5h3" stroke-width="1.25"/>
    <path class="i-zz i-zz-2 i-fx" d="M17.2 1.5h2.4l-2.4 2.8h2.4" stroke-width="1.25"/>`,
};
export const motion = {
  coffee: "The steam curls up and drifts off, and fresh wisps rise out of the cup.",
  utensils: "The fork and knife lean in, clink at the tips, and spring apart.",
  bike: "The pedals turn and the bike pops a wheelie, then lands back on both wheels.",
  train: "The train rocks on its wheels as the sleepers rush under it, and its lamp flashes twice.",
  rocket: "The rocket rumbles, fires, lifts off in a puff of smoke, and eases back onto the pad.",
  graduation: "The cap is tossed, turns in the air, and lands while the tassel swings behind it.",
  pill: "The capsule twists open, a few grains spill out, and it clicks shut.",
  "first-aid": "The cross beats twice like a pulse and the case thumps along with it.",
  paw: "The paw presses down with its toes spread, lifts away leaving a print, and steps back in.",
  bed: "The pillow is plumped and a couple of z's drift up off it.",
};
