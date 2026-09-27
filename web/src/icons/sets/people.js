// People and feelings. Motion in people.css.

export const title = "People and feelings";
export const icons = {
  user: `
    <circle class="i-head" cx="12" cy="8" r="3.5"/>
    <path class="i-body" d="M6 20a6 6 0 0 1 12 0"/>`,
  "user-plus": `
    <g class="i-person"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/></g>
    <g class="i-cross"><path d="M19 8v6M16 11h6"/></g>`,
  "user-check": `
    <g class="i-person"><circle class="i-head" cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/></g>
    <path class="i-tick" pathLength="1" d="M15.6 11.4l2 2 4-4.2"/>`,
  contact: `
    <rect x="3" y="4.5" width="18" height="15" rx="3"/>
    <g class="i-photo"><circle cx="8.8" cy="10.3" r="2"/><path d="M5.6 16.3a3.2 3.2 0 0 1 6.4 0"/></g>
    <path class="i-line i-line-1" pathLength="1" d="M14.5 10.2h3.5"/>
    <path class="i-line i-line-2" pathLength="1" d="M14.5 13.8h2.5"/>
    <path class="i-fx i-scan" d="M4.5 6.5h15"/>`,
  smile: `
    <g class="i-face"><path d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none"/>
    <circle class="i-wink" cx="15" cy="10" r="1.1" fill="currentColor" stroke="none"/>
    <path class="i-mouth" d="M8.5 14.2a4 4 0 0 0 7 0"/></g>`,
  frown: `
    <path d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <g class="i-eyes"><circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="10" r="1.1" fill="currentColor" stroke="none"/></g>
    <path class="i-mouth" d="M8.5 16.8a4 4 0 0 1 7 0"/>
    <path class="i-fx i-tear" d="M8.2 11.9c-.6.8-.9 1.3-.9 1.7a.9.9 0 0 0 1.8 0c0-.4-.3-.9-.9-1.7z" fill="currentColor" fill-opacity=".14" stroke-width="1.1"/>`,
  "thumbs-up": `
    <g class="i-arm"><rect class="i-cuff" x="3" y="10.5" width="3.5" height="10" rx="1.5"/>
    <path class="i-hand" d="M6.5 11.5l3.2-6.1c.5-.9 1.5-1.3 2.4-1 1 .3 1.6 1.3 1.4 2.3L13 10.5h5a2.2 2.2 0 0 1 2.1 2.7l-1.4 5.6a2.2 2.2 0 0 1-2.1 1.7H6.5"/></g>
    <path class="i-fx i-burst" d="M15.4 4.3l1.3-1.1M16 6.8h1.7M13.5 2.6l.4-1.5"/>`,
  "thumbs-down": `
    <g transform="matrix(1 0 0 -1 0 24)"><g class="i-arm"><rect class="i-cuff" x="3" y="10.5" width="3.5" height="10" rx="1.5"/>
    <path class="i-hand" d="M6.5 11.5l3.2-6.1c.5-.9 1.5-1.3 2.4-1 1 .3 1.6 1.3 1.4 2.3L13 10.5h5a2.2 2.2 0 0 1 2.1 2.7l-1.4 5.6a2.2 2.2 0 0 1-2.1 1.7H6.5"/></g>
    <path class="i-fx i-burst" d="M15.4 4.3l1.3-1.1M16 6.8h1.7M13.5 2.6l.4-1.5"/></g>`,
  award: `
    <g class="i-medal"><path d="M14.8 3.19A6 6 0 1 0 17.31 5.7"/>
    <circle class="i-boss" cx="12" cy="8.5" r="1.5" fill="currentColor" stroke="none"/></g>
    <path class="i-tail i-tail-l" d="M8.6 13.4 7.6 20.2c-.1.6.5 1 1 .7L12 19"/>
    <path class="i-tail i-tail-r" d="M15.4 13.4l1 6.8c.1.6-.5 1-1 .7L12 19"/>
    <path class="i-fx i-glint" d="M19.2 1.6v2.6M17.9 2.9h2.6"/>`,
  trophy: `
    <g class="i-cup"><path d="M7.5 4h9c.3 0 .5.2.5.5V9a5 5 0 0 1-10 0V4.5c0-.3.2-.5.5-.5z"/>
    <path d="M7 6H5.5a1.8 1.8 0 0 0-1.8 1.8c0 2.2 1.5 3.9 4.2 4.1M17 6h1.5a1.8 1.8 0 0 1 1.8 1.8c0 2.2-1.5 3.9-4.2 4.1"/>
    <circle cx="12" cy="8.6" r="1.3" fill="currentColor" stroke="none"/>
    <path d="M12 14v3.5M9 17.5h6c.8 0 1.5.7 1.5 1.5v1.5h-9V19c0-.8.7-1.5 1.5-1.5z"/></g>
    <path class="i-fx i-bit i-bit-1" d="M10.4 3.6l-.8.5" stroke-width="1.25"/>
    <path class="i-fx i-bit i-bit-2" d="M12 3.2v-.9" stroke-width="1.25"/>
    <path class="i-fx i-bit i-bit-3" d="M13.6 3.6l.8.5" stroke-width="1.25"/>`,
  crown: `
    <g class="i-crown"><path d="M4.8 17.5 3.4 8.4c-.1-.6.6-1 1.1-.6l3.9 3.1 2.9-5.1c.3-.5 1.1-.5 1.4 0l2.9 5.1 3.9-3.1c.5-.4 1.2 0 1.1.6l-1.4 9.1z"/>
    <circle class="i-jewel" cx="12" cy="13.6" r="1.3" fill="currentColor" stroke="none"/></g>
    <path class="i-band" d="M5 20.5h14"/>`,
  gem: `
    <path d="M8.3 4h7.4c.6 0 1.1.3 1.5.7l3.2 3.8c.4.5.4 1.2 0 1.7l-7.7 9.1c-.4.5-1.1.5-1.5 0l-7.7-9.1c-.4-.5-.4-1.2 0-1.7l3.2-3.8c.4-.4.9-.7 1.5-.7z"/>
    <path d="M3.4 9.4h17.2"/>
    <path class="i-facets" d="M10.2 4 8.6 9.4 12 19.6M13.8 4l1.6 5.4L12 19.6"/>
    <path class="i-fx i-flash" d="M4.8 3.2 3.6 2M3.6 5.2H2M6.8 2.2V.8"/>`,
};

export const motion = {
  user: "The head gives a small nod while the shoulders dip with it.",
  "user-plus": "The plus ducks out and springs back in with a twist while the person leans aside to make room.",
  "user-check": "The check mark rubs out and redraws, and the person straightens up proudly.",
  contact: "A scan line sweeps down the card and the details write themselves back in behind it.",
  smile: "The face tilts, winks its right eye, and widens its grin.",
  frown: "The eyes droop, the mouth wobbles, and a tear rolls down the cheek.",
  "thumbs-up": "The hand dips, then pumps up with the thumb flexed and a little burst beside it.",
  "thumbs-down": "The hand lifts, then pumps down with the thumb flexed and a little burst beside it.",
  award: "The ribbon tails flutter, the center pops, and a sparkle flies out of the gap in the medal.",
  trophy: "The trophy is hoisted with a little tilt, and confetti pops out of the cup and flutters down.",
  crown: "The crown hops off its band, tips, and drops back on with a bounce while the jewel glints.",
  gem: "The facets turn as if the stone rotates, and a flash bursts from its corner.",
};
