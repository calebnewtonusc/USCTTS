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
 * The week's beats on P.week. Each one is about an eighth of the runway, so
 * at 800vh every beat gets a screen or more of scroll, enough to read the
 * one line it carries before the next arrives.
 */
export const BEAT = {
  travel: [0.03, 0.17],
  gtm: [0.19, 0.37],
  email: [0.38, 0.57],
  sheet: [0.58, 0.75],
  teach: [0.76, 0.91],
  end: [0.92, 1],
} as const;
export type BeatName = keyof typeof BEAT;

export function beatAt(p: number): BeatName | "intro" {
  if (p < BEAT.travel[0]) return "intro";
  if (p < BEAT.gtm[0]) return "travel";
  if (p < BEAT.email[0]) return "gtm";
  if (p < BEAT.sheet[0]) return "email";
  if (p < BEAT.teach[0]) return "sheet";
  if (p < BEAT.end[0]) return "teach";
  return "end";
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
export const travelT = () => easeInOut3(prog(P.week, ...BEAT.travel));

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
  const settle = easeInOut3(prog(P.week, BEAT.email[0] - 0.02, BEAT.email[0] + 0.04));
  // Topdown zoom: 1 is 9 km across the screen. Following the agent the
  // camera holds about 5.5 km (USC and Koreatown both in frame), then closes
  // to about 3.5 km while the map finds customers.
  const wz = lerp(1.6, 2.6, smooth(prog(P.week, BEAT.gtm[0] - 0.03, BEAT.gtm[0] + 0.05)));
  // On a wide screen the panel covers the right two thirds, so the camera
  // sits east of the agent and puts it in the open left lane.
  const lane = f.vw >= 1024 ? 0.27 * (9000 / wz) : 0;
  x = lerp(x, ax + lane, wi);
  y = lerp(y, ay, wi);
  zoom = lerp(zoom, wz, wi);
  tilt = lerp(tilt, 0, wi);
  if (wi > 0.35) mode = settle > 0.5 ? "block" : "topdown";
  // The panel needs a quiet field behind it, except while the map itself
  // is doing the work of finding customers.
  const mapWorks = bump(
    P.week,
    BEAT.gtm[0] - 0.01,
    BEAT.gtm[0] + 0.03,
    BEAT.gtm[1] - 0.03,
    BEAT.gtm[1],
  );
  dim = lerp(dim, 0.55 - 0.27 * mapWorks, wi);
  store.highlight = smooth(
    prog(P.week, BEAT.gtm[0] + 0.01, BEAT.gtm[0] + 0.12),
  );
  store.agent.from = [0, 0];
  store.agent.to = KOREATOWN;
  store.agent.t = t;

  // 4. Join: the field dissolves into paper.
  const exit = smooth(prog(P.join, 0.12, 0.85));
  store.exit = exit;
  dim = lerp(dim, 0, easeOut3(prog(P.join, 0, 0.6)));

  // The colour world (grid/palette.ts): 0 night over the basin, 1 dawn sky
  // as the stream lifts, 2 a full cardinal field while the map finds
  // customers, 3 warm cream for the rest of the week, 4 deep cardinal for
  // Join. A continuous value, so every chapter change is a change of light.
  store.world =
    smooth(prog(P.open, 0.12, 0.9)) +
    smooth(prog(P.week, BEAT.gtm[0] - 0.035, BEAT.gtm[0] + 0.02)) +
    smooth(prog(P.week, BEAT.gtm[1] - 0.03, BEAT.gtm[1] + 0.02)) +
    smooth(prog(P.join, 0.05, 0.6));
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
