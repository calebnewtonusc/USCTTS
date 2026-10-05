import Link from "next/link";
import MeshBand from "./MeshBand";
import { ADVISORS, LEADERSHIP, type Person } from "@/data/people";
import TcLink from "../TcLink";

/* docs/COPY-tts.md, verbatim: what we do (three initiatives, one line each),
 * the sourced numbers, and the three tracks. Structure taken from how the
 * clearest club sites are organised; every fact is from POSITIONING.md or
 * data/people.ts, and the counts are computed from data/people.ts. */
const INITIATIVES = [
  {
    name: "Build sessions",
    job: "They're hands-on nights where every member ships a working piece of the machine.",
  },
  {
    name: "Practice builds",
    job: "We build real pipelines on public data, like the one running on this page.",
  },
  {
    name: "T Combinator",
    job: "It's our team that works with YC companies, three of them a semester.",
  },
] as const;

/* One figure for the three initiatives, not three cards (Caleb on card
 * grids: "Header, subheader X6 screams SO AI"). A single hairline line runs
 * through all three; the live one, T Combinator's three companies, is in
 * cardinal. The initiatives are a plain list inside the same well. */
function InitiativesFigure() {
  return (
    <svg className="init-fig" viewBox="0 0 360 60" aria-hidden="true">
      <path className="ln" d="M12 30 L348 30" />
      {/* build sessions: a row of nights, the last one shipped */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          className={i === 3 ? "ln-live-fill" : "ln ln-paper"}
          x={20 + i * 20}
          y="20"
          width="14"
          height="20"
        />
      ))}
      {/* practice builds: a small pipeline */}
      {[150, 172, 194, 216].map((x) => (
        <rect
          key={x}
          className="ln ln-paper"
          x={x - 6}
          y="24"
          width="12"
          height="12"
        />
      ))}
      {/* T Combinator: three companies */}
      {[270, 298, 326].map((x) => (
        <rect
          key={x}
          className="ln-live ln-paper"
          x={x - 10}
          y="18"
          width="20"
          height="24"
        />
      ))}
    </svg>
  );
}

export function WhatWeDo() {
  return (
    <section className="lines" aria-labelledby="do-title">
      <div className="lines-head">
        <h2 id="do-title" className="t-h2">
          What you&apos;d actually do here
        </h2>
      </div>
      <figure className="init-well">
        <InitiativesFigure />
        <ul className="init-list">
          {INITIATIVES.map((x) => (
            <li key={x.name}>
              <b>
                {x.name === "T Combinator" ? (
                  <TcLink className="link">{x.name}</TcLink>
                ) : (
                  x.name
                )}
                .
              </b>{" "}
              {x.job}
            </li>
          ))}
        </ul>
      </figure>
    </section>
  );
}

const TURN_DOWN = [
  {
    title: "Clinical or licensed work",
    body: "If it needs a license we don't hold, it isn't ours to touch.",
  },
  {
    title: "On-site physical work",
    body: "We build tools a company runs, but we don't staff a floor.",
  },
  {
    title: "Hard engineering",
    body: "Things like avionics, composites and propulsion belong to people who trained for them.",
  },
  {
    title: "Anything week one would expose",
    body: "If the first status update would show we can't do it, we say so first.",
  },
];

export function TurnDown() {
  return (
    <section className="nope" aria-labelledby="nope-title">
      <h2 id="nope-title" className="t-h2">
        What we turn down
      </h2>
      <ul className="plain-sentences">
        {TURN_DOWN.map((t) => (
          <li key={t.title}>
            <b>{t.title}.</b> {t.body}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Face({ p, note }: { p: Person; note: string }) {
  const initials = p.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
  return (
    <li className="face">
      {p.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.photo} alt="" loading="lazy" width={240} height={300} />
      ) : (
        <span className="face-ph" aria-hidden="true">
          {initials}
        </span>
      )}
      {/* A caption, name then role, not a heading-plus-line card. */}
      <span className="face-cap">
        <b>{p.name}</b>
        {note ? <br /> : null}
        {note}
      </span>
    </li>
  );
}

/* Caleb, 2026-10-04: "Keep mentors, but for alumni just put a bunch of
 * logos". One mark per company an alumnus works at now, or worked at, from
 * data/people.ts. Apple is left out until Susan Nyirenda is verified, and
 * NBCUniversal, Epic, Roxborough and USC Gould have no clean mark on disk yet.
 * Every mark is drawn in ink through a CSS mask, so nine brands read as one
 * row instead of nine colored tiles. The row drifts; reduced motion holds it. */
const ALUMNI_MARKS = [
  { name: "Reddit", src: "/tts/alumni/reddit.svg" },
  { name: "Bloomberg", src: "/tts/alumni/bloomberg.svg" },
  { name: "Microsoft", src: "/tts/alumni/microsoft.svg" },
  { name: "Capital One", src: "/tts/alumni/capitalone.svg" },
  { name: "Citi", src: "/tts/alumni/citi.svg" },
  { name: "PwC", src: "/tts/alumni/pwc.svg" },
  { name: "Jefferies", src: "/tts/alumni/jefferies.svg" },
  { name: "Nomura", src: "/tts/alumni/nomura.svg" },
  { name: "Fastly", src: "/tts/alumni/fastly.svg" },
];

function AlumniMarks() {
  const row = (hidden: boolean) =>
    ALUMNI_MARKS.map((m) => (
      <li key={m.name} aria-hidden={hidden || undefined}>
        <span
          className="alum-mark"
          role={hidden ? undefined : "img"}
          aria-label={hidden ? undefined : m.name}
          style={{ ["--src" as string]: `url(${m.src})` }}
        />
      </li>
    ));
  return (
    <div className="alum-strip">
      <ul className="alum-track">
        {row(false)}
        {row(true)}
      </ul>
    </div>
  );
}

export function Roster() {
  return (
    <section className="roster" aria-labelledby="roster-title">
      <div className="roster-head">
        <h2 id="roster-title" className="t-h2">
          Who you&apos;d be working with
        </h2>
        <p className="t-lead">
          Caleb Newton and Tyler Larsen are co-presidents, and Emily Zhao leads
          design.
        </p>
      </div>
      <h3 className="roster-sub">Running it now</h3>
      <ul className="faces faces-lead">
        {LEADERSHIP.map((p) => (
          <Face key={p.name} p={p} note={p.role} />
        ))}
      </ul>
      <h3 className="roster-sub">Mentors</h3>
      <ul className="faces">
        {ADVISORS.filter((p) => p.company).map((p) => (
          <Face key={p.name} p={p} note={p.company ?? ""} />
        ))}
      </ul>
      <h3 className="roster-sub">Where our alumni work now</h3>
      <AlumniMarks />
      <p className="roster-more">
        <Link className="link" href="/members">
          See everyone, with roles
        </Link>
      </p>
    </section>
  );
}

export function Join() {
  return (
    <section className="join" aria-labelledby="join-title">
      <MeshBand />
      <div className="join-inner">
        <h2 id="join-title" className="join-title">
          Two ways in, depending on who you are.
        </h2>
        {/* Two readers, two doors (docs/RUBRIC-tts.md): a USC student
         * deciding whether to join, and a business that wants AI help. */}
        <div className="join-doors">
          <div className="join-door">
            <p>
              If you&apos;re a USC student, you tell us when you apply if
              you&apos;d rather build the tools or get them used, and Caleb,
              Tyler and Emily read every one.
            </p>
            <Link href="/apply" className="btn btn-primary">
              Join TTS{" "}
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
          <div className="join-door">
            <p>
              If you run a business, tell us the part of the week your team
              keeps losing, and we&apos;ll tell you what AI can actually do
              about it.
            </p>
            <Link href="/work-with-us#intake" className="btn btn-secondary">
              Tell us what&apos;s eating your team&apos;s time{" "}
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
