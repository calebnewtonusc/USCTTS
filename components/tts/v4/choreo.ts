"use client";

import { grid, KOREATOWN, type GridMode } from "../grid/store";
import {
  clamp,
  easeInOut3,
  easeOut3,
  lerp,
  prog,
  smooth,
} from "../engine/math";

/*
 * The home page's one scroll loop. Every scroll-linked thing on the page
 * reads the same frame, computed once (crafts/website.md: two paths from
 * input to pixel produced six alignment bugs in one morning). Each region
 * gets exactly one progress value, P below, and this file is the only place
 * that turns those values into the grid's state. Components register DOM
 * updaters with onFrame and read P; nothing here renders React.
 */

export type Frame = { y: number; vh: number; vw: number; now: number };
type Entry = { fn: (f: Frame) => void; order: number };

export type Mode = GridMode;
export const store = grid;

/** One value per region, 0..1. */
export const P = {
  open: 0, // the opening's pinned runway: drives the stream
  partners: 0, // partners, from its top at the screen's bottom to its bottom at the top
  weekIn: 0, // the week arriving: its top from the screen's bottom to the top
  week: 0, // the week's pinned runway: the whole story
  join: 0, // join arriving
  page: 0, // the whole document, for the route rail
};

/*
 * The week's runway, P.week (docs/SCRIPT-v5.md, beats 4 to 6). The grid
 * carries the agent from USC to Koreatown and lights up who's worth
 * reaching, the camera dives through the Koreatown point into the clay
 * machine film, the film plays under the scroll stage by stage, then pulls
 * back to a point of light on the grid and the rain begins.
 */
export const WEEK = {
  travel: [0.02, 0.11],
  heat: [0.06, 0.15],
  dive: [0.15, 0.235],
  filmIn: [0.205, 0.245],
  film: [0.24, 0.95],
  out: [0.925, 0.995],
} as const;

/* The film's stages, in frames at 30 fps: public/tts/machine/stages.json,
 * also loaded at runtime (Week.tsx) so a re-render needs no code change. */
export type Stage = "tray" | "sorter" | "typewriter" | "mailbox" | "blocks" | "pullback";
export const STAGES: { name: Stage; from: number; to: number }[] = [
  { name: "tray", from: 14, to: 48 },
  { name: "sorter", from: 48, to: 166 },
  { name: "typewriter", from: 166, to: 214 },
  { name: "mailbox", from: 214, to: 287 },
  { name: "blocks", from: 287, to: 326 },
  { name: "pullback", from: 326, to: 375 },
];
export const FILM_FRAMES = { n: 375 };

/** Share of the film at a point of the week's scroll. */
export const filmShare = (p: number) => prog(p, WEEK.film[0], WEEK.film[1]);

export type Phase = "intro" | "travel" | "dive" | Stage | "out";
export function phaseAt(p: number): Phase {
  if (p < WEEK.travel[0]) return "intro";
  if (p < WEEK.dive[0]) return "travel";
  if (p < WEEK.film[0]) return "dive";
  if (p >= WEEK.out[0] + 0.02) return "out";
  const f = filmShare(p) * FILM_FRAMES.n;
  let cur: Stage = STAGES[0].name;
  for (const st of STAGES) if (f >= st.from) cur = st.name;
  return f < STAGES[0].from ? "dive" : cur;
}
/** 0..1 through a stage, for clips scrubbed under it. */
export function stageProgress(p: number, name: Stage) {
  const st = STAGES.find((x) => x.name === name);
  if (!st) return 0;
  return prog(filmShare(p) * FILM_FRAMES.n, st.from, st.to);
}

const entries: Entry[] = [];
let raf = 0;
let bound = false;
const box: Record<string, { top: number; h: number }> = {};
const IDS = ["open", "partners", "week", "join"];

function measure() {
  for (const id of IDS) {
    const el = document.getElementById(`v4-${id}`);
    if (!el) continue;
    box[id] = {
      top: el.getBoundingClientRect().top + window.scrollY,
      h: el.offsetHeight,
    };
  }
}

function run(now: number) {
  raf = 0;
  const f: Frame = {
    y: window.scrollY,
    vh: window.innerHeight,
    vw: window.innerWidth,
    now,
  };
  for (const e of entries) e.fn(f);
}

export function kick() {
  if (!raf) raf = requestAnimationFrame(run);
}

function bind() {
  if (bound) return;
  bound = true;
  const remeasure = () => {
    measure();
    kick();
  };
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", remeasure);
  new ResizeObserver(remeasure).observe(document.body);
  document.fonts?.ready.then(remeasure);
  measure();
}

/** Register a per-frame updater. Lower order runs first; regions are 0. */
export function onFrame(fn: (f: Frame) => void, order = 1) {
  entries.push({ fn, order });
  entries.sort((a, b) => a.order - b.order);
  bind();
  measure();
  kick();
  return () => {
    const i = entries.findIndex((e) => e.fn === fn);
    if (i >= 0) entries.splice(i, 1);
  };
}

const pin = (id: string, f: Frame) => {
  const b = box[id];
  return b ? clamp((f.y - b.top) / Math.max(1, b.h - f.vh)) : 0;
};
const arrive = (id: string, f: Frame) => {
  const b = box[id];
  return b ? clamp((f.y + f.vh - b.top) / f.vh) : 0;
};
const through = (id: string, f: Frame) => {
  const b = box[id];
  return b ? clamp((f.y + f.vh - b.top) / (b.h + f.vh)) : 0;
};
/** 0 outside [a, d], 1 inside [b, c], smooth ramps between. */
export const bump = (p: number, a: number, b: number, c: number, d: number) =>
  smooth(prog(p, a, b)) * (1 - smooth(prog(p, c, d)));

/** Where the agent light is, in metres from USC, as the travel beat runs. */
export const travelT = () => easeInOut3(prog(P.week, ...WEEK.travel));

/*
 * Region progress, then the grid. Order 0 so every DOM updater reads this
 * frame's values. The grid engine eases toward whatever is written here,
 * so these are targets, and every one of them is a pure function of P:
 * scroll back and the field goes back.
 */
function regions(f: Frame) {
  P.open = pin("open", f);
  P.partners = through("partners", f);
  P.weekIn = arrive("week", f);
  P.week = pin("week", f);
  P.join = arrive("join", f);
  const doc = document.documentElement.scrollHeight - f.vh;
  P.page = doc > 0 ? clamp(f.y / doc) : 0;

  // 1. The opening: high above the basin, then the first scroll streams
  // light down the freeways into USC and back out to the city.
  const stream = smooth(prog(P.open, 0.02, 0.96));
  store.stream = stream;
  let x = 0;
  let y = 0;
  let zoom = lerp(1, 1.18, stream);
  let tilt = lerp(0, 0.45, stream);
  let mode: Mode = stream > 0.06 ? "freeway" : "basin";

  // 2. Partners: the camera eases back out over the whole basin.
  const back = easeInOut3(prog(P.partners, 0.18, 0.6));
  zoom = lerp(zoom, 0.78, back);
  tilt = lerp(tilt, 0.1, back);
  if (back > 0.2) mode = "basin";
  let dim = 0.18 * smooth(prog(P.partners, 0.2, 0.45));

  // 3. The week. The camera follows the agent from USC to Koreatown,
  // straight down while it finds customers, then settles over one block.
  const wi = easeInOut3(P.weekIn);
  const t = travelT();
  const ax = lerp(0, KOREATOWN[0], t);
  const ay = lerp(0, KOREATOWN[1], t);
  // The dive (the cardinal to cream change, grid/transitions.ts): the
  // camera drops through the Koreatown point; Week.tsx fills the screen
  // with its glow and crossfades into the film. At the end it pulls back
  // out to the point, which is the agent's light at the screen's centre.
  const [D0, D1] = WEEK.dive;
  const dive = easeInOut3(prog(P.week, D0, D1));
  const pull = easeInOut3(prog(P.week, WEEK.out[0], WEEK.out[1]));
  // Topdown zoom: 1 is 9 km across the screen. Following the agent the
  // camera holds about 5.5 km, then closes to about 3.5 km as the map
  // lights who's worth reaching.
  const wz = lerp(1.6, 2.6, smooth(prog(P.week, WEEK.heat[0], WEEK.heat[1])));
  // Through the point: zoom 60 is 150 m across, the inside of one block.
  const z = lerp(lerp(wz, 60, dive), 4, pull);
  x = lerp(x, lerp(ax, KOREATOWN[0], dive), wi);
  y = lerp(y, lerp(ay, KOREATOWN[1], dive), wi);
  zoom = lerp(zoom, z, wi);
  tilt = lerp(tilt, 0, wi);
  if (wi > 0.35) mode = "topdown";
  // The field reads at full strength while it's the stage; the film covers
  // it from the dive to the pull-back.
  const mapWorks = bump(P.week, WEEK.heat[0], WEEK.heat[0] + 0.03, D0, D0 + 0.03);
  dim = lerp(dim, 0.4 - 0.25 * mapWorks, wi);
  store.highlight = smooth(prog(P.week, WEEK.heat[0], WEEK.heat[1]));
  store.agent.from = [0, 0];
  store.agent.to = KOREATOWN;
  store.agent.t = t;

  // 4. Join. The last change spreads out from the agent while the camera
  // is still down on its block, so you watch the cardinal run along the
  // streets there; it finishes across the whole city before the camera
  // lifts, straight down (no tilted plane, no horizon), so the doors land
  // on one full-bleed cardinal with nothing left in a corner (review 3,
  // 2026-10-05, a blob, then a tilted quad, then a pink corner).
  const lift = easeInOut3(prog(P.join, 0.4, 0.75));
  x = lerp(x, KOREATOWN[0] * 0.55, lift);
  y = lerp(y, KOREATOWN[1] * 0.55, lift);
  zoom = lerp(zoom, 0.95, lift);
  tilt = lerp(tilt, 0, lift);
  if (lift > 0.02) mode = "topdown";
  store.exit = 0.55 * smooth(prog(P.join, 0.85, 1));
  // The doors are big type straight on the field; a bright freeway ribbon
  // through "Teach me to build that" read as a strikethrough at 390
  // (2026-10-05), so the field's light comes down under them.
  dim = lerp(dim, 0.45, easeOut3(prog(P.join, 0, 0.6)));

  // The colour world (grid/palette.ts): 0 night over the basin, 1 dawn sky
  // as the stream lifts, 2 a full cardinal field while the map finds
  // customers, 3 warm cream for the rest of the week, 4 deep cardinal for
  // Join. Each change has its own form (grid/transitions.ts): a sunrise,
  // a heat map, a dive, and rain.
  const seg = [
    // Sunrise, over most of the opening's runway.
    smooth(prog(P.open, 0.1, 0.95)),
    // The heat map, as the agent arrives and the map lights its finds.
    smooth(prog(P.week, ...WEEK.heat)),
    // The dive, on the camera's own clock.
    prog(P.week, D0, D1),
    // Rain, finished across the whole city by Join's 0.4, before the camera
    // lifts and the doors come up (review 3: the ending must be clean).
    // It starts as Friday clears (the week's last screen) and runs on into
    // Join; P.week reaches 1 the moment P.join starts, so the two halves
    // join without a seam.
    0.4 * prog(P.week, WEEK.out[1] - 0.02, 1) + 0.6 * prog(P.join, 0, 0.4),
  ];
  const world = seg[0] + seg[1] + seg[2] + seg[3];
  store.world = world;
  const from = Math.min(3, Math.floor(world));
  store.wave.from = from;
  store.wave.to = from + 1;
  store.wave.t = world - from;
  store.wave.origin = from === 0 ? [0, 0] : KOREATOWN;
  // The story lane, held to one world while a change passes behind it.
  const laneEl = P.weekIn > 0.5 && P.week < 1 ? document.querySelector(".w4-lane") : null;
  if (laneEl) {
    const r = laneEl.getBoundingClientRect();
    store.protect = [r.left, r.top, r.width, r.height];
  } else store.protect = null;
  store.dim = dim;
  store.camera.x = x;
  store.camera.y = y;
  store.camera.zoom = zoom;
  store.camera.tilt = tilt;
  store.mode = mode;
}

let regionsBound = false;
/** Called once by the home page. */
export function startRegions() {
  if (regionsBound) return () => {};
  regionsBound = true;
  const off = onFrame(regions, 0);
  return () => {
    off();
    regionsBound = false;
  };
}

/*
 * The load clock, the one timed motion on the field (crafts/website.md: two
 * clocks, never confused). 2.2s of points flying onto their streets, the
 * length Lemma's intro runs, then one pulse out from USC over 1.6s. Reduced
 * motion lands on the finished state.
 */
export const LOAD_MS = 2200;
export const PULSE_MS = 1600;
export function startLoadClock(reduced: boolean) {
  if (reduced) {
    store.load = 1;
    store.pulse = 1;
    kick();
    return () => {};
  }
  store.load = 0;
  store.pulse = 0;
  const t0 = performance.now();
  let id = 0;
  const step = (now: number) => {
    const t = now - t0;
    store.load = easeOut3(clamp(t / LOAD_MS));
    store.pulse = clamp((t - LOAD_MS) / PULSE_MS);
    kick();
    if (store.pulse < 1) id = requestAnimationFrame(step);
  };
  id = requestAnimationFrame(step);
  return () => cancelAnimationFrame(id);
}

/** Same-page moves never jump (crafts/website.md). Under 2.5 screens, one
 *  eased glide; past that, dissolve: fade a paper veil in, move under it to
 *  0.6 of a screen short, and glide the rest while it fades out. */
export function glideTo(target: number) {
  const vh = window.innerHeight;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const d = target - window.scrollY;
  if (reduced) {
    window.scrollTo({ top: target, behavior: "instant" });
    return;
  }
  if (Math.abs(d) < 2.5 * vh) {
    window.scrollTo({ top: target, behavior: "smooth" });
    return;
  }
  const veil = document.querySelector<HTMLElement>(".v4-veil");
  if (!veil) {
    window.scrollTo({ top: target, behavior: "smooth" });
    return;
  }
  veil.classList.add("is-on");
  window.setTimeout(() => {
    window.scrollTo({
      top: target - Math.sign(d) * 0.6 * vh,
      behavior: "instant",
    });
    requestAnimationFrame(() => {
      veil.classList.remove("is-on");
      window.scrollTo({ top: target, behavior: "smooth" });
    });
  }, 220);
}

/** The document y where a region's progress reaches p. */
export function yAt(id: "open" | "partners" | "week" | "join", p: number) {
  const vh = window.innerHeight;
  const el = document.getElementById(`v4-${id}`);
  if (!el) return 0;
  const top = el.getBoundingClientRect().top + window.scrollY;
  if (id === "week" || id === "open") return top + p * (el.offsetHeight - vh);
  return top + p * vh;
}
