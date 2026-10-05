// Shared motion maths for the home page. Ported from our own lemma-replica
// engine (src/sections/hero-scene.js and hero-intro.js), where every one of
// these was checked at three interior points against the reference.

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 at a, 1 at b, clamped. */
export const prog = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn3 = (t: number) => t * t * t;
export const easeInOut3 = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Caption wipe on a clip-path. Entering, it uncovers left to right; leaving,
 * it is eaten from the left. Cubic ease-out both ways. Driven by the scene's
 * progress, never by a timer, so it reverses when you scroll back.
 */
export function capClip(entry: number, exit: number) {
  if (exit >= 1 || entry <= 0) return "inset(0 0 0 100%)";
  if (exit > 0) return `inset(0 0 0 ${(100 * easeOut3(clamp(exit))).toFixed(2)}%)`;
  return `inset(0 ${((1 - easeOut3(clamp(entry))) * 100).toFixed(2)}% 0 0)`;
}

/** Mulberry32, so every scatter on the page is the same on every load. */
export function rng(seed: number) {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let a = Math.imul(t ^ (t >>> 15), 1 | t);
    a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
    return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
  };
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
