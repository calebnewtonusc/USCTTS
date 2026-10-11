import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import DotFloor from "@/components/tts/landing/DotFloor";
import WorldArcs, { type Place } from "@/components/tts/landing/WorldArcs";
import { mono } from "@/components/tts/v4/mono";
import { CALENDLY_URL } from "@/lib/contact";
import Drift from "@/components/tts/Drift";
import Builds from "./Builds";
import HowRuns from "./HowRuns";
import Inbox from "./Inbox";
import "@/components/tts/pages.css";
import "./company.css";
import "./story.css";

export const metadata: Metadata = {
  title: "For companies | Trojan Tech Solutions",
  description:
    "USC students build the AI your team needs: automations, CRMs, outbound and training, for companies and nonprofits anywhere in the world. Book 30 minutes with Caleb.",
};

/*
 * For companies (Caleb, 2026-10-10: "The company page lame af"). The reader
 * is a business owner who doesn't know much about AI, often arriving from a
 * cold email. The page answers their questions in the order they ask them:
 * what is this (the inbox and the fix), can students really do it (the
 * official partnership, straight after), what exactly would you build (each
 * of the four shown changing), have you done it for anyone (the world map),
 * what does it cost my team in time (one call, the build, the handover), and
 * how do I start (one call to book). Same world as home (docs/INTENT-home.md, "One world"):
 * the field's points, USC's cardinal point, mono for small data.
 *
 * Facts only from disk: the four things are Caleb's own list (RUBRIC, home's
 * statement); the client places and fields are Tyler's (voice memo
 * 2026-10-09); the partners line is Statement.tsx's. No client is named and
 * no result is claimed. The examples are examples of the work, labelled so.
 */

// Country centres: the sources name countries, never cities.
const PLACES: Place[] = [
  {
    id: "ng",
    name: "Nigeria",
    note: "AI curriculum",
    lat: 9.08,
    lon: 8.68,
    up: true,
  },
  { id: "gh", name: "Ghana", note: "healthcare", lat: 7.95, lon: -1.02 },
  // Tyler, 2026-10-10: Yemen off ("we don't have that"), Kenya on.
  { id: "ke", name: "Kenya", lat: -0.02, lon: 37.91 },
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
            {/* The pain in the visitor's words, then the fix, with the
             * example inbox beside the lede as the proof (Caleb,
             * 2026-10-10, on "Sound like your front desk?": "This question
             * doesn't rlly make sense with no context???"). The 41 and the
             * hour are the example card's own (Inbox.tsx); no result is
             * claimed. */}
            <div className="co-hero-head">
              <p className="co-mark is-light">
                <span className="co-dot" aria-hidden="true" />
                for companies and nonprofits
              </p>
              <h1 id="co-h" className="co-h1">
                <span>41 unread before 10am?</span>{" "}
                <em>We build the AI that answers them.</em>
              </h1>
            </div>
            <div className="co-hero-copy">
              <p className="co-lede">
                USC students take it off your plate: automations, CRMs,
                outbound, and training for your team, anywhere in the world.
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

        {/* 2. Who we build with, straight after the promise: the owner's
         * first question is whether students can really do this, and the
         * partnership is the strongest answer (Caleb, 2026-10-10: "lead
         * with it"). The marks are loud; the BMA credit stays one quiet
         * line under them. */}
        <section className="cp" aria-labelledby="co-pt-h">
          <div className="co-wrap cp-in">
            <p className="co-mark">
              <span className="co-n">01</span> who we build with
            </p>
            <h2 id="co-pt-h" className="cp-h">
              Built on Clay and Perplexity, <em>as their official partners.</em>
            </h2>
            <ul className="cp-marks" aria-label="Our official partners">
              <li className="cp-tile is-clay" data-drift="0.12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/tts/partners/clay.png"
                  alt="Clay"
                  width={800}
                  height={252}
                />
              </li>
              <li className="cp-tile is-pplx" data-drift="0.2">
                <span className="cp-pplx">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/tts/partners/perplexity.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                  Perplexity
                </span>
              </li>
            </ul>
            <p className="cp-line">
              The tools real companies pay for to find their customers, set up
              inside your business.
            </p>
            <p className="co-via">
              Official partners through Blue Modern Advisory
            </p>
          </div>
        </section>

        <div className="co-seam" data-transition aria-hidden="true">
          <DotFloor win={[-5200, -900, 5200, 900]} max={2200} alpha={0.26} />
        </div>

        {/* 3. What we build for each job eating their week, each one shown
         * changing from the problem to the build (Builds.tsx). Caleb,
         * 2026-10-11, on "We'd build this instead.": copy that leaves a
         * reader asking "instead of what" breaks the page's story. Each
         * heading picks up the one before it. */}
        <Builds />

        {/* 4. The work is real, and it isn't only in LA. */}
        <section className="co-world" aria-labelledby="co-world-h">
          <div className="co-wrap">
            <p className="co-mark is-light">
              <span className="co-n">03</span> real work
            </p>
            <h2 id="co-world-h" className="co-h2">
              Our client work <em>reaches from Nigeria to Kenya.</em>
            </h2>
            <div data-drift="0.16">
              <WorldArcs places={PLACES} />
            </div>
            <ul
              className="co-legend"
              aria-label="Client projects"
              data-drift="0.11"
            >
              <li>
                <span className="co-code">NG</span> Nigeria, a student
                education nonprofit, 10,000+ students
              </li>
              <li>
                <span className="co-code">GH</span> Ghana, a mobile healthcare unit,
                over 9,000 rural patients
              </li>
              <li>
                <span className="co-code">KE</span> Kenya, mosquito treatment
                and cancer therapeutics
              </li>
            </ul>
          </div>
        </section>

        {/* 5. How a project runs, one point along three steps (HowRuns.tsx). */}
        <HowRuns />

        {/* 6. The one call. */}
        <section className="co-end" aria-labelledby="co-end-h">
          {/* The streets around USC under the one call, drifting, so the
           * band's open right side holds the city it answers from. */}
          <div className="co-end-floor" aria-hidden="true">
            <DotFloor
              win={[-5200, -1600, 5200, 1600]}
              color="#ffffff"
              alpha={0.5}
              max={2800}
              hold
            />
          </div>
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
      <Drift scope=".co" />
    </Shell>
  );
}
