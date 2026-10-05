"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { clamp, easeOut3, prog, rng } from "../engine/math";

/* What you learn, as a whiteboard that draws itself. The shape of the path is
 * docs/ref/gtm-course-infographic.png (five stations, left to right); every
 * word and every drawing here is ours, and none of its numbers are used.
 *
 * Desktop pins the board and draws station by station from one scroll
 * progress value. Narrow screens stack the stations, each drawing in once as
 * it arrives. Reduced motion shows the finished board. */

interface Station {
  title: string;
  line: string;
  icon: "target" | "lens" | "prompt" | "flow" | "climb";
  items: string[][];
}

const STATIONS: Station[] = [
  {
    title: "Foundation",
    line: "Who buys, and why now.",
    icon: "target",
    items: [
      ["The ideal customer,", "written down"],
      ["Signals: hiring, funding,", "launches"],
      ["Who to leave alone"],
    ],
  },
  {
    title: "Qualification",
    line: "Enrich first, then decide.",
    icon: "lens",
    items: [
      ["Pull the raw accounts"],
      ["Fill in what's missing"],
      ["Score on written criteria"],
      ["Every verdict has a reason"],
    ],
  },
  {
    title: "Prompting",
    line: "Exact, testable, honest.",
    icon: "prompt",
    items: [
      ["A clear role and criteria"],
      ["Structured in, structured out"],
      ["Say none when unsure"],
      ["Test on real records first"],
    ],
  },
  {
    title: "Systems",
    line: "Data in, pipeline out.",
    icon: "flow",
    items: [
      ["Enrichment pipelines"],
      ["Scoring and routing"],
      ["Sequences that stop", "on a reply"],
      ["Measure every stage"],
    ],
  },
  {
    title: "Leverage",
    line: "Build once, run it weekly.",
    icon: "climb",
    items: [
      ["A library of reusable plays"],
      ["Agents inside products"],
      ["Teach the next cohort"],
    ],
  },
];

const W = 300;
/* Narrow screens draw a station's strokes one after another, each over
 * STROKE_MS. Every stroke takes the same time, so stroke k starts after the
 * sum of the k durations before it, k * STROKE_MS: a chain, not a stagger. */
const STROKE_MS = 260;
const H = 600;

/* Marker strokes. Straight lines bow a little and circles overshoot their
 * start, the two tells of a hand. Seeded, so the board is the same on every
 * load. */
function line(x1: number, y1: number, x2: number, y2: number, r: () => number) {
  const mx = (x1 + x2) / 2,
    my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = -(y2 - y1) / (len || 1),
    ny = (x2 - x1) / (len || 1);
  const b = (r() - 0.5) * len * 0.05;
  return `M${(x1 + (r() - 0.5) * 2).toFixed(1)} ${(y1 + (r() - 0.5) * 2).toFixed(1)} Q${(mx + nx * b).toFixed(1)} ${(my + ny * b).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}
function circle(cx: number, cy: number, rad: number, r: () => number) {
  const start = r() * Math.PI * 2;
  const steps = 26;
  const over = 0.35;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const a = start + (i / steps) * (Math.PI * 2 + over);
    const rr = rad * (1 + (r() - 0.5) * 0.06);
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr * 0.96).toFixed(1)}`;
  }
  return d;
}
function rect(x: number, y: number, w: number, h: number, r: () => number) {
  return [
    line(x, y, x + w, y, r),
    line(x + w, y, x + w, y + h, r),
    line(x + w, y + h, x, y + h, r),
    line(x, y + h, x, y, r),
  ].join(" ");
}
function arrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: () => number,
) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 11;
  return [
    line(x1, y1, x2, y2, r),
    line(x2, y2, x2 - Math.cos(a - 0.45) * h, y2 - Math.sin(a - 0.45) * h, r),
    line(x2, y2, x2 - Math.cos(a + 0.45) * h, y2 - Math.sin(a + 0.45) * h, r),
  ].join(" ");
}

function iconPaths(icon: Station["icon"], r: () => number): string[] {
  const cx = W / 2,
    cy = 210;
  switch (icon) {
    case "target":
      return [
        circle(cx, cy, 58, r),
        circle(cx, cy, 36, r),
        circle(cx, cy, 14, r),
        arrow(cx + 100, cy - 70, cx + 8, cy - 6, r),
      ];
    case "lens":
      return [
        circle(cx - 14, cy - 10, 46, r),
        line(cx + 20, cy + 24, cx + 62, cy + 66, r),
        line(cx - 34, cy - 10, cx - 18, cy + 6, r) +
          " " +
          line(cx - 18, cy + 6, cx + 10, cy - 28, r),
      ];
    case "prompt":
      return [
        rect(cx - 84, cy - 56, 168, 112, r),
        line(cx - 62, cy - 28, cx + 46, cy - 28, r),
        line(cx - 62, cy, cx + 20, cy, r),
        line(cx - 62, cy + 28, cx + 58, cy + 28, r),
      ];
    case "flow":
      return [
        rect(cx - 118, cy - 22, 52, 44, r),
        arrow(cx - 60, cy, cx - 30, cy, r),
        rect(cx - 26, cy - 22, 52, 44, r),
        arrow(cx + 32, cy, cx + 62, cy, r),
        rect(cx + 66, cy - 22, 52, 44, r),
      ];
    case "climb":
      return [
        line(cx - 100, cy + 60, cx - 100, cy - 70, r) +
          " " +
          line(cx - 100, cy + 60, cx + 110, cy + 60, r),
        `M${cx - 96} ${cy + 46} Q${cx} ${cy + 40} ${cx + 30} ${cy} T${cx + 104} ${cy - 66}`,
        line(cx - 96, cy + 30, cx + 104, cy + 18, r),
      ];
  }
}

// Media queries as an external store: no setState in an effect, and the
// server renders the finished board (the "still" mode) for no-JS readers.
function useMedia(query: string, server: boolean) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

const ALL_DRAWN = STATIONS.map(() => 1);
const NONE_DRAWN = STATIONS.map(() => 0);

export default function Whiteboard() {
  const sec = useRef<HTMLElement>(null);
  const boards = useRef<(HTMLDivElement | null)[]>([]);
  const reduce = useMedia("(prefers-reduced-motion: reduce)", true);
  const narrow = useMedia("(max-width: 959px)", false);
  const mode: "pinned" | "stacked" | "still" = reduce ? "still" : narrow ? "stacked" : "pinned";
  const [pinnedDrawn, setPinnedDrawn] = useState<number[]>(NONE_DRAWN);
  const [seen, setSeen] = useState<number[]>(NONE_DRAWN);
  const drawn = mode === "still" ? ALL_DRAWN : mode === "stacked" ? seen : pinnedDrawn;

  const art = useMemo(
    () =>
      STATIONS.map((s, i) => {
        const r = rng(500 + i * 17);
        return {
          icon: iconPaths(s.icon, r),
          underline: line(24, 132, 24 + 120 + r() * 60, 128 + r() * 6, r),
          ticks: s.items.map(
            (_, k) =>
              line(28, 352 + k * 58, 40, 364 + k * 58, r) +
              " " +
              line(40, 364 + k * 58, 58, 340 + k * 58, r),
          ),
          next:
            i < STATIONS.length - 1 ? arrow(W - 30, 210, W + 14, 210, r) : "",
        };
      }),
    [],
  );

  useEffect(() => {
    if (mode === "still") return;
    if (mode === "stacked") {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const k = Number((e.target as HTMLElement).dataset.k);
            setSeen((prev) => prev.map((v, i) => (i === k ? 1 : v)));
            io.unobserve(e.target);
          }
        },
        { threshold: 0.35 },
      );
      boards.current.forEach((b) => b && io.observe(b));
      return () => io.disconnect();
    }
    const el = sec.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const travel = el.offsetHeight - window.innerHeight;
      const p = travel > 0 ? clamp(-el.getBoundingClientRect().top / travel) : 0;
      // Each station draws over its own fifth of the first 85%, then the board holds.
      setPinnedDrawn(STATIONS.map((_, i) => prog(p, (i / STATIONS.length) * 0.85, ((i + 0.9) / STATIONS.length) * 0.85)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mode]);

  return (
    <section
      ref={sec}
      id="learn"
      className={`wb wb-${mode}`}
      aria-labelledby="wb-title"
    >
      <div className="wb-pin">
        <div className="wb-head">
          <p className="kicker">What you learn</p>
          <h2 id="wb-title" className="t-h2">
            Five stations, from first list to a machine that runs weekly.
          </h2>
        </div>
        <div className="wb-board">
          {STATIONS.map((s, i) => {
            const d = drawn[i];
            // Stroke order inside a station: underline, icon strokes, ticks, arrow.
            const strokes = [
              art[i].underline,
              ...art[i].icon,
              ...art[i].ticks,
              art[i].next,
            ].filter(Boolean);
            const n = strokes.length;
            return (
              <div
                key={s.title}
                className="wb-station"
                data-k={i}
                ref={(b) => {
                  boards.current[i] = b;
                }}
              >
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  role="img"
                  aria-label={`${i + 1}. ${s.title}. ${s.line} ${s.items.map((t) => t.join(" ")).join(". ")}.`}
                >
                  <text
                    x="24"
                    y="58"
                    className="wb-num"
                    style={{ opacity: clamp(d * 4) }}
                  >
                    {i + 1}.
                  </text>
                  <text
                    x="24"
                    y="112"
                    className="wb-title"
                    style={{ opacity: clamp(d * 3) }}
                  >
                    {s.title}
                  </text>
                  {strokes.map((p, k) => {
                    const local =
                      mode === "stacked"
                        ? d
                        : easeOut3(clamp(d * (n + 2) - k * 0.9));
                    return (
                      <path
                        key={k}
                        d={p}
                        pathLength={1}
                        className={
                          k === 0
                            ? "wb-ink wb-accent"
                            : k === strokes.length - 1 && art[i].next
                              ? "wb-ink wb-next"
                              : "wb-ink"
                        }
                        style={{
                          strokeDashoffset: 1 - local,
                          transitionDuration:
                            mode === "stacked" ? `${STROKE_MS}ms` : undefined,
                          // Chain: the sum of the k equal durations before it.
                          transitionDelay:
                            mode === "stacked"
                              ? `${k * STROKE_MS}ms`
                              : undefined,
                        }}
                      />
                    );
                  })}
                  <text
                    x="24"
                    y="318"
                    className="wb-line"
                    style={{ opacity: clamp(d * 2.5 - 0.6) }}
                  >
                    {s.line}
                  </text>
                  {s.items.map((t, k) => (
                    <text
                      key={k}
                      x="70"
                      y={360 + k * 58}
                      className="wb-item"
                      style={{ opacity: clamp(d * 2.2 - 0.8 - k * 0.12) }}
                    >
                      {t.map((ln, j) => (
                        <tspan key={j} x="70" dy={j ? 20 : 0}>
                          {ln}
                        </tspan>
                      ))}
                    </text>
                  ))}
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
