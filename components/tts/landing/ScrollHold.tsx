"use client";

import { useEffect } from "react";
import { INTRO } from "../v4/choreo";

/*
 * Caleb, 2026-10-10: "The scroll bar should freeze when the scroll is
 * freezed". During the opener's load clock the city assembles and the
 * headline rises on its own time, and a scroll then only queued up motion
 * the page played late, while the native thumb moved at once. So the page
 * holds its scroll for the clock, the thumb and the screen still together,
 * and lets go as the headline lands (INTRO.t 0.7). scrollbar-gutter keeps
 * the width steady across the switch (story.css). A hard cap lets go after
 * 3.5s whatever the clock does; reduced motion never holds.
 */
const RELEASE_AT = 0.7;
// Guessed: the clock waits up to 3s for the field's first frame, then runs
// 2.2s; the headline lands at 0.7 of that. 3.5s caps a slow GPU.
const CAP_MS = 3500;

export default function ScrollHold() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A reload partway down the page keeps its place and never holds.
    if (window.scrollY > 8) return;
    const html = document.documentElement;
    html.dataset.hold = "1";
    const t0 = performance.now();
    let id = 0;
    const release = () => {
      delete html.dataset.hold;
      cancelAnimationFrame(id);
    };
    const tick = (now: number) => {
      if (INTRO.t >= RELEASE_AT || now - t0 > CAP_MS) {
        release();
        return;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return release;
  }, []);
  return null;
}
