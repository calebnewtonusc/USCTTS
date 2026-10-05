"use client";

import { useEffect, useRef, useState } from "react";
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
  // No WebGL (blocked, old GPU, a privacy browser): a still frame of the
  // grid at night, so the first screens are never blank (STUDENT-POV, 6).
  const [still, setStill] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) {
      // A state change in an effect, once, from a capability check that
      // only exists in the browser.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStill(true);
      return;
    }
    const ctrl = new AbortController();
    let engine: GridEngine | null = null;
    loadGrid(src, ctrl.signal)
      .then((data) => {
        if (ctrl.signal.aborted) return;
        try {
          engine = createGridEngine(canvas, data);
        } catch {
          // The context can still fail after the probe (lost GPU).
          setStill(true);
        }
      })
      .catch((err: unknown) => {
        if (!ctrl.signal.aborted) console.error("LAGrid:", err);
      });
    return () => {
      ctrl.abort();
      engine?.dispose();
    };
  }, [src]);

  if (still)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/tts/grid/poster.jpg" alt="" aria-hidden="true" className={`${className} object-cover`} />
    );
  return <canvas ref={ref} aria-hidden="true" className={`${className} bg-[#0d1020]`} />;
}
