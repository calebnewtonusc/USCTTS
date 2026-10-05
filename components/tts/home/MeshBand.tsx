"use client";

import { useEffect, useRef } from "react";
import { attachMesh } from "../engine/mesh";

/* The join band's ground: the replica's mesh shader in close cardinals, so the
 * band the sun became keeps a slow, low movement rather than a swirl. Paused offscreen, a still frame
 * under reduced motion, and the CSS gradient behind it if WebGL is missing. */
const COLORS = ["#a3162b", "#8e1325", "#b31c33", "#7d1020", "#a3162b"];

export default function MeshBand() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const stop = attachMesh(host.current, {
      colors: COLORS,
      speed: 0.25,
      distortion: 2.6,
      swirl: 0.8,
      grainOverlay: 0.18,
      maxDpr: 1,
    });
    return () => stop?.();
  }, []);
  return <div className="join-mesh" ref={host} aria-hidden="true" />;
}
