"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { NETWORK_PEOPLE, type Person } from "@/data/people";
import { clamp, easeOut3, prog } from "../engine/math";
import { onFrame } from "../v4/choreo";
import { hash, loadStreets, pick } from "./dots";

/*
 * Where the people who started at TTS went, told in the opener's own
 * language (Caleb, 2026-10-10: "Is there a way to weave aspects of the dope
 * dot stuff into the rest of the site", and of the card wall, "The boring
 * alumni layout lame af get creative"). The night field comes back: the
 * real LA streets around USC as points, USC's cardinal point, and one line
 * of light per person running out of it to the company they joined, drawn
 * as the section comes up. Light travels each line on its own loop.
 *
 * Every dot means something: the floor is OpenStreetMap street samples
 * (dots.ts), each line is one person, each face is that person and links to
 * their LinkedIn in a new tab. Elizabeth's and Senai's lines pass through
 * Microsoft first, where both worked before (data/people.ts). Matthew and
 * Kevin co-founded TTS; their faces are in the advisors section, so here
 * they are their initials (a face appears once on home).
 *
 * Albert Chung's employer stays off on purpose (people.ts: "We shouldn't
 * flex palantir"), so his line ends at him, with his role, and no company.
 */

type Mark = { src: string; w: number; h: number } | { type: string };

// Marks on disk, in their own colours. Sized by the mark's shape so a
// wordmark and a square glyph read at the same weight. Epic and Roxborough
// Group are set in type: "Epic" alone doesn't say which Epic, and
// roxboroughgroup.com served no logo when checked (2026-10-10).
const MARKS: Record<string, Mark> = {
  Apple: { src: "/tts/alumni/apple.svg", w: 26, h: 30 },
  Reddit: { src: "/tts/alumni/reddit.svg", w: 92, h: 30 },
  Bloomberg: { src: "/tts/alumni/bloomberg.svg", w: 108, h: 22 },
  "Capital One": { src: "/tts/alumni/capitalone.svg", w: 96, h: 32 },
  Citi: { src: "/tts/alumni/citi.svg", w: 58, h: 36 },
  Fastly: { src: "/tts/alumni/fastly.svg", w: 76, h: 30 },
  Jefferies: { src: "/tts/alumni/jefferies.svg", w: 96, h: 24 },
  Nomura: { src: "/tts/alumni/nomura.svg", w: 100, h: 22 },
  PwC: { src: "/tts/alumni/pwc.svg", w: 54, h: 40 },
  Microsoft: { src: "/tts/alumni/microsoft.svg", w: 112, h: 24 },
  "McKinsey & Company": { src: "/tts/marks/mckinsey.png", w: 104, h: 32 },
  "NBC Universal": { src: "/tts/marks/nbcuniversal.svg", w: 124, h: 24 },
  "USC Gould": { src: "/tts/marks/uscgould.png", w: 112, h: 32 },
  Epic: { type: "Epic" },
  "Roxborough Group": { type: "Roxborough Group" },
};

type Node = {
  key: string;
  company?: string;
  past?: boolean;
  people: Person[];
  /** desktop position, % of the map */
  x: number;
  y: number;
  /** sky, gold, blush or leaf chip ring */
  tone: "sky" | "gold" | "blush" | "leaf";
};

// Desktop layout, by hand: USC sits at the left; Microsoft is nearest it,
// because two lines run through it on their way to Reddit and Bloomberg.
const LAYOUT: Record<string, [number, number, Node["tone"]]> = {
  Microsoft: [31, 16, "sky"],
  Apple: [30, 44, "gold"],
  "Roxborough Group": [31, 70, "leaf"],
  "role:Albert Chung": [30, 92, "blush"],
  Reddit: [52, 10, "blush"],
  Bloomberg: [51, 37, "gold"],
  "Capital One": [52, 63, "sky"],
  "USC Gould": [51, 89, "blush"],
  "McKinsey & Company": [71, 14, "leaf"],
  "NBC Universal": [72, 40, "gold"],
  Fastly: [71, 65, "blush"],
  Epic: [72, 90, "sky"],
  PwC: [90, 10, "gold"],
  Citi: [91, 36, "sky"],
  Jefferies: [90, 62, "leaf"],
  Nomura: [91, 88, "blush"],
};

function buildNodes(people: Person[]): Node[] {
  const m = new Map<string, Node>();
  const add = (key: string, p: Person, past = false) => {
    const [x, y, tone] = LAYOUT[key] ?? [50, 50, "sky"];
    const n = m.get(key) ?? {
      key,
      company: key.startsWith("role:") ? undefined : key,
      past,
      people: [],
      x,
      y,
      tone,
    };
    if (!past) n.people.push(p);
    m.set(key, n);
  };
  for (const p of people) {
    for (const past of p.past ?? []) add(past, p, true);
    add(p.company ?? `role:${p.name}`, p);
  }
  return [...m.values()];
}

const NODES = buildNodes(NETWORK_PEOPLE);
// Who passed through a past employer on the way: their lines bend there.
const VIA: Record<string, string> = {};
for (const p of NETWORK_PEOPLE) if (p.past?.[0]) VIA[p.name] = p.past[0];

const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .join("");

const first = (name: string) => name.split(" ")[0];

/** Whether a node stays lit while `hot` (a node key) is focused: itself, and
 *  the stops on the same journeys (Microsoft and where its two went next). */
function lit(n: Node, hot: string | null) {
  if (!hot || hot === n.key) return true;
  const through = (key: string) => NETWORK_PEOPLE.filter((p) => p.past?.includes(key));
  if (n.past) return through(n.key).some((p) => (p.company ?? "") === hot);
  return n.people.some((p) => p.past?.includes(hot));
}

/* ------------------------------------------------------------------ draw */

type Line = {
  name: string;
  node: string;
  pts: Float32Array; // sampled dots along the path, px in the map
  len: number;
  delay: number;
  speed: number;
};

const GOLD = "255, 204, 0";
const CREAM = "255, 241, 204";
const HOT = "208, 16, 46";
const STEP = 7; // px between dots on a line, the opener's street spacing

function bezier(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  bend: number,
): Float32Array {
  // A gentle quadratic, bowed perpendicular to the chord.
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const L = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / L) * bend;
  const cy = my + (dx / L) * bend;
  const n = Math.max(2, Math.round(L / STEP));
  const out = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const u = 1 - t;
    out[i * 2] = u * u * ax + 2 * u * t * cx + t * t * bx;
    out[i * 2 + 1] = u * u * ay + 2 * u * t * cy + t * t * by;
  }
  return out;
}

/** Dots every STEP px along a polyline. */
function poly(p: [number, number][]): Float32Array {
  const out: number[] = [];
  for (let s = 0; s < p.length - 1; s++) {
    const [ax, ay] = p[s];
    const [bx, by] = p[s + 1];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / STEP));
    for (let i = s === 0 ? 0 : 1; i <= n; i++) {
      out.push(ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n);
    }
  }
  return Float32Array.from(out);
}

function join(a: Float32Array, b: Float32Array) {
  const o = new Float32Array(a.length + b.length - 2);
  o.set(a);
  o.set(b.subarray(2), a.length);
  return o;
}

export default function Network() {
  const root = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLCanvasElement>(null);
  const lines = useRef<HTMLCanvasElement>(null);
  const [hot, setHot] = useState<string | null>(null);
  const hotRef = useRef<string | null>(null);
  const repaint = useRef<() => void>(() => {});

  useEffect(() => {
    const el = root.current;
    const fc = floor.current;
    const lc = lines.current;
    if (!el || !fc || !lc) return;
    const fx = fc.getContext("2d");
    const lx = lc.getContext("2d");
    if (!fx || !lx) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let docTop = 0;
    let usc = { x: 0, y: 0 };
    let L: Line[] = [];
    let drawK = reduced ? 1 : 0;
    let stacked = false;
    let visible = false;
    let raf = 0;
    let streets: Awaited<ReturnType<typeof loadStreets>> | null = null;

    const drawFloor = () => {
      if (!streets) return;
      fx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fx.clearRect(0, 0, w, h);
      // About 7 km of the city across the map, centred on USC's point.
      // Stacked on a phone, the map is tall: fit the city's height instead.
      const span = 7000;
      const s = stacked ? Math.max(w / span, h / 12000) : w / span;
      const win: [number, number, number, number] = [
        -usc.x / s,
        -(h - usc.y) / s,
        (w - usc.x) / s,
        usc.y / s,
      ];
      const p = pick(streets, win, w < 700 ? 2600 : 5200);
      for (let i = 0; i < p.cls.length; i++) {
        const px = usc.x + p.xy[i * 2] * s;
        const py = usc.y - p.xy[i * 2 + 1] * s;
        const strong = p.cls[i] >= 2;
        fx.fillStyle = `rgba(${strong ? CREAM : GOLD}, ${strong ? 0.3 : 0.17})`;
        const d = strong ? 1.6 : 1.3;
        fx.fillRect(px - d / 2, py - d / 2, d, d);
      }
    };

    const layout = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      docTop = r.top + window.scrollY;
      for (const c of [fc, lc]) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      const dot = el.querySelector<HTMLElement>(".nw-usc-dot");
      const at = (n: HTMLElement) => {
        const b = n.getBoundingClientRect();
        return {
          x: b.left - r.left + b.width / 2,
          y: b.top - r.top + b.height / 2,
        };
      };
      if (dot) usc = at(dot);
      const chip = (key: string) => {
        const n = el.querySelector<HTMLElement>(
          `[data-node="${CSS.escape(key)}"] .nw-chip`,
        );
        return n ? at(n) : null;
      };
      stacked = w < 900;
      const next: Line[] = [];
      el.querySelectorAll<HTMLElement>("[data-person]").forEach((a, i) => {
        const name = a.dataset.person ?? "";
        const node = a.dataset.at ?? "";
        const end = at(a);
        const via = VIA[name] ? chip(VIA[name]) : null;
        const bend = (hash(i + 3) - 0.5) * 60;
        let pts: Float32Array;
        if (stacked) {
          // Phones: one trunk falls from USC down the gap between the two
          // columns, and each person's line turns off it at their face, so
          // no line crosses a mark or a name.
          const side = end.x < usc.x ? 1 : -1;
          pts = poly([
            [usc.x, usc.y],
            [usc.x, end.y],
            [end.x + side * 22, end.y],
          ]);
        } else {
          pts = via
            ? join(
                bezier(usc.x, usc.y, via.x, via.y, bend),
                bezier(via.x, via.y, end.x, end.y, -bend * 0.6),
              )
            : bezier(usc.x, usc.y, end.x, end.y, bend);
        }
        next.push({
          name,
          node,
          pts,
          len: pts.length / 2,
          // Stacked, each line draws as the reader reaches its face.
          delay: stacked ? (end.y / h) * 0.85 : hash(i) * 0.35,
          speed: 0.11 + hash(i + 11) * 0.08,
        });
      });
      L = next;
      drawFloor();
      paint(performance.now());
    };

    const paint = (now: number) => {
      lx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lx.clearRect(0, 0, w, h);
      const focus = hotRef.current;
      for (const ln of L) {
        const on =
          !focus ||
          focus === ln.node ||
          focus === ln.name ||
          VIA[ln.name] === focus;
        // How much of this line is drawn: out from USC as the map arrives.
        const k = easeOut3(clamp((drawK - ln.delay) / 0.55));
        const n = Math.floor(ln.len * k);
        const a = on ? (focus ? 0.95 : 0.55) : 0.12;
        lx.fillStyle = `rgba(${focus && on ? CREAM : GOLD}, ${a})`;
        for (let i = 0; i < n; i++) {
          lx.fillRect(ln.pts[i * 2] - 1, ln.pts[i * 2 + 1] - 1, 2, 2);
        }
        // The packet: a short bright run of dots travelling outward.
        if (!reduced && k >= 1 && on) {
          const head =
            ((now / 1000) * ln.speed * (focus ? 2.2 : 1) + hash(ln.len)) % 1;
          const hi = Math.floor(head * ln.len);
          for (let j = 0; j < 6; j++) {
            const i = hi - j;
            if (i < 0) break;
            lx.fillStyle = `rgba(${focus ? HOT : "95, 168, 224"}, ${(1 - j / 6) * 0.95})`;
            lx.fillRect(ln.pts[i * 2] - 1.5, ln.pts[i * 2 + 1] - 1.5, 3, 3);
          }
        }
      }
      el.style.setProperty("--draw", drawK.toFixed(3));
    };

    const loop = (now: number) => {
      raf = 0;
      paint(now);
      if (visible && !reduced && !document.hidden)
        raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !reduced) raf = requestAnimationFrame(loop);
    };

    loadStreets()
      .then((s) => {
        streets = s;
        drawFloor();
      })
      .catch(() => {
        // The lines and faces carry the section without the floor.
      });

    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (visible) start();
    });
    io.observe(el);
    const onVis = () => {
      if (!document.hidden && visible) start();
    };
    document.addEventListener("visibilitychange", onVis);

    const off = reduced
      ? () => {}
      : onFrame((f) => {
          const top = docTop - f.y;
          // Drawn from when the map's top is 85% down the screen until its
          // middle reaches the centre.
          drawK = stacked
            ? prog(f.vh * 0.75 - top, 0, h)
            : prog(f.vh * 0.85 - top, 0, f.vh * 0.85 + h * 0.5 - f.vh * 0.5);
        }, 5);

    repaint.current = () => paint(performance.now());
    layout();
    if (reduced) {
      el.style.setProperty("--draw", "1");
      paint(0);
    }
    return () => {
      ro.disconnect();
      io.disconnect();
      off();
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // A hover or focus repaints at once, even under reduced motion.
  useEffect(() => {
    hotRef.current = hot;
    const el = root.current;
    if (el) el.dataset.hot = hot ? "1" : "";
    repaint.current();
  }, [hot]);

  return (
    <div
      ref={root}
      className="nw-map"
      onMouseLeave={() => setHot(null)}
      onBlur={(e) => {
        if (
          !e.currentTarget.contains(e.relatedTarget as globalThis.Node | null)
        )
          setHot(null);
      }}
    >
      <canvas ref={floor} className="nw-floor" aria-hidden="true" />
      <canvas ref={lines} className="nw-lines" aria-hidden="true" />

      <div className="nw-usc">
        <span className="nw-usc-dot" aria-hidden="true" />
        <span className="nw-usc-tag">
          <b>USC</b>
          <span>34.0224 N, 118.2851 W</span>
          <span>{NETWORK_PEOPLE.length} started here</span>
        </span>
      </div>

      <ul
        className="nw-nodes"
        aria-label="Where people who started at TTS went"
      >
        {NODES.map((n) => {
          const mark = n.company ? MARKS[n.company] : undefined;
          const style = { "--x": `${n.x}%`, "--y": `${n.y}%` } as CSSProperties;
          const label = n.company ?? "";
          return (
            <li
              key={n.key}
              className={`nw-node is-${n.tone}${n.past ? " is-past" : ""}${n.company ? "" : " is-solo"}${lit(n, hot) ? "" : " is-dim"}`}
              style={style}
              data-node={n.key}
              onMouseEnter={() => setHot(n.key)}
            >
              {n.company && (
                <span className="nw-chip" title={label}>
                  {mark && "src" in mark ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mark.src}
                      alt={label}
                      width={mark.w}
                      height={mark.h}
                      style={{ "--w": `${mark.w}px`, "--h": `${mark.h}px` } as CSSProperties}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="nw-type">
                      {mark && "type" in mark ? mark.type : label}
                    </span>
                  )}
                </span>
              )}
              {n.past ? (
                <span className="nw-meta">
                  {NETWORK_PEOPLE.filter((p) => p.past?.includes(n.key))
                    .map((p) => first(p.name))
                    .join(" and ")}
                  , before
                </span>
              ) : (
                <span className="nw-people">
                  {n.people.map((p) => {
                    const face = p.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.photo}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="nw-ini">{initials(p.name)}</span>
                    );
                    const say = `${p.name}, ${p.role}${p.company ? ` at ${p.company}` : ""}`;
                    const tag = (
                      <span className="nw-tip">
                        <b>{first(p.name)}</b>
                        <span>{p.role}</span>
                      </span>
                    );
                    return p.link ? (
                      <a
                        key={p.name}
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nw-face"
                        data-person={p.name}
                        data-at={n.key}
                        aria-label={`${say}, on LinkedIn (opens in a new tab)`}
                        onFocus={() => setHot(n.key)}
                        onMouseEnter={() => setHot(n.key)}
                      >
                        {face}
                        {tag}
                      </a>
                    ) : (
                      <span
                        key={p.name}
                        className="nw-face"
                        data-person={p.name}
                        data-at={n.key}
                        aria-label={say}
                      >
                        {face}
                        {tag}
                      </span>
                    );
                  })}
                </span>
              )}
              {!n.past && (
                <span className="nw-who" aria-hidden="true">
                  {n.company
                    ? n.people.map((p) => first(p.name)).join(" and ")
                    : `${first(n.people[0].name)}, ${n.people[0].role}`}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
