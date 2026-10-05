import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { ADVISORS, ALUMNI, LEADERSHIP, type Person } from "@/data/people";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "People | Trojan Tech Solutions",
  description:
    "Who runs Trojan Tech Solutions, the advisors who help run it, and where the alumni are now.",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

/* Where the bench is now, as names on a ring around the club: every company
 * an advisor or alumnus works at, from data/people.ts, so nothing is typed in
 * by hand. Advisor lines are dashed and alumni lines solid, because an
 * advisor never started here and is never called an alumnus. McKinsey sits at
 * the top (Caleb, 2026-10-04). Names, not logos: none of these companies is a
 * client. */
function Ring() {
  const nodes: { name: string; advisor: boolean; alumni: boolean }[] = [];
  const add = (company: string | undefined, advisor: boolean) => {
    if (!company) return;
    const found = nodes.find((n) => n.name === company);
    if (found) {
      if (advisor) found.advisor = true;
      else found.alumni = true;
    } else nodes.push({ name: company, advisor, alumni: !advisor });
  };
  ADVISORS.forEach((p) => add(p.company, true));
  ALUMNI.forEach((p) => add(p.company, false));
  nodes.sort((a, b) =>
    a.name.startsWith("McKinsey") ? -1 : b.name.startsWith("McKinsey") ? 1 : 0,
  );

  const cx = 50;
  const cy = 36;
  return (
    <svg className="f" viewBox="0 0 100 72" role="img" aria-labelledby="ring-t">
      <title id="ring-t">{`Where advisors and alumni work now: ${nodes.map((n) => n.name).join(", ")}.`}</title>
      {nodes.map((n, i) => {
        const a = -Math.PI / 2 + (i / nodes.length) * Math.PI * 2;
        const x = cx + Math.cos(a) * 32;
        const y = cy + Math.sin(a) * 27;
        const lx = cx + Math.cos(a) * 34.5;
        const ly = cy + Math.sin(a) * 30.5;
        const anchor =
          Math.abs(Math.cos(a)) < 0.2
            ? "middle"
            : Math.cos(a) > 0
              ? "start"
              : "end";
        return (
          <g key={n.name}>
            <path
              className={n.alumni ? "f-ink f-draw" : "f-mute f-dash"}
              pathLength={n.alumni ? 1 : undefined}
              d={`M${cx + Math.cos(a) * 6} ${cy + Math.sin(a) * 6} L${x} ${y}`}
            />
            <circle
              className={n.alumni ? "f-fill" : "f-ink f-paper"}
              cx={x}
              cy={y}
              r="0.9"
            />
            <text
              className="f-label f-label-ink"
              x={lx}
              y={ly + 0.9}
              textAnchor={anchor}
            >
              {n.name.replace(" & Company", "")}
            </text>
          </g>
        );
      })}
      <circle className="f-ink f-paper" cx={cx} cy={cy} r="6" />
      <text className="f-label f-big" x={cx} y={cy + 1.2} textAnchor="middle">
        TTS
      </text>
    </svg>
  );
}

function Card({
  p,
  role,
  at,
  tag,
}: {
  p: Person;
  role: string;
  at?: string;
  tag?: string;
}) {
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
        <a
          className="pg-name link"
          href={p.link}
          target="_blank"
          rel="noreferrer"
        >
          {p.name}
        </a>
      ) : (
        <span className="pg-name">{p.name}</span>
      )}
      <span className="pg-role">{role}</span>
      {at && <span className="pg-at">{at}</span>}
      {tag && <span className="pg-tag">{tag}</span>}
    </li>
  );
}

export default function MembersPage() {
  return (
    <Shell>
      <section className="pg-sec pg-view is-top" aria-labelledby="people-title">
        <div className="pg-split is-hero">
          <div>
            <p className="pg-kicker">People</p>
            <h1 id="people-title" className="pg-title">
              The people, by name.
            </h1>
            <p className="pg-lead">
              Who runs the club, the advisors who help run it, and where the
              people who started here went. Names, not logos.
            </p>
            <p className="label mt-m">Solid lines and dots: alumni. Dashed lines and open dots: advisors.</p>
          </div>
          <div className="pg-figure">
            <Ring />
          </div>
        </div>
      </section>

      <section className="pg-sec" aria-labelledby="lead-title">
        <div className="pg-head">
          <h2 id="lead-title">Running it now</h2>
        </div>
        <ul className="pg-lead-grid" role="list">
          {LEADERSHIP.map((p) => (
            <Card key={p.name} p={p} role={p.role} />
          ))}
        </ul>
      </section>

      <section className="pg-sec" aria-labelledby="adv-title">
        <div className="pg-head">
          <h2 id="adv-title">Advisors</h2>
          <p>
            They help run it now. None of them is a client, and we won&apos;t
            dress them up as one.
          </p>
        </div>
        <ul className="pg-cards" role="list">
          {ADVISORS.map((p) => (
            <Card
              key={p.name}
              p={p}
              role={p.role}
              at={p.company}
              tag="Advisor"
            />
          ))}
        </ul>
      </section>

      <section className="pg-sec" aria-labelledby="alum-title">
        <div className="pg-head">
          <h2 id="alum-title">Started here</h2>
          <p>Alumni of the club, and where they are now.</p>
        </div>
        <ul className="pg-cards" role="list">
          {ALUMNI.map((p) => (
            <Card key={p.name} p={p} role={p.role} at={p.company} />
          ))}
        </ul>
        <div className="pg-actions">
          <Link href="/apply" className="btn btn-primary">
            Apply to join{" "}
            <span className="arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </div>
      </section>
    </Shell>
  );
}
