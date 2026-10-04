import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { LEADERSHIP } from "@/data/people";

export const metadata: Metadata = {
  title: "About | Trojan Tech Solutions",
  description:
    "USC's applied AI implementation club. Real work for companies, in engineering and GTM engineering, that ends with something running.",
};

const ENDS_WITH = [
  { title: "A working tool", body: "Something that runs inside the company's own stack, not a prototype on our laptops." },
  { title: "A person who owns it", body: "Someone on their team whose job includes it after we leave." },
  { title: "The SOP, written down", body: "So the next person can run it without calling us." },
  { title: "A number, before and after", body: "Measured on their side, so the change is theirs to check." },
];

export default function AboutPage() {
  const names = LEADERSHIP.map((p) => p.name);
  const team = `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return (
    <Shell>
      <section className="hero col section-head prose" aria-labelledby="about-title">
        <h1 id="about-title" className="t-h2">
          We build things companies keep running.
        </h1>
        <p className="t-lead">
          Trojan Tech Solutions is USC&apos;s applied AI implementation club. We do real work for companies, across
          engineering and GTM engineering, and we teach people to finesse it for companies, for their own lives, and
          anything in between.
        </p>
      </section>

      <section className="section col section-head prose" aria-labelledby="format-title">
        <h2 id="format-title" className="t-h2">
          Why the format matters
        </h2>
        <p>
          A lot of student consulting stops at a recommendation. The deck is the deliverable, the members present it,
          and then they leave before anything ships. A lot of the time it is never implemented, and nobody touches a
          tool the client keeps using after the semester ends.
        </p>
        <p>
          The people in those clubs are talented. The format is what stops the work, so the format is what we
          changed, and every engagement here is scoped to end with four things.
        </p>
        <ul className="plain-list mt-m">
          {ENDS_WITH.map((e) => (
            <li key={e.title}>
              <span className="t-h3">{e.title}</span>
              <p>{e.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section col section-head prose" aria-labelledby="learn-title">
        <h2 id="learn-title" className="t-h2">
          What you learn here
        </h2>
        <p>
          The two halves of the work are engineering, meaning the tool itself, and GTM engineering, meaning the
          lists, enrichment, outbound and data plumbing that a growing company runs on. Both get learned the same way:
          on real data, with a real reader for the result.
        </p>
        <p>
          The homepage runs one example in your browser, a pipeline over a public job board, including the check that
          caught a misattributed number before it went to the top of a list. That check is the habit we care about most.{" "}
          <Link className="link" href="/#run">
            Watch it run
          </Link>
          .
        </p>
      </section>

      <section className="section col section-head prose" aria-labelledby="who-title">
        <h2 id="who-title" className="t-h2">
          Who runs it
        </h2>
        {/* POSITIONING.md: "Dormant to a real roster in three months, with zero members inherited." */}
        <p>
          The club went from dormant to a real roster in three months, with zero members inherited. It is run by{" "}
          {team}, with advisors who help run it now and the alumni who started here. They are all on{" "}
          <Link className="link" href="/members">
            the people page
          </Link>
          .
        </p>
        <div className="row-actions">
          <Link href="/apply" className="btn btn-primary">
            Apply to join <span className="arrow" aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </Shell>
  );
}
