import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import TcLink from "@/components/tts/TcLink";
import { BUILD_SESSIONS, currentBuildSession } from "@/lib/build";
import "@/components/tts/pages.css";
import "./build.css";

export const metadata: Metadata = {
  title: "Build team | Trojan Tech Solutions",
  description:
    "How a semester at Trojan Tech Solutions works, in five steps, and every build session's setup and slides.",
};

// lib/build carries em dashes and arrows in its copy (lead-owned, reported).
// Render them as plain punctuation here so this page holds the house rule.
const clean = (text: string) =>
  text.replace(/\s*\u2014\s*/g, ", ").replace(/\s*\u2192\s*/g, " to ");

const fmt = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/* The semester, in five steps: docs/COPY-tts.md, verbatim. The shape is a
 * numbered timeline because that is what a student deciding on a club needs
 * first: what happens, in what order, and where it ends. */
const STEPS = [
  { name: "Apply", job: "Tell us your track and why. We read every one." },
  {
    name: "Learn the machine",
    job: "Build sessions take you through data, enrichment, qualification, prompting and agents.",
  },
  {
    name: "Practice build",
    job: "Your team builds a real pipeline on public data, start to finish.",
  },
  {
    name: "Real work",
    job: "The strongest teams take on real company work, including T Combinator's three YC companies each spring.",
  },
  {
    name: "Show it",
    job: "End the semester with something running that you built.",
  },
];

/* The five steps as one line with five stations on it, the last one live,
 * in the shared hairline family. */
function Timeline() {
  const xs = STEPS.map((_, i) => 8 + i * 21);
  return (
    <svg
      className="f"
      viewBox="0 0 100 40"
      role="img"
      aria-labelledby="timeline-t"
    >
      <title id="timeline-t">
        Five steps across one semester: apply, learn the machine, practice
        build, real work, and show it.
      </title>
      <path className="f-mute" d={`M${xs[0]} 18 L${xs[4]} 18`} />
      <path className="f-live" d={`M${xs[3]} 18 L${xs[4]} 18`} />
      {STEPS.map((st, i) => (
        <g key={st.name}>
          <rect
            className={i === 4 ? "f-live-fill" : "f-ink f-paper"}
            x={xs[i] - 3}
            y="15"
            width="6"
            height="6"
          />
          <text className="f-label f-big" x={xs[i]} y="10" textAnchor="middle">
            {i + 1}
          </text>
          <text
            className="f-label f-label-ink"
            x={xs[i]}
            y="28"
            textAnchor="middle"
          >
            {st.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function BuildPage() {
  const latest = currentBuildSession;
  const sessions = [...BUILD_SESSIONS].sort((a, b) => b.number - a.number);

  return (
    <Shell>
      <section className="pg-sec pg-view is-top" aria-labelledby="build-title">
        <div className="pg-split is-hero">
          <div>
            <p className="pg-kicker">Build team</p>
            <h1 id="build-title" className="pg-title">
              How a semester at TTS works
            </h1>
            <div className="pg-actions">
              <Link href="/apply" className="btn btn-primary">
                Apply to join{" "}
                <span className="arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
              <Link
                href={`/build/${latest.slug}`}
                className="btn btn-secondary"
              >
                Open the latest slides
              </Link>
            </div>
          </div>
          <div className="pg-figure">
            <Timeline />
          </div>
        </div>
      </section>

      <section className="pg-sec" aria-labelledby="steps-title">
        <div className="pg-head">
          <h2 id="steps-title">The semester, step by step</h2>
        </div>
        {/* A real numbered sequence in sentences, beside the timeline
         * figure, not a grid of heading-plus-line cards. */}
        <ol className="pg-steps-list">
          {STEPS.map((x) => (
            <li key={x.name}>
              <b>{x.name}.</b> {x.job}
              {x.name === "Real work" && (
                <>
                  {" "}
                  <TcLink className="link">Visit T Combinator</TcLink>
                </>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="pg-sec" id="setup" aria-labelledby="latest-title">
        <div className="pg-head">
          <p className="pg-kicker">
            Most recent build session, {fmt(latest.date)}
          </p>
          <h2 id="latest-title">
            {latest.title.replace(/^Build Meeting \d+: /, "")}
          </h2>
          <p>{clean(latest.focus)}</p>
        </div>
        {latest.preBuild && (
          <>
            <h3 className="t-h3 mt-l">Do this before the session</h3>
            <ol className="pg-checks">
              {latest.preBuild.map((item) => (
                <li key={clean(item.title)}>
                  <b>{clean(item.title)}.</b> {clean(item.description)}
                </li>
              ))}
            </ol>
          </>
        )}
        <h3 className="t-h3 mt-l">What you leave with</h3>
        <ol className="pg-checks">
          {latest.deliverables.map((item) => (
            <li key={clean(item.title)}>
              <b>{clean(item.title)}.</b> {clean(item.description)}
            </li>
          ))}
        </ol>
        {latest.resources && latest.resources.some((r) => r.href) && (
          <>
            <h3 className="t-h3 mt-l">Setup links</h3>
            <ol className="pg-checks">
              {latest.resources
                .filter((r) => r.href)
                .map((r) => (
                  <li key={r.label}>
                    <a
                      className="link"
                      href={r.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <b>{r.label}</b>
                    </a>{" "}
                    {clean(r.description)}
                  </li>
                ))}
            </ol>
          </>
        )}
      </section>

      <section className="pg-sec" aria-labelledby="archive-title">
        <div className="pg-head">
          <h2 id="archive-title">Every session</h2>
          <p>Newest first. Anyone joining late can catch up here.</p>
        </div>
        <div className="pg-table">
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Session</th>
                <th scope="col">Date</th>
                <th scope="col" className="num">
                  Slides
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.slug}>
                  <td>
                    {clean(s.title)}
                    <span className="sub">{clean(s.focus)}</span>
                  </td>
                  <td>{fmt(s.date)}</td>
                  <td className="num">
                    <Link className="link" href={`/build/${s.slug}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
