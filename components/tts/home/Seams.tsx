"use client";

import { useEffect, useRef } from "react";
import { clamp, easeInOut3, easeOut3, lerp, prog } from "../engine/math";
import { worldBridge } from "../world/bridge";

/* Seams: no hard cut between sections (Caleb, 2026-10-04: "There's no
 * creative transitions between sections"). Each seam hands one section to
 * the next through a shared object, the way the replica's bricks became
 * diamonds, then the lattice, then the mark.
 *
 * Every seam has the same chassis. A 200vh block with -100vh margins on both
 * sides, so it adds no scroll: it overlaps the last screen of the section
 * before and the first screen of the section after. Its stage is sticky for
 * exactly that one screen of scroll, during which the previous section slides
 * up and the next rises beneath it. One progress value p (0 to 1) drives the
 * stage; at p = 0 and p = 1 the stage is invisible, so both ends are the
 * sections themselves. Scroll-linked, so it reverses. Reduced motion hides
 * every seam and the sections meet as they are. */

function useSeam(draw: (p: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = -1;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const p = travel > 0 ? clamp(-r.top / travel) : 0;
      // Only redraw while the seam is in play, plus its two ends exactly.
      if (p !== last || (p > 0 && p < 1)) {
        last = p;
        drawRef.current(p);
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);
  return ref;
}

type Box = { x: number; y: number; w: number; h: number };
const mixBox = (a: Box, b: Box, t: number): Box => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});
const boxOf = (sel: string): Box | null => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
const place = (el: HTMLElement, b: Box) => {
  el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0)`;
  el.style.width = `${b.w.toFixed(1)}px`;
  el.style.height = `${b.h.toFixed(1)}px`;
};

/* ---------- A: the world's readout becomes the run panel ----------
 * The readout grows out of the qualification station in the world's last
 * frame, holds as a card over the page ground while the world slides away,
 * then lands exactly on the run panel's stage as it rises, and lets go. */
export function SeamToRun({ rows }: { rows: [string, number][] }) {
  const ground = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const ref = useSeam((p) => {
    const g = ground.current;
    const c = card.current;
    if (!g || !c) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const q = worldBridge.qualify?.() ?? { x: W * 0.7, y: H * 0.5 };
    const seed: Box = { x: q.x, y: q.y, w: 0, h: 0 };
    const cw = Math.min(380, W - 32);
    const mid: Box = { x: (W - cw) / 2, y: H * 0.5 - 170, w: cw, h: 340 };
    const target = boxOf(".rp-stage .rp-layer") ?? mid;
    let b: Box;
    if (p < 0.4) b = mixBox(seed, mid, easeOut3(prog(p, 0.02, 0.4)));
    else b = mixBox(mid, target, easeInOut3(prog(p, 0.45, 0.9)));
    place(c, b);
    const show = p > 0.01 && p < 0.995;
    c.style.opacity = show ? String(1 - prog(p, 0.82, 0.96)) : "0";
    c.style.setProperty("--rows", String(1 - prog(p, 0.55, 0.75)));
    g.style.opacity = String(prog(p, 0.12, 0.38) * (1 - prog(p, 0.6, 0.82)));
  });
  return (
    <div className="seam" ref={ref} aria-hidden="true">
      <div className="seam-stage">
        <div className="seam-ground" ref={ground} />
        <div className="seam-card" ref={card}>
          <p className="w-q-head">The run, 2026-09-15</p>
          <ul className="w-q-rows">
            {rows.map(([l, n], i) => (
              <li key={l} className={i === 2 ? "is-aside" : undefined}>
                <span>{l}</span>
                <span className="live">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- B: the ground grid becomes the whiteboard ----------
 * The world's lattice comes back as a ground plane seen from a low camera.
 * The camera pulls up until the plane faces the reader; the flattened sheet
 * then lands on the whiteboard's surface and its lines fade into the board. */
const GRID = 14;
export function SeamToBoard() {
  const ground = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const ref = useSeam((p) => {
    const g = ground.current;
    const sh = sheet.current;
    const sv = svg.current;
    if (!g || !sh || !sv) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    g.style.opacity = String(prog(p, 0.05, 0.3) * (1 - prog(p, 0.86, 1)));
    // Tilt: 72 degrees (a ground seen from just above) to 0 (facing).
    const tilt = 72 * (1 - easeInOut3(prog(p, 0.18, 0.62)));
    const full: Box = { x: 16, y: 72, w: W - 32, h: H - 96 };
    const target = boxOf(".wbd-board") ?? full;
    const b = mixBox(full, target, easeInOut3(prog(p, 0.6, 0.92)));
    place(sh, b);
    // The plane is only lines while it is a ground; it fills in as it faces
    // the reader, which is when it is about to be the board.
    sh.style.backgroundColor = `rgba(250, 248, 244, ${prog(p, 0.45, 0.65).toFixed(3)})`;
    sh.style.opacity =
      p > 0.01 && p < 0.995
        ? String(prog(p, 0.05, 0.25) * (1 - prog(p, 0.92, 1)))
        : "0";
    sv.style.transform = `perspective(${Math.round(H * 1.1)}px) rotateX(${tilt.toFixed(2)}deg)`;
    sv.style.opacity = String(1 - prog(p, 0.7, 0.9));
  });
  const lines = [];
  for (let i = 0; i <= GRID; i++) {
    const t = (i / GRID) * 100;
    lines.push(<line key={`h${i}`} x1="0" y1={t} x2="100" y2={t} />);
    lines.push(<line key={`v${i}`} x1={t} y1="0" x2={t} y2="100" />);
  }
  return (
    <div className="seam" ref={ref} aria-hidden="true">
      <div className="seam-stage">
        <div className="seam-ground" ref={ground} />
        <div className="seam-sheet" ref={sheet}>
          <svg
            ref={svg}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="seam-grid"
          >
            {lines}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ---------- C: the compounding stroke becomes the spine ----------
 * The board's last stroke keeps drawing: up past the board, over, and down
 * the page's left gutter, where it becomes the rule the next three sections
 * hang on (<Spine>, which takes over at exactly the same x). */
export function SeamToSpine() {
  const path = useRef<SVGPathElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const ref = useSeam((p) => {
    const pa = path.current;
    const sv = svg.current;
    if (!pa || !sv) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    sv.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const last = boxOf(".wbd-station:last-child");
    const sx = last ? last.x + last.w * 0.86 : W * 0.86;
    const sy = last ? last.y + last.h * 0.35 : H * 0.3;
    const x = spineX();
    const top = Math.max(84, sy - H * 0.35);
    const d =
      `M ${sx.toFixed(1)} ${sy.toFixed(1)} ` +
      `C ${(sx + 40).toFixed(1)} ${(sy - 120).toFixed(1)}, ${(sx - 80).toFixed(1)} ${top.toFixed(1)}, ${((sx + x) / 2).toFixed(1)} ${top.toFixed(1)} ` +
      `S ${x.toFixed(1)} ${(top + 40).toFixed(1)}, ${x.toFixed(1)} ${(top + 160).toFixed(1)} ` +
      `L ${x.toFixed(1)} ${(H + 4).toFixed(1)}`;
    pa.setAttribute("d", d);
    const len = pa.getTotalLength();
    pa.style.strokeDasharray = `${len}`;
    pa.style.strokeDashoffset = String(
      len * (1 - easeInOut3(prog(p, 0.0, 0.85))),
    );
    sv.style.opacity = p > 0.001 && p < 0.999 ? "1" : "0";
  });
  return (
    <div className="seam" ref={ref} aria-hidden="true">
      <div className="seam-stage">
        <svg ref={svg} className="seam-stroke">
          <path ref={path} />
        </svg>
      </div>
    </div>
  );
}

/** The spine's x, shared by the seam and the spine: in the left gutter. */
function spineX() {
  const W = window.innerWidth;
  const gutter = W >= 1024 ? 48 : W >= 768 ? 32 : 16;
  const edge = Math.max(gutter, (W - 1280) / 2 + gutter);
  return Math.max(6, edge - Math.min(28, gutter - 6));
}

/** A vertical hairline down the left gutter of its children, drawn to the
 * bottom of the viewport as you scroll: the line the sections hang on. */
export function Spine({ children }: { children: React.ReactNode }) {
  const line = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const ln = line.current;
    if (!el || !ln) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ln.style.transform = "scaleY(1)";
      return;
    }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const drawn = clamp((window.innerHeight - r.top) / r.height);
      ln.style.transform = `scaleY(${drawn.toFixed(4)})`;
      ln.style.left = `${spineX() - el.getBoundingClientRect().left}px`;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);
  return (
    <div className="spine" ref={ref}>
      <div className="spine-line" ref={line} aria-hidden="true" />
      {children}
    </div>
  );
}

/* ---------- D: the dawn sun rises as the cardinal band ----------
 * The world's sun, low and warm, rises from below the page and swells until
 * it is the join band, which is cardinal from its first pixel. */
export function SeamToJoin() {
  const sun = useRef<HTMLDivElement>(null);
  const ground = useRef<HTMLDivElement>(null);
  const ref = useSeam((p) => {
    const s = sun.current;
    const g = ground.current;
    if (!s || !g) return;
    // The page ground holds behind the rising sun, so the band below never
    // shows its edge: it is only ever seen as the sun.
    g.style.opacity = p > 0.001 && p < 0.999 ? String(prog(p, 0.0, 0.1)) : "0";
    const W = window.innerWidth;
    const H = window.innerHeight;
    const cover = Math.hypot(W, H);
    const rise = easeInOut3(prog(p, 0.0, 0.7));
    const r = lerp(Math.min(W, H) * 0.12, cover, easeInOut3(prog(p, 0.35, 1)));
    const cy = lerp(H + Math.min(W, H) * 0.08, H * 0.5, rise);
    s.style.width = s.style.height = `${(2 * r).toFixed(1)}px`;
    s.style.transform = `translate3d(${(W / 2 - r).toFixed(1)}px, ${(cy - r).toFixed(1)}px, 0)`;
    // Dawn gold to cardinal as it climbs.
    const t = easeOut3(prog(p, 0.15, 0.75));
    s.style.background = `rgb(${Math.round(lerp(255, 163, t))}, ${Math.round(lerp(212, 22, t))}, ${Math.round(lerp(154, 43, t))})`;
    s.style.opacity = p > 0.001 && p < 0.999 ? "1" : "0";
  });
  return (
    <div className="seam" ref={ref} aria-hidden="true">
      <div className="seam-stage">
        <div className="seam-ground" ref={ground} />
        <div className="seam-sun" ref={sun} />
      </div>
    </div>
  );
}
