"use client";

import { useEffect, useRef } from "react";
import NotifyForm from "@/app/apply/NotifyForm";
import { INSTAGRAM_URL } from "../links";
import { CALENDLY_URL } from "@/lib/contact";
import "./doors.css";

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
    // One reveal when the doors arrive, both together. The per-frame
    // scroll scrub staggered them 50px apart and fought the doors' own
    // 200ms transform transition, so they stuttered and sat uneven
    // (Caleb, 2026-10-11: "the animation is choppy and unintentional").
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      // As soon as the doors' top clears the bottom tenth, so the red
      // never scrolls by empty while they wait for a 20% threshold.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
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
          <p className="jn-kicker">for USC students</p>
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
          <span className="jn-kicker">for companies and nonprofits</span>
          <span className="jn-say">
            I run a business. Book 30 minutes with Caleb.
          </span>
          <span className="jn-cta">
            Book 30 minutes{" "}
            <span className="arrow" aria-hidden="true">
              &rarr;
            </span>
          </span>
          <span className="jn-meta">calendly, opens in a new tab</span>
        </a>
      </div>
    </section>
  );
}
