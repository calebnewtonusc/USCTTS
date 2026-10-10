"use client";

import { useEffect, useRef } from "react";
import { clamp } from "../engine/math";

/*
 * /way's own opening (Caleb, 2026-10-10: "why tf the top of the tts way page
 * and the main exactly the same???"). Home opens on the LA city; /way opens
 * on the client, straight into Tyler's example: a nonprofit in Ghana that
 * needs donor outreach.
 *
 * The picture is the same language at the scale of the world: a graticule
 * of points, one at every 10 degrees of latitude and longitude, so each dot
 * is a real coordinate; USC's cardinal point on Los Angeles; a gold point on
 * Ghana; and the great circle between them as a dotted line, with light
 * running from Ghana to USC on a 3.2s loop, the request arriving. Under
 * reduced motion the line is drawn and the light holds still.
 *
 * Ghana's point is the country's centre (about 7.9 N, 1.0 W), not a city:
 * the example names the country only.
 */

const USC: [number, number] = [34.0224, -118.2851];
const GHANA: [number, number] = [7.95, -1.02];
const LOOP_MS = 3200;

const rad = (d: number) => (d * Math.PI) / 180;

/** Points along the great circle from a to b, as [lat, lon]. */
function greatCircle(a: [number, number], b: [number, number], n: number) {
  const [la1, lo1] = [rad(a[0]), rad(a[1])];
  const [la2, lo2] = [rad(b[0]), rad(b[1])];
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

const ARC = greatCircle(USC, GHANA, 220);

export default function WayOpen() {
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    const t0 = performance.now();

    // The view: longitude -140 to 20 fitted across the width, with both
    // places inside it, and latitude 58 N a little under the nav so the arc
    // sits in the top half, clear of the headline.
    const view = { lo0: -140, lo1: 20, la0: -12, la1: 62 };
    let s = 1;
    let ox = 0;
    let oy = 0;
    const px = (la: number, lo: number): [number, number] => [
      ox + (lo - view.lo0) * s,
      oy + (view.la1 - la) * s,
    ];

    const size = () => {
      const r = c.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      if (w >= 900) {
        // Wide: the map owns the right half, so the arc never runs behind
        // the headline. USC (about 118 W) lands near the half-way line.
        s = (w * 0.5 - 48) / 135;
        ox = w * 0.5 - (-125 - view.lo0) * s;
        oy = h * 0.3 - (view.la1 - 58) * s;
      } else {
        s = w / (view.lo1 - view.lo0);
        ox = 0;
        oy = Math.min(h * 0.16, 150) - (view.la1 - 58) * s;
      }
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // The graticule: one point per 5 degrees, every other one a little
      // brighter on the 10s, in the street gold at low alpha.
      for (let la = -60; la <= 85; la += 5) {
        for (let lo = -180; lo <= 180; lo += 5) {
          const [x, y] = px(la, lo);
          if (x < -4 || y < -4 || x > w + 4 || y > h + 4) continue;
          const major = la % 10 === 0 && lo % 10 === 0;
          ctx.fillStyle = major
            ? "rgba(255, 241, 204, 0.32)"
            : "rgba(255, 204, 0, 0.14)";
          const d = major ? 2 : 1.4;
          ctx.fillRect(x - d / 2, y - d / 2, d, d);
        }
      }
      // The arc, as dots every ~7px.
      const pts = ARC.map(([la, lo]) => px(la, lo));
      let acc = 0;
      ctx.fillStyle = "rgba(255, 204, 0, 0.75)";
      for (let i = 1; i < pts.length; i++) {
        acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (acc >= 7) {
          acc = 0;
          ctx.fillRect(pts[i][0] - 1, pts[i][1] - 1, 2, 2);
        }
      }
      // Light from Ghana back to USC.
      const k = reduced ? 0.5 : ((now - t0) % LOOP_MS) / LOOP_MS;
      const head = Math.floor((1 - k) * (pts.length - 1));
      for (let j = 0; j < 14; j++) {
        const i = clamp(head + j, 0, pts.length - 1);
        ctx.fillStyle = `rgba(95, 168, 224, ${(1 - j / 14) * 0.95})`;
        ctx.beginPath();
        ctx.arc(pts[i][0], pts[i][1], 2.4 - j * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
      // The two places.
      const dot = (
        la: number,
        lo: number,
        core: string,
        halo: string,
        r: number,
      ) => {
        const [x, y] = px(la, lo);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };
      dot(GHANA[0], GHANA[1], "#ffcc00", "rgba(255, 204, 0, 0.18)", 5);
      dot(USC[0], USC[1], "#d0102e", "rgba(208, 16, 46, 0.22)", 6);
      // Their labels sit beside the points, from the same projection.
      const lab = c.parentElement?.querySelectorAll<HTMLElement>("[data-place]") ?? [];
      lab.forEach((el) => {
        const [la, lo] = el.dataset.place === "usc" ? USC : GHANA;
        const [x, y] = px(la, lo);
        // Ghana's label reads to the left of its point, inside the screen.
        const left = el.dataset.place === "gh" ? " translateX(-100%)" : "";
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)${left}`;
      });
    };

    const loop = (now: number) => {
      raf = 0;
      draw(now);
      if (!reduced && visible && !document.hidden)
        raf = requestAnimationFrame(loop);
    };
    size();
    draw(performance.now());
    const ro = new ResizeObserver(() => {
      size();
      draw(performance.now());
    });
    ro.observe(c);
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
    });
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
  }, []);

  return (
    <section id="v4-open" className="wo" aria-labelledby="wo-h">
      <div className="wo-panel">
      <div className="wo-map" aria-hidden="true">
        <canvas ref={cv} className="wo-canvas" />
        <span className="wo-place is-usc" data-place="usc">
          <b>USC</b> Los Angeles
        </span>
        <span className="wo-place is-gh" data-place="gh">
          <b>Ghana</b> the client
        </span>
      </div>
      <div className="wo-copy">
        <p className="wo-label">
          <span className="wo-dot" aria-hidden="true" />
          one example of a TTS project
        </p>
        <h1 id="wo-h" className="wo-h">
          Say your client is a nonprofit in Ghana{" "}
          <em>that needs donor outreach.</em>
        </h1>
        <p className="wo-sub">
          Here&apos;s how a TTS team takes it from the first lead to the
          handover.
        </p>
        <span className="wo-cue" aria-hidden="true">
          <span className="wo-cue-line" />
          scroll
        </span>
      </div>
      </div>
    </section>
  );
}
