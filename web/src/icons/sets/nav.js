// Navigation: home, inbox, bell, gear, grid, menu, more, filter, sort, bookmark, star, heart. Motion in nav.css.

export const title = "Navigation";
export const icons = {
  home: `
    <g class="i-house"><path d="M15.5 6.7V5.2c0-.4.3-.7.7-.7h.6c.4 0 .7.3.7.7v3.4"/>
    <path d="M4.5 11c0-.6.3-1.2.8-1.6l5.5-4.6a1.9 1.9 0 0 1 2.4 0l5.5 4.6c.5.4.8 1 .8 1.6v7.5a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 18.5z"/>
    <path class="i-fx i-glow" d="M9.8 21v-3.6a2.2 2.2 0 0 1 4.4 0V21z" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <path d="M9.8 21v-3.6a2.2 2.2 0 0 1 4.4 0V21"/></g>
    <circle class="i-fx i-puff i-puff-1" cx="16.6" cy="2.4" r="1.4" stroke-width="1.25"/>
    <circle class="i-fx i-puff i-puff-2" cx="16.6" cy="2.4" r="1.4" stroke-width="1.25"/>`,
  inbox: `
    <g class="i-fx i-letter"><rect x="8.8" y="7.4" width="6.4" height="4.6" rx="1" fill="currentColor" fill-opacity=".14"/><path d="M9.6 8.4 12 10l2.4-1.6"/></g>
    <g class="i-tray"><path d="M3.5 13.5l2.3-6.2A2.5 2.5 0 0 1 8.1 5.7h7.8a2.5 2.5 0 0 1 2.3 1.6l2.3 6.2V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18z"/>
    <path d="M3.5 13.5h4.2c.4 0 .7.2.9.5l.8 1.5c.2.3.5.5.9.5h3.4c.4 0 .7-.2.9-.5l.8-1.5c.2-.3.5-.5.9-.5h4.2"/></g>`,
  bell: `
    <circle class="i-clapper" cx="12" cy="20.5" r="1.5" fill="currentColor" stroke="none"/>
    <g class="i-shell"><path d="M12 2.6v1.4"/>
    <path d="M6 10a6 6 0 0 1 12 0c0 4 1 5.6 2 6.6.5.5.1 1.4-.6 1.4H4.6c-.7 0-1.1-.9-.6-1.4 1-1 2-2.6 2-6.6z"/></g>
    <path class="i-fx i-ding i-ding-r" d="M20 3.4a6.5 6.5 0 0 1 2.2 3.6"/>
    <path class="i-fx i-ding i-ding-l" d="M4 3.4a6.5 6.5 0 0 0-2.2 3.6"/>`,
  gear: `
    <g class="i-cog"><path d="M10.54 5.15L10.71 2.79A9.3 9.3 0 0 1 13.29 2.79L13.46 5.15A7 7 0 0 1 15.81 6.13L17.6 4.57A9.3 9.3 0 0 1 19.43 6.4L17.87 8.19A7 7 0 0 1 18.85 10.54L21.21 10.71A9.3 9.3 0 0 1 21.21 13.29L18.85 13.46A7 7 0 0 1 17.87 15.81L19.43 17.6A9.3 9.3 0 0 1 17.6 19.43L15.81 17.87A7 7 0 0 1 13.46 18.85L13.29 21.21A9.3 9.3 0 0 1 10.71 21.21L10.54 18.85A7 7 0 0 1 8.19 17.87L6.4 19.43A9.3 9.3 0 0 1 4.57 17.6L6.13 15.81A7 7 0 0 1 5.15 13.46L2.79 13.29A9.3 9.3 0 0 1 2.79 10.71L5.15 10.54A7 7 0 0 1 6.13 8.19L4.57 6.4A9.3 9.3 0 0 1 6.4 4.57L8.19 6.13A7 7 0 0 1 10.54 5.15z"/></g>
    <g class="i-hub"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/></g>`,
  grid: `
    <rect class="i-tile i-tile-1" x="3.5" y="3.5" width="7" height="7" rx="2"/>
    <rect class="i-tile i-tile-2" x="13.5" y="3.5" width="7" height="7" rx="2"/>
    <rect class="i-tile i-tile-3" x="13.5" y="13.5" width="7" height="7" rx="2"/>
    <rect class="i-tile i-tile-4" x="3.5" y="13.5" width="7" height="7" rx="2"/>`,
  menu: `
    <path class="i-bar i-bar-1" d="M4 6.5h16"/>
    <path class="i-bar i-bar-2" d="M4 12h16"/>
    <path class="i-bar i-bar-3" d="M4 17.5h16"/>`,
  more: `
    <circle class="i-bead i-bead-1" cx="5.5" cy="12" r="1.6" fill="currentColor" stroke="none"/>
    <circle class="i-bead i-bead-2" cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>
    <circle class="i-bead i-bead-3" cx="18.5" cy="12" r="1.6" fill="currentColor" stroke="none"/>`,
  filter: `
    <path class="i-funnel" d="M5 4h14c.8 0 1.3 1 .8 1.6L14 12.2v4.5c0 .4-.2.7-.6.9l-2.3 1.2c-.5.3-1.1-.1-1.1-.7v-5.9L4.2 5.6C3.7 5 4.2 4 5 4z"/>
    <circle class="i-fx i-grain i-grain-l" cx="8.7" cy="6.9" r="1.2" fill="currentColor" stroke="none"/>
    <circle class="i-fx i-grain i-grain-m" cx="12" cy="6.9" r="1.2" fill="currentColor" stroke="none"/>
    <circle class="i-fx i-grain i-grain-r" cx="15.3" cy="6.9" r="1.2" fill="currentColor" stroke="none"/>`,
  sort: `
    <g class="i-up"><path d="M8 19V5M4.5 8.5 8 5l3.5 3.5"/></g>
    <g class="i-down"><path d="M16 5v14M12.5 15.5 16 19l3.5-3.5"/></g>`,
  bookmark: `
    <g class="i-ribbon"><path class="i-fx i-tint" d="M7.5 3.5h9a2 2 0 0 1 2 2v14.6c0 .5-.6.8-1 .5L12 16.5l-5.5 4.1c-.4.3-1 0-1-.5V5.5a2 2 0 0 1 2-2z" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <path d="M7.5 3.5h9a2 2 0 0 1 2 2v14.6c0 .5-.6.8-1 .5L12 16.5l-5.5 4.1c-.4.3-1 0-1-.5V5.5a2 2 0 0 1 2-2z"/></g>`,
  star: `
    <g class="i-body"><g class="i-spin"><path class="i-fx i-tint" d="M12 3.3L14.53 9.22L20.94 9.8L16.09 14.03L17.53 20.3L12 17L6.47 20.3L7.91 14.03L3.06 9.8L9.47 9.22z" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <path d="M12 3.3L14.53 9.22L20.94 9.8L16.09 14.03L17.53 20.3L12 17L6.47 20.3L7.91 14.03L3.06 9.8L9.47 9.22z"/></g></g>
    <path class="i-fx i-twinkle i-twinkle-1" d="M20.5 1.8v2.6M19.2 3.1h2.6"/>
    <path class="i-fx i-twinkle i-twinkle-2" d="M3.4 16.6v2M2.4 17.6h2"/>`,
  heart: `
    <path class="i-fx i-echo" d="M12 6.6A4.8 4.8 0 0 1 20.5 9.6c0 2.2-1.3 3.8-2.7 5.2l-4.4 4.4a2 2 0 0 1-2.8 0l-4.4-4.4C4.8 13.4 3.5 11.8 3.5 9.6A4.8 4.8 0 0 1 12 6.6z" stroke-width="1.25"/>
    <g class="i-beat"><path class="i-fx i-tint" d="M12 6.6A4.8 4.8 0 0 1 20.5 9.6c0 2.2-1.3 3.8-2.7 5.2l-4.4 4.4a2 2 0 0 1-2.8 0l-4.4-4.4C4.8 13.4 3.5 11.8 3.5 9.6A4.8 4.8 0 0 1 12 6.6z" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <path d="M12 6.6A4.8 4.8 0 0 1 20.5 9.6c0 2.2-1.3 3.8-2.7 5.2l-4.4 4.4a2 2 0 0 1-2.8 0l-4.4-4.4C4.8 13.4 3.5 11.8 3.5 9.6A4.8 4.8 0 0 1 12 6.6z"/></g>`,
};

export const motion = {
  home: "The door lights up and two puffs of smoke rise from the chimney as the house settles.",
  inbox: "A letter drops into the tray, which dips to catch it.",
  bell: "The bell swings on its knob, the clapper lags behind and strikes each side, and a ring sounds.",
  gear: "The cog ratchets forward two teeth while the hub tightens on each click.",
  grid: "The four tiles shuffle one place clockwise, ducking as they pass each other.",
  menu: "The bars fold up into the top one and drop back down like a list unrolling.",
  more: "The first dot leapfrogs over the other two to the end of the row.",
  filter: "Three grains fall in, the funnel shakes, and only the middle one drips out the spout.",
  sort: "The arrows run like a conveyor: each leaves in its direction and comes back round from the other end.",
  bookmark: "The ribbon lifts and drops into place, stretching and filling as it lands.",
  star: "The star crouches, jumps and spins one point around, lights up as it lands, and twinkles.",
  heart: "The heart beats lub-dub and each beat sends out an echo.",
};
