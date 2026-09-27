// The first set: the icons the app shipped with (places, actions, things). Drawn on the 24 grid
// in the wordmark's round stroke; motion in core.css.

export const title = "Core";
export const icons = {
  // Places
  book: `
    <path d="M12 6.5C9.9 5.1 7.1 4.6 4.4 4.9a1 1 0 0 0-.9 1v11.7a.9.9 0 0 0 1 .9c2.7-.2 5.4.3 7.5 1.5"/>
    <path d="M12 6.5c2.1-1.4 4.9-1.9 7.6-1.6a1 1 0 0 1 .9 1v11.7a.9.9 0 0 1-1 .9c-2.7-.2-5.4.3-7.5 1.5z"/>
    <path class="i-ribbon" d="M15.8 5.4v4.5l1-.8 1 .8V5" fill="currentColor" stroke-width="1"/>
    <path class="i-leaf i-leaf-1 i-fx" fill="currentColor" fill-opacity=".14" d="M12 6.5c2.1-1.4 4.9-1.9 7.6-1.6a1 1 0 0 1 .9 1v11.7a.9.9 0 0 1-1 .9c-2.7-.2-5.4.3-7.5 1.5z"/>
    <path class="i-leaf i-leaf-2 i-fx" fill="currentColor" fill-opacity=".14" d="M12 6.5c2.1-1.4 4.9-1.9 7.6-1.6a1 1 0 0 1 .9 1v11.7a.9.9 0 0 1-1 .9c-2.7-.2-5.4.3-7.5 1.5z"/>`,
  link: `
    <path class="i-half-l" d="M10 7.5H7.5a4.5 4.5 0 0 0 0 9H10"/>
    <path class="i-half-r" d="M14 7.5h2.5a4.5 4.5 0 0 1 0 9H14"/>
    <path class="i-bar" d="M8.5 12h7"/>
    <path class="i-spark i-fx" d="M12 4.2v1.6M12 18.2v1.6M9.2 5l.7 1.2M14.8 5l-.7 1.2"/>`,
  lock: `
    <path class="i-shackle" d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>
    <g class="i-body"><rect x="4.5" y="10.5" width="15" height="10.5" rx="3"/>
    <path class="i-keyhole" d="M12 13.3a1.5 1.5 0 0 0-.75 2.8l-.25 1.9h2l-.25-1.9a1.5 1.5 0 0 0-.75-2.8z" fill="currentColor" stroke-width="1"/></g>`,
  sliders: `
    <path d="M4 6.5h16M4 12h16M4 17.5h16"/>
    <circle class="i-knob i-knob-1" cx="9" cy="6.5" r="2" fill="currentColor"/>
    <circle class="i-knob i-knob-2" cx="15.5" cy="12" r="2" fill="currentColor"/>
    <circle class="i-knob i-knob-3" cx="7" cy="17.5" r="2" fill="currentColor"/>`,
  "log-out": `
    <path class="i-door" d="M10 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h3"/>
    <g class="i-arrow"><path d="M9.5 12H20"/><path d="M16.5 15.5C17.3 14 18.5 12.8 20 12C18.5 11.2 17.3 10 16.5 8.5"/></g>`,

  // Actions
  send: `
    <path class="i-trail i-fx" d="M2.5 21.5C5 21 7.6 19 7.3 16.8c-.2-1.6-2.3-1.9-2.7-.6-.5 1.6 2.1 2.7 5.6-.6" stroke-width="1.25" stroke-dasharray="1.1 1.7"/>
    <g class="i-plane"><path d="M20.06 3.33Q21 3 20.67 3.94L15.1 19.75Q14.8 20.6 14.39 19.8L10.9 13.1 4.2 9.61Q3.4 9.2 4.25 8.9z"/>
    <path d="M10.9 13.1 17.2 6.8"/></g>`,
  plus: `
    <path class="i-bar" d="M5 12h14"/>
    <path class="i-stem" d="M12 5v14"/>`,
  x: `
    <path class="i-blade-a" d="M6.5 6.5l11 11"/>
    <path class="i-blade-b" d="M17.5 6.5l-11 11"/>`,
  check: `<path class="i-tick" pathLength="1" d="M4.8 12.6l4.6 4.6L19.2 7.4"/>`,
  copy: `
    <path class="i-back" d="M15.5 8.5V6.5A2.5 2.5 0 0 0 13 4H6.5A2.5 2.5 0 0 0 4 6.5V13a2.5 2.5 0 0 0 2.5 2.5h2"/>
    <rect class="i-ghost i-fx" x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5" fill="currentColor" fill-opacity=".14"/>
    <rect class="i-front" x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/>`,
  chevron: `
    <path class="i-echo i-fx" d="M9.5 6l6 6-6 6"/>
    <path class="i-chev" d="M9.5 6l6 6-6 6"/>`,
  pencil: `
    <g class="i-tool"><path d="M14.3 5.2a2.1 2.1 0 0 1 3 0l1.5 1.5a2.1 2.1 0 0 1 0 3L9.5 19H5v-4.5z"/><path d="M12.8 6.7l4.5 4.5"/>
    <path d="M5 16.9V19h2.1z" fill="currentColor" stroke-width="1"/></g>
    <path class="i-scribble i-ink" pathLength="1" d="M4 21.8c1.8-1.2 3.2 1.2 5 0s3.2 1.2 5 0 3.2 1.2 5 0"/>`,
  trash: `
    <g class="i-lid"><path d="M4 7h16"/><path d="M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7"/></g>
    <g class="i-can"><path d="M6 7l.9 12a2 2 0 0 0 2 1.9h6.2a2 2 0 0 0 2-1.9L18 7"/><path d="M10 11v5.5M14 11v5.5"/></g>
    <circle class="i-crumb i-fx" cx="12" cy="1.5" r="1.1" fill="currentColor" stroke="none"/>`,
  search: `
    <g class="i-lens"><path class="i-glass" d="M14.03 4.46A7 7 0 1 0 16.54 6.97"/><path class="i-handle" d="M15.5 15.5 20.5 20.5"/>
    <path class="i-glint i-fx" d="M7 10a3.6 3.6 0 0 1 3-3"/></g>`,

  // Things
  card: `
    <g class="i-face"><rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M3 9.5h18"/>
    <rect class="i-chip" x="6" y="12.3" width="3.8" height="3" rx=".9" fill="currentColor" stroke="none"/>
    <path class="i-wave i-wave-1 i-fx" d="M12 12.6a1.7 1.7 0 0 1 0 2.4"/>
    <path class="i-wave i-wave-2 i-fx" d="M14 11.3a3.6 3.6 0 0 1 0 5"/>
    <path class="i-wave i-wave-3 i-fx" d="M16 10.4a5.4 5.4 0 0 1 0 6.8"/></g>`,
  key: `
    <g class="i-blade"><circle cx="7.5" cy="16.5" r="4"/><path d="M10.3 13.7 19.5 4.5M15.8 8.2l2.2 2.2M18.2 5.8l1.8 1.8"/>
    <circle cx="7.5" cy="16.5" r="1.3" fill="currentColor" stroke="none"/></g>`,
  pin: `
    <path class="i-shadow" d="M9.5 21.8h5"/>
    <g class="i-drop"><path d="M12 20s-6.5-5.4-6.5-10.8a6.5 6.5 0 0 1 13 0C18.5 14.6 12 20 12 20z"/>
    <circle cx="12" cy="9.2" r="1.9" fill="currentColor" stroke="none"/></g>`,
  phone: `
    <g class="i-handset"><path d="M6.6 3.5h2.6c.4 0 .8.3.9.7l1 3.3c.1.4 0 .8-.3 1l-1.7 1.3a11.5 11.5 0 0 0 5.1 5.1l1.3-1.7c.2-.3.6-.4 1-.3l3.3 1c.4.1.7.5.7.9v2.6a2.1 2.1 0 0 1-2.3 2.1A16.5 16.5 0 0 1 4.5 5.8a2.1 2.1 0 0 1 2.1-2.3z"/></g>
    <path class="i-wave i-wave-1 i-fx" d="M14.5 7.2a3 3 0 0 1 2.3 2.3"/>
    <path class="i-wave i-wave-2 i-fx" d="M14.8 3.6a6.6 6.6 0 0 1 5.6 5.6"/>`,
  tag: `
    <path class="i-string i-fx" d="M8 8C6.8 6.2 5.8 4.2 5.4 1.8"/>
    <path class="i-tab" d="M3.5 11.4V5a1.5 1.5 0 0 1 1.5-1.5h6.4c.5 0 .9.2 1.2.5l7.9 7.9c.6.6.6 1.6 0 2.2l-6.4 6.4c-.6.6-1.6.6-2.2 0L4 12.6a1.7 1.7 0 0 1-.5-1.2z"/>
    <circle class="i-hole" cx="8" cy="8" r="1.4" fill="currentColor" stroke="none"/>`,
  shield: `
    <path class="i-dart i-fx" d="M23 9.5h-2.2"/>
    <g class="i-guard"><path d="M12 3.1l6.2 2.4a1.3 1.3 0 0 1 .8 1.2v4.8c0 4.4-3 7.8-7 9.5-4-1.7-7-5.1-7-9.5V6.7a1.3 1.3 0 0 1 .8-1.2z"/>
    <path class="i-tick" d="M9 12.2l2.1 2.1 4-4.2"/></g>`,
  eye: `
    <path class="i-upper" d="M2.4 12C4.3 8 7.9 5.5 12 5.5s7.7 2.5 9.6 6.5"/>
    <path class="i-lower" d="M2.4 12c1.9 4 5.5 6.5 9.6 6.5s7.7-2.5 9.6-6.5"/>
    <g class="i-look"><circle cx="12" cy="12" r="3.3"/><circle class="i-pupil" cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></g>`,
  hand: `
    <g class="i-palm"><path class="i-finger i-f-1" d="M8 13.5V6a1.5 1.5 0 0 1 3 0v5"/><path class="i-finger i-f-2" d="M11 10.5V4.5a1.5 1.5 0 0 1 3 0v6"/>
    <path class="i-finger i-f-3" d="M14 10.5V6a1.5 1.5 0 0 1 3 0v5.5"/>
    <path d="M17 9.5a1.5 1.5 0 0 1 3 0v4.8a6.7 6.7 0 0 1-6.7 6.7h-1.4a6.7 6.7 0 0 1-5.4-2.7l-2.4-3.2a1.5 1.5 0 0 1 2.4-1.8L8 15"/></g>`,
  mobile: `
    <g class="i-buzz"><rect x="6" y="2.5" width="12" height="19" rx="3"/>
    <rect class="i-island" x="10.3" y="4.7" width="3.4" height="1.5" rx=".75" fill="currentColor" stroke="none"/></g>`,
  fingerprint: `
    <path class="i-ridge i-ridge-1" d="M4.5 14v-2.5a7.5 7.5 0 0 1 15 0V13"/>
    <path class="i-ridge i-ridge-2" d="M7 18.5v-7a5 5 0 0 1 10 0v5"/>
    <path class="i-ridge i-ridge-3" d="M9.5 20.5v-9a2.5 2.5 0 0 1 5 0V18"/>
    <path class="i-ridge i-ridge-4" d="M12 11.5V16"/>
    <path class="i-scan i-fx" d="M5 3.5h14"/>`,
  chat: `
    <path class="i-bubble" d="M12 4.5c4.7 0 8.5 3 8.5 6.9s-3.8 6.9-8.5 6.9c-.9 0-1.8-.1-2.6-.3-1 .9-2.6 1.6-4.6 1.7.8-.8 1.3-1.8 1.4-2.9-1.6-1.3-2.7-3.2-2.7-5.4 0-3.9 3.8-6.9 8.5-6.9z"/>
    <circle class="i-dot i-dot-1 i-fx" cx="8.5" cy="11.4" r="1" fill="currentColor" stroke="none"/>
    <circle class="i-dot i-dot-2 i-fx" cx="12" cy="11.4" r="1" fill="currentColor" stroke="none"/>
    <circle class="i-dot i-dot-3 i-fx" cx="15.5" cy="11.4" r="1" fill="currentColor" stroke="none"/>`,
  mic: `
    <g class="i-capsule"><rect x="9" y="3" width="6" height="11" rx="3"/>
    <path class="i-level i-level-1 i-fx" d="M10.9 11.3h2.2"/><path class="i-level i-level-2 i-fx" d="M10.9 8.6h2.2"/><path class="i-level i-level-3 i-fx" d="M10.9 5.9h2.2"/></g>
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>
    <path class="i-voice i-voice-l i-fx" d="M2.6 8.2a4.5 4.5 0 0 0 0 5.6"/><path class="i-voice i-voice-r i-fx" d="M21.4 8.2a4.5 4.5 0 0 1 0 5.6"/>`,
  people: `
    <g class="i-behind"><path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M17.5 14.3a6 6 0 0 1 3.5 5.7"/></g>
    <g class="i-ahead"><circle class="i-head" cx="9" cy="8" r="3.5"/><path class="i-body" d="M3 20a6 6 0 0 1 12 0"/></g>`,
  clock: `
    <path d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <path class="i-hour" d="M12 12l3 1.8"/><path class="i-minute" d="M12 12V6.8"/>
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>`,
  moon: `
    <path class="i-crescent" d="M20 14.2A8 8 0 1 1 9.8 4a6.5 6.5 0 0 0 10.2 10.2z"/>
    <path class="i-star" d="M17.6 4.4q.4 1.8 2.2 2.2-1.8.4-2.2 2.2-.4-1.8-2.2-2.2 1.8-.4 2.2-2.2z" fill="currentColor" stroke-width="1"/>
    <path class="i-spark i-fx" d="M20.8 10.3v1.4M20.1 11h1.4"/>`,
  globe: `
    <path d="M16.62 4.87A8.5 8.5 0 1 0 19.13 7.38"/>
    <path d="M3.5 12h17"/>
    <path class="i-meridian" d="M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5z"/>
    <path class="i-meridian-next i-fx" d="M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5z"/>`,
  mail: `
    <rect x="3" y="5.5" width="18" height="13" rx="3"/>
    <g class="i-flap"><path d="M3.6 7.6l7.3 5a2 2 0 0 0 2.2 0l7.3-5"/>
    <circle class="i-seal" cx="12" cy="13.1" r="2" fill="currentColor" stroke="none"/></g>`,
  calendar: `
    <rect x="3.5" y="5" width="17" height="15.5" rx="3"/>
    <path class="i-sheet i-fx" d="M3.5 10h17v7.5a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3z" fill="currentColor" fill-opacity=".14" stroke="none"/>
    <path d="M3.5 10h17"/><g class="i-rings"><path d="M8 3v3.5M16 3v3.5"/></g>
    <rect class="i-day" x="7" y="13" width="3.2" height="3.2" rx=".8" fill="currentColor" stroke="none"/>`,
};

export const motion = {
  book: "Two pages riffle over from right to left, and the ribbon bookmark flutters in their wake before it settles.",
  link: "The right link tilts and pulls off the bar, then swings back and clicks in; the left link recoils and a spark flashes at the joint.",
  lock: "The keyhole turns, the shackle pops up and swings open, then drops back and the body clicks shut.",
  sliders: "Each knob is flicked along its track in turn, squashing as it travels, then springs back to its setting.",
  "log-out": "The arrow draws back and shoots out through the doorway, the door frame jolts, and the arrow slides back in from inside.",
  send: "The paper plane tilts back, darts off to the upper right leaving a curling dashed trail, and glides back in from the lower left to settle.",
  plus: "The upright bar lifts and drops onto the crossbar, which dips under it and springs back.",
  x: "The two strokes open a little wider, snap shut like scissor blades, and spring back apart.",
  check: "The tick is erased along its stroke, redrawn with a quick flick, and pressed down like a stamp.",
  copy: "The front sheet is pressed, the old copy clears, and a tinted duplicate slides up behind it to become the back sheet.",
  chevron: "The chevron leans back, pushes forward with its point narrowing, and a faint echo carries on ahead as it snaps back.",
  pencil: "The pencil sets down, writes a wavy line, and lifts off as the line fades.",
  trash: "The lid tips open, a crumb drops in, the lid slams and the can gulps.",
  search: "The lens sweeps across in a short arc, stops, swells to magnify, and a glint crosses the glass.",
  card: "The card leans back and taps forward; its chip flashes and contactless waves ripple out from it.",
  key: "The key slides into the lock, turns a quarter so it goes edge-on, turns back, and draws out.",
  pin: "The pin crouches, hops up while its shadow shrinks, and plants back into the ground with a squash.",
  phone: "The handset rattles through two rings, lifting off each time, with sound waves on every ring.",
  tag: "A string appears through the hole and the tag swings on it like a pendulum until it hangs still.",
  shield: "A dart strikes the shield's side and glances off; the shield braces and the tick swells.",
  eye: "The eye glances to the side, looks back at you, blinks, and the pupil widens.",
  hand: "The hand waves hello while its fingers ripple one after another.",
  mobile: "The island swells into a notification, the phone buzzes, and the island shrinks back.",
  fingerprint: "The print dims and a scan line passes down it, lighting each ridge as it is read.",
  chat: "The bubble squeezes and puffs up from its tail, and three typing dots bounce twice in a wave.",
  mic: "Level bars rise and fall inside the capsule as it sways, and sound ripples out on both sides.",
  people: "The friend behind leans out to say hello and the one in front turns toward them.",
  clock: "The minute hand winds back, sweeps a full hour and nudges the hour hand as it passes, then settles with a small overshoot.",
  moon: "The crescent rocks like a cradle while its star twinkles and turns, and a small spark winks nearby.",
  globe: "The globe spins: the meridian rolls off to the right and a new one rolls in from the left.",
  mail: "The seal pops, the flap swings open and closes again, and the seal presses back down.",
  calendar: "The day's page tears off and falls away as the rings jolt, and the next day pops into place.",
};
