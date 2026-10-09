"use client";

import { useEffect, useRef } from "react";
import { clamp, easeOut3, lerp, prog, smooth } from "../engine/math";
import { INTRO, onFrame, P } from "./choreo";

/*
 * The opening. Reader: both. One line stands alone on the field (RUBRIC: no
 * "X, Y" headline over a subtitle, no lead paragraph under a headline); the
 * city assembling is the event and the readout says the rest.
 *
 * Two clocks, never confused (lemma-replica/src/sections/hero-intro.js):
 *
 *   load  INTRO.t, the 2200ms clock that starts when the field has drawn
 *         its first frame. Each headline line slides up out of its own mask
 *         at a staggered start, so the words arrive as the streets do.
 *   exit  the followed scroll. Each line leaves upward a fixed distance on
 *         one cubic ease-out (Lemma's 420 and 300 among its seven), so they
 *         finish together and the different distances read as depth. Only
 *         transform and opacity move: the stretch this replaced animated
 *         font-variation-settings, which re-laid the text out every frame.
 */

// Load-clock starts and length for each line's slide, as shares of 2200ms.
// Lemma's copy starts at 0.02 to 0.24; ours waits for the streets to be
// mostly drawn (easeOut3 reaches 0.66 at 0.3) so the words land on a city.
const LINE_START = [0.3, 0.38];
const LINE_SPAN = 0.26;
// Exit distances in px over EXIT_PX of scroll, and the opacity ramp, which
// finishes first so the last of the travel happens on something invisible
// (Lemma: travel ends at 576px, opacity at 552).
const LINE_TRAVEL = [420, 300];
const EXIT_PX = 560;
const FADE_PX = 520;

/* Home and /way share the opener. Home's is short and has no "you" line
 * (Tyler: a basic page first); /way's is the story's start. */
export default function Opening({
  lines,
  you,
  short = false,
}: {
  lines: [string, string];
  you?: string;
  short?: boolean;
}) {
  const copy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = copy.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const lines = [...el.querySelectorAll<HTMLElement>(".v4-h1-l")];
    const inner = lines.map((l) => l.querySelector<HTMLElement>(".v4-rise"));
    const you = el.parentElement?.querySelector<HTMLElement>(".v4-you");
    const cue = el.querySelector<HTMLElement>(".v4-cue");
    return onFrame((f) => {
      const ex = reduced ? 0 : easeOut3(clamp(f.y / EXIT_PX));
      const o = reduced
        ? 1 - smooth(prog(P.open, 0.1, 0.3))
        : 1 - clamp(f.y / FADE_PX);
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o > 0.002 ? "visible" : "hidden";
      // The cue arrives after the second line has landed, and its pulse
      // stops whenever the headline is gone (a paused CSS loop keeps its
      // place).
      if (cue) {
        cue.style.opacity = (smooth(prog(INTRO.t, 0.7, 1)) * o).toFixed(3);
        cue.classList.toggle("is-paused", o < 0.01);
      }
      lines.forEach((ln, i) => {
        const k = reduced
          ? 1
          : easeOut3(prog(INTRO.t, LINE_START[i], LINE_START[i] + LINE_SPAN));
        const r = inner[i];
        if (r)
          r.style.transform =
            k >= 1 ? "" : `translate3d(0, ${((1 - k) * 105).toFixed(2)}%, 0)`;
        ln.style.transform = ex
          ? `translate3d(0, ${(-LINE_TRAVEL[i] * ex).toFixed(1)}px, 0)`
          : "";
      });
      // Hand the lines from the stylesheet's waiting state to this loop
      // only once their transforms are written, so no frame shows them.
      if (el.dataset.intro !== "run") el.dataset.intro = "run";
      // The "you" moment (docs/STUDENT-POV.md, section 2): once the
      // headline has gone, one line comes toward you as the light leaves
      // USC, and holds for the rest of the pin.
      if (you) {
        const t = prog(f.y, 0.42 * f.vh, 0.72 * f.vh);
        const vo = reduced ? smooth(prog(P.open, 0.3, 0.5)) : smooth(t);
        you.style.opacity = vo.toFixed(3);
        you.style.visibility = vo > 0.002 ? "visible" : "hidden";
        if (!reduced)
          you.style.transform = `translate3d(0, ${lerp(80, 0, easeOut3(t)).toFixed(1)}px, 0) scale(${lerp(0.92, 1, easeOut3(t)).toFixed(3)})`;
      }
    });
  }, []);

  return (
    <section
      id="v4-open"
      className={`v4-open${short ? " is-short" : ""}`}
      aria-labelledby="v4-h1"
    >
      <div className="v4-open-stage">
        <div ref={copy} className="v4-open-copy" data-intro="wait">
          <h1 id="v4-h1" className="v4-h1">
            <span className="v4-h1-l">
              <span className="v4-rise">{lines[0]}</span>
            </span>{" "}
            <span className="v4-h1-l">
              <span className="v4-rise">{lines[1]}</span>
            </span>
          </h1>
          {/* What moves at rest on the opener besides the city: a hairline
           * that pulses on Lemma's 2.4s scroll-cue period and says there's
           * more below. It leaves with the headline. */}
          <span className="v4-cue" aria-hidden="true">
            <span className="v4-cue-line" />
            scroll
          </span>
        </div>
        {you && (
          <p className="v4-you" aria-hidden="true">
            {you}
          </p>
        )}
      </div>
    </section>
  );
}
