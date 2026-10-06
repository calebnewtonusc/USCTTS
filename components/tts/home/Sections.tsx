"use client";

import { useEffect, useRef } from "react";
import NotifyForm from "@/app/apply/NotifyForm";
import { INSTAGRAM_URL } from "../links";
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
    const doors = [...el.querySelectorAll<HTMLElement>(".jn-door")];
    return onFrame(() => {
      const k = easeOut3(prog(P.join, 0.05, 0.5));
      // The doors rise while the cardinal washes in (review 4: an empty
      // red screen held before them).
      const o = prog(P.join, 0.04, 0.28);
      doors.forEach((d, i) => {
        d.style.transform = `translate3d(0, ${((1 - k) * (60 + i * 50)).toFixed(1)}px, 0)`;
        d.style.opacity = o.toFixed(3);
      });
    });
  }, []);

  /* No headline over the doors (RUBRIC, "No X, Y headline over a
   * subtitle"): the doors are the section, two big choices, each one line
   * in the reader's own voice. */
  return (
    <section ref={sec} id="v4-join" className="jn" aria-label="Two ways in">
      <div className="jn-inner">
        {/* The student door: something to do today (STUDENT-POV, 5). The
         * email signup is right here, no extra click, and the club's
         * Instagram to follow now. No dates until a real one exists. */}
        <div className="jn-door is-student">
          <p className="jn-say">I&apos;m at USC. Teach me to build that.</p>
          <NotifyForm />
          <p className="jn-meta">
            applications open soon.{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="jn-ig"
            >
              Follow us on Instagram
            </a>
          </p>
        </div>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="jn-door"
        >
          <span className="jn-say">
            I run a business. Book 30 minutes with Caleb.
          </span>
          <span className="jn-meta">
            calendly, opens in a new tab{" "}
            <span className="arrow" aria-hidden="true">
              &rarr;
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}
