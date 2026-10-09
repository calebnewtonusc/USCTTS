"use client";

import { useEffect, useRef } from "react";
import { smooth } from "../engine/math";
import { onFrame, P } from "../v4/choreo";

/*
 * Home's paper sheet (Tyler, 2026-10-09: after the dot in LA, a separating
 * tab and then "it goes into being a real website"). At load its top edge
 * already peeks up from the bottom of the first screen, inset and rounded,
 * the way clay.com's does, and on scroll it grows to the full width as it
 * covers the city (interface skill: nothing arrives from nowhere). One
 * value, P.sheet, on the page's one followed scroll.
 */
export default function Sheet({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--k", "1");
      return;
    }
    let last = "";
    return onFrame(() => {
      const k = smooth(P.sheet).toFixed(3);
      if (k === last) return;
      last = k;
      el.style.setProperty("--k", k);
    }, 1);
  }, []);

  return (
    <div ref={ref} id="v4-sheet" className="ld">
      {children}
    </div>
  );
}
