"use client";

import { useEffect, useRef } from "react";

/* The join page's close: USC's point grows out of the paper until the band
 * is cardinal, the same ending as home (components/tts/landing/Gather.tsx),
 * so no frame flashes brighter before the red. Then one action: apply when
 * the form is open, and until then a jump back to the email signup. */
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
      <div className="jo-wrap jo-end-in">
        <h2 id="jo-end-h" className="jo-end-h">
          {open
            ? "Applications are open now."
            : "Get an email the day applications open."}
        </h2>
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
          <a className="jo-apply is-light" href="#apply">
            Get on the list <span aria-hidden="true">&uarr;</span>
          </a>
        )}
      </div>
    </section>
  );
}
