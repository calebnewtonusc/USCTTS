"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { clamp, lerp, prog, smooth } from "../engine/math";
import {
  FILM_FRAMES,
  filmShare,
  kick,
  onFrame,
  P,
  STAGES,
  WEEK,
  type Stage,
} from "./choreo";
import { createFilm, type Film } from "./filmSeq";
import XrayViews from "./Xray";
import { attachXray } from "./xrayLine";
import { CLOUD_DATA } from "./clouds";

/*
 * The dive and the machine (docs/SCRIPT-v5.md, beats 4 to 6). The grid is
 * the city and the clay machine is what happens inside one point of it. The
 * camera dives toward the client's point and falls through a layer of the
 * film's clouds, and the film's own descent carries on under them. The film
 * plays under the scroll, one stage per caption, each caption on a cloud of
 * its own. It ends on its wide shot, under the doors.
 *
 * Reader: a USC student. They're the main character; the Ghana nonprofit
 * is the client, and an example. One scroll value drives all of it, P.week.
 */

/* The film (blender/machine.py): 375 frames rendered at 2560x1440 and a
 * 1440x2560 portrait cut for phones, drawn as an image sequence
 * (filmSeq.ts). The stills are frame 360, the whole machine pulled back,
 * for reduced motion. */
const FILM = {
  still: "/tts/machine/still-land.webp",
  stillPortrait: "/tts/machine/still-port.webp",
  stages: "/tts/machine/stages.json",
};
// stages.json names its stages for the film; these are the page's names.
const STAGE_NAME: Record<string, Stage> = {
  tray: "tray",
  sort: "sorter",
  type: "typewriter",
  mail: "mailbox",
  stack: "blocks",
  out: "pullback",
};

/* Each caption sits where its stage's machine never goes: the stages'
 * frames were scored for what sits under each corner and checked by eye at
 * each stage's start, middle and end (2026-10-11, after the typewriter's
 * caption covered the typewriter: "Never block important things when they
 * should be shown!"). Top right for all but the typewriter, whose roller
 * reaches into it; its left is only the last stage's chute. The middle
 * right sat on the meetings stack and its falling ball, the top left on
 * the mailbox.
 *
 * One line per stage, verbatim from Tyler's voice memo (relayed
 * 2026-10-10), each with a mono label naming the skill. The example is one
 * TTS project, a Ghana nonprofit's donor outreach; no tool brand appears
 * in the walkthrough. */
const CAPTIONS: { stage: Stage; line: string; label?: string; at: string }[] = [
  {
    stage: "tray",
    line: "First you find every foundation that could fund them.",
    label: "finding leads",
    at: "is-tr is-big",
  },
  {
    stage: "sorter",
    line: "Then decide who's actually worth reaching, and teach the AI why.",
    label: "qualifying",
    at: "is-tr is-mid",
  },
  {
    stage: "typewriter",
    line: "The team drafts the first email, and it writes well-tailored copy from there.",
    label: "prompting",
    at: "is-tl is-mid",
  },
  {
    stage: "mailbox",
    line: "Every reply lands in the client's CRM and gets answered with AI.",
    label: "the CRM",
    at: "is-tr is-mid",
  },
  {
    stage: "blocks",
    line: "Meetings start appearing on the client's calendar within a week.",
    label: "meetings booked",
    at: "is-tr is-big",
  },
  {
    stage: "pullback",
    line: "Then we teach the client to run it and hand it off as a full software project.",
    label: "the handoff",
    at: "is-tr is-big",
  },
];

/* The clouds (blender/clouds.py, rendered in Nalana): six shapes, one per
 * caption, rounded all over with the bottom flat, on transparency. Each
 * carries its cropped render's width over height and where its body (under
 * the bumps, where the text sits) is, as insets the render is drawn past
 * the caption's box by: left, top, right, bottom, each a share of the box.
 * Measured off the renders by scripts/cloud-crop.py. */
const CLOUDS: { src: string; aspect: number; inset: [number, number, number, number] }[] =
  CLOUD_DATA;
/* The way in's cloud layer: one cloud nearly on the centre line, whose face
 * covers the frame at the swap, and five around it, all leaving along their
 * own directions as they part. s scales each against the camera's growth,
 * r is how far off the centre it sits, in its own widths. */
const PUFFS = [
  { img: 0, s: 1.0, r: 0.04, dx: 0.3, dy: -1 },
  { img: 3, s: 0.8, r: 0.3, dx: -1, dy: -0.35 },
  { img: 4, s: 0.75, r: 0.3, dx: 1, dy: -0.3 },
  { img: 4, s: 0.7, r: 0.32, dx: -0.8, dy: 0.7 },
  { img: 3, s: 0.72, r: 0.3, dx: 0.85, dy: 0.65 },
  { img: 0, s: 0.62, r: 0.36, dx: 0.1, dy: 1 },
];

/* Where a cloud's body centre sits down its render, as a share of the
 * render's height. */
const bodyY = (k: number) => {
  const [, t, , b] = CLOUDS[k].inset;
  return (t + 0.5) / (1 + t + b);
};
/* The share of a cloud's render its body covers, top to bottom. */
const bodyH = (k: number) => {
  const [, t, , b] = CLOUDS[k].inset;
  return 1 / (1 + t + b);
};
/* A pass cloud: a screen wide, its body centred on the stage's middle,
 * scaled about that point (v4.css .w5-puff). */
const puffStyle = (k: number): CSSProperties => ({
  backgroundImage: `url(${CLOUDS[k].src})`,
  aspectRatio: String(CLOUDS[k].aspect),
  top: `calc(50% - ${((100 / CLOUDS[k].aspect) * bodyY(k)).toFixed(3)}vw)`,
  transformOrigin: `50% ${(bodyY(k) * 100).toFixed(1)}%`,
});
/* A caption's cloud: its render drawn past the caption's box by its own
 * insets, so the text lands on the body. */
const cloudStyle = (k: number): CSSProperties => {
  const [l, t, r, b] = CLOUDS[k].inset;
  return {
    backgroundImage: `url(${CLOUDS[k].src})`,
    left: `${(-l * 100).toFixed(1)}%`,
    top: `${(-t * 100).toFixed(1)}%`,
    right: `${(-r * 100).toFixed(1)}%`,
    bottom: `${(-b * 100).toFixed(1)}%`,
  };
};

/* Which cloud each caption rides, in CAPTIONS order: the low wide ones
 * where the machine fills the frame, the tall and the round one on the
 * meetings stack and the pull-back, which leave the most room. */
const CAPTION_CLOUD = [0, 3, 4, 5, 1, 2];

/* The machine's map (scripts/caption-room.py, room.json): per stage, a grid
 * over the film's frame, one digit a cell for the share of the stage's
 * frames the machine is in it; and every few frames, which cells it's in. */
type Room = {
  cols: number;
  rows: number;
  stages: Record<string, string>;
  chunk: number;
  chunks: string[];
};
const isRoom = (x: unknown): x is Room =>
  !!x &&
  typeof x === "object" &&
  typeof (x as Room).cols === "number" &&
  typeof (x as Room).rows === "number" &&
  typeof (x as Room).stages === "object" &&
  typeof (x as Room).chunk === "number" &&
  Array.isArray((x as Room).chunks);
const ROOM = "/tts/machine/room.json";
const ROOM_KEY = Object.fromEntries(
  Object.entries(STAGE_NAME).map(([k, v]) => [v, k]),
) as Record<Stage, string>;

export default function Week() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const intro = el.querySelector<HTMLElement>(".w5-intro");
    const join = document.getElementById("v4-join");
    const pass = el.querySelector<HTMLElement>(".w5-pass");
    const puffs = [...el.querySelectorAll<HTMLElement>(".w5-puff")];
    let shown = 0;
    let lastNow = 0;
    const film = el.querySelector<HTMLElement>(".w5-film");
    const box = el.querySelector<HTMLElement>(".w4-film");
    const caps = [...el.querySelectorAll<HTMLElement>(".w5-cap")];

    /* The film: a still under reduced motion, otherwise a canvas the
     * scroll draws frames into (filmSeq.ts). Nothing downloads until the
     * dive is about 1.5 screens away (review 4: 5.3 MB at scrollY 0). */
    const portrait =
      window.innerWidth < 768 && window.innerHeight > window.innerWidth;
    let seq: Film | null = null;
    let pending = false;
    if (box && reduced) {
      const img = document.createElement("img");
      img.src = portrait ? FILM.stillPortrait : FILM.still;
      img.alt = "";
      img.className = "w4-media";
      box.append(img);
    } else if (box) {
      const cv = document.createElement("canvas");
      cv.className = "w4-media";
      cv.setAttribute("aria-hidden", "true");
      box.append(cv);
      seq = createFilm(cv, portrait, kick);
      FILM_FRAMES.n = seq.n;
      pending = true;
    }
    /* The film's grain, which the render used to bake into every frame
     * (machine.py: per-pixel grain tripled each 2560 WebP). One tile at the
     * screen's own pixels, built once here; v4.css steps it at 12 fps while
     * the film shows, so a reader parked in the film never sees a frozen
     * frame. The render's strength: a gaussian at 0.17, 0.26 of it. */
    const grain = el.querySelector<HTMLElement>(".w5-grain");
    if (grain && !reduced) {
      const T = 192;
      const c = document.createElement("canvas");
      c.width = c.height = T;
      const g = c.getContext("2d");
      if (g) {
        const im = g.createImageData(T, T);
        for (let i = 0; i < T * T; i++) {
          // Box-Muller, one sample a pixel.
          const u = Math.random() || 1e-6;
          const v = Math.random();
          const z =
            Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * 0.17;
          // 2.2 here read at about 2.5 times the render's grain in a dpr 2
          // crop of the live film; 1 lands near its 0.026.
          const a = Math.min(1, Math.abs(z) * 0.26);
          const k = z > 0 ? 255 : 0;
          im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = k;
          im.data[i * 4 + 3] = Math.round(a * 255);
        }
        g.putImageData(im, 0, 0);
        const dprG = window.devicePixelRatio || 1;
        grain.style.backgroundImage = `url(${c.toDataURL("image/png")})`;
        grain.style.backgroundSize = `${(T / dprG).toFixed(2)}px`;
      }
    }
    const onResize = () => {
      seq?.resize();
      placeAll();
    };
    window.addEventListener("resize", onResize);

    /* The film's own stage frames, from stages.json. */
    fetch(FILM.stages)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: unknown) => {
        if (!j || typeof j !== "object") return;
        const list = Object.entries(j as Record<string, unknown>)
          .filter(
            (e): e is [string, [number, number]] =>
              Array.isArray(e[1]) && STAGE_NAME[e[0]] !== undefined,
          )
          .map(([k, [from, to]]) => ({ name: STAGE_NAME[k], from, to }))
          .sort((x, y) => x.from - y.from);
        if (!list.length) return;
        STAGES.splice(0, STAGES.length, ...list);
        seq?.setStages(list.map((x) => x.from));
        kick();
      })
      .catch(() => {});

    const xray = attachXray(el, reduced);

    /* Each caption takes the emptiest spot along the film's top or bottom
     * edge at the reader's own screen, scored against the machine's map
     * for its stage, when its stage starts and on resize. Corners chosen by
     * eye at 1440 still put the typewriter's caption on the typewriter at
     * Caleb's window (2026-10-11: "Bro ur literally covering the typewriter
     * lmao check all placements"). */
    let room: { land: Room; port: Room } | null = null;
    const at = new Map<number, { x: number; y: number; ci: number }>();
    // Place caption i for film frame fr. Fresh (the pop) takes the best
    // spot; after that it moves only when the machine is coming into it in
    // the next few chunks and another spot is clear, and glides there.
    const place = (c: HTMLElement, i: number, fr: number, fresh: boolean) => {
      const R = room ? (portrait ? room.port : room.land) : null;
      const g = R?.stages[ROOM_KEY[CAPTIONS[i].stage]];
      if (!R || !g || !film) return;
      const ci = Math.max(0, Math.floor(fr / R.chunk));
      const prev = at.get(i);
      if (!fresh && prev && prev.ci === ci) return;
      // The machine in this chunk and the next, about 12 frames.
      const near = (cell: number) => {
        for (let k = ci; k < Math.min(R.chunks.length, ci + 2); k++)
          if (R.chunks[k].charCodeAt(cell) === 49) return true;
        return false;
      };
      const W = film.clientWidth;
      const H = film.clientHeight;
      const fw = portrait ? 9 : 16;
      const fh = portrait ? 16 : 9;
      const sc = Math.max(W / fw, H / fh);
      const ox = (W - fw * sc) / 2;
      const oy = (H - fh * sc) / 2;
      const cw = (fw * sc) / R.cols;
      const ch = (fh * sc) / R.rows;
      const w = c.offsetWidth;
      const h = c.offsetHeight;
      const [il, it, ir, ib] = CLOUDS[CAPTION_CLOUD[i]].inset;
      // How much machine sits under the whole cloud at box position x, y:
      // [now, over the stage]. Now is what has to be clear; the stage
      // average breaks ties so the cloud picks a spot that stays clear.
      const score = (x: number, y: number) => {
        const x0 = x - il * w;
        const y0 = y - it * h;
        const x1 = x + w + ir * w;
        const y1 = y + h + ib * h;
        let now = 0;
        let all = 0;
        const c0 = Math.max(0, Math.floor((x0 - ox) / cw));
        const c1 = Math.min(R.cols - 1, Math.floor((x1 - ox) / cw));
        const r0 = Math.max(0, Math.floor((y0 - oy) / ch));
        const r1 = Math.min(R.rows - 1, Math.floor((y1 - oy) / ch));
        for (let r = r0; r <= r1; r++)
          for (let k = c0; k <= c1; k++) {
            const ax =
              Math.min(x1, ox + (k + 1) * cw) - Math.max(x0, ox + k * cw);
            const ay =
              Math.min(y1, oy + (r + 1) * ch) - Math.max(y0, oy + r * ch);
            if (ax <= 0 || ay <= 0) continue;
            const a = (ax * ay) / (cw * ch);
            const cell = r * R.cols + k;
            if (near(cell)) now += a;
            all += ((g.charCodeAt(cell) - 48) / 9) * a;
          }
        return [now, all];
      };
      const mobile = W < 768;
      // Clear of the nav above and the readouts below.
      const yTop = Math.max(mobile ? 20 : 16, it * h + 10);
      const yBot = H - h - ib * h - (mobile ? 96 : 104);
      const yMid = (H - h) / 2;
      // On a wide screen the caption may go past the nav's column, to
      // where the film is clear (at 1920 the column held it against the
      // typewriter's roller).
      const pad = Math.max(16, (W - 1680) / 2 + 16);
      const xMin = pad + il * w;
      const xMax = W - pad - w - ir * w;
      const xs = mobile
        ? [c.offsetLeft]
        : Array.from({ length: 9 }, (_, k) => xMax - ((xMax - xMin) * k) / 8);
      const ys = mobile ? [yTop, yBot] : [yTop, yMid, yBot];
      // Top right first, then along the top, then the middle and the
      // bottom: a small lean to the top, and a spot must beat the best so
      // far by a quarter of a cell to take over.
      const cost = (x: number, y: number) => {
        const [now, all] = score(x, y);
        return now * 10 + all + (y === yTop ? 0 : y === yMid ? 0.3 : 0.6);
      };
      let best = { x: xs[0], y: yTop, s: Infinity };
      for (const y of ys)
        for (const x of xs) {
          const v = cost(x, y);
          if (v < best.s - 0.25) best = { x, y, s: v };
        }
      if (!fresh && prev) {
        // Stay put unless the machine is arriving here and the new spot
        // has under half as much of it coming. A whole cell of margin kept
        // the tray's caption on its yellow block at 1680 (cover check).
        const [nowHere] = score(prev.x, prev.y);
        const [nowBest] = score(best.x, best.y);
        if (nowHere < 0.05 || nowBest > nowHere * 0.5) {
          at.set(i, { ...prev, ci });
          return;
        }
      }
      at.set(i, { x: best.x, y: best.y, ci });
      c.classList.toggle("is-gliding", !fresh);
      c.style.top = `${best.y.toFixed(0)}px`;
      c.style.bottom = "auto";
      if (!mobile) {
        c.style.left = `${best.x.toFixed(0)}px`;
        c.style.right = "auto";
        c.style.textAlign = best.x + w / 2 > W / 2 ? "right" : "left";
      }
    };
    const placeAll = () => {
      const fr = filmShare(P.week) * FILM_FRAMES.n;
      caps.forEach((c, i) => {
        if (c.classList.contains("is-up")) place(c, i, fr, true);
      });
    };
    fetch(ROOM)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: unknown) => {
        const o = j as { land?: unknown; port?: unknown } | null;
        if (o && isRoom(o.land) && isRoom(o.port)) {
          room = { land: o.land, port: o.port };
          placeAll();
        }
      })
      .catch(() => {});

    const off = onFrame((f) => {
      const p = P.week;
      if (pending) {
        const top = el.getBoundingClientRect().top;
        const diveTop = top + WEEK.dive[0] * (el.offsetHeight - f.vh);
        if (diveTop < 1.5 * f.vh) {
          pending = false;
          seq?.load();
        }
      }
      const q = p - (1 - P.weekIn) * 0.1;

      // "Say your first project is..." rides the travel and the heat map.
      if (intro) {
        const t = prog(q, -0.06, WEEK.dive[1] + 0.006);
        const o = smooth(prog(t, 0, 0.15)) * (1 - smooth(prog(t, 0.8, 1)));
        intro.style.opacity = o.toFixed(3);
        intro.style.visibility = o > 0.002 ? "visible" : "hidden";
        if (!reduced)
          intro.style.transform = `translate3d(0, ${lerp(30, -30, clamp(t)).toFixed(1)}px, 0)`;
      }

      // The way in (choreo.ts WEEK.pass): the camera falls through a layer
      // of clouds over the client's point. They rise out of the point,
      // close over the map by WEEK.swap, where the film takes the screen
      // under them, then break past the edges as the film's own descent
      // carries on. Each cloud grows on one exponential, the camera's, and
      // its distance from the centre grows with it, plus an outward drift
      // after the swap that parts them. No mask anywhere.
      const k = prog(p, WEEK.pass[0], WEEK.pass[1]);
      const passOn = !reduced && k > 0 && k < 1;
      if (pass) {
        pass.style.visibility = passOn ? "visible" : "hidden";
        if (passOn) {
          // 0.04 of a screen wide at the start, 2.4 at the swap (one cloud's
          // face then covers the frame), 3.6 at the end.
          const half = k < 0.5;
          const S = half
            ? 0.04 * Math.pow(60, 2 * k)
            : 2.4 * (1 + prog(k, 0.5, 1) * 0.5);
          // Parting over the whole second half: at 1.9 and eased in, the
          // middle cloud cleared the frame in about 50px of scroll.
          const part = half ? 0 : 1.5 * smooth(prog(k, 0.5, 1));
          const haze = smooth(prog(k, 0, 0.1));
          // Each cloud is a screen wide in CSS and only ever scaled and
          // moved here, so the pass never lays anything out.
          const w = f.vw;
          const h = w / CLOUDS[PUFFS[0].img].aspect;
          // On a tall screen the middle cloud's face has to grow until it
          // covers the stage's height at the swap, not only its width.
          const fit = Math.max(1, (f.vh - 56) / (bodyH(PUFFS[0].img) * h * 2.4));
          puffs.forEach((el, i) => {
            const c = PUFFS[i];
            const sc = S * c.s * fit;
            const x = c.dx * (c.r + part) * w * sc;
            const y = c.dy * (c.r + part) * h * sc;
            el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
            el.style.opacity = haze.toFixed(3);
          });
        }
      }

      if (film) {
        // The film never closes: it ends on its wide golden shot and the
        // doors rise over it on a cardinal sheet (v4.css, ".is-way .jn"),
        // so nothing goes back to the map and there is no white field for
        // the cardinal to flash out of (Caleb, 2026-10-10: "The ending is a
        // white flash bang that turns into red", "Lazy ass transition").
        const on = p >= WEEK.swap || (reduced && p >= WEEK.pass[0]);
        film.style.opacity = on ? "1" : "0";
        film.style.visibility = on ? "visible" : "hidden";
        // The doors' sheet gathers its cardinal points as it arrives.
        if (join)
          join.style.setProperty(
            "--g",
            smooth(prog(p, WEEK.out[0], 1)).toFixed(3),
          );
        // The x-ray hint loop runs only once the clouds have cleared, the
        // grain while any of the film shows.
        film.classList.toggle("is-parked", on && k >= 1);
        film.classList.toggle("is-on", on);
      }

      // The film draws its frame while it's on screen at all. While the
      // scroll moves it blends the two nearest frames; once it settles it
      // eases onto one, since a parked blend across a fast camera move read
      // as a double exposure (live dpr 2 crops, 2026-10-10). It used to
      // jump to the rounded frame the moment the follower stopped, a
      // visible tick every time a reader paused on a caption.
      if (seq && film && film.style.visibility !== "hidden") {
        const at = filmShare(p) * FILM_FRAMES.n - 1;
        const moving = Math.abs(f.y - window.scrollY) > 0.5;
        const target = moving ? at : Math.round(at);
        const dt = lastNow ? Math.min(0.05, (f.now - lastNow) / 1000) : 1;
        shown =
          moving || Math.abs(target - shown) > 3
            ? target
            : shown + (target - shown) * (1 - Math.exp(-dt * 14));
        if (Math.abs(target - shown) < 0.01) shown = target;
        else kick();
        seq.draw(shown);
      }
      lastNow = f.now;

      // Each caption's cloud pops up when its stage starts and holds still
      // while it's read (Caleb, 2026-10-11: "3d clouds that pop up in the
      // video", "cute animations"). The pop is v4.css's, on the clock, not
      // the scroll, so a parked reader sees a cloud that has landed.
      const fr = filmShare(p) * FILM_FRAMES.n;
      caps.forEach((c, i) => {
        const st = STAGES.find((x) => x.name === CAPTIONS[i].stage);
        if (!st) return;
        const t = prog(fr, st.from, st.to);
        // The pull-back's line waits for the camera to clear the mailbox,
        // which still fills its top left for the stage's first frames, and
        // leaves as the doors' sheet starts to rise.
        const pull = st.name === "pullback";
        const up = pull
          ? t >= 0.3 && p < WEEK.out[0] + 0.003
          : t > 0.02 && t < 0.9;
        if (up && c.classList.contains("is-up")) place(c, i, fr, false);
        if (up !== c.classList.contains("is-up")) {
          if (up) place(c, i, fr, true);
          c.classList.toggle("is-up", up);
          c.classList.toggle("is-down", !up);
        }
      });

      xray.frame(p);
    });

    return () => {
      off();
      xray.dispose();
      seq?.dispose();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={root} id="v4-week" className="w5" aria-labelledby="w5-intro">
      <div className="w5-stage">
        {/* Tyler (relayed 2026-10-10): make it clearly one example of a
         * TTS project, with his example client. */}
        {/* The client and the example are named by /way's opener
         * (landing/WayOpen.tsx), so this line carries the next beat: the
         * work leaving USC across the map. */}
        <h2 id="w5-intro" className="w5-intro">
          <span className="w5-label w5-way">the brief</span>
          First, the work leaves USC.
        </h2>

        <div className="w5-pass" aria-hidden="true">
          {PUFFS.map((c, i) => (
            <i
              key={i}
              className="w5-puff"
              style={puffStyle(c.img)}
            />
          ))}
        </div>

        <div className="w5-film">
          <div className="w4-body">
            {/* The film's canvas, or its still, goes in here (the effect above). */}
            <div className="w4-film" />
            <div className="w5-grain" aria-hidden="true" />
            <div id="w4-xray" className="xr-side" aria-label="How it's built">
              <XrayViews />
            </div>
            <div className="xr-line">
              <div
                className="xr-grip"
                role="slider"
                tabIndex={0}
                aria-label="X-ray line"
                aria-orientation="horizontal"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={100}
              />
            </div>
          </div>
          <button
            type="button"
            className="w4-xword w5-xword"
            aria-pressed="false"
            aria-controls="w4-xray"
          >
            x-ray
          </button>
          {CAPTIONS.map((c, i) => (
            <div key={c.stage} className={`w5-cap ${c.at}`}>
              <i
                className="w5-cloud"
                aria-hidden="true"
                style={cloudStyle(CAPTION_CLOUD[i])}
              />
              {c.label && <p className="w5-label">{c.label}</p>}
              <p className="w5-line">{c.line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
