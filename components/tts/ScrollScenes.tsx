"use client";

import { useEffect, useRef, useState } from "react";
import Gizmo from "./gizmos/Gizmo";
import DeliverableField from "./DeliverableField";

/* The pinned scene machine.
 *
 * Read off uselemma.ai on 2026-09-23: their page is 17,852px and two sticky
 * containers have parents of 10,800px and 3,600px, so 81% of the page is one
 * screen held still while scroll swaps what is inside it. That is the whole
 * reason it catches you off guard, and it is why a normal stacked page cannot
 * feel like that no matter how many reveals you add.
 *
 * This uses native position: sticky. Scroll stays one-to-one with the wheel
 * and nothing intercepts it, because ux-engine/motion/reveal-on-scroll.md
 * refuses scrolljacking outright and Val Head lists it as a vestibular
 * trigger. What changes is opacity, blur and a small translate, all of which
 * that same file lists as safe.
 */

const SCENES = 3;

export default function ScrollScenes() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (still) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      // rAF-coalesced so a fast wheel cannot queue a hundred layout reads.
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = wrapRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        if (total <= 0) return;
        setP(Math.min(1, Math.max(0, -r.top / total)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [still]);

  /** How present scene `i` is, 0 to 1.
   *
   * Needs a plateau, not a peak. The first version fell off linearly from the
   * centre, so a scene only reached full opacity at one exact scroll position
   * and measured 0.41 everywhere else: the reader never got a legible frame,
   * just a permanent crossfade. This holds each scene at 1 across the middle
   * of its range and only fades near the seams. */
  function presence(i: number) {
    if (still) return 1;
    const span = 1 / SCENES;
    const centre = span * (i + 0.5);
    const d = Math.abs(p - centre) / span;
    return Math.min(1, Math.max(0, (1 - d) * 2.6));
  }

  const style = (i: number): React.CSSProperties => {
    const a = presence(i);
    return {
      opacity: a,
      // Blur and a small lift, both on Val Head's safe list. Travel stays
      // inside the 16 to 32px the research caps a reveal at.
      filter: `blur(${(1 - a) * 7}px)`,
      transform: `translateY(${(1 - a) * 26}px) scale(${0.985 + a * 0.015})`,
      pointerEvents: a > 0.5 ? "auto" : "none",
      visibility: a <= 0.01 ? "hidden" : "visible",
    };
  };

  return (
    <div ref={wrapRef} className="scenes" style={still ? { height: "auto" } : undefined}>
      <div className="scenes-pin" style={still ? { position: "static", height: "auto" } : undefined}>

        <section className="scene" style={still ? undefined : style(0)} aria-hidden={!still && presence(0) < 0.5}>
          <p className="tts-mono">The index</p>
          <h2 className="tts-display scene-h">Six thousand two hundred and forty-five companies.</h2>
          <p className="tts-prose scene-p">
            Every Y Combinator company that has ever launched, enumerated. We
            take three a semester. That ratio is the whole selection argument,
            and it is the shape on the right.
          </p>
          <div className="scene-art"><Gizmo kind="funnel" size={260} /></div>
        </section>

        <section className="scene" style={still ? undefined : style(1)} aria-hidden={!still && presence(1) < 0.5}>
          <p className="tts-mono">What everybody else hands over</p>
          <h2 className="tts-display scene-h">Count how many of these say &ldquo;shipped.&rdquo;</h2>
          <div className="scene-field"><DeliverableField /></div>
        </section>

        <section className="scene" style={still ? undefined : style(2)} aria-hidden={!still && presence(2) < 0.5}>
          <p className="tts-mono">What we hand over</p>
          <h2 className="tts-display scene-h">A thing that is still running after we leave.</h2>
          <p className="tts-prose scene-p">
            A tool that runs without us, the person on your team who owns it,
            the SOP written down, and a number measured before and after. If we
            cannot hand you those four, we did not do the work.
          </p>
          <div className="scene-art"><Gizmo kind="graph" size={240} /></div>
        </section>

      </div>

      {!still && (
        <div className="scenes-rail" aria-hidden="true">
          {Array.from({ length: SCENES }, (_, i) => (
            <span key={i} className="scenes-tick" style={{ opacity: 0.2 + presence(i) * 0.8 }} />
          ))}
        </div>
      )}
    </div>
  );
}
