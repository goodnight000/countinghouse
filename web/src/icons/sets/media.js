// Media and sound: play, pause, stop, skip-forward, skip-back, shuffle, volume, mute, music, film, radio.
// Transport shapes are soft outlines in the same stroke as everything else. Motion in media.css.

export const title = "Media and sound";
export const icons = {
  play: `
    <path class="i-ghost i-fx" d="M7.5 5.3v13.4c0 .8.9 1.3 1.5.8l9.9-6.7c.6-.4.6-1.2 0-1.6L9 4.5c-.6-.5-1.5 0-1.5.8z" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <path class="i-tri" d="M7.5 5.3v13.4c0 .8.9 1.3 1.5.8l9.9-6.7c.6-.4.6-1.2 0-1.6L9 4.5c-.6-.5-1.5 0-1.5.8z"/>`,
  pause: `
    <rect class="i-bar" x="6" y="4.5" width="4" height="15" rx="1.5"/>
    <rect class="i-bar i-bar-2" x="14" y="4.5" width="4" height="15" rx="1.5"/>`,
  stop: `
    <path class="i-skid i-fx" d="M1.8 9h1.7M1.2 12h2.3M1.8 15h1.7"/>
    <rect class="i-block" x="5" y="5" width="14" height="14" rx="3"/>`,
  "skip-forward": `
    <path class="i-tri" d="M5 6.3v11.4c0 .8.9 1.3 1.5.8l8.2-5.7c.6-.4.6-1.2 0-1.6L6.5 5.5c-.6-.5-1.5 0-1.5.8z"/>
    <path class="i-bar" d="M19 5.5v13"/>`,
  "skip-back": `
    <path class="i-tri" d="M19 6.3v11.4c0 .8-.9 1.3-1.5.8l-8.2-5.7c-.6-.4-.6-1.2 0-1.6l8.2-5.7c.6-.5 1.5 0 1.5.8z"/>
    <path class="i-bar" d="M5 5.5v13"/>`,
  shuffle: `
    <g class="i-strand"><path d="M3 17.5h1.6c1.4 0 2.7-.7 3.5-1.8l5.8-7.4c.8-1.1 2.1-1.8 3.5-1.8H20"/>
    <path d="M17.5 3.8l2.4 2.4c.2.2.2.4 0 .6l-2.4 2.4"/></g>
    <g class="i-strand i-strand-2"><path d="M3 6.5h1.6c1.4 0 2.7.7 3.5 1.8l5.8 7.4c.8 1.1 2.1 1.8 3.5 1.8H20"/>
    <path d="M17.5 14.8l2.4 2.4c.2.2.2.4 0 .6l-2.4 2.4"/></g>`,
  volume: `
    <path class="i-cone" d="M4.5 9.2h2.4l4-3.4c.6-.5 1.6-.1 1.6.7v11c0 .8-1 1.2-1.6.7l-4-3.4H4.5a1 1 0 0 1-1-1v-3.6a1 1 0 0 1 1-1z"/>
    <path class="i-wave" d="M15.5 9.5a3.6 3.6 0 0 1 0 5"/>
    <path class="i-wave i-wave-2" d="M18.2 6.8a7.3 7.3 0 0 1 0 10.4"/>
    <path class="i-wave i-wave-3 i-fx" d="M20.9 4.1a11 11 0 0 1 0 15.8"/>`,
  mute: `
    <path d="M4.5 9.2h2.4l4-3.4c.6-.5 1.6-.1 1.6.7v11c0 .8-1 1.2-1.6.7l-4-3.4H4.5a1 1 0 0 1-1-1v-3.6a1 1 0 0 1 1-1z"/>
    <path class="i-peek i-fx" d="M15.5 9.5a3.6 3.6 0 0 1 0 5"/>
    <path class="i-cross" d="M16 9.5l5 5"/>
    <path class="i-cross i-cross-2" d="M21 9.5l-5 5"/>`,
  music: `
    <path class="i-beam" d="M9 7.2 20 4.8"/>
    <g class="i-note"><path d="M9 7.2v10.3"/><circle cx="6.5" cy="17.5" r="2.5"/></g>
    <g class="i-note i-note-2"><path d="M20 4.8v10.3"/><circle cx="17.5" cy="15.1" r="2.5"/></g>
    <g class="i-float i-fx"><path d="M13.5 13.2v-3.5l1.6.6"/><circle cx="12.6" cy="13.3" r="1" fill="currentColor" stroke="none"/></g>`,
  film: `
    <rect x="3.5" y="3" width="17" height="18" rx="3"/>
    <path d="M7.5 3v18M16.5 3v18"/>
    <rect class="i-flicker i-fx" x="7.5" y="3" width="9" height="18" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <g class="i-holes"><path d="M5.5 7.5v.01M5.5 12v.01M18.5 7.5v.01M18.5 12v.01"/>
    <path class="i-last" d="M5.5 16.5v.01M18.5 16.5v.01"/>
    <path class="i-next i-fx" d="M5.5 3v.01M18.5 3v.01"/></g>`,
  radio: `
    <path class="i-antenna" d="M7.5 8.5 17 3.8"/>
    <path class="i-signal i-fx" d="M18.6 1.6a2.6 2.6 0 0 1 1 3.4"/>
    <rect x="3" y="8.5" width="18" height="12" rx="3"/>
    <path d="M6.5 12.5h4.5M6.5 16.5h4.5"/>
    <g class="i-knob"><circle cx="16" cy="14.5" r="2.6"/>
    <circle cx="16" cy="12.9" r="1" fill="currentColor" stroke="none"/></g>`,
};

export const motion = {
  play: "The triangle pulls back, springs forward, and a faint copy of it carries on ahead.",
  pause: "The two bars press down in turn like held keys and come back up.",
  stop: "The square skids to a halt, leaning into the stop with skid marks behind it, and snaps upright.",
  "skip-forward": "The triangle darts into the bar and knocks it on a notch, then both spring back.",
  "skip-back": "The triangle darts into the bar and knocks it back a notch, then both spring back.",
  shuffle: "The strands pinch together and fan back out in turn like a riffled deck, the crossing sliding along as they go.",
  volume: "The cone thumps and the sound waves swell outward in turn, with a third wave briefly joining them.",
  mute: "A sound wave peeks out and the cross snaps shut on it.",
  music: "The two notes bob on alternate beats, see-sawing the beam, and a little note floats off.",
  film: "The strip advances one frame on its sprocket holes and the picture flickers.",
  radio: "The antenna sways and catches a signal while the tuning knob turns.",
};
