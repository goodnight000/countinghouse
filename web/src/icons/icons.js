// Charade: a line icon set drawn on a 24 grid, where every icon acts out what it means once
// when the control holding it is hovered or focused. Each set lives in sets/<set>.js with its
// motion in the matching .css; icons.css pulls them all in.
import * as core from "./sets/core.js";
import * as nav from "./sets/nav.js";
import * as arrows from "./sets/arrows.js";
import * as states from "./sets/states.js";
import * as talk from "./sets/talk.js";
import * as people from "./sets/people.js";
import * as media from "./sets/media.js";
import * as files from "./sets/files.js";
import * as editing from "./sets/editing.js";
import * as build from "./sets/build.js";
import * as things from "./sets/things.js";
import * as world from "./sets/world.js";
import * as work from "./sets/work.js";
import * as life from "./sets/life.js";
import * as nature from "./sets/nature.js";

const SETS = [core, nav, arrows, states, talk, people, media, files, editing, build, things, world, work, life, nature];

/** Every icon's inner markup, by name. */
export const icons = {};
/** One line per icon on what it does when it plays. */
export const motion = {};
/** The sets in display order: `{ title, names }`. */
export const sets = SETS.map((s) => ({ title: s.title, names: Object.keys(s.icons) }));

for (const set of SETS)
  for (const [name, body] of Object.entries(set.icons)) {
    if (icons[name]) throw new Error(`icon: ${name} is defined twice`);
    icons[name] = body;
    motion[name] = set.motion?.[name] ?? "";
  }

const escape = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * An icon as an SVG string. `label` makes it an image with that accessible name; without one it
 * is decorative (`aria-hidden`). `class` adds classes. Unknown names throw, so a typo fails
 * where it is written.
 */
export function icon(name, { label, class: cls = "", size = 24 } = {}) {
  const body = icons[name];
  if (body === undefined) throw new Error(`icon: no icon named ${name}`);
  const a11y = label ? `role="img" aria-label="${escape(label)}"` : `aria-hidden="true"`;
  return `<svg class="ic ic-${name}${cls ? ` ${escape(cls)}` : ""}" width="${size}" height="${size}" viewBox="0 0 24 24" ${a11y}>${body}</svg>`;
}

/** Replaces every `<svg data-icon="name">` (or `<i data-icon>`) under `root` with its icon. */
export function hydrate(root = document) {
  for (const el of root.querySelectorAll("[data-icon]"))
    el.outerHTML = icon(el.dataset.icon, {
      label: el.getAttribute("aria-label") ?? undefined,
      class: el.getAttribute("class") ?? "",
    });
}
