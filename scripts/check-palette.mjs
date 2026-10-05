#!/usr/bin/env node
/*
 * Fails if any in-between ground colour of the chapter ramp goes grey.
 * Samples bg and bg2 at 10 steps across every world change in
 * components/tts/grid/palette.ts and exits 1 if OKLCh chroma drops below
 * 0.05. Straight interpolation measured #40556c (chroma about 0.04) and
 * #9aa3ad between night and dawn, the grey the H1 washed out on.
 *
 *   node scripts/check-palette.mjs
 *
 * Imports the .ts directly; needs Node 22.18+ (type stripping on by default).
 */
import { WORLDS, worldChroma, worldColour, viaColour } from "../components/tts/grid/palette.ts";

const FLOOR = 0.05;
const STEPS = 10;
const hex = (c) => "#" + c.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");

let failures = 0;
let min = Infinity;
for (let seg = 0; seg < WORLDS.length - 1; seg++) {
  for (let i = 1; i < STEPS; i++) {
    const w = seg + i / STEPS;
    for (const role of ["bg", "bg2"]) {
      const c = worldChroma(w, role);
      min = Math.min(min, c);
      if (c < FLOOR) {
        failures++;
        console.error(
          `grey: ${WORLDS[seg].name} -> ${WORLDS[seg + 1].name} at ${w.toFixed(1)}, ${role} ${hex(worldColour(w, role, [0, 0, 0]))} chroma ${c.toFixed(3)} < ${FLOOR}`,
        );
      }
    }
  }
}
/*
 * No orange anywhere light lands on a ground (review 3, 2026-10-05: gold
 * traces at partial alpha over cardinal printed rgb(184,54,11)). Every
 * light role of a world, and of the next world (the wavefront's crest is
 * the new world's light over the old ground), is blended over every ground
 * it can sit on, at the alphas points and lines actually draw at, and fails
 * if the result's HSL hue is 10 to 45 degrees with OKLCh chroma over 0.08.
 * Cardinal itself (HSL hue 0) and gold itself (48) pass; what lands
 * between them is the orange the brief bans.
 */
const LIGHT = ["street", "art", "flow", "hot", "hi", "wash", "grid"];
const ALPHAS = [0.12, 0.25, 0.4, 0.55, 0.7, 0.85];
const hslHue = ([r, g, b]) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d < 1e-6) return 0;
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
};
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const chroma = ([r, g, b]) => {
  const R = toLin(r), G = toLin(g), B = toLin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return Math.hypot(A, Bb);
};
let orange = 0;
const seen = new Set();
const grounds = [];
for (let w = 0; w < WORLDS.length; w++) {
  grounds.push([w, worldColour(w, "bg", [0, 0, 0]), `${WORLDS[w].name} bg`]);
  grounds.push([w, worldColour(w, "bg2", [0, 0, 0]), `${WORLDS[w].name} bg2`]);
}
for (let seg = 0; seg < WORLDS.length - 1; seg++)
  for (const role of ["bg", "bg2"]) grounds.push([seg + 0.5, viaColour(seg, role, [0, 0, 0]), `via ${seg} ${role}`]);
for (const [gw, ground, gname] of grounds) {
  // Each change's accent can be either world's light (transitions.ts:
  // the sunrise rakes the night's gold over dawn), so both neighbours.
  // A world's ground meets its own light and both neighbours' (a change
  // draws either world's light over it); a waypoint ground (k.5) only the
  // two worlds of its change.
  const near = Number.isInteger(gw)
    ? new Set([Math.max(0, gw - 1), gw, Math.min(WORLDS.length - 1, gw + 1)])
    : new Set([Math.floor(gw), Math.ceil(gw)]);
  for (const lw of near)
    for (const role of LIGHT) {
      const c = worldColour(lw, role, [0, 0, 0]);
      // The wash is only ever a glow, at 0.18 or less (shaders.ts).
      for (const a of role === "wash" ? ALPHAS.filter((x) => x <= 0.25) : ALPHAS) {
        const mix = c.map((v, i) => v * a + ground[i] * (1 - a));
        const h = hslHue(mix);
        const ch = chroma(mix);
        if (h >= 10 && h <= 45 && ch > 0.08) {
          const key = `${WORLDS[lw].name}.${role} on ${gname}`;
          if (seen.has(key)) continue;
          seen.add(key);
          orange++;
          console.error(`orange: ${key} at alpha ${a} -> ${hex(mix)} (hue ${h.toFixed(0)}, chroma ${ch.toFixed(3)})`);
        }
      }
    }
}
console.log(`check-palette: ${orange} orange blend(s) of light over ground`);
console.log(`check-palette: ${failures} grey sample(s), min in-between chroma ${min.toFixed(3)} (floor ${FLOOR})`);
process.exit(failures || orange ? 1 : 0);
