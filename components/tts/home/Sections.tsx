import Link from "next/link";
import { ADVISORS, ALUMNI, LEADERSHIP, type Person } from "@/data/people";
import MeshBand from "./MeshBand";

/* The lines of work, each with one job. The structure (initiatives with
 * one-line jobs) is borrowed from how strong club sites are organised; every
 * line is TTS's own, from docs/POSITIONING.md and docs/DIRECTION-tts-v3.md. */
const WORK = [
  {
    name: "Data sets",
    job: "Account and contact lists a company owns, enriched, scored and ready to work.",
  },
  {
    name: "GTM engineering",
    job: "Routing, enrichment, scoring and outbound, running every week on that data.",
  },
  {
    name: "Custom agents",
    job: "Research and qualification agents with a real job and a test set behind them.",
  },
  {
    name: "AI inside products",
    job: "Features a company ships to its own users, built with them, not for a demo.",
  },
  {
    name: "Research workflows",
    job: "Repeatable research across files, apps and the web, instead of one-off prompts.",
  },
  {
    name: "Teaching all of it",
    job: "Every member learns the whole machine, by building it.",
  },
];

const TURN_DOWN = [
  {
    title: "Clinical or licensed work",
    body: "If it needs a license we don't hold, it isn't ours to touch.",
  },
  {
    title: "On-site physical work",
    body: "We build tools a company runs. We don't staff a floor.",
  },
  {
    title: "Hard engineering",
    body: "Avionics, composites, propulsion. Those belong to people trained for them.",
  },
  {
    title: "Anything week one would expose",
    body: "If the first status update would show we can't do it, we say so first.",
  },
];

export function WorkLines() {
  return (
    <section className="lines" aria-labelledby="lines-title">
      <div className="lines-head">
        <p className="kicker">What we build</p>
        <h2 id="lines-title" className="t-h2">
          Data sets. GTM engineering. Custom agents. And everything else AI can
          do.
        </h2>
      </div>
      <ol className="lines-list">
        {WORK.map((w) => (
          <li key={w.name} className="line-row">
            <span className="line-name">{w.name}</span>
            <span className="line-job">{w.job}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TurnDown() {
  return (
    <section className="nope" aria-labelledby="nope-title">
      <div className="nope-head">
        <h2 id="nope-title" className="t-h2">
          What we turn down.
        </h2>
        <p className="t-lead">
          Saying no in public is cheaper than failing in private.
        </p>
      </div>
      <ul className="nope-list">
        {TURN_DOWN.map((t) => (
          <li key={t.title}>
            <h3 className="t-h3">{t.title}</h3>
            <p>{t.body}</p>
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
      <span className="face-name">{p.name}</span>
      <span className="face-note">{note}</span>
    </li>
  );
}

export function Roster() {
  const bench = [...ALUMNI, ...ADVISORS].filter((p) => p.company);
  return (
    <section className="roster" aria-labelledby="roster-title">
      <div className="roster-head">
        <p className="kicker">The people</p>
        <h2 id="roster-title" className="t-h2">
          Our people are at McKinsey, Apple, Bloomberg and Reddit.
        </h2>
        <p className="t-lead">
          Alumni and advisors from the club&apos;s own roster. Names and
          employers, not logos: none of these companies is a client, and we
          won&apos;t dress them up as one.
        </p>
      </div>
      <h3 className="roster-sub">Running it now</h3>
      <ul className="faces faces-lead">
        {LEADERSHIP.map((p) => (
          <Face key={p.name} p={p} note={p.role} />
        ))}
      </ul>
      <h3 className="roster-sub">Alumni and advisors</h3>
      <ul className="faces">
        {bench.map((p) => (
          <Face
            key={p.name}
            p={p}
            note={
              p.status === "advisor"
                ? `Advisor, ${p.company}`
                : (p.company ?? "")
            }
          />
        ))}
      </ul>
      <p className="roster-more">
        <Link className="link" href="/members">
          See everyone, with roles
        </Link>
      </p>
    </section>
  );
}

export function Join() {
  const names = LEADERSHIP.map((p) => p.name.split(" ")[0]);
  const who = `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return (
    <section className="join" aria-labelledby="join-title">
      <MeshBand />
      <div className="join-inner">
        <h2 id="join-title" className="join-title">
          Join TTS, learn to build all of this, and build it for a real company.
        </h2>
        {/* [NEED: the next cohort's application date, and how long a reply
         * takes. Neither is on record, so neither is on the page.] */}
        <ol className="join-steps">
          <li>
            <span>1</span>Send the form: your year, the half of the work you
            want, one thing you&apos;ve made.
          </li>
          <li>
            <span>2</span>
            {who} read every application.
          </li>
          <li>
            <span>3</span>You hear back by email, yes or no.
          </li>
        </ol>
        <div className="join-actions">
          <Link href="/apply" className="btn btn-primary">
            Apply to join{" "}
            <span className="arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
          <Link href="/work-with-us" className="btn btn-secondary">
            Bring us a problem
          </Link>
        </div>
      </div>
    </section>
  );
}
