"use client";

import { useEffect, useRef, useState } from "react";
import LAGrid from "./LAGrid";
import { grid, CLIENT_NODE, type GridMode } from "./store";

// Verification harness: one scroll value drives every engine state in order.
// Not part of the home page.

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const prog = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

const BEATS: { from: number; label: string }[] = [
  { from: 0, label: "load" },
  { from: 0.1, label: "pulse" },
  { from: 0.18, label: "stream" },
  { from: 0.38, label: "agent" },
  { from: 0.5, label: "highlight" },
  { from: 0.62, label: "week" },
  { from: 0.8, label: "exit" },
];

const BLOCKS = 10;

function apply(p: number) {
  grid.load = prog(p, 0, 0.1);
  grid.pulse = prog(p, 0.1, 0.18);
  grid.stream = prog(p, 0.18, 0.38);
  grid.agent.from = [0, 0];
  grid.agent.to = CLIENT_NODE;
  grid.agent.t = prog(p, 0.4, 0.5);
  grid.highlight = prog(p, 0.5, 0.6);
  grid.dim = 0.45 * prog(p, 0.62, 0.66) * (1 - prog(p, 0.78, 0.8));
  grid.exit = prog(p, 0.84, 0.98);
  // night, dawn over the stream, cardinal for finding customers, cream for
  // the week, deep cardinal for join
  grid.world =
    prog(p, 0.2, 0.34) + prog(p, 0.38, 0.44) + prog(p, 0.6, 0.66) + prog(p, 0.79, 0.84);
  let mode: GridMode = "basin";
  if (p >= 0.18 && p < 0.38) mode = "freeway";
  else if (p >= 0.38 && p < 0.62) mode = "topdown";
  else if (p >= 0.62 && p < 0.8) mode = "block";
  grid.mode = mode;
  grid.camera.x = mode === "topdown" ? CLIENT_NODE[0] * (0.55 + 0.45 * prog(p, 0.44, 0.52)) : 0;
  grid.camera.y = mode === "topdown" ? CLIENT_NODE[1] * (0.55 + 0.45 * prog(p, 0.44, 0.52)) : 0;
  grid.camera.zoom = mode === "topdown" ? 1.5 : 1;
  grid.camera.tilt = 0.5;
}

export default function GridDemo() {
  const [p, setP] = useState(0);
  const [dark, setDark] = useState(true);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [gone, setGone] = useState<boolean[]>(() => Array(BLOCKS).fill(false));

  useEffect(() => {
    (window as unknown as { __grid: typeof grid }).__grid = grid;
    let watch = 0;
    const poll = () => {
      setDark(grid.isDark);
      watch = requestAnimationFrame(poll);
    };
    watch = requestAnimationFrame(poll);
    let raf = 0;
    const read = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const v = max > 0 ? clamp(window.scrollY / max) : 0;
      apply(v);
      setP(v);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      cancelAnimationFrame(watch);
    };
  }, []);

  // Each block of the example week dissolves into the field at its own
  // scroll point and comes back if you scroll up past it.
  useEffect(() => {
    const week = prog(p, 0.66, 0.78);
    setGone((prev) => {
      let changed = false;
      const next = prev.map((was, i) => {
        const now = week > (i + 1) / (BLOCKS + 1);
        if (now && !was) {
          const el = blockRefs.current[i];
          if (el) {
            const r = el.getBoundingClientRect();
            grid.bursts.push({
              x: r.left,
              y: r.top,
              w: r.width,
              h: r.height,
              t0: performance.now(),
              color: "#990000",
            });
          }
        }
        if (now !== was) changed = true;
        return now;
      });
      return changed ? next : prev;
    });
  }, [p]);

  const beat = [...BEATS].reverse().find((b) => p >= b.from)?.label ?? "load";
  const weekVisible = p >= 0.62 && p < 0.8;

  return (
    <main className="relative min-h-[1600vh] bg-[#0d1020] text-[#1a1416]">
      <LAGrid />
      <div className={`pointer-events-none fixed left-4 top-4 z-10 font-mono text-[11px] leading-5 tracking-wide transition-colors duration-500 ${dark ? "text-white/80" : "text-[#1a1416]/75"}`}>
        <h1 className="text-[11px] font-normal">la grid / verification</h1>
        <p>
          34.0224 N 118.2851 W / beat {beat} / p {p.toFixed(3)}
        </p>
      </div>
      <div
        className={`pointer-events-none fixed bottom-6 left-1/2 z-10 w-[min(92vw,560px)] -translate-x-1/2 border border-[#1a1416]/15 bg-[#FBFAF7]/80 p-4 backdrop-blur-sm transition-opacity duration-500 ${weekVisible ? "opacity-100" : "opacity-0"}`}
      >
        <p className="mb-3 font-mono text-[11px] text-[#1a1416]/70">
          example project / one client
        </p>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: BLOCKS }, (_, i) => (
            <div
              key={i}
              ref={(el) => {
                blockRefs.current[i] = el;
              }}
              className={`h-8 bg-[#990000]/80 transition-opacity duration-200 ${gone[i] ? "opacity-0" : "opacity-100"}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
