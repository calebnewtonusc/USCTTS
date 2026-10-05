"use client";

import {
  FLOW,
  hoursOf,
  LEADS,
  DRAFT,
  OUTLINE,
  PROMPT,
  QUALIFY,
  TOTAL_HOURS,
  type Kind,
} from "./weekData";

/*
 * The x-ray side of the week panel (DIRECTION-tts-v4.md, point 6, after
 * Gavin's XRAY.md). Right of the line, each beat shows how a member would
 * build it. Quiet by design: someone who never taps the word sees nothing
 * different. The line itself and its controller live in Week.tsx; this is
 * only what the line uncovers, one view per beat.
 */

const KIND_NAMES: [Kind, string][] = [
  ["gtm", "finding customers"],
  ["email", "the same emails"],
  ["sheet", "the spreadsheet"],
  ["teach", "learning new tools"],
];

export const XRAY_VIEWS = ["intro", "gtm", "qualify", "email", "sheet", "teach"] as const;

export default function XrayViews() {
  return (
    <div className="xr-views">
      <div className="xr-view" data-view="intro">
        <p className="xr-cap">week.csv, every block tagged by what it is</p>
        <ul className="xr-tags">
          {KIND_NAMES.map(([k, name]) => (
            <li key={k}>
              <span
                className="xr-bar"
                style={{
                  ["--w" as string]: `${(hoursOf(k) / TOTAL_HOURS) * 100}%`,
                }}
                aria-hidden="true"
              />
              <span className="xr-tag">
                {name}, {hoursOf(k)} hrs
              </span>
            </li>
          ))}
        </ul>
        <p className="xr-cap">
          {TOTAL_HOURS} hrs total. We start with whatever eats the most.
        </p>
      </div>

      <div className="xr-view" data-view="gtm">
        <div className="xr-row">
          {/* Filled with the manim clip on the first x-ray open (Week.tsx). */}
          <div className="xr-clip" />
          <div className="xr-detail">
            <p className="xr-cap">a Clay table, researched with Perplexity</p>
            <table className="xr-table">
              <thead>
                <tr>
                  <th>company</th>
                  <th>decision maker</th>
                  <th>signal</th>
                  <th>why it&apos;s worth reaching</th>
                </tr>
              </thead>
              <tbody>
                {/* Five rows, the count the clip beside it lands on. */}
                {LEADS.slice(0, 5).map((l) => (
                  <tr key={l.who}>
                    <td>
                      {l.who}, {l.where}
                    </td>
                    <td>{l.person}</td>
                    <td>{l.signal}</td>
                    <td>{l.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="xr-view" data-view="qualify">
        <div className="xr-row">
          <div className="xr-clip" data-clips="gtm_score gtm_score_on_cardinal" />
          <div className="xr-detail">
            <p className="xr-cap">the qualifying prompt</p>
            <dl className="xr-prompt">
              {QUALIFY.map(([k, v], i) => (
                <div key={i}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="xr-view" data-view="email">
        <div className="xr-row">
          {/* Filled with the manim clip on the first x-ray open (Week.tsx). */}
          <div className="xr-clip" data-clips="email_draft" />
          <div className="xr-detail">
            <p className="xr-cap">the first email, as drafted</p>
            <p className="xr-draft">{DRAFT}</p>
            <p className="xr-cap">the prompt behind it</p>
            <dl className="xr-prompt">
              {PROMPT.map(([k, v], i) => (
                <div key={i}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="xr-view" data-view="sheet">
        <div className="xr-row">
          {/* Filled with the manim clip on the first x-ray open (Week.tsx). */}
          <div className="xr-clip" data-clips="crm_merge" />
          <div className="xr-detail">
            <p className="xr-cap">the workflow behind the CRM</p>
            <ol className="xr-flow">
              {FLOW.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="xr-view" data-view="teach">
        <div className="xr-row">
          {/* Filled with the manim clip on the first x-ray open (Week.tsx). */}
          <div className="xr-clip" data-clips="teach_curve" />
          <div className="xr-detail">
            <p className="xr-cap">the lesson plan</p>
            <ol className="xr-outline">
              {OUTLINE.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
