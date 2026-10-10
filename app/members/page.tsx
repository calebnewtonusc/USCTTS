import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import DotFloor from "@/components/tts/landing/DotFloor";
import { mono } from "@/components/tts/v4/mono";
import { ADVISORS, ALUMNI, LEADERSHIP, type Person } from "@/data/people";
import "@/components/tts/pages.css";
import "./members.css";

export const metadata: Metadata = {
  title: "People | Trojan Tech Solutions",
  description:
    "Everyone at Trojan Tech Solutions: the team running it, the club advisors, and the people who started here and where they went.",
};

/*
 * /members, the full roster (Caleb, 2026-10-10: the people page's story
 * moved into home's "meet the team"; this page is everyone, in one place,
 * so the two never show the same animation). Three groups, each person
 * once, each linking to their LinkedIn in a new tab where the URL is on
 * disk (data/people.ts). The cardinal point marks the card under the
 * pointer, as on home.
 */

const GROUPS: {
  id: string;
  n: string;
  label: string;
  title: string;
  people: Person[];
  tone: string;
}[] = [
  {
    id: "team",
    n: "01",
    label: "the team",
    title: "Running it now.",
    people: LEADERSHIP,
    tone: "#fff3cc",
  },
  {
    id: "advisors",
    n: "02",
    label: "club advisors",
    title: "Open to a coffee chat anytime.",
    people: ADVISORS,
    tone: "#e9f2e0",
  },
  {
    id: "alumni",
    n: "03",
    label: "started at TTS",
    title: "Where the people who started here went.",
    people: ALUMNI,
    tone: "#e6f0f9",
  },
];

function says(p: Person) {
  if (!p.link) return null;
  if (p.link.includes("linkedin.com")) return "LinkedIn";
  if (p.link.includes("usc.edu")) return "Faculty page";
  return "Website";
}

function Card({ p }: { p: Person }) {
  const where = p.company ? `${p.role}, ${p.company}` : p.role;
  const inner = (
    <>
      <span className="mr-face">
        {p.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="mr-ini">
            {p.name
              .split(" ")
              .map((s) => s[0])
              .join("")}
          </span>
        )}
        <span className="mr-dot" aria-hidden="true" />
      </span>
      <span className="mr-body">
        <b>{p.name}</b>
        <span className="mr-role">{where}</span>
        {p.bio && <span className="mr-bio">{p.bio}</span>}
        {says(p) && (
          <span className="mr-go">
            {says(p)} <span aria-hidden="true">&#8599;</span>
          </span>
        )}
      </span>
    </>
  );
  return (
    <li className="mr-card">
      {p.link ? (
        <a
          href={p.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mr-in"
          aria-label={`${p.name}, ${where}, ${says(p)} (opens in a new tab)`}
        >
          {inner}
        </a>
      ) : (
        <div className="mr-in is-static">{inner}</div>
      )}
    </li>
  );
}

export default function MembersPage() {
  const total = LEADERSHIP.length + ADVISORS.length + ALUMNI.length;
  return (
    <Shell>
      <div className={`pgx mr ${mono.variable}`}>
        <header className="mr-head">
          {/* The city the roster comes from: the opener's points around
           * USC, the same floor home's scenes stand on. */}
          <div className="mr-floor" aria-hidden="true">
            <DotFloor win={[-2600, -2000, 2600, 2000]} usc hold max={3200} alpha={0.3} />
          </div>
          <p className="mr-mark">
            <span className="mr-mark-dot" aria-hidden="true" />
            people
          </p>
          <h1>
            Everyone at TTS <em>is on this page.</em>
          </h1>
          <ul className="mr-counts" aria-label="Counts">
            {GROUPS.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`}>
                  <b>{g.people.length}</b> {g.label}
                </a>
              </li>
            ))}
            <li className="mr-total">
              <b>{total}</b> people
            </li>
          </ul>
        </header>

        {GROUPS.map((g) => (
          <section
            key={g.id}
            id={g.id}
            className="mr-sec"
            aria-labelledby={`mr-${g.id}-h`}
            style={{ "--tone": g.tone } as CSSProperties}
          >
            <div className="mr-sec-head">
              <p className="mr-mark">
                <span className="mr-n">{g.n}</span> {g.label}
              </p>
              <h2 id={`mr-${g.id}-h`}>{g.title}</h2>
            </div>
            <ul className={`mr-grid is-${g.id}`}>
              {g.people.map((p) => (
                <Card key={p.name} p={p} />
              ))}
            </ul>
          </section>
        ))}

        <section className="mr-close" aria-labelledby="mr-close-h">
          <h2 id="mr-close-h">Want to be on this page next?</h2>
          <Link href="/apply" className="btn btn-primary">
            Join TTS{" "}
            <span className="arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </section>
      </div>
    </Shell>
  );
}
