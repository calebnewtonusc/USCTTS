"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* Smooth scroll, which is most of why a page feels expensive rather than
 * expensive-looking. Disabled outright when the visitor asks for reduced
 * motion, because hijacking scroll is the single most disorienting thing a
 * site can do to someone who has that set. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
