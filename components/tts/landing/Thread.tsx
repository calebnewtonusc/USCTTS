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
    const lit = el.querySelector<HTMLElement>(".th-lit");
    const head = el.querySelector<HTMLElement>(".th-head");
    const nodesBox = el.querySelector<HTMLElement>(".th-nodes");
    if (!lit || !head || !nodesBox) return;
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

    let last = -1;
    const paint = (y: number) => {
      const at = Math.max(0, Math.min(h, y));
      if (Math.abs(at - last) < 0.5) return;
      last = at;
      lit.style.height = `${at.toFixed(1)}px`;
      head.style.transform = `translate3d(0, ${at.toFixed(1)}px, 0)`;
      head.style.opacity = at > 2 && at < h - 2 ? "1" : "0";
      for (const m of marks) {
        const on = at >= m.y - 1;
        m.node.classList.toggle("is-on", on);
        m.el.classList.toggle("is-on", on);
      }
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
      last = -1;
    });
    ro.observe(sheet);
    if (reduced) {
      // Still: every node lit, no travelling point.
      paint(h);
      head.style.opacity = "0";
      return () => ro.disconnect();
    }
    const off = onFrame((f) => paint(f.y + f.vh * 0.45 - top), 6);
    return () => {
      ro.disconnect();
      off();
    };
  }, []);

  return (
    <div ref={ref} className="th" aria-hidden="true">
      <span className="th-base" />
      <span className="th-lit" />
      <span className="th-nodes" />
      <span className="th-head" />
    </div>
  );
}
