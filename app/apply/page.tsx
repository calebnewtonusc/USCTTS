import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import ApplyForm from "@/components/tts/ApplyForm";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Apply | Trojan Tech Solutions",
  description:
    "Apply to Trojan Tech Solutions, USC's AI implementation lab. Learn to build AI in build sessions, then build it for real companies.",
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

export default function ApplyPage() {
  return (
    <Shell>
      <div className="pgx">
        <section className="pg-hero" aria-labelledby="apply-title">
          <div className="pg-hero-in">
            <div className="pg-hero-copy">
              <p className="pg-kicker">Join TTS</p>
              <h1 id="apply-title" className="pg-title">
                Learn to build AI, then build it for{" "}
                <span className="pg-mark">a real company</span>.
              </h1>
              <p className="pg-lead">
                Companies come to us with work they want AI to handle, like
                answering the same emails all week or keeping their customer
                list up to date. You learn how in our build sessions, practice
                on real data, and then do it for them.
              </p>
              <div className="pg-actions">
                <a href="#apply" className="btn btn-primary">
                  Start the application{" "}
                  <span className="arrow" aria-hidden="true">
                    &darr;
                  </span>
                </a>
                <Link href="/members" className="btn btn-secondary">
                  Meet the people
                </Link>
              </div>
            </div>
            <div className="pg-figure">
              <Path />
            </div>
          </div>
        </section>

        <section className="pg-sec" id="apply" aria-labelledby="form-title">
          <div className="pg-head">
            <h2 id="form-title" className="pg-h2">
              Six short questions
            </h2>
            <p>
              The last one matters most. It asks for one thing you&apos;ve made
              or want to make, and it only needs to be yours. You&apos;ll hear
              back at your email whether it&apos;s a yes or a no.
            </p>
            {/* [NEED: the next cohort's application window and reply time. Neither is on record.] */}
          </div>
          <div className="pg-formwrap">
            <ApplyForm />
          </div>
        </section>
      </div>
    </Shell>
  );
}
