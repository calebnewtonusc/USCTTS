"use client";

import { useRef } from "react";
import { usePin } from "@/components/tts/usePin";

/*
 * 01, how it goes (Caleb, 2026-10-10, on the four equal columns this
 * replaces: "Never let chewbs ever make smth this lame ever agin plz"). One
 * pinned band, one idea: USC's point travels the four stops while the
 * panel beside them shows what the member actually has in hand at each
 * one. The application, then the five pieces of the machine lighting as
 * build sessions ship them, then the same pieces wired into one pipeline
 * on public data, then that pipeline running into a client's project.
 * Every line is from docs/COPY-tts.md (the timeline and the tracks) or
 * /way's handoff line; no numbers. One scroll value drives it all
 * (usePin); reduced motion shows the last stop with every piece lit.
 */
const STOPS = [
  {
    title: "You apply",
    cap: "Tell us your track and why. We read every one.",
  },
  {
    title: "Build sessions",
    cap: "Hands-on nights where every member ships a working piece of the machine.",
  },
  {
    title: "Practice builds",
    cap: "Your team builds a real pipeline on public data, start to finish.",
  },
  {
    title: "Real company work",
    cap: "The strongest teams take it on for a real company or nonprofit.",
  },
];

// The apply form's three tracks (app/api/apply/route.ts), each with its job.
const TRACKS = [
  { name: "Building", job: "Engineering and AI agents. You ship the tools." },
  {
    name: "Consulting",
    job: "GTM engineering for real companies: lists, enrichment, outbound, the CRM.",
  },
  {
    name: "Growing",
    job: "Marketing, content and design that gets the work seen.",
  },
];

// What build sessions take you through, in order (docs/COPY-tts.md).
const PIECES = ["data", "enrichment", "qualification", "prompting", "agents"];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const prog = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Where each stop owns the band: four equal quarters of the scroll. */
const N = STOPS.length;

function draw(p: number, el: HTMLElement) {
  const s = p * N; // 0..4
  const on = Math.min(N - 1, Math.floor(s));
  el.style.setProperty("--p", p.toFixed(4));

  // The stops, and USC's point travelling between their dots: it reaches
  // stop i halfway through stop i's quarter.
  const lis = el.querySelectorAll<HTMLElement>(".jo-stops li");
  lis.forEach((li, i) => {
    li.dataset.state = i < on ? "done" : i === on ? "on" : "next";
  });
  const head = el.querySelector<HTMLElement>(".jo-stops-head");
  const dots = [...el.querySelectorAll<SVGSVGElement>(".jo-stop-dot")];
  if (head && dots.length === N) {
    const at = Math.min(N - 1, Math.max(0, s - 0.5));
    const a = Math.min(N - 2, Math.floor(at));
    const f = smooth(at - a);
    // The dot is an svg, which has no offsetTop: measure it against the
    // stops box instead.
    const box = head.parentElement?.getBoundingClientRect();
    const pos = (d: SVGSVGElement) => {
      const r = d.getBoundingClientRect();
      return { x: r.left - (box?.left ?? 0), y: r.top - (box?.top ?? 0) };
    };
    const A = pos(dots[a]);
    const B = pos(dots[a + 1]);
    head.style.transform = `translate3d(${lerp(A.x, B.x, f).toFixed(1)}px, ${lerp(A.y, B.y, f).toFixed(1)}px, 0)`;
  }

  // Captions: each stop's line holds its quarter, crossfading at the seams.
  el.querySelectorAll<HTMLElement>(".jo-stage-cap").forEach((c, i) => {
    const o =
      i === 0
        ? 1 - smooth(prog(s, 0.9, 1.05))
        : smooth(prog(s, i - 0.05, i + 0.1)) *
          (i === N - 1 ? 1 : 1 - smooth(prog(s, i + 0.9, i + 1.05)));
    c.style.opacity = o.toFixed(3);
    c.style.visibility = o > 0.01 ? "visible" : "hidden";
    c.style.transform = `translate3d(0, ${lerp(10, 0, Math.min(1, o)).toFixed(1)}px, 0)`;
  });

  // 1. The application: the three tracks take the highlight in turn, then
  // the stamp: read by a person.
  const app = el.querySelector<HTMLElement>(".jo-app");
  if (app) {
    const t = prog(s, 0, 0.9);
    const o = 1 - smooth(prog(s, 0.88, 1.05));
    app.style.opacity = o.toFixed(3);
    app.style.visibility = o > 0.01 ? "visible" : "hidden";
    app.style.transform = `translate3d(0, ${lerp(0, -24, smooth(prog(s, 0.88, 1.05))).toFixed(1)}px, 0) scale(${lerp(1, 0.97, smooth(prog(s, 0.88, 1.05))).toFixed(3)})`;
    const pick = Math.min(
      TRACKS.length - 1,
      Math.floor(prog(t, 0, 0.78) * TRACKS.length * 0.999),
    );
    app.querySelectorAll<HTMLElement>(".jo-chip").forEach((c, i) => {
      c.dataset.on = String(i === pick);
    });
    app.querySelectorAll<HTMLElement>(".jo-app-job").forEach((j, i) => {
      j.dataset.on = String(i === pick);
    });
    app.dataset.read = String(t > 0.8);
  }

  // 2 to 4. The machine: the five pieces arrive, light one by one as build
  // sessions ship them, wire into one pipeline, then run into the client.
  const m = el.querySelector<HTMLElement>(".jo-mach");
  if (m) {
    const o = smooth(prog(s, 0.92, 1.12));
    m.style.opacity = o.toFixed(3);
    m.style.visibility = o > 0.01 ? "visible" : "hidden";
    m.style.transform = `translate3d(0, ${lerp(24, 0, o).toFixed(1)}px, 0)`;
    const lit = prog(s, 1.08, 1.82) * PIECES.length;
    m.querySelectorAll<HTMLElement>(".jo-pc").forEach((pc, i) => {
      pc.dataset.lit = String(lit > i + 0.35);
    });
    // The wire draws through the pieces on the practice build, the run
    // travels it, then the drop carries it into the client's project.
    const wire = smooth(prog(s, 2.02, 2.4));
    const run = prog(s, 2.3, 2.9);
    const c = smooth(prog(s, 3.0, 3.35));
    const out = prog(s, 3.3, 3.7);
    const pcs = m.querySelectorAll<HTMLElement>(".jo-pc");
    const cl = m.querySelector<HTMLElement>(".jo-client");
    const w = m.querySelector<HTMLElement>(".jo-wire");
    const d = m.querySelector<HTMLElement>(".jo-drop");
    const rn = m.querySelector<HTMLElement>(".jo-runner");
    if (pcs.length && cl && w && d && rn) {
      const mid = (e: HTMLElement) => e.offsetTop + e.offsetHeight / 2;
      const y0 = mid(pcs[0]);
      const y1 = mid(pcs[pcs.length - 1]);
      const y2 = mid(cl);
      w.style.transform = `translate3d(0, ${y0.toFixed(1)}px, 0)`;
      w.style.height = `${((y1 - y0) * wire).toFixed(1)}px`;
      d.style.transform = `translate3d(0, ${y1.toFixed(1)}px, 0)`;
      d.style.height = `${((y2 - y1) * smooth(out)).toFixed(1)}px`;
      const y = out > 0 ? lerp(y1, y2, smooth(out)) : lerp(y0, y1, smooth(run));
      rn.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    }
    m.style.setProperty("--wire", wire.toFixed(3));
    m.dataset.run = String(run > 0 && out < 1);
    m.style.setProperty("--client", c.toFixed(3));
    m.dataset.live = String(out >= 1);
  }
}

export default function Path() {
  const ref = useRef<HTMLElement>(null);
  usePin(ref, draw);

  return (
    <section
      ref={ref}
      className="jo-pin jo-pin-path"
      aria-labelledby="jo-path-h"
    >
      <div className="jo-band is-sky">
        <div className="jo-wrap jo-path-grid">
          <div className="jo-path-side">
            <p className="jo-mark">
              <span className="jo-n">01</span> how it goes
            </p>
            <h2 id="jo-path-h" className="jo-h2 is-sm">
              From your first build night <em>to real company work.</em>
            </h2>
            <div className="jo-stops">
              <span className="jo-stops-line" aria-hidden="true" />
              <span className="jo-stops-head" aria-hidden="true" />
              <ol>
                {STOPS.map((s, i) => (
                  <li key={s.title} data-state={i === 0 ? "on" : "next"}>
                    <svg className="jo-stop-dot" viewBox="0 0 14 14" aria-hidden="true">
                      <circle cx="7" cy="7" r="6" />
                    </svg>
                    <span className="jo-n">{String(i + 1).padStart(2, "0")}</span>
                    <b>{s.title}</b>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <figure
            className="jo-stage"
            aria-label="What a member has in hand at each step"
          >
            <div className="jo-stage-art">
              {/* Step 1: the application, the form's own fields. */}
              <div className="jo-app" data-read="false">
                <p className="jo-app-h">
                  Your application <span className="jo-app-k">TTS, USC</span>
                </p>
                <div className="jo-app-f">
                  <span className="jo-app-l">kind of work</span>
                  <div className="jo-chips">
                    {TRACKS.map((t, i) => (
                      <span
                        key={t.name}
                        className="jo-chip"
                        data-on={String(i === 0)}
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                  <div className="jo-app-jobs">
                    {TRACKS.map((t, i) => (
                      <p
                        key={t.name}
                        className="jo-app-job"
                        data-on={String(i === 0)}
                      >
                        {t.job}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="jo-app-f">
                  <span className="jo-app-l">why</span>
                  <span className="jo-app-why" aria-hidden="true">
                    <i />
                    <i />
                  </span>
                </div>
                <span className="jo-app-stamp">read by a person</span>
              </div>

              {/* Steps 2 to 4: the machine the member builds. */}
              <div className="jo-mach" data-run="false" data-live="false">
                <span className="jo-mach-in">public data</span>
                <div className="jo-pcs">
                  <ol>
                    {PIECES.map((name, i) => (
                      <li key={name} className="jo-pc" data-lit="false">
                        <span className="jo-pc-n">{String(i + 1).padStart(2, "0")}</span>
                        <span className="jo-pc-name">{name}</span>
                        <span className="jo-pc-ok">shipped</span>
                      </li>
                    ))}
                  </ol>
                  <div className="jo-client">
                  <span className="jo-client-pin" aria-hidden="true" />
                  <span className="jo-client-t">Client project</span>
                  <span className="jo-client-s">
                    <span className="jo-client-live">live</span> handed off as a
                    full software project
                  </span>
                </div>
                  <span className="jo-wire" aria-hidden="true" />
                  <span className="jo-runner" aria-hidden="true" />
                  <span className="jo-drop" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="jo-stage-caps">
              {STOPS.map((s) => (
                <p key={s.title} className="jo-stage-cap">
                  <b className="jo-stage-t">{s.title}.</b> {s.cap}
                </p>
              ))}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
