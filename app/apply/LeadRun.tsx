"use client";

import { useRef } from "react";
import { DRAFT, PROMPT, QUALIFY } from "@/components/tts/v4/weekData";
import { usePin } from "@/components/tts/usePin";

/*
 * 02, what you'd build (Caleb, 2026-10-10, on the static three-row table
 * this replaces: "Terrible storytelling and use of space"). One pinned band
 * the size of the screen, and the build happens in it as you scroll: /way's
 * example project, a nonprofit in Ghana that needs donor outreach. Funders
 * arrive one at a time with the reason each is worth reaching, one is
 * dropped for being closed to new applicants (the qualifying rule in
 * weekData.ts), then the first row opens into its email and the draft
 * writes itself, the same draft /way's x-ray shows. Labelled an example.
 * Reduced motion shows the finished list with the draft open.
 */
const LEADS = [
  {
    biz: "Family foundation, London",
    why: "New West Africa education fund",
    keep: true,
  },
  { biz: "Corporate giving arm, Accra", why: "New Accra office", keep: true },
  {
    biz: "Education trust",
    why: "Closed to new applicants this year",
    keep: false,
  },
  {
    biz: "Diaspora giving circle, Houston",
    why: "Members from the region",
    keep: true,
  },
];
const KEPT = LEADS.filter((l) => l.keep).length;
// The rule the member teaches the AI, and the rules its draft follows, both
// from /way's x-ray (weekData.ts).
const RULE = QUALIFY.filter(([k]) => k === "reads" || k === "keep" || k === "drop");
const DRAFT_RULES = PROMPT.filter(([k]) => k === "rule");

const BEATS = [
  "finding funders",
  "keeping who's worth reaching",
  "drafting the first email",
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const prog = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);

function draw(q: number, el: HTMLElement) {
  const reduced = el.dataset.reduced === "1";
  // Rows arrive one at a time, each with its reason.
  const rows = [...el.querySelectorAll<HTMLElement>(".jo-lead")];
  const open = reduced ? 1 : smooth(prog(q, 0.5, 0.6));
  rows.forEach((r, i) => {
    const a = smooth(prog(q, 0.04 + i * 0.1, 0.12 + i * 0.1));
    // Every row but the first folds away as the first opens.
    const fold = i === 0 || reduced ? 0 : open;
    const o = a * (1 - fold);
    r.style.opacity = o.toFixed(3);
    r.style.visibility = o > 0.01 ? "visible" : "hidden";
    r.style.transform = `translate3d(0, ${((1 - a) * 14).toFixed(1)}px, 0)`;
    r.style.setProperty("--fold", fold.toFixed(3));
    if (!LEADS[i].keep) r.dataset.dropped = String(q > 0.07 + i * 0.1 + 0.12);
  });

  // The first row opens into its email, and the draft writes itself.
  const mail = el.querySelector<HTMLElement>(".jo-mail");
  const body = el.querySelector<HTMLElement>(".jo-mail-body");
  const text = el.querySelector<HTMLElement>(".jo-mail-text");
  const typed = reduced ? 1 : prog(q, 0.6, 0.9);
  if (mail) {
    mail.style.setProperty("--open", open.toFixed(3));
    mail.style.opacity = smooth(prog(open, 0.3, 1)).toFixed(3);
    mail.style.visibility = open > 0.01 ? "visible" : "hidden";
  }
  if (body && text) {
    const n = Math.round(DRAFT.length * typed);
    const shown = DRAFT.slice(0, n);
    if (body.dataset.n !== String(n)) {
      body.dataset.n = String(n);
      text.textContent = shown;
    }
    body.dataset.typing = String(typed > 0 && typed < 1);
    el.dataset.drafted = String(typed >= 1);
  }
  const first = rows[0];
  if (first) {
    first.dataset.st =
      typed >= 1 ? "drafted" : open > 0.5 ? "drafting" : "keep";
  }
  el.querySelectorAll<HTMLElement>(".jo-lead-st").forEach((s, i) => {
    if (i !== 0) return;
    s.textContent =
      typed >= 1 ? "drafted" : open > 0.5 ? "drafting" : "worth reaching";
  });

  // The bar names the step; the beats beside the headline follow it.
  const beat = q < 0.46 ? 0 : q < 0.55 ? 1 : 2;
  const bar = el.querySelector<HTMLElement>(".jo-run-st");
  if (bar) {
    const t =
      reduced || typed >= 1
        ? "1 draft, for a person to send"
        : q < 0.44
          ? "reading funders' sites"
          : q < 0.55
            ? `${KEPT} worth reaching, ${LEADS.length - KEPT} dropped`
            : "drafting the first email";
    if (bar.textContent !== t) bar.textContent = t;
  }
  el.querySelectorAll<HTMLElement>(".jo-beats li").forEach((b, i) => {
    b.dataset.state = reduced || i < beat ? "done" : i === beat ? "on" : "next";
  });
  el.style.setProperty("--q", q.toFixed(4));
  el.style.setProperty("--open", open.toFixed(3));
}

export default function LeadRun() {
  const ref = useRef<HTMLElement>(null);
  usePin(ref, draw);

  return (
    <section
      ref={ref}
      className="jo-pin jo-pin-build"
      aria-labelledby="jo-build-h"
    >
      <div className="jo-band is-paper">
        <div className="jo-wrap jo-build-grid">
          <figure
            className="jo-run"
            aria-label="An example build: a funder list for a nonprofit in Ghana, then the first email drafted"
          >
            <div className="jo-run-bar">
              <span>for a nonprofit in Ghana</span>
              <span className="jo-run-st">reading funders&apos; sites</span>
            </div>
            <div className="jo-run-body">
            <ul className="jo-leads">
              {LEADS.map((l, i) => (
                <li
                  key={l.biz}
                  className="jo-lead"
                  data-keep={String(l.keep)}
                  data-dropped="false"
                >
                  <div className="jo-lead-row">
                    <span className="jo-lead-biz">{l.biz}</span>
                    <span className="jo-lead-why">{l.why}</span>
                    <span className="jo-lead-st">
                      {l.keep ? "worth reaching" : "dropped"}
                    </span>
                  </div>
                  {i === 0 && (
                    <div className="jo-mail">
                      <div className="jo-mail-in">
                        <p className="jo-mail-h">
                          <span>re: {l.why}</span>
                        </p>
                        <p
                          className="jo-mail-body"
                          data-n="0"
                          data-typing="false"
                        >
                          <span className="jo-mail-text" />
                          <span className="jo-caret" aria-hidden="true" />
                        </p>
                        <ul className="jo-mail-rules">
                          {DRAFT_RULES.map(([, v]) => (
                            <li key={v}>{v}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="jo-foot">
            <ul className="jo-next" aria-hidden="true">
              {LEADS.filter((l, i) => l.keep && i > 0).map((l) => (
                <li key={l.biz}>
                  <span>next</span> {l.biz}
                </li>
              ))}
            </ul>
            <dl className="jo-rules">
              {RULE.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            </div>
            </div>
            <figcaption className="jo-cap">
              an example build, not a past client
            </figcaption>
          </figure>
          <div className="jo-build-side">
            <p className="jo-mark">
              <span className="jo-n">02</span> what you&apos;d build
            </p>
            <h2 id="jo-build-h" className="jo-h2 is-sm">
              A list of who&apos;s worth reaching,{" "}
              <em>with the first email drafted.</em>
            </h2>
            <ol className="jo-beats" aria-hidden="true">
              {BEATS.map((b, i) => (
                <li key={b} data-state={i === 0 ? "on" : "next"}>
                  <span className="jo-beat-dot" />
                  {b}
                </li>
              ))}
            </ol>
          </div>

        </div>
      </div>
    </section>
  );
}
