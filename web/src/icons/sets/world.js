// Money and places: wallet, receipt, cart, bag, gift, coin, building, car, plane, map, compass, flag. Motion in world.css.

export const title = "Money and places";
export const icons = {
  wallet: `
    <g class="i-card"><path d="M6.5 6.5V5.3a1.6 1.6 0 0 1 1.6-1.6h4.8a1.6 1.6 0 0 1 1.6 1.6v1.2"/>
    <path class="i-fx i-stripe" d="M6.5 6h8"/></g>
    <path class="i-fx i-sides" d="M6.5 6.5V3.3M14.5 6.5V3.3"/>
    <g class="i-body"><rect x="3.5" y="6.5" width="17" height="14" rx="3"/>
    <path d="M20.5 10.8H17a2.7 2.7 0 0 0 0 5.4h3.5"/>
    <circle class="i-snap" cx="17.1" cy="13.5" r="1.1" fill="currentColor" stroke="none"/></g>`,
  receipt: `
    <path d="M6 20.5V5.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2z"/>
    <g class="i-rows"><path class="i-row i-row-1" d="M9 7.5h6"/><path class="i-row" d="M9 10.5h6"/><path class="i-row" d="M9 13.5h6"/>
    <path class="i-ink i-fresh" pathLength="1" d="M9 16.5h6"/></g>`,
  cart: `
    <rect class="i-fx i-item" x="10.2" y="10" width="5" height="4.4" rx="1"/>
    <path class="i-basket" d="M2.5 3.5h1.6c.5 0 1 .4 1.1.9l2.3 10.4c.2.7.8 1.2 1.5 1.2h8.3c.7 0 1.3-.5 1.5-1.2l1.5-6.2c.2-.8-.4-1.5-1.2-1.5H5.4"/>
    <circle cx="9" cy="19.6" r="1.5" fill="currentColor" stroke="none"/><circle cx="17" cy="19.6" r="1.5" fill="currentColor" stroke="none"/>`,
  bag: `
    <path class="i-handle" d="M9 11V7a3 3 0 0 1 6 0v4"/>
    <rect class="i-sack" x="5" y="8" width="14" height="13" rx="3"/>`,
  gift: `
    <path class="i-box" d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12M12 12v9"/>
    <path class="i-fx i-bit i-bit-1" d="M9.2 10.8l-1.1-1.7" stroke-width="1.5"/>
    <path class="i-fx i-bit i-bit-2" d="M12 10.6V8.6" stroke-width="1.5"/>
    <path class="i-fx i-bit i-bit-3" d="M14.8 10.8l1.1-1.7" stroke-width="1.5"/>
    <g class="i-lid"><rect x="3.5" y="8" width="17" height="4" rx="1.5"/><path d="M12 8v4"/>
    <path d="M12 8c-1-2.6-2.6-4-4-4a2 2 0 0 0 0 4M12 8c1-2.6 2.6-4 4-4a2 2 0 0 1 0 4"/>
    <circle cx="12" cy="8" r="1.3" fill="currentColor" stroke="none"/></g>`,
  coin: `
    <path class="i-fx i-shadow" d="M9 22.5h6"/>
    <g class="i-toss"><g class="i-face"><path d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <path d="M14.4 9.6c-.3-.9-1.2-1.6-2.4-1.6-1.4 0-2.5.8-2.5 1.9 0 2.6 5 1.4 5 4.2 0 1.1-1.1 1.9-2.5 1.9-1.3 0-2.2-.6-2.6-1.6M12 6.5V8M12 16v1.5"/></g></g>
    <path class="i-fx i-glint" d="M19.9 2.4v2.4M18.7 3.6h2.4" stroke-width="1.25"/>`,
  building: `
    <path d="M2.5 21h19M4 21V5.5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 2 2V21M15.5 10H18a2 2 0 0 1 2 2v9"/>
    <rect x="6.4" y="6.4" width="2.2" height="2.2" rx=".5" stroke-width="1"/>
    <rect x="10.9" y="6.4" width="2.2" height="2.2" rx=".5" stroke-width="1"/>
    <rect x="6.4" y="11" width="2.2" height="2.2" rx=".5" stroke-width="1"/>
    <rect x="10.9" y="11" width="2.2" height="2.2" rx=".5" stroke-width="1"/>
    <rect x="16.65" y="13.4" width="2.2" height="2.2" rx=".5" stroke-width="1"/>
    <rect x="8.2" y="16.6" width="3.1" height="4.4" rx="1" fill="currentColor" stroke="none"/>
    <rect class="i-fx i-lit i-lit-wing" x="16.2" y="12.95" width="3.1" height="3.1" rx=".7" fill="currentColor" stroke="none"/>
    <rect class="i-fx i-lit i-lit-low" x="5.95" y="10.55" width="3.1" height="3.1" rx=".7" fill="currentColor" stroke="none"/>
    <rect class="i-fx i-lit i-lit-low" x="10.45" y="10.55" width="3.1" height="3.1" rx=".7" fill="currentColor" stroke="none"/>
    <rect class="i-fx i-lit i-lit-top" x="5.95" y="5.95" width="3.1" height="3.1" rx=".7" fill="currentColor" stroke="none"/>
    <rect class="i-fx i-lit i-lit-late" x="10.45" y="5.95" width="3.1" height="3.1" rx=".7" fill="currentColor" stroke="none"/>`,
  car: `
    <g class="i-chassis"><path d="M5 16.5H4A1.5 1.5 0 0 1 2.5 15v-2.5a1.5 1.5 0 0 1 1.2-1.5l2.3-.5 2.3-3.1a2.5 2.5 0 0 1 2-1h3.6a2.5 2.5 0 0 1 1.9.9l2.7 3.3 1.9.5a1.5 1.5 0 0 1 1.1 1.5V15a1.5 1.5 0 0 1-1.5 1.5H19M9 16.5h6"/>
    <path d="M6 10.5h12.5M12 6.4v4.1"/>
    <circle cx="20" cy="13" r="1" fill="currentColor" stroke="none"/></g>
    <circle cx="7" cy="16.5" r="2"/><circle cx="17" cy="16.5" r="2"/>
    <circle class="i-fx i-puff i-puff-1" cx="1.2" cy="15.6" r="1" stroke-width="1.25"/>
    <circle class="i-fx i-puff i-puff-2" cx="1.2" cy="15.6" r="1" stroke-width="1.25"/>`,
  plane: `
    <g transform="rotate(45 12 12)"><g class="i-jet"><path class="i-fx i-trail" pathLength="1" d="M4.2 15.8v5" stroke-width="1.25"/>
    <path class="i-fx i-trail" pathLength="1" d="M19.8 15.8v5" stroke-width="1.25"/>
    <g class="i-roll"><path d="M12 2.5c.8 0 1.5.8 1.5 1.8v4.9l6.5 4.1c.3.2.5.5.5.9v.6c0 .3-.3.6-.7.5l-6.3-2v4.3l1.8 1.4c.3.2.4.5.4.8v.6c0 .3-.3.5-.6.5L12 20.1l-3.1.8c-.3.1-.6-.2-.6-.5v-.6c0-.3.1-.6.4-.8l1.8-1.4v-4.3l-6.3 2c-.4.1-.7-.2-.7-.5v-.6c0-.4.2-.7.5-.9l6.5-4.1V4.3c0-1 .7-1.8 1.5-1.8z"/></g></g></g>`,
  map: `
    <path class="i-panel i-panel-l" d="M9 4.5 4.5 5.9c-.6.2-1 .7-1 1.4v11.4c0 .7.6 1.1 1.2.9L9 17.5"/>
    <path d="M9 4.5l6 2v13l-6-2z"/>
    <path class="i-panel i-panel-r" d="M15 6.5l4.3-1.4c.6-.2 1.2.3 1.2.9v11.4c0 .7-.4 1.2-1 1.4L15 19.5"/>
    <circle class="i-here" cx="12" cy="11" r="1.3" fill="currentColor" stroke="none"/>`,
  compass: `
    <path class="i-case" d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <g class="i-needle"><g transform="rotate(45 12 12)"><path d="M12 6.4l2.1 5.6h-4.2z" fill="currentColor" stroke-width="1.25"/>
    <path d="M9.9 12l2.1 5.6 2.1-5.6" stroke-width="1.25"/></g></g>`,
  flag: `
    <path d="M6 21V4.5"/>
    <circle cx="6" cy="3" r="1.3" fill="currentColor" stroke="none"/>
    <g class="i-cloth"><path d="M6 5.5c2.2-1.2 4.3-1.2 6.5 0s4.3 1.2 6.5 0V14c-2.2 1.2-4.3 1.2-6.5 0s-4.3-1.2-6.5 0"/></g>`,
};

export const motion = {
  wallet: "The wallet squeezes, the card is pulled up out of it at a tilt, and it drops back in with a bulge.",
  receipt: "A new line prints at the bottom, the rows feed up one, and the top row slides off under the edge.",
  cart: "A box drops into the basket and bounces once, and the basket dips on its wheels to catch it.",
  bag: "The handle pulls taut first, the bag rises after it and sways, then is set down with a squash.",
  gift: "The box swells, the lid pops off at a tilt with a burst of confetti, and it lands back on.",
  coin: "The coin is tossed, flips twice over its shadow, lands with a bounce, and glints at the gap.",
  building: "Night falls: the windows light from the bottom floor up, then go dark, and one on top stays on late.",
  car: "The engine revs twice, the body rocking back on its wheels with a puff from the exhaust each time.",
  plane: "The plane pushes forward and does a barrel roll while two contrails stream from its wingtips.",
  map: "The side panels fold in one after the other, spring back open, and the you-are-here dot pops.",
  compass: "The case is turned and the needle lags, swings past north, and hunts back to where it was.",
  flag: "The flag slides down the pole, is hoisted back up in two tugs, and flutters at the top.",
};
