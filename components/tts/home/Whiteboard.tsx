"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { Kalam } from "next/font/google";
import { clamp, easeOut3, prog, rng } from "../engine/math";
import "./whiteboard.css";

/* What you learn, as a whiteboard that draws itself. The shape of the path is
 * docs/ref/gtm-course-infographic.png (five columns, left to right); every
 * word and every drawing here is ours, and none of its numbers are used.
 *
 * One progress value drives the board. Wide screens pin it and draw station
 * by station across the pinned range; narrow screens stack the stations and
 * give each its own progress from where it sits in the viewport. Every
 * animated element carries its own [start, end] window inside its station,
 * and the scroll loop writes straight to the DOM, so React renders once.
 * Reduced motion, and the server, show the finished board. */

const hand = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--wb-hand",
  display: "swap",
});

type Mark =
  | { kind: "stroke"; d: string; faint?: boolean }
  | {
      kind: "label";
      text: string;
      x: number;
      y: number;
      size?: number;
      anchor?: "start" | "middle";
    };

interface Station {
  title: string;
  line: string;
  ordered: boolean;
  items: string[];
  draw: (r: () => number) => Mark[];
}

/* ---------- the marker ---------- */

/* Every stroke is ONE subpath. Dashing restarts per subpath in some engines,
 * and a multi-subpath stroke then draws all its pieces at once instead of in
 * hand order. Straight runs bow a little and endpoints wobble, which is the
 * tell of a hand. Seeded, so the board is identical on every load. */
const f1 = (n: number) => n.toFixed(1);
function seg(x1: number, y1: number, x2: number, y2: number, r: () => number) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = -(y2 - y1) / len,
    ny = (x2 - x1) / len;
  const bow = (r() - 0.5) * len * 0.06;
  return `Q${f1((x1 + x2) / 2 + nx * bow)} ${f1((y1 + y2) / 2 + ny * bow)} ${f1(x2)} ${f1(y2)}`;
}
function poly(pts: [number, number][], r: () => number, close = false) {
  const p = close
    ? [
        ...pts,
        [pts[0][0] + (r() - 0.5) * 3, pts[0][1] + (r() - 0.5) * 3] as [
          number,
          number,
        ],
      ]
    : pts;
  let d = `M${f1(p[0][0] + (r() - 0.5) * 1.5)} ${f1(p[0][1] + (r() - 0.5) * 1.5)}`;
  for (let i = 1; i < p.length; i++)
    d += seg(p[i - 1][0], p[i - 1][1], p[i][0], p[i][1], r);
  return d;
}
const box = (x: number, y: number, w: number, h: number, r: () => number) =>
  poly(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    r,
    true,
  );
function ring(cx: number, cy: number, rad: number, r: () => number) {
  // Overshoots its start by a fifth of a turn, the way a fast circle does.
  const start = r() * Math.PI * 2;
  const steps = Math.max(14, Math.round(rad * 0.9));
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const a = start + (i / steps) * (Math.PI * 2.2);
    const rr = rad * (1 + (r() - 0.5) * 0.05) * (1 - (i / steps) * 0.04);
    d += `${i ? "L" : "M"}${f1(cx + Math.cos(a) * rr)} ${f1(cy + Math.sin(a) * rr * 0.95)}`;
  }
  return d;
}
/* An arrow is two strokes, shaft then head, the order a hand draws them. */
function arrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: () => number,
  head = 9,
): Mark[] {
  const a = Math.atan2(y2 - y1, x2 - x1);
  return [
    {
      kind: "stroke",
      d: poly(
        [
          [x1, y1],
          [x2, y2],
        ],
        r,
      ),
    },
    {
      kind: "stroke",
      d: poly(
        [
          [x2 - Math.cos(a - 0.5) * head, y2 - Math.sin(a - 0.5) * head],
          [x2, y2],
          [x2 - Math.cos(a + 0.5) * head, y2 - Math.sin(a + 0.5) * head],
        ],
        r,
      ),
    },
  ];
}
const s = (d: string, faint = false): Mark => ({ kind: "stroke", d, faint });

/* ---------- the five stations ---------- */

const STATIONS: Station[] = [
  {
    title: "foundation",
    line: "Know exactly who you're for.",
    ordered: false,
    items: [
      "Write the ICP down: industry, size, buyer, pain.",
      "Write the disqualifiers too, and honor them.",
      "Name the signals that mean now: hiring, funding, a launch.",
    ],
    // A target with an arrow in it, and one account struck off to the side.
    draw: (r) => [
      s(ring(96, 84, 56, r)),
      s(ring(96, 84, 35, r)),
      s(ring(96, 84, 14, r)),
      ...arrow(206, 16, 104, 78, r, 12),
      s(ring(208, 132, 13, r)),
      s(
        poly(
          [
            [198, 142],
            [218, 122],
          ],
          r,
        ),
      ),
    ],
  },
  {
    title: "qualification",
    line: "Enrich before you qualify.",
    ordered: true,
    items: [
      "Scrape the raw accounts.",
      "Summarise each one in two lines.",
      "Score against the ICP, and cut.",
      "Only then enrich emails, for who's left.",
    ],
    // Raw accounts pour into a funnel; a few come out, one is cut.
    draw: (r) => [
      ...[44, 70, 96, 122, 148, 174, 200].map((x) =>
        s(ring(x, 14 + (r() - 0.5) * 6, 5, r)),
      ),
      s(
        poly(
          [
            [26, 34],
            [216, 34],
          ],
          r,
        ),
      ),
      s(
        poly(
          [
            [26, 34],
            [106, 104],
            [106, 140],
          ],
          r,
        ),
      ),
      s(
        poly(
          [
            [216, 34],
            [136, 104],
            [136, 140],
          ],
          r,
        ),
      ),
      s(ring(121, 154, 5, r)),
      s(ring(121, 172, 5, r)),
      s(ring(204, 118, 6, r)),
      s(
        poly(
          [
            [194, 108],
            [214, 128],
          ],
          r,
        ),
      ),
      s(
        poly(
          [
            [214, 108],
            [194, 128],
          ],
          r,
        ),
      ),
    ],
  },
  {
    title: "prompting",
    line: "Make the model show its work.",
    ordered: false,
    items: [
      "Criteria written out, and a reason on every verdict.",
      "Return none, never invent.",
      "Test on 50 records before the whole list.",
      "Cheap model first. Escalate only the hard ones.",
    ],
    // A prompt card: criteria with boxes, and the honest answer at the foot.
    draw: (r) => [
      s(box(20, 10, 200, 150, r)),
      s(
        poly(
          [
            [36, 32],
            [150, 32],
          ],
          r,
        ),
      ),
      ...[62, 92].flatMap((y) => [
        s(box(36, y - 9, 14, 14, r)),
        s(
          poly(
            [
              [38, y - 2],
              [43, y + 3],
              [52, y - 12],
            ],
            r,
          ),
        ),
        s(
          poly(
            [
              [62, y],
              [62 + 90 + r() * 40, y],
            ],
            r,
          ),
        ),
      ]),
      s(box(36, 113, 14, 14, r)),
      s(
        poly(
          [
            [62, 120],
            [160, 120],
          ],
          r,
        ),
      ),
      { kind: "label", text: "reason: ...", x: 36, y: 148, size: 15 },
      s(ring(182, 141, 24, r)),
      {
        kind: "label",
        text: "none",
        x: 182,
        y: 146,
        size: 15,
        anchor: "middle",
      },
    ],
  },
  {
    title: "systems",
    line: "Build them in this order.",
    ordered: true,
    items: [
      "Enrichment, so every row is complete.",
      "Scoring, against the written criteria.",
      "Routing, to the right owner.",
      "Signals that restart it, and reporting on every stage.",
    ],
    // Five boxes and the arrows between them, snaking down the board.
    draw: (r) => {
      const W = 60,
        H = 36;
      const top = 12,
        low = 112;
      const xs = [4, 90, 176];
      return [
        s(box(xs[0], top, W, H, r)),
        {
          kind: "label",
          text: "enrich",
          x: xs[0] + W / 2,
          y: top + 23,
          anchor: "middle",
        },
        ...arrow(xs[0] + W + 4, top + H / 2, xs[1] - 4, top + H / 2, r, 7),
        s(box(xs[1], top, W, H, r)),
        {
          kind: "label",
          text: "score",
          x: xs[1] + W / 2,
          y: top + 23,
          anchor: "middle",
        },
        ...arrow(xs[1] + W + 4, top + H / 2, xs[2] - 4, top + H / 2, r, 7),
        s(box(xs[2], top, W, H, r)),
        {
          kind: "label",
          text: "route",
          x: xs[2] + W / 2,
          y: top + 23,
          anchor: "middle",
        },
        ...arrow(xs[2] + W / 2, top + H + 6, xs[2] + W / 2, low - 6, r, 7),
        s(box(xs[2], low, W, H, r)),
        {
          kind: "label",
          text: "signals",
          x: xs[2] + W / 2,
          y: low + 23,
          anchor: "middle",
        },
        ...arrow(xs[2] - 4, low + H / 2, xs[1] + W + 4, low + H / 2, r, 7),
        s(box(xs[1], low, W, H, r)),
        {
          kind: "label",
          text: "report",
          x: xs[1] + W / 2,
          y: low + 23,
          anchor: "middle",
        },
        // Reporting feeds the next pass, so the loop closes back to the start.
        s(
          `M${xs[1] - 4} ${low + H / 2} Q${xs[0] + W / 2} ${low + H / 2} ${xs[0] + W / 2} ${top + H + 8}`,
          true,
        ),
      ];
    },
  },
  {
    title: "compounding",
    line: "Keep everything you build.",
    ordered: false,
    items: [
      "Save every prompt, table and play to a shared library.",
      "The next project starts from the last one.",
      "Write it up, so the next member starts ahead.",
    ],
    // Axes, a straight line for starting over, and the curve that compounds.
    draw: (r) => [
      s(
        poly(
          [
            [18, 6],
            [18, 156],
            [226, 156],
          ],
          r,
        ),
      ),
      s(
        poly(
          [
            [24, 150],
            [220, 104],
          ],
          r,
        ),
        true,
      ),
      s(`M24 152 C110 150 168 126 212 26`),
      ...arrow(204, 44, 213, 22, r, 10).slice(1),
      ...[
        [70, 146],
        [128, 132],
        [172, 104],
      ].map(([x, y]) => s(box(x - 6, y - 6, 12, 12, r))),
    ],
  },
];

/* ---------- timing ---------- */

/* Inside a station, local time t runs 0 to 1:
 *   heading wipes on      0.00 to 0.14
 *   its underline         0.08 to 0.22
 *   the one-line          0.16 to 0.28
 *   the drawing           0.24 to 0.66, its marks in equal slots, in order
 *   the bullets           0.62 to 0.97, each in its own slot
 *   the divider onward    0.90 to 1.00
 * guessed, then checked by eye at 25/50/75% on 2026-10-04. */
const T = {
  head: [0, 0.14],
  under: [0.08, 0.22],
  line: [0.16, 0.28],
  art: [0.24, 0.66],
  items: [0.62, 0.97],
  div: [0.9, 1],
} as const;
function slot(
  range: readonly [number, number],
  k: number,
  n: number,
  overlap = 1.6,
) {
  const [a, b] = range;
  const w = (b - a) / n;
  return [a + k * w, Math.min(b, a + k * w + w * overlap)] as const;
}
/* Pinned: station i draws over [i*SPAN + LEAD, (i+1)*SPAN + LEAD] of the
 * pinned range, so the last one finishes at 0.89 and the finished board holds
 * for the final tenth. */
const SPAN = 0.17;
const LEAD = 0.04;

// The server and no-JS readers see the finished board ("still").
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

interface Anim {
  el: HTMLElement | SVGElement;
  station: number;
  a: number;
  b: number;
  kind: "stroke" | "fade" | "wipe";
  last: number;
}

export default function Whiteboard() {
  const sec = useRef<HTMLElement>(null);
  const reduce = useMedia("(prefers-reduced-motion: reduce)", true);
  const narrow = useMedia("(max-width: 959px)", false);
  const mode: "pinned" | "stacked" | "still" = reduce
    ? "still"
    : narrow
      ? "stacked"
      : "pinned";

  const art = useMemo(
    () =>
      STATIONS.map((st, i) => {
        const r = rng(911 + i * 31);
        return {
          marks: st.draw(r),
          under: poly(
            [
              [2, 6 + r() * 2],
              [70 + r() * 40, 4 + r() * 3],
              [150 + r() * 50, 7 + r() * 2],
            ],
            r,
          ),
          ticks: st.items.map(() =>
            poly(
              [
                [2, 9 + r() * 2],
                [7, 15],
                [17, 2 + r() * 2],
              ],
              r,
            ),
          ),
          div: poly(
            [
              [4, 0],
              [3 + r() * 2, 50],
              [4 + r() * 2, 100],
            ],
            r,
          ),
        };
      }),
    [],
  );

  useEffect(() => {
    const root = sec.current;
    if (!root) return;
    const anims: Anim[] = Array.from(
      root.querySelectorAll<HTMLElement | SVGElement>("[data-a]"),
    ).map((el) => {
      const [a, b] = (el.dataset.a ?? "0,1").split(",").map(Number);
      return {
        el,
        station: Number(el.dataset.s),
        a,
        b,
        kind: (el.dataset.k as Anim["kind"]) ?? "fade",
        last: -1,
      };
    });
    if (mode === "still") {
      for (const n of anims) {
        n.el.style.removeProperty("stroke-dashoffset");
        n.el.style.removeProperty("opacity");
        n.el.style.removeProperty("clip-path");
        n.el.style.removeProperty("transform");
        n.el.classList.remove("is-live");
      }
      return;
    }
    const stations = Array.from(
      root.querySelectorAll<HTMLElement>(".wbd-station"),
    );
    let raf = 0;

    const write = (n: Anim, f: number) => {
      // Quantised so a still scroll writes nothing.
      const q = Math.round(f * 1000) / 1000;
      if (q === n.last) return;
      n.last = q;
      const st = n.el.style;
      if (n.kind === "stroke") {
        st.strokeDashoffset = String(1 - easeOut3(q));
        st.opacity = q > 0 ? "1" : "0";
        n.el.classList.toggle("is-live", q > 0 && q < 1);
      } else if (n.kind === "wipe") {
        st.clipPath = `inset(-20% ${f1((1 - easeOut3(q)) * 100)}% -20% -4%)`;
        // The negative left inset keeps the marker's overhang; hide it until the pen lands.
        st.opacity = q > 0 ? "1" : "0";
      } else {
        st.opacity = String(easeOut3(q));
        st.transform = `translateY(${f1((1 - easeOut3(q)) * 6)}px)`;
      }
    };

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const local: number[] = [];
      if (mode === "pinned") {
        const travel = root.offsetHeight - vh;
        const p =
          travel > 0 ? clamp(-root.getBoundingClientRect().top / travel) : 1;
        for (let i = 0; i < STATIONS.length; i++)
          local.push(prog(p, i * SPAN + LEAD, (i + 1) * SPAN + LEAD));
      } else {
        // Each station draws while its top travels from 92% to 20% of the viewport.
        for (const el of stations) {
          const top = el.getBoundingClientRect().top;
          local.push(prog(vh * 0.92 - top, 0, vh * 0.72));
        }
      }
      for (const n of anims) write(n, prog(local[n.station] ?? 0, n.a, n.b));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mode]);

  const win = (w: readonly [number, number]) =>
    `${w[0].toFixed(3)},${w[1].toFixed(3)}`;

  return (
    <section
      ref={sec}
      id="learn"
      className={`wbd wbd-${mode} ${hand.variable}`}
      aria-labelledby="wbd-title"
    >
      <div className="wbd-pin">
        <div className="wbd-head">
          <p className="kicker">What you learn</p>
          <h2 id="wbd-title" className="t-h2">
            Five stations, from a written ICP to a library that compounds.
          </h2>
        </div>
        <ol className="wbd-board">
          {STATIONS.map((st, i) => {
            const a = art[i];
            const n = a.marks.length;
            return (
              <li key={st.title} className="wbd-station" data-station={i}>
                <h3 className="wbd-title">
                  <span
                    data-a={win(T.head)}
                    data-s={i}
                    data-k="wipe"
                    className="wbd-wipe"
                  >
                    <span className="wbd-num">{i + 1}.</span>
                    <span className="wbd-word">{st.title}</span>
                  </span>
                </h3>
                <svg
                  className="wbd-under"
                  viewBox="0 0 200 12"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d={a.under}
                    pathLength={1}
                    className="wbd-ink wbd-thick"
                    data-a={win(T.under)}
                    data-s={i}
                    data-k="stroke"
                  />
                </svg>
                <p
                  className="wbd-line"
                  data-a={win(T.line)}
                  data-s={i}
                  data-k="fade"
                >
                  {st.line}
                </p>
                <svg
                  className="wbd-art"
                  viewBox="0 0 240 184"
                  aria-hidden="true"
                >
                  {a.marks.map((m, k) => {
                    const w = win(slot(T.art, k, n));
                    return m.kind === "stroke" ? (
                      <path
                        key={k}
                        d={m.d}
                        pathLength={1}
                        className={m.faint ? "wbd-ink wbd-faint" : "wbd-ink"}
                        data-a={w}
                        data-s={i}
                        data-k="stroke"
                      />
                    ) : (
                      <text
                        key={k}
                        x={m.x}
                        y={m.y}
                        textAnchor={m.anchor ?? "start"}
                        className="wbd-label"
                        style={m.size ? { fontSize: m.size } : undefined}
                        data-a={w}
                        data-s={i}
                        data-k="fade"
                      >
                        {m.text}
                      </text>
                    );
                  })}
                </svg>
                <ul className="wbd-items">
                  {st.items.map((t, k) => {
                    const w = slot(T.items, k, st.items.length, 1.2);
                    // The mark draws in the first half of the slot, the words follow it.
                    const mark = [w[0], w[0] + (w[1] - w[0]) * 0.55] as const;
                    return (
                      <li key={k} className="wbd-item">
                        {st.ordered ? (
                          <span
                            className="wbd-n"
                            data-a={win(mark)}
                            data-s={i}
                            data-k="wipe"
                            aria-hidden="true"
                          >
                            {k + 1}
                          </span>
                        ) : (
                          <svg
                            className="wbd-tick"
                            viewBox="0 0 20 18"
                            aria-hidden="true"
                          >
                            <path
                              d={a.ticks[k]}
                              pathLength={1}
                              className="wbd-ink"
                              data-a={win(mark)}
                              data-s={i}
                              data-k="stroke"
                            />
                          </svg>
                        )}
                        <span
                          data-a={win([w[0] + 0.02, w[1]])}
                          data-s={i}
                          data-k="fade"
                        >
                          {t}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {i < STATIONS.length - 1 && (
                  <svg
                    className="wbd-div"
                    viewBox="0 0 8 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d={a.div}
                      pathLength={1}
                      className="wbd-ink wbd-rule"
                      data-a={win(T.div)}
                      data-s={i}
                      data-k="stroke"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
