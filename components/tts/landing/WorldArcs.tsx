"use client";

import { useEffect, useRef } from "react";
import { clamp } from "../engine/math";
import "./world.css";

/*
 * USC and the places TTS has client work, as the field's points at the
 * scale of the world (docs/INTENT-home.md, "One world"): a graticule with
 * one point every 5 degrees, so each dot is a real coordinate; USC's
 * cardinal point on Los Angeles; one gold point per country at its centre
 * (the sources name countries, never cities); and a great circle of dots
 * from USC out to each, with light travelling outward on its own loop.
 * Arcs draw out from USC as the map comes into view. Reduced motion draws
 * them finished with the light still.
 */

export type Place = {
  id: string;
  name: string;
  note?: string;
  lat: number;
  lon: number;
  /** label above the point, where two places sit close */
  up?: boolean;
};

const USC = { lat: 34.0224, lon: -118.2851 };
const rad = (d: number) => (d * Math.PI) / 180;

function arc(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
  n: number,
) {
  const la1 = rad(a.lat);
  const lo1 = rad(a.lon);
  const la2 = rad(b.lat);
  const lo2 = rad(b.lon);
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((la2 - la1) / 2) ** 2 +
          Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2,
      ),
    );
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x =
      A * Math.cos(la1) * Math.cos(lo1) + B * Math.cos(la2) * Math.cos(lo2);
    const y =
      A * Math.cos(la1) * Math.sin(lo1) + B * Math.cos(la2) * Math.sin(lo2);
    const z = A * Math.sin(la1) + B * Math.sin(la2);
    out.push([
      (Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI,
      (Math.atan2(y, x) * 180) / Math.PI,
    ]);
  }
  return out;
}

export default function WorldArcs({
  places,
  view = { lo0: -135, lo1: 60, la: 80 },
}: {
  places: Place[];
  view?: { lo0: number; lo1: number; la: number };
}) {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current;
    const c = cv.current;
    if (!el || !c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const arcs = places.map((p) => arc(USC, p, 160));
    let w = 0;
    let h = 0;
    let dpr = 1;
    let s = 1;
    let oy = 0;
    let raf = 0;
    let visible = false;
    let shown = reduced ? 1 : 0;
    let t0 = 0;
    const px = (la: number, lo: number): [number, number] => [
      (lo - view.lo0) * s,
      oy + (view.la - la) * s,
    ];

    const size = () => {
      const r = c.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      s = w / (view.lo1 - view.lo0);
      // The great circles from LA to Africa and Arabia run up past 60 N,
      // so the band starts at 80 N.
      oy = 4;
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (let la = -60; la <= 85; la += 5) {
        for (let lo = -180; lo <= 180; lo += 5) {
          const [x, y] = px(la, lo);
          if (x < -4 || y < -4 || x > w + 4 || y > h + 4) continue;
          const major = la % 10 === 0 && lo % 10 === 0;
          ctx.fillStyle = major
            ? "rgba(255, 241, 204, 0.3)"
            : "rgba(255, 204, 0, 0.13)";
          const d = major ? 2 : 1.4;
          ctx.fillRect(x - d / 2, y - d / 2, d, d);
        }
      }
      arcs.forEach((pts, ai) => {
        const k = clamp((shown - ai * 0.12) / 0.6);
        const q = pts.map(([la, lo]) => px(la, lo));
        const n = Math.floor((q.length - 1) * k);
        let acc = 0;
        ctx.fillStyle = "rgba(255, 204, 0, 0.75)";
        for (let i = 1; i <= n; i++) {
          acc += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]);
          if (acc >= 7) {
            acc = 0;
            ctx.fillRect(q[i][0] - 1, q[i][1] - 1, 2, 2);
          }
        }
        if (k >= 1) {
          const f = reduced
            ? 0.6
            : ((((now - t0) / 3600 + ai * 0.29) % 1) + 1) % 1;
          const head = Math.floor(f * (q.length - 1));
          for (let j = 0; j < 12; j++) {
            const i = head - j;
            if (i < 0) break;
            ctx.fillStyle = `rgba(95, 168, 224, ${(1 - j / 12) * 0.95})`;
            ctx.beginPath();
            ctx.arc(q[i][0], q[i][1], 2.3 - j * 0.12, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        const [ex, ey] = q[q.length - 1];
        const on = clamp((k - 0.9) / 0.1);
        ctx.globalAlpha = on;
        ctx.fillStyle = "rgba(255, 204, 0, 0.18)";
        ctx.beginPath();
        ctx.arc(ex, ey, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      const [ux, uy] = px(USC.lat, USC.lon);
      ctx.fillStyle = "rgba(208, 16, 46, 0.22)";
      ctx.beginPath();
      ctx.arc(ux, uy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#d0102e";
      ctx.beginPath();
      ctx.arc(ux, uy, 6, 0, Math.PI * 2);
      ctx.fill();
      el.querySelectorAll<HTMLElement>("[data-at]").forEach((lab) => {
        const id = lab.dataset.at;
        const p = id === "usc" ? USC : places.find((x) => x.id === id);
        if (!p) return;
        const [x, y] = px(p.lat, p.lon);
        const up = lab.dataset.up ? " translateY(calc(-100% - 26px))" : "";
        // Near the right edge the label reads leftward, inside the map.
        const flip = x + lab.offsetWidth + 16 > w ? ` translateX(calc(-100% - 24px))` : "";
        lab.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)${up}${flip}`;
        const i = places.findIndex((x) => x.id === id);
        lab.style.opacity =
          id === "usc"
            ? "1"
            : clamp((shown - i * 0.12 - 0.54) / 0.06).toFixed(2);
      });
    };

    const loop = (now: number) => {
      raf = 0;
      if (!reduced && shown < 1) shown = Math.min(1, shown + 1 / 110);
      draw(now);
      if (!reduced && visible && !document.hidden)
        raf = requestAnimationFrame(loop);
    };
    size();
    draw(0);
    const ro = new ResizeObserver(() => {
      size();
      draw(performance.now());
    });
    ro.observe(c);
    const io = new IntersectionObserver(
      (es) => {
        visible = es.some((e) => e.isIntersecting);
        if (visible && !t0) t0 = performance.now();
        if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
      },
      { threshold: 0.25 },
    );
    io.observe(c);
    const onVis = () => {
      if (!document.hidden && visible && !raf && !reduced)
        raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [places, view]);

  return (
    <div ref={root} className="wa" aria-hidden="true">
      <canvas ref={cv} className="wa-canvas" />
      <span className="wa-lab is-usc" data-at="usc">
        <b>USC</b> Los Angeles
      </span>
      {places.map((p) => (
        <span
          key={p.id}
          className="wa-lab"
          data-at={p.id}
          data-up={p.up ? "1" : undefined}
        >
          <b>{p.name}</b>
          {p.note && <span>{p.note}</span>}
        </span>
      ))}
    </div>
  );
}
