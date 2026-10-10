import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { mono } from "@/components/tts/v4/mono";
import { CALENDLY_URL } from "@/lib/contact";
import GridEcho from "./GridEcho";
import Inbox from "./Inbox";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "For companies | Trojan Tech Solutions",
  description:
    "Tell USC's AI implementation lab what's eating your team's time. We set up AI to take on repeat work, like answering the same emails, keeping leads organized, building reports and teaching your staff.",
};

/* The reader is a business owner who doesn't know much about AI. Caleb,
 * 2026-10-05: the old page was "a FAT wall of text", so each example is one
 * line, the problem then what we'd build, a few words each. Examples of the
 * work, never past results. */
const EXAMPLES = [
  { problem: "The same emails, all week", build: "AI drafts the replies, you approve them" },
  { problem: "Leads in a spreadsheet", build: "a CRM that fills itself in" },
  { problem: "Friday's report, by hand", build: "a report that builds itself" },
  { problem: "Hours finding who to sell to", build: "a list of who's worth reaching" },
  { problem: "Staff new to AI", build: "lessons built around their own work" },
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
                <Link href="/work-with-us/form" className="btn btn-secondary">
                  Or write it down
                </Link>
              </div>
            </div>
            <Inbox />
          </div>
          <p className="ix-readout">
            <span>an example inbox</span>
            <span>
              <b>&bull;</b> 9:14 am
            </span>
          </p>
        </section>

        <section className="pg-sec wu-body" id="examples" aria-label="What we'd build, and how it works">
          <ul className="wu-ex" role="list">
            {EXAMPLES.map((e) => (
              <li key={e.problem}>
                <span className="wu-q">{e.problem}</span>
                <span className="pg-ex-arrow" aria-hidden="true" />
                <span className="wu-a">{e.build}</span>
              </li>
            ))}
          </ul>
          <p className="pg-mono-note">examples of the work, not past clients</p>
          <p className="wu-how">
            Book a call. If it&apos;s a yes, we build it in your own tools, wherever you are, and hand it to your team.
          </p>
          <div className="ix-actions">
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Book 30 minutes with Caleb{" "}
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </a>
            <Link href="/work-with-us/form" className="btn btn-secondary">
              Or write it down
            </Link>
          </div>
        </section>
      </div>
    </Shell>
  );
}
