// Weather and nature: cloud-rain, snowflake, wind, thermometer, umbrella, droplet, flame, leaf, tree,
// mountain. Motion in nature.css.

export const title = "Weather and nature";
export const icons = {
  "cloud-rain": `
    <path class="i-puff" d="M7 15.5h10a4 4 0 0 0 .5-7.97 5.5 5.5 0 0 0-10.75-.9A4.5 4.5 0 0 0 7 15.5z"/>
    <path class="i-rain i-rain-1" d="M8.5 17.5l-.8 2.2"/>
    <path class="i-rain i-rain-2" d="M12.5 18.5l-.8 2.2"/>
    <path class="i-rain i-rain-3" d="M16.5 17.5l-.8 2.2"/>
    <path class="i-splash i-fx" d="M6.4 22.3l-.5-.5M8 22.3l.5-.5M10.4 22.8l-.5-.5M12 22.8l.5-.5M14.4 22.3l-.5-.5M16 22.3l.5-.5"/>`,
  snowflake: `
    <g class="i-flake">
    <path d="M12 12V3M12 12 4.21 7.5M12 12 4.21 16.5M12 12V21M12 12l7.79 4.5M12 12l7.79-4.5"/>
    <path class="i-tip i-tip-1" d="M10.2 5L12 6.8L13.8 5"/>
    <path class="i-tip i-tip-2" d="M5.04 10.06L7.5 9.4L6.84 6.94"/>
    <path class="i-tip i-tip-3" d="M6.84 17.06L7.5 14.6L5.04 13.94"/>
    <path class="i-tip i-tip-4" d="M13.8 19L12 17.2L10.2 19"/>
    <path class="i-tip i-tip-5" d="M18.96 13.94L16.5 14.6L17.16 17.06"/>
    <path class="i-tip i-tip-6" d="M17.16 6.94L16.5 9.4L18.96 10.06"/></g>`,
  wind: `
    <path class="i-gust i-gust-1" pathLength="1" d="M3 8.5h9a2.5 2.5 0 1 0-2.5-2.5"/>
    <path class="i-gust i-gust-2" pathLength="1" d="M3 12.5h14.5a2.5 2.5 0 1 0-2.5-2.5"/>
    <path class="i-gust i-gust-3" pathLength="1" d="M3 16.5h8a2.5 2.5 0 1 1-2.5 2.5"/>`,
  thermometer: `
    <path d="M8.5 13.8V5a2 2 0 0 1 4 0v8.8a3.8 3.8 0 1 1-4 0z"/>
    <path d="M15.5 5.5h2M15.5 9h2M15.5 12.5h2"/>
    <path class="i-mercury" d="M10.5 16V9.5"/>
    <circle class="i-bulb" cx="10.5" cy="17" r="1.6" fill="currentColor" stroke="none"/>`,
  umbrella: `
    <g class="i-canopy"><path d="M3.5 12a8.5 8.5 0 0 1 17 0c-.9-1-1.9-1.5-2.9-1.5s-2 .5-2.8 1.5c-.8-1-1.8-1.5-2.8-1.5s-2 .5-2.8 1.5c-.8-1-1.8-1.5-2.8-1.5s-2 .5-2.9 1.5zM12 3.5V2.3"/></g>
    <path d="M12 10.5v8a2 2 0 0 1-4 0"/>
    <path class="i-drop i-fx" d="M12 -1.6c.8 1 1.2 1.7 1.2 2.3a1.2 1.2 0 0 1-2.4 0c0-.6.4-1.3 1.2-2.3z" fill="currentColor" stroke="none"/>
    <circle class="i-fleck i-fx" cx="4" cy="11" r=".7" fill="currentColor" stroke="none"/>`,
  droplet: `
    <g class="i-drop"><path d="M12 2.8c3 3.3 6.5 7.2 6.5 11.4a6.5 6.5 0 0 1-13 0c0-4.2 3.5-8.1 6.5-11.4z"/>
    <path d="M9.2 14.6a3 3 0 0 0 2.4 2.9"/></g>
    <path class="i-ripple i-fx" d="M6.5 21.2c1.5.6 3.4.9 5.5.9s4-.3 5.5-.9"/>
    <circle class="i-bead i-bead-l i-fx" cx="9" cy="20.5" r=".75" fill="currentColor" stroke="none"/>
    <circle class="i-bead i-bead-r i-fx" cx="15" cy="20.5" r=".75" fill="currentColor" stroke="none"/>`,
  flame: `
    <path class="i-blaze" d="M12 21c-3.6 0-6.5-2.6-6.5-6.2 0-3 1.8-4.8 3.2-6.8.3 1.6 1 2.7 2.1 3.3.1-3.6 1.6-6.5 4.2-8.3-.2 3.2 1.4 5 2.4 6.8.8 1.4 1.1 2.8 1.1 4.2 0 4.2-2.9 7-6.5 7z"/>
    <path class="i-heart" d="M12 19c-1.1 0-1.9-.8-1.9-1.9 0-1.2 1-2.1 1.9-3.3.9 1.2 1.9 2.1 1.9 3.3 0 1.1-.8 1.9-1.9 1.9z" fill="currentColor" stroke="none"/>
    <circle class="i-ember i-fx" cx="15" cy="3.5" r=".8" fill="currentColor" stroke="none"/>`,
  leaf: `
    <path d="M3.5 20.5 6 18"/>
    <g class="i-blade"><path d="M6 18C4.5 11 9 4.5 19.5 4.5c.5 9.5-5.5 14.5-13.5 13.5z"/>
    <path d="M6 18c3-4 6.5-7.5 10-10"/></g>`,
  tree: `
    <g class="i-trunk"><path d="M12 21.5V13M12 16l2.5-2"/></g>
    <path class="i-crown" d="M8.5 16.5a4 4 0 0 1-1.9-7.5 5.5 5.5 0 0 1 10.8 0 4 4 0 0 1-1.9 7.5z"/>
    <path d="M8 21.5h8"/>`,
  mountain: `
    <path d="M2.5 20 8.9 7.3c.5-.9 1.7-.9 2.2 0l3.1 6.2 1.3-1.9c.5-.7 1.5-.7 2 0L21.5 20z"/>
    <path d="M7.2 10.8l1.5 1.2 1.3-1.2 1.3 1.2 1.3-1.1"/>
    <circle class="i-sun" cx="18.5" cy="5" r="1.6" fill="currentColor" stroke="none"/>
    <g class="i-flag i-fx"><path d="M10 6.2V.8"/><path class="i-pennant" d="M10 .8h4.2l-1.2 1.5 1.2 1.5H10"/></g>`,
};
export const motion = {
  "cloud-rain": "The cloud wrings itself out and two waves of rain fall and splash on the ground.",
  snowflake: "The flake turns one sixth while a shimmer runs round the tips of its arms.",
  wind: "A break runs along each gust and out through its curl, one gust after another.",
  thermometer: "The bulb squeezes, the mercury shoots to the top, wavers, and cools back down.",
  umbrella: "A raindrop lands on the canopy and runs off, and the canopy shakes the rest away.",
  droplet: "The drop stretches, falls and splashes, and a new one swells from the tip.",
  flame: "The flame flickers and flares, its heart leaps, and an ember floats off the tip.",
  leaf: "The leaf lets go and drifts down side to side, and a new one unfurls from the stem.",
  tree: "The tree crouches, shoots up with its crown puffed out, and settles.",
  mountain: "A flag is planted on the summit and flutters while the sun beams.",
};
