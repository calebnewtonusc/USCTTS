"use client";

import Gizmo, { type GizmoKind } from "./gizmos/Gizmo";

/* The hero's gizmo field.
 *
 * Positions are the hero's genuinely empty zones, verified against a
 * screenshot. The first pass scattered plates across the whole header and two
 * landed under the H1, making both unreadable. Lemma gets away with a full
 * scatter because its hero type is centred and narrow; this one is
 * left-aligned and wide, so the free space is the right column.
 */
const PLACED: Array<{ kind: GizmoKind; x: string; y: string; size: number; rot: number }> = [
  { kind: "funnel", x: "78%", y: "1%", size: 176, rot: 1.1 },
  { kind: "sphere", x: "88%", y: "34%", size: 150, rot: -1.4 },
  { kind: "graph", x: "74%", y: "66%", size: 146, rot: -0.7 },
];

export default function AmbientField() {
  return (
    <div className="ambient">
      {PLACED.map((p) => (
        <Gizmo
          key={p.kind}
          kind={p.kind}
          size={p.size}
          className="ambient-giz"
          style={{ left: p.x, top: p.y, rotate: `${p.rot}deg` }}
        />
      ))}
    </div>
  );
}
