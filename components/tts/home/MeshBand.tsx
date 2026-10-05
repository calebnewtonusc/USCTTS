"use client";

import { useEffect, useRef } from "react";
import { attachMesh } from "../engine/mesh";

/* The join band's ground: the replica's mesh shader, recoloured to the page
 * ink with one low trace of the accent, and slowed down so the band breathes
 * rather than swirls. Paused offscreen, a still frame
 * under reduced motion, and the CSS gradient behind it if WebGL is missing. */
const COLORS = ["#2a1b1e", "#3a272b", "#22161a", "#4a3324", "#2f2023"];

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
