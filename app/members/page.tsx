import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { ADVISORS, LEADERSHIP, type Person } from "@/data/people";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "People | Trojan Tech Solutions",
  description:
    "Who runs Trojan Tech Solutions, the mentors who help run it, and where the people who started here work now.",
};

/* The same nine marks as the home page's alumni strip, drawn in ink through a
 * mask so they read as one set. Apple stays off until Susan Nyirenda is
 * verified; NBCUniversal, Epic, Roxborough and USC Gould have no clean mark
 * on disk yet. */
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

// Mentors with a company, the same filter the home roster uses.
const MENTORS = ADVISORS.filter((p) => p.company);

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

function Card({ p, at }: { p: Person; at?: string }) {
  return (
    <li className="pg-card">
      <span className="pg-photo">
        {p.photo ? (
          <Image src={p.photo} alt="" width={320} height={400} />
        ) : (
          <span className="pg-ph" aria-hidden="true">
            {initials(p.name)}
          </span>
        )}
      </span>
      {p.link ? (
        <a className="pg-name" href={p.link} target="_blank" rel="noreferrer">
          {p.name}
        </a>
      ) : (
        <span className="pg-name">{p.name}</span>
      )}
      <span className="pg-role">{p.role}</span>
      {at && <span className="pg-at">{at}</span>}
    </li>
  );
}

export default function MembersPage() {
  return (
    <Shell>
      <div className="pgx">
        <section className="pg-hero" aria-labelledby="people-title">
          <div className="pg-hero-in is-people">
            <div className="pg-hero-copy">
              <p className="pg-kicker">People</p>
              <h1 id="people-title" className="pg-title">
                Who you&apos;d be working with.
              </h1>
              <p className="pg-lead">
                Caleb Newton and Tyler Larsen are co-presidents, and Emily Zhao
                leads design. Our mentors come from McKinsey, Google, Reddit,
                Stanford and Mixbook.
              </p>
            </div>
            <ul
              className="pg-lead-grid"
              role="list"
              aria-label="Running it now"
            >
              {LEADERSHIP.map((p) => (
                <Card key={p.name} p={p} />
              ))}
            </ul>
          </div>
        </section>

        <section className="pg-sec" aria-labelledby="mentor-title">
          <div className="pg-head">
            <h2 id="mentor-title" className="pg-h2">
              Mentors
            </h2>
            <p>They help run the club now.</p>
          </div>
          <ul className="pg-cards" role="list">
            {MENTORS.map((p) => (
              <Card key={p.name} p={p} at={p.company} />
            ))}
          </ul>
        </section>

        <section className="pg-sec" aria-labelledby="alum-title">
          <div className="pg-head">
            <h2 id="alum-title" className="pg-h2">
              Where people who started here work
            </h2>
            <p>
              Each mark is a company where someone who started in TTS works now,
              or worked before.
            </p>
          </div>
          <ul className="pg-marks" role="list">
            {ALUMNI_MARKS.map((m) => (
              <li key={m.name}>
                <span
                  className="mk"
                  role="img"
                  aria-label={m.name}
                  style={{ ["--src" as string]: `url(${m.src})` }}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="pg-close" aria-labelledby="close-title">
          <div className="pg-close-inner">
            <div>
              <h2 id="close-title">Want to build with them?</h2>
              <p>
                The application is six short questions, and the last one asks
                for one thing you&apos;ve made or want to make. Caleb, Tyler and
                Emily read every one.
              </p>
            </div>
            <Link href="/apply" className="btn btn-primary">
              Apply to join{" "}
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </section>
      </div>
    </Shell>
  );
}
