"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { capClip, clamp, easeOut3, prog } from "../engine/math";
import type { World } from "./world";
import { worldBridge } from "./bridge";

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
// One caption per form, each one held while the cubes hold that form
// (world.ts MORPHS). Plain and short, in Caleb's voice.
const CAPS: Cap[] = [
  {
    id: "mess",
    in: 0.07,
    out: 0.155,
    title: "Most data shows up as a mess",
    body: "It comes in from everywhere, half filled in and scattered, and nothing useful happens until someone sorts it out.",
  },
  {
    id: "clean",
    in: 0.2,
    out: 0.29,
    title: "So first we clean it up",
    body: "Every record gets checked and put where it belongs, so whatever we build next stands on something solid.",
  },
  {
    id: "automate",
    in: 0.34,
    out: 0.44,
    title: "Automations that run on their own",
    body: "We build the workflows a company would otherwise do by hand, and they keep running after we've left.",
  },
  {
    id: "crm",
    in: 0.49,
    out: 0.59,
    title: "A CRM the team actually keeps up",
    body: "Contacts, companies and deals sorted where people can find them, instead of lost across five tools.",
  },
  {
    id: "gtm",
    in: 0.64,
    out: 0.74,
    title: "GTM engines for startups",
    body: "Out of everyone a startup could reach, the engine finds the few worth it, and those are the ones who hear from them.",
  },
  {
    id: "teach",
    in: 0.79,
    out: 0.87,
    title: "And we teach people to use it",
    body: "We're building an AI curriculum for one client's students, lesson by lesson, so they can use AI for real work.",
  },
  {
    id: "build",
    in: 0.91,
    out: 2,
    title: "You learn it by building it",
    body: "Every member builds real AI work, for startups, for products and for students.",
  },
];
const CAP_RAMP = 0.035;
// Where the rail sends you: the middle of each caption's hold.
const railTarget = (c: Cap) =>
  Math.min(0.985, c.in + Math.min(0.5, (Math.min(c.out, 1) - c.in) * 0.45));
// The exit: the cubes have settled into the horizon line, the seam's own
// hairline lands on it, and the canvas fades into the paper it sits on, so
// the block ends with no edge.
const FADE: [number, number] = [0.955, 1];

export default function WorldScene({ nums }: { nums: Numbers }) {
  const run = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const well = useRef<HTMLDivElement>(null);
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
    let worldT0 = -1;
    let odd = false;
    const lines = copy.current
      ? [...copy.current.querySelectorAll<HTMLElement>("[data-line]")]
      : [];

    // Geometry is read once per resize, never in the scroll path: scroll only
    // reads window.scrollY, so a scroll event can't force a layout.
    let blockTop = 0,
      travel = 1;
    const layoutBlock = () => {
      blockTop = el.getBoundingClientRect().top + window.scrollY;
      travel = Math.max(1, el.offsetHeight - window.innerHeight);
    };
    const measure = () => {
      target = clamp((window.scrollY - blockTop) / travel);
    };
    layoutBlock();

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

      if (well.current) well.current.style.opacity = (1 - prog(N, FADE[0], FADE[1])).toFixed(3);
      world?.setN(N);
    };

    const frame = (now: number) => {
      raf = 0;
      if (dead) return;
      if (last) banked += now - last;
      last = now;
      load = Math.min(1, (now - t0) / LOAD_MS);
      // The world runs its own load clock from the moment it exists, so the
      // assembly is seen even when three.js arrives after the copy has risen
      // (review, 2026-10-04: the intro read as finished by 400ms, because the
      // shared clock had run out before the first 3D frame).
      if (world && worldT0 >= 0)
        world.setLoad(Math.min(1, (now - worldT0) / LOAD_MS));
      const d = target - cur;
      cur = Math.abs(d) < 8e-5 ? target : cur + d * FOLLOW;
      paint(cur);
      // While the scroll is moving, every frame renders. At rest only the
      // ambient motion is left, so it renders every other frame, which is 60
      // a second on a 120Hz display and halves the GPU load while reading.
      const moving = Math.abs(target - cur) > 1e-5 || load < 1;
      odd = !odd;
      if (moving || odd) world?.frame(banked);
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
      layoutBlock();
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
            { keptShare: nums.shortlist / Math.max(1, nums.roles) },
            window.innerWidth < 768,
          );
        } catch (err) {
          // No WebGL, or a build error: the poster stays up. Say which.
          console.error("TTS world did not start", err);
          return;
        }
        size();
        world.setN(cur);
        // A visitor who arrives mid-page skips the assembly.
        const assemble = cur < 0.02;
        world.setLoad(assemble ? 0 : 1);
        worldT0 = assemble ? performance.now() : 0;
        world.frame(banked);
        setReady(true);
        worldBridge.qualify = () => {
          const r = cv.getBoundingClientRect();
          const q = world ? world.qualifyOnCanvas() : { x: 0.66, y: 0.5 };
          return { x: r.left + q.x * r.width, y: r.top + q.y * r.height };
        };
        if (new URLSearchParams(window.location.search).has("capture")) {
          (window as unknown as { __ttsWorld: unknown }).__ttsWorld = {
            still: (
              n: number,
              t: number,
              rippleMs?: number,
              loadAt?: number,
            ) => {
              world?.still(n, t, rippleMs, loadAt);
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
      worldBridge.qualify = null;
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

  // Caleb's words, 2026-10-04: what the lab is in one line, then the range
  // of work and how members learn it.
  const heroCopy = (
    <>
      <div className="w-col-a">
        <p className="w-pill" data-line>
          Trojan Tech Solutions
        </p>
        <h1 className="w-title" aria-label="USC's AI implementation lab.">
          <span data-line aria-hidden="true">
            USC&apos;s AI
          </span>
          <span data-line aria-hidden="true">
            implementation lab.
          </span>
        </h1>
      </div>
      <div className="w-col-b">
        <p className="w-lede" data-line>
          If a company needs AI work done, we do it, automations, CRM, GTM
          engineering, agents, even teaching their people. Members learn all
          of it by building it.
        </p>
        <div className="w-actions" data-line>
          <Link className="btn btn-primary" href="/apply">
            Apply to join{" "}
            <span className="arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
          <Link className="btn btn-secondary" href="/build">
            See how it works
          </Link>
        </div>
      </div>
    </>
  );

  if (reduced) {
    // Reduced motion: no flight and no morph, the copy as a plain sequence.
    return (
      <section className="world is-still" aria-label="USC's AI implementation lab">
        <div className="w-copy">{heroCopy}</div>
        {CAPS.map((c) => (
          <div key={c.id} className="w-still">
            <h2 className="w-cap-title">{c.title}</h2>
            <p>{c.body}</p>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      className="world"
      ref={run}
      style={{ height: `${VIEWPORTS * 100}vh` }}
      aria-label="USC's AI implementation lab"
    >
      <div className="w-pin">
        <div className="w-well" ref={well}>
          <canvas
            ref={canvas}
            className={ready ? "w-canvas is-ready" : "w-canvas"}
            aria-hidden="true"
          />
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
            className={c.id === "build" ? "w-cap is-final" : "w-cap"}
            style={{ display: "none" }}
          >
            <h2 className="w-cap-title">{c.title}</h2>
            <div className="w-cap-b">
              <p>{c.body}</p>
              {c.id === "build" && (
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
