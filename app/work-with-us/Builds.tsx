"use client";

import { useRef } from "react";
import { usePin } from "@/components/tts/usePin";
import { OUTLINE } from "@/components/tts/v4/weekData";

/*
 * 02, what we build (Caleb, 2026-10-10, on four pastel caption cards:
 * "Lmao boringgggg terrible storytelling"). One pinned band that steps
 * through the four builds, and each one shows its change: the before
 * (an inbox piling up, a messy sheet, tabs of searching, a staffer who
 * doesn't know where to start) turns into the after (drafts waiting for one
 * approve tap, a CRM filling itself, the list with the first email, a
 * lesson built from their own work) as the reader scrolls through its
 * quarter. The four are Caleb's own list; every vignette is an example,
 * labelled so, and the lesson is /way's (weekData.ts OUTLINE). Reduced
 * motion shows the last build's after.
 */
const KINDS = [
  {
    kind: "automations",
    problem: "The same emails, all week",
    build: "AI drafts the replies, you approve them",
  },
  {
    kind: "CRMs",
    problem: "Leads in a spreadsheet",
    build: "A CRM that fills itself in",
  },
  {
    kind: "outbound",
    problem: "Hours finding who to sell to",
    build: "A list of who's worth reaching, and the first email",
  },
  {
    kind: "training",
    problem: "Staff new to AI",
    build: "Lessons built around their own work",
  },
];

// Example messages any small business gets; none are from a client.
const MAILS = [
  {
    who: "Sam R.",
    subj: "Do you take walk-ins?",
    draft: "Hi Sam, we do, until 4pm most days.",
  },
  {
    who: "Priya D.",
    subj: "Can I get a receipt for May?",
    draft: "Hi Priya, attached is your May receipt.",
  },
  {
    who: "Leo M.",
    subj: "What are your holiday hours?",
    draft: "Hi Leo, here are this month's hours.",
  },
  {
    who: "Ana T.",
    subj: "Is there parking nearby?",
    draft: "Hi Ana, there's a lot right behind us.",
  },
];
const SHEET = [
  ["Dana K", "dana@…", "call back??"],
  ["dana k.", "", "dup?"],
  ["M. Ortiz", "(626) …", ""],
  ["", "jo@…", "met at expo"],
  ["Ortiz, M", "", "!!"],
];
const BOARD = [
  { col: 0, name: "Dana K." },
  { col: 1, name: "M. Ortiz" },
  { col: 0, name: "Jo P." },
  { col: 2, name: "Ray B." },
];
const COLS = ["new", "talking", "booked"];
const TABS = [
  "dentists near…",
  "list of clinics…",
  "who owns…",
  "clinic linkedin…",
  "new office 2026…",
];
const ACCOUNTS = [
  { who: "Dental group, Pasadena", why: "Opened a second office" },
  { who: "Physical therapy clinic", why: "Hiring a front desk" },
  { who: "Family practice, Glendale", why: "New booking site" },
];

// /way's lesson plan (weekData.ts OUTLINE), without its line about the
// Ghana example's funders, renumbered.
const LESSON = [
  OUTLINE[0],
  ...OUTLINE.slice(1, 5)
    .filter((l) => !l.includes("funder"))
    .map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s*/, "")}`),
];

const N = KINDS.length;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const prog = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);

function draw(p: number, el: HTMLElement) {
  const s = Math.min(N - 0.0001, p * N);
  const on = Math.floor(s);
  const t = s - on; // through this build's quarter
  const after = t > 0.5 || el.dataset.reduced === "1";

  el.querySelectorAll<HTMLElement>(".bw-kinds li").forEach((li, i) => {
    li.dataset.state = i < on ? "done" : i === on ? "on" : "next";
  });
  // The point rides the line between the dots, measured, reaching each
  // build halfway through its quarter.
  const head = el.querySelector<HTMLElement>(".bw-head");
  const dots = [...el.querySelectorAll<SVGSVGElement>(".bw-dot")];
  const box = head?.parentElement?.getBoundingClientRect();
  if (head && box && dots.length === N) {
    const at = Math.min(N - 1, Math.max(0, s - 0.5));
    const a = Math.min(N - 2, Math.floor(at));
    const f = smooth(at - a);
    const pt = (i: number) => {
      const r = dots[i].getBoundingClientRect();
      return { x: r.left - box.left, y: r.top - box.top };
    };
    const A = pt(a);
    const B = pt(a + 1);
    head.style.transform = `translate3d(${(A.x + (B.x - A.x) * f).toFixed(1)}px, ${(A.y + (B.y - A.y) * f).toFixed(1)}px, 0)`;
  }

  el.querySelectorAll<HTMLElement>(".bw-scene").forEach((sc, i) => {
    // Only this build's scene shows; it fades in at the start of its
    // quarter (the first is already up) and out at the end (the last stays).
    const shown =
      i === on
        ? (i === 0 ? 1 : smooth(prog(t, 0, 0.08))) *
          (i === N - 1 ? 1 : 1 - smooth(prog(t, 0.92, 1)))
        : 0;
    sc.style.opacity = shown.toFixed(3);
    sc.style.visibility = shown > 0.01 ? "visible" : "hidden";
    sc.dataset.state = i === on && after ? "after" : "before";
    // The before piles up across the first half of the quarter.
    const pile = i === on ? prog(t, 0.02, 0.42) : 1;
    sc.querySelectorAll<HTMLElement>("[data-pile]").forEach((r) => {
      r.dataset.in = String(pile * 4 >= Number(r.dataset.pile));
    });
    // The after's one tap: the first draft gets approved late in the quarter.
    sc.dataset.tap = String(i === on && t > 0.78);
  });

  el.querySelectorAll<HTMLElement>(".bw-cap").forEach((c, i) => {
    c.dataset.on = String(i === on);
    c.dataset.state = i === on && after ? "after" : "before";
  });
  const st = el.querySelector<HTMLElement>(".bw-state");
  if (st) {
    const txt = after ? "after" : "before";
    if (st.textContent !== txt) st.textContent = txt;
    st.dataset.state = txt;
  }
}

export default function Builds() {
  const ref = useRef<HTMLElement>(null);
  usePin(ref, draw);

  return (
    <section ref={ref} className="bw" aria-labelledby="co-build-h">
      <div className="bw-band">
        <div className="co-wrap bw-grid">
          <div className="bw-side">
            <p className="co-mark">
              <span className="co-n">02</span> what we build
            </p>
            <h2 id="co-build-h" className="bw-h">
              Four jobs eating your week,{" "}
              <em>and what we build for each.</em>
            </h2>
            <div className="bw-kinds">
              <span className="bw-line" aria-hidden="true" />
              <span className="bw-head" aria-hidden="true" />
              <ol>
                {KINDS.map((k, i) => (
                  <li key={k.kind} data-state={i === 0 ? "on" : "next"}>
                    <svg
                      className="bw-dot"
                      viewBox="0 0 14 14"
                      aria-hidden="true"
                    >
                      <circle cx="7" cy="7" r="6" />
                    </svg>
                    <b>{k.kind}</b>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <figure
            className="bw-panel"
            aria-label="Each build, before and after, as an example"
          >
            <div className="bw-bar">
              <span className="bw-state" data-state="before">
                before
              </span>
              <span>examples of the work, not past clients</span>
            </div>

            <div className="bw-stage">
              {/* 1. automations: an inbox piling up, then every message has a
               * draft waiting for one approve tap. */}
              <div className="bw-scene is-mail" data-state="before">
                <ul className="bw-mail">
                  {MAILS.map((m, i) => (
                    <li key={m.who} data-pile={i} data-in="false">
                      <span className="bw-mail-dot" aria-hidden="true" />
                      <span className="bw-mail-who">{m.who}</span>
                      <span className="bw-mail-subj">{m.subj}</span>
                      <span className="bw-mail-draft">
                        <i>draft</i> {m.draft}
                      </span>
                      <span className="bw-approve">
                        {i === 0 ? <span className="bw-sent">sent</span> : null}
                        approve
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. CRMs: a messy sheet, then a board that fills itself. */}
              <div className="bw-scene is-crm" data-state="before">
                <div className="bw-sheet" aria-hidden="true">
                  {SHEET.map((r, i) => (
                    <div
                      key={i}
                      className="bw-sheet-row"
                      data-pile={i}
                      data-in="false"
                    >
                      {r.map((c, j) => (
                        <span key={j}>{c}</span>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="bw-board">
                  {COLS.map((c, ci) => (
                    <div key={c} className="bw-col">
                      <span className="bw-col-h">{c}</span>
                      {BOARD.filter((b) => b.col === ci).map((b) => (
                        <span key={b.name} className="bw-card">
                          {b.name}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. outbound: tabs of searching, then the list and the
               * first email. */}
              <div className="bw-scene is-out" data-state="before">
                <div className="bw-tabs" aria-hidden="true">
                  {TABS.map((tb, i) => (
                    <span key={tb} data-pile={i} data-in="false">
                      {tb}
                    </span>
                  ))}
                </div>
                <ul className="bw-accts">
                  {ACCOUNTS.map((a) => (
                    <li key={a.who}>
                      <span className="bw-acct-who">{a.who}</span>
                      <span className="bw-acct-why">{a.why}</span>
                      <span className="bw-acct-st">first email drafted</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. training: a staffer stuck, then a lesson built from the
               * team's own drafts. */}
              <div className="bw-scene is-learn" data-state="before">
                <div className="bw-ask" aria-hidden="true">
                  <span data-pile="0" data-in="false">
                    So what do I actually do with the AI?
                  </span>
                  <span data-pile="2" data-in="false">
                    Where do the drafts even go?
                  </span>
                </div>
                <ol className="bw-lesson">
                  {LESSON.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="bw-caps">
              {KINDS.map((k, i) => (
                <p
                  key={k.kind}
                  className="bw-cap"
                  data-on={String(i === 0)}
                  data-state="before"
                >
                  <s>{k.problem}</s>
                  <b>{k.build}</b>
                </p>
              ))}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
