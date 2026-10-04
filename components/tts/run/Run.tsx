"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { runPipeline, type RunResult, type StageResult } from "./pipeline";
import { DATASET_URL, loadDataset } from "./data";

const STAGE_COPY: Record<
  StageResult["id"],
  { name: string; rule: string; skipped?: string; unit: string }
> = {
  enumerate: {
    name: "Enumerate the portfolio",
    rule: "Every company listed on a venture fund's public portfolio job board.",
    unit: "companies",
  },
  pull: {
    name: "Pull every open role",
    rule: "Each company's open postings, exactly as the board listed them that day.",
    unit: "roles",
  },
  verify: {
    name: "Verify the feed",
    rule: "Any company holding more than a fifth of all listings gets opened by hand. If most of its listings name a different company, the whole feed is set aside.",
    skipped: "Skipped. Every listing is taken at face value.",
    unit: "roles kept",
  },
  rank: {
    name: "Rank who is hiring hardest",
    rule: "Companies by open roles. The count is the leader's.",
    unit: "at the top",
  },
  shortlist: {
    name: "Shortlist what a student team can deliver",
    rule: "Marketing ops, CRM, data, automation, outbound, partnerships, research and community work. Nothing clinical, nothing on site, no hard engineering. Longest open first.",
    unit: "roles",
  },
};

// Each stage holds at least this long so a reader can follow which one is
// working. Five stages land the whole run near 1.9s, inside the 2.4s budget
// in DESIGN-tts.md. The compute itself takes well under a millisecond.
const STAGE_MS = 340;
// Counter updates per second while a stage steps toward its result.
const FPS = 24;

type Shown = {
  counts: (number | null)[];
  ms: (number | null)[];
  active: number;
  live: boolean;
};

const fmtMs = (ms: number) =>
  ms < 0.01 ? "under 0.01 ms" : `${ms.toFixed(2)} ms`;
const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

export default function Run({ initial }: { initial: RunResult }) {
  const [verify, setVerify] = useState(true);
  const [result, setResult] = useState<RunResult>(initial);
  const [shown, setShown] = useState<Shown>({
    counts: initial.stages.map((s) => s.count),
    ms: initial.stages.map(() => null),
    active: -1,
    live: false,
  });
  const [fetchMs, setFetchMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useRef(0);
  const exhibit = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const go = useCallback(async (withVerify: boolean) => {
    const id = ++token.current;
    setRunning(true);
    setError(null);
    let loaded;
    try {
      loaded = await loadDataset();
    } catch {
      if (id === token.current) {
        setError(
          "The dataset did not load, so nothing ran. Check your connection and press Run again.",
        );
        setRunning(false);
      }
      return;
    }
    if (id !== token.current) return;
    setFetchMs(loaded.ms);
    const full = runPipeline(loaded.data, withVerify);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduce) {
      setShown({
        counts: full.stages.map((s) => s.count),
        ms: full.stages.map((s) => s.ms),
        active: -1,
        live: true,
      });
      setResult(full);
      setRunning(false);
      return;
    }

    const counts: (number | null)[] = full.stages.map(() => null);
    const ms: (number | null)[] = full.stages.map(() => null);
    setShown({ counts: [...counts], ms: [...ms], active: 0, live: true });

    let from = 0;
    for (let i = 0; i < full.stages.length; i++) {
      const to = full.stages[i].count;
      const steps = Math.max(1, Math.round((STAGE_MS / 1000) * FPS));
      for (let k = 1; k <= steps; k++) {
        await sleep(STAGE_MS / steps);
        if (id !== token.current) return;
        counts[i] = Math.round(from + ((to - from) * k) / steps);
        setShown({ counts: [...counts], ms: [...ms], active: i, live: true });
      }
      ms[i] = full.stages[i].ms;
      from = to;
      setShown({ counts: [...counts], ms: [...ms], active: i, live: true });
    }
    if (id !== token.current) return;
    setShown({ counts: [...counts], ms: [...ms], active: -1, live: true });
    setResult(full);
    setRunning(false);
  }, []);

  // The run starts by itself once the exhibit is half in view, once.
  useEffect(() => {
    const el = exhibit.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          void go(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [go]);

  const toggle = () => {
    const next = !verify;
    setVerify(next);
    started.current = true;
    void go(next);
  };

  const max = Math.max(...result.ranking.map((r) => r.open), 1);
  const live = shown.live;
  const L = (on: boolean) => (on ? "live" : undefined);
  const kept = result.stages[2].count;

  return (
    <div className="exhibit" ref={exhibit}>
      <div className="run">
        <div className="run-bar">
          <p className="label" aria-live="polite">
            {running
              ? "Running in your browser"
              : live
                ? `Ran in your browser${fetchMs !== null ? `, dataset fetched in ${Math.round(fetchMs)} ms` : ""}`
                : "Result from the last run. It runs again in your browser when you scroll here."}
          </p>
          <div className="run-controls">
            <button
              type="button"
              role="switch"
              aria-checked={verify}
              className="switch"
              onClick={toggle}
            >
              <span className="switch-box" aria-hidden="true" />
              Verify step {verify ? "on" : "off"}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void go(verify)}
              disabled={running}
            >
              {running ? "Running" : "Run again"}
            </button>
          </div>
        </div>

        {error && (
          <p className="form-alert mt-s" role="alert">
            {error}
          </p>
        )}

        <ol className="stages">
          {result.stages.map((s, i) => {
            const copy = STAGE_COPY[s.id];
            const count = shown.counts[i];
            const state =
              shown.active === i
                ? "is-active"
                : shown.active === -1 || i < shown.active
                  ? "is-done"
                  : "is-pending";
            const skipped = s.id === "verify" && !result.verified && !running;
            return (
              <li key={s.id} className={`stage ${state}`}>
                <span className="stage-name">{copy.name}</span>
                <span className="stage-rule">
                  {skipped || (s.id === "verify" && !verify)
                    ? copy.skipped
                    : copy.rule}
                </span>
                <span className="stage-out">
                  <span
                    className={`stage-count ${L(live && count !== null) ?? ""}`}
                  >
                    {count ?? " "}
                  </span>
                  <span className="stage-ms label">
                    {copy.unit}
                    {shown.ms[i] !== null && shown.ms[i] !== undefined
                      ? `, ${fmtMs(shown.ms[i] as number)}`
                      : ""}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="run-out">
          <div>
            <h3 className="t-h3">Who is hiring hardest</h3>
            <ul className="bars">
              {result.ranking.map((r, i) => (
                <li key={`${r.company}-${result.verified}`} className="bar-row">
                  <span className="bar-label">
                    {i + 1}. {r.sector ? `A company in ${r.sector}` : "A company"}
                    {r.flagged && !result.verified
                      ? ", the feed the check sets aside"
                      : ""}
                  </span>
                  <svg className="bar-track" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true">
                    <rect
                      x="0"
                      y="0"
                      height="14"
                      width={(100 * r.open) / max}
                      className={r.flagged && !result.verified ? "bar is-false" : "bar"}
                    />
                  </svg>
                  <span className={`fig bar-n ${L(live) ?? ""}`}>{r.open}</span>
                </li>
              ))}
            </ul>
            {result.verified && result.setAside ? (
              <p className="run-note">
                The check set aside one feed:{" "}
                <span className={L(live)}>{result.setAside.listings}</span>{" "}
                listings, and{" "}
                <span className={L(live)}>{result.setAside.namingOthers}</span>{" "}
                of them name a different company in the title. It was another
                board pointed at the wrong company. Turn the verify step off to
                see what it would have done to this list.
              </p>
            ) : (
              <p className="run-note">
                Without the check, that feed takes first place with{" "}
                <span className={L(live)}>{result.ranking[0]?.open}</span>{" "}
                roles. That was the number about to lead the list on 2026-09-15,
                and it was misattributed: those listings belonged to another
                board. The check caught it before anyone pitched on it.
              </p>
            )}
          </div>

          <div>
            <h3 className="t-h3">The shortlist, longest open first</h3>
            <table className="ledger">
              <thead>
                <tr>
                  <th scope="col">Role, as posted</th>
                  <th scope="col" className="num">
                    Days open
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.shortlist.map((r) => (
                  <tr key={`${r.title}-${r.days}`}>
                    <td>
                      {r.title}
                      <span className="sub">{r.sector}</span>
                    </td>
                    <td className={`num ${L(live) ?? ""}`}>{r.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="label mt-s">
              Showing {result.shortlist.length} of{" "}
              <span className={L(live)}>{result.shortlistTotal}</span>.{" "}
              <span className={L(live)}>{result.longOpen}</span> of the{" "}
              <span className={L(live)}>{kept}</span> roles kept had been open
              more than 90 days, past any normal hiring cycle.
            </p>
          </div>
        </div>
      </div>
      <div className="exhibit-caption label">
        <span>
          Exhibit 1. A venture fund&apos;s public portfolio job board, pulled
          2026-09-15. Company and fund names withheld; titles as posted.
        </span>
        <span>
          Runs on your machine and sends nothing.{" "}
          <a className="link" href={DATASET_URL} download>
            Download the dataset
          </a>
        </span>
      </div>
    </div>
  );
}
