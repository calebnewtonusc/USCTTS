"use client";

import { useEffect, useRef } from "react";
import { clamp, easeInOut3, lerp, prog, smooth } from "../engine/math";
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

/*
 * The dive and the machine (docs/SCRIPT-v5.md, beats 4 to 6). The grid is
 * the city and the clay machine is what happens inside one point of it. The
 * camera dives through the client's point, its glow fills the screen in the
 * film's ground colour, and the film's first frame, the same colour, racks
 * into focus. The film plays under the scroll, one stage per caption. At the
 * end it pulls back to a point of light on the grid, and the rain begins.
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

/* One line per stage, verbatim from Tyler's voice memo (relayed
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
    at: "is-tc is-mid",
  },
  {
    stage: "mailbox",
    line: "Every reply lands in the client's CRM and gets answered with AI.",
    label: "the CRM",
    at: "is-tl is-mid",
  },
  {
    stage: "blocks",
    line: "Meetings start appearing on the client's calendar within a week.",
    label: "meetings booked",
    at: "is-mr is-big",
  },
  {
    stage: "pullback",
    line: "Then we teach the client to run it and hand it off as a full software project.",
    label: "the handoff",
    at: "is-tl is-big",
  },
];

export default function Week() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const intro = el.querySelector<HTMLElement>(".w5-intro");
    const glow = el.querySelector<HTMLElement>(".w5-glow");
    const film = el.querySelector<HTMLElement>(".w5-film");
    const box = el.querySelector<HTMLElement>(".w4-film");
    const caps = [...el.querySelectorAll<HTMLElement>(".w5-cap")];

    /* The film: a still under reduced motion, otherwise a canvas the
     * scroll draws frames into (filmSeq.ts). Nothing downloads until the
     * dive is about 1.5 screens away (review 4: 5.3 MB at scrollY 0). */
    const portrait = window.innerWidth < 768 && window.innerHeight > window.innerWidth;
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
          const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * 0.17;
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
    const onResize = () => seq?.resize();
    window.addEventListener("resize", onResize);

    /* The film's own stage frames, from stages.json. */
    fetch(FILM.stages)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: unknown) => {
        if (!j || typeof j !== "object") return;
        const list = Object.entries(j as Record<string, unknown>)
          .filter((e): e is [string, [number, number]] => Array.isArray(e[1]) && STAGE_NAME[e[0]] !== undefined)
          .map(([k, [from, to]]) => ({ name: STAGE_NAME[k], from, to }))
          .sort((x, y) => x.from - y.from);
        if (!list.length) return;
        STAGES.splice(0, STAGES.length, ...list);
        seq?.setStages(list.map((x) => x.from));
        kick();
      })
      .catch(() => {});

    const xray = attachXray(el, reduced);

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

      // Through the point: its glow grows from the screen's centre until
      // it's the whole frame, in the film's ground colour.
      if (glow) {
        const g = easeInOut3(
          prog(p, WEEK.dive[0], WEEK.filmIn[0] + 0.002),
        );
        const gone = smooth(prog(p, WEEK.filmIn[1], WEEK.filmIn[1] + 0.01));
        const o = smooth(prog(g, 0, 0.3)) * (1 - gone);
        glow.style.opacity = o.toFixed(3);
        glow.style.visibility = o > 0.002 ? "visible" : "hidden";
        glow.style.transform = `translate(-50%, -50%) scale(${lerp(0.02, 2.4, g).toFixed(3)})`;
      }

      // The film crossfades in over the glow, then at the end shrinks back
      // to the point it came from as the grid returns around it.
      if (film) {
        const a = smooth(prog(p, WEEK.filmIn[0], WEEK.filmIn[1]));
        const shrink = easeInOut3(prog(p, WEEK.out[0], WEEK.out[1]));
        const o = a * (1 - smooth(prog(shrink, 0.85, 1)));
        film.style.opacity = o.toFixed(3);
        film.style.visibility = o > 0.002 ? "visible" : "hidden";
        // Feathered over most of its radius, so the closing film has no
        // edge: it reads as the machine's light drawing in to a point.
        const r = Math.hypot(f.vw, f.vh) * 1.8 * (1 - shrink) + 10;
        film.style.setProperty("--r", `${r.toFixed(0)}px`);
        film.classList.toggle("is-shrinking", shrink > 0);
        // The x-ray hint loop runs only while the film fills the screen,
        // the grain only while any of it shows.
        film.classList.toggle("is-parked", o > 0.98);
        film.classList.toggle("is-on", o > 0.002);
      }

      // The film draws its frame while it's on screen at all.
      // While the scroll is moving it blends the two nearest frames; once
      // it settles it lands on one, since a parked blend of two frames
      // across a fast camera move read as a double exposure (live dpr 2
      // crops, 2026-10-10).
      if (seq && film && film.style.visibility !== "hidden") {
        const at = filmShare(p) * FILM_FRAMES.n - 1;
        const moving = Math.abs(f.y - window.scrollY) > 0.5;
        seq.draw(moving ? at : Math.round(at));
      }

      // Each caption rides its stage's frames.
      const fr = filmShare(p) * FILM_FRAMES.n;
      caps.forEach((c, i) => {
        const st = STAGES.find((x) => x.name === CAPTIONS[i].stage);
        if (!st) return;
        const t = prog(fr, st.from, st.to);
        // The pull-back's line waits for the camera to clear the mailbox,
        // which still fills its top left for the stage's first frames.
        const t0 = st.name === "pullback" ? 0.3 : 0;
        // The pull-back's line stays until the film itself closes, so the
        // zoomed-out machine always has its words (freshman review 2).
        const fade = st.name === "pullback" ? 0 : smooth(prog(t, 0.84, 1));
        const o = smooth(prog(t, t0, t0 + 0.16)) * (1 - fade);
        c.style.opacity = o.toFixed(3);
        c.style.visibility = o > 0.002 ? "visible" : "hidden";
        if (!reduced)
          c.style.transform = `translate3d(0, ${lerp(26, -26, t).toFixed(1)}px, 0)`;
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

        <div
          className="w5-glow"
          aria-hidden="true"
         
        />

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
          {CAPTIONS.map((c) => (
            <div key={c.stage} className={`w5-cap ${c.at}`}>
              {c.label && <p className="w5-label">{c.label}</p>}
              <p className="w5-line">{c.line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
