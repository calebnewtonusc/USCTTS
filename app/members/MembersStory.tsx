"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ADVISORS, LEADERSHIP } from "@/data/people";

/* The club's story told through its people, on one scroll value.
 *
 * One sticky stage holds a roster of 30 outlined seats (the "empty room").
 * As you scroll, one value p from 0 to 1 is written to --p on the root, and
 * every part of the scene reads its own window [a, b] of it in CSS, so faces
 * fill their seats as the story reaches them and leave the same way when you
 * scroll back. The seats are a picture of "dormant", "handed over" and
 * "full", not a member count: no count is on record. */

const COLS = 6;
const ROWS = 5;
const SEAT_W = 76;
const SEAT_H = 92;
const GAP = 12;
const X0 = 42;
const Y0 = 60;

const seat = (i: number) => ({
  x: X0 + (i % COLS) * (SEAT_W + GAP),
  y: Y0 + Math.floor(i / COLS) * (SEAT_H + GAP),
});
const center = (i: number) => {
  const s = seat(i);
  return { x: s.x + SEAT_W / 2, y: s.y + SEAT_H / 2 };
};

const MATTHEW_SEAT = 0;
const CALEB_SEAT = 14;
const TYLER_SEAT = 15;
const EMILY_SEAT = 20;
const ROOTS = [CALEB_SEAT, TYLER_SEAT, EMILY_SEAT];

/* The roster fills outward from the three people running it, each new seat
 * pulled in by a neighbour that's already there: the cabinet pulling people
 * from their own majors, drawn as a spreading tree rather than a number. */
const FILL = (() => {
  const dist = new Map<number, number>();
  const parent = new Map<number, number>();
  const root = new Map<number, number>();
  const queue = [...ROOTS];
  ROOTS.forEach((r) => {
    dist.set(r, 0);
    root.set(r, r);
  });
  while (queue.length) {
    const cur = queue.shift() as number;
    const c = cur % COLS;
    const r = Math.floor(cur / COLS);
    const next = [
      c > 0 ? cur - 1 : -1,
      c < COLS - 1 ? cur + 1 : -1,
      r > 0 ? cur - COLS : -1,
      r < ROWS - 1 ? cur + COLS : -1,
    ].filter((n) => n >= 0 && !dist.has(n));
    for (const n of next) {
      dist.set(n, (dist.get(cur) as number) + 1);
      parent.set(n, cur);
      root.set(n, root.get(cur) as number);
      queue.push(n);
    }
  }
  return Array.from({ length: COLS * ROWS }, (_, i) => i)
    .filter((i) => !ROOTS.includes(i))
    .map((i) => {
      const d = dist.get(i) as number;
      // a small fixed jitter so a ring doesn't land as one block
      const a = 0.355 + d * 0.014 + ((i * 7) % 5) * 0.0025;
      return {
        i,
        from: parent.get(i) as number,
        root: root.get(i) as number,
        a,
        b: a + 0.03,
      };
    });
})();

const BRANCH: Record<number, string> = {
  [CALEB_SEAT]: "ms-sky",
  [TYLER_SEAT]: "ms-gold",
  [EMILY_SEAT]: "ms-paper",
};

const [CALEB, TYLER, EMILY] = LEADERSHIP;
// The faculty advisor first, then the mentors with a company, the same
// filter the page used before (Caleb's mom stays off, as she was).
const MENTORS = ADVISORS.filter((p) => p.company);
const SWAIN = MENTORS[0];
const REST = MENTORS.slice(1);
const MATTHEW = MENTORS.find((p) => p.name === "Matthew Kim") ?? MENTORS[1];

const MARKS = [
  { name: "Reddit", src: "/tts/alumni/reddit.svg", dx: -160, dy: -120 },
  { name: "Bloomberg", src: "/tts/alumni/bloomberg.svg", dx: 40, dy: -200 },
  { name: "Microsoft", src: "/tts/alumni/microsoft.svg", dx: 200, dy: -90 },
  { name: "Capital One", src: "/tts/alumni/capitalone.svg", dx: -220, dy: 30 },
  { name: "Citi", src: "/tts/alumni/citi.svg", dx: 10, dy: 160 },
  { name: "PwC", src: "/tts/alumni/pwc.svg", dx: 230, dy: 60 },
  { name: "Jefferies", src: "/tts/alumni/jefferies.svg", dx: -140, dy: 190 },
  { name: "Nomura", src: "/tts/alumni/nomura.svg", dx: 120, dy: 210 },
  { name: "Fastly", src: "/tts/alumni/fastly.svg", dx: 260, dy: 170 },
];

/** A part of the scene that's on between a and b, and gone again between c and d. */
function win(
  a: number,
  b: number,
  c = 9,
  d = 10,
  extra: Record<string, string | number> = {},
): CSSProperties {
  return {
    ["--a" as string]: a,
    ["--b" as string]: b,
    ["--c" as string]: c,
    ["--d" as string]: d,
    ...extra,
  } as CSSProperties;
}

function Photo({
  x,
  y,
  w,
  h,
  src,
  id,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  src: string;
  id: string;
}) {
  return (
    <>
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <image
        href={src}
        x={x}
        y={y}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${id})`}
      />
    </>
  );
}

function Label({
  x,
  y,
  name,
  sub,
  anchor = "start",
}: {
  x: number;
  y: number;
  name: string;
  sub?: string;
  anchor?: "start" | "middle";
}) {
  return (
    <g className="ms-lab">
      <text className="ms-name" x={x} y={y} textAnchor={anchor}>
        {name}
      </text>
      {sub && (
        <text className="ms-sub" x={x} y={y + 14} textAnchor={anchor}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Scene() {
  const m = seat(MATTHEW_SEAT);
  const mc = center(MATTHEW_SEAT);
  const leaders = [
    { p: CALEB, s: CALEB_SEAT, a: 0.19 },
    { p: TYLER, s: TYLER_SEAT, a: 0.215 },
    { p: EMILY, s: EMILY_SEAT, a: 0.3 },
  ];
  return (
    <svg
      className="ms-svg"
      viewBox="0 0 600 600"
      role="img"
      aria-labelledby="ms-svg-t"
    >
      <title id="ms-svg-t">
        An empty roster of outlined seats. Matthew Kim hands it to Caleb Newton
        and Tyler Larsen, Emily Zhao joins on design, and the seats fill outward
        from them until the roster is full. Then the faculty advisor and
        mentors, and the companies alumni went on to.
      </title>

      {/* 1 to 3: the roster */}
      <g className="ms-roster">
        <text className="ms-tag" x={X0} y={Y0 - 22}>
          Roster
        </text>
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const s = seat(i);
          return (
            <rect
              key={i}
              className="ms-seat"
              x={s.x}
              y={s.y}
              width={SEAT_W}
              height={SEAT_H}
            />
          );
        })}

        {/* the pull: a line from whoever brought each person in */}
        {FILL.map((f) => {
          const a = center(f.from);
          const b = center(f.i);
          return (
            <path
              key={`l${f.i}`}
              className="k draw ms-pull"
              pathLength={1}
              style={win(f.a - 0.012, f.a + 0.012)}
              d={`M${a.x} ${a.y} L${b.x} ${b.y}`}
            />
          );
        })}
        {FILL.map((f) => {
          const s = seat(f.i);
          return (
            <g
              key={`f${f.i}`}
              className={`k grow ${BRANCH[f.root]}`}
              style={win(f.a, f.b)}
            >
              <rect
                className="ms-fill"
                x={s.x}
                y={s.y}
                width={SEAT_W}
                height={SEAT_H}
              />
              <circle
                className="ms-head"
                cx={s.x + SEAT_W / 2}
                cy={s.y + 34}
                r="12"
              />
              <path
                className="ms-head"
                d={`M${s.x + 16} ${s.y + SEAT_H - 8} C${s.x + 16} ${s.y + 54} ${s.x + SEAT_W - 16} ${s.y + 54} ${s.x + SEAT_W - 16} ${s.y + SEAT_H - 8} Z`}
              />
            </g>
          );
        })}

        {/* the handoff */}
        <g className="k grow" style={win(0.1, 0.16, 0.3, 0.35)}>
          <Photo
            x={m.x}
            y={m.y}
            w={SEAT_W}
            h={SEAT_H}
            src={MATTHEW.photo ?? ""}
            id="ms-matthew"
          />
          <rect
            className="ms-ring"
            x={m.x}
            y={m.y}
            width={SEAT_W}
            height={SEAT_H}
          />
        </g>
        {[CALEB_SEAT, TYLER_SEAT].map((s, i) => {
          const c = center(s);
          return (
            <path
              key={s}
              className="k draw ms-thread"
              pathLength={1}
              style={win(0.155 + i * 0.02, 0.2 + i * 0.02, 0.44, 0.47)}
              d={`M${mc.x} ${mc.y + SEAT_H / 2} C${mc.x} ${c.y} ${mc.x} ${c.y} ${c.x - SEAT_W / 2} ${c.y}`}
            />
          );
        })}
        {leaders.map(({ p, s, a }) => {
          const st = seat(s);
          return (
            <g key={p.name} className="k grow" style={win(a, a + 0.05)}>
              <Photo
                x={st.x}
                y={st.y}
                w={SEAT_W}
                h={SEAT_H}
                src={p.photo ?? ""}
                id={`ms-${s}`}
              />
              <rect
                className="ms-ring"
                x={st.x}
                y={st.y}
                width={SEAT_W}
                height={SEAT_H}
              />
            </g>
          );
        })}
        <g className="k" style={win(0.12, 0.17, 0.27, 0.3)}>
          <Label
            x={m.x + SEAT_W + 10}
            y={m.y + 40}
            name={MATTHEW.name}
            sub="handed it on"
          />
        </g>
        <g className="k" style={win(0.22, 0.27, 0.34, 0.37)}>
          <Label
            x={seat(CALEB_SEAT).x}
            y={seat(CALEB_SEAT).y - 8}
            name="Caleb and Tyler"
          />
        </g>
      </g>

      {/* 4: the people behind it */}
      <g className="ms-mentors">
        <g className="k rise" style={win(0.6, 0.65, 0.79, 0.83)}>
          <Photo
            x={42}
            y={50}
            w={200}
            h={244}
            src={SWAIN.photo ?? ""}
            id="ms-swain"
          />
          <Label
            x={262}
            y={250}
            name={SWAIN.name}
            sub="Faculty advisor, Iovine and Young Academy"
          />
        </g>
        {REST.map((p, i) => {
          const x = 42 + i * 105;
          const a = 0.655 + i * 0.016;
          return (
            <g key={p.name}>
              <path
                className="k draw ms-thread"
                pathLength={1}
                style={win(a - 0.02, a + 0.01, 0.79, 0.83)}
                d={`M142 294 C142 340 ${x + 48} 330 ${x + 48} 372`}
              />
              <g className="k rise" style={win(a, a + 0.04, 0.79, 0.83)}>
                <Photo
                  x={x}
                  y={372}
                  w={96}
                  h={116}
                  src={p.photo ?? ""}
                  id={`ms-m${i}`}
                />
                <Label
                  x={x}
                  y={508}
                  name={p.name.split(" ")[0]}
                  sub={(p.company ?? "").replace(" & Company", "")}
                />
              </g>
            </g>
          );
        })}
      </g>

      {/* 5: where people go next */}
      <g className="ms-marks">
        {MARKS.map((mk, i) => {
          const x = 42 + (i % 3) * 186;
          const y = 150 + Math.floor(i / 3) * 120;
          const a = 0.83 + i * 0.012;
          return (
            <g
              key={mk.name}
              className="k fly"
              style={win(a, a + 0.06, 9, 10, {
                "--dx": `${mk.dx}px`,
                "--dy": `${mk.dy}px`,
              })}
            >
              <rect className="ms-cell" x={x} y={y} width="160" height="84" />
              <image
                href={mk.src}
                x={x + 24}
                y={y + 22}
                width="112"
                height="40"
                preserveAspectRatio="xMidYMid meet"
                className="ms-mark"
              >
                <title>{mk.name}</title>
              </image>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default function MembersStory() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 1;
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="ms" ref={root}>
      {/* The opening line scrolls past over the empty room, so it's the one
       * piece of text the camera flies by. */}
      <div className="ms-open">
        <div className="ms-grid">
          <h1 className="ms-h1">
            For over a year, Trojan Tech Solutions sat dormant with nobody in
            it.
          </h1>
        </div>
      </div>

      <div className="ms-stage">
        <div className="ms-grid">
          <div className="ms-copy">
            <p
              className="k rise ms-beat ms-b1"
              style={win(0.1, 0.16, 0.27, 0.31)}
            >
              Then Matthew Kim graduated, on his way to McKinsey, and handed the
              whole thing to Caleb Newton and Tyler Larsen.
            </p>
            <p
              className="k rise ms-beat ms-b2"
              style={win(0.29, 0.33, 0.43, 0.47)}
            >
              So they started over, with Caleb and Tyler as co-presidents and
              Emily Zhao on design. They built a cabinet, and every person on it
              pulled in people from their own major.
            </p>
            <p
              className="k rise ms-beat ms-b4"
              style={win(0.62, 0.66, 0.77, 0.81)}
            >
              They didn&apos;t do it alone. Chris Swain, who teaches at the
              Iovine and Young Academy, is the faculty advisor, and the mentors
              are people you&apos;d actually get to learn from, at McKinsey,
              Reddit, Google, Stanford and Mixbook.
            </p>
            <p className="k rise ms-beat ms-b5" style={win(0.84, 0.88)}>
              And the people who started here went on to places like these, from Reddit and Bloomberg to Citi and Jefferies.
            </p>
          </div>
          <div className="ms-fig">
            <Scene />
          </div>
        </div>
        <p className="k rise ms-big" style={win(0.47, 0.51, 0.57, 0.61)}>
          About three months later, the roster was full.
        </p>
      </div>
    </div>
  );
}
