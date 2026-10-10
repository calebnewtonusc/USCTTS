"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ADVISORS, LEADERSHIP } from "@/data/people";
import { clamp, easeInOut3, lerp, prog, smooth } from "../engine/math";
import { onFrame } from "../v4/choreo";

/*
 * Meet the team, told as the club's comeback (Caleb, 2026-10-10: "Should we
 * move the people page into the main page? The ppl page animation/story is
 * tufff"). /members told it first; home now owns the story and /members is
 * the full roster.
 *
 * One pinned stage on one scroll value. The roster is a field of points in
 * the opener's language, one point a seat: empty rings while the club sat
 * dormant, Matthew Kim's cardinal point handing it on, Caleb's and Tyler's
 * faces landing in their seats, Emily joining, and the rest filling outward
 * from the three of them along dotted lines, each new seat pulled in by a
 * neighbour (the cabinet recruiting from their own majors). The seats are a
 * picture of "dormant" and "full", not a member count.
 *
 * Then the roster sits back and the three faces travel out of their seats
 * into the team cards, the same three photographs, so a face is on the
 * page once and the story's last move is the section's content. Matthew's
 * face is in the advisors section, so here he is his initials.
 */

const COLS = 6;
const ROWS = 5;
const CALEB = 14;
const TYLER = 15;
const EMILY = 20;
const MATTHEW = 0;
const ROOTS = [CALEB, TYLER, EMILY];

// Breadth-first fill outward from the three, with each seat's parent.
const FILL = (() => {
  const dist = new Map<number, number>();
  const parent = new Map<number, number>();
  const q = [...ROOTS];
  ROOTS.forEach((r) => dist.set(r, 0));
  while (q.length) {
    const cur = q.shift() as number;
    const c = cur % COLS;
    const r = Math.floor(cur / COLS);
    for (const n of [
      c > 0 ? cur - 1 : -1,
      c < COLS - 1 ? cur + 1 : -1,
      r > 0 ? cur - COLS : -1,
      r < ROWS - 1 ? cur + COLS : -1,
    ]) {
      if (n < 0 || dist.has(n)) continue;
      dist.set(n, (dist.get(cur) as number) + 1);
      parent.set(n, cur);
      q.push(n);
    }
  }
  const max = Math.max(...dist.values());
  return Array.from({ length: COLS * ROWS }, (_, i) => i)
    .filter((i) => !ROOTS.includes(i) && i !== MATTHEW)
    .map((i) => ({
      i,
      from: parent.get(i) as number,
      // Fill window inside the "cabinet" beat, 0.36 to 0.5.
      a: 0.36 + ((dist.get(i) as number) / max) * 0.11 + ((i * 7) % 5) * 0.002,
    }));
})();

const MATT = ADVISORS.find((p) => p.name === "Matthew Kim");

// Beats: [in from, in to, out from, out to] on the stage's scroll value.
// Windows never overlap, so two lines never share the screen (the /members
// version did, at 0.29 to 0.31).
const BEATS = [
  {
    a: 0,
    b: 0.02,
    c: 0.1,
    d: 0.13,
    text: "For over a year, Trojan Tech Solutions sat dormant, with nobody in it.",
  },
  {
    a: 0.14,
    b: 0.17,
    c: 0.29,
    d: 0.32,
    text: "Then Matthew Kim graduated, on his way to McKinsey, and handed the whole thing to Caleb Newton and Tyler Larsen. It used to build IT solutions for companies, and they turned it into a club that builds AI.",
  },
  {
    a: 0.33,
    b: 0.36,
    c: 0.48,
    d: 0.51,
    text: "So they started over, with Emily Zhao on design. They built a cabinet, and every person on it pulled in people from their own major.",
  },
];

const win = (p: number, a: number, b: number, c = 9, d = 10) =>
  smooth(prog(p, a, b)) * (1 - smooth(prog(p, c, d)));

export default function TeamStory() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const beats = [...el.querySelectorAll<HTMLElement>(".ts-beat")];
    const big = el.querySelector<HTMLElement>(".ts-big");
    const roster = el.querySelector<HTMLElement>(".ts-roster");
    const seats = [...el.querySelectorAll<HTMLElement>(".ts-seat")];
    const pulls = [...el.querySelectorAll<SVGPathElement>(".ts-pull")];
    const threads = [...el.querySelectorAll<SVGPathElement>(".ts-thread")];
    const faces = [...el.querySelectorAll<HTMLElement>(".ts-face")];
    const slots = [...el.querySelectorAll<HTMLElement>(".ts-card-slot")];
    const cards = [...el.querySelectorAll<HTMLElement>(".ts-card-body")];
    const shells = [...el.querySelectorAll<HTMLElement>(".ts-card-in")];
    const head = el.querySelector<HTMLElement>(".ts-head");
    const svg = el.querySelector<SVGSVGElement>(".ts-lines");
    const stage = el.querySelector<HTMLElement>(".ts-stage");
    const leaderSeat = [CALEB, TYLER, EMILY];
    const faceIn = [0.2, 0.23, 0.36];

    let docTop = 0;
    let run = 1;
    // Seat and card rects relative to the stage, measured on resize.
    let seatR: DOMRect[] = [];
    let slotR: DOMRect[] = [];
    let stageR: DOMRect | null = null;

    const centre = (r: DOMRect) => ({
      x: r.left - (stageR?.left ?? 0) + r.width / 2,
      y: r.top - (stageR?.top ?? 0) + r.height / 2,
    });

    const measure = () => {
      const r = el.getBoundingClientRect();
      docTop = r.top + window.scrollY;
      run = Math.max(1, el.offsetHeight - window.innerHeight);
      stageR = stage?.getBoundingClientRect() ?? null;
      seatR = seats.map((s) => s.getBoundingClientRect());
      slotR = slots.map((s) => s.getBoundingClientRect());
      if (svg && stageR) {
        svg.setAttribute("viewBox", `0 0 ${stageR.width} ${stageR.height}`);
        const line = (a: number, b: number) => {
          const A = centre(seatR[a]);
          const B = centre(seatR[b]);
          return `M${A.x.toFixed(1)} ${A.y.toFixed(1)} L${B.x.toFixed(1)} ${B.y.toFixed(1)}`;
        };
        FILL.forEach((f, i) => pulls[i]?.setAttribute("d", line(f.from, f.i)));
        [CALEB, TYLER].forEach((s, i) => {
          const A = centre(seatR[MATTHEW]);
          const B = centre(seatR[s]);
          threads[i]?.setAttribute(
            "d",
            `M${A.x.toFixed(1)} ${A.y.toFixed(1)} C${A.x.toFixed(1)} ${B.y.toFixed(1)} ${A.x.toFixed(1)} ${B.y.toFixed(1)} ${B.x.toFixed(1)} ${B.y.toFixed(1)}`,
          );
        });
      }
    };

    const paint = (p: number) => {
      BEATS.forEach((bt, i) => {
        const o = win(p, bt.a, bt.b, bt.c, bt.d);
        const be = beats[i];
        if (!be) return;
        be.style.opacity = o.toFixed(3);
        be.style.visibility = o > 0.002 ? "visible" : "hidden";
        if (!reduced) be.style.translate = `0 ${((1 - o) * 18).toFixed(1)}px`;
      });
      if (big) {
        const o = win(p, 0.52, 0.55, 0.62, 0.65);
        big.style.opacity = o.toFixed(3);
        big.style.visibility = o > 0.002 ? "visible" : "hidden";
      }
      // The roster sits back for the big line and leaves as the faces travel.
      if (roster) {
        const dim = smooth(prog(p, 0.51, 0.55));
        const gone = smooth(prog(p, 0.63, 0.7));
        const ro = ((1 - 0.85 * dim) * (1 - gone)).toFixed(3);
        roster.style.opacity = ro;
        if (svg) svg.style.opacity = ro;
      }
      // Matthew lights first, then hands it on.
      const m = seats[MATTHEW];
      if (m) m.dataset.on = p > 0.15 ? "1" : "";
      FILL.forEach((f, i) => {
        const t = clamp((p - f.a) / 0.025);
        const s = seats[f.i];
        if (s) s.style.setProperty("--t", t.toFixed(3));
        const pl = pulls[i];
        if (pl)
          pl.style.strokeDashoffset = (
            1 - clamp((p - f.a + 0.012) / 0.02)
          ).toFixed(3);
      });
      threads.forEach((th, i) => {
        th.style.strokeDashoffset = (
          1 - smooth(prog(p, 0.16 + i * 0.02, 0.21 + i * 0.02))
        ).toFixed(3);
        th.style.opacity = (1 - smooth(prog(p, 0.46, 0.5))).toFixed(3);
      });
      // The three faces: in their seats, then out to the cards.
      const travel = easeInOut3(prog(p, 0.64, 0.8));
      faces.forEach((fc, i) => {
        const sr = seatR[leaderSeat[i]];
        const cr = slotR[i];
        if (!sr || !cr || !stageR) return;
        const x = lerp(sr.left, cr.left, travel) - stageR.left;
        const y = lerp(sr.top, cr.top, travel) - stageR.top;
        const w = lerp(sr.width, cr.width, travel);
        const hh = lerp(sr.height, cr.height, travel);
        const o = smooth(prog(p, faceIn[i], faceIn[i] + 0.03));
        fc.style.opacity = o.toFixed(3);
        fc.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        fc.style.width = `${w.toFixed(1)}px`;
        fc.style.height = `${hh.toFixed(1)}px`;
        fc.style.borderRadius = `${lerp(999, 20, travel).toFixed(1)}px`;
      });
      // The cards' grounds arrive under the travelling faces, their words
      // once the faces have landed.
      const groundO = smooth(prog(p, 0.66, 0.78));
      shells.forEach((c) => {
        c.style.opacity = groundO.toFixed(3);
        c.style.visibility = groundO > 0.002 ? "visible" : "hidden";
      });
      const cardO = smooth(prog(p, 0.76, 0.84));
      cards.forEach((c) => {
        c.style.opacity = cardO.toFixed(3);
        c.style.visibility = cardO > 0.002 ? "visible" : "hidden";
      });
      if (head) {
        head.style.opacity = smooth(prog(p, 0.7, 0.8)).toFixed(3);
      }
      el.dataset.done = p > 0.8 ? "1" : "";
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
      paint(reduced ? 1 : lastP);
    });
    ro.observe(el);
    let lastP = -1;
    if (reduced) {
      paint(1);
      return () => ro.disconnect();
    }
    const off = onFrame((f) => {
      const p = Math.round(clamp((f.y - docTop) / run) * 2000) / 2000;
      if (p === lastP) return;
      lastP = p;
      paint(p);
    }, 5);
    return () => {
      ro.disconnect();
      off();
    };
  }, []);

  return (
    <div ref={root} className="ts">
      <div className="ts-stage">
        <div className="ts-copy">
          {BEATS.map((b, i) => (
            <p key={i} className={`ts-beat${i === 0 ? " is-first" : ""}`}>
              {b.text}
            </p>
          ))}
        </div>

        <div className="ts-roster" aria-hidden="true">
          <span className="ts-roster-tag">roster</span>
          <div className="ts-seats">
            {Array.from({ length: COLS * ROWS }, (_, i) => (
              <span
                key={i}
                className={`ts-seat${i === MATTHEW ? " is-matt" : ""}${ROOTS.includes(i) ? " is-root" : ""}`}
              >
                {i === MATTHEW && <span className="ts-ini">MK</span>}
              </span>
            ))}
          </div>
          <span className="ts-matt-tag">
            <b>{MATT?.name ?? "Matthew Kim"}</b> handed it on
          </span>
        </div>
        <svg className="ts-lines" aria-hidden="true">
          {FILL.map((f) => (
            <path key={f.i} className="ts-pull" pathLength={1} />
          ))}
          <path className="ts-thread" pathLength={1} />
          <path className="ts-thread" pathLength={1} />
        </svg>

        <p className="ts-big" aria-hidden="true">
          About three months later, it had a real roster.
        </p>

        <div className="ts-final">
          <h2 id="ld-team-h" className="ts-head">
            Meet <em className="ld-accent">the team.</em>
          </h2>
          <ul className="ts-cards">
            {LEADERSHIP.map((p) => {
              const inner = (
                <>
                  <span className="ts-card-slot" />
                  <span className="ts-card-body">
                    <b>{p.name}</b>
                    <span className="ts-role">{p.role}</span>
                    {p.bio && <span className="ts-bio">{p.bio}</span>}
                    {p.link && (
                      <span className="ts-go">
                        {p.link.includes("linkedin") ? "LinkedIn" : "Website"}{" "}
                        <span aria-hidden="true">&#8599;</span>
                      </span>
                    )}
                  </span>
                </>
              );
              return (
                <li key={p.name} className="ts-card">
                  {p.link ? (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ts-card-in"
                      aria-label={`${p.name}, ${p.role}, ${p.link.includes("linkedin") ? "on LinkedIn" : "website"} (opens in a new tab)`}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="ts-card-in is-static">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {LEADERSHIP.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.name}
            className="ts-face"
            src={p.photo}
            alt=""
            decoding="async"
            style={{ opacity: 0 } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
