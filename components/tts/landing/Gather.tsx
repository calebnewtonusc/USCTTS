"use client";

import { useEffect, useRef } from "react";
import { clamp, prog } from "../engine/math";
import { onFrame } from "../v4/choreo";

/*
 * The end of home's sheet (Caleb, 2026-10-10: "The ending is a white flash
 * bang that turns into red"). The red used to arrive as the paper sheet
 * ended over a cream field that then rained cardinal: bright, brighter,
 * then a full red. Now the thread's USC point gathers at the bottom of the
 * sheet and grows until the sheet is cardinal edge to edge, and the doors'
 * ground continues it, so every frame is a little darker than the one
 * before it. One pure function of the followed scroll; reduced motion
 * shows the filled sheet end.
 */
export default function Gather() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dot = el.querySelector<HTMLElement>(".ga-dot");
    if (!dot) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dot.style.transform = "translate(-50%, -50%) scale(1)";
      return;
    }
    let top = 0;
    let h = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      top = r.top + window.scrollY;
      h = el.offsetHeight;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    let last = -1;
    const off = onFrame((f) => {
      // The growth spans the band plus most of a screen before it, and is
      // full exactly as the band's foot reaches the bottom of the screen.
      // Measured off the band alone it ran over 40% of a band that was later
      // cut short, so white went to red in a few frames (Caleb, 2026-10-10:
      // "The white to red at the end is like a 1 ms flashbang"). Smoothstep,
      // so it eases in as well as out.
      const run = h + f.vh * 0.8;
      const p = clamp(prog(f.y + f.vh - (top - f.vh * 0.8), 0, run));
      const k = p * p * (3 - 2 * p);
      const v = Math.round(k * 1000) / 1000;
      if (v === last) return;
      last = v;
      dot.style.transform = `translate(-50%, -50%) scale(${Math.max(0.004, v).toFixed(3)})`;
    }, 6);
    return () => {
      ro.disconnect();
      off();
    };
  }, []);

  return (
    <div ref={ref} className="ga" aria-hidden="true">
      <span className="ga-dot" />
    </div>
  );
}
