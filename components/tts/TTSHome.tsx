import Link from "next/link";
import { ADVISORS, ALUMNI, LEADERSHIP } from "@/data/people";
import dataset from "@/public/tts/run/portfolio-board-2026-09-15.json";
import Shell from "./Shell";
import Timeline from "./Timeline";
import Intake, { type IntakeRow } from "./run/Intake";
import Run from "./run/Run";
import { audit, runPipeline, verdict, type Dataset } from "./run/pipeline";

// The JSON's tuples widen to arrays on import; the shape is checked by the
// builder script that wrote it (see the report), so this goes via unknown.
const DATA = dataset as unknown as Dataset;

// Computed on the server so the static HTML carries the finished result,
// which is DESIGN.md rule 12: an animated number ships its final value.
const INITIAL_RUN = runPipeline(DATA, true);

const INITIAL_INTAKE: IntakeRow[] = (() => {
  const aside = audit(DATA);
  const rows: IntakeRow[] = [];
  for (let n = 7; n >= 0; n--) {
    const role = DATA.roles[(n * 61) % DATA.roles.length];
    rows.push({
      n,
      title: role[2],
      sector: DATA.sectors[DATA.companies[role[0]][0]],
      days: role[1],
      verdict: verdict(role, aside),
      live: false,
    });
  }
  return rows;
})();

const TURN_DOWN = [
  {
    title: "Clinical or licensed work",
    body: "If it needs a license we do not hold, it is not ours to touch.",
  },
  {
    title: "On-site physical work",
    body: "We build tools a company runs, and we do not staff a warehouse or a clinic floor.",
  },
  {
    title: "Hard engineering",
    body: "Avionics, composites, geotechnical and propulsion work belong to people trained for them, and that is not us.",
  },
  {
    title: "Anything the first status update would expose",
    body: "If week one would show we cannot do it, we say so before week one.",
  },
];

const BENCH = [...ALUMNI, ...ADVISORS].filter((p) => p.company);

export default function TTSHome() {
  return (
    <Shell>
      <section className="hero wide" aria-labelledby="hero-title">
        <h1 id="hero-title" className="t-display">
          <span className="line print-in">Every engagement</span>
          <span className="line print-in d1">ends with something</span>
          <span className="line print-in d2">running.</span>
        </h1>
        <div className="hero-grid">
          <div>
            <p className="t-lead">
              Trojan Tech Solutions is USC&apos;s applied AI implementation club. We do real work for companies, in
              engineering and GTM engineering, and we teach you to finesse it for companies, for your own life, and
              anything in between.
            </p>
            <div className="actions">
              <Link href="/apply" className="btn btn-primary">
                Apply to join <span className="arrow" aria-hidden="true">&rarr;</span>
              </Link>
              <a href="#run" className="btn btn-secondary">
                Watch one run
              </a>
            </div>
          </div>
          <Intake initial={INITIAL_INTAKE} total={DATA.roles.length} />
        </div>
      </section>

      <section className="section" id="run" aria-labelledby="run-title">
        <div className="col section-head prose">
          <h2 id="run-title" className="t-h2">
            Here is one, running in your browser.
          </h2>
          <p>
            On 2026-09-15 we read a venture fund&apos;s public portfolio job board
            as a client pipeline instead of a job list. A role that sits open
            for months means a company has admitted the need, approved the
            budget, and failed to fill it. That is work a student team can offer
            to take on.
          </p>
          <p>
            This is that pipeline, re-run on the same data, on your machine.
            Every red number on this page was computed in your browser a moment
            ago. The verify step is the part worth watching: switch it off and
            see what nearly went to the top.
          </p>
        </div>
        <div className="wide">
          <Run initial={INITIAL_RUN} />
        </div>
      </section>

      <section className="section" aria-labelledby="format-title">
        <div className="col section-head prose">
          <h2 id="format-title" className="t-h2">
            A deck is not a deliverable.
          </h2>
          <p>
            Most student consulting ends the same way: a final presentation, a
            recommendation, and then everybody graduates. A lot of the time it
            never gets implemented, and nobody touches a tool the client keeps
            using once the semester is over.
          </p>
          <p>
            We work the other way round. An engagement here ends with a working
            tool, a person on their team who owns it, the SOP written down, and
            a number measured before and after.
          </p>
        </div>
        <div className="wide">
          <Timeline />
        </div>
      </section>

      <section className="section" aria-labelledby="no-title">
        <div className="col section-head">
          <h2 id="no-title" className="t-h2">
            What we say no to.
          </h2>
          <ul className="plain-list mt-m">
            {TURN_DOWN.map((t) => (
              <li key={t.title}>
                <span className="t-h3">{t.title}</span>
                <p>{t.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="bench-title">
        <div className="col section-head prose">
          <h2 id="bench-title" className="t-h2">
            Where people from this club are now.
          </h2>
          <p>
            People who started here, and the advisors who help run it
            now. Names and employers, not logos, because none of these companies
            is a client and we will not dress them up as one.
          </p>
        </div>
        <div className="wide exhibit">
          <table className="ledger mt-s">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Now at</th>
                <th scope="col">Role</th>
              </tr>
            </thead>
            <tbody>
              {BENCH.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td>{p.company}</td>
                  <td className="muted">
                    {p.status === "advisor" ? `Advisor. ${p.role}` : p.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="exhibit-caption label">
            <span>
              From the club&apos;s own roster. Alumni first, then advisors.
            </span>
            <Link className="link" href="/members">
              See everyone
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="join-title">
        <div className="col section-head">
          <h2 id="join-title" className="t-h2">
            How joining works.
          </h2>
          {/* [NEED: the next cohort's application date, and how long a reply
           * takes. Neither is on record, so neither is on the page.] */}
          <ol className="plain-list steps mt-m">
            <li>
              <span className="t-h3">Send the form</span>
              <p>
                Your name, your year, which half of the work you want, and one
                thing you have made or want to make.
              </p>
            </li>
            <li>
              <span className="t-h3">One of us reads it</span>
              <p>
                The club is run by{" "}
                {LEADERSHIP.map((p) => p.name)
                  .join(", ")
                  .replace(/, ([^,]*)$/, " and $1")}
                . One of them reads every application.
              </p>
            </li>
            <li>
              <span className="t-h3">You hear back by email</span>
              <p>You get an answer whether it is a yes or a no.</p>
            </li>
          </ol>
          <div className="row-actions">
            <Link href="/apply" className="btn btn-primary">
              Apply to join{" "}
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="tc-title">
        <div className="col section-head prose">
          <h2 id="tc-title" className="t-h2">
            For YC companies, there is T Combinator.
          </h2>
          <p>
            The same people, taking real ownership of a role at a Y Combinator
            company, free, three companies a semester. It has its own site
            because it has a different reader.
          </p>
          <p>
            <Link className="link" href="/tc">
              Go to T Combinator
            </Link>
          </p>
        </div>
      </section>
    </Shell>
  );
}

