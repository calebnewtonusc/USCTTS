import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { BUILD_SESSIONS, currentBuildSession } from "@/lib/build";

export const metadata: Metadata = {
  title: "Build team | Trojan Tech Solutions",
  description: "The TTS build team's sessions, setup checklist, deliverables and slides, dated.",
};

// lib/build carries em dashes and arrows in its copy (lead-owned, reported).
// Render them as plain punctuation here so this page holds the house rule.
const clean = (text: string) => text.replace(/\s*\u2014\s*/g, ", ").replace(/\s*\u2192\s*/g, " to ");

const fmt = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default function BuildPage() {
  const latest = currentBuildSession;
  const sessions = [...BUILD_SESSIONS].sort((a, b) => b.number - a.number);

  return (
    <Shell>
      <section className="hero col section-head prose" aria-labelledby="build-title">
        <h1 id="build-title" className="t-h2">
          The build team, session by session.
        </h1>
        <p className="t-lead">
          Every build session&apos;s setup, what you should leave with, and the slides, kept here with their dates so
          anyone joining late can catch up without digging through old links.
        </p>
        <div className="row-actions">
          <Link href={`/build/${latest.slug}`} className="btn btn-primary">
            Open the latest slides <span className="arrow" aria-hidden="true">&rarr;</span>
          </Link>
          <a href="#setup" className="btn btn-secondary">
            Setup checklist
          </a>
        </div>
      </section>

      <section className="section col section-head" aria-labelledby="latest-title">
        <p className="label">Latest session, {fmt(latest.date)}</p>
        <h2 id="latest-title" className="t-h2">
          {latest.title.replace(/^Build Meeting \d+: /, "")}
        </h2>
        <p className="t-lead">{clean(latest.focus)}</p>
      </section>

      {latest.preBuild && (
        <section className="section col section-head" id="setup" aria-labelledby="setup-title">
          <h2 id="setup-title" className="t-h3">
            Do this before the session
          </h2>
          <p className="muted">Setup should not eat the build time. If something breaks, bring the exact error message.</p>
          <ol className="plain-list steps mt-m">
            {latest.preBuild.map((item) => (
              <li key={clean(item.title)}>
                <span className="t-h3">{clean(item.title)}</span>
                <p>{clean(item.description)}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="section col section-head" aria-labelledby="leave-title">
        <h2 id="leave-title" className="t-h3">
          What you leave with
        </h2>
        <ul className="plain-list mt-m">
          {latest.deliverables.map((item) => (
            <li key={clean(item.title)}>
              <span className="t-h3">{clean(item.title)}</span>
              <p>{clean(item.description)}</p>
            </li>
          ))}
        </ul>
        {latest.resources && latest.resources.length > 0 && (
          <>
            <h2 className="t-h3 mt-l">Setup links</h2>
            <ul className="plain-list mt-s">
              {latest.resources
                .filter((r) => r.href)
                .map((r) => (
                  <li key={r.label}>
                    <a className="link t-h3" href={r.href} target="_blank" rel="noreferrer">
                      {r.label}
                    </a>
                    <p>{clean(r.description)}</p>
                  </li>
                ))}
            </ul>
          </>
        )}
      </section>

      <section className="section" aria-labelledby="archive-title">
        <div className="col section-head">
          <h2 id="archive-title" className="t-h2">
            Every session
          </h2>
        </div>
        <div className="wide exhibit">
          <table className="ledger mt-s">
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
