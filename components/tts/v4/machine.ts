"use client";

import { clamp, easeInOut3, prog, smooth } from "../engine/math";
import { BEAT, P, store } from "./choreo";

/*
 * The week as one machine (Caleb, 2026-10-05, on the old golden-hour
 * pipeline: "it was pretty creative and wasn't just going from thing to
 * thing"). Each beat is caused by the one before it, and you watch the
 * record travel: the businesses the map finds stream up into the lead list,
 * the leads flow down into the replies, the replies and the contacts flow
 * into the CRM, and all three feed the lesson. Conduits of light connect the
 * stations, and records ride them.
 *
 * Everything here is a pure function of the week's one scroll value, so
 * every record runs backward when you scroll back. Paths are rebuilt from
 * the live layout each frame (the map's businesses move with the camera).
 */

const NS = "http://www.w3.org/2000/svg";
const GOLD = "#ffcc00";
const CARD = "#a3162b";
const SKY = "#3f86c9";
const INK = "#6f6264";

type Pt = [number, number];
type Conduit = {
  base: SVGPathElement;
  flow: SVGPathElement;
  recs: SVGGElement[];
  /** where its records travel, on P.week */
  go: [number, number];
  /** stroke visibility: 0 before it's built, then on */
  vis: (p: number) => number;
  /** spacing between its records, on P.week */
  gap: number;
};

/** A polyline with rounded corners, so a conduit reads as a pipe, not a
 *  wire. */
function route(pts: Pt[], r = 9) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const [cx, cy] = pts[i + 1];
    const l1 = Math.hypot(bx - ax, by - ay);
    const l2 = Math.hypot(cx - bx, cy - by);
    const k = Math.min(r, l1 / 2, l2 / 2);
    if (k < 0.5) {
      d += ` L${bx.toFixed(1)},${by.toFixed(1)}`;
      continue;
    }
    const p1x = bx - ((bx - ax) / l1) * k;
    const p1y = by - ((by - ay) / l1) * k;
    const p2x = bx + ((cx - bx) / l2) * k;
    const p2y = by + ((cy - by) / l2) * k;
    d += ` L${p1x.toFixed(1)},${p1y.toFixed(1)} Q${bx.toFixed(1)},${by.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d} L${lx.toFixed(1)},${ly.toFixed(1)}`;
}

function make<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string>,
) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

export function attachMachine(stage: HTMLElement, reduced: boolean) {
  const svg = make("svg", { class: "w4-machine", "aria-hidden": "true" });
  stage.appendChild(svg);
  const panel = stage.querySelector<HTMLElement>(".w4-panel");
  const cal = stage.querySelector<HTMLElement>(".w4-cal");
  const side = stage.querySelector<HTMLElement>(".w4-side");
  const nodes = [...stage.querySelectorAll<HTMLElement>(".w4-node")];
  const body = stage.querySelector<HTMLElement>(".w4-body");

  const conduit = (
    color: string,
    go: [number, number],
    vis: (p: number) => number,
    n: number,
    gap: number,
  ): Conduit => {
    const base = make("path", { class: "mc-base", stroke: color });
    const flow = make("path", { class: "mc-flow", stroke: color });
    svg.append(base, flow);
    const recs: SVGGElement[] = [];
    for (let i = 0; i < n; i++) {
      const g = make("g", { class: "mc-rec" });
      g.append(
        make("circle", { r: "6", fill: color, opacity: "0.22" }),
        make("circle", { r: "2.6", fill: color }),
        make("circle", { r: "1.1", fill: "#fffaf0" }),
      );
      svg.append(g);
      recs.push(g);
    }
    return { base, flow, recs, go, vis, gap };
  };

  const G0 = BEAT.gtm[0];
  // The map's six businesses, one record each, one after another: the lead
  // row it becomes appears as it lands (Week.tsx starts each row at
  // G0 + 0.018 + j * 0.016).
  const mapC = Array.from({ length: 6 }, (_, j) =>
    conduit(
      GOLD,
      [G0 - 0.006 + j * 0.016, G0 + 0.018 + j * 0.016],
      (p) =>
        smooth(prog(p, G0 - 0.02 + j * 0.016, G0 + 0.004 + j * 0.016)) *
        (1 - smooth(prog(p, BEAT.gtm[1] - 0.04, BEAT.gtm[1]))),
      1,
      0,
    ),
  );
  const built = (a: number) => (p: number) =>
    smooth(prog(p, a - 0.04, a - 0.015));
  const E0 = BEAT.email[0];
  const S0 = BEAT.sheet[0];
  const T0 = BEAT.teach[0];
  // Between stations: from, to, lane in the side's left margin, conduit.
  const links: [number, number, number, Conduit][] = [
    [0, 1, 0, conduit(CARD, [E0 - 0.035, E0 + 0.012], built(E0), 4, 0.008)],
    [0, 2, 1, conduit(CARD, [S0 - 0.035, S0 + 0.01], built(S0), 3, 0.008)],
    [1, 2, 0, conduit(SKY, [S0 - 0.03, S0 + 0.012], built(S0), 3, 0.008)],
    [0, 3, 2, conduit(CARD, [T0 - 0.035, T0 + 0.012], built(T0), 2, 0.01)],
    [1, 3, 1, conduit(SKY, [T0 - 0.032, T0 + 0.014], built(T0), 2, 0.01)],
    [2, 3, 0, conduit(INK, [T0 - 0.03, T0 + 0.016], built(T0), 2, 0.01)],
  ];

  const place = (c: Conduit, d: string, p: number, live: boolean) => {
    if (c.base.getAttribute("d") !== d) {
      c.base.setAttribute("d", d);
      c.flow.setAttribute("d", d);
    }
    const len = c.base.getTotalLength() || 1;
    const v = c.vis(p);
    // The conduit draws itself on as it's built, start to end.
    c.base.style.strokeDasharray = `${len.toFixed(1)}`;
    c.base.style.strokeDashoffset = `${(len * (1 - clamp(v * 1.4))).toFixed(1)}`;
    c.base.style.opacity = (0.32 * v).toFixed(3);
    const [a, z] = c.go;
    const running = p > a - 0.004 && p < z + c.gap * c.recs.length;
    c.flow.style.opacity = running && live ? (0.75 * v).toFixed(3) : "0";
    c.recs.forEach((g, i) => {
      const u = easeInOut3(prog(p, a + i * c.gap, z + i * c.gap));
      const on = u > 0 && u < 1 && v > 0.05;
      g.style.opacity = on ? "1" : "0";
      if (!on) return;
      const q = c.base.getPointAtLength(u * len);
      g.setAttribute(
        "transform",
        `translate(${q.x.toFixed(1)},${q.y.toFixed(1)})`,
      );
    });
  };

  const center = (e: HTMLElement, o: DOMRect): Pt => {
    const r = e.getBoundingClientRect();
    return [r.left + r.width / 2 - o.left, r.top + r.height / 2 - o.top];
  };

  return function frame() {
    if (!panel || !cal || !side || nodes.length < 4) return;
    const p = P.week;
    const on = P.weekIn > 0.5 && p < 1;
    svg.style.opacity = on ? "1" : "0";
    if (!on) return;
    const o = stage.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const sr = side.getBoundingClientRect();
    const cr = cal.getBoundingClientRect();
    const xray = body?.classList.contains("is-xray") ?? false;
    const N = nodes.map((n) => center(n, o));
    const stacked = sr.top > cr.top + 20; // the phone layout: side under the calendar

    // The map into the lead list.
    const inlet = N[0];
    mapC.forEach((c, j) => {
      const lit = store.lit[j];
      if (!lit) {
        c.base.style.opacity = "0";
        c.flow.style.opacity = "0";
        c.recs.forEach((g) => (g.style.opacity = "0"));
        return;
      }
      const s: Pt = [lit[0] - o.left, lit[1] - o.top];
      let pts: Pt[];
      if (!stacked) {
        // Up into the gap above the panel, across, and down into the inlet.
        const busY = pr.top - o.top - 9 - j * 2.2;
        pts = [s, [s[0], busY], [inlet[0], busY], inlet];
      } else {
        // On a phone: up over the story's lines, out to the left gutter,
        // down it, and in, so no conduit crosses the calendar or the text.
        const gx = pr.left - o.left - 5 - j * 1.4;
        const topY = Math.min(s[1], 74 + j * 2.2);
        pts = [s, [s[0], topY], [gx, topY], [gx, inlet[1]], inlet];
      }
      place(c, route(pts), p, !reduced);
    });

    // Station to station, down the side's left margin in up to three lanes.
    for (const [a, b, lane, c] of links) {
      const A = N[a];
      const B = N[b];
      const lx = A[0] - 8 - lane * 5;
      place(c, route([A, [lx, A[1]], [lx, B[1]], B], 4), p, !reduced);
      if (xray) c.base.style.opacity = "0";
    }
  };
}
