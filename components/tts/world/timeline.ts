/* The world's timeline, shared by the page and the 3D. Kept apart from
 * story.ts so the page can read it without pulling three.js into the first
 * bundle. T runs 0 to 1 over the intro and 1 to 2 over the story. */

/** Where the camera passes through the laptop screen. */
export const T_SWITCH = 0.42;
/** The storefront beats, as centres on T. */
export const BEATS = [1.24, 1.43, 1.62, 1.8];
export const BEAT_HALF = 0.06;
