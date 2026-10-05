import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import TcLink from "@/components/tts/TcLink";
import { LEADERSHIP } from "@/data/people";
import { BUILD_SESSIONS, currentBuildSession } from "@/lib/build";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Build team | Trojan Tech Solutions",
  description:
    "How Trojan Tech Solutions is built: its initiatives, the divisions that staff them, and every build session's setup and slides.",
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

/* The structure, in our words. Initiatives are the things the club runs;
 * divisions are the halves of the work members apply into (the apply form's
 * tracks), plus design and brand, which Emily Zhao owns.
 * [NEED: who leads the Engineering and GTM engineering divisions. Nobody is
 * named on record, so no lead is on the page.] */
const INITIATIVES = [
  {
    name: "Build sessions",
    job: "Hands-on nights. Bring a laptop, leave with something working, saved to GitHub.",
  },
  {
    name: "General meetings",
    job: "The whole club in one room, then teams split off to build.",
  },
  {
    name: "Practice builds",
    job: "Members practise the whole machine on public data before anyone's real problem, like the run on the home page.",
  },
  {
    name: "T Combinator",
    job: "Our founder-facing branch: USC builders taking real ownership of a role at a YC company.",
  },
];

const emily = LEADERSHIP.find((p) => p.role === "Design and Brand");
const DIVISIONS = [
  {
    name: "Engineering",
    job: "Builds the tool: agents, internal apps, AI inside products, and the glue between systems.",
  },
  {
    name: "GTM engineering",
    job: "Builds the engine: lists, enrichment, scoring, routing and outbound that run every week.",
  },
  {
    name: "Design and brand",
    job: `How everything we ship looks and reads${emily ? `, owned by ${emily.name}` : ""}.`,
  },
];

/* Initiatives across the top, divisions across the bottom, every division
 * wired to every initiative, because members from each half staff all of
 * them. */
function Structure() {
  const top = INITIATIVES.map((x, i) => ({ ...x, cx: 14 + i * 24 }));
  const bottom = DIVISIONS.map((x, i) => ({ ...x, cx: 18 + i * 32 }));
  return (
    <svg
      className="f"
      viewBox="0 0 100 72"
      role="img"
      aria-labelledby="structure-t"
    >
      <title id="structure-t">
        The club runs four initiatives: build sessions, general meetings, client
        builds and T Combinator. Three divisions staff all of them: engineering,
        GTM engineering, and design and brand.
      </title>
      <rect className="f-ink" x="40" y="3" width="20" height="8" />
      <text className="f-label f-big" x="50" y="8.2" textAnchor="middle">
        TTS
      </text>
      <path className="f-ink" d="M50 11 L50 15 M14 15 L86 15" />
      {top.map((t) => (
        <g key={t.name}>
          <path className="f-ink" d={`M${t.cx} 15 L${t.cx} 19`} />
          <rect
            className="f-ink f-paper"
            x={t.cx - 11.4}
            y="19"
            width="22.8"
            height="10"
          />
          <text
            className="f-label f-label-ink"
            x={t.cx}
            y="25"
            textAnchor="middle"
          >
            {t.name}
          </text>
        </g>
      ))}
      {top.flatMap((t) =>
        bottom.map((b) => (
          <path
            key={`${t.name}-${b.name}`}
            className="f-mute f-draw"
            pathLength={1}
            d={`M${t.cx} 29 C${t.cx} 40 ${b.cx} 42 ${b.cx} 52`}
          />
        )),
      )}
      {bottom.map((b) => (
        <g key={b.name}>
          <rect
            className="f-ink f-paper"
            x={b.cx - 13}
            y="52"
            width="26"
            height="10"
          />
          <text
            className="f-label f-label-ink"
            x={b.cx}
            y="58"
            textAnchor="middle"
          >
            {b.name}
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
              How the club is built.
            </h1>
            <p className="pg-lead">
              Four initiatives, three divisions that staff them, and every build
              session&apos;s setup and slides, dated.
            </p>
            <div className="pg-actions">
              <Link href={`/build/${latest.slug}`} className="btn btn-primary">
                Open the latest slides{" "}
                <span className="arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
              <a href="#setup" className="btn btn-secondary">
                Setup checklist
              </a>
            </div>
          </div>
          <div className="pg-figure">
            <Structure />
          </div>
        </div>
      </section>

      <section className="pg-sec" aria-labelledby="init-title">
        <div className="pg-head">
          <h2 id="init-title">Initiatives</h2>
          <p>What the club runs, each with one job.</p>
        </div>
        <ol className="pg-rows">
          {INITIATIVES.map((x) => (
            <li key={x.name} className="pg-row">
              <span className="pg-row-name">{x.name}</span>
              <span className="pg-row-job">
                {x.job}
                {x.name === "T Combinator" && (
                  <>
                    {" "}
                    <TcLink className="link">Visit T Combinator</TcLink>
                  </>
                )}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="pg-sec" aria-labelledby="div-title">
        <div className="pg-head">
          <h2 id="div-title">Divisions</h2>
          <p>
            The halves of the work you apply into.{" "}
            <Link className="link" href="/apply">
              Pick one when you apply
            </Link>
            , or say you&apos;re not sure yet.
          </p>
        </div>
        <ol className="pg-rows">
          {DIVISIONS.map((x) => (
            <li key={x.name} className="pg-row">
              <span className="pg-row-name">{x.name}</span>
              <span className="pg-row-job">{x.job}</span>
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
                  <b>{clean(item.title)}</b>
                  <span>{clean(item.description)}</span>
                </li>
              ))}
            </ol>
          </>
        )}
        <h3 className="t-h3 mt-l">What you leave with</h3>
        <ol className="pg-checks">
          {latest.deliverables.map((item) => (
            <li key={clean(item.title)}>
              <b>{clean(item.title)}</b>
              <span>{clean(item.description)}</span>
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
                    </a>
                    <span>{clean(r.description)}</span>
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
