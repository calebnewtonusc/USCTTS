/* The cubes, as data: where each of them is at any point of the page.
 *
 * Caleb, 2026-10-04, on everything before this: objects teleporting, passing
 * through each other, spawning in and out, and too many unrelated things on
 * screen. So the home page has one object. 216 cubes, each with a stable
 * index and a fixed colour, build a 6 by 6 by 6 block on load, then take one
 * form per example in the walkthrough and come back to the block at the end.
 *
 * Colour means one thing each, the same everywhere:
 *   cardinal  a lead worth reaching (the run's shortlist share of the cubes)
 *   gold      people learning (USC gold)
 *   blue      work that runs on its own
 * In each example only the colour that example is about stays lit; the rest
 * go white over the morph, so a student reads the one change.
 *
 * Every morph is collision free by construction, and checked: a cube lifts
 * straight up out of its spot, crosses on a layer of its own above every
 * form, and drops straight down. Two cubes share a layer only if their
 * straight crossings never close both axis gaps. A stack lifts
 * and lands as a stack. `frame` is pure, so scratchpad checks run it in node
 * over every morph and hold and count intersections. Nothing here imports
 * three.js. */

export const COUNT = 216;
/** Cube edge. */
export const SIZE = 1;
const Y0 = SIZE / 2;
/** Stacked pitch, so a block shows a 0.15 seam between cubes. */
export const PITCH = 1.15;
// Crossing layers, a cube plus air. Cubes only ever turn about the vertical.
const LAYER = 1.06;

export const WHITE = 0,
  CARDINAL = 1,
  GOLD = 2,
  BLUE = 3;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeInOut3 = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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

export interface Form {
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  yaw: Float32Array;
  /** The stack a cube is in, or -1 when the form is one cube high. */
  col: Int32Array;
  lev: Int32Array;
  top: number;
}
export const newForm = (): Form => ({
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
  cat: number;
  col?: number;
  lev?: number;
}

/** Each colour fills its own slots in reading order, so the mapping is the
 * same on every load and neighbours go to neighbours. */
type Key = (x: number, y: number, z: number) => number;
/** Each colour fills its own slots. Given the form before and a key (an
 * angle, or a position along x), cubes are matched to slots in key order,
 * so each cube goes to a slot on the same side it comes from and few
 * crossings meet. That keeps the crossing layers, and so the height cubes
 * fly at, low (block to track peaked at 52 units before this). Same mapping
 * on every load. */
function assign(
  slots: Slot[],
  cat: Uint8Array,
  picked?: Slot[],
  prev?: Form,
  key?: Key,
): Form {
  const f = newForm();
  const read = (p: Slot, q: Slot) =>
    Math.round(p.z / PITCH) - Math.round(q.z / PITCH) || p.x - q.x || p.y - q.y;
  const by = key ? (p: Slot, q: Slot) => key(p.x, p.y, p.z) - key(q.x, q.y, q.z) || p.y - q.y : read;
  const pools = [0, 1, 2, 3].map((c) => slots.filter((s) => s.cat === c).sort(by));
  const ids = Array.from({ length: COUNT }, (_, i) => i);
  if (prev && key)
    ids.sort(
      (i, j) => key(prev.x[i], prev.y[i], prev.z[i]) - key(prev.x[j], prev.y[j], prev.z[j]) || prev.y[i] - prev.y[j],
    );
  const used = [0, 0, 0, 0];
  for (const i of ids) {
    const s = pools[cat[i]][used[cat[i]]++];
    if (!s) throw new Error(`form has too few slots of colour ${cat[i]}`);
    if (picked) picked[i] = s;
    f.x[i] = s.x;
    f.y[i] = s.y;
    f.z[i] = s.z;
    f.col[i] = s.col ?? -1;
    f.lev[i] = s.lev ?? 0;
    f.top = Math.max(f.top, s.y);
  }
  return f;
}
const angle: Key = (x, _y, z) => Math.atan2(z, x);
const alongX: Key = (x) => x;

/** Which colours are lit in each form: [cardinal, gold, blue]. */
const LIT: [number, number, number][] = [
  [1, 1, 1], // the block
  [0, 0, 1], // automations: what runs on its own
  [1, 1, 1], // CRM: everything sorted by kind
  [1, 0, 0], // customers: the leads worth reaching
  [0, 1, 0], // teaching: people learning
  [1, 1, 1], // the block again
];

/* The walkthrough as windows on its progress N: a morph, then a hold where
 * its caption sits. */
// Each morph is 0.055 of the walk, about half a screen of scroll, so the
// in-between swarm passes quickly (0.08 read as confetti, review 2026-10-04).
export const MORPHS: [number, number][] = [
  [0.04, 0.095],
  [0.265, 0.32],
  [0.475, 0.53],
  [0.685, 0.74],
  [0.865, 0.92],
];
const LOOP_FORM = 1;

export interface Lean {
  /** A point on the pointer's ray and its unit direction, in world units. */
  ox: number;
  oy: number;
  oz: number;
  dx: number;
  dy: number;
  dz: number;
  /** 0 to 1: how much the block answers the pointer right now. */
  amt: number;
}

export interface Field {
  cat: Uint8Array;
  forms: Form[];
  /** Positions at walkthrough progress N, time s (seconds), load l (0 to 1),
   * with the pointer's lean. Writes `out`; returns nothing. */
  frame(N: number, s: number, l: number, lean: Lean | null, out: Form): void;
  /** How lit each colour is at N: [cardinal, gold, blue], 0 to 1. */
  lit(N: number): [number, number, number];
  /** Precompute one morph's crossing layers. */
  warm(m: number): void;
  /** Where the block's centre is. */
  centre: [number, number, number];
}

export function createField(keptShare: number): Field {
  const R = rng(20261004);
  // Cardinal: the run's shortlist share of the cubes (31 of 388 roles on
  // 2026-09-15 is 17 of 216), bounded so every form has room. Gold and blue
  // are 14 each, so colour stays on about a fifth of the cubes.
  const nC = Math.round(clamp(keptShare, 0.04, 0.1) * COUNT);
  const cat = new Uint8Array(COUNT);
  {
    const ids = Array.from({ length: COUNT }, (_, i) => i);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(R() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    let k = 0;
    for (; k < nC; k++) cat[ids[k]] = CARDINAL;
    for (; k < nC + 14; k++) cat[ids[k]] = GOLD;
    for (; k < nC + 28; k++) cat[ids[k]] = BLUE;
  }
  const count = (c: number) => cat.reduce((p, q) => p + (q === c ? 1 : 0), 0);
  const nG = count(GOLD),
    nB = count(BLUE);

  /* The block: 6 by 6 by 6. Colours are scattered through it the way the
   * cubes were shuffled, so about two thirds show on the outside. */
  const S = 6;
  const blockSlots: Slot[] = [];
  for (let v = 0; v < S; v++)
    for (let r = 0; r < S; r++)
      for (let c = 0; c < S; c++)
        blockSlots.push({
          x: (c - (S - 1) / 2) * PITCH,
          y: Y0 + v * PITCH,
          z: (r - (S - 1) / 2) * PITCH,
          cat: 0,
          col: r * S + c,
          lev: v,
        });
  {
    // Colour the slots by the same shuffle, so the block is the one form
    // where colour sits where chance put it.
    const ids = Array.from({ length: COUNT }, (_, i) => i);
    const R2 = rng(77);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(R2() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    let k = 0;
    for (let n = 0; n < nC; n++) blockSlots[ids[k++]].cat = CARDINAL;
    for (let n = 0; n < nG; n++) blockSlots[ids[k++]].cat = GOLD;
    for (let n = 0; n < nB; n++) blockSlots[ids[k++]].cat = BLUE;
  }
  const block = assign(blockSlots, cat);
  // Which way each block cube faces out, for the pointer lean.
  const half = ((S - 1) / 2) * PITCH;
  const nrm = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const ax = Math.abs(block.x[i]) > half - 0.01 ? Math.sign(block.x[i]) : 0;
    const az = Math.abs(block.z[i]) > half - 0.01 ? Math.sign(block.z[i]) : 0;
    const ay = block.lev[i] === S - 1 ? 1 : 0;
    nrm.set([ax, ay, az], i * 3);
  }

  /* Automations: four lanes round one rounded track, every cube moving on
   * its own at one speed. A closed path, so nothing ever wraps. Blue cubes
   * are spaced evenly through it. */
  const LANES = 4,
    RC = 4.5,
    GAPL = 1.6;
  const laneOff = (l: number) => (l - 1.5) * 1.6;
  let A = 8,
    B = 3;
  const perim = (off: number) => 4 * (A + B) + 2 * Math.PI * (RC + off);
  const laneN: number[] = [];
  for (;;) {
    laneN.length = 0;
    let sum = 0;
    for (let l = 0; l < LANES; l++) {
      laneN.push(Math.floor(perim(laneOff(l)) / GAPL));
      sum += laneN[l];
    }
    if (sum >= COUNT) {
      let extra = sum - COUNT;
      for (let l = LANES - 1; extra > 0; l = (l - 1 + LANES) % LANES, extra--)
        laneN[l]--;
      break;
    }
    A += 0.25;
    B += 0.1;
  }
  const onLoop = (off: number, d: number) => {
    const r = RC + off;
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
    while (k < 7 && d > segs[k]) d -= segs[k++];
    const arc = (cx: number, cz: number, a0: number) => {
      const a = a0 + d / r;
      return {
        x: cx + Math.cos(a) * r,
        z: cz + Math.sin(a) * r,
        yaw: -(a + Math.PI / 2),
      };
    };
    switch (k) {
      case 0:
        return { x: -A + d, z: -B - r, yaw: 0 };
      case 1:
        return arc(A, -B, -Math.PI / 2);
      case 2:
        return { x: A + r, z: -B + d, yaw: -Math.PI / 2 };
      case 3:
        return arc(A, B, 0);
      case 4:
        return { x: A - d, z: B + r, yaw: Math.PI };
      case 5:
        return arc(-A, B, Math.PI / 2);
      case 6:
        return { x: -A - r, z: B - d, yaw: Math.PI / 2 };
      default:
        return arc(-A, -B, Math.PI);
    }
  };
  const loopLane: number[] = [];
  const loopPhase: number[] = [];
  const loopSlots: Slot[] = [];
  for (let l = 0; l < LANES; l++)
    for (let j = 0; j < laneN[l]; j++) {
      loopLane.push(l);
      loopPhase.push(j / laneN[l]);
      const p = onLoop(laneOff(l), (j / laneN[l]) * perim(laneOff(l)));
      loopSlots.push({ x: p.x, y: Y0, z: p.z, cat: WHITE });
    }
  {
    // Blue evenly through the track, then the other colours evenly too.
    const order = loopSlots
      .map((_, i) => i)
      .sort((p, q) => loopPhase[p] - loopPhase[q] || loopLane[p] - loopLane[q]);
    const place = (n: number, c: number, skew: number) => {
      let k = 0;
      for (let m = 0; m < n; m++) {
        let at = Math.floor(((m + skew) / n) * order.length) % order.length;
        while (loopSlots[order[at]].cat !== WHITE) at = (at + 1) % order.length;
        loopSlots[order[at]].cat = c;
        k++;
      }
      return k;
    };
    place(nB, BLUE, 0);
    place(nC, CARDINAL, 0.33);
    place(nG, GOLD, 0.66);
  }
  const loopIdx = new Int32Array(COUNT);
  {
    const picked: Slot[] = [];
    assign(loopSlots, cat, picked, block, angle);
    for (let i = 0; i < COUNT; i++) loopIdx[i] = loopSlots.indexOf(picked[i]);
  }
  const loop = newForm();
  const LOOP_SPEED = 2.6; // units a second
  const runLoop = (clock: number, f: Form) => {
    for (let i = 0; i < COUNT; i++) {
      const k = loopIdx[i];
      const off = laneOff(loopLane[k]);
      const p = onLoop(off, loopPhase[k] * perim(off) + clock * LOOP_SPEED);
      f.x[i] = p.x;
      f.z[i] = p.z;
      f.y[i] = Y0;
      f.yaw[i] = p.yaw;
      f.col[i] = -1;
      f.lev[i] = 0;
    }
    f.top = Y0;
  };
  runLoop(0, loop);

  /* CRM: everything sorted into bins by kind, 3 by 3 stacks in a row. White
   * fills four bins, then one bin each for cardinal, gold and blue. */
  const crmSlots: Slot[] = [];
  {
    const bins: [number, number][] = [];
    const nW = COUNT - nC - nG - nB;
    const w4 = Math.ceil(nW / 4);
    for (let b = 0; b < 4; b++) bins.push([WHITE, Math.min(w4, nW - b * w4)]);
    bins.push([CARDINAL, nC], [GOLD, nG], [BLUE, nB]);
    bins.forEach(([c, n], b) => {
      const bx = (b - (bins.length - 1) / 2) * 5.2;
      for (let k = 0; k < n; k++) {
        const v = Math.floor(k / 9),
          q = k % 9;
        crmSlots.push({
          x: bx + ((q % 3) - 1) * PITCH,
          y: Y0 + v * PITCH,
          z: (Math.floor(q / 3) - 1) * PITCH,
          cat: c,
          col: 1000 + b * 9 + q,
          lev: v,
        });
      }
    });
  }
  const crm = assign(crmSlots, cat, undefined, loop, alongX);

  /* Customers: everyone a startup could reach, as a wedge that narrows to
   * the few worth it. Cardinal cubes are the narrow end. */
  const streamSlots: Slot[] = [];
  {
    // Widths fall in a straight line from 16 to 3, over as many rows as it
    // takes to hold every cube: a wedge about 34 units long.
    let nRows = 2;
    const widthAt = (r: number, n: number) => Math.round(16 - (13 * r) / (n - 1));
    for (;;) {
      let sum = 0;
      for (let r = 0; r < nRows; r++) sum += widthAt(r, nRows);
      if (sum >= COUNT) break;
      nRows++;
    }
    const rows: number[][] = [];
    let n = 0;
    for (let r = 0; r < nRows; r++) {
      const w = widthAt(r, nRows);
      const row: number[] = [];
      for (let q = 0; q < w; q++) row.push((q - (w - 1) / 2) * 1.5);
      rows.push(row);
      n += w;
    }
    // Trim the overflow from the widest rows, one cube each, from the edge.
    for (let r = 0; n > COUNT; r++, n--) rows[r].pop();
    rows.forEach((row, ri) =>
      row.forEach((z) =>
        streamSlots.push({
          x: (ri - (rows.length - 1) / 2) * 1.5,
          y: Y0,
          z,
          cat: WHITE,
        }),
      ),
    );
    for (let k = 0; k < nC; k++)
      streamSlots[streamSlots.length - 1 - k].cat = CARDINAL;
    // The other colours sit through the wide part, unlit in this example.
    let at = 7;
    for (let k = 0; k < nG + nB; k++) {
      while (streamSlots[at].cat !== WHITE) at++;
      streamSlots[at].cat = k < nG ? GOLD : BLUE;
      at += 4;
    }
  }
  const stream = assign(streamSlots, cat, undefined, crm, alongX);
  const streamBase = Float32Array.from(stream.x);

  /* Teaching: three lessons laid out like pages, a gold heading line each and
   * lines of text under it. */
  const lessonSlots: Slot[] = [];
  {
    const heads = [
      Math.ceil(nG / 3),
      Math.ceil(nG / 3),
      nG - 2 * Math.ceil(nG / 3),
    ];
    const rest = COUNT - nG;
    const per = [
      Math.ceil(rest / 3),
      Math.ceil(rest / 3),
      rest - 2 * Math.ceil(rest / 3),
    ];
    for (let pg = 0; pg < 3; pg++) {
      const px = (pg - 1) * 12.4;
      for (let u = 0; u < heads[pg]; u++)
        lessonSlots.push({ x: px - 4.55 + u * 1.3, y: Y0, z: -10, cat: GOLD });
      let n = 0,
        line = 0;
      while (n < per[pg]) {
        const len = Math.min(
          per[pg] - n,
          6 + Math.floor(((pg * 7 + line * 5) % 4) * 0.75),
        );
        const z = -10 + 1.3 * (2 + line + Math.floor(line / 4));
        for (let u = 0; u < len; u++, n++)
          lessonSlots.push({ x: px - 4.55 + u * 1.3, y: Y0, z, cat: WHITE });
        line++;
      }
    }
    // Cardinal and blue cubes sit in the body text, unlit here.
    let at = 3;
    const body = lessonSlots.filter((s) => s.cat === WHITE);
    for (let k = 0; k < nC + nB; k++) {
      body[at % body.length].cat = k < nC ? CARDINAL : BLUE;
      at += 5;
    }
  }
  const lessons = assign(lessonSlots, cat, undefined, stream, alongX);

  const forms = [block, loop, crm, stream, lessons, block];

  /* ---------- crossing layers ---------- */
  /* Every cube crosses on one shared clock. Staggering the starts in a
   * wave was tried and measured worse: cubes that finished early sat at
   * their new spot on their layer as obstacles, and block to track peaked
   * at 55 units instead of 36. */
  function layersFor(a: Form, b: Form) {
    const nb: number[][] = Array.from({ length: COUNT }, () => []);
    const lx = new Float32Array(COUNT),
      hx = new Float32Array(COUNT),
      lz = new Float32Array(COUNT),
      hz = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      lx[i] = Math.min(a.x[i], b.x[i]);
      hx[i] = Math.max(a.x[i], b.x[i]);
      lz[i] = Math.min(a.z[i], b.z[i]);
      hz[i] = Math.max(a.z[i], b.z[i]);
    }
    const NEAR = 1.06;
    for (let i = 0; i < COUNT; i++)
      for (let j = i + 1; j < COUNT; j++) {
        if (hx[i] + NEAR < lx[j] || hx[j] + NEAR < lx[i] || hz[i] + NEAR < lz[j] || hz[j] + NEAR < lz[i]) continue;
        // Cubes cross square on, so two meet only when both axis gaps
        // close. Both move on one clock, so their difference is linear in
        // it, the Chebyshev distance is convex, and a ternary search finds
        // its least.
        const rx = a.x[i] - a.x[j],
          rz = a.z[i] - a.z[j];
        const dx = b.x[i] - b.x[j] - rx,
          dz = b.z[i] - b.z[j] - rz;
        const cheb = (u: number) => Math.max(Math.abs(rx + dx * u), Math.abs(rz + dz * u));
        let lo = 0,
          hi = 1;
        for (let it = 0; it < 40; it++) {
          const m1 = lo + (hi - lo) / 3,
            m2 = hi - (hi - lo) / 3;
          if (cheb(m1) < cheb(m2)) hi = m2;
          else lo = m1;
        }
        const close = cheb((lo + hi) / 2) < NEAR;
        if (close) {
          nb[i].push(j);
          nb[j].push(i);
        }
      }
    const groups = new Map<number, number[]>();
    for (let i = 0; i < COUNT; i++) {
      const c =
        b.col[i] >= 0 ? b.col[i] : a.col[i] >= 0 ? a.col[i] + 100000 : -1 - i;
      const g = groups.get(c);
      if (g) g.push(i);
      else groups.set(c, [i]);
    }
    const lev = (i: number) => (b.col[i] >= 0 ? b.lev[i] : a.lev[i]);
    const list = [...groups.values()].map((g) =>
      g.sort((p, q) => lev(p) - lev(q)),
    );
    list.sort((p, q) => q.length - p.length);
    // Greedy layering depends on the order groups are placed in, so try a
    // few seeded orders and keep the lowest: the highest layer is how far
    // up the cubes fly, and lower reads better on screen.
    const Rl = rng(9);
    let best: Int32Array | null = null,
      bestTop = Infinity;
    for (let attempt = 0; attempt < 200; attempt++) {
      if (attempt > 0)
        for (let k = list.length - 1; k > 0; k--) {
          const j = Math.floor(Rl() * (k + 1));
          [list[k], list[j]] = [list[j], list[k]];
        }
      const layer = new Int32Array(COUNT).fill(-1);
      const used = (i: number, c: number) => {
        for (const j of nb[i]) if (layer[j] === c) return true;
        return false;
      };
      let top = 0;
      for (const g of list) {
        let c = 0;
        for (const i of g) {
          while (used(i, c)) c++;
          layer[i] = c++;
          top = Math.max(top, layer[i]);
        }
      }
      if (top < bestTop) {
        bestTop = top;
        best = layer;
      }
    }
    const layer = best as Int32Array;
    return layer;
  }
  const cache: { key: number; layer: Int32Array }[] = [];

  // The track runs on its own clock, which only moves while the track is on
  // screen, so a morph never starts from a moving target.
  let loopClock = 0,
    lastS = -1;
  const FA = newForm(),
    FB = newForm();
  const put = (k: number, into: Form) => {
    if (k === LOOP_FORM) return runLoop(loopClock, into);
    const f = forms[k];
    into.x.set(f.x);
    into.y.set(f.y);
    into.z.set(f.z);
    into.yaw.set(f.yaw);
    into.col.set(f.col);
    into.lev.set(f.lev);
    into.top = f.top;
  };
  const keyOf = (m: number) =>
    m === LOOP_FORM - 1 || m === LOOP_FORM ? loopClock : 0;
  function warm(m: number) {
    if (cache[m] && cache[m].key === keyOf(m)) return;
    put(m, FA);
    put(m + 1, FB);
    cache[m] = { key: keyOf(m), layer: layersFor(FA, FB) };
  }

  // The load: each cube falls straight down onto its spot in the block, a
  // diagonal wave across the columns, each column bottom first. A cube above
  // always starts no lower and no earlier than the one under it, so a column
  // never closes up on itself.
  const dropH = new Float32Array(COUNT),
    dropAt = new Float32Array(COUNT);
  // No spin on the way down: with a 0.15 seam, a cube turned more than 0.15
  // rad as it lands overlaps its neighbour (the check counted 17).
  {
    const R3 = rng(4242);
    const colH = new Map<number, [number, number]>();
    const order = Array.from({ length: COUNT }, (_, i) => i).sort(
      (p, q) => block.lev[p] - block.lev[q],
    );
    for (const i of order) {
      const c = block.col[i];
      const diag = ((c % S) + (S - 1 - Math.floor(c / S))) / (2 * S - 2);
      const prev = colH.get(c) ?? [0, 0];
      const h = Math.max(prev[0] + PITCH, 34 + R3() * 10);
      const at = Math.max(prev[1] + 0.035, 0.04 + diag * 0.36 + R3() * 0.04);
      dropH[i] = h;
      dropAt[i] = at;
      colH.set(c, [h, at]);
    }
  }
  const FALL = 0.3; // of the load clock, about 660ms

  const ACROSS: [number, number] = [0.3, 0.7];

  function frame(
    N: number,
    s: number,
    l: number,
    lean: Lean | null,
    out: Form,
  ) {
    let m = -1,
      t = 0,
      hold = 0;
    for (let k = 0; k < MORPHS.length; k++) {
      if (N >= MORPHS[k][1]) hold = k + 1;
      else if (N > MORPHS[k][0]) {
        m = k;
        t = prog(N, MORPHS[k][0], MORPHS[k][1]);
      }
    }
    if (m < 0 && hold === LOOP_FORM && lastS >= 0)
      loopClock += clamp(s - lastS, 0, 0.1);
    lastS = s;
    if (m < 0) {
      put(hold, out);
      if (hold === 0 && l < 1)
        for (let i = 0; i < COUNT; i++) {
          const k = clamp((l - dropAt[i]) / FALL);
          // Gravity: it speeds up all the way down, then stops on the cube
          // under it.
          out.y[i] += dropH[i] * (1 - k * k);
        }
      if (
        (hold === 0 || hold === forms.length - 1) &&
        lean &&
        lean.amt > 0.001
      ) {
        for (let i = 0; i < COUNT; i++) {
          const nx = nrm[i * 3],
            ny = nrm[i * 3 + 1],
            nz = nrm[i * 3 + 2];
          if (!nx && !ny && !nz) continue;
          // Distance from the cube to the pointer's ray.
          const px = out.x[i] - lean.ox,
            py = out.y[i] - lean.oy,
            pz = out.z[i] - lean.oz;
          const along = px * lean.dx + py * lean.dy + pz * lean.dz;
          const qx = px - along * lean.dx,
            qy = py - along * lean.dy,
            qz = pz - along * lean.dz;
          const d2 = qx * qx + qy * qy + qz * qz;
          // Outward along the faces it is on only, so a gap between two
          // cubes can only ever open (checked over a sweep of pointers).
          const g = 0.85 * lean.amt * Math.exp(-d2 / 5);
          out.x[i] += nx * g;
          out.y[i] += ny * g;
          out.z[i] += nz * g;
        }
      }
      if (hold === 3)
        for (let i = 0; i < COUNT; i++) {
          // A swell runs down the wedge toward the narrow end: flow, in place.
          const w = Math.max(0, Math.sin(streamBase[i] * 0.45 - s * 2.4));
          out.y[i] += 0.5 * w * w * w * w;
        }
      return;
    }
    put(m, FA);
    put(m + 1, FB);
    warm(m);
    const layer = cache[m].layer;
    const base = Math.max(FA.top, FB.top) + 1.2;
    const up = smooth(prog(t, 0, ACROSS[0])),
      across = easeInOut3(prog(t, ACROSS[0], ACROSS[1])),
      down = smooth(prog(t, ACROSS[1], 1));
    for (let i = 0; i < COUNT; i++) {
      const ly = base + layer[i] * LAYER;
      out.x[i] = FA.x[i] + (FB.x[i] - FA.x[i]) * across;
      out.z[i] = FA.z[i] + (FB.z[i] - FA.z[i]) * across;
      out.y[i] =
        t < ACROSS[1]
          ? FA.y[i] + (ly - FA.y[i]) * up
          : ly + (FB.y[i] - ly) * down;
      // Square on while crossing: a cube turns back to square as it rises
      // over its own spot, and turns into its new heading as it drops onto
      // the new one. Turning happens only where its neighbours are 1.6 away,
      // and the crossing only has to clear square cubes, which needs far
      // fewer layers (the track morphs peaked at 43 units with turning).
      const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
      out.yaw[i] = t < ACROSS[1] ? wrap(FA.yaw[i]) * (1 - up) : wrap(FB.yaw[i]) * down;
    }
  }

  function lit(N: number): [number, number, number] {
    let k = 0;
    while (k < MORPHS.length && N >= MORPHS[k][1]) k++;
    if (k < MORPHS.length && N > MORPHS[k][0]) {
      const t = smooth(prog(N, MORPHS[k][0], MORPHS[k][1]));
      return [0, 1, 2].map(
        (c) => LIT[k][c] + (LIT[k + 1][c] - LIT[k][c]) * t,
      ) as [number, number, number];
    }
    return LIT[k];
  }

  return {
    cat,
    forms,
    frame,
    lit,
    warm,
    centre: [0, Y0 + ((S - 1) / 2) * PITCH, 0],
  };
}
