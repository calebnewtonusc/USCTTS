"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clamp, easeOut3, prog } from "../engine/math";
import type { Box, Story } from "./story";
import { BEATS, T_SWITCH } from "./timeline";

/* The intro and the deep-dive story, with Clay and Perplexity between them.
 *
 * One world (story.ts) on one fixed canvas behind both regions. The intro
 * region drives its timeline from 0 to 1 (the desk, through the laptop
 * screen, a glimpse of the street, up into the sky) and the story region
 * from 1 to 2 (down from that sky, a storefront per beat, back up). A veil
 * over the canvas carries the two handoffs: it is the partners' sky blue at
 * T 1 and the page's paper at T 2, so each section meets the world in the
 * same colour and there is no cut. The partners and the join band sit above
 * the canvas, so it can never paint over them.
 *
 * Geometry is read once per resize, never in the scroll path. */

const LOAD_MS = 2600;
const RISE = 0.16;
const RISE_PX = 12;
const COPY_STARTS = [0.5, 0.58, 0.66, 0.72];
const FOLLOW = 0.18;

const GLOW = "#e6f0fb";
const PARTNERS_SKY = "#c4ddf3";
const PAPER = "#f4f0e9";

/* The words, as one short story across the scenes (Caleb, 2026-10-05:
 * "tell a story not a textbook"). The student's note types itself on the
 * laptop, the lab's name fills the dive through the screen, then on the
 * street the text changes size and place beat to beat: a small honest label,
 * a line drifting past the café, a whisper at the law firm, nothing at the
 * shop (its window says it), a line over the dental office, and one big
 * line at the end. Every scene is the kind of work, never a real client. */
type Fit = "above" | "below" | "right" | null;
interface Line {
  id: string;
  text: string;
  cls: string;
  t0: number;
  t1: number;
  fit: Fit;
  /** Pixels it drifts across its window, right to left. */
  drift?: number;
  heading?: boolean;
}
const LINES: Line[] = [
  {
    id: "label",
    text: "The kind of thing you'd build, on a street like this one.",
    cls: "ws-label",
    t0: 1.07,
    t1: 1.18,
    fit: "above",
  },
  {
    id: "cafe",
    text: "The owner gets her mornings back.",
    cls: "ws-drift",
    t0: BEATS[0] - 0.045,
    t1: BEATS[0] + 0.07,
    fit: "above",
    drift: 80,
  },
  {
    id: "law",
    text: "Nobody's copying rows anymore.",
    cls: "ws-whisper",
    t0: BEATS[1] - 0.03,
    t1: BEATS[1] + 0.07,
    fit: "above",
  },
  {
    id: "dental",
    text: "And then we teach them to do it themselves.",
    cls: "ws-line",
    t0: BEATS[3] - 0.05,
    t1: BEATS[3] + 0.07,
    fit: "below",
  },
  {
    id: "end",
    text: "This is what TTS students build.",
    cls: "ws-big",
    t0: 1.9,
    t1: 2.2,
    fit: null,
    heading: true,
  },
];
const EDGE = 0.022;
const lineA = (T: number, l: Line) => prog(T, l.t0, l.t0 + EDGE) * (1 - prog(T, l.t1 - EDGE, l.t1));

function useReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** The ink of an element on screen: its text lines and buttons. */
function inkOf(el: HTMLElement): Box | null {
  const out = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
  const add = (r: DOMRect) => {
    if (!r.width || !r.height) return;
    out.l = Math.min(out.l, r.left);
    out.r = Math.max(out.r, r.right);
    out.t = Math.min(out.t, r.top);
    out.b = Math.max(out.b, r.bottom);
  };
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.textContent?.trim()) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) add(r);
  }
  el.querySelectorAll<HTMLElement>(".btn").forEach((b) =>
    add(b.getBoundingClientRect()),
  );
  return out.r > out.l ? out : null;
}

/** The intro: the desk at night, and the canvas the whole world draws on. */
export function WorldIntro() {
  const sec = useRef<HTMLElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const reduced = useReduced();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced) {
      // The load clock may have hidden the lines before reduced motion was
      // read; show them as they are.
      copy.current?.querySelectorAll<HTMLElement>("[data-line]").forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
      return;
    }
    const intro = sec.current;
    const cv = canvas.current;
    const sk = sky.current;
    const vl = veil.current;
    if (!intro || !cv || !sk || !vl) return;
    let world: Story | null = null;
    let dead = false;
    let raf = 0,
      last = 0,
      banked = 0,
      odd = false;
    const t0 = performance.now();
    let worldT0 = -1;
    let target = window.scrollY,
      cur = target;
    const lines = copy.current
      ? [...copy.current.querySelectorAll<HTMLElement>("[data-line]")]
      : [];

    // Measured once per resize.
    let W = window.innerWidth,
      H = window.innerHeight;
    let introTop = 0,
      introTravel = 1,
      storyTop = 1e9,
      storyTravel = 1;
    let caps: HTMLElement[] = [];
    const introWash = intro.querySelector<HTMLElement>(".w-wash");
    const big = intro.querySelector<HTMLElement>(".wi-big");
    let heroBox: Box | null = null;
    let capBoxes: (Box | null)[] = [];
    const AIR = 72;
    const toFit = (ink: Box | null, mode: Fit): Box | null => {
      if (!ink || !mode) return null;
      if (mode === "right" && W >= 768) return { l: ink.r + AIR, r: W - 48, t: 80, b: H - 24 };
      if (mode === "below") return { l: 16, r: W - 16, t: ink.b + 32, b: H - 20 };
      return { l: 16, r: W - 16, t: 76, b: ink.t - 32 };
    };
    const layout = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const y = window.scrollY;
      introTop = intro.getBoundingClientRect().top + y;
      introTravel = Math.max(1, intro.offsetHeight - H);
      // The first screen ends at the fold under any bar above the nav, so
      // the H1 and both buttons are on it.
      intro.style.setProperty("--fold-cut", `${Math.max(0, introTop + 64)}px`);
      const story = document.querySelector<HTMLElement>(".world-story");
      if (story) {
        storyTop = story.getBoundingClientRect().top + y;
        storyTravel = Math.max(1, story.offsetHeight - H);
        caps = LINES.map((l) => story.querySelector<HTMLElement>(`[data-l="${l.id}"]`) as HTMLElement);
        capBoxes = caps.map((c) => {
          const o = c.style.opacity,
            vis = c.style.visibility;
          c.style.opacity = "0";
          c.style.visibility = "visible";
          const pinTop = c.parentElement
            ? c.parentElement.getBoundingClientRect().top
            : 0;
          const b = inkOf(c);
          c.style.opacity = o;
          c.style.visibility = vis;
          return b
            ? { l: b.l, r: b.r, t: b.t - pinTop, b: b.b - pinTop }
            : null;
        });
      }
      if (copy.current) {
        const saved = lines.map((ln) => ln.style.transform);
        lines.forEach((ln) => (ln.style.transform = "none"));
        const pinTop =
          copy.current.parentElement?.getBoundingClientRect().top ?? 0;
        const b = inkOf(copy.current);
        heroBox = b
          ? { l: b.l, r: b.r, t: b.t - pinTop, b: b.b - pinTop }
          : null;
        lines.forEach((ln, i) => (ln.style.transform = saved[i]));
      }
    };
    layout();

    const tOf = (y: number) => {
      if (y < storyTop) return clamp((y - introTop) / introTravel);
      return 1 + clamp((y - storyTop) / storyTravel);
    };

    let shown = true;
    const paint = (y: number) => {
      const load = Math.min(1, (performance.now() - t0) / LOAD_MS);
      const T = tOf(y);
      // Hero copy: rises on the load clock, leaves on the first scroll.
      const leave = prog(T, 0.06, 0.16);
      lines.forEach((ln, i) => {
        const n = easeOut3(clamp((load - COPY_STARTS[i]) / RISE));
        ln.style.opacity = (n * (1 - leave)).toFixed(3);
        ln.style.transform = `translateY(${((1 - n) * RISE_PX - leave * 40).toFixed(2)}px)`;
      });
      // The veil: the screen's glow through the switch, the partners' sky at
      // T 1, the paper at T 2.
      let vc = GLOW,
        vo = 0;
      if (T < 0.6)
        vo =
          T < T_SWITCH ? prog(T, 0.34, T_SWITCH) : 1 - prog(T, T_SWITCH, 0.52);
      else if (T < 1.5) {
        vc = PARTNERS_SKY;
        vo = T <= 1 ? smooth01(prog(T, 0.88, 1)) : 1 - prog(T, 1, 1.07);
      } else {
        vc = PAPER;
        vo = prog(T, 1.93, 2);
      }
      vl.style.backgroundColor = vc;
      vl.style.opacity = vo.toFixed(3);
      // Past the story the canvas is gone; between the regions the partners
      // section covers it, so neither renders.
      const past = y > storyTop + storyTravel + H;
      const covered =
        T >= 0.999 && T <= 1.001 && y > introTop + introTravel + H * 0.2;
      const show = !past;
      if (show !== shown) {
        shown = show;
        sk.style.visibility = show ? "" : "hidden";
      }
      // The intro's wash leaves with its copy; the story's is there only
      // under a caption.
      if (introWash) introWash.style.opacity = (1 - leave).toFixed(3);
      // The intro's name, huge, over the dive through the screen.
      if (big) {
        const a = prog(T, 0.405, 0.44) * (1 - prog(T, 0.47, 0.52));
        big.style.opacity = a.toFixed(3);
        big.style.transform = `translate(-50%, -50%) scale(${(0.92 + 0.3 * prog(T, 0.4, 0.52)).toFixed(4)})`;
      }
      // The story's words.
      let fit: Box | null = null,
        mode: Fit = null;
      if (T < 0.14) {
        fit = heroBox;
        mode = W >= 768 ? "right" : "above";
      }
      caps.forEach((c, k) => {
        if (!c) return;
        const l = LINES[k];
        const a = lineA(T, l);
        c.style.opacity = a.toFixed(3);
        c.style.visibility = a <= 0.001 ? "hidden" : "visible";
        const dx = l.drift ? (0.5 - prog(T, l.t0, l.t1)) * l.drift : 0;
        const dy = l.drift ? 0 : (1 - a) * 10;
        c.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
        if (a > 0 && l.fit) {
          fit = capBoxes[k];
          mode = l.fit;
        }
      });
      world?.setT(T);
      world?.setBox(toFit(fit, mode));
      return { load, active: show && !covered && vo < 0.999 };
    };

    const frame = (now: number) => {
      raf = 0;
      if (dead) return;
      if (last) banked += now - last;
      last = now;
      if (world && worldT0 >= 0)
        world.setLoad(Math.min(1, (now - worldT0) / LOAD_MS));
      const d = target - cur;
      cur = Math.abs(d) < 0.5 ? target : cur + d * FOLLOW;
      const { load, active } = paint(cur);
      const moving =
        Math.abs(target - cur) > 0.5 ||
        load < 1 ||
        (worldT0 >= 0 && now - worldT0 < LOAD_MS);
      odd = !odd;
      // At rest only the drift is left, so it renders every other frame.
      if (active && (moving || odd)) world?.frame(banked);
      if (!document.hidden && (active || moving))
        raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const onScroll = () => {
      target = window.scrollY;
      kick();
    };
    const size = () =>
      world?.resize(Math.max(1, cv.clientWidth), Math.max(1, cv.clientHeight));
    const onResize = () => {
      layout();
      size();
      onScroll();
    };
    const ro = new ResizeObserver(() => layout());
    ro.observe(document.body);
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    kick();

    import("./story")
      .then(({ createStory }) => {
        if (dead) return;
        try {
          world = createStory(cv, window.innerWidth < 768);
        } catch (err) {
          console.error("TTS world did not start", err);
          return;
        }
        size();
        // A visitor who arrives mid-page skips the load-in.
        const assemble = window.scrollY < H * 0.5;
        world.setLoad(assemble ? 0 : 1);
        worldT0 = assemble ? performance.now() : -1;
        paint(cur);
        world.frame(banked);
        setReady(true);
        kick();
      })
      .catch(() => {
        /* The night sky behind the copy stays; nothing else needs the 3D. */
      });

    return () => {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      world?.dispose();
    };
  }, [reduced]);

  return (
    <section
      className={reduced ? "world-intro is-still" : "world-intro"}
      ref={sec}
      aria-label="USC's AI implementation lab"
    >
      {!reduced && (
        <div className="w-sky" ref={sky} aria-hidden="true">
          <canvas
            ref={canvas}
            className={ready ? "w-canvas is-ready" : "w-canvas"}
          />
          <div className="w-veil" ref={veil} />
        </div>
      )}
      <div className="w-pin">
        <div className="w-wash" aria-hidden="true" />
        <p className="wi-big" aria-hidden="true">
          USC&apos;s AI implementation lab.
        </p>
        <div className="w-copy" ref={copy}>
          <h1 className="w-title" aria-label="USC's AI implementation lab.">
            <span data-line aria-hidden="true">
              USC&apos;s AI
            </span>
            <span data-line aria-hidden="true">
              implementation lab.
            </span>
          </h1>
          <p className="w-lede" data-line>
            If a company needs AI work done, we do it: drafting emails, keeping
            a CRM up to date, finding customers, teaching their staff. Members
            learn all of it by building it.
          </p>
          <div className="w-actions" data-line>
            <Link className="btn btn-primary" href="/apply">
              Join TTS{" "}
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
            <Link className="btn btn-secondary" href="/work-with-us">
              Work with us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
const smooth01 = (t: number) => t * t * (3 - 2 * t);

/** The deep dive: the street, one storefront per beat, over the same canvas. */
export function WorldStory() {
  const reduced = useReduced();
  const sec = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!reduced) return;
    // The scroll loop may have hidden the lines before reduced motion was
    // read; under reduced motion every line simply shows.
    const show = () =>
      sec.current?.querySelectorAll<HTMLElement>(".ws-text").forEach((el) => {
        el.style.opacity = "1";
        el.style.visibility = "visible";
        el.style.translate = "none";
      });
    show();
    const id = requestAnimationFrame(show);
    return () => cancelAnimationFrame(id);
  }, [reduced]);
  return (
    <section
      ref={sec}
      className={reduced ? "world-story is-still" : "world-story"}
      aria-label="The kind of thing you'd build"
    >
      <div className="w-pin">
        {LINES.map((l) => {
          // Under reduced motion every line is simply shown, set explicitly so a
          // style left by the scroll loop can't hide it.
          const style = reduced
            ? { opacity: 1, visibility: "visible" as const, translate: "none" }
            : { opacity: 0, visibility: "hidden" as const };
          return l.heading ? (
            <h2 key={l.id} data-l={l.id} className={`ws-text ${l.cls}`} style={style}>
              {l.text}
            </h2>
          ) : (
            <p key={l.id} data-l={l.id} className={`ws-text ${l.cls}`} style={style}>
              {l.text}
            </p>
          );
        })}
      </div>
    </section>
  );
}
