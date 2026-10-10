"use client";

import { useEffect, useRef } from "react";
import { clamp, prog, smooth } from "../engine/math";
import { glideTo, INTRO, onFrame, P, phaseAt, store, travelT, WEEK } from "./choreo";
import { attachFlap } from "./flap";

/*
 * The system readout along the bottom of the screen, and the route rail.
 * Both speak the one idea (DIRECTION-tts-v4.md, point 1): the internet,
 * centred on LA, with work going out from USC. The coordinates are where
 * the camera is looking, the clock is LA's, the status line says what the
 * field is doing right now, and the rail is the stops on the route out of
 * USC. Every value is computed, none is decoration.
 */

const USC = { lat: 34.0224, lon: -118.2851 };
const M_PER_DEG = 111320;
// Every point the field draws, from public/tts/grid/README.md: 69,327
// street points, 5,066 freeway vertices and 348 businesses. The counter
// lights up with the load clock.
const POINTS = 69327 + 5066 + 348;

type Stop = { label: string; at: () => number };

const el = (id: string) => document.getElementById(`v4-${id}`);
const topOf = (e: HTMLElement) => e.getBoundingClientRect().top + window.scrollY;
const weekAt = (p: number) => {
  const e = el("week");
  return e ? topOf(e) + p * (e.offsetHeight - window.innerHeight) : 0;
};

/* The route rail exists on /way only: home is a structured page after its
 * opener, and a rail of stops there would point at a story it no longer
 * tells. */
const STOPS: Stop[] = [
  { label: "USC", at: () => 0 },
  { label: "The client", at: () => weekAt(WEEK.heat[1]) },
  { label: "The machine", at: () => weekAt(WEEK.film[0] + 0.05) },
  {
    label: "Your turn",
    at: () => {
      const e = el("join");
      return e ? topOf(e) : 0;
    },
  },
];

function status(): string {
  if (P.join > 0.35) return "your turn";
  if (P.weekIn > 0.6) {
    // The mono labels name the skill or the tool (SCRIPT-v5).
    const ph = phaseAt(P.week);
    // The example client is in Ghana, so the light on the LA map is the
    // work leaving USC, never a street address or a distance.
    if (ph === "intro") return "one example project";
    if (ph === "travel") return travelT() < 0.98 ? "the work leaves USC" : "with the client";
    if (ph === "dive") return "into one point of light";
    // The captions name each stage's skill; the readout only counts, so
    // the two never say the same words at once.
    if (ph === "tray") return "stage 1 of 6";
    if (ph === "sorter") return "stage 2 of 6";
    if (ph === "typewriter") return "stage 3 of 6";
    if (ph === "mailbox") return "stage 4 of 6";
    if (ph === "blocks") return "stage 5 of 6";
    if (ph === "pullback") return "stage 6 of 6";
    return "back on the map";
  }
  if (store.load < 1) return `assembling LA, ${Math.round(store.load * 100)}%`;
  // The first scroll is the whole club in one move: students at USC, work
  // going out to businesses across LA. The status line says it as it runs.
  if (store.stream > 0.55) return "work streaming out from USC";
  if (store.stream > 0.04) return "students at USC, streaming in on the 110 and the 10";
  // Where the reader stands. It used to say what the club is, which the
  // line about who we are says two screens later, and nothing on home is
  // said twice (Caleb, 2026-10-09).
  return "you are here: USC";
}

const clock = (secs: boolean) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    second: secs ? "2-digit" : undefined,
    hour12: false,
  }).format(new Date());

export default function Readouts({ rail = true }: { rail?: boolean }) {
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = strip.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coord = root.querySelector<HTMLElement>(".v4-ro-coord");
    const time = root.querySelector<HTMLElement>(".v4-ro-time");
    const stat = root.querySelector<HTMLElement>(".v4-ro-status");
    const pts = root.querySelector<HTMLElement>(".v4-ro-pts");
    const dot = root.querySelector<HTMLElement>(".v4-rail-dot");
    const fill = root.querySelector<HTMLElement>(".v4-rail-fill");
    const stops = [...root.querySelectorAll<HTMLButtonElement>(".v4-stop")];
    let ys = STOPS.map((s) => s.at());
    const measure = () => {
      ys = STOPS.map((s) => s.at());
    };
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    const tick = () => {
      if (time) time.textContent = `${clock(!reduced)} PT`;
    };
    tick();
    const iv = reduced
      ? 0
      : window.setInterval(() => {
          if (!document.hidden) tick();
        }, 1000);

    const flaps = stops.map((b) => attachFlap(b));
    const clicks = stops.map((b, i) => {
      const go = () => glideTo(STOPS[i].at());
      b.addEventListener("click", go);
      return () => b.removeEventListener("click", go);
    });

    const off = onFrame((f) => {
      // Comes in on the load clock once the streets are mostly drawn.
      // On home it leaves as the paper sheet comes up over the field.
      const o =
        (1 - smooth(prog(P.join, 0.25, 0.6))) *
        (1 - smooth(prog(P.sheet, 0.2, 0.55))) *
        smooth(prog(INTRO.t, 0.5, 0.8));
      root.style.opacity = o.toFixed(3);
      root.style.visibility = o > 0.002 ? "visible" : "hidden";

      const c = store.camera;
      const lat = USC.lat + c.y / M_PER_DEG;
      const lon = USC.lon + c.x / (M_PER_DEG * Math.cos((lat * Math.PI) / 180));
      const s = `${lat.toFixed(4)}° N  ${Math.abs(lon).toFixed(4)}° W`;
      if (coord && coord.textContent !== s) coord.textContent = s;
      const lit = `${Math.round(store.load * POINTS).toLocaleString("en-US")} points lit`;
      if (pts && pts.textContent !== lit) pts.textContent = lit;
      const st = status();
      if (stat && stat.textContent !== st) stat.textContent = st;

      // Where along the route we are: piecewise between the stops.
      const y = f.y;
      let pos = 0;
      for (let i = 0; i < ys.length - 1; i++) {
        if (y >= ys[i]) pos = i + clamp((y - ys[i]) / Math.max(1, ys[i + 1] - ys[i]));
      }
      const share = pos / (ys.length - 1);
      if (dot) dot.style.left = `${(share * 100).toFixed(2)}%`;
      if (fill) fill.style.transform = `scaleX(${share.toFixed(4)})`;
      const cur = Math.floor(pos + 0.5);
      stops.forEach((b, i) => {
        if (i === cur) b.setAttribute("aria-current", "step");
        else b.removeAttribute("aria-current");
        b.classList.toggle("is-past", i < pos + 0.5);
      });
    });

    return () => {
      off();
      ro.disconnect();
      window.clearInterval(iv);
      clicks.forEach((c) => c());
      flaps.forEach((c) => c());
    };
  }, []);

  return (
    <div ref={strip} className="v4-ro">
      <p className="v4-ro-read" aria-hidden="true">
        <span className="v4-ro-coord">34.0224° N  118.2851° W</span>
        <span className="v4-ro-time">PT</span>
        <span className="v4-ro-pts">0 points lit</span>
        <span className="v4-ro-status">live</span>
      </p>
      {rail && (
      <nav className="v4-rail" aria-label="Stops on the route">
        <div className="v4-rail-track" aria-hidden="true">
          <span className="v4-rail-fill" />
          <span className="v4-rail-dot" />
        </div>
        <ol>
          {STOPS.map((s, i) => (
            <li key={s.label} style={{ left: `${(i / (STOPS.length - 1)) * 100}%` }}>
              <button type="button" className="v4-stop">
                {s.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      )}
    </div>
  );
}
