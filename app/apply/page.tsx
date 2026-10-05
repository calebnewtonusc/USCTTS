import type { Metadata } from "next";
import Shell from "@/components/tts/Shell";
import { mono } from "@/components/tts/v4/mono";
import { APPLY_FORM_URL, APPLICATIONS_OPEN } from "@/lib/apply";
import NotifyForm from "./NotifyForm";
import GridEcho from "../work-with-us/GridEcho";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Apply | Trojan Tech Solutions",
  description:
    "Join Trojan Tech Solutions, USC's AI implementation lab. Learn to build AI in build sessions, then build it for real companies.",
};

/* What happens after you apply, as one rail: the three things a member
 * actually does, from docs/COPY-tts.md (build sessions, practice builds on
 * public data, real company work for the strongest teams). Each part
 * arrives in order on load; reduced motion shows it finished. */
const STOPS = [
  { y: 6, title: "You apply", sub: "Caleb, Tyler and Emily read every one" },
  {
    y: 26,
    title: "Build sessions",
    sub: "Hands-on nights where you ship a working piece",
  },
  { y: 46, title: "Practice builds", sub: "Real pipelines on public data" },
  { y: 66, title: "Real company work", sub: "The strongest teams take it on" },
];

function Path() {
  return (
    <svg className="f" viewBox="0 0 100 84" role="img" aria-labelledby="path-t">
      <title id="path-t">
        What happens after you apply: build sessions, then practice builds on
        public data, then real company work for the strongest teams.
      </title>
      <path className="f-mute f-dash" d="M14 12 L14 74" />
      <path
        className="f-live grow"
        style={{ ["--d" as string]: 300 }}
        d="M14 12 L14 74"
      />

      {/* 1: the application, a short form */}
      <g className="in" style={{ ["--d" as string]: 0 }}>
        <rect className="f-sky" x="5" y={STOPS[0].y} width="18" height="13" />
        <path
          className="f-ink"
          d="M8.5 10 L19.5 10 M8.5 13 L16.5 13 M8.5 16 L18 16"
        />
      </g>
      {/* 2: build sessions, a row of nights with the last one shipped */}
      <g className="in" style={{ ["--d" as string]: 260 }}>
        <rect
          className="f-paper f-ink"
          x="5"
          y={STOPS[1].y}
          width="18"
          height="13"
        />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            className={i === 3 ? "f-live-fill" : "f-gray"}
            x={7.5 + i * 3.6}
            y="29"
            width="2.4"
            height="7"
          />
        ))}
      </g>
      {/* 3: practice builds, a small pipeline */}
      <g className="in" style={{ ["--d" as string]: 520 }}>
        <rect
          className="f-paper f-ink"
          x="5"
          y={STOPS[2].y}
          width="18"
          height="13"
        />
        <path className="f-ink" d="M10 52.5 L18 52.5" />
        {[8, 14, 20].map((x) => (
          <rect
            key={x}
            className="f-paper f-ink"
            x={x - 1.6}
            y="50.9"
            width="3.2"
            height="3.2"
          />
        ))}
      </g>
      {/* 4: a real company, one window lit */}
      <g className="in" style={{ ["--d" as string]: 780 }}>
        <rect
          className="f-paper f-ink"
          x="5"
          y={STOPS[3].y}
          width="18"
          height="13"
        />
        <path className="f-ink" d="M9 77 L9 70 L19 70 L19 77" />
        {[11, 14, 17].map((x) => (
          <rect
            key={x}
            className={x === 14 ? "f-gold" : "f-gray"}
            x={x - 0.9}
            y="72"
            width="1.8"
            height="1.8"
          />
        ))}
        <rect className="f-gray" x="10.1" y="74.6" width="1.8" height="1.8" />
        <rect className="f-gray" x="16.1" y="74.6" width="1.8" height="1.8" />
      </g>

      {STOPS.map((s, i) => (
        <g
          key={s.title}
          className="in"
          style={{ ["--d" as string]: 120 + i * 260 }}
        >
          <text className="f-big" x="29" y={s.y + 5.6}>
            {s.title}
          </text>
          <text className="f-label" x="29" y={s.y + 10.2}>
            {s.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* What a member builds, shown working: the lead list from the home page's
 * example week, a dental office in Koreatown, filling itself row by row with
 * a reason and a drafted first email. Timed once on load; reduced motion
 * shows it finished. */
const LEADS = [
  { biz: "Orthodontist", where: "Wilshire Blvd", why: "Refers patients for cleanings, two blocks away" },
  { biz: "Pediatric clinic", where: "Western Ave", why: "Families who need a dentist nearby" },
  { biz: "Coworking space", where: "Wilshire Blvd", why: "Hundreds of people working next door" },
  { biz: "Taekwondo studio", where: "Vermont Ave", why: "Kids' classes, parents asking about mouthguards" },
];

function LeadRun() {
  return (
    <figure className="ix-panel" aria-label="An example lead list a member builds, filling itself">
      <div className="ix-bar">
        <span>Who&apos;s worth reaching, near a Koreatown dental office</span>
        <span>{LEADS.length} found, drafts ready</span>
      </div>
      <ul className="ix-rows">
        <li className="is-head" aria-hidden="true">
          <span>business</span>
          <span>why it&apos;s worth reaching</span>
          <span>email</span>
        </li>
        {LEADS.map((l, i) => (
          <li key={l.biz} style={{ ["--i" as string]: i }}>
            <span className="biz">
              {l.biz}, {l.where}
            </span>
            <span className="why">{l.why}</span>
            <span className="st">drafted</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export default function ApplyPage() {
  return (
    <Shell>
      <div className={`pgx ${mono.variable}`}>
        <section className="ix" aria-labelledby="apply-title">
          <GridEcho />
          <div className="ix-in">
            <div className="pg-hero-copy">
              <h1 id="apply-title" className="ix-line">
                You&apos;d learn to build this.
              </h1>
              {APPLICATIONS_OPEN ? (
                <div className="ix-actions">
                  <a className="btn btn-primary ap-big" href={APPLY_FORM_URL} target="_blank" rel="noreferrer">
                    Apply on Google Forms{" "}
                    <span className="arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </a>
                </div>
              ) : (
                <div className="ix-signup" id="apply">
                  <p className="ix-status">Applications open soon</p>
                  <NotifyForm />
                </div>
              )}
            </div>
            <LeadRun />
          </div>
          <p className="ix-readout">
            <span>34.0224&deg; N 118.2851&deg; W</span>
            <span>USC, University Park</span>
            <span>
              <b>&bull;</b> a member&apos;s build, running
            </span>
          </p>
        </section>

        <section className="pg-sec" aria-labelledby="path-title">
          <div className="pg-split ap-path">
            <h2 id="path-title" className="pg-say">
              Once you&apos;re in, it goes from build sessions to practice builds to real work for real companies.
            </h2>
            <div className="pg-figure">
              <Path />
            </div>
          </div>
        </section>

      </div>
    </Shell>
  );
}
