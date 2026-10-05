import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { TC_URL } from "@/components/tts/links";

export const metadata: Metadata = {
  title: "For companies | Trojan Tech Solutions",
  description:
    "USC students who build the tool, hand it to an owner on your team, write the SOP, and measure the change.",
};

const STEPS = [
  { title: "You tell us the problem", body: "What happens today, and what you wish happened instead. The form takes a few minutes." },
  { title: "We say yes or no, early", body: "If it is work we cannot finish, you hear that in the first reply, not in week three." },
  { title: "We scope one thing", body: "One problem, one tool, and the number we will measure before and after." },
  { title: "We build it in your stack", body: "Your accounts, your data, your tools, so nothing has to be migrated when we leave." },
  { title: "We hand it over", body: "To a named person on your team, with the SOP written down." },
];

export default function WorkWithUsPage() {
  return (
    <Shell>
      <section className="hero col section-head prose" aria-labelledby="wwu-title">
        <h1 id="wwu-title" className="t-h2">
          Bring us a problem a tool could solve.
        </h1>
        <p className="t-lead">
          We are USC students who do engineering and GTM engineering for companies. You get a working tool, a person on
          your team who owns it, the SOP, and a number measured before and after.
        </p>
        <div className="row-actions">
          <Link href="/work-with-us/form" className="btn btn-primary">
            Tell us the problem <span className="arrow" aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>

      <section className="section col section-head" aria-labelledby="what-title">
        <h2 id="what-title" className="t-h2">
          The work we take
        </h2>
        <ul className="plain-list mt-m">
          <li>
            <span className="t-h3">Engineering</span>
            <p>Internal tools, automations that replace a manual process, and the glue between systems you already pay for.</p>
          </li>
          <li>
            <span className="t-h3">GTM engineering</span>
            <p>Lists, enrichment, outbound, CRM hygiene and the dashboards that tell you whether any of it worked.</p>
          </li>
        </ul>
        <p className="mt-m">
          The homepage runs a real example in your browser: a public job board read as a client pipeline, with the check
          that caught a misattributed number before it led the list.{" "}
          <Link className="link" href="/#run">
            Watch it run
          </Link>
          .
        </p>
      </section>

      <section className="section col section-head" aria-labelledby="no-title">
        <h2 id="no-title" className="t-h2">
          The work we turn down
        </h2>
        <p className="t-lead">Clinical or licensed work, on-site physical work, and hard engineering such as avionics, composites or propulsion. We also say no to anything where the first status update would show we cannot do it.</p>
      </section>

      <section className="section col section-head" aria-labelledby="how-title">
        <h2 id="how-title" className="t-h2">
          How it goes
        </h2>
        <ol className="plain-list steps mt-m">
          {STEPS.map((s) => (
            <li key={s.title}>
              <span className="t-h3">{s.title}</span>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        {/* [NEED: pricing for non-YC companies. POSITIONING.md records the
          * T Combinator model as free for the first cohort and paid after,
          * and nothing for TTS engagements, so no price is on the page.] */}
        <div className="row-actions">
          <Link href="/work-with-us/form" className="btn btn-primary">
            Tell us the problem <span className="arrow" aria-hidden="true">&rarr;</span>
          </Link>
          <a href={TC_URL} className="btn btn-secondary">
            A YC company? Go to T Combinator
          </a>
        </div>
        <p className="label mt-m">
          Want to sponsor the club, speak at a meeting or recruit from it instead?{" "}
          <Link className="link" href="/partner">
            That form is here
          </Link>
          .
        </p>
      </section>
    </Shell>
  );
}
