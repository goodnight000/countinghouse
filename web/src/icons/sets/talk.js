// Talk and time: reply, at, video, megaphone, alarm, hourglass, timer, repeat, sun, cloud, bolt, sparkles. Motion in talk.css.

export const title = "Talk and time";
export const icons = {
  reply: `
    <path class="i-trail" d="M19.5 19v-1.5a5.5 5.5 0 0 0-5.5-5.5H5"/>
    <path class="i-echo i-fx" d="M9.5 6.5 4.5 11.5a.7.7 0 0 0 0 1l5 5"/>
    <path class="i-head" d="M9.5 6.5 4.5 11.5a.7.7 0 0 0 0 1l5 5"/>`,
  at: `
    <circle class="i-core" cx="12" cy="12" r="3.5"/>
    <path class="i-swirl" pathLength="1" d="M15.5 8.5v4a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.4 6.8"/>`,
  video: `
    <rect x="2.5" y="6.5" width="13" height="11" rx="3"/>
    <circle class="i-rec" cx="6.4" cy="10.2" r="1.25" fill="currentColor" stroke="none"/>
    <path class="i-lens" d="M15.5 10.4l3.8-2.2c.5-.3 1.2.1 1.2.7v6.2c0 .6-.7 1-1.2.7l-3.8-2.2"/>`,
  megaphone: `
    <g class="i-horn"><path d="M4 10.2c0-.7.5-1.2 1.2-1.2H8l9.3-4.4c.6-.3 1.2.1 1.2.8v13.2c0 .7-.6 1.1-1.2.8L8 15H5.2c-.7 0-1.2-.5-1.2-1.2zM8 9v6"/>
    <path d="M8.6 15l1 3.8c.1.5.5.7 1 .7h.6c.6 0 1-.5.9-1.1l-.8-3"/></g>
    <path class="i-shout i-fx" d="M21 12h1.6"/>
    <path class="i-shout i-fx i-shout-2" d="M20.6 8.6l1.4-.9M20.6 15.4l1.4.9"/>`,
  alarm: `
    <g class="i-body"><path d="M15.9 6.59A7.5 7.5 0 1 0 18.41 9.1"/>
    <path d="M12 9.2V13l2.4 1.5M7 18.8l-1.5 1.7M17 18.8l1.5 1.7"/>
    <circle cx="12" cy="13" r="1.1" fill="currentColor" stroke="none"/></g>
    <path class="i-hammer i-fx" d="M12 5.4V3.2"/>
    <path class="i-bell i-bell-l" d="M3.8 8.2a3.2 3.2 0 0 1 4.4-4.4"/>
    <path class="i-bell i-bell-r" d="M15.8 3.8a3.2 3.2 0 0 1 4.4 4.4"/>`,
  hourglass: `
    <g class="i-glass">
    <path d="M5.5 3.5h13M5.5 20.5h13M7.5 3.5v2.2c0 1.1.4 2.2 1.2 3L12 12l3.3-3.3c.8-.8 1.2-1.9 1.2-3V3.5M7.5 20.5v-2.2c0-1.1.4-2.2 1.2-3L12 12l3.3 3.3c.8.8 1.2 1.9 1.2 3v2.2"/>
    <path class="i-sand-top" d="M9.3 5.4h5.4v.3c0 .7-.3 1.4-.8 1.9L12 9.6l-1.9-2c-.5-.5-.8-1.2-.8-1.9z" fill="currentColor" stroke="none"/>
    <path class="i-stream i-fx" pathLength="1" stroke-width="1.2" d="M12 11v6.5"/>
    <path class="i-sand-pile i-fx" d="M14.8 18.6H9.2v-.4c0-.7.3-1.3.8-1.8l2-2.1 2 2.1c.5.5.8 1.1.8 1.8z" fill="currentColor" stroke="none"/></g>`,
  timer: `
    <path d="M15.9 7.09A7.5 7.5 0 1 0 18.41 9.6"/>
    <path class="i-crown" d="M10 2.5h4M12 2.5V6"/>
    <path d="M18.8 6.7l1.2-1.2"/>
    <circle class="i-wedge i-fx" cx="12" cy="13.5" r="2.9" pathLength="1" stroke-width="5.8" stroke-opacity=".16" stroke-linecap="butt" transform="rotate(-90 12 13.5)"/>
    <path class="i-hand" d="M12 13.5V9.2"/>
    <circle cx="12" cy="13.5" r="1.1" fill="currentColor" stroke="none"/>`,
  repeat: `
    <path class="i-track" pathLength="1" d="M4 12v-1.5a4 4 0 0 1 4-4h11"/>
    <path class="i-tip" d="M16.5 3.5l2.6 2.6c.2.2.2.6 0 .8l-2.6 2.6"/>
    <path class="i-track i-track-2" pathLength="1" d="M20 12v1.5a4 4 0 0 1-4 4H5"/>
    <path class="i-tip i-tip-2" d="M7.5 20.5l-2.6-2.6c-.2-.2-.2-.6 0-.8l2.6-2.6"/>`,
  sun: `
    <circle class="i-core" cx="12" cy="12" r="4"/>
    <path class="i-ray" d="M12 3.2v2"/>
    <path class="i-ray i-ray-2" d="M16.9 7.1l1.3-1.3"/>
    <path class="i-ray i-ray-3" d="M18.8 12h2"/>
    <path class="i-ray i-ray-4" d="M16.9 16.9l1.3 1.3"/>
    <path class="i-ray i-ray-5" d="M12 18.8v2"/>
    <path class="i-ray i-ray-6" d="M7.1 16.9l-1.3 1.3"/>
    <path class="i-ray i-ray-7" d="M5.2 12h-2"/>
    <path class="i-ray i-ray-8" d="M7.1 7.1 5.8 5.8"/>`,
  cloud: `
    <path class="i-puff" d="M7 18.5h10a4 4 0 0 0 .5-7.97 5.5 5.5 0 0 0-10.75-.9A4.5 4.5 0 0 0 7 18.5z"/>
    <path class="i-wisp i-fx" d="M18.6 6.4a2.2 2.2 0 0 1 3.4 1.8"/>`,
  bolt: `
    <path class="i-glow i-fx" d="M13.5 2.8 5.4 13.1c-.3.4 0 .9.5.9h5.6l-1 7.2 8.1-10.3c.3-.4 0-.9-.5-.9h-5.6z" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <path class="i-strike" d="M13.5 2.8 5.4 13.1c-.3.4 0 .9.5.9h5.6l-1 7.2 8.1-10.3c.3-.4 0-.9-.5-.9h-5.6z"/>
    <path class="i-spark i-fx" d="M8.7 19.3 7.3 18.5M12.3 19.3l1.4-.8"/>`,
  sparkles: `
    <path class="i-big" d="M10 6.5c.7 3.8 2.8 5.9 6.5 6.5-3.7.6-5.8 2.7-6.5 6.5-.7-3.8-2.8-5.9-6.5-6.5 3.7-.6 5.8-2.7 6.5-6.5z"/>
    <path class="i-plus" d="M18 3.5v4M16 5.5h4"/>
    <path class="i-glint i-fx" d="M4.5 3.5v2.4M3.3 4.7h2.4"/>
    <circle class="i-speck" cx="19" cy="17.5" r="1.2" fill="currentColor" stroke="none"/>`,
};

export const motion = {
  reply: "The arrowhead winds up, snaps back along the line as the tail stretches after it, and a faint echo of the head keeps going.",
  at: "The tail unwinds into the a, which dips, then writes itself back round the ring.",
  video: "The record light blinks twice while the lens pushes out to zoom and draws back.",
  megaphone: "The horn tips back, kicks up with a shout, and short bursts of sound fly out of the mouth.",
  alarm: "A hammer swings between the bells, the bells jump in turn, and the clock shivers on its legs.",
  hourglass: "The sand runs through in a stream of grains, then the glass tips back and turns over.",
  timer: "The crown clicks in, the hand sweeps a lap leaving a shaded wedge of elapsed time, and it clicks to a stop.",
  repeat: "A break runs round each track into its arrowhead, and each head nudges forward as it arrives.",
  sun: "The sun squints, then its rays flick outward one by one around the dial.",
  cloud: "The cloud billows up and settles, shedding a small wisp that drifts away.",
  bolt: "The bolt draws up, strikes down with a flash, and sparks jump from its tip.",
  sparkles: "The big star glints tall then wide, the small ones twinkle after it, and a new spark winks on and out.",
};
