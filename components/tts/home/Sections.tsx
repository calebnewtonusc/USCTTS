"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CALENDLY_URL } from "@/lib/contact";
import { easeOut3, prog } from "../engine/math";
import { onFrame, P } from "../v4/choreo";

/* The two doors at the end of the week (docs/RUBRIC-tts.md: two readers,
 * two doors). The field dissolves into paper behind them (grid.exit), so
 * the page ends on the same ground it started on, with no band and no cut.
 * The student door goes to /apply, which takes an email until applications
 * open; nothing here says they're open now. The business door is Caleb's
 * Calendly, in a new tab (lib/contact.ts). */
export function Join() {
  const sec = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sec.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const big = el.querySelector<HTMLElement>(".jn-title");
    const doors = [...el.querySelectorAll<HTMLElement>(".jn-door")];
    return onFrame(() => {
      const k = easeOut3(prog(P.join, 0.1, 0.9));
      if (big) big.style.transform = `translate3d(0, ${((1 - k) * 56).toFixed(1)}px, 0)`;
      doors.forEach((d, i) => {
        d.style.transform = `translate3d(0, ${((1 - k) * (80 + i * 30)).toFixed(1)}px, 0)`;
      });
    });
  }, []);

  return (
    <section ref={sec} id="v4-join" className="jn" aria-labelledby="jn-title">
      <div className="jn-inner">
        <h2 id="jn-title" className="jn-title">
          And this is where you&apos;d learn to build all of it.
        </h2>
        <div className="jn-doors">
          <div className="jn-door">
            <p>
              If you&apos;re at USC, you&apos;d build exactly this, on Clay
              and Perplexity, for real businesses. Applications open soon.
            </p>
            <Link href="/apply" className="btn btn-primary jn-cta">
              Hear when applications open{" "}
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
          <div className="jn-door">
            <p>
              And if your week looks anything like that one, let&apos;s go
              through it together.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary jn-cta-2"
            >
              Book 30 minutes with Caleb{" "}
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
