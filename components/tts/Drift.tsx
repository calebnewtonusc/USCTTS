"use client";

import { useEffect } from "react";

/*
 * Scroll depth for a page with no scroll scene of its own. Every element
 * marked data-drift="<rate>" travels a little slower than the page, by
 * rate times its distance from the middle of the screen, so cards and
 * figures set at different rates separate in depth as they pass and no
 * band sits dead once it lands. Caleb, 2026-10-10, on a band that only
 * moved on its way in: "Chewb should ALWAYS be intentional with how it
 * chooses to fill EVERY space"; site-gate fails a section where nothing
 * moves on entry, at rest or on scroll.
 *
 * Rates between 0.1 and 0.2 read as depth; above that a card visibly
 * slides off its neighbours. The offset is capped so a long scroll never
 * carries an element into the next section. Reduced motion draws nothing.
 */

// 80px: at the top rate (0.2) that is reached 400px from centre, so a
// band whose top is at the top of a 900px screen is still moving.
const CAP = 80;

export default function Drift({ scope = "body" }: { scope?: string }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(scope);
    if (!root) return;
    const els = [...root.querySelectorAll<HTMLElement>("[data-drift]")];
    if (!els.length) return;
    let base: { el: HTMLElement; mid: number; rate: number }[] = [];

    // Layout positions without the drift itself, so the measure is stable.
    const measure = () => {
      els.forEach((el) => (el.style.translate = ""));
      base = els.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          mid: r.top + window.scrollY + r.height / 2,
          rate: Number(el.dataset.drift) || 0.12,
        };
      });
      paint();
    };

    const paint = () => {
      const c = window.scrollY + window.innerHeight / 2;
      for (const b of base) {
        const off = Math.max(-CAP, Math.min(CAP, (b.mid - c) * b.rate));
        b.el.style.translate = `0 ${off.toFixed(1)}px`;
      }
    };

    let raf = 0;
    const on = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          paint();
        });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    addEventListener("scroll", on, { passive: true });
    return () => {
      ro.disconnect();
      removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
      els.forEach((el) => (el.style.translate = ""));
    };
  }, [scope]);

  return null;
}
