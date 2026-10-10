import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import DotFloor from "@/components/tts/landing/DotFloor";
import WorldArcs, { type Place } from "@/components/tts/landing/WorldArcs";
import { mono } from "@/components/tts/v4/mono";
import { CALENDLY_URL } from "@/lib/contact";
import Inbox from "./Inbox";
import "@/components/tts/pages.css";
import "./company.css";

export const metadata: Metadata = {
  title: "For companies | Trojan Tech Solutions",
  description:
    "USC students build the AI your team needs: automations, CRMs, outbound and training, for companies and nonprofits anywhere in the world. Book 30 minutes with Caleb.",
};

/*
 * For companies (Caleb, 2026-10-10: "The company page lame af"). The reader
 * is a business owner who doesn't know much about AI. The page is one trip:
 * the week they already have (an example inbox), what we'd build instead
 * (the four things TTS builds, each one problem and one build), the real
 * work around the world, the tools it's built on, how a project runs, and
 * one call to book. Same world as home (docs/INTENT-home.md, "One world"):
 * the field's points, USC's cardinal point, mono for small data.
 *
 * Facts only from disk: the four things are Caleb's own list (RUBRIC, home's
 * statement); the client places and fields are Tyler's (voice memo
 * 2026-10-09); the partners line is Statement.tsx's. No client is named and
 * no result is claimed. The examples are examples of the work, labelled so.
 */

const BUILDS = [
  {
    kind: "automations",
    tone: "is-blush",
    problem: "The same emails, all week",
    build: "AI drafts the replies, you approve them",
  },
  {
    kind: "CRMs",
    tone: "is-sky",
    problem: "Leads in a spreadsheet",
    build: "A CRM that fills itself in",
  },
  {
    kind: "outbound",
    tone: "is-gold",
    problem: "Hours finding who to sell to",
    build: "A list of who's worth reaching, and the first email",
  },
  {
    kind: "training",
    tone: "is-leaf",
    problem: "Staff new to AI",
    build: "Lessons built around their own work",
  },
];

// Country centres: the sources name countries, never cities.
const PLACES: Place[] = [
  { id: "ng", name: "Nigeria", note: "AI curriculum", lat: 9.08, lon: 8.68, up: true },
  { id: "gh", name: "Ghana", note: "healthcare", lat: 7.95, lon: -1.02 },
  { id: "ye", name: "Yemen", lat: 15.55, lon: 48.52 },
];

const STEPS = [
  {
    n: "01",
    title: "A 30-minute call",
    line: "Tell us what's eating your team's time.",
  },
  {
    n: "02",
    title: "We build it in your tools",
    line: "Wherever you are, in the software you already use.",
  },
  {
    n: "03",
    title: "We hand it to your team",
    line: "We teach your team to run it.",
  },
];

function BookButton({ big = false }: { big?: boolean }) {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`co-book${big ? " is-big" : ""}`}
    >
      Book 30 minutes with Caleb <span aria-hidden="true">&rarr;</span>
    </a>
  );
}

export default function WorkWithUsPage() {
  return (
    <Shell>
      <div className={`pgx co ${mono.variable}`}>
        {/* 1. The week they already have. */}
        <section className="co-hero" aria-labelledby="co-h">
          <div className="co-hero-floor" aria-hidden="true">
            <DotFloor
              win={[-3600, -2400, 3600, 2400]}
              color="#ffcc00"
              alpha={0.34}
              usc
              hold
              max={4200}
            />
          </div>
          <div className="co-wrap co-hero-in">
            <div className="co-hero-copy">
              <p className="co-mark is-light">
                <span className="co-dot" aria-hidden="true" />
                for companies and nonprofits
              </p>
              <h1 id="co-h" className="co-h1">
                Sound like <em>your front desk?</em>
              </h1>
              <p className="co-lede">
                USC students build the AI that takes it off your plate:
                automations, CRMs, outbound, and training for your team,
                anywhere in the world.
              </p>
              <div className="co-actions">
                <BookButton />
                <Link href="/work-with-us/form" className="co-write">
                  or write it down
                </Link>
              </div>
            </div>
            <Inbox />
          </div>
        </section>

        {/* 2. What we'd build instead. */}
        <section className="co-sec" aria-labelledby="co-build-h">
          <div className="co-wrap">
            <p className="co-mark">
              <span className="co-n">01</span> what we build
            </p>
            <h2 id="co-build-h" className="co-h2">
              We&apos;d build <em>this instead.</em>
            </h2>
            <ol className="co-builds">
              {BUILDS.map((b, i) => (
                <li key={b.kind} className={`co-build ${b.tone}`}>
                  <span className="co-build-k">
                    <span className="co-n">
                      {String(i + 1).padStart(2, "0")}
                    </span>{" "}
                    {b.kind}
                  </span>
                  <span className="co-build-p">{b.problem}</span>
                  {/* The turn from the problem to the build, in the field's
                   * points: five dots and a head. */}
                  <svg className="co-build-arrow" viewBox="0 0 44 10" aria-hidden="true">
                    {[2, 9, 16, 23, 30].map((x) => (
                      <circle key={x} cx={x} cy="5" r="1.2" />
                    ))}
                    <path d="M35 1.5 L41 5 L35 8.5" />
                  </svg>
                  <b className="co-build-b">{b.build}</b>
                </li>
              ))}
            </ol>
            <p className="co-note">examples of the work, not past clients</p>
          </div>
        </section>

        {/* 3. The work is real, and it isn't only in LA. */}
        <section className="co-world" aria-labelledby="co-world-h">
          <div className="co-wrap">
            <p className="co-mark is-light">
              <span className="co-n">02</span> real work
            </p>
            <h2 id="co-world-h" className="co-h2">
              Our client work <em>reaches from Nigeria to Yemen.</em>
            </h2>
            <WorldArcs places={PLACES} />
            <ul className="co-legend" aria-label="Client projects">
              <li>
                <span className="co-code">NG</span> Nigeria, an AI curriculum
                for an education nonprofit
              </li>
              <li>
                <span className="co-code">GH</span> Ghana, healthcare
              </li>
              <li>
                <span className="co-code">YE</span> Yemen
              </li>
              <li>
                <span className="co-code is-field" aria-hidden="true" /> Cancer
                therapeutics
              </li>
            </ul>
          </div>
        </section>

        {/* 4. The tools, and 5. how a project runs, side by side. */}
        <section className="co-sec" aria-labelledby="co-how-h">
          <div className="co-wrap co-how">
            <div className="co-tools">
              <p className="co-mark">
                <span className="co-n">03</span> the tools
              </p>
              <p className="co-tools-line">
                Built on Clay and Perplexity, the tools real companies pay for
                to find their customers, through our partner Blue Modern
                Advisory.
              </p>
              <div className="co-marks">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/tts/partners/clay.png"
                  alt="Clay"
                  width={110}
                  height={35}
                />
                <span className="co-pplx">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/tts/partners/perplexity.svg"
                    alt=""
                    width={28}
                    height={28}
                  />
                  Perplexity
                </span>
              </div>
            </div>
            <div className="co-steps-wrap">
              <p className="co-mark">
                <span className="co-n">04</span> how it runs
              </p>
              <h2 id="co-how-h" className="co-h2 is-small">
                From one call <em>to a handover.</em>
              </h2>
              <ol className="co-steps">
                {STEPS.map((s) => (
                  <li key={s.n}>
                    <span className="co-step-dot" aria-hidden="true" />
                    <span className="co-n">{s.n}</span>
                    <b>{s.title}</b>
                    <span>{s.line}</span>
                  </li>
                ))}
              </ol>
              <Link href="/way" className="co-way">
                Follow one project, start to finish, in 3D{" "}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. The one call. */}
        <section className="co-end" aria-labelledby="co-end-h">
          <div className="co-wrap co-end-in">
            <h2 id="co-end-h" className="co-end-h">
              Tell us what&apos;s eating your team&apos;s time.
            </h2>
            <div className="co-actions">
              <BookButton big />
              <Link href="/work-with-us/form" className="co-write is-light">
                or write it down
              </Link>
            </div>
            <p className="co-end-meta">calendly, opens in a new tab</p>
          </div>
        </section>
      </div>
    </Shell>
  );
}
