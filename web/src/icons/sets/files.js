// Files and data: file, folder, image, paperclip, archive, note, list, checklist, quote, chart, newspaper, database. Motion in files.css.

export const title = "Files and data";
export const icons = {
  file: `
    <g class="i-sheet"><path d="M13.4 2.5H8A3 3 0 0 0 5 5.5v13a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8.1a1.4 1.4 0 0 0-.4-1L14.4 2.9a1.4 1.4 0 0 0-1-.4z"/>
    <g class="i-fold"><path class="i-flap i-fx" fill="currentColor" fill-opacity=".14" stroke="none" d="M13.5 2.6V6a2 2 0 0 0 2 2h3.4z"/><path d="M13.5 2.6V6a2 2 0 0 0 2 2h3.4"/></g>
    <path class="i-ink i-ink-1" pathLength="1" d="M8.5 12.5h7"/><path class="i-ink i-ink-2" pathLength="1" d="M8.5 16h4.5"/></g>`,
  folder: `
    <path d="M3.5 17.5V6.5A2.5 2.5 0 0 1 6 4h3c.7 0 1.3.3 1.8.8L12.5 6.5H18a2.5 2.5 0 0 1 2.5 2.5v8.5"/>
    <path class="i-sheet i-fx" fill="currentColor" fill-opacity=".14" d="M7 12V9.5A1.5 1.5 0 0 1 8.5 8h7A1.5 1.5 0 0 1 17 9.5V12"/>
    <path class="i-front" d="M3.5 10.5h17V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18z"/>`,
  image: `
    <rect x="3.5" y="4" width="17" height="16" rx="3"/>
    <path d="M3.8 17.8l4.6-4.6a1.5 1.5 0 0 1 2.1 0l6.6 6.6"/>
    <path d="M14.1 16.5l1.4-1.4a1.5 1.5 0 0 1 2.1 0l2.7 2.7"/>
    <path class="i-star i-fx" d="M8 6.8v2.4M6.8 8h2.4"/>
    <circle class="i-sun" cx="15.5" cy="9" r="1.7" fill="currentColor" stroke="none"/>`,
  paperclip: `
    <g class="i-clip"><g transform="rotate(45 12 12)">
    <path d="M16 16.5a4 4 0 0 1-8 0V6a3 3 0 0 1 6 0v10a1.5 1.5 0 0 1-3 0V8.5"/>
    <path class="i-leg" d="M16 16.5V8.5"/></g></g>`,
  archive: `
    <g class="i-lid"><rect x="3" y="3.5" width="18" height="5" rx="1.8"/></g>
    <rect class="i-doc i-fx" x="13.2" y="4.8" width="4.2" height="4.6" rx="1" fill="currentColor" fill-opacity=".14"/>
    <g class="i-box"><path d="M4.5 8.5V18A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5V8.5"/>
    <rect x="9.8" y="11.6" width="4.4" height="1.8" rx=".9" fill="currentColor" stroke="none"/></g>`,
  note: `
    <path class="i-gust i-gust-1 i-fx" d="M-1.5 9h2.5"/><path class="i-gust i-gust-2 i-fx" d="M-1 13h2"/>
    <g class="i-pad"><path d="M20 14V6.5A2.5 2.5 0 0 0 17.5 4h-11A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H14"/>
    <path class="i-curl" d="M20 14l-6 6v-3.5a2.5 2.5 0 0 1 2.5-2.5z"/></g>`,
  list: `
    <g class="i-row i-row-1"><circle class="i-bul" cx="5" cy="6" r="1.25" fill="currentColor" stroke="none"/><path class="i-ln" d="M9.5 6h10.5"/></g>
    <g class="i-row i-row-2"><circle class="i-bul" cx="5" cy="12" r="1.25" fill="currentColor" stroke="none"/><path class="i-ln" d="M9.5 12h10.5"/></g>
    <g class="i-row i-row-3"><circle class="i-bul" cx="5" cy="18" r="1.25" fill="currentColor" stroke="none"/><path class="i-ln" d="M9.5 18h10.5"/></g>`,
  checklist: `
    <path class="i-tick i-tick-1" d="M3.5 6.2l1.9 1.9 3.4-3.5"/><path class="i-bar i-bar-1" d="M12 6.5h8.5"/>
    <path class="i-tick i-tick-2" d="M3.5 12l1.9 1.9 3.4-3.5"/><path class="i-bar i-bar-2" d="M12 12.3h8.5"/>
    <path class="i-tick i-tick-3" d="M3.5 17.8l1.9 1.9 3.4-3.5"/><path class="i-bar i-bar-3" d="M12 18.1h8.5"/>`,
  quote: `
    <g class="i-mark i-mark-1"><path d="M4.9 15.5C4.9 11.3 7.1 8.3 10 6.8"/><circle cx="6.9" cy="15.5" r="2.4" fill="currentColor" stroke="none"/></g>
    <g class="i-mark i-mark-2"><path d="M13.9 15.5c0-4.2 2.2-7.2 5.1-8.7"/><circle cx="15.9" cy="15.5" r="2.4" fill="currentColor" stroke="none"/></g>`,
  chart: `
    <path d="M3.5 3.5v14a3 3 0 0 0 3 3h14"/>
    <path class="i-col i-col-1" d="M8.5 16.5v-4"/>
    <path class="i-col i-col-2" d="M13 16.5v-10"/>
    <path class="i-col i-col-3" d="M17.5 16.5v-6.5"/>`,
  newspaper: `
    <g class="i-paper"><path d="M5.5 20H18a2.5 2.5 0 0 0 2.5-2.5V6A2.5 2.5 0 0 0 18 3.5h-8A2.5 2.5 0 0 0 7.5 6v12a2 2 0 0 1-4 0v-7.5a1 1 0 0 1 1-1h3"/>
    <g class="i-type"><rect x="10.5" y="6.5" width="7" height="4" rx="1"/><path d="M10.5 13.8h7M10.5 16.8h4.5"/></g></g>`,
  database: `
    <circle class="i-record i-fx" cx="12" cy="0" r="1.3" fill="currentColor" stroke="none"/>
    <g class="i-top"><ellipse cx="12" cy="5.8" rx="7.75" ry="2.8"/></g>
    <path class="i-band" d="M4.25 12c0 1.5 3.5 2.8 7.75 2.8s7.75-1.3 7.75-2.8"/>
    <path class="i-base" d="M4.25 5.8v12.4c0 1.5 3.5 2.8 7.75 2.8s7.75-1.3 7.75-2.8V5.8"/>`,
};

export const motion = {
  file: "The folded corner flicks up and back like a thumbed page, and two lines of text show through for a moment.",
  folder: "The front flap swings open, a sheet rises to peek out, and it drops back in as the flap shuts.",
  image: "The sun sets behind the hills, a star blinks in the dark, and the sun rises back into place.",
  paperclip: "The clip slides onto a page: its free leg springs open, snaps shut, and the clip recoils.",
  archive: "The lid swings up on its back hinge, a page drops into the box, and the lid shuts with a bump.",
  note: "A gust blows past, the bottom of the note lifts and flutters, and it settles flat again.",
  list: "Each bullet hops in turn down the list, and its line stretches a little as it lands.",
  checklist: "Each tick is checked off in turn with a flick, and its line slides aside.",
  quote: "The two marks crook twice like fingers making air quotes.",
  chart: "The bars jump to new values like live data, the last one overtaking, then settle back.",
  newspaper: "The paper is snapped straight with a flick, and the printed columns catch up a beat later.",
  database: "A record drops in through the top, and the bands dip one after another as it sinks to the bottom.",
};
