"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { clamp, easeOut3, prog } from "../engine/math";

/* The run, as five beats (Caleb, 2026-10-04: "the visual heirarchy of many
 * parts is cooked"). One number counting up, one sentence and one figure per
 * screen, with nothing competing. The figure is the same grid of 388 roles
 * the whole way through, so each beat is a state change of one object: the
 * companies, then every role, then the bad feed thrown out, then what's left,
 * then the shortlist in cardinal. Beat three swaps the grid for the ranking,
 * because that's where the one control lives.
 *
 * Every number is computed on the server from the same dataset the old run
 * loaded; nothing here is typed in by hand. */

export interface RunBeatsData {
  companies: number;
  roles: number;
  setAside: number;
  kept: number;
  shortlist: number;
  /** One flag per role, in dataset order: 0 kept, 1 set aside, 2 shortlisted. */
  flags: number[];
  /** Top three by open roles, with the check on and with it off. */
  rankOn: { label: string; open: number; bad: boolean }[];
  rankOff: { label: string; open: number; bad: boolean }[];
  /** Every shortlisted role, longest open first. */
  list: { title: string; sector: string; days: number }[];
}

const BEATS = 5;
// The pin is this many screens tall: one screen per beat plus a little hold.
const SCREENS = 6;
const COLS = 28;

function useReduced() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export default function RunBeats({ d }: { d: RunBeatsData }) {
  const sec = useRef<HTMLDivElement>(null);
  const nums = useRef<(HTMLSpanElement | null)[]>([]);
  const [beat, setBeat] = useState(0);
  const [checkOff, setCheckOff] = useState(false);
  const reduced = useReduced();

  const values = [d.companies, d.roles, d.setAside, d.kept, d.shortlist];
  const lines = [
    `We pulled every company on a venture fund's public job board, all ${d.companies} of them, on 2026-09-15.`,
    `Between them they had ${d.roles} open roles, and a role that's sat open for months means a company needs help.`,
    `But ${d.setAside} of those came from one feed pointed at the wrong company, so the check threw them all out.`,
    `That left ${d.kept} real roles at companies that are actually hiring.`,
    `And ${d.shortlist} of them were work a student team could actually take on, so that's where we'd start.`,
  ];

  useEffect(() => {
    if (reduced) return;
    const el = sec.current;
    if (!el) return;
    let raf = 0;
    let top = 0;
    let travel = 1;
    let last = -1;
    const layout = () => {
      top = el.getBoundingClientRect().top + window.scrollY;
      travel = Math.max(1, el.offsetHeight - window.innerHeight);
    };
    const tick = () => {
      raf = 0;
      const p = clamp((window.scrollY - top) / travel);
      const b = Math.min(BEATS - 1, Math.floor(p * BEATS * 1.0001));
      if (b !== last) {
        last = b;
        setBeat(b);
      }
      // Each beat's number counts up over the first 45% of its slot.
      const local = p * BEATS - b;
      const k = easeOut3(prog(local, 0, 0.45));
      const n = nums.current[b];
      if (n) n.textContent = String(Math.round(values[b] * k));
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      layout();
      kick();
    };
    layout();
    tick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
    };
    // values are derived from d, which never changes after the server render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const grid = (b: number) => (
    <svg
      className="rb-grid"
      viewBox={`0 0 ${COLS * 10} ${Math.ceil(d.roles / COLS) * 10}`}
      role="img"
      aria-label={
        b === 0
          ? `${d.companies} companies`
          : b === 1
            ? `${d.roles} open roles`
            : b === 3
              ? `${d.kept} roles left after the check`
              : `${d.shortlist} roles a student team could take on`
      }
    >
      {d.flags.map((f, i) => {
        const x = (i % COLS) * 10 + 5;
        const y = Math.floor(i / COLS) * 10 + 5;
        let cls = "rb-cell";
        if (b === 0) cls = i < d.companies ? "rb-cell rb-co" : "rb-cell rb-off";
        else if (b === 3) cls = f === 1 ? "rb-cell rb-off" : "rb-cell";
        else if (b === 4)
          cls =
            f === 2
              ? "rb-cell rb-live"
              : f === 1
                ? "rb-cell rb-off"
                : "rb-cell rb-quiet";
        return b === 0 ? (
          <rect
            key={i}
            className={cls}
            x={x - 3}
            y={y - 3}
            width="6"
            height="6"
          />
        ) : (
          <circle key={i} className={cls} cx={x} cy={y} r="2.4" />
        );
      })}
    </svg>
  );

  const rank = checkOff ? d.rankOff : d.rankOn;
  const max = Math.max(...d.rankOff.map((r) => r.open), 1);
  const bars = (
    <div className="rb-bars">
      <ol>
        {rank.map((r) => (
          <li
            key={`${r.label}-${r.open}`}
            className={r.bad ? "is-bad" : undefined}
          >
            <span className="rb-bar-label">{r.label}</span>
            <span className="rb-bar">
              <span style={{ width: `${(100 * r.open) / max}%` }} />
            </span>
            <span className="rb-bar-n">{r.open}</span>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="btn btn-secondary rb-toggle"
        aria-pressed={checkOff}
        onClick={() => setCheckOff((v) => !v)}
      >
        {checkOff
          ? "Turn the check back on"
          : "Turn the check off and see what happens"}
      </button>
    </div>
  );

  const beatView = (b: number) => (
    <div className="rb-beat" key={b}>
      <div className="rb-copy">
        <span
          className="rb-n"
          ref={(n) => {
            nums.current[b] = n;
          }}
        >
          {values[b]}
        </span>
        <p className="rb-line">{lines[b]}</p>
      </div>
      <div className="rb-fig">{b === 2 ? bars : grid(b)}</div>
    </div>
  );

  return (
    <section
      id="run"
      className={reduced ? "rb rb-still" : "rb"}
      aria-labelledby="rb-title"
    >
      <div
        ref={sec}
        className="rb-track"
        style={reduced ? undefined : { height: `${SCREENS * 100}vh` }}
      >
        <div className="rb-pin">
          <h2 id="rb-title" className="rb-kicker">
            One real run, from 2026-09-15
          </h2>
          {reduced ? (
            [0, 1, 2, 3, 4].map(beatView)
          ) : (
            <div className="rb-stage">
              {[0, 1, 2, 3, 4].map((b) => (
                <div
                  key={b}
                  className={b === beat ? "rb-layer is-on" : "rb-layer"}
                  inert={b !== beat}
                  aria-hidden={b !== beat}
                >
                  {beatView(b)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <details className="rb-all">
        <summary>See all {d.shortlist} roles</summary>
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
            {d.list.map((r, i) => (
              <tr key={`${r.title}-${i}`}>
                <td>
                  {r.title} ({r.sector})
                </td>
                <td className="num">{r.days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
