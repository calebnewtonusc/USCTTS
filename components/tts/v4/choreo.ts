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
  sheet: 0, // home's paper sheet arriving: its top from the screen's bottom to the top
  alumni: 0, // where the students go, mentors and team: top at the screen's bottom to bottom at the top
  join: 0, // join arriving
  page: 0, // the whole document, for the route rail
};

/** The intro's own clock, 0..1 and linear, for the copy's entrance. */
export const INTRO = { t: 0 };

/*
 * The week's runway, P.week (docs/SCRIPT-v5.md, beats 4 to 6). The grid
 * carries the agent from USC to Koreatown and lights up who's worth
 * reaching, the camera dives through the Koreatown point into the clay
 * machine film, the film plays under the scroll stage by stage, then pulls
 * back to a point of light on the grid and the rain begins.
 */
export const WEEK = {
  // The agent leaves USC as the week arrives, under the script's line.
  travel: [0.0, 0.02],
  // Through the point: the camera dives and the glow fills the frame in
  // the film's #F4EFE6 straight from the blue map (review 4: no red world
  // here, no blank hold after). Tightened 2026-10-09 ("Fix everything"):
  // the glow, the crossfade and the rack focus were 0.7 of a screen of
  // flat frames at 1440 (dull.py, grey spread under 20); they now run in
  // about a third of that.
  dive: [0.0, 0.022],
  // The film crossfades in over the full-frame glow, and its focus pull
  // starts the same moment.
  filmIn: [0.018, 0.026],
  film: [0.018, 0.95],
  // The pull-back to a point of light. On /way the doors rise over it
  // (v4.css pulls them up under the pin's last half screen), so the point
  // never sits alone on an empty map.
  out: [0.945, 0.99],
  // Kept for the camera's zoom while travelling; no heat map any more.
  heat: [0.0, 0.02],
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
/* The film's first 22 frames are its rack focus out of the flat field.
 * They pass in the first 4% of the film's scroll, so the tray reads as a
 * city sooner (review 4: a screen of blur under the first caption). */
const RACK = { frames: 22, share: 0.015 };
export const filmShare = (p: number) => {
  const k = prog(p, WEEK.film[0], WEEK.film[1]);
  const r = RACK.frames / FILM_FRAMES.n;
  return k < RACK.share ? (k / RACK.share) * r : r + ((k - RACK.share) / (1 - RACK.share)) * (1 - r);
};

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
const IDS = ["open", "partners", "week", "sheet", "alumni", "join"];

function measure() {
  for (const id of IDS) {
    const el = document.getElementById(`v4-${id}`);
    // box outlives a client navigation, so a section this page lacks must
    // be forgotten: home's sheet measured on / turned /way's sky cream.
    if (!el) {
      delete box[id];
      continue;
    }
    box[id] = {
      top: el.getBoundingClientRect().top + window.scrollY,
      h: el.offsetHeight,
    };
  }
}

/*
 * The followed scroll. Every updater reads this, not window.scrollY, so a
 * wheel notch arrives over a few frames instead of as one step. Lemma's
 * progress hook does `o.current += delta * 0.2` a frame (lemma-replica,
 * hero-scene.js), 13.4 per second at 60 fps; 12 is a hair softer, written
 * per second so a dropped frame doesn't change the feel. Snaps under half
 * a pixel so the loop goes idle.
 */
const FOLLOW = 12;
let fy = -1;
let lastRun = 0;
let reducedMotion = false;

function run(now: number) {
  raf = 0;
  const y = window.scrollY;
  // A jump of more than three screens (the scrollbar dragged, a key like
  // End) lands: following it would replay a whole chapter in a blur.
  if (fy < 0 || reducedMotion || Math.abs(y - fy) > 3 * window.innerHeight) fy = y;
  else {
    const gap = now - lastRun;
    const dt = gap > 50 ? 1 / 60 : gap / 1000;
    fy += (y - fy) * (1 - Math.exp(-dt * FOLLOW));
    if (Math.abs(y - fy) < 0.5) fy = y;
  }
  lastRun = now;
  const f: Frame = {
    y: fy,
    vh: window.innerHeight,
    vw: window.innerWidth,
    now,
  };
  for (const e of entries) e.fn(f);
  if (fy !== y) kick();
}

/** Skip the follower once, for a jump that should land, not glide. */
export function snapScroll() {
  fy = -1;
  kick();
}

export function kick() {
  if (!raf) raf = requestAnimationFrame(run);
}

function bind() {
  if (bound) return;
  bound = true;
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const remeasure = () => {
    measure();
    kick();
  };
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", () => {
    fy = -1;
    remeasure();
  });
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
  P.sheet = arrive("sheet", f);
  P.alumni = through("alumni", f);
  P.join = arrive("join", f);
  // The film covers the whole field between its crossfade and its
  // pull-back, so the engine can skip drawing under it.
  // Home's paper sheet covers it the same way while it fills the screen.
  const sh = box.sheet;
  const underSheet = !!sh && f.y >= sh.top && f.y + f.vh <= sh.top + sh.h;
  store.covered =
    underSheet ||
    (P.weekIn >= 1 && P.week > WEEK.filmIn[1] + 0.002 && P.week < WEEK.out[0] - 0.001);
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
  // The intro's camera: it starts high and steep over the basin and
  // settles down onto USC on the load clock while the streets land, so the
  // city arrives with a move under it, not on a still frame. The engine's
  // camera follower (2.6/s) trails the clock, which is what makes it glide.
  if (INTRO.t < 1) {
    const li = easeInOut3(INTRO.t);
    zoom *= lerp(0.62, 1, li);
    tilt = Math.max(tilt, lerp(0.85, 0, li));
  }

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
  // No heat map in v5: the worth-reaching flare read as a red blob above
  // the script's line (freshman review 2).
  store.highlight = 0;
  store.agent.from = [0, 0];
  store.agent.to = KOREATOWN;
  store.agent.t = t;

  // 4. Where they go. Out of the point of light the camera rises off the
  // block and drifts home to USC, straight down, while the alumni, the
  // mentors and the team come up over the cream city. The field sits
  // back so the cards read.
  const home = easeInOut3(prog(P.alumni, 0.02, 0.34));
  x = lerp(x, 0, home);
  y = lerp(y, 0, home);
  zoom = lerp(zoom, 1.25, home);
  if (home > 0.02) mode = "topdown";
  dim = lerp(dim, 0.5, smooth(prog(P.alumni, 0.04, 0.2)));

  // 5. Join. The last change spreads out from USC while the camera holds
  // straight down (no tilted plane, no horizon), so the doors land on one
  // full-bleed cardinal with nothing left in a corner (review 3,
  // 2026-10-05, a blob, then a tilted quad, then a pink corner).
  // The camera slides to the spot the doors were tuned on (review 3,
  // 2026-10-05): held over USC, the 110's ribbon ran straight through "Book
  // 30 minutes" like a strikethrough (screenshot, 2026-10-09).
  const lift = easeInOut3(prog(P.join, 0.25, 0.75));
  x = lerp(x, KOREATOWN[0] * 0.55, lift);
  y = lerp(y, KOREATOWN[1] * 0.55, lift);
  zoom = lerp(zoom, 0.95, lift);
  tilt = lerp(tilt, 0, lift);
  if (lift > 0.02) mode = "topdown";
  store.exit = 0.55 * smooth(prog(P.join, 0.85, 1));
  // The doors are big type straight on the field; a bright freeway ribbon
  // through "Teach me to build that" read as a strikethrough at 390
  // (2026-10-05), so the field's light comes down under them.
  dim = lerp(dim, 0.6, easeOut3(prog(P.join, 0, 0.6)));

  // The colour world (grid/palette.ts): 0 night over the basin, 1 dawn sky
  // as the stream lifts, 2 a full cardinal field while the map finds
  // customers, 3 warm cream for the rest of the week, 4 deep cardinal for
  // Join. Each change has its own form (grid/transitions.ts): a sunrise,
  // a heat map, a dive, and rain.
  const seg = [
    // Sunrise, over most of the opening's runway.
    smooth(prog(P.open, 0.1, 0.95)),
    // Sky to cardinal to cream both pass while the glow covers the whole
    // frame, so the reader goes from the blue map straight to the film's
    // cream and never sees the red world at the dive (review 4).
    smooth(prog(P.week, WEEK.filmIn[0] + 0.002, WEEK.filmIn[0] + 0.006)),
    smooth(prog(P.week, WEEK.filmIn[0] + 0.006, WEEK.filmIn[0] + 0.01)),
    // Rain, finished across the whole city by Join's 0.4, before the camera
    // lifts and the doors come up (review 3: the ending must be clean).
    // It starts as Friday clears (the week's last screen) and runs on into
    // Join; P.week reaches 1 the moment P.join starts, so the two halves
    // join without a seam.
    // Mostly inside Join, so the doors rise with the wash and there's no
    // empty red screen before them (review 4).
    // With the alumni between the film and the doors, the rain runs inside
    // Join only.
    prog(P.join, 0, 0.3),
  ];
  // Home has no week: its sky turns cream while the paper sheet covers the
  // whole field (never on screen), so the doors get the same rain from
  // cream to cardinal that ends /way.
  if (box.sheet && P.sheet >= 1) {
    seg[1] = 1;
    seg[2] = 1;
  }
  const world = seg[0] + seg[1] + seg[2] + seg[3];
  store.world = world;
  const from = Math.min(3, Math.floor(world));
  store.wave.from = from;
  store.wave.to = from + 1;
  store.wave.t = world - from;
  store.wave.origin = from === 0 ? [0, 0] : KOREATOWN;
  store.protect = null;
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
 * length Lemma's intro runs, then one pulse out from USC over 1.6s. It
 * starts when the field has drawn its first frame (grid.ready), not at
 * mount: from mount it lost about a second to the data and the shader link
 * and the city arrived half built (live trace, 2026-10-09). The copy rises
 * on this same clock (INTRO.t), so nothing on the screen keeps its own
 * time. Reduced motion lands on the finished state.
 */
export const LOAD_MS = 2200;
export const PULSE_MS = 1600;
// Guessed, about three times the one second measured between mount and the
// first drawn frame on the live site: past it the copy comes in anyway, so
// a slow GPU never holds the headline back.
const READY_WAIT_MS = 3000;
export function startLoadClock(reduced: boolean) {
  if (reduced) {
    store.load = 1;
    store.pulse = 1;
    INTRO.t = 1;
    kick();
    return () => {};
  }
  store.load = 0;
  store.pulse = 0;
  INTRO.t = 0;
  const mount = performance.now();
  let t0 = -1;
  let id = 0;
  const step = (now: number) => {
    if (t0 < 0) {
      if (!store.ready && now - mount < READY_WAIT_MS) {
        id = requestAnimationFrame(step);
        return;
      }
      t0 = now;
    }
    const t = now - t0;
    INTRO.t = clamp(t / LOAD_MS);
    store.load = easeOut3(INTRO.t);
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
    // Under the veil the jump lands; the follower would replay it.
    snapScroll();
    requestAnimationFrame(() => {
      veil.classList.remove("is-on");
      window.scrollTo({ top: target, behavior: "smooth" });
    });
  }, 220);
}

/** The document y where a region's progress reaches p. */
export function yAt(id: "open" | "partners" | "week" | "alumni" | "join", p: number) {
  const vh = window.innerHeight;
  const el = document.getElementById(`v4-${id}`);
  if (!el) return 0;
  const top = el.getBoundingClientRect().top + window.scrollY;
  if (id === "week" || id === "open") return top + p * (el.offsetHeight - vh);
  return top + p * vh;
}
