import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import TcLink from "@/components/tts/TcLink";
import IntakeForm from "@/components/tts/IntakeForm";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "For companies | Trojan Tech Solutions",
  description:
    "Tell USC's AI implementation lab what's eating your team's time. We set up AI to take on repeat work, like answering the same emails, keeping leads organized, building reports and teaching your staff.",
};

/* The reader is a business owner who doesn't know much about AI (Caleb,
 * 2026-10-04, docs/RUBRIC-tts.md). Each row starts from a problem they'd
 * recognize and says what we'd build, in plain words. These are examples of
 * the work, never past results; the one live engagement named is the AI
 * curriculum in docs/POSITIONING.md. */
const EXAMPLES = [
  {
    problem: "Your team answers the same emails all week.",
    build: "AI that drafts the replies in your inbox,",
    rest: " and a person on your team reads each one before it goes out.",
  },
  {
    problem: "Your leads live in a spreadsheet someone updates by hand.",
    build: "A CRM, one shared list of every lead and customer,",
    rest: " that fills itself in from your forms and email so nobody copies rows.",
  },
  {
    problem: "Someone spends every Friday putting the same report together.",
    build: "A report that builds itself",
    rest: " from the tools you already use and lands in your inbox.",
  },
  {
    problem: "Finding the right people to sell to takes hours.",
    build: "A list of companies and contacts that fit,",
    rest: " each with a line on why, kept up to date for you.",
  },
  {
    problem: "Your staff don't know how to use AI yet.",
    build: "Lessons built around the work they already do.",
    rest: " We're building a course like this for a client's students right now.",
  },
];

const ROWS = [
  "Answering the same emails",
  "Updating the lead spreadsheet",
  "Building the weekly report",
];
const DAYS = ["M", "T", "W", "T", "F"];
// Which days each job lands on in the example week. Illustrative only.
const BUSY = [
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [0, 0, 0, 0, 1],
];

/* An example week: the repeat jobs start as grey blocks done by hand, then a
 * cardinal sweep hands each to a system and a check marks it handled. Timed
 * from load, once; reduced motion shows the finished week. */
function Week() {
  const x0 = 54;
  const step = 9;
  return (
    <svg
      className="f wk"
      viewBox="0 0 100 66"
      role="img"
      aria-labelledby="week-t"
    >
      <title id="week-t">
        An example week. Answering the same emails, updating the lead
        spreadsheet and building the weekly report each move from being done by
        hand to being drafted by AI and checked by your team.
      </title>
      {DAYS.map((d, i) => (
        <text
          key={i}
          className="f-label"
          x={x0 + i * step + 3.5}
          y="7"
          textAnchor="middle"
        >
          {d}
        </text>
      ))}
      {ROWS.map((r, ri) => {
        const y = 12 + ri * 13;
        return (
          <g key={r}>
            <text className="f-label f-label-ink" x="3" y={y + 5}>
              {r}
            </text>
            {DAYS.map((_, di) =>
              BUSY[ri][di] ? (
                <g
                  key={di}
                  className="wk-cell"
                  style={{ ["--d" as string]: 900 + (ri * 5 + di) * 70 }}
                >
                  <rect
                    className="wk-hand"
                    x={x0 + di * step}
                    y={y}
                    width="7"
                    height="7"
                  />
                  <rect
                    className="wk-ai"
                    x={x0 + di * step}
                    y={y}
                    width="7"
                    height="7"
                  />
                  <path
                    className="wk-tick"
                    d={`M${x0 + di * step + 1.8} ${y + 3.7} l1.5 1.5 l2.6 -3`}
                  />
                </g>
              ) : (
                <rect
                  key={di}
                  className="f-mute"
                  x={x0 + di * step}
                  y={y}
                  width="7"
                  height="7"
                />
              ),
            )}
          </g>
        );
      })}
      <path className="f-mute" d="M3 52 L97 52" />
      <rect className="wk-legend-hand" x="3" y="57" width="4" height="4" />
      <text className="f-label" x="9" y="60.4">
        By hand
      </text>
      <rect className="f-sky" x="34" y="57" width="4" height="4" />
      <path className="wk-tick is-static" d="M34.9 59.1 l0.9 0.9 l1.6 -1.9" />
      <text className="f-label" x="40" y="60.4">
        Drafted by AI, checked by your team
      </text>
    </svg>
  );
}

export default function WorkWithUsPage() {
  return (
    <Shell>
      <div className="pgx">
        <section className="pg-hero" aria-labelledby="wwu-title">
          <div className="pg-hero-in">
            <div className="pg-hero-copy">
              <p className="pg-kicker">For companies</p>
              <h1 id="wwu-title" className="pg-title">
                Tell us what&apos;s eating your team&apos;s time, and we&apos;ll
                set up AI to take it on.
              </h1>
              <p className="pg-lead">
                We&apos;re USC&apos;s AI implementation lab, students who do
                whatever AI work a business needs. You don&apos;t need to know
                anything about AI to work with us. Tell us the problem in plain
                words, and we&apos;ll tell you plainly whether we can take it
                on.
              </p>
              <div className="pg-actions">
                <a href="#intake" className="btn btn-primary">
                  Tell us the problem{" "}
                  <span className="arrow" aria-hidden="true">
                    &darr;
                  </span>
                </a>
                <a href="#examples" className="btn btn-secondary">
                  See examples
                </a>
              </div>
            </div>
            <figure className="pg-figure">
              <Week />
            </figure>
          </div>
        </section>

        <section className="pg-sec" id="examples" aria-labelledby="ex-title">
          <div className="pg-head">
            <h2 id="ex-title" className="pg-h2">
              What that looks like
            </h2>
            <p>
              These are examples of the kind of work we take on, not a list of
              past clients.
            </p>
          </div>
          <ul className="pg-ex" role="list">
            {EXAMPLES.map((e) => (
              <li key={e.problem}>
                <span className="pg-ex-q">{e.problem}</span>
                <span className="pg-ex-arrow" aria-hidden="true" />
                <span className="pg-ex-a">
                  <b>{e.build}</b>
                  {e.rest}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="pg-sec" id="how" aria-labelledby="how-title">
          <div className="pg-head">
            <h2 id="how-title" className="pg-h2">
              How it works
            </h2>
          </div>
          <ol className="pg-steps">
            <li>
              <span>You tell us the problem</span>
              It takes a few minutes on the form below.
            </li>
            <li>
              <span>We say yes or no, early</span>
              If it&apos;s work we can&apos;t finish, our first reply says so.
            </li>
            <li>
              <span>We build it in your tools</span>
              It runs on your accounts and your data, so nothing has to move
              when we&apos;re done.
            </li>
            <li>
              <span>We hand it to your team</span>A named person on your team
              gets it, with the steps written down.
            </li>
          </ol>
          <div className="pg-no">
            <h3>What we turn down</h3>
            <p>
              Clinical or licensed work, on-site physical work, and hard
              engineering like avionics or propulsion. We&apos;ll also say no to
              anything the first status update would show we can&apos;t do.
            </p>
          </div>
        </section>

        <section className="pg-sec" id="intake" aria-labelledby="intake-title">
          <div className="pg-head">
            <h2 id="intake-title" className="pg-h2">
              What&apos;s eating your team&apos;s time?
            </h2>
            <p>
              Tell us in plain words. You don&apos;t need to know what the fix
              is.
            </p>
            {/* [NEED: pricing for non-YC companies. Nothing on record for TTS
             * engagements, so no price is on the page.] */}
          </div>
          <div className="pg-formwrap">
            <IntakeForm />
          </div>
          <p className="label mt-m">
            Want to sponsor the club, speak at a meeting or recruit from it
            instead?{" "}
            <Link className="link" href="/partner">
              That form is here
            </Link>
            .{" "}
            <TcLink className="link" hideWhenPending>
              A YC company? T Combinator is for you.
            </TcLink>
          </p>
        </section>
      </div>
    </Shell>
  );
}
