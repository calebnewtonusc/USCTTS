import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { mono } from "@/components/tts/v4/mono";
import TcLink from "@/components/tts/TcLink";
import { CALENDLY_URL } from "@/lib/contact";
import IntakeForm from "@/components/tts/IntakeForm";
import GridEcho from "./GridEcho";
import Inbox from "./Inbox";
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

export default function WorkWithUsPage() {
  return (
    <Shell>
      <div className={`pgx ${mono.variable}`}>
        <section className="ix" aria-labelledby="wwu-title">
          <GridEcho />
          <div className="ix-in">
            <div className="pg-hero-copy">
              <h1 id="wwu-title" className="ix-line">
                Sound like your front desk?
              </h1>
              <div className="ix-actions">
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Book 30 minutes with Caleb{" "}
                  <span className="arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </a>
                <a href="#intake" className="btn btn-secondary">
                  Or write it down
                </a>
              </div>
            </div>
            <Inbox />
          </div>
          <p className="ix-readout">
            <span>34.0617&deg; N 118.3009&deg; W</span>
            <span>Koreatown, an example</span>
            <span>
              <b>&bull;</b> 9:14 am, inbox still filling
            </span>
          </p>
        </section>

        <section className="pg-sec" id="examples" aria-labelledby="ex-title">
          <p id="ex-title" className="pg-say">
            Email is one part of it. Here&apos;s what we&apos;d build for the rest of a week like that.
          </p>
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
          <p className="pg-mono-note">examples of the work, not a list of past clients</p>
        </section>

        <section className="pg-sec" id="how" aria-label="How it works">
          
          <div className="pg-prose">
            <p>
              You tell us the problem on the form below, and our first reply says yes or no, so you never find out in
              week three that we can&apos;t do it.
            </p>
            <p>
              If it&apos;s a yes, we build it on your own accounts and tools, so nothing has to move when we&apos;re done,
              and we hand it to a named person on your team with the steps written down.
            </p>
          </div>
          <div className="pg-prose">
            <p>And there are a few things we&apos;ll always say no to, along with anything the first status update would show we can&apos;t do:</p>
          </div>
          <ul className="pg-nos" aria-label="What we turn down">
            <li>Clinical or licensed work</li>
            <li>On-site physical work</li>
            <li>Hard engineering, like avionics or propulsion</li>
          </ul>
        </section>

        <section className="pg-sec" id="intake" aria-labelledby="intake-title">
          <h2 id="intake-title" className="pg-say">
            Or tell us what&apos;s eating your team&apos;s time, in plain words.
          </h2>
          {/* [NEED: pricing for non-YC companies. Nothing on record for TTS
           * engagements, so no price is on the page.] */}
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
