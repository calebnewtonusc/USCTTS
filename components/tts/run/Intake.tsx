"use client";

import { useEffect, useRef, useState } from "react";
import { audit, verdict, type Dataset } from "./pipeline";
import { loadDataset } from "./data";

export interface IntakeRow {
  n: number;
  title: string;
  sector: string;
  days: number;
  verdict: "kept" | "set aside" | "shortlisted";
  live: boolean;
}

// One role every 1.1s. Slow enough that a reader can catch a title and its
// stamp, fast enough that the panel is visibly working within a glance.
// Guessed, then checked by eye at 1440 and 390; not measured on readers.
const STEP_MS = 1100;
const VISIBLE = 8;
// Coprime with 388, so the walk visits every role once before repeating and
// the set-aside feed shows up scattered rather than as one long block.
const STRIDE = 61;

function rowFor(
  data: Dataset,
  aside: Map<number, unknown>,
  n: number,
): IntakeRow {
  const role = data.roles[(n * STRIDE) % data.roles.length];
  return {
    n,
    title: role[2],
    sector: aside.has(role[0]) ? "" : data.sectors[data.companies[role[0]][0]],
    days: role[1],
    verdict: verdict(role, aside),
    live: true,
  };
}

export default function Intake({
  initial,
  total,
}: {
  initial: IntakeRow[];
  total: number;
}) {
  const [rows, setRows] = useState<IntakeRow[]>(initial);
  const [count, setCount] = useState<{ n: number; live: boolean }>({
    n: (initial[0]?.n ?? 0) + 1,
    live: false,
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let data: Dataset | null = null;
    let aside: Map<number, unknown> = new Map();
    let n = initial[0]?.n ?? 0;
    let visible = false;
    let timer: number | undefined;
    let cancelled = false;

    const tick = () => {
      if (!data) return;
      n += 1;
      const row = rowFor(data, aside, n);
      setRows((prev) => [row, ...prev].slice(0, VISIBLE));
      setCount({ n: (n % data.roles.length) + 1, live: true });
    };
    const sync = () => {
      const run = visible && !document.hidden && data !== null;
      if (run && timer === undefined) timer = window.setInterval(tick, STEP_MS);
      if (!run && timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    if (ref.current) io.observe(ref.current);
    document.addEventListener("visibilitychange", sync);

    // Starts after the hero has printed in (load clock: 600ms).
    const start = window.setTimeout(() => {
      loadDataset()
        .then(({ data: d }) => {
          if (cancelled) return;
          data = d;
          aside = audit(d);
          sync();
        })
        .catch(() => {
          /* The still frame from the server stays up; nothing else breaks. */
        });
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(start);
      if (timer !== undefined) window.clearInterval(timer);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [initial]);

  return (
    <div className="intake" ref={ref}>
      <div className="intake-head">
        <span className="label">
          Reading the 2026-09-15 pull, one role at a time
        </span>
        <span className="fig" aria-live="off">
          Role{" "}
          <span className={count.live ? "live" : undefined}>{count.n}</span> of{" "}
          {total}
        </span>
      </div>
      <ol
        className="intake-list"
        aria-label="Most recent roles read, newest first"
      >
        {rows.map((r, i) => (
          <li
            key={r.n}
            className={r.live && i === 0 ? "intake-row is-new" : "intake-row"}
          >
            <span className="fig muted">{(r.n % total) + 1}</span>
            <span className="title">
              {r.title}
              <span className="meta">
                {r.sector ? `${r.sector}, ` : ""}open {r.days} days
              </span>
            </span>
            <span className={r.live ? "stamp" : "stamp is-quiet"}>
              {r.verdict}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
