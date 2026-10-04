"use client";

import { useRef, useState } from "react";
import { harmonograph, phyllotaxis, chladni, flowField, toPath, type Poly } from "./geometry";

/* A generative plate.
 *
 * Frame system extracted from uselemma.ai's computed styles: no border, no
 * radius, no background, no shadow, 18px padding, and a 9px lowercase label in
 * the accent rather than a muted grey. Everything that would make this read as
 * a card is deliberately absent.
 *
 * The drawings are published algorithms at parameter sets that were rendered
 * and checked, replacing four shapes that were invented here. Each one also
 * carries a real quantity, which is the part Lemma's abstract figures do not
 * do: their sphere is a sphere, this one is 280 marks for 280 companies.
 *
 * Element budget is hard because stagger is per element: 300 elements at 17ms
 * is a 5.1 second draw-on. Counts below are measured, not estimated.
 */

export type GizmoKind = "selection" | "market" | "resonance" | "routing";

const CAPTIONS: Record<GizmoKind, { code: string; label: string }> = {
  selection: { code: "TTS. 1.1", label: "six thousand under selection" },
  market:    { code: "TTS. 1.2", label: "every company, packed" },
  resonance: { code: "TTS. 1.3", label: "where the plate is still" },
  routing:   { code: "TTS. 2.1", label: "paths that avoid each other" },
};

/* Drawn once at module load. These are pure and deterministic, so the server
 * and the client produce identical markup and hydration never warns. */
const SHAPES: Record<GizmoKind, { polys: Poly[]; dots?: { cx: number; cy: number; r: number }[] }> = {
  // 1 element. Detuned by driftPi 1.2, which is the phase-drift quantity that
  // makes it precess rather than sit still.
  selection: { polys: harmonograph({ base: [5, 4], driftPi: 1.2 }) },
  // 280 circles, zero path points. Over the 250 threshold where the Fibonacci
  // arms become the dominant read instead of scattered noise.
  market:    { polys: [], dots: phyllotaxis({ n: 280, k: 0.72 }) },
  // Contours stitched from marching squares: ~15 elements instead of ~800.
  // n=4 m=7 is coprime, which is what keeps it from degenerating to a grid.
  resonance: { polys: chladni({ n: 4, m: 7 }) },
  // Separation-enforced so streamlines never converge into a black bundle,
  // and quantised to pi/4 for the circuit-board read.
  routing:   { polys: flowField({ seed: 9, quant: 4 }) },
};

export default function Gizmo({
  kind, size = 190, className = "", style,
}: {
  kind: GizmoKind; size?: number; className?: string; style?: React.CSSProperties;
}) {
  const cap = CAPTIONS[kind];
  const shape = SHAPES[kind];
  const ref = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    });
  }

  const count = shape.dots?.length ?? shape.polys.length;
  // The 400ms ceiling from motion/stagger.md, divided across whatever this
  // drawing actually emits, so a 1-element figure and a 280-element one both
  // finish on time instead of one of them running for five seconds.
  const step = count > 1 ? Math.min(0.02, 0.4 / (count - 1)) : 0;

  return (
    <figure
      ref={ref}
      className={`giz giz-${kind} ${className}`}
      style={{ width: size, ...style }}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div
        className="giz-stage"
        style={{ transform: `perspective(700px) rotateY(${tilt.x * 7}deg) rotateX(${-tilt.y * 7}deg)` }}
      >
        <svg viewBox="0 0 100 100" className="giz-svg" role="img" aria-label={cap.label}>
          <g className={kind === "market" ? "giz-orbit" : undefined}>
            {shape.polys.map((p, i) => (
              <path
                key={i}
                d={toPath(p)}
                pathLength={1}
                style={{ animationDelay: `${(i % 30) * step}s` }}
              />
            ))}
            {shape.dots?.map((d, i) => (
              <circle
                key={i}
                cx={d.cx} cy={d.cy} r={d.r}
                className="giz-node"
                style={{ animationDelay: `${(i % 30) * step}s` }}
              />
            ))}
          </g>
        </svg>
      </div>

      <figcaption className="giz-cap">
        <span className="giz-code">{cap.code}</span>
        <span className="giz-label">{cap.label}</span>
      </figcaption>
    </figure>
  );
}
