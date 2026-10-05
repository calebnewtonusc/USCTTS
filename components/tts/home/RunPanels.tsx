"use client";

import { useEffect, useRef, useState } from "react";
import Intake, { type IntakeRow } from "../run/Intake";
import Run from "../run/Run";
import type { RunResult } from "../run/pipeline";

/* The qualification station, run for real. The pinned crossfade is the
 * replica's (docs/waves/W3-panels.md): absolute layers in one sticky stage,
 * switched by a class with a 500ms ease-out opacity, the active step chosen by
 * an IntersectionObserver at 0.5 on the copy that scrolls past. */

// The run is the first panel, so the stage opens on the machine itself; the
// verdict stream comes last, once the reader knows what the verdicts mean.
const STEPS = [
  {
    title: "It runs on the whole board.",
    body: "On 2026-09-15 we read a venture fund's public portfolio job board as a pipeline instead of a job list, because a role that's been open for months means a company has admitted the need and still hasn't filled it.",
    panel: 0,
  },
  {
    title: "It checks the feed before it trusts it.",
    body: "One feed held a quarter of every listing, and most of those named a different company, so the check sets the whole feed aside, and if you switch the check off you'll see what would've ended up at the top.",
    panel: 0,
  },
  {
    title: "Every role gets a verdict.",
    body: "Every role ends up kept, set aside, or shortlisted as work a student team can actually deliver, like operations, data, CRM, outreach and research, with nothing clinical, nothing on site and no hard engineering.",
    panel: 1,
  },
];

export default function RunPanels({
  initialRun,
  initialIntake,
  total,
}: {
  initialRun: RunResult;
  initialIntake: IntakeRow[];
  total: number;
}) {
  const [step, setStep] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const steps = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 959px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting)
            setStep(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { threshold: 0.5 },
    );
    steps.current.forEach((s) => s && io.observe(s));
    return () => {
      io.disconnect();
      mq.removeEventListener("change", on);
    };
  }, []);

  const panel = STEPS[step].panel;
  return (
    <section className="rp" id="run" aria-labelledby="rp-title">
      <div className="rp-head">
        <p className="kicker">The qualification station, live</p>
        <h2 id="rp-title" className="t-h2">
          Run it yourself.
        </h2>
        <p className="t-lead">
          This is the same pipeline on the same data, and it&apos;s running in your
          browser right now.
        </p>
      </div>
      <div className="rp-grid">
        <div className="rp-steps">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className={i === step ? "rp-step is-on" : "rp-step"}
              data-step={i}
              ref={(n) => {
                steps.current[i] = n;
              }}
            >
              <span className="rp-n" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="t-h3">{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
        <div className={`rp-stage step-${step}`}>
          <div
            className={panel === 0 ? "rp-layer is-on" : "rp-layer"}
            inert={!narrow && panel !== 0}
          >
            <Run initial={initialRun} armed={narrow || panel === 0} />
          </div>
          <div
            className={panel === 1 ? "rp-layer is-on" : "rp-layer"}
            inert={!narrow && panel !== 1}
          >
            <Intake initial={initialIntake} total={total} />
          </div>
        </div>
      </div>
    </section>
  );
}
