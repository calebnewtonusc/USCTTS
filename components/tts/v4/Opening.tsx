"use client";

import { useEffect, useRef } from "react";
import { easeIn3, lerp, prog, smooth } from "../engine/math";
import { onFrame, P } from "./choreo";

/*
 * The opening, about 1.5 screens (DIRECTION-tts-v4.md, beat 1). Reader:
 * both. One line stands alone on the field (RUBRIC: no "X, Y" headline
 * over a subtitle, no lead paragraph under a headline); the readouts and
 * the first scroll's scene do the explaining. The words rise on the
 * load clock; the first scroll streams light down the freeways, and the
 * words drift up and give the screen to the field.
 */
export default function Opening() {
  const copy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = copy.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lines = [...el.querySelectorAll<HTMLElement>(".v4-h1-l")];
    return onFrame(() => {
      // Gone before the world under it turns: the wave reaches half the
      // screen around 0.5, and a headline fading through that flip lost
      // its contrast (review 3).
      const o = 1 - smooth(prog(P.open, 0.12, 0.46));
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o > 0.002 ? "visible" : "hidden";
      if (reduced) return;
      el.style.transform = `translate3d(0, ${(-P.open * 64).toFixed(1)}px, 0)`;
      // The headline stretches as it leaves, after the one on Gavin's
      // site: each line condenses on the width axis and pulls taller, the
      // first line a beat ahead of the second, like it's being drawn up
      // the freeway.
      lines.forEach((ln, i) => {
        const k = easeIn3(prog(P.open, 0.02 + i * 0.04, 0.46 + i * 0.04));
        ln.style.fontVariationSettings = `"wdth" ${lerp(100, 75, k).toFixed(1)}`;
        ln.style.transform = `scale(1, ${lerp(1, 1.7, k).toFixed(3)})`;
        ln.style.letterSpacing = `${lerp(-0.025, 0.02, k).toFixed(4)}em`;
      });
    });
  }, []);

  return (
    <section id="v4-open" className="v4-open" aria-labelledby="v4-h1">
      <div className="v4-open-stage">
        <div ref={copy} className="v4-open-copy">
          <h1 id="v4-h1" className="v4-h1">
            <span className="v4-h1-l">
              <span className="v4-rise">USC&apos;s AI</span>
            </span>{" "}
            <span className="v4-h1-l">
              <span className="v4-rise">implementation lab.</span>
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
}
