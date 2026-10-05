"use client";

import { useEffect, useRef } from "react";
import { attachMesh } from "../engine/mesh";

/* The join band's ground: the replica's mesh shader in close cardinals, so the
 * band the sun became keeps a slow, low movement rather than a swirl. Paused offscreen, a still frame
 * under reduced motion, and the CSS gradient behind it if WebGL is missing. */
// Close cardinals only. The darker #7d1020 point read as a dark smudge in
// the band (review, 2026-10-04), so the spread is a few steps either side.
const COLORS = ["#a3162b", "#9b1428", "#aa1a30", "#9f1529", "#a3162b"];

export default function MeshBand() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const stop = attachMesh(host.current, {
      colors: COLORS,
      speed: 0.25,
      distortion: 1.6,
      swirl: 0.5,
      grainOverlay: 0.06,
      maxDpr: 1,
    });
    return () => stop?.();
  }, []);
  return <div className="join-mesh" ref={host} aria-hidden="true" />;
}
