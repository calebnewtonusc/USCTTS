"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { capClip, clamp, easeInOut3, easeOut3, prog } from "../engine/math";
import type { World } from "./world";
import { worldBridge } from "./bridge";

export interface Numbers {
  companies: number;
  roles: number;
  kept: number;
  setAside: number;
  shortlist: number;
}

/* Two parts of one world, with the partners section between them (Caleb,
 * 2026-10-04: a load-in that makes you say woah, then Clay and Perplexity,
 * then the walkthrough). The canvas is fixed behind all three, so it is the
 * same cubes the whole way: they build the block on load, the camera cranes
 * up into the sky while the partners section passes, comes back down to
 * them, and they take one form per example. Every value is a function of the
 * scroll, followed at 0.2 a frame, so it all reverses.
 *
 * Geometry is read once per resize, never in the scroll path: scroll only
 * reads window.scrollY, so a scroll event can't force a layout. */

const FOLLOW = 0.2;
const LOAD_MS = 2200;
const RISE = 0.18;
const RISE_PX = 12;
const COPY_STARTS = [0.42, 0.5, 0.56, 0.64, 0.7];
const WALK_VIEWPORTS = 9;

interface Cap {
  id: string;
  in: number;
  out: number;
  title: string;
  body: string;
}
/* One example per form, each a before and after a business owner recognizes
 * and a student would want to build. Examples, never claimed as past client
 * results (docs/RUBRIC-tts.md). Windows sit in the holds in field.ts. */
const CAPS: Cap[] = [
  {
    id: "emails",
    in: 0.12,
    out: 0.245,
    title: "Your team answers the same emails all week",
    body: "We set up AI that drafts them, so your people just check them and hit send.",
  },
  {
    id: "crm",
    in: 0.33,
    out: 0.455,
    title: "Your leads live in a spreadsheet",
    body: "We set up a CRM that keeps itself up to date, so every contact and deal is where your team can find it.",
  },
  {
    id: "customers",
    in: 0.54,
    out: 0.665,
    title: "You need more customers",
    body: "We build the lists and the outreach that find them. The red ones are the people actually worth reaching.",
  },
  {
    id: "teach",
    in: 0.75,
    out: 0.855,
    title: "Your people don't know how to use AI yet",
    body: "We teach them, and we're building a curriculum like that for a client's students right now.",
  },
  {
    id: "build",
    in: 0.92,
    out: 2,
    title: "Members learn all of it by building it",
    body: "Whatever is eating a team's time, we figure out where AI fits and build it with them.",
  },
];
const CAP_RAMP = 0.03;
const railTarget = (c: Cap) =>
  Math.min(0.985, c.in + Math.min(0.5, (Math.min(c.out, 1) - c.in) * 0.45));

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

/** The hero: the load-in, and the fixed canvas the whole world draws on. */
export function WorldHero({ nums }: { nums: Numbers }) {
  const sec = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const reduced = useReduced();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const hero = sec.current;
    const cv = canvas.current;
    if (!hero || !cv) return;
    let world: World | null = null;
    let dead = false;
    let raf = 0,
      last = 0,
      banked = 0,
      odd = false;
    let target = window.scrollY,
      cur = target;
    const t0 = performance.now();
    let worldT0 = -1;
    let pointerMoved = 0;
    const lines = copy.current
      ? [...copy.current.querySelectorAll<HTMLElement>("[data-line]")]
      : [];

    // Measured once per resize.
    let H = window.innerHeight;
    let heroH = 1,
      partnersMid = 1,
      walkTop = 2,
      walkTravel = 1;
    let caps: HTMLElement[] = [];
    let rail: HTMLElement[] = [];
    // The copy's text box on screen, per thing that can be up: the hero,
    // then each caption. Text nodes and buttons only, so a block element's
    // empty width never counts.
    type Box = { l: number; r: number; t: number; b: number };
    let heroBox: Box | null = null;
    let capBoxes: (Box | null)[] = [];
    const inkOf = (el: HTMLElement, dy: number): Box | null => {
      const out = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
      const add = (r: DOMRect) => {
        if (!r.width || !r.height) return;
        out.l = Math.min(out.l, r.left);
        out.r = Math.max(out.r, r.right);
        out.t = Math.min(out.t, r.top + dy);
        out.b = Math.max(out.b, r.bottom + dy);
      };
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        if (!n.textContent?.trim()) continue;
        range.selectNodeContents(n);
        for (const r of range.getClientRects()) add(r);
      }
      el.querySelectorAll<HTMLElement>(".btn").forEach((b) => add(b.getBoundingClientRect()));
      return out.r > out.l ? out : null;
    };
    // The rule is 48px of air between text and cubes. The camera's fit is an
    // estimate (perspective, the idle drift), measured up to 16px short at
    // 1440, so it aims for 72.
    const AIR = 72;
    let navBottom = 64;
    const boxFor = (ink: Box | null): Box | null => {
      if (!ink) return null;
      const W = window.innerWidth;
      if (W >= 768) return { l: ink.r + AIR, r: W - 56, t: navBottom + 16, b: H - 16 };
      // On a phone the copy is at the foot, so the cubes go above it.
      return { l: 12, r: W - 36, t: navBottom + 12, b: ink.t - 24 };
    };
    const layout = () => {
      H = window.innerHeight;
      const y = window.scrollY;
      const nav = document.querySelector(".nav");
      navBottom = nav ? nav.getBoundingClientRect().bottom + y : 64;
      // The hero ends exactly at the fold, under whatever bar sits above
      // the nav, so its copy and both buttons are on the first screen.
      const heroTop = hero.getBoundingClientRect().top + y;
      hero.style.height = `${Math.max(480, H - Math.max(0, heroTop))}px`;
      heroH = hero.offsetHeight;
      const copyEl = copy.current;
      if (copyEl) {
        // Measured as it sits at the top of the page, with every line up.
        const saved = lines.map((ln) => [ln.style.opacity, ln.style.transform]);
        lines.forEach((ln) => (ln.style.transform = "none"));
        heroBox = inkOf(copyEl, y);
        lines.forEach((ln, i) => {
          ln.style.opacity = saved[i][0];
          ln.style.transform = saved[i][1];
        });
      }
      const partners = document.querySelector<HTMLElement>(".partners");
      const walk = document.querySelector<HTMLElement>(".world-walk");
      if (partners) {
        const r = partners.getBoundingClientRect();
        partnersMid = r.top + y + r.height / 2 - H / 2;
      } else partnersMid = heroH;
      if (walk) {
        walkTop = walk.getBoundingClientRect().top + y;
        walkTravel = Math.max(1, walk.offsetHeight - H);
        caps = [...walk.querySelectorAll<HTMLElement>(".w-cap")];
        rail = [...walk.querySelectorAll<HTMLElement>(".w-rail-btn")];
        // Captions are measured as they sit in the pinned screen.
        const pin = walk.querySelector<HTMLElement>(".w-pin");
        const pinTop = pin ? pin.getBoundingClientRect().top : 0;
        capBoxes = caps.map((c) => {
          const d = c.style.display,
            cp = c.style.clipPath;
          c.style.display = "";
          c.style.clipPath = "none";
          const b = inkOf(c, -pinTop);
          c.style.display = d;
          c.style.clipPath = cp;
          return b;
        });
      } else {
        walkTop = partnersMid + H;
        walkTravel = 1;
      }
      partnersMid = Math.max(
        heroH * 0.6,
        Math.min(partnersMid, walkTop - H * 0.3),
      );
    };
    layout();

    let lastAct = -2;
    let opacity = 1;
    const paint = (y: number) => {
      // Hero copy rises on the load clock; it scrolls away with the page.
      const load = Math.min(1, (performance.now() - t0) / LOAD_MS);
      lines.forEach((ln, i) => {
        const n = easeOut3(clamp((load - COPY_STARTS[i]) / RISE));
        ln.style.opacity = n.toFixed(3);
        ln.style.transform = `translateY(${((1 - n) * RISE_PX).toFixed(2)}px)`;
      });

      const crane =
        y < partnersMid
          ? easeInOut3(prog(y, heroH * 0.2, partnersMid))
          : 1 - easeInOut3(prog(y, partnersMid, walkTop));
      const N = clamp((y - walkTop) / walkTravel);
      const end = walkTop + walkTravel;
      // The exit: the canvas fades into the paper while the last caption is
      // still up, so the block ends with no edge and nothing under it.
      opacity = 1 - prog(y, end - H * 0.45, end - H * 0.05);
      cv.style.opacity = opacity.toFixed(3);
      cv.style.visibility = opacity <= 0 ? "hidden" : "";
      world?.setState(N, crane);

      let act = -1;
      caps.forEach((node, i) => {
        const c = CAPS[i];
        if (!c) return;
        const a = prog(N, c.in, c.in + CAP_RAMP);
        const b = prog(N, c.out - CAP_RAMP, c.out);
        const hidden = a <= 0 || b >= 1;
        node.style.display = hidden ? "none" : "";
        if (!hidden) {
          node.style.clipPath = capClip(a, b);
          act = i;
        }
      });
      // The box the cubes keep to: the hero's while it is on screen, then
      // the caption that is up, or the next one to come.
      let k = act;
      if (k < 0) {
        k = CAPS.findIndex((c) => c.in > N);
        if (k < 0) k = CAPS.length - 1;
      }
      world?.setBox(boxFor(y < heroH * 0.6 ? heroBox : (capBoxes[k] ?? null)));
      if (act !== lastAct) {
        lastAct = act;
        rail.forEach((b, i) => {
          b.classList.toggle("is-on", i === act);
          if (i === act) b.setAttribute("aria-current", "step");
          else b.removeAttribute("aria-current");
        });
      }
      return load;
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
      const load = paint(cur);
      const worldLoading = worldT0 >= 0 && now - worldT0 < LOAD_MS;
      // While anything moves, every frame renders. At rest only the ambient
      // motion is left, so it renders every other frame: 60 a second on a
      // 120Hz display, half the GPU work while someone reads.
      const moving =
        Math.abs(target - cur) > 0.5 ||
        load < 1 ||
        worldLoading ||
        now - pointerMoved < 400;
      odd = !odd;
      if (opacity > 0 && (moving || odd)) world?.frame(banked);
      // Past the world, nothing moves until the scroll comes back.
      if (!document.hidden && (opacity > 0 || moving))
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
    const size = () => {
      world?.resize(
        Math.max(1, window.innerWidth),
        Math.max(1, window.innerHeight),
      );
    };
    const onResize = () => {
      layout();
      size();
      onScroll();
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      world?.setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / H) * 2 + 1,
      );
      pointerMoved = performance.now();
      kick();
    };
    const onLeave = () => {
      world?.setPointer(null, null);
      pointerMoved = performance.now();
      kick();
    };
    // Late layout (fonts, images) moves the sections; re-measure then.
    const ro = new ResizeObserver(() => layout());
    ro.observe(document.body);
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    kick();

    // three.js loads after first paint, so the copy is up before it is.
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
        if (new URLSearchParams(window.location.search).has("capture"))
          (window as unknown as { __ttsWorld: unknown }).__ttsWorld = {
            bounds: () => world?.bounds(),
          };
        worldBridge.qualify = () => ({
          x: window.innerWidth * 0.66,
          y: window.innerHeight * 0.45,
        });
        kick();
      })
      .catch(() => {
        /* The sky behind the copy stays; nothing else depends on the 3D. */
      });

    return () => {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      worldBridge.qualify = null;
      world?.dispose();
    };
  }, [reduced, nums]);

  return (
    <section
      className={reduced ? "world-hero is-still" : "world-hero"}
      ref={sec}
      aria-label="USC's AI implementation lab"
    >
      {!reduced && (
        <div className="w-sky" aria-hidden="true">
          <canvas
            ref={canvas}
            className={ready ? "w-canvas is-ready" : "w-canvas"}
          />
        </div>
      )}
      <div className="w-wash" aria-hidden="true" />
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
          If a company needs AI work done, we do it, automations, CRM, GTM
          engineering, agents, even teaching their people. Members learn all of
          it by building it.
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
    </section>
  );
}

/** The walkthrough: the captions and the rail over the same fixed canvas. */
export function WorldWalk() {
  const sec = useRef<HTMLElement>(null);
  const reduced = useReduced();

  const go = (c: Cap) => {
    const el = sec.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + railTarget(c) * travel,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  if (reduced)
    return (
      <section
        className="world-walk is-still"
        aria-label="What that looks like"
      >
        {CAPS.map((c) => (
          <div key={c.id} className="w-still">
            <p className="w-kicker">For example</p>
            <h2 className="w-cap-title">{c.title}</h2>
            <p>{c.body}</p>
          </div>
        ))}
      </section>
    );

  return (
    <section
      className="world-walk"
      ref={sec}
      style={{ height: `${WALK_VIEWPORTS * 100}vh` }}
      aria-label="What that looks like"
    >
      <div className="w-pin">
        <div className="w-wash" aria-hidden="true" />
        {CAPS.map((c, i) => (
          <div
            key={c.id}
            className={i === CAPS.length - 1 ? "w-cap is-final" : "w-cap"}
            style={{ display: "none" }}
          >
            {i < CAPS.length - 1 && <p className="w-kicker">For example</p>}
            <h2 className="w-cap-title">{c.title}</h2>
            <p className="w-cap-b">{c.body}</p>
          </div>
        ))}
        <nav className="w-rail" aria-label="Examples">
          {CAPS.map((c) => (
            <button
              key={c.id}
              type="button"
              className="w-rail-btn"
              aria-label={`Go to: ${c.title}`}
              onClick={() => go(c)}
            >
              <span />
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
