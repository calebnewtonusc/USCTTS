/* One field of cubes, and every beat of the home page is a form it takes.
 *
 * Caleb, 2026-10-04, on the world it replaces (a funnel, pipes, a ring, a
 * conveyor, cabinets, a sign, a chart and figures): "No one would look at
 * this and think it is as cool or cohesive as the lemma and clay sites." So
 * there is one object here, the way Lemma's bricks become diamonds, then the
 * lattice, then the mark. The same cubes, each with a stable index, go from a
 * messy pile to a grid, to a loop that runs on its own, to sorted columns, to
 * a stream whose keepers turn cardinal, to rows like lessons, and settle into
 * a line on the horizon that the next section picks up.
 *
 * Every morph is continuous and collision free by construction: a moving cube
 * lifts straight up out of its spot, crosses at its own layer above
 * everything, and drops straight down into its new spot. Columns at rest are
 * at least a cube apart, so straight rises and drops cannot meet, and a
 * column of stacked cubes shares one layer slot so it moves as a stack.
 * `fieldFrame` is pure, so the no-intersection claim is checked numerically
 * over every morph, not argued.
 *
 * Framework-free on purpose: WorldScene.tsx owns scroll and the DOM, and
 * drives this through setN / setLoad / frame. */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export interface WorldNumbers {
  /** Share of cubes that are keepers: the run's shortlist over its roles. */
  keptShare: number;
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const easeIn3 = (t: number) => t * t * t;
const easeInOut3 = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const smooth = (t: number) => t * t * (3 - 2 * t);

function rng(seed: number) {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let a = Math.imul(t ^ (t >>> 15), 1 | t);
    a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
    return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(x: number, z: number) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, z: number) {
  const xi = Math.floor(x),
    zi = Math.floor(z);
  const u = smooth(x - xi),
    v = smooth(z - zi);
  const a = hash(xi, zi),
    b = hash(xi + 1, zi),
    c = hash(xi, zi + 1),
    d = hash(xi + 1, zi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/* ---------- the field ---------- */

export const COLS = 48;
export const ROWS = 40;
export const COUNT = COLS * ROWS;
/** Cube edge. Every form keeps centres at least 1.1 apart on a shared axis,
 * so 0.9 cubes always show air between them. */
export const SIZE = 0.9;
const Y0 = SIZE / 2;
// Crossing layers: 1.0 apart, a cube plus air. Cubes only turn about the
// vertical, so a cube is never taller than SIZE.
const LAYER = 1.0;

/** A form: where each cube sits. `col` is the id of the stacked column a cube
 * is in (or -1 when the form is one cube high), `lev` its level in it. */
interface Form {
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  yaw: Float32Array;
  col: Int32Array;
  lev: Int32Array;
  top: number;
  /** Forms that move on their own rewrite their slots for a time here. */
  live?: (s: number, f: Form) => void;
}
const blank = (): Form => ({
  x: new Float32Array(COUNT),
  y: new Float32Array(COUNT).fill(Y0),
  z: new Float32Array(COUNT),
  yaw: new Float32Array(COUNT),
  col: new Int32Array(COUNT).fill(-1),
  lev: new Int32Array(COUNT),
  top: Y0,
});

interface Slot {
  x: number;
  y: number;
  z: number;
  yaw?: number;
  col?: number;
  lev?: number;
  keep: boolean;
}
/** Keepers fill the flagged slots in index order, everyone else fills the
 * rest in index order, so the mapping is stable on every load. */
function assign(slots: Slot[], keep: Uint8Array, f: Form, apply = true) {
  // Both lists in reading order (rows front to back, left to right, bottom
  // up), the same order the grid indexes its cubes in, so a morph moves
  // neighbours to neighbours and few paths cross.
  const order0 = (p: Slot, q: Slot) =>
    Math.round(p.z / 1.4) - Math.round(q.z / 1.4) || p.x - q.x || p.y - q.y;
  const kept = slots.filter((s) => s.keep).sort(order0);
  const rest = slots.filter((s) => !s.keep).sort(order0);
  let a = 0,
    b = 0;
  const order: Slot[] = new Array(COUNT);
  for (let i = 0; i < COUNT; i++) order[i] = keep[i] ? kept[a++] : rest[b++];
  if (!apply) return order;
  for (let i = 0; i < COUNT; i++) {
    const s = order[i];
    f.x[i] = s.x;
    f.y[i] = s.y;
    f.z[i] = s.z;
    f.yaw[i] = s.yaw ?? 0;
    f.col[i] = s.col ?? -1;
    f.lev[i] = s.lev ?? 0;
    f.top = Math.max(f.top, s.y);
  }
  return order;
}

/** Flag the first `n` slots under an ordering, leave the rest. */
function flagFirst(
  slots: Slot[],
  n: number,
  key: (s: Slot, i: number) => number,
) {
  const idx = slots
    .map((_, i) => i)
    .sort((p, q) => key(slots[p], p) - key(slots[q], q));
  for (let k = 0; k < idx.length; k++) slots[idx[k]].keep = k < n;
}

/* The beats, as windows on N. Each morph runs over its window; between them
 * the field holds a form. Caption windows in WorldScene sit in the holds. */
export const MORPHS: [number, number][] = [
  [0.15, 0.21], // pile -> grid
  [0.28, 0.35], // grid -> loop
  [0.43, 0.5], // loop -> columns
  [0.58, 0.65], // columns -> stream
  [0.73, 0.8], // stream -> lessons
  [0.86, 0.92], // lessons -> horizon
];
/** The grid hold starts when the pile has landed in it. */
export const GRID_AT = MORPHS[0][1];
// When the keepers turn cardinal: as they land in the stream's tail.
const KEEP_TINT: [number, number] = [0.63, 0.66];

export interface Field {
  count: number;
  keep: Uint8Array;
  forms: Form[];
  /** Writes every cube's position and yaw at scroll N, time s (seconds), load
   * l (0 to 1), and the grid ripple's time since entry (ms, or -1). */
  frame(N: number, s: number, l: number, rippleMs: number, out: Form): void;
  /** Precompute one morph's crossing layers (about 15ms each, measured in
   * node on an M4 Pro), so the first frame of that morph does not pay it. */
  warm(m: number): void;
  tint(N: number): number;
}

export function createField(keptShare: number): Field {
  const R = rng(20261004);
  // Keepers: the run's shortlist share of the field (31 of 388 on
  // 2026-09-15 gives 153 cubes). Bounded so every form has room for them.
  const C = Math.round(clamp(keptShare, 0.03, 0.12) * COUNT);
  const keep = new Uint8Array(COUNT);
  {
    const ids = Array.from({ length: COUNT }, (_, i) => i);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(R() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    for (let k = 0; k < C; k++) keep[ids[k]] = 1;
  }

  /* 1. the grid: 48 by 40 at 1.6. */
  const grid = blank();
  for (let i = 0; i < COUNT; i++) {
    grid.x[i] = ((i % COLS) - (COLS - 1) / 2) * 1.6;
    grid.z[i] = (Math.floor(i / COLS) - (ROWS - 1) / 2) * 1.6;
  }

  /* 0. the pile: the grid spread to twice its pitch, warped by a slow field
   * and jittered, each cube turned at random. Neighbours stay more than 1.3
   * apart (checked), so a turned cube (0.64 half diagonal) never meets
   * another. */
  const pile = blank();
  for (let i = 0; i < COUNT; i++) {
    const gx = grid.x[i] * 2,
      gz = grid.z[i] * 2;
    const wx = (vnoise(gx * 0.02 + 3.1, gz * 0.02) - 0.5) * 8;
    const wz = (vnoise(gx * 0.02, gz * 0.02 + 7.7) - 0.5) * 8;
    pile.x[i] = gx + wx + (R() - 0.5) * 1.2;
    pile.z[i] = gz + wz + (R() - 0.5) * 1.2;
    pile.yaw[i] = R() * Math.PI * 2;
  }
  // Where each cube starts before the load: high over its own landing spot,
  // so the fall is a straight drop and two falls never meet.
  const dropH = Float32Array.from({ length: COUNT }, () => 30 + R() * 46);
  const dropAt = Float32Array.from({ length: COUNT }, () => R() * 0.55);

  /* 2. the loop: ten lanes round a rounded rectangle, every lane running on
   * its own at one speed. A closed path, so nothing ever wraps. */
  const LANES = 10;
  const RC = 10; // corner radius at the centre lane
  const laneOff = (l: number) => (l - (LANES - 1) / 2) * 1.4;
  let half = { a: 30, b: 16 };
  const perim = (off: number) =>
    4 * (half.a + half.b) + 2 * Math.PI * (RC + off);
  const laneN: number[] = [];
  for (;;) {
    laneN.length = 0;
    let sum = 0;
    for (let l = 0; l < LANES; l++) {
      laneN.push(Math.floor(perim(laneOff(l)) / 1.45));
      sum += laneN[l];
    }
    if (sum >= COUNT) {
      // Trim the longest lanes so the total is exact; their spacing only
      // grows, so no lane gets tighter than 1.45.
      let extra = sum - COUNT;
      for (let l = LANES - 1; extra > 0; l = (l - 1 + LANES) % LANES, extra--)
        laneN[l]--;
      break;
    }
    half = { a: half.a + 0.5, b: half.b + 0.25 };
  }
  /** A point on the rounded rectangle at arc length d, offset `off` outward. */
  const onLoop = (off: number, d: number) => {
    const A = half.a,
      B = half.b,
      r = RC + off;
    const segs = [
      2 * A,
      (Math.PI / 2) * r,
      2 * B,
      (Math.PI / 2) * r,
      2 * A,
      (Math.PI / 2) * r,
      2 * B,
      (Math.PI / 2) * r,
    ];
    const P = segs.reduce((p, q) => p + q, 0);
    d = ((d % P) + P) % P;
    let k = 0;
    while (d > segs[k]) d -= segs[k++];
    // Corners centred at (+-A, +-B); straights run clockwise seen from above.
    switch (k) {
      case 0:
        return { x: -A + d, z: -B - r, yaw: 0 };
      case 1: {
        const a = -Math.PI / 2 + d / r;
        return {
          x: A + Math.cos(a) * r,
          z: -B + Math.sin(a) * r,
          yaw: -(a + Math.PI / 2),
        };
      }
      case 2:
        return { x: A + r, z: -B + d, yaw: -Math.PI / 2 };
      case 3: {
        const a = d / r;
        return {
          x: A + Math.cos(a) * r,
          z: B + Math.sin(a) * r,
          yaw: -(a + Math.PI / 2),
        };
      }
      case 4:
        return { x: A - d, z: B + r, yaw: Math.PI };
      case 5: {
        const a = Math.PI / 2 + d / r;
        return {
          x: -A + Math.cos(a) * r,
          z: B + Math.sin(a) * r,
          yaw: -(a + Math.PI / 2),
        };
      }
      case 6:
        return { x: -A - r, z: B - d, yaw: Math.PI / 2 };
      default: {
        const a = Math.PI + d / r;
        return {
          x: -A + Math.cos(a) * r,
          z: -B + Math.sin(a) * r,
          yaw: -(a + Math.PI / 2),
        };
      }
    }
  };
  const loopSlots: Slot[] = [];
  const loopLane: number[] = [];
  const loopPhase: number[] = [];
  for (let l = 0; l < LANES; l++)
    for (let j = 0; j < laneN[l]; j++) {
      loopLane.push(l);
      loopPhase.push(j / laneN[l]);
      const p0 = onLoop(laneOff(l), (j / laneN[l]) * perim(laneOff(l)));
      loopSlots.push({ x: p0.x, y: Y0, z: p0.z, keep: false });
    }
  // Keepers spread evenly through the loop.
  flagFirst(loopSlots, C, (_, i) => (i * 7919) % COUNT);
  const loop = blank();
  const loopOrder = assign(loopSlots, keep, loop, false);
  const loopIdx = new Int32Array(COUNT);
  for (let i = 0; i < COUNT; i++) loopIdx[i] = loopSlots.indexOf(loopOrder[i]);
  const LOOP_SPEED = 4.2; // units a second
  loop.live = (s, f) => {
    for (let i = 0; i < COUNT; i++) {
      const k = loopIdx[i];
      const off = laneOff(loopLane[k]);
      const p = onLoop(off, (loopPhase[k] + 0) * perim(off) + s * LOOP_SPEED);
      f.x[i] = p.x;
      f.z[i] = p.z;
      f.y[i] = Y0;
      f.yaw[i] = p.yaw;
    }
  };
  loop.live(0, loop);

  /* 3. columns: records sorted into twelve tidy columns, six cubes wide,
   * longest at the left, like a sorted table seen from above. Flat on
   * purpose: stacks have to lift as stacks, and a 16 high stack needed a 150
   * unit climb to cross without touching anything (measured, 2026-10-04). */
  const colSlots: Slot[] = [];
  {
    const n = 12,
      lanes = 6;
    const rows = COUNT / lanes;
    const L = Array.from({ length: n }, (_, c) => Math.round(40 - c * 2.4));
    let total = L.reduce((p, q) => p + q, 0);
    for (let c = n - 1; total !== rows; c = (c - 1 + n) % n) {
      L[c] += total < rows ? 1 : -1;
      total += total < rows ? 1 : -1;
    }
    L.sort((p, q) => q - p);
    L.forEach((len, c) => {
      const cx = (c - (n - 1) / 2) * 11;
      for (let r = 0; r < len; r++)
        for (let q = 0; q < lanes; q++)
          colSlots.push({
            x: cx + (q - (lanes - 1) / 2) * 1.4,
            y: Y0,
            // Every column starts on the same front edge.
            z: 26 - r * 1.4,
            keep: false,
          });
    });
  }
  // Keepers head each column, the longest columns first.
  flagFirst(colSlots, C, (s) => -s.z * 100 + s.x * 0.01);
  const columns = blank();
  assign(colSlots, keep, columns);

  /* 4. the stream: a wedge that narrows from 48 lanes to 8, keepers last. */
  const streamSlots: Slot[] = [];
  {
    let r = 0;
    while (streamSlots.length < COUNT) {
      const w = Math.max(8, Math.round(48 - (40 * r) / 60));
      for (let q = 0; q < w && streamSlots.length < COUNT; q++)
        streamSlots.push({
          x: r,
          y: Y0,
          z: (q - (w - 1) / 2) * 1.4,
          keep: false,
        });
      r++;
    }
    for (const s of streamSlots) s.x = (s.x - (r - 1) / 2) * 1.4;
  }
  flagFirst(streamSlots, C, (_, i) => -i);
  const stream = blank();
  assign(streamSlots, keep, stream);
  const streamBase = Float32Array.from(stream.x);
  stream.live = (s, f) => {
    // A swell runs down the stream toward the narrow end: flow, in place.
    for (let i = 0; i < COUNT; i++) {
      const w = Math.max(0, Math.sin(streamBase[i] * 0.3 - s * 3));
      f.y[i] = Y0 + 0.55 * w * w * w * w * w * w;
    }
  };
  stream.top = Y0 + 0.55;

  /* 5. lessons: eight pages laid out four by two, each one lines of cubes
   * like lines of text, keepers as the heading lines. */
  const lessonSlots: Slot[] = [];
  {
    const per = COUNT / 8;
    for (let pg = 0; pg < 8; pg++) {
      const px = ((pg % 4) - 1.5) * 22;
      const pz = (Math.floor(pg / 4) - 0.5) * 46 - 4;
      let n = 0,
        line = 0,
        gap = 0;
      while (n < per) {
        // A heading, then paragraphs of four lines with a blank line between.
        const len = line === 0 ? 10 : Math.min(per - n, 9 + Math.floor(hash(pg, line) * 4));
        for (let u = 0; u < len && n < per; u++, n++)
          lessonSlots.push({
            x: px + (u - 5.5) * 1.4,
            y: Y0,
            z: pz - 16 + (line + gap) * 1.4,
            lev: line,
            keep: false,
          });
        if (line === 0 || line % 4 === 0) gap++;
        line++;
      }
    }
  }
  flagFirst(lessonSlots, C, (s) => (s.lev ?? 0) * 1000 + (s.x + 60) + (s.z + 60) * 0.001);
  for (const s of lessonSlots) s.lev = undefined;
  const lessons = blank();
  assign(lessonSlots, keep, lessons);

  /* 6. the horizon: one long low band, keepers at its centre. */
  const bandSlots: Slot[] = [];
  for (let u = 0; u < 160; u++)
    for (let v = 0; v < 12; v++)
      bandSlots.push({
        x: (u - 79.5) * 1.4,
        y: Y0,
        z: (v - 5.5) * 1.4,
        keep: false,
      });
  flagFirst(bandSlots, C, (s) => Math.abs(s.x) * 10 + Math.abs(s.z) * 0.01);
  const band = blank();
  assign(bandSlots, keep, band);

  const forms = [pile, grid, loop, columns, stream, lessons, band];
  const gridMinX = grid.x[0] - 12,
    gridMaxX = -grid.x[0] + 12;

  /* The layer each cube crosses at, per morph. Two cubes share a layer only
   * if their straight paths across never come within 1.35 of each other (a
   * turned cube's footprint, both ways, plus margin), found by checking
   * every pair's closest approach. A stack takes consecutive layers in level
   * order, so it lifts and lands as a stack and its cubes never pass each
   * other. Greedy colouring, tallest stacks first. */
  const CLEAR = 1.35;
  function layersFor(a: Form, b: Form) {
    const ax = a.x,
      az = a.z,
      bx = b.x,
      bz = b.z;
    const nb: number[][] = Array.from({ length: COUNT }, () => []);
    const lo = new Float32Array(COUNT),
      hi = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      lo[i] = Math.min(ax[i], bx[i]) - CLEAR;
      hi[i] = Math.max(ax[i], bx[i]) + CLEAR;
    }
    for (let i = 0; i < COUNT; i++)
      for (let j = i + 1; j < COUNT; j++) {
        if (hi[i] < lo[j] + CLEAR || hi[j] < lo[i] + CLEAR) continue;
        const rx = ax[i] - ax[j],
          rz = az[i] - az[j];
        const dx = bx[i] - bx[j] - rx,
          dz = bz[i] - bz[j] - rz;
        const dd = dx * dx + dz * dz;
        const t = dd > 1e-9 ? clamp(-(rx * dx + rz * dz) / dd) : 0;
        const px = rx + dx * t,
          pz = rz + dz * t;
        if (px * px + pz * pz < CLEAR * CLEAR) {
          nb[i].push(j);
          nb[j].push(i);
        }
      }
    // Groups: a stack on either side, else the cube alone.
    const groups = new Map<number, number[]>();
    for (let i = 0; i < COUNT; i++) {
      const c = b.col[i] >= 0 ? b.col[i] : a.col[i] >= 0 ? a.col[i] + 100000 : -1 - i;
      (groups.get(c) ?? groups.set(c, []).get(c)!).push(i);
    }
    const lev = (i: number) => (b.col[i] >= 0 ? b.lev[i] : a.lev[i]);
    const list = [...groups.values()].map((g) => g.sort((p, q) => lev(p) - lev(q)));
    list.sort((p, q) => q.length - p.length);
    const layer = new Int32Array(COUNT).fill(-1);
    const used = (i: number, c: number) => {
      for (const j of nb[i]) if (layer[j] === c) return true;
      return false;
    };
    for (const g of list) {
      // Each cube of a stack goes strictly above the one under it.
      let c = 0;
      for (const i of g) {
        while (used(i, c)) c++;
        layer[i] = c++;
      }
    }
    return layer;
  }
  // Morphs that touch the loop depend on where the loop stopped, so they are
  // worked out when first needed and again only if the loop has moved since.
  const layerCache: { key: number; layer: Int32Array }[] = [];

  // The loop runs on its own clock, which only advances while the loop is
  // the form on screen; during a morph it holds still.
  let loopClock = 0,
    lastS = -1;

  const A = blank(),
    B = blank();
  const place = (f: Form, into: Form) => {
    into.x.set(f.x);
    into.y.set(f.y);
    into.z.set(f.z);
    into.yaw.set(f.yaw);
    into.col.set(f.col);
    into.lev.set(f.lev);
    into.top = f.top;
  };
  const live = (k: number, s: number, into: Form) => {
    const f = forms[k];
    if (f === loop) loop.live!(loopClock, into);
    else if (f.live) f.live(s, into);
  };

  /** Work out a morph's layers ahead of time, so its first frame is cheap. */
  function warm(m: number) {
    if (layerCache[m]) return;
    place(forms[m], A);
    live(m, 0, A);
    place(forms[m + 1], B);
    live(m + 1, 0, B);
    const key = forms[m] === loop || forms[m + 1] === loop ? loopClock : 0;
    layerCache[m] = { key, layer: layersFor(A, B) };
  }

  function frame(N: number, s: number, l: number, rippleMs: number, out: Form) {
    let m = -1,
      t = 0,
      hold = 0;
    for (let k = 0; k < MORPHS.length; k++) {
      if (N >= MORPHS[k][1]) hold = k + 1;
      else if (N > MORPHS[k][0]) {
        m = k;
        // Linear here: each phase eases on its own, and easing twice made
        // the crossing peak at 24 units per 5px of scroll (measured).
        t = prog(N, MORPHS[k][0], MORPHS[k][1]);
      }
    }
    if (m < 0 && forms[hold] === loop && lastS >= 0) loopClock += clamp(s - lastS, 0, 0.1);
    lastS = s;
    if (m < 0) {
      place(forms[hold], out);
      live(hold, s, out);
      if (hold === 0 && l < 1)
        for (let i = 0; i < COUNT; i++)
          out.y[i] += dropH[i] * (1 - easeIn3(clamp((l - dropAt[i]) / 0.45)));
      if (hold === 1 && rippleMs >= 0) ripple(rippleMs, out);
      return;
    }
    place(forms[m], A);
    live(m, s, A);
    place(forms[m + 1], B);
    live(m + 1, s, B);
    if (m === 0 && rippleMs >= 0) ripple(rippleMs, B);
    if (m === 1 && rippleMs >= 0) ripple(rippleMs, A);
    const key = forms[m] === loop || forms[m + 1] === loop ? loopClock : 0;
    if (!layerCache[m] || layerCache[m].key !== key) layerCache[m] = { key, layer: layersFor(A, B) };
    const layer = layerCache[m].layer;
    const base = Math.max(A.top, B.top) + 2.4;
    // Up over 0 to 0.3, across over 0.3 to 0.7, down over 0.7 to 1.
    const up = smooth(prog(t, 0, 0.3)),
      across = easeInOut3(prog(t, 0.3, 0.7)),
      down = smooth(prog(t, 0.7, 1));
    for (let i = 0; i < COUNT; i++) {
      const layerY = base + layer[i] * LAYER;
      out.x[i] = A.x[i] + (B.x[i] - A.x[i]) * across;
      out.z[i] = A.z[i] + (B.z[i] - A.z[i]) * across;
      out.y[i] = t < 0.7 ? A.y[i] + (layerY - A.y[i]) * up : layerY + (B.y[i] - layerY) * down;
      let dy = B.yaw[i] - A.yaw[i];
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      out.yaw[i] = A.yaw[i] + dy * across;
    }
  }

  /* The grid's sweep: one crest crosses the field once, 1800ms end to end,
   * timed rather than scrolled (Lemma's lattice sweep). Vertical only, so a
   * crest can never push a cube into its neighbour. */
  const SWEEP_MS = 1800;
  function ripple(ms: number, f: Form) {
    const front = gridMinX + (gridMaxX - gridMinX) * clamp(ms / SWEEP_MS);
    if (ms > SWEEP_MS) return;
    for (let i = 0; i < COUNT; i++) {
      const d = (f.x[i] + f.z[i] * 0.35 - front) / 3.2;
      f.y[i] += 1.1 * Math.exp(-d * d);
    }
  }

  return {
    count: COUNT,
    keep,
    forms,
    frame,
    warm,
    tint: (N) => prog(N, KEEP_TINT[0], KEEP_TINT[1]),
  };
}
export const newForm = blank;

/* ---------- the renderer ---------- */

const PAPER = new THREE.Color("#f4f0e9");
const CREAM = new THREE.Color("#f7f3ec");
const CARDINAL = new THREE.Color("#a3162b");
const INK = new THREE.Color("#2a1b1e");

/* The camera, as keys on N, one per hold. Set by rendering each hold at
 * 1440x900 and moving the camera until the form sat clear of the copy. */
interface Key {
  n: number;
  pos: [number, number, number];
  look: [number, number, number];
}
export const CAMERA: Key[] = [
  { n: 0, pos: [6, 104, 150], look: [-44, 0, -28] },
  { n: 0.055, pos: [10, 124, 178], look: [-44, 0, -28] },
  { n: 0.1, pos: [8, 112, 158], look: [-22, 0, -8] },
  { n: 0.24, pos: [14, 84, 118], look: [-10, 0, 0] },
  { n: 0.39, pos: [10, 112, 136], look: [-10, 0, 4] },
  { n: 0.54, pos: [6, 96, 146], look: [-20, 0, -2] },
  { n: 0.69, pos: [-2, 106, 156], look: [6, 0, 0] },
  { n: 0.83, pos: [16, 96, 124], look: [-10, 0, 4] },
  { n: 0.93, pos: [0, 7, 92], look: [0, -1.4, 0] },
  { n: 1, pos: [0, 7, 88], look: [0, -1.4, 0] },
];
/** Where the horizon line of cubes lands on screen, from the top. The seam
 * into the partners section starts its hairline at the same 46%
 * (home/Seams.tsx, SeamToPartners), so the line lands on the cubes. */
const HORIZON_AT = 0.46;

export interface World {
  setN(n: number): void;
  setLoad(l: number): void;
  frame(timeMs: number): void;
  resize(w: number, h: number): void;
  /** Where the field's centre sits on the canvas, 0 to 1 each way. */
  qualifyOnCanvas(): { x: number; y: number };
  dispose(): void;
  /** For still renders: freeze time at t and draw once. */
  still(n: number, timeMs: number, rippleMs?: number, loadAt?: number): void;
}

export function createWorld(
  canvas: HTMLCanvasElement,
  nums: WorldNumbers,
  narrow: boolean,
): World {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, narrow ? 1.25 : 1.5),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // No tone mapping: the ground has to come out as the page's own paper, to
  // the value, so the canvas has no edge against the page.
  renderer.toneMapping = THREE.NoToneMapping;
  /* No real-time shadows. A headed trace on 2026-10-04 (Chrome, ANGLE Metal,
   * M4 Pro, DPR 2) showed GPU tasks of 120 to 270ms during a fast scroll
   * through the world; the shadow pass was the biggest per-frame GPU cost.
   * Toon bands and the ink outline carry the form without it. */
  renderer.shadowMap.enabled = false;
  renderer.setClearColor(PAPER, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PAPER, 140, 360);
  const camera = new THREE.PerspectiveCamera(narrow ? 58 : 40, 1, 0.5, 1200);

  // One light: a soft sky and a single sun from the upper left.
  scene.add(new THREE.HemisphereLight("#ffffff", "#e9e3d8", 0.95));
  const sun = new THREE.DirectionalLight("#ffffff", 0.42);
  sun.position.set(-60, 120, 70);
  scene.add(sun);

  // The ground is the page: unlit paper, a quiet grid, fog to paper.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 3000),
    new THREE.MeshBasicMaterial({ color: PAPER, toneMapped: false }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const grid = new THREE.GridHelper(640, 160, INK, INK);
  const gridMat = grid.material as THREE.LineBasicMaterial;
  gridMat.transparent = true;
  gridMat.opacity = 0.07;
  gridMat.depthWrite = false;
  grid.position.y = 0.01;
  scene.add(grid);

  // Stepped shading: four flat bands, so light falls in planes like print.
  const rampData = new Uint8Array([
    150, 150, 150, 255, 196, 196, 196, 255, 232, 232, 232, 255, 255, 255, 255,
    255,
  ]);
  const ramp = new THREE.DataTexture(rampData, 4, 1, THREE.RGBAFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;

  const field = createField(nums.keptShare);
  const cubes = new THREE.InstancedMesh(
    new RoundedBoxGeometry(SIZE, SIZE, SIZE, 2, 0.14),
    new THREE.MeshToonMaterial({ gradientMap: ramp }),
    COUNT,
  );
  cubes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  cubes.frustumCulled = false;
  for (let i = 0; i < COUNT; i++) cubes.setColorAt(i, CREAM);
  scene.add(cubes);
  // The ink hairline: a back-faced hull pushed out along the normals, sharing
  // the cubes' own instance matrices, so it can never drift off them.
  const OUTLINE = 0.02;
  const outlineMat = new THREE.MeshBasicMaterial({
    color: INK,
    side: THREE.BackSide,
  });
  outlineMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>\n transformed += normalize(normal) * ${OUTLINE.toFixed(3)};`,
    );
  };
  const hull = new THREE.InstancedMesh(cubes.geometry, outlineMat, COUNT);
  hull.instanceMatrix = cubes.instanceMatrix;
  hull.frustumCulled = false;
  scene.add(hull);

  const posCurve = new THREE.CatmullRomCurve3(
    CAMERA.map((k) => new THREE.Vector3(...k.pos)),
    false,
    "centripetal",
  );
  const lookCurve = new THREE.CatmullRomCurve3(
    CAMERA.map((k) => new THREE.Vector3(...k.look)),
    false,
    "centripetal",
  );
  const camAt = (n: number) => {
    let k = 0;
    while (k < CAMERA.length - 2 && n > CAMERA[k + 1].n) k++;
    const t = easeInOut3(prog(n, CAMERA[k].n, CAMERA[k + 1].n));
    const u = (k + t) / (CAMERA.length - 1);
    return { pos: posCurve.getPoint(u), look: lookCurve.getPoint(u) };
  };

  let N = 0;
  let load = 0;
  let ripple0 = -1;
  let lastTint = -1;
  const out = newForm();
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const one = new THREE.Vector3(1, 1, 1);
  const p = new THREE.Vector3();
  const col = new THREE.Color();

  function update(time: number) {
    // The sweep replays once per entry to the grid hold.
    if (N >= GRID_AT - 0.004 && N < MORPHS[1][1]) {
      if (ripple0 < 0) ripple0 = time;
    } else ripple0 = -1;
    field.frame(N, time / 1000, load, ripple0 < 0 ? -1 : time - ripple0, out);
    for (let i = 0; i < COUNT; i++) {
      p.set(out.x[i], out.y[i], out.z[i]);
      q.setFromAxisAngle(up, out.yaw[i]);
      m4.compose(p, q, one);
      cubes.setMatrixAt(i, m4);
    }
    cubes.instanceMatrix.needsUpdate = true;
    const tint = field.tint(N);
    if (tint !== lastTint) {
      lastTint = tint;
      col.copy(CREAM).lerp(CARDINAL, tint);
      for (let i = 0; i < COUNT; i++)
        if (field.keep[i]) cubes.setColorAt(i, col);
      if (cubes.instanceColor) cubes.instanceColor.needsUpdate = true;
    }
    const { pos, look } = camAt(N);
    // A tall screen sees less width, so the camera stands back in proportion
    // (at 390x844 the loop and the columns ran off the right edge).
    if (camera.aspect < 1) pos.sub(look).multiplyScalar(Math.min(2, Math.pow(1 / camera.aspect, 0.6))).add(look);
    camera.position.copy(pos);
    camera.lookAt(look);
    // In the last beat, pitch the camera so the line of cubes sits exactly at
    // HORIZON_AT at any size, eased in so the move stays continuous.
    const w = easeInOut3(prog(N, MORPHS[5][0], MORPHS[5][1]));
    if (w > 0) {
      const want = 1 - 2 * HORIZON_AT;
      const th = Math.tan((camera.fov * Math.PI) / 360);
      for (let k = 0; k < 2; k++) {
        camera.updateMatrixWorld();
        const y = p.set(0, Y0, 0).project(camera).y;
        camera.rotateX((Math.atan(y * th) - Math.atan(want * th)) * w);
      }
    }
  }

  // Compile every shader before the first frame, so nothing hitches later.
  renderer.compile(scene, camera);
  // Then work out each morph's layers, one per idle moment. The two that
  // touch the loop are redone on entry if the loop has run since.
  let warmT = 0;
  const warmNext = (m: number) => {
    if (m >= MORPHS.length) return;
    warmT = window.setTimeout(() => {
      field.warm(m);
      warmNext(m + 1);
    }, 60);
  };
  warmNext(0);

  return {
    setN(n) {
      N = n;
    },
    setLoad(l) {
      load = l;
    },
    frame(time) {
      update(time);
      renderer.render(scene, camera);
    },
    still(n, time, rippleMs, loadAt) {
      N = n;
      load = loadAt ?? 1;
      ripple0 = rippleMs === undefined ? -1 : time - rippleMs;
      if (rippleMs === undefined) ripple0 = time - 10000;
      update(time);
      renderer.render(scene, camera);
    },
    qualifyOnCanvas() {
      const v = new THREE.Vector3(0, 2, 0).project(camera);
      return { x: (v.x + 1) / 2, y: (1 - v.y) / 2 };
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w < 768 ? 58 : 40;
      // The fog stands back with the camera (see update), or a phone sees
      // every form through haze.
      const back = camera.aspect < 1 ? Math.min(2, Math.pow(1 / camera.aspect, 0.6)) : 1;
      const fog = scene.fog as THREE.Fog;
      fog.near = 140 * back;
      fog.far = 360 * back;
      // The copy is a column on the left (desktop) or at the foot (phone), so
      // what the camera looks at lands at about 66% across, or 40% down.
      if (w >= 768) camera.setViewOffset(w, h, -w * 0.16, 0, w, h);
      else camera.setViewOffset(w, h, 0, h * 0.1, w, h);
      camera.updateProjectionMatrix();
    },
    dispose() {
      window.clearTimeout(warmT);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mm = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mm)) mm.forEach((x) => x.dispose());
        else mm?.dispose();
      });
      ramp.dispose();
      renderer.dispose();
    },
  };
}
