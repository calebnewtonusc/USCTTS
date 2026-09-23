"use client";

import { useRef, useState } from "react";
import { funnel, sphere, matrix, graph } from "./geometry";

/* A generative plate.
 *
 * The frame system was extracted from uselemma.ai's computed styles on
 * 2026-09-23, and it is the opposite of a card in every particular:
 *
 *   container border ........ 0px, none
 *   border-radius ........... 0px, square corners
 *   background .............. transparent
 *   box-shadow .............. none
 *   padding ................. 18px
 *   label ................... IBM Plex Mono 9px / weight 400 /
 *                             letter-spacing 0.32px / lowercase /
 *                             coloured with the accent, not with a muted grey
 *
 * The visible rectangle is drawn INSIDE the svg as a stroked rect in the same
 * accent as the art. That single decision is why theirs reads as a technical
 * plate and why a bordered, rounded, tinted version reads as a UI card. The
 * first draft here had a 1px grey border, a 6px radius and a backdrop blur,
 * which is three separate ways of saying card.
 *
 * Labels follow their register too: lowercase, describing what the drawing is
 * doing under a force ("distortion under load", "pattern from rotation")
 * rather than titling it.
 */

export type GizmoKind = "funnel" | "sphere" | "matrix" | "graph";

const CAPTIONS: Record<GizmoKind, { code: string; label: string }> = {
  funnel: { code: "TTS. 1.1", label: "six thousand under selection" },
  sphere: { code: "TTS. 1.2", label: "market under rotation" },
  matrix: { code: "TTS. 1.3", label: "coverage under sampling" },
  graph: { code: "TTS. 2.1", label: "paths already open" },
};

export default function Gizmo({
  kind, size = 190, className = "", style,
}: {
  kind: GizmoKind; size?: number; className?: string; style?: React.CSSProperties;
}) {
  const cap = CAPTIONS[kind];
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
        style={{
          transform: `perspective(700px) rotateY(${tilt.x * 7}deg) rotateX(${-tilt.y * 7}deg)`,
        }}
      >
        <svg viewBox="0 0 100 100" className="giz-svg" role="img" aria-label={cap.label}>
          {kind === "funnel" && funnel().map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} pathLength={1}
              style={{ animationDelay: `${(i % 44) * 0.018}s` }} />
          ))}

          {kind === "sphere" && (
            <g className="giz-orbit">
              {sphere().map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} pathLength={1}
                  style={{ animationDelay: `${(i % 60) * 0.015}s` }} />
              ))}
            </g>
          )}

          {kind === "matrix" && (() => {
            const { dots, filled } = matrix();
            return dots.map((d, i) => (
              <circle key={i} cx={d.cx} cy={d.cy} r={d.r}
                className={filled[i] ? "giz-on" : "giz-off"}
                style={{ animationDelay: `${((d.cx * 0.7 + d.cy) % 60) * 0.016}s` }} />
            ));
          })()}

          {kind === "graph" && (() => {
            const { dots, edges } = graph();
            return (
              <>
                {edges.map((e, i) => (
                  <line key={`e${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                    pathLength={1} className="giz-edge"
                    style={{ animationDelay: `${(i % 30) * 0.02}s` }} />
                ))}
                {dots.map((d, i) => (
                  <circle key={`n${i}`} cx={d.cx} cy={d.cy} r={d.r} className="giz-node"
                    style={{ animationDelay: `${0.45 + (i % 20) * 0.03}s` }} />
                ))}
              </>
            );
          })()}
        </svg>
      </div>

      <figcaption className="giz-cap">
        <span className="giz-code">{cap.code}</span>
        <span className="giz-label">{cap.label}</span>
      </figcaption>
    </figure>
  );
}
