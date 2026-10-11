"use client";

import { useEffect, useRef } from "react";
import type React from "react";
import DotFloor from "@/components/tts/landing/DotFloor";
import "./joinend.css";

/* The join page's close: USC's point grows out of the paper until the band
 * is cardinal, the same ending as home (components/tts/landing/Gather.tsx),
 * so no frame flashes brighter before the red, and the streets around USC
 * fill the band behind the words (joinend.css). Then one action: apply when
 * the form is open, and until then a jump back to the email signup. */
/* Back up to the signup is most of the page away now that 01 and 02 are
 * pinned (about nine screens), and a smooth scroll that far reads as a
 * strobe (library/crafts/website.md: 1.85 screens in one frame across a
 * 13-screen pin). So it dissolves: the page fades, moves under the veil to
 * just below the form, and glides the last 0.6 of a screen in while it
 * fades back. Reduced motion goes straight there. */
function toList(e: React.MouseEvent<HTMLAnchorElement>) {
  const t = document.getElementById("apply");
  if (!t) return;
  e.preventDefault();
  const r = t.getBoundingClientRect();
  const goal = Math.max(
    0,
    r.top + scrollY - Math.max(0, (innerHeight - r.height) / 2),
  );
  const focus = () =>
    t.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
  const main = document.querySelector<HTMLElement>("main");
  if (!main || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    scrollTo({ top: goal, behavior: "auto" });
    focus();
    return;
  }
  main.style.transition = "opacity 220ms cubic-bezier(0.4, 0, 1, 1)";
  main.style.opacity = "0";
  setTimeout(() => {
    scrollTo({ top: goal + innerHeight * 0.6, behavior: "auto" });
    main.style.transition = "opacity 520ms cubic-bezier(0, 0, 0.2, 1)";
    main.style.opacity = "";
    scrollTo({ top: goal, behavior: "smooth" });
    setTimeout(focus, 560);
  }, 230);
}

export default function JoinEnd({
  open,
  formUrl,
}: {
  open: boolean;
  formUrl: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    const dot = el?.querySelector<HTMLElement>(".jo-end-dot");
    if (!el || !dot) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dot.style.transform = "translate(-50%, -50%) scale(1)";
      return;
    }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const k = Math.min(
        1,
        Math.max(0, (innerHeight - r.top) / (r.height * 0.55)),
      );
      const e = 1 - (1 - k) ** 3;
      dot.style.transform = `translate(-50%, -50%) scale(${Math.max(0.004, e).toFixed(3)})`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="jo-end" aria-labelledby="jo-end-h">
      <span className="jo-end-dot" aria-hidden="true" />
      <div className="jo-end-floor" aria-hidden="true">
        <DotFloor
          win={[-5200, -1400, 5200, 1400]}
          color="#ffffff"
          alpha={0.55}
          max={2600}
          hold
        />
      </div>
      <div className="jo-wrap jo-end-in">
        <h2 id="jo-end-h" className="jo-end-h">
          {open
            ? "Applications are open now."
            : "Get an email the day applications open."}
        </h2>
        {/* The student's last question before signing up is whether this
         * is legit; the partnership is the answer (docs/COPY-tts.md, the
         * stack moment, always "through Blue Modern Advisory"). */}
        <p className="jo-end-sub">
          We&apos;re official Clay and Perplexity partners through Blue Modern
          Advisory, so as a member you build with both.
        </p>
        {open ? (
          <a
            className="jo-apply is-light"
            href={formUrl}
            target="_blank"
            rel="noreferrer"
          >
            Apply on Google Forms <span aria-hidden="true">&rarr;</span>
          </a>
        ) : (
          <a className="jo-apply is-light" href="#apply" onClick={toList}>
            Get on the list <span aria-hidden="true">&uarr;</span>
          </a>
        )}
      </div>
    </section>
  );
}
