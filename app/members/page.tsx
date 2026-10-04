import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { ADVISORS, ALUMNI, LEADERSHIP, type Person } from "@/data/people";

export const metadata: Metadata = {
  title: "People | Trojan Tech Solutions",
  description: "Who runs Trojan Tech Solutions, the advisors who help run it, and where the alumni are now.",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

function PersonCell({ p, detail }: { p: Person; detail: string }) {
  return (
    <li className="person">
      {p.photo ? (
        <Image src={p.photo} alt="" width={64} height={64} />
      ) : (
        <span className="ph" aria-hidden="true">
          {initials(p.name)}
        </span>
      )}
      <span>
        {p.link ? (
          <a className="person-name link" href={p.link} target="_blank" rel="noreferrer">
            {p.name}
          </a>
        ) : (
          <span className="person-name">{p.name}</span>
        )}
        <span className="person-role">{detail}</span>
      </span>
    </li>
  );
}

export default function MembersPage() {
  return (
    <Shell>
      <section className="hero col section-head prose" aria-labelledby="people-title">
        <h1 id="people-title" className="t-h2">
          The people, by name.
        </h1>
        <p className="t-lead">
          Who runs the club now, the advisors who help run it, and where the people who started here went.
        </p>
      </section>

      <section className="section" aria-labelledby="lead-title">
        <div className="wide section-head">
          <h2 id="lead-title" className="t-h3">
            Running the club
          </h2>
        </div>
        <ul className="wide people mt-s" role="list">
          {LEADERSHIP.map((p) => (
            <PersonCell key={p.name} p={p} detail={p.role} />
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="adv-title">
        <div className="wide section-head">
          <h2 id="adv-title" className="t-h3">
            Advisors
          </h2>
        </div>
        <ul className="wide people mt-s" role="list">
          {ADVISORS.map((p) => (
            <PersonCell key={p.name} p={p} detail={[p.role, p.company].filter(Boolean).join(", ")} />
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="alum-title">
        <div className="wide section-head">
          <h2 id="alum-title" className="t-h3">
            Alumni, and where they are now
          </h2>
        </div>
        <ul className="wide people mt-s" role="list">
          {ALUMNI.map((p) => (
            <PersonCell key={p.name} p={p} detail={`${p.role}, ${p.company}`} />
          ))}
        </ul>
        <div className="wide row-actions">
          <Link href="/apply" className="btn btn-primary">
            Apply to join <span className="arrow" aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </Shell>
  );
}
