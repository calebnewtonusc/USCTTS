"use client";

import { useEffect, useRef } from "react";
import { onFrame } from "../v4/choreo";

/*
 * Motion for the people sections, on the page's one followed scroll.
 *
 *   [data-reveal]  rises in once on arrival and holds (Lemma's section
 *                  entrances are one-shot; its hero tracks scroll), with a
 *                  70ms stagger from the attribute's value.
 *   [data-depth]   drifts against the scroll by its share of the distance
 *                  from the screen's centre, so the wall comes up out of the
 *                  city in layers instead of as one sheet.
 *
 * Positions are measured on resize only, so the frame loop writes
 * transforms and never reads layout. Reduced motion shows everything still.
 */
export default function Depth() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current?.parentElement;
    if (!root) return;
    const reveal = [...root.querySelectorAll<HTMLElement>("[data-reveal]")];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.style.transitionDelay = `${Number(el.dataset.reveal || 0) * 70}ms`;
          el.classList.add("is-in");
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    reveal.forEach((el) => io.observe(el));

    const layers = [...root.querySelectorAll<HTMLElement>("[data-depth]")].map(
      (el) => ({ el, k: Number(el.dataset.depth) || 0, mid: 0 }),
    );
    // Only above 900px wide: on a phone the wall is one column and a
    // drifting card reads as lag, not depth.
    let on = false;
    const measure = () => {
      on = window.innerWidth >= 900;
      for (const L of layers) {
        L.el.style.translate = "";
        const r = L.el.getBoundingClientRect();
        L.mid = r.top + window.scrollY + r.height / 2;
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    const off = onFrame((f) => {
      if (!on) return;
      const c = f.y + f.vh / 2;
      for (const L of layers) {
        const d = L.mid - c;
        if (Math.abs(d) > f.vh * 1.4) continue;
        L.el.style.translate = `0 ${(d * L.k).toFixed(1)}px`;
      }
    }, 3);
    return () => {
      io.disconnect();
      ro.disconnect();
      off();
    };
  }, []);

  return <span ref={ref} hidden />;
}
