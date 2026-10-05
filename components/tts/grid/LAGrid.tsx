"use client";

import { useEffect, useRef } from "react";
import { loadGrid } from "./data";
import { createGridEngine, type GridEngine } from "./engine";

interface LAGridProps {
  /** positioning and stacking; defaults to a fixed full-viewport layer */
  className?: string;
  src?: string;
}

/**
 * LA's real street grid as points of light on paper, centred on USC. Reads
 * the shared `grid` store from ./store every frame; renders nothing but the
 * canvas. Data (c) OpenStreetMap contributors, ODbL.
 */
export default function LAGrid({
  className = "pointer-events-none fixed inset-0 h-full w-full",
  src = "/tts/grid/la-grid.bin",
}: LAGridProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctrl = new AbortController();
    let engine: GridEngine | null = null;
    loadGrid(src, ctrl.signal)
      .then((data) => {
        if (!ctrl.signal.aborted) engine = createGridEngine(canvas, data);
      })
      .catch((err: unknown) => {
        if (!ctrl.signal.aborted) console.error("LAGrid:", err);
      });
    return () => {
      ctrl.abort();
      engine?.dispose();
    };
  }, [src]);

  return <canvas ref={ref} aria-hidden="true" className={`${className} bg-[#0d1020]`} />;
}
