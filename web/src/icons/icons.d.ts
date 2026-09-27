/** Every icon's inner markup, by name. */
export const icons: Record<string, string>;
/** One line per icon on what it does when it plays. */
export const motion: Record<string, string>;
/** The sets in display order. */
export const sets: { title: string; names: string[] }[];
/**
 * An icon as an SVG string. `label` makes it an image with that accessible name; without one it
 * is decorative. Unknown names throw.
 */
export function icon(name: string, options?: { label?: string; class?: string; size?: number }): string;
/** Replaces every `[data-icon]` element under `root` with its icon. */
export function hydrate(root?: ParentNode): void;
