"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { capClip, clamp, easeOut3, prog } from "../engine/math";
import type { World } from "./world";

export interface Numbers {
  companies: number;
  roles: number;
  kept: number;
  setAside: number;
  shortlist: number;
}

/* The scene chassis is our lemma-replica's (src/sections/hero-scene.js and
 * hero-intro.js), ported: one 1200vh block, a sticky pin, one progress value
 * N followed at 0.2 a frame, phases as windows on N, captions wiped by a
 * clip-path from N, a 2200ms load clock for the intro, and a depth exit where
 * each layer leaves by its own fixed distance on one cubic curve with the
 * opacity applied on the wrapper and again on each layer. The world, words and
 * colours are TTS's. */
const VIEWPORTS = 12;
const FOLLOW = 0.2;
const LOAD_MS = 2200;
const RISE = 0.18;
const RISE_PX = 12;
const COPY_STARTS = [0.06, 0.1, 0.16, 0.24, 0.3];
// The replica's intro span: the copy finishes leaving exactly as it reaches
// zero opacity, about 550px of scroll at 900 tall. On the way out the camera
// pulls back over the same span (world.ts CAMERA, key 0 to key 1).
const EXIT_SPAN = 0.055;
const COPY_TRAVEL = 380;

interface Cap {
  id: string;
  in: number;
  out: number;
  title: string;
  body: string;
}
const CAPS: Cap[] = [
  {
    id: "accounts",
    in: 0.1,
    out: 0.205,
    title: "It starts with raw accounts.",
    body: "Companies, people and signals, scattered across every source you can name. Messy, partial, everywhere.",
  },
  {
    id: "enrich",
    in: 0.235,
    out: 0.335,
    title: "Enrich first. Then decide.",
    body: "Every record gets the data it was missing before anyone judges it.",
  },
  {
    id: "qualify",
    in: 0.37,
    out: 0.53,
    title: "Qualify on criteria, not vibes.",
    body: "This station ran for real on 2026-09-15, on a venture fund's public job board.",
  },
  {
    id: "agents",
    in: 0.56,
    out: 0.66,
    title: "Agents do the research.",
    body: "Each one gets a real job, gets tested on real records, and answers none when it doesn't know.",
  },
  {
    id: "send",
    in: 0.69,
    out: 0.785,
    title: "Then it reaches the right person.",
    body: "Sequenced and personal, sent from systems the company owns.",
  },
  {
    id: "compound",
    in: 0.815,
    out: 0.905,
    title: "And it compounds.",
    body: "A deck gets presented once. A system keeps running after the semester ends.",
  },
  {
    id: "machine",
    in: 0.93,
    out: 2,
    title: "This is the machine. We teach every piece of it.",
    body: "Data, enrichment, qualification, agents, outreach. Learned here, then shipped for real companies.",
  },
];
const CAP_RAMP = 0.035;
// Where the rail sends you: the middle of each caption's hold.
const railTarget = (c: Cap) =>
  Math.min(0.985, c.in + Math.min(0.5, (Math.min(c.out, 1) - c.in) * 0.45));
const QUALIFY = { in: 0.39, out: 0.53, count: [0.4, 0.47] as const };

const STILLS = 8;
export const stillSrc = (k: number) => `/tts/world/station-${k}.jpg`;

export default function WorldScene({ nums }: { nums: Numbers }) {
  const run = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const counts = useRef<(HTMLSpanElement | null)[]>([]);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = run.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    let world: World | null = null;
    let dead = false;
    let target = 0,
      cur = 0,
      load = 0;
    let raf = 0,
      last = 0,
      banked = 0,
      visible = true;
    const t0 = performance.now();
    const counted = [
      nums.companies,
      nums.roles,
      nums.setAside,
      nums.kept,
      nums.shortlist,
    ];
    const lines = copy.current
      ? [...copy.current.querySelectorAll<HTMLElement>("[data-line]")]
      : [];

    const measure = () => {
      const travel = el.offsetHeight - window.innerHeight;
      target = travel > 0 ? clamp(-el.getBoundingClientRect().top / travel) : 0;
    };

    let lastActive = -2;
    const paint = (N: number) => {
      // Intro: copy lines rise on the load clock, then everything exits in depth.
      const exitE = easeOut3(clamp(N / EXIT_SPAN));
      const fade = clamp(1 - N / EXIT_SPAN);
      if (hero.current) {
        hero.current.style.opacity = fade.toFixed(3);
        hero.current.style.visibility = fade <= 0 ? "hidden" : "";
      }
      lines.forEach((ln, i) => {
        const n = easeOut3(clamp((load - COPY_STARTS[i]) / RISE));
        ln.style.opacity = n.toFixed(3);
        ln.style.transform = `translateY(${((1 - n) * RISE_PX).toFixed(2)}px)`;
      });
      if (copy.current) {
        copy.current.style.opacity = fade.toFixed(3);
        copy.current.style.transform = `translate3d(0, ${(-COPY_TRAVEL * exitE).toFixed(2)}px, 0)`;
      }

      // Captions, wiped on a clip from N.
      let act = -1;
      CAPS.forEach((c, i) => {
        const node = caps.current[i];
        if (!node) return;
        const a = prog(N, c.in, c.in + CAP_RAMP);
        const b = prog(N, c.out - CAP_RAMP, c.out);
        const hidden = a <= 0 || b >= 1;
        node.style.display = hidden ? "none" : "";
        if (!hidden) node.style.clipPath = capClip(a, b);
        if (!hidden) act = i;
      });
      if (act !== lastActive) {
        lastActive = act;
        setActive(act);
      }

      // The qualification panel: the real counts, counting up as you arrive.
      if (panel.current) {
        const a = prog(N, QUALIFY.in, QUALIFY.in + CAP_RAMP);
        const b = prog(N, QUALIFY.out - CAP_RAMP, QUALIFY.out);
        const hidden = a <= 0 || b >= 1;
        panel.current.style.display = hidden ? "none" : "";
        if (!hidden) panel.current.style.clipPath = capClip(a, b);
        const k = easeOut3(prog(N, QUALIFY.count[0], QUALIFY.count[1]));
        counts.current.forEach((s, i) => {
          if (s)
            s.textContent = String(
              Math.round(counted[i] * clamp(k * 1.25 - i * 0.06)),
            );
        });
      }
      world?.setN(N);
    };

    const frame = (now: number) => {
      raf = 0;
      if (dead) return;
      if (last) banked += now - last;
      last = now;
      load = Math.min(1, (now - t0) / LOAD_MS);
      world?.setLoad(load);
      const d = target - cur;
      cur = Math.abs(d) < 8e-5 ? target : cur + d * FOLLOW;
      paint(cur);
      world?.frame(banked);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const onScroll = () => {
      measure();
      kick();
    };
    const size = () => {
      const r = cv.getBoundingClientRect();
      world?.resize(Math.max(1, r.width), Math.max(1, r.height));
    };
    const onResize = () => {
      size();
      onScroll();
    };
    // The pin is only on screen while the block is; pause the GL off it.
    const io = new IntersectionObserver((e) => {
      visible = e[e.length - 1].isIntersecting;
      kick();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    measure();
    cur = target;
    paint(cur);
    kick();

    // The 3D loads after first paint, so the copy is up before three.js is.
    import("./world")
      .then(({ createWorld }) => {
        if (dead) return;
        try {
          world = createWorld(
            cv,
            { asideShare: nums.setAside / nums.roles },
            window.innerWidth < 768,
          );
        } catch {
          return; // No WebGL: the poster still stays up.
        }
        size();
        world.setN(cur);
        world.setLoad(load);
        world.frame(banked);
        setReady(true);
        if (new URLSearchParams(window.location.search).has("capture")) {
          (window as unknown as { __ttsWorld: unknown }).__ttsWorld = {
            still: (n: number, t: number, sweepMs?: number) => {
              world?.still(n, t, sweepMs);
              paint(n);
            },
            stop: () => {
              dead = true;
            },
          };
        }
        kick();
      })
      .catch(() => {
        /* The poster stays up; nothing else depends on the 3D. */
      });

    return () => {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      world?.dispose();
    };
  }, [reduced, nums]);

  const go = (c: Cap) => {
    const el = run.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + railTarget(c) * travel,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const heroCopy = (
    <>
      <div className="w-col-a">
        <p className="w-pill" data-line>
          USC&apos;s GTM and AI club
        </p>
        <h1
          className="w-title"
          aria-label="Build the systems that do the work."
        >
          <span data-line aria-hidden="true">
            Build the systems
          </span>
          <span data-line aria-hidden="true">
            that do the work.
          </span>
        </h1>
      </div>
      <div className="w-col-b">
        <p className="w-lede" data-line>
          Trojan Tech Solutions teaches USC students to build data sets, GTM
          engines and AI agents, then ship them for real companies.
        </p>
        <div className="w-actions" data-line>
          <Link className="btn btn-primary" href="/apply">
            Apply to join{" "}
            <span className="arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
          <a className="btn btn-secondary" href="#learn">
            What you learn
          </a>
        </div>
      </div>
    </>
  );

  const qualifyRows: [string, number][] = [
    ["Companies on the board", nums.companies],
    ["Open roles pulled", nums.roles],
    ["Set aside by the check", nums.setAside],
    ["Roles kept", nums.kept],
    ["Shortlisted for a student team", nums.shortlist],
  ];

  if (reduced) {
    // Reduced motion: no flight. Each station is its still render and caption.
    return (
      <section className="world is-still" aria-label="The GTM and AI machine">
        <div className="w-still-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stillSrc(0)}
            alt="The machine at golden hour: a funnel, pipes, a magnifier, agents, a mailbox and a rising chart."
          />
          <div className="w-copy">{heroCopy}</div>
        </div>
        {CAPS.map((c, i) => (
          <figure key={c.id} className="w-still">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stillSrc(Math.min(STILLS - 1, i + 1))} alt="" />
            <figcaption>
              <h2 className="w-cap-title">{c.title}</h2>
              <p>{c.body}</p>
              {c.id === "qualify" && (
                <ul className="w-q-rows">
                  {qualifyRows.map(([l, n]) => (
                    <li key={l}>
                      <span>{l}</span>
                      <span className="live">{n}</span>
                    </li>
                  ))}
                </ul>
              )}
            </figcaption>
          </figure>
        ))}
      </section>
    );
  }

  return (
    <section
      className="world"
      ref={run}
      style={{ height: `${VIEWPORTS * 100}vh` }}
      aria-label="The GTM and AI machine"
    >
      <div className="w-pin">
        <div className="w-well">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={ready ? "w-poster is-gone" : "w-poster"}
            src={stillSrc(0)}
            alt=""
            aria-hidden="true"
          />
          <canvas ref={canvas} className="w-canvas" aria-hidden="true" />
          <div className="w-grain" aria-hidden="true" />
          <div className="w-vignette" aria-hidden="true" />
        </div>

        <div className="w-hero" ref={hero}>
          <div className="w-copy" ref={copy}>
            {heroCopy}
          </div>
        </div>

        {CAPS.map((c, i) => (
          <div
            key={c.id}
            ref={(n) => {
              caps.current[i] = n;
            }}
            className={c.id === "machine" ? "w-cap is-final" : "w-cap"}
            style={{ display: "none" }}
          >
            <h2 className="w-cap-title">{c.title}</h2>
            <div className="w-cap-b">
              <p>{c.body}</p>
              {c.id === "machine" && (
                <div className="w-actions">
                  <Link className="btn btn-primary" href="/apply">
                    Apply to join{" "}
                    <span className="arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="w-overlay">
          <div className="w-qualify" ref={panel} style={{ display: "none" }}>
            <p className="w-q-head">The run, 2026-09-15</p>
            <ul className="w-q-rows">
              {qualifyRows.map(([l, n], i) => (
                <li key={l} className={i === 2 ? "is-aside" : undefined}>
                  <span>{l}</span>
                  <span
                    className="live"
                    ref={(s) => {
                      counts.current[i] = s;
                    }}
                  >
                    {n}
                  </span>
                </li>
              ))}
            </ul>
            <a className="btn btn-secondary w-q-btn" href="#run">
              Run it yourself{" "}
              <span className="arrow" aria-hidden="true">
                &darr;
              </span>
            </a>
          </div>

          <nav className="w-rail" aria-label="Stations">
            {CAPS.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={i === active ? "w-rail-btn is-on" : "w-rail-btn"}
                aria-label={`Go to: ${c.title}`}
                aria-current={i === active ? "step" : undefined}
                onClick={() => go(c)}
              >
                <span />
              </button>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
