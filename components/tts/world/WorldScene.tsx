"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clamp, easeOut3, prog } from "../engine/math";
import type { World } from "./world";
import { worldBridge } from "./bridge";

export interface Numbers {
  companies: number;
  roles: number;
  kept: number;
  setAside: number;
  shortlist: number;
}

/* The hero and the walkthrough, with Clay and Perplexity between them.
 *
 * The cubes are the hero's alone: 216 of them build a block on a 2.2s load
 * clock beside the H1, and the outer ones lift toward the pointer. The
 * walkthrough is four drawn objects a business owner recognizes (review,
 * 2026-10-04: the cube forms couldn't be read in one look). Everything is a
 * function of the scroll, so it all reverses.
 *
 * Geometry is read once per resize, never in the scroll path: scroll only
 * reads window.scrollY, so a scroll event can't force a layout. */

const LOAD_MS = 2200;
const RISE = 0.18;
const RISE_PX = 12;
const COPY_STARTS = [0.42, 0.5, 0.56, 0.64];

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

type Box = { l: number; r: number; t: number; b: number };
/** The ink of an element on screen: its text lines and buttons, so a block
 * element's empty width never counts. */
function inkOf(el: HTMLElement, dy: number): Box | null {
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
  el.querySelectorAll<HTMLElement>(".btn").forEach((b) =>
    add(b.getBoundingClientRect()),
  );
  return out.r > out.l ? out : null;
}

/** The hero: the load-in, on a canvas that lives inside it. */
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
    const t0 = performance.now();
    let worldT0 = -1;
    let pointerMoved = 0;
    let scrolled = 0;
    const lines = copy.current
      ? [...copy.current.querySelectorAll<HTMLElement>("[data-line]")]
      : [];

    // The rule is 48px of air between text and cubes. The camera's fit is
    // an estimate (perspective, the idle drift), measured up to 16px short
    // at 1440, so it aims for 72.
    const AIR = 72;
    let W = window.innerWidth,
      H = window.innerHeight;
    let heroH = 1,
      heroTop = 0,
      navBottom = 64;
    let fit: Box | null = null;
    const layout = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const y = window.scrollY;
      const nav = document.querySelector(".nav");
      navBottom = nav ? nav.getBoundingClientRect().bottom + y : 64;
      // The hero ends exactly at the fold, under whatever bar sits above
      // the nav, so its copy and both buttons are on the first screen.
      heroTop = hero.getBoundingClientRect().top + y;
      hero.style.height = `${Math.max(480, H - Math.max(0, heroTop))}px`;
      heroH = hero.offsetHeight;
      const copyEl = copy.current;
      let ink: Box | null = null;
      if (copyEl) {
        // Measured with every line up, in canvas pixels.
        const saved = lines.map((ln) => ln.style.transform);
        lines.forEach((ln) => (ln.style.transform = "none"));
        const top = hero.getBoundingClientRect().top;
        ink = inkOf(copyEl, -top);
        lines.forEach((ln, i) => (ln.style.transform = saved[i]));
      }
      const cw = cv.clientWidth || W,
        ch = cv.clientHeight || heroH;
      const navIn = Math.max(0, navBottom - heroTop);
      fit = !ink
        ? null
        : W >= 768
          ? { l: ink.r + AIR, r: cw - 40, t: navIn + 16, b: ch - 24 }
          : { l: 12, r: cw - 12, t: navIn + 12, b: ink.t - 24 };
      world?.setBox(fit);
    };
    layout();

    const paint = () => {
      const load = Math.min(1, (performance.now() - t0) / LOAD_MS);
      lines.forEach((ln, i) => {
        const n = easeOut3(clamp((load - COPY_STARTS[i]) / RISE));
        ln.style.opacity = n.toFixed(3);
        ln.style.transform = `translateY(${((1 - n) * RISE_PX).toFixed(2)}px)`;
      });
      // As the hero scrolls away the camera tilts up a little into the sky.
      world?.setState(0, clamp((scrolled - heroTop) / heroH));
      return load;
    };

    const frame = (now: number) => {
      raf = 0;
      if (dead) return;
      if (last) banked += now - last;
      last = now;
      if (world && worldT0 >= 0)
        world.setLoad(Math.min(1, (now - worldT0) / LOAD_MS));
      const load = paint();
      const onScreen = scrolled < heroTop + heroH;
      const moving =
        load < 1 ||
        (worldT0 >= 0 && now - worldT0 < LOAD_MS) ||
        now - pointerMoved < 400;
      odd = !odd;
      // At rest only the ambient drift is left, so it renders every other
      // frame: 60 a second on a 120Hz display.
      if (onScreen && (moving || odd)) world?.frame(banked);
      if (!document.hidden && onScreen) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const onScroll = () => {
      scrolled = window.scrollY;
      kick();
    };
    const size = () =>
      world?.resize(Math.max(1, cv.clientWidth), Math.max(1, cv.clientHeight));
    const onResize = () => {
      layout();
      size();
      onScroll();
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      // The canvas fills the hero from its top, so its y is page y less the
      // hero's top.
      const cy = e.clientY + scrolled - heroTop;
      world?.setPointer((e.clientX / W) * 2 - 1, -(cy / heroH) * 2 + 1);
      pointerMoved = performance.now();
      kick();
    };
    const onLeave = () => {
      world?.setPointer(null, null);
      pointerMoved = performance.now();
      kick();
    };
    const ro = new ResizeObserver(() => layout());
    ro.observe(document.body);
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    scrolled = window.scrollY;
    kick();

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
        world.setBox(fit);
        // A visitor who arrives mid-page skips the load-in.
        const assemble = window.scrollY < H * 0.5;
        world.setLoad(assemble ? 0 : 1);
        worldT0 = assemble ? performance.now() : -1;
        paint();
        world.frame(banked);
        setReady(true);
        if (new URLSearchParams(window.location.search).has("capture"))
          (window as unknown as { __ttsWorld: unknown }).__ttsWorld = {
            bounds: () => world?.bounds(),
          };
        worldBridge.qualify = () => ({ x: W * 0.66, y: H * 0.45 });
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
          If a company needs AI work done, we do it: drafting emails, keeping a
          CRM up to date, finding customers, teaching their staff. Members learn
          all of it by building it.
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

/* ---------- the walkthrough ----------
 * Four beats, one screen of scroll each. A beat's caption and object stay
 * up until the next crossfades in, and inside a beat the object plays on
 * the beat's own progress p, written to one CSS variable (--p) per frame.
 * Every item's motion is computed in CSS from --p and its index, so nothing
 * pops: it is all one continuous function of the scroll. The data is
 * generic and made up: no real companies or people. */

interface Beat {
  id: string;
  title: string;
  body: string;
}
const BEATS: Beat[] = [
  {
    id: "emails",
    title: "Your team answers the same emails all week",
    body: "We set up AI that drafts every reply, so your team just checks and sends.",
  },
  {
    id: "crm",
    title: "Your leads live in a spreadsheet",
    body: "We move them into a CRM that keeps itself up to date.",
  },
  {
    id: "customers",
    title: "You need more customers",
    body: "We find the few worth reaching, the red ones, and write to them.",
  },
  {
    id: "teach",
    title: "Your people don't know how to use AI yet",
    body: "We teach them, and we're building a curriculum like that for one client's students right now.",
  },
];
// Where a beat's caption crossfades, as a share of one beat.
const FADE = 0.14;

/* The four objects are drawn in SVG, one family: a white card with a soft
 * shadow, a 14 unit radius, a title bar, and the page's ink, sky, gold and
 * cardinal. Each reads --p from its beat; every item's own --k comes from
 * --p and its index --i in world.css, so items play in turn and move
 * continuously. The data is made up and generic. */
const v = (o: Record<string, number>) =>
  Object.fromEntries(Object.entries(o).map(([k, n]) => [`--${k}`, n])) as React.CSSProperties;

const EMAILS: [string, string, string][] = [
  ["Order question", "Can I move my delivery to Friday?", "Yes, Friday works. I've moved it for you."],
  ["New customer", "Do you ship to Canada?", "We do, usually in 5 to 7 business days."],
  ["Billing", "I was charged twice in March", "Sorry! I've refunded the second charge."],
  ["Restock", "Is the blue one back in stock?", "It's back next week. Want me to hold one?"],
  ["Booking", "Table for six on Saturday?", "You're booked for six at 7pm. See you then!"],
];
function Inbox() {
  const RH = 66;
  return (
    <svg className="wo" viewBox="0 0 520 380" role="img" aria-label="An inbox where AI drafts each reply">
      <rect className="wo-frame" x="0.5" y="0.5" width="519" height="379" rx="14" />
      <text className="wo-t" x="20" y="30">Inbox</text>
      <text className="wo-t wo-dim" x="500" y="30" textAnchor="end">5 waiting</text>
      <line className="wo-rule" x1="0" x2="520" y1="47.5" y2="47.5" />
      {EMAILS.map(([from, subj, draft], i) => (
        <g key={subj} className="wo-mail" style={v({ i })} transform={`translate(0 ${48 + i * RH})`}>
          <rect className="wo-mail-bg" x="1" y="0" width="518" height={RH} rx={i === EMAILS.length - 1 ? 13 : 0} />
          <circle className="wo-av" cx="34" cy="33" r="15" />
          <text className="wo-av-t" x="34" y="38" textAnchor="middle">{from[0]}</text>
          <text className="wo-t" x="62" y="28">{subj}</text>
          <text className="wo-s wo-draft" x="62" y="49">{draft}</text>
          <g className="wo-tag">
            <rect x="436" y="9" width="66" height="20" rx="10" />
            <text x="469" y="23" textAnchor="middle">Drafted</text>
          </g>
          {i < EMAILS.length - 1 && <line className="wo-rule" x1="0" x2="520" y1={RH - 0.5} y2={RH - 0.5} />}
        </g>
      ))}
    </svg>
  );
}

const SHEET = [
  ["jen m", "jen@??", "called 3/2?", "maybe"],
  ["Dan Ortiz", "N/A", "", "HOT!!"],
  ["sam (expo)", "sam.k@mail", "left vm", ""],
  ["Priya", "", "emailed 2x", "follow up"],
];
const CARDS = [
  ["Jen M.", "New lead", "Call booked Thursday"],
  ["Dan Ortiz", "Talking", "Sent pricing"],
  ["Sam K.", "New lead", "Met at the expo"],
  ["Priya S.", "Talking", "Follow up Monday"],
];
function SheetToCrm() {
  const COL = [16, 136, 262, 404];
  return (
    <svg className="wo" viewBox="0 0 520 380" role="img" aria-label="A messy spreadsheet whose rows become tidy CRM cards">
      <g className="wo-sheet">
        <rect className="wo-frame" x="0.5" y="0.5" width="519" height="300" rx="14" />
        <text className="wo-t wo-mono" x="20" y="30">leads_FINAL_v3.xlsx</text>
        <line className="wo-rule" x1="0" x2="520" y1="47.5" y2="47.5" />
        <rect className="wo-head" x="1" y="48" width="518" height="40" />
        {["name", "email", "notes", "??"].map((h, k) => (
          <text key={h} className="wo-s wo-mono wo-dim" x={COL[k]} y="73">{h}</text>
        ))}
        {[1, 2, 3].map((k) => (
          <line key={k} className="wo-rule" x1={COL[k] - 10.5} x2={COL[k] - 10.5} y1="48" y2="300" />
        ))}
        {SHEET.map((r, i) => (
          <g key={i} className="wo-cell-row" style={v({ i })} transform={`translate(0 ${88 + i * 53})`}>
            <line className="wo-rule" x1="0" x2="520" y1="0.5" y2="0.5" />
            {r.map((c, k) => (
              <text key={k} className="wo-s wo-mono" x={COL[k]} y="32">{c}</text>
            ))}
          </g>
        ))}
      </g>
      {CARDS.map(([name, stage, note], i) => (
        <g key={name} className="wo-card" style={v({ i })} transform={`translate(${(i % 2) * 266} ${Math.floor(i / 2) * 150 + 20})`}>
          <rect className="wo-frame" x="0.5" y="0.5" width="253" height="132" rx="12" />
          <rect className="wo-card-stripe" x="0.5" y="0.5" width="6" height="132" rx="3" />
          <text className="wo-h" x="20" y="36">{name}</text>
          <g className={stage === "Talking" ? "wo-pill is-on" : "wo-pill"}>
            <rect x="20" y="50" width={stage === "Talking" ? 62 : 72} height="20" rx="10" />
            <text x={stage === "Talking" ? 51 : 56} y="64" textAnchor="middle">{stage}</text>
          </g>
          <text className="wo-s wo-dim" x="20" y="96">{note}</text>
        </g>
      ))}
    </svg>
  );
}

const PROSPECTS: [string, string, boolean][] = [
  ["A bakery in Pasadena", "12 people", false],
  ["A dental office in Irvine", "Opened last month", true],
  ["A gym chain in Burbank", "3 locations", false],
  ["A law firm in Glendale", "Hiring an office manager", true],
  ["A florist in Santa Monica", "2 people", false],
  ["A clinic in Long Beach", "Just raised prices", false],
  ["A car wash in Torrance", "Seasonal", false],
  ["A café in Echo Park", "Opening a second spot", true],
];
function Prospects() {
  const keep = PROSPECTS.map((p, i) => (p[2] ? i : -1)).filter((i) => i >= 0);
  const rest = PROSPECTS.map((p, i) => (p[2] ? -1 : i)).filter((i) => i >= 0);
  const to = new Map<number, number>();
  [...keep, ...rest].forEach((i, k) => to.set(i, k));
  // The rows worth reaching are drawn last, so they pass over the rest.
  const order = [...rest, ...keep];
  return (
    <svg className="wo" viewBox="0 0 520 404" role="img" aria-label="A list of possible customers where the ones worth reaching are marked and rise to the top">
      <rect className="wo-frame" x="0.5" y="0.5" width="519" height="403" rx="14" />
      <text className="wo-t" x="20" y="30">Everyone you could reach</text>
      <text className="wo-t wo-dim" x="500" y="30" textAnchor="end">8 of 412</text>
      <line className="wo-rule" x1="0" x2="520" y1="47.5" y2="47.5" />
      <g transform="translate(0 50)">
        {order.map((i) => {
          const [name, , worth] = PROSPECTS[i];
          return (
            <g key={name} className={worth ? "wo-pro is-worth" : "wo-pro"} style={v({ i, to: to.get(i) ?? i })}>
              <rect className="wo-pro-bg" x="2" y="0" width="516" height="44" />
              <line className="wo-rule" x1="16" x2="504" y1="43.5" y2="43.5" />
              <circle className="wo-mark" cx="26" cy="22" r="5" />
              <text className="wo-t" x="44" y="27">{name}</text>
              {worth ? (
                <g className="wo-tag wo-tag-red">
                  <rect x="400" y="12" width="104" height="20" rx="10" />
                  <text x="452" y="26" textAnchor="middle">Worth reaching</text>
                </g>
              ) : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

const ANSWER = [
  ["Paste in three emails you've already sent", "that sound like you."],
  ["Ask it to write the new one in the same voice."],
  ["Then read it out loud before you send it."],
];
function Lesson() {
  return (
    <svg className="wo" viewBox="0 0 520 330" role="img" aria-label="A lesson card where a student's question gets answered step by step">
      <rect className="wo-frame" x="0.5" y="0.5" width="519" height="329" rx="14" />
      <text className="wo-t" x="20" y="30">Lesson 3: Getting AI to sound like you</text>
      <text className="wo-t wo-dim" x="500" y="30" textAnchor="end">3 of 8</text>
      <line className="wo-rule" x1="0" x2="520" y1="47.5" y2="47.5" />
      <circle className="wo-av wo-av-gold" cx="38" cy="90" r="15" />
      <text className="wo-av-t wo-av-gold-t" x="38" y="95" textAnchor="middle">M</text>
      <rect className="wo-bubble" x="64" y="66" width="400" height="58" rx="14" />
      <text className="wo-t" x="80" y="90">How do I get it to write emails that sound</text>
      <text className="wo-t" x="80" y="111">like our store, not like a robot?</text>
      {ANSWER.map((lines, i) => (
        <g key={i} className="wo-step" style={v({ i })} transform={`translate(0 ${150 + i * 54})`}>
          <circle className="wo-num" cx="92" cy="14" r="11" />
          <text className="wo-num-t" x="92" y="18" textAnchor="middle">{i + 1}</text>
          {lines.map((l, k) => (
            <text key={k} className="wo-t" x="114" y={19 + k * 21}>{l}</text>
          ))}
        </g>
      ))}
    </svg>
  );
}

const OBJECTS = [Inbox, SheetToCrm, Prospects, Lesson];

/** The walkthrough: four beats on one pinned screen. */
export function WorldWalk() {
  const sec = useRef<HTMLElement>(null);
  const reduced = useReduced();

  useEffect(() => {
    if (reduced) return;
    const el = sec.current;
    if (!el) return;
    const beats = [...el.querySelectorAll<HTMLElement>(".ww-beat")];
    const rail = [...el.querySelectorAll<HTMLElement>(".w-rail-btn")];
    let top = 0,
      travel = 1,
      raf = 0,
      lastAct = -1;
    const layout = () => {
      top = el.getBoundingClientRect().top + window.scrollY;
      travel = Math.max(1, el.offsetHeight - window.innerHeight);
    };
    const tick = () => {
      raf = 0;
      const N = clamp((window.scrollY - top) / travel) * BEATS.length;
      let act = 0;
      beats.forEach((b, k) => {
        // Fully up across its own share. At each change the old beat fades
        // all the way out, then the new one fades in and rises 16px, so two
        // beats are never up together (review, 2026-10-04).
        const inA = k === 0 ? 1 : prog(N, k, k + FADE / 2);
        const outA = k === BEATS.length - 1 ? 0 : prog(N, k + 1 - FADE / 2, k + 1);
        const o = inA * (1 - outA);
        b.style.setProperty("--rise", ((1 - inA) * 16).toFixed(2) + "px");
        b.style.opacity = o.toFixed(3);
        b.style.visibility = o <= 0.001 ? "hidden" : "";
        // The object plays across the middle of its share.
        b.style.setProperty("--p", prog(N - k, 0.08, 0.82).toFixed(4));
        if (o > 0.5) act = k;
      });
      if (act !== lastAct) {
        lastAct = act;
        rail.forEach((b, i) => {
          b.classList.toggle("is-on", i === act);
          if (i === act) b.setAttribute("aria-current", "step");
          else b.removeAttribute("aria-current");
        });
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      layout();
      kick();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    layout();
    tick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced]);

  const go = (k: number) => {
    const el = sec.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + ((k + 0.55) / BEATS.length) * travel,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <section
      className={reduced ? "world-walk is-still" : "world-walk"}
      ref={sec}
      aria-label="What that looks like"
    >
      <div className="w-pin">
        {BEATS.map((b, k) => {
          const Obj = OBJECTS[k];
          return (
            <div
              key={b.id}
              className="ww-beat"
              style={
                reduced || k === 0
                  ? undefined
                  : { opacity: 0, visibility: "hidden" }
              }
            >
              <div className="ww-cap">
                <h2 className="w-cap-title">
                  <span className="w-kicker">For example</span>
                  {b.title}
                </h2>
                <p className="w-cap-b">{b.body}</p>
              </div>
              <div className="ww-obj">
                <Obj />
              </div>
            </div>
          );
        })}
        {!reduced && (
          <nav className="w-rail" aria-label="Examples">
            {BEATS.map((b, k) => (
              <button
                key={b.id}
                type="button"
                className={k === 0 ? "w-rail-btn is-on" : "w-rail-btn"}
                aria-label={`Go to: ${b.title}`}
                onClick={() => go(k)}
              >
                <span />
              </button>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
