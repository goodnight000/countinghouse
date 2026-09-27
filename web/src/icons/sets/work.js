// Work and commerce: briefcase, box, truck, ticket, store, bank, calculator, percent, trending-up,
// trending-down, pie-chart, activity. Motion in work.css.

export const title = "Work and commerce";
export const icons = {
  briefcase: `
    <path class="i-fx i-paper" d="M5.6 12.5v-1.7a.9.9 0 0 1 .9-.9h4.3" stroke-width="1.25"/>
    <g class="i-lid"><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"/>
    <path d="M3 12.5v-2a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2"/></g>
    <path d="M3 12.5v5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-5M3 12.5h7.2M13.8 12.5H21"/>
    <rect class="i-clasp" x="10.3" y="11.2" width="3.4" height="2.6" rx=".9" fill="currentColor" stroke="none"/>`,
  box: `
    <g class="i-crate"><path d="M12 2.8l7.6 4.2c.6.3.9.9.9 1.5v7c0 .6-.3 1.2-.9 1.5L12 21.2l-7.6-4.2c-.6-.3-.9-.9-.9-1.5v-7c0-.6.3-1.2.9-1.5z"/>
    <path d="M3.8 7.4 12 12l8.2-4.6M12 12v9.2M7.9 5.1l8.2 4.6v1.8"/>
    <path class="i-tail" d="M16.1 11.5v2.2"/></g>`,
  truck: `
    <path class="i-fx i-speed" d="M-1 8.5h1.8M-.6 12h1.4"/>
    <g class="i-rig"><g class="i-body"><rect class="i-load" x="2" y="5" width="12" height="10" rx="2"/>
    <path d="M14 8.5h3.4c.6 0 1.1.3 1.4.8l2 3.1c.1.2.2.5.2.8V14a1 1 0 0 1-1 1H14M16.2 8.5V12h4.5"/></g>
    <circle cx="6.5" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/></g>`,
  ticket: `
    <g class="i-main"><path d="M14.5 6h-9a2 2 0 0 0-2 2v1.5a2.5 2.5 0 0 1 0 5V16a2 2 0 0 0 2 2h9"/>
    <path d="M14.5 8.8v.4M14.5 11.8v.4M14.5 14.8v.4"/></g>
    <path class="i-stub" d="M14.5 6h4a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V16a2 2 0 0 1-2 2h-4"/>`,
  store: `
    <path d="M3.5 9.5 5 4.9c.3-.8 1-1.4 1.9-1.4h10.2c.9 0 1.6.6 1.9 1.4l1.5 4.6"/>
    <path class="i-valance" d="M3.5 9.5a2.13 2.13 0 0 0 4.25 0 2.13 2.13 0 0 0 4.25 0 2.13 2.13 0 0 0 4.25 0 2.13 2.13 0 0 0 4.25 0"/>
    <path d="M5 13v5.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V13"/>
    <path class="i-door" d="M10 20.5V17a2 2 0 0 1 4 0v3.5"/>`,
  bank: `
    <g class="i-roof"><path d="M3.5 9.5h17l-7.6-4.6a1.8 1.8 0 0 0-1.8 0z"/>
    <circle class="i-seal" cx="12" cy="7.4" r="1" fill="currentColor" stroke="none"/></g>
    <path class="i-col i-col-1" d="M6 12v6"/><path class="i-col i-col-2" d="M10 12v6"/>
    <path class="i-col i-col-3" d="M14 12v6"/><path class="i-col i-col-4" d="M18 12v6"/>
    <path d="M3.5 20.5h17"/>`,
  calculator: `
    <rect x="4.5" y="2.5" width="15" height="19" rx="3"/>
    <rect x="7.5" y="5.5" width="9" height="3.6" rx="1"/>
    <path class="i-fx i-digit i-d1" d="M14.6 7.3h.01" stroke-width="1.3"/>
    <path class="i-fx i-digit i-d2" d="M14.6 7.3h.01" stroke-width="1.3"/>
    <path class="i-fx i-digit i-d3" d="M14.6 7.3h.01" stroke-width="1.3"/>
    <path class="i-ink i-sum" pathLength="1" d="M14.6 7.3h-4.4" stroke-width="1.3"/>
    <path class="i-key i-k1" d="M8.5 12.5h.01"/><path class="i-key" d="M12 12.5h.01"/><path class="i-key i-k3" d="M15.5 12.5h.01"/>
    <path class="i-key" d="M8.5 15.5h.01"/><path class="i-key i-k2" d="M12 15.5h.01"/>
    <path class="i-key" d="M8.5 18.5h.01"/><path class="i-key" d="M12 18.5h.01"/>
    <path class="i-key i-eq" d="M15.5 15.5v3"/>`,
  percent: `
    <path class="i-slash" d="M18.5 5.5 5.5 18.5"/>
    <g class="i-pair"><circle cx="7.5" cy="7.5" r="2.4"/><circle cx="16.5" cy="16.5" r="2.4"/></g>`,
  "trending-up": `
    <path class="i-line" pathLength="1" d="M3 17l5.5-5.5 4 4L21 7"/>
    <path class="i-head" d="M15.5 7H21v5.5"/>`,
  "trending-down": `
    <path class="i-line" pathLength="1" d="M3 7l5.5 5.5 4-4L21 17"/>
    <path class="i-head" d="M15.5 17H21v-5.5"/>`,
  "pie-chart": `
    <path class="i-pie" d="M12 12V3.5A8.5 8.5 0 1 0 20.5 12z"/>
    <circle class="i-fx i-crumb" cx="19.6" cy="12.6" r=".75" fill="currentColor" stroke="none"/>
    <path class="i-slice" d="M13.2 10.8V2.3a8.5 8.5 0 0 1 8.5 8.5z"/>`,
  activity: `
    <g class="i-trace"><path d="M2.5 12h4L9 6l5 12 2.5-6h5"/>
    <circle class="i-fx i-blip" cx="2.5" cy="12" r="1.4" fill="currentColor" stroke="none"/></g>`,
};

export const motion = {
  briefcase: "The clasp drops, the lid lifts on its hinge so a sheet of paper peeks out, and it clicks shut.",
  box: "The package hops, lands on one corner, tips flat, and the loose end of tape flaps and sticks back down.",
  truck: "The truck rolls forward with speed lines and brakes hard, its body pitching onto the front wheels and rocking back.",
  ticket: "The stub is torn along the perforation and swings away, then snaps back into place.",
  store: "The awning edge rolls up and drops open with a flap while the door swings open and shut.",
  bank: "The roof lifts as the columns stretch up one after another, then it drops back and they take the weight in turn.",
  calculator: "Three keys tap and their digits shift into the display, then the equals key swaps them for a result.",
  percent: "The two circles orbit to trade places while the slash ducks to let them pass.",
  "trending-up": "The line reels back to its start and draws up again with the arrowhead riding the tip.",
  "trending-down": "The line reels back to its start and draws down again with the arrowhead riding the tip.",
  "pie-chart": "The slice sinks into the pie, pops back out tilted and drops a crumb, then settles into place.",
  activity: "A blip runs along the trace and each peak spikes as it passes, like two heartbeats.",
};
