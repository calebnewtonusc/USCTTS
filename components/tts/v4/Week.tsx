"use client";

import { useEffect, useRef } from "react";
import {
  clamp,
  easeInOut3,
  easeOut3,
  lerp,
  prog,
  rng,
  smooth,
} from "../engine/math";
import { attachFlap } from "./flap";
import { BEAT, beatAt, onFrame, P, store } from "./choreo";
import XrayViews from "./Xray";
import {
  ASK,
  BLOCKS,
  DAYS,
  HOURS,
  INBOX,
  LEADS,
  LESSON,
  REPLY,
  STAGES,
  TOTAL_HOURS,
  type Kind,
} from "./weekData";

/*
 * The week (DIRECTION-tts-v4.md, beat 3). Reader: a business owner who
 * doesn't know much about AI, and a student deciding whether this is what
 * they want to build. One example week, packed, and the AI work as the
 * character: it leaves USC on the grid, arrives in Koreatown, and each thing
 * it builds dissolves a set of blocks into the grid's own points of light,
 * until Friday afternoon is empty.
 *
 * One scroll value drives all of it, P.week from choreo.ts. Every state
 * below is a pure function of that value, so scrolling back rebuilds the
 * week exactly.
 */

const BEAT_OF: Record<Kind, readonly [number, number]> = {
  gtm: BEAT.gtm,
  email: BEAT.email,
  sheet: BEAT.sheet,
  teach: BEAT.teach,
};

/* Each kind's blocks go in the order the week reads, staggered over the
 * second half of their beat, after the panel has shown what replaced them. */
const WINDOWS = (() => {
  const byKind: Record<Kind, number[]> = {
    gtm: [],
    email: [],
    sheet: [],
    teach: [],
  };
  BLOCKS.forEach((x, i) => byKind[x.kind].push(i));
  const out: [number, number][] = new Array(BLOCKS.length);
  (Object.keys(byKind) as Kind[]).forEach((k) => {
    const [a, z] = BEAT_OF[k];
    const s0 = a + (z - a) * 0.3;
    const span = (z - a) * 0.62;
    const ids = byKind[k];
    ids.forEach((id, j) => {
      const start = s0 + (span * 0.55 * j) / Math.max(1, ids.length - 1);
      out[id] = [start, start + span * 0.45];
    });
  });
  return out;
})();

/* A person types in bursts: a beat after a comma, a longer one after a
 * full stop. And they slip: "Thrusday" goes in, sits there a moment, gets
 * backspaced and fixed. The reply is a list of screen states, each with
 * the time it took to get there, and the scroll walks that list, so the
 * slip plays backward when you scroll back. */
const TYPING = (() => {
  const states: string[] = [];
  const weights: number[] = [];
  const add = (str: string, w: number) => {
    states.push(str);
    weights.push(w);
  };
  const weigh = (ch: string) =>
    ch === "," ? 4 : ch === "." || ch === "?" ? 7 : ch === " " ? 1.3 : 1;
  const fix = REPLY.indexOf("Thursday") + 2;
  for (let i = 1; i <= fix; i++) add(REPLY.slice(0, i), weigh(REPLY[i - 1]));
  const slip = "rusday";
  for (let i = 1; i <= slip.length; i++) add(REPLY.slice(0, fix) + slip.slice(0, i), 1);
  // the pause where they notice, then the backspaces
  for (let i = slip.length - 1; i >= 0; i--)
    add(REPLY.slice(0, fix) + slip.slice(0, i), i === slip.length - 1 ? 9 : 0.55);
  for (let i = fix + 1; i <= REPLY.length; i++) add(REPLY.slice(0, i), weigh(REPLY[i - 1]));
  const total = weights.reduce((x, y) => x + y, 0);
  let acc = 0;
  const at = weights.map((w) => (acc += w) / total);
  return { states, at };
})();

/* A little physics for each block as it lets go: it lifts a few pixels,
 * then falls under something like gravity, drifting and turning by its own
 * amount, so no two leave the same way. Seeded, so it's the same every load. */
const FALL = (() => {
  const r = rng(20261005);
  return BLOCKS.map(() => ({ vx: (r() - 0.5) * 22, rot: (r() - 0.5) * 14 }));
})();

/* The story, one running line at a time (RUBRIC: never title plus
 * subtitle). Windows are on the week's progress, nudged earlier by the
 * arrival so the first line is already there when the panel lands. The
 * spreadsheet beat has no words: the rows settling into cards say it. */
const LINES = [
  {
    a: -0.07,
    b: 0.11,
    size: "huge",
    text: "Say you run a dental office in Koreatown, and every hour of your week is already spoken for.",
  },
  {
    a: 0.1,
    b: 0.19,
    size: "small",
    text: "So a few of us head over from USC.",
  },
  {
    a: 0.19,
    b: 0.37,
    size: "mid",
    fly: true,
    text: "First we find who's actually worth reaching, and most of them are a few blocks away.",
  },
  {
    a: 0.38,
    b: 0.57,
    size: "small",
    text: "Then the emails you answer every single day start writing themselves.",
  },
  {
    a: 0.76,
    b: 0.92,
    size: "mid",
    text: "And we don't leave until your front desk can run all of it without us.",
  },
  {
    a: 0.9,
    b: 1.25,
    size: "huge",
    text: "So it's Friday afternoon, and there's nothing on it.",
  },
] as const;

const PANES = [
  { id: "gtm", a: -1, b: BEAT.email[0] },
  { id: "email", a: BEAT.email[0], b: BEAT.sheet[0] },
  { id: "sheet", a: BEAT.sheet[0], b: BEAT.teach[0] },
  { id: "teach", a: BEAT.teach[0], b: 2 },
] as const;

/* Where the "now" line sits: Monday 9am at the start, Friday 3pm at the end. */
const NOW_END = 4 * 8 + 6;

const setText = (el: HTMLElement | null, s: string) => {
  if (el && el.textContent !== s) el.textContent = s;
};

export default function Week() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const all = <T extends HTMLElement>(s: string) => [
      ...el.querySelectorAll<T>(s),
    ];
    const one = <T extends HTMLElement>(s: string) => el.querySelector<T>(s);

    const panel = one(".w4-panel");
    const blocks = all(".w4-blk");
    const lines = all(".w4-line");
    const panes = all(".w4-pane");
    const leads = all(".w4-lead");
    const rows = all(".w4-mail");
    const reply = one(".w4-reply-text");
    const replyTag = one(".w4-reply-tag");
    const cards = all(".w4-card");
    const stageHeads = all(".w4-col");
    const sheetName = one(".w4-sheetname");
    const steps = all(".w4-step");
    const meter = one(".w4-meter");
    const now = one(".w4-now");
    const free = one(".w4-free");
    const views = all(".xr-view");
    const lane = one(".w4-lane");
    let flyPx = 90;
    const measureLane = () => {
      // The flying line travels a fifth of its lane, so on a phone it
      // never crosses into the panel.
      flyPx = Math.min(90, (lane?.clientHeight ?? 450) * 0.2);
    };
    measureLane();

    const gone = blocks.map(() => false);
    const lastK = blocks.map(() => -1);
    let view = "";

    /* ---- the x-ray line (after Gavin's assets/xray.js) ---- */
    const body = one(".w4-body");
    const word = one<HTMLButtonElement>(".w4-xword");
    const xline = one(".xr-line");
    const grip = one(".xr-grip");
    const side = one(".xr-side");
    let split = 1;
    let glideId = 0;
    let dragging = false;
    const setSplit = (v: number) => {
      split = clamp(v);
      if (!body || !xline || !side || !grip || !word) return;
      const w = body.clientWidth;
      const on = split < 1;
      xline.style.transform = `translateX(${Math.round(split * w)}px)`;
      side.style.clipPath = `inset(0 0 0 ${(split * 100).toFixed(2)}%)`;
      // The views lay out to the width the line uncovers, so the x-ray
      // reads whole wherever the line is parked.
      side.style.setProperty("--vis", `${Math.round((1 - split) * w)}px`);
      body.classList.toggle("is-xray", on);
      word.setAttribute("aria-pressed", String(on));
      const pct = Math.round(split * 100);
      grip.setAttribute("aria-valuenow", String(pct));
      grip.setAttribute(
        "aria-valuetext",
        on ? `x-ray, ${100 - pct}% of the panel` : "parked",
      );
    };
    const glide = (to: number) => {
      cancelAnimationFrame(glideId);
      const from = split;
      const ms = to < from ? 240 : 200;
      const t0 = performance.now();
      const step = (t: number) => {
        const k = easeOut3(clamp((t - t0) / ms));
        setSplit(lerp(from, to, k));
        if (k < 1) glideId = requestAnimationFrame(step);
      };
      glideId = requestAnimationFrame(step);
    };
    // On a phone the panel is too narrow to read half of it, so the line
    // comes out further.
    const onWord = () => glide(split < 1 ? 1 : (body?.clientWidth ?? 0) < 560 ? 0.12 : 0.5);
    const onDown = (e: PointerEvent) => {
      cancelAnimationFrame(glideId);
      dragging = true;
      grip?.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || !body) return;
      const r = body.getBoundingClientRect();
      // a drag never parks it: the word, End and Escape do
      setSplit(Math.min(0.99, (e.clientX - r.left) / r.width));
    };
    const onUp = () => {
      dragging = false;
    };
    const onKey = (e: KeyboardEvent) => {
      const dir: Record<string, number> = {
        ArrowLeft: -1,
        ArrowDown: -1,
        ArrowRight: 1,
        ArrowUp: 1,
      };
      if (dir[e.key]) {
        cancelAnimationFrame(glideId);
        setSplit(Math.min(0.95, Math.round(split * 20 + dir[e.key]) / 20));
      } else if (e.key === "Home") setSplit(0);
      else if (e.key === "End" || e.key === "Escape") {
        setSplit(1);
        word?.focus();
      } else return;
      e.preventDefault();
    };
    const onResize = () => {
      setSplit(split);
      measureLane();
    };
    const offFlap = word ? attachFlap(word) : () => {};
    word?.addEventListener("click", onWord);
    grip?.addEventListener("pointerdown", onDown);
    grip?.addEventListener("pointermove", onMove);
    grip?.addEventListener("pointerup", onUp);
    grip?.addEventListener("pointercancel", onUp);
    grip?.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    setSplit(1);

    const off = onFrame(() => {
      // The arrival nudges everything a little earlier, so the panel lands
      // already reading.
      const q = P.week - (1 - P.weekIn) * 0.1;
      const p = P.week;

      // The panel condenses out of the field as the section arrives.
      if (panel) {
        const a = smooth(prog(P.weekIn, 0.25, 0.85));
        panel.style.opacity = a.toFixed(3);
        panel.style.transform = reduced
          ? ""
          : `translate3d(0, ${((1 - a) * 48).toFixed(1)}px, 0)`;
      }

      // The x-ray line parks itself when the week leaves the screen.
      if (split < 1 && (P.weekIn < 0.5 || p >= 1) && !dragging) setSplit(1);

      // Lines of the story.
      lines.forEach((ln, i) => {
        const L = LINES[i];
        const t = (q - L.a) / (L.b - L.a);
        const inn = smooth(prog(t, 0, 0.2));
        const out = smooth(prog(t, 0.8, 1));
        const o = inn * (1 - out);
        ln.style.opacity = o.toFixed(3);
        ln.style.visibility = o > 0.002 ? "visible" : "hidden";
        if (reduced) return;
        const fly = "fly" in L && L.fly;
        const dy = fly
          ? lerp(flyPx, -flyPx, clamp(t))
          : (1 - inn) * 24 - out * 24 - (clamp(t) - 0.5) * 14;
        ln.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
      });

      // The side panes crossfade, one per beat.
      panes.forEach((pane, i) => {
        const W = PANES[i];
        const o =
          smooth(prog(p, W.a - 0.012, W.a + 0.012)) *
          (1 - smooth(prog(p, W.b - 0.012, W.b + 0.012)));
        pane.style.opacity = o.toFixed(3);
        pane.style.visibility = o > 0.002 ? "visible" : "hidden";
      });

      // Finding customers: the list builds as the map lights them up.
      leads.forEach((li, j) => {
        const k = easeOut3(
          prog(
            p,
            BEAT.gtm[0] + 0.012 + j * 0.016,
            BEAT.gtm[0] + 0.04 + j * 0.016,
          ),
        );
        li.style.opacity = k.toFixed(3);
        li.style.transform = reduced
          ? ""
          : `translate3d(${((1 - k) * 12).toFixed(1)}px, 0, 0)`;
      });

      // The emails: a reply drafts itself at a person's pace.
      const typed = prog(p, BEAT.email[0] + 0.01, BEAT.email[0] + 0.1);
      let n = 0;
      while (n < TYPING.at.length && TYPING.at[n] <= typed) n++;
      const last = n >= TYPING.states.length;
      setText(reply, n > 0 ? TYPING.states[n - 1] : "");
      reply?.parentElement?.classList.toggle("is-typing", n > 0 && !last);
      setText(
        replyTag,
        last ? "Draft ready. A person sends it." : n > 0 ? "Drafting" : "New",
      );
      rows.forEach((r, j) => {
        const ready = p > BEAT.email[0] + 0.1 + j * 0.02;
        const tag = r.querySelector<HTMLElement>(".w4-mail-tag");
        setText(
          tag,
          ready
            ? "draft ready"
            : p > BEAT.email[0] + 0.01
              ? "drafting"
              : "unread",
        );
        r.classList.toggle("is-ready", ready);
      });

      // The spreadsheet: rows settle into CRM cards. No words on this one.
      const colsIn = smooth(
        prog(p, BEAT.sheet[0] + 0.04, BEAT.sheet[0] + 0.08),
      );
      stageHeads.forEach((h) => (h.style.opacity = colsIn.toFixed(3)));
      if (sheetName) sheetName.style.opacity = (1 - colsIn).toFixed(3);
      const perCol = [0, 0, 0];
      cards.forEach((c, j) => {
        const L = LEADS[j];
        const k = easeInOut3(
          prog(
            p,
            BEAT.sheet[0] + 0.01 + j * 0.01,
            BEAT.sheet[0] + 0.06 + j * 0.01,
          ),
        );
        const row = perCol[L.stage]++;
        const left = lerp(0, L.stage * 33.333, k);
        const width = lerp(100, 33.333, k);
        const top = lerp(26 + j * 26, 26 + row * 56, k);
        const h = lerp(24, 50, k);
        c.style.left = `${left.toFixed(3)}%`;
        c.style.width = `${width.toFixed(3)}%`;
        c.style.top = `${top.toFixed(1)}px`;
        c.style.height = `${h.toFixed(1)}px`;
        c.classList.toggle("is-card", k > 0.5);
      });

      // Teaching the staff: the lesson checks off.
      steps.forEach((s, j) => {
        s.classList.toggle("is-done", p > BEAT.teach[0] + 0.03 + j * 0.03);
      });

      // Blocks dissolve into points. When one lets go going forward, the
      // field gets a burst in the same place, so the light the block turns
      // into is the grid's own.
      let left = 0;
      blocks.forEach((blk, i) => {
        const [a, z] = WINDOWS[i];
        const k = smooth(prog(q, a, z));
        left += BLOCKS[i].hours * (1 - k);
        if (Math.abs(k - lastK[i]) < 0.001) return;
        lastK[i] = k;
        blk.style.setProperty("--k", k.toFixed(3));
        blk.classList.toggle("is-going", k > 0 && k < 1);
        blk.classList.toggle("is-gone", k >= 1);
        if (k > 0.5 && !gone[i]) {
          gone[i] = true;
          if (!reduced) {
            const r = blk.getBoundingClientRect();
            store.bursts.push({
              x: r.left,
              y: r.top,
              w: r.width,
              h: r.height,
              t0: performance.now(),
            });
          }
        } else if (k < 0.15) gone[i] = false;
      });
      const hrs = Math.round(left);
      setText(
        meter,
        hrs === 0
          ? "0 hrs of busywork left"
          : `${hrs} of ${TOTAL_HOURS} hrs are busywork`,
      );

      // Time passes as the week clears.
      if (now) {
        const H = lerp(0, NOW_END, prog(p, 0.02, 0.96));
        const d = Math.min(4, Math.floor(H / 8));
        now.style.setProperty("--d", String(d));
        now.style.setProperty("--h", (H - d * 8).toFixed(3));
        now.style.opacity = smooth(prog(P.weekIn, 0.7, 1)).toFixed(3);
      }
      if (free)
        free.style.opacity = smooth(
          prog(p, BEAT.end[0], BEAT.end[0] + 0.04),
        ).toFixed(3);

      // The x-ray shows the beat on screen.
      const b = beatAt(p);
      const v =
        b === "travel" || b === "intro" ? "intro" : b === "end" ? "teach" : b;
      if (v !== view) {
        view = v;
        views.forEach((x) => x.classList.toggle("is-on", x.dataset.view === v));
      }
    });

    return () => {
      off();
      offFlap();
      cancelAnimationFrame(glideId);
      word?.removeEventListener("click", onWord);
      grip?.removeEventListener("pointerdown", onDown);
      grip?.removeEventListener("pointermove", onMove);
      grip?.removeEventListener("pointerup", onUp);
      grip?.removeEventListener("pointercancel", onUp);
      grip?.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={root} id="v4-week" className="w4" aria-labelledby="w4-title">
      <div className="w4-stage">
        <div className="w4-lane">
          {LINES.map((l) => (
            <p key={l.text} className={`w4-line is-${l.size}`}>
              {l.text}
            </p>
          ))}
        </div>

        <div className="w4-panel">
          <header className="w4-head">
            <h2 id="w4-title" className="w4-title">
              A dental office in Koreatown, for example
            </h2>
            <span className="w4-meter">
              {TOTAL_HOURS} of {TOTAL_HOURS} hrs are busywork
            </span>
            <button
              type="button"
              className="w4-xword"
              aria-pressed="false"
              aria-controls="w4-xray"
            >
              x-ray
            </button>
          </header>

          <div className="w4-body">
            <div
              className="w4-cal"
              aria-label="The front desk's week, Monday to Friday, 9 to 5"
            >
              {DAYS.map((d, i) => (
                <span key={d} className="w4-day" style={{ gridColumn: i + 2 }}>
                  {d}
                </span>
              ))}
              {HOURS.map((h, i) => (
                <span key={h} className="w4-hr" style={{ gridRow: i + 2 }}>
                  {h}
                </span>
              ))}
              {BLOCKS.map((x, i) => (
                <div
                  key={i}
                  className={`w4-blk is-${x.kind}`}
                  style={{
                    gridColumn: x.day + 2,
                    gridRow: `${x.start + 2} / span ${x.hours}`,
                    ["--vx" as string]: FALL[i].vx.toFixed(1),
                    ["--rot" as string]: FALL[i].rot.toFixed(1),
                  }}
                >
                  <span>{x.label}</span>
                </div>
              ))}
              <div
                className="w4-free"
                style={{ gridColumn: 6, gridRow: "7 / span 3" }}
              >
                <span>Free</span>
              </div>
              <div className="w4-now" aria-hidden="true" />
            </div>

            <div className="w4-side">
              <div className="w4-pane" data-pane="gtm">
                <p className="w4-pane-head">Worth reaching, near you</p>
                <ul className="w4-leads">
                  {LEADS.map((l) => (
                    <li key={l.who} className="w4-lead">
                      <i aria-hidden="true" />
                      <span>
                        {l.who}, {l.where}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w4-pane" data-pane="email">
                <ul className="w4-inbox">
                  {INBOX.map((m) => (
                    <li key={m.subject} className="w4-mail">
                      <span className="w4-mail-subj">{m.subject}</span>
                      <span className="w4-mail-tag">unread</span>
                    </li>
                  ))}
                </ul>
                <div className="w4-thread">
                  <p className="w4-ask">{ASK}</p>
                  <div className="w4-reply">
                    <span className="w4-reply-tag">New</span>
                    <p>
                      <span className="w4-reply-text" />
                      <span className="w4-caret" aria-hidden="true" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="w4-pane" data-pane="sheet">
                <div className="w4-crm">
                  <span className="w4-sheetname">leads_FINAL_v3.xlsx</span>
                  {STAGES.map((s, i) => (
                    <span
                      key={s}
                      className="w4-col"
                      style={{ left: `${i * 33.333}%` }}
                    >
                      {s}
                    </span>
                  ))}
                  {LEADS.map((l) => (
                    <div key={l.who} className="w4-card">
                      <b>{l.who}</b>
                      <span>{l.person}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w4-pane" data-pane="teach">
                <p className="w4-pane-head">
                  Lesson for the front desk, 20 min
                </p>
                <ol className="w4-steps">
                  {LESSON.map((s) => (
                    <li key={s} className="w4-step">
                      <i aria-hidden="true" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div id="w4-xray" className="xr-side" aria-label="How it's built">
              <XrayViews />
            </div>
            <div className="xr-line">
              <div
                className="xr-grip"
                role="slider"
                tabIndex={0}
                aria-label="X-ray line"
                aria-orientation="horizontal"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={100}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
