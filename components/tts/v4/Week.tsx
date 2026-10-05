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
import XrayViews from "./Xray";
import { attachXray } from "./xrayLine";

/*
 * The dive and the machine (docs/SCRIPT-v5.md, beats 4 to 6). The grid is
 * the city and the clay machine is what happens inside one point of it. The
 * camera dives through the Koreatown point, its glow fills the screen in the
 * film's ground colour, and the film's first frame, the same colour, racks
 * into focus. The film plays under the scroll, one stage per caption. At the
 * end it pulls back to a point of light on the grid, and the rain begins.
 *
 * Reader: a USC student. They're the main character; the dental office is
 * the client, and an example. One scroll value drives all of it, P.week.
 */

/* The film (blender/, commit 1934ab8): 1280x720 and a 720x1280 portrait
 * cut for phones, every frame a keyframe so a seek lands on its exact
 * frame. poster.jpg is frame 1, the flat #F4EFE6 field the dive's glow
 * crossfades into; poster-machine.jpg is frame 330, the whole machine, for
 * reduced motion and for a video that can't play. */
const FILM = {
  sources: [
    { src: "/tts/machine/machine.mp4", type: "video/mp4" },
    { src: "/tts/machine/machine.webm", type: "video/webm" },
  ],
  portrait: [
    { src: "/tts/machine/machine-portrait.mp4", type: "video/mp4" },
    { src: "/tts/machine/machine-portrait.webm", type: "video/webm" },
  ],
  poster: "/tts/machine/poster.jpg",
  posterPortrait: "/tts/machine/poster-portrait.jpg",
  still: "/tts/machine/poster-machine.jpg",
  stillPortrait: "/tts/machine/poster-machine-portrait.jpg",
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

/* One line per stage, verbatim from the script, each with its mono label
 * naming the skill or the tool. The mailbox has no words: the flag pops. */
const CAPTIONS: { stage: Stage; line: string; label?: string; at: string }[] = [
  {
    stage: "tray",
    line: "First you find every business nearby that could use them.",
    label: "finding leads, in Clay",
    at: "is-tr is-big",
  },
  {
    stage: "sorter",
    line: "Then you decide who's actually worth reaching, and teach the AI why.",
    label: "qualifying, with Perplexity research",
    at: "is-tr is-mid",
  },
  {
    stage: "typewriter",
    line: "It drafts the first email. You fix it until it sounds like a person.",
    label: "prompting",
    at: "is-tc is-small",
  },
  {
    stage: "blocks",
    line: "Every reply lands in a CRM you wired up, so nothing gets lost.",
    label: "the CRM",
    at: "is-mr is-big",
  },
  {
    stage: "pullback",
    line: "Then you teach the office to run it without you.",
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

    /* The film: a poster under reduced motion, or if the video can't play;
     * otherwise a video whose time the scroll sets, at most one seek per
     * frame and never while the last one is still landing. */
    let video: HTMLVideoElement | null = null;
    const portrait = window.innerWidth < 768 && window.innerHeight > window.innerWidth;
    const showPoster = () => {
      if (!box) return;
      box.querySelector("video")?.remove();
      if (!box.querySelector("img")) {
        const img = document.createElement("img");
        img.src = portrait ? FILM.stillPortrait : FILM.still;
        img.alt = "";
        img.className = "w4-media";
        box.append(img);
      }
      video = null;
    };
    if (reduced || !box) showPoster();
    else {
      const v = document.createElement("video");
      v.className = "w4-media";
      v.muted = true;
      v.playsInline = true;
      v.preload = "auto";
      v.poster = portrait ? FILM.posterPortrait : FILM.poster;
      v.setAttribute("aria-hidden", "true");
      const list =
        window.innerWidth < 768 && FILM.portrait.length
          ? FILM.portrait
          : FILM.sources;
      list.forEach((s, i) => {
        const src = document.createElement("source");
        src.src = s.src;
        src.type = s.type;
        // The last source failing means nothing can play: show the poster.
        if (i === list.length - 1) src.addEventListener("error", showPoster);
        v.append(src);
      });
      v.addEventListener("error", showPoster);
      // Warm the decoder while the reader is still at the top: the first
      // seek decoded mid-scroll as a 233 ms frame at the dive on a cold
      // load (production build, headed, 2026-10-05).
      v.addEventListener(
        "canplay",
        () => {
          if (v.currentTime === 0) v.currentTime = 0.04;
        },
        { once: true },
      );
      // The frame count is the film's own: duration at 30 fps.
      v.addEventListener("loadedmetadata", () => {
        if (v.duration) FILM_FRAMES.n = Math.round(v.duration * 30);
        kick();
      });
      v.addEventListener("seeked", kick);
      box.append(v);
      video = v;
    }

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
        kick();
      })
      .catch(() => {});

    const xray = attachXray(el, reduced);

    const off = onFrame((f) => {
      const p = P.week;
      const q = p - (1 - P.weekIn) * 0.1;

      // "Say your first project is..." rides the travel and the heat map.
      if (intro) {
        const t = prog(q, -0.06, WEEK.dive[0] + 0.02);
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
          prog(p, WEEK.dive[0] + 0.02, WEEK.filmIn[1] - 0.01),
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
      }

      // One seek per frame at most, and none while one is landing.
      const v = video;
      if (v && v.readyState >= 1 && v.duration && !v.seeking) {
        const tgt = filmShare(p) * (v.duration - 0.04);
        if (Math.abs(v.currentTime - tgt) > 1 / 60) v.currentTime = tgt;
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
        const o = smooth(prog(t, t0, t0 + 0.16)) * (1 - smooth(prog(t, 0.84, 1)));
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
    };
  }, []);

  return (
    <section ref={root} id="v4-week" className="w5" aria-labelledby="w5-intro">
      <div className="w5-stage">
        <h2 id="w5-intro" className="w5-intro">
          Say your first project is a dental office in Koreatown, for example.
        </h2>

        <div
          className="w5-glow"
          aria-hidden="true"
         
        />

        <div className="w5-film">
          <div className="w4-body">
            {/* The video or its poster goes in here (the effect above). */}
            <div className="w4-film" />
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
