"use client";

import { useEffect, useRef } from "react";
import { clamp, easeOut3, prog, smooth } from "../engine/math";
import { onFrame } from "../v4/choreo";
import { hash, loadStreets, pick } from "./dots";

/*
 * A floor of the opener's points, drawn in 2D: the real LA streets around
 * USC, top down, at the opener's dot size, in one ink at low alpha. It is
 * the ground the clay scenes stand on and the seam between sections, so the
 * paper page and the night field read as one world (docs/INTENT-home.md,
 * "One world").
 *
 * It assembles the way the opener's city does, each point flying in from a
 * small scatter in order of its distance from USC, as its band comes up the
 * screen, and dissolves the same way as it leaves the top. Both are one
 * pure function of the followed scroll, so scrolling back plays them back.
 * Reduced motion draws the finished floor once.
 */

type Props = {
  /** window of the city in metres from USC: x0, y0, x1, y1 */
  win?: [number, number, number, number];
  /** dot colour */
  color?: string;
  /** alpha of residential dots; arterials print a little stronger */
  alpha?: number;
  /** cap on points drawn */
  max?: number;
  /** draw USC's cardinal point and its ring */
  usc?: boolean;
  /** leave without dissolving (a floor under an image, not a seam) */
  hold?: boolean;
  className?: string;
};

const DOT_CSS = 1.4; // px; the opener's residential point at dpr 1

export default function DotFloor({
  win = [-3200, -1500, 3200, 1500],
  color = "#2a1b1e",
  alpha = 0.22,
  max = 3600,
  usc = false,
  hold = false,
  className = "",
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let alive = true;
    let pts: { xy: Float32Array; cls: Uint8Array } | null = null;
    let order: Float32Array | null = null;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let docTop = 0;
    let lastK = -1;

    const size = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      docTop = r.top + window.scrollY;
      lastK = -1;
    };

    const draw = (k: number) => {
      if (!pts || !order) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const [x0, y0, x1, y1] = win;
      // Cover the canvas with the window, metres to px, centred.
      const s = Math.max(w / (x1 - x0), h / (y1 - y0));
      const cx = w / 2 - ((x0 + x1) / 2) * s;
      const cy = h / 2 + ((y0 + y1) / 2) * s;
      ctx.fillStyle = color;
      const n = pts.cls.length;
      for (let i = 0; i < n; i++) {
        // Each point's own share of k, nearest USC first.
        const ki = easeOut3(clamp((k - order[i] * 0.55) / 0.45));
        if (ki <= 0.002) continue;
        const sc = (1 - ki) * 46;
        const px = cx + pts.xy[i * 2] * s + (hash(i) - 0.5) * sc;
        const py = cy - pts.xy[i * 2 + 1] * s + (hash(i + 7) - 0.5) * sc;
        if (px < -2 || py < -2 || px > w + 2 || py > h + 2) continue;
        const strong = pts.cls[i] >= 2;
        ctx.globalAlpha = alpha * (strong ? 1.7 : 1) * ki;
        const d = strong ? DOT_CSS * 1.25 : DOT_CSS;
        ctx.fillRect(px - d / 2, py - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
      if (usc && k > 0.05) {
        const ux = cx;
        const uy = cy;
        const a = smooth(clamp(k / 0.4));
        ctx.globalAlpha = 0.18 * a;
        ctx.fillStyle = "#d0102e";
        ctx.beginPath();
        ctx.arc(ux, uy, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(ux, uy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    loadStreets()
      .then((s) => {
        if (!alive) return;
        const p = pick(s, win, max);
        const o = new Float32Array(p.cls.length);
        let far = 1;
        for (let i = 0; i < o.length; i++) {
          o[i] = Math.hypot(p.xy[i * 2], p.xy[i * 2 + 1]);
          far = Math.max(far, o[i]);
        }
        for (let i = 0; i < o.length; i++) o[i] = o[i] / far;
        pts = p;
        order = o;
        size();
        if (reduced) draw(1);
        else lastK = -1;
      })
      .catch(() => {
        // No data: the floor stays empty paper, which is the page without it.
      });

    const ro = new ResizeObserver(() => {
      size();
      if (reduced) draw(1);
    });
    ro.observe(cv);

    const off = reduced
      ? () => {}
      : onFrame((f) => {
          if (!pts) return;
          const top = docTop - f.y;
          const bottom = top + h;
          // Arrives over the first 70% of a screen, leaves over the last 30%.
          const kin = prog(f.vh - top, 0, f.vh * 0.7);
          const kout = hold ? 1 : prog(bottom, 0, f.vh * 0.32);
          const k = Math.round(Math.min(kin, kout) * 400) / 400;
          if (k === lastK) return;
          if ((bottom < -40 || top > f.vh + 40) && lastK >= 0) {
            lastK = k;
            return;
          }
          lastK = k;
          draw(k);
        }, 4);

    return () => {
      alive = false;
      ro.disconnect();
      off();
    };
    // win is a literal per call site; a new array each render must not
    // reload the floor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, alpha, max, usc, hold]);

  return <canvas ref={ref} className={`dfl ${className}`} aria-hidden="true" />;
}
