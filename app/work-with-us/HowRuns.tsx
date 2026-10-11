"use client";

import Link from "next/link";
import { useRef } from "react";
import { usePin } from "@/components/tts/usePin";

/*
 * 04, how it runs (Caleb, 2026-10-10: a pale card floating left and a plain
 * three-step list on white). One pinned band: USC's point travels the three
 * steps across the top, and the panel under it shows what the owner has in
 * hand at each one. The call as a slot on their week, the build as their
 * own tool with the automation in it, the handover as the doc and the
 * session their team gets. The steps' words are the ones this page always
 * used; the handover's lines are /way's lesson plan (weekData.ts).
 */
const STEPS = [
  {
    n: "01",
    title: "A 30-minute call",
    line: "Tell us what's eating your team's time.",
  },
  {
    n: "02",
    title: "We build it in your tools",
    line: "Wherever you are, in the software you already use.",
  },
  {
    n: "03",
    title: "We hand it to your team",
    line: "We teach your team to run it.",
  },
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const FLOW = ["A form comes in", "AI drafts a reply", "It lands in your CRM"];
const HANDOVER = [
  "How to run it",
  "What it should never do on its own",
  "Where every part lives",
];

const N = STEPS.length;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const prog = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);

function draw(p: number, el: HTMLElement) {
  const s = Math.min(N - 0.0001, p * N);
  const on = Math.floor(s);
  const t = s - on;

  el.querySelectorAll<HTMLElement>(".hr-steps li").forEach((li, i) => {
    li.dataset.state = i < on ? "done" : i === on ? "on" : "next";
  });
  // The point rides the line from the first dot to the last, reaching each
  // step halfway through its third of the scroll.
  const head = el.querySelector<HTMLElement>(".hr-head");
  const dots = [...el.querySelectorAll<SVGSVGElement>(".hr-dot")];
  const box = head?.parentElement?.getBoundingClientRect();
  if (head && box && dots.length === N) {
    const x = (i: number) => dots[i].getBoundingClientRect().left - box.left;
    const at = Math.min(N - 1, Math.max(0, s - 0.5));
    const a = Math.min(N - 2, Math.floor(at));
    const f = smooth(at - a);
    head.style.transform = `translate3d(${(x(a) + (x(a + 1) - x(a)) * f).toFixed(1)}px, 0, 0)`;
  }

  el.querySelectorAll<HTMLElement>(".hr-art").forEach((art, i) => {
    const o =
      i === on
        ? (i === 0 ? 1 : smooth(prog(t, 0, 0.1))) *
          (i === N - 1 ? 1 : 1 - smooth(prog(t, 0.9, 1)))
        : 0;
    art.style.opacity = o.toFixed(3);
    art.style.visibility = o > 0.01 ? "visible" : "hidden";
    art.style.setProperty("--t", (i === on ? t : i < on ? 1 : 0).toFixed(3));
    // Each artifact settles into place over the first part of its third.
    art.dataset.done = String(
      i < on || (i === on && t > 0.35) || el.dataset.reduced === "1",
    );
    art.querySelectorAll<HTMLElement>("[data-k]").forEach((r) => {
      const k = Number(r.dataset.k);
      r.dataset.in = String(
        el.dataset.reduced === "1" ||
          i < on ||
          (i === on && t > 0.05 + k * 0.15),
      );
    });
  });
}

export default function HowRuns() {
  const ref = useRef<HTMLElement>(null);
  usePin(ref, draw);

  return (
    <section ref={ref} className="hr" aria-labelledby="co-how-h">
      <div className="hr-band">
        <div className="co-wrap hr-in">
          <div className="hr-top">
            <div>
              <p className="co-mark">
                <span className="co-n">04</span> how it runs
              </p>
              <h2 id="co-how-h" className="hr-h">
                From one call <em>to a handover.</em>
              </h2>
            </div>
            <Link href="/way" className="co-way">
              Follow one project, start to finish, in 3D{" "}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="hr-steps">
            <span className="hr-line" aria-hidden="true" />
            <span className="hr-head" aria-hidden="true" />
            <ol>
              {STEPS.map((st, i) => (
                <li key={st.n} data-state={i === 0 ? "on" : "next"}>
                  <svg
                    className="hr-dot"
                    viewBox="0 0 14 14"
                    aria-hidden="true"
                  >
                    <circle cx="7" cy="7" r="6" />
                  </svg>
                  <span className="co-n">{st.n}</span>
                  <b>{st.title}</b>
                  <span className="hr-line-t">{st.line}</span>
                </li>
              ))}
            </ol>
          </div>

          <figure
            className="hr-panel"
            aria-label="What you have in hand at each step"
          >
            {/* 1. The call: one slot on your week. */}
            <div className="hr-art is-cal">
              <div className="hr-cal">
                <span className="hr-cal-corner" />
                {DAYS.map((d) => (
                  <span key={d} className="hr-cal-day">
                    {d}
                  </span>
                ))}
                {["9:00", "10:00", "11:00", "12:00"].map((h) => (
                  <span key={h} className="hr-cal-row">
                    <span className="hr-cal-hour">{h}</span>
                    {DAYS.map((d) => (
                      <span key={d} className="hr-cal-cell" />
                    ))}
                  </span>
                ))}
                <span className="hr-slot">
                  <b>30 min with Caleb</b>
                  <span>booked on Calendly</span>
                </span>
              </div>
            </div>

            {/* 2. The build: your own tool, with the automation in it. */}
            <div className="hr-art is-tool">
              <div className="hr-win">
                <span className="hr-win-bar">
                  <i />
                  <i />
                  <i />
                  your tools, as they are
                </span>
                <ol className="hr-flow">
                  {FLOW.map((f, k) => (
                    <li key={f} data-k={k} data-in="false">
                      <span className="co-n">
                        {String(k + 1).padStart(2, "0")}
                      </span>
                      {f}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* 3. The handover: the doc, and the session for the team. */}
            <div className="hr-art is-hand">
              <div className="hr-doc">
                <span className="hr-doc-h">Handover</span>
                <ul>
                  {HANDOVER.map((h, k) => (
                    <li key={h} data-k={k} data-in="false">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="hr-session" data-k="3" data-in="false">
                <b>Training session</b>
                <span>the whole team, on their own work</span>
              </span>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
