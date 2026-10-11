"use client";

import { useEffect, useRef } from "react";
import { onFrame } from "../v4/choreo";

/*
 * The thread down home's sheet: one dotted line in the opener's point
 * spacing, with USC's cardinal point travelling down it as you read
 * (docs/INTENT-home.md, "One world"). Each section's marker is a node on
 * it that lights when the point reaches it, so the section indicator, the
 * handoff between sections and the recurring USC mark are one object. It
 * sits in the left margin from 1200px up; narrower, each marker shows its
 * own point inline instead.
 */

export function Mark({
  n,
  label,
  tone,
}: {
  n: string;
  label: string;
  tone?: "light";
}) {
  return (
    <p className={`ld-mark${tone ? " is-light" : ""}`} data-mark={n}>
      <span className="ld-mark-dot" aria-hidden="true" />
      <span className="ld-mark-n">{n}</span>
      <span className="ld-mark-l">{label}</span>
    </p>
  );
}

export default function Thread() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const sheet = el?.parentElement;
    if (!el || !sheet) return;
    const head = el.querySelector<HTMLElement>(".th-head");
    const nodesBox = el.querySelector<HTMLElement>(".th-nodes");
    if (!head || !nodesBox) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let top = 0;
    let h = 0;
    let marks: { y: number; el: HTMLElement; node: HTMLElement }[] = [];

    const measure = () => {
      const r = el.getBoundingClientRect();
      top = r.top + window.scrollY;
      h = el.offsetHeight;
      nodesBox.textContent = "";
      marks = [...sheet.querySelectorAll<HTMLElement>("[data-mark]")].map(
        (m) => {
          const mr = m.getBoundingClientRect();
          const y = mr.top + window.scrollY + mr.height / 2 - top;
          const node = document.createElement("span");
          node.className = "th-node";
          node.style.top = `${y.toFixed(1)}px`;
          nodesBox.appendChild(node);
          return { y, el: m, node };
        },
      );
    };

    // Only classes change here, and only when the point crosses a node:
    // the point and the lit line are held by CSS (story.css, .th-rail).
    let lastOn = -1;
    let headOn: boolean | null = null;
    const paint = (y: number) => {
      const at = Math.max(0, Math.min(h, y));
      const show = at > 2 && at < h - 2;
      if (show !== headOn) {
        headOn = show;
        head.classList.toggle("is-on", show);
      }
      let n = 0;
      for (const m of marks) if (at >= m.y - 1) n++;
      if (n === lastOn) return;
      lastOn = n;
      marks.forEach((m, i) => {
        m.node.classList.toggle("is-on", i < n);
        m.el.classList.toggle("is-on", i < n);
      });
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
      lastOn = -1;
    });
    ro.observe(sheet);
    if (reduced) {
      // Still: every node lit, no travelling point.
      paint(h);
      head.classList.remove("is-on");
      return () => ro.disconnect();
    }
    // The real scroll, never the followed one, so a node lights as the
    // sticky point (which tracks the real scroll) reaches it.
    const off = onFrame((f) => paint(window.scrollY + f.vh * 0.45 - top), 6);
    return () => {
      ro.disconnect();
      off();
    };
  }, []);

  return (
    <div ref={ref} className="th" aria-hidden="true">
      <span className="th-base" />
      <span className="th-nodes" />
      <span className="th-rail">
        <span className="th-lit" />
        <span className="th-head" />
      </span>
    </div>
  );
}
