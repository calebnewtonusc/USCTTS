"use client";

import { useEffect, type RefObject } from "react";

/* One progress value for a pinned band: 0 when the section's top reaches
 * the top of the screen, 1 when its bottom leaves it, read from the real
 * scroll on every frame it changes. The band is sticky, so everything in it
 * holds still on screen; reading a smoothed copy of the scroll here made
 * home's thread point bounce on every wheel notch (site-gate jitter). Under
 * reduced motion the callback gets 1 once and the band shows its end. */
export function usePin(
  ref: RefObject<HTMLElement | null>,
  draw: (p: number, el: HTMLElement) => void,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.reduced = "1";
      draw(1, el);
      return;
    }
    let raf = 0;
    let last = -1;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 1;
      if (Math.abs(p - last) < 0.0004) return;
      last = p;
      draw(p, el);
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
    // draw is a module-level function in every caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
