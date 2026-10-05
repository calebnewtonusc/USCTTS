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
import { WORLDS, worldChroma, worldColour } from "../components/tts/grid/palette.ts";

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
console.log(`check-palette: ${failures} grey sample(s), min in-between chroma ${min.toFixed(3)} (floor ${FLOOR})`);
process.exit(failures ? 1 : 0);
