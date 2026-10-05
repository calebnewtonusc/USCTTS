import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { ADVISORS, LEADERSHIP } from "@/data/people";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "About | Trojan Tech Solutions",
  description:
    "USC's AI implementation lab. Members do whatever AI work a company needs, automations, CRM, GTM engineering, agents, even teaching their people, and learn it by building it.",
};

/* The machine, drawn as a hairline diagram in a 100 x 104 box. One part per
 * step: each sits faint until its step is read, and its cardinal mark is on
 * only while that step is on screen. The objects are the home page world's,
 * flattened: accounts, the funnel, the magnifier, agent stations, a product,
 * the mailbox, the climbing pipeline and the people who run it. */

const GRID = Array.from({ length: 32 }, (_, i) => ({
  x: 8 + (i % 8) * 5.6,
  y: 7 + Math.floor(i / 8) * 5.6,
}));
// Enriched accounts: a fixed, irregular set, so the field reads as data.
const ENRICHED = new Set([2, 5, 9, 12, 14, 19, 22, 27, 29]);
const STATIONS = [12, 31, 50, 69];
const BARS = [5, 8, 11, 15, 20];

function Machine() {
  return (
    <svg
      className="f"
      viewBox="0 0 100 104"
      role="img"
      aria-labelledby="machine-t"
    >
      <title id="machine-t">
        The machine a member learns to build: accounts flow through enrichment
        and qualification to agents, into a product and outbound, and a pipeline
        climbs.
      </title>

      {/* 01 data sets: the accounts field */}
      <g className="s-on2">
        <text className="f-label" x="8" y="3.6">
          Accounts
        </text>
        {GRID.map((c, i) => (
          <rect
            key={i}
            className="f-ink"
            x={c.x}
            y={c.y}
            width="3.4"
            height="3.4"
          />
        ))}
      </g>
      <g className="s-hot2">
        {GRID.filter((_, i) => ENRICHED.has(i)).map((c, i) => (
          <rect
            key={i}
            className="f-live-fill"
            x={c.x + 0.7}
            y={c.y + 0.7}
            width="2"
            height="2"
          />
        ))}
      </g>

      {/* 02 GTM engineering: into the funnel, through the magnifier */}
      <g className="s-on3">
        <path className="f-mute" d="M50.5 10.5 C56 10.5 57 9 61 9" />
        <path className="f-mute" d="M50.5 16 C56 16 58 11 63 10.5" />
        <path className="f-mute" d="M50.5 21.6 C57 21.6 60 12.5 65 11.5" />
        <ellipse className="f-ink" cx="76" cy="9" rx="15" ry="3.2" />
        <path className="f-ink" d="M61 9 L73 27 L79 27 L91 9" />
        <path className="f-ink" d="M73 27 L73 30 L79 30 L79 27" />
        <text className="f-label" x="71" y="29.4" textAnchor="end">
          Enrich
        </text>
        <circle className="f-ink" cx="76" cy="38" r="4.6" />
        <path className="f-ink" d="M79.3 41.3 L83.5 45.5" />
        <path className="f-ink" d="M76 30 L76 33.4" />
        <text className="f-label" x="86" y="39">
          Qualify
        </text>
      </g>
      <path className="f-live s-hot3" d="M73.8 38 L75.4 39.8 L78.6 36.2" />

      {/* 03 custom agents: four stations on one bus */}
      <g className="s-on4">
        <path className="f-ink" d="M76 42.6 L76 46 M19 46 L83 46" />
        {STATIONS.map((x) => (
          <g key={x}>
            <path className="f-ink" d={`M${x + 7} 46 L${x + 7} 48.5`} />
            <rect className="f-ink" x={x} y="48.5" width="14" height="11" />
            <path
              className="f-mute"
              d={`M${x + 2.5} 54 L${x + 11.5} 54 M${x + 2.5} 56.6 L${x + 8.5} 56.6`}
            />
          </g>
        ))}
        <text className="f-label" x="85" y="54.8">
          Agents
        </text>
      </g>
      <g className="s-hot4">
        {STATIONS.map((x) => (
          <path
            key={x}
            className="f-live"
            d={`M${x + 3} 51.2 L${x + 11} 51.2`}
          />
        ))}
      </g>

      {/* 04 AI inside products, and outbound */}
      <g className="s-on5">
        <path className="f-mute" d="M19 59.5 L19 68 M38 59.5 L38 68" />
        <rect className="f-ink" x="8" y="68" width="44" height="20" />
        <path className="f-ink" d="M8 72 L52 72" />
        <circle className="f-ink" cx="10.6" cy="70" r="0.6" />
        <circle className="f-ink" cx="12.8" cy="70" r="0.6" />
        <rect className="f-ink" x="12" y="75.5" width="12" height="9" />
        <path
          className="f-mute"
          d="M28 77 L48 77 M28 80 L44 80 M28 83 L46 83"
        />
        <text className="f-label" x="8" y="91.6">
          Inside a product
        </text>
        <path className="f-mute" d="M76 59.5 L76 66" />
        <path
          className="f-ink"
          d="M66 70 Q66 66 70 66 L80 66 Q84 66 84 70 L84 77 L66 77 Z"
        />
        <path className="f-ink" d="M74.5 77 L74.5 90" />
        <text className="f-label" x="86" y="73">
          Outbound
        </text>
      </g>
      <g className="s-hot5">
        <path className="f-live" d="M15 80 L21 80" />
        <path className="f-live" d="M81 66 L81 61.5 L84.5 62.6 L81 63.8" />
      </g>

      {/* 05 teaching: the people who run it, at scale beside the machine */}
      <g className="s-on6">
        <rect className="f-ink" x="8" y="95" width="16" height="7.5" />
        <path className="f-mute" d="M10 97.6 L19 97.6 M10 100 L16 100" />
        {[28, 31.4, 34.8, 38.2, 41.6].map((x) => (
          <g key={x}>
            <circle className="f-fill" cx={x} cy="98" r="0.8" />
            <path className="f-ink" d={`M${x} 99.2 L${x} 102.4`} />
          </g>
        ))}
        <text className="f-label" x="46" y="101.4">
          The people who build it
        </text>
      </g>

      {/* the result every step is for: a pipeline that climbs */}
      <g className="s-on6">
        {BARS.map((h, i) => (
          <rect
            key={i}
            className="f-ink"
            x={78 + i * 3.8}
            y={102.4 - h}
            width="2.6"
            height={h}
          />
        ))}
      </g>
      <rect
        className="f-live-fill s-hot9 s-hot-end"
        x="93.2"
        y="82.4"
        width="2.6"
        height="20"
      />

      {/* what we refuse: the deck as the deliverable, shown only while that
       * step is read, in the empty band between the accounts and the bus */}
      <g className="s-hot7">
        <rect className="f-paper f-mute" x="12" y="32" width="28" height="11" />
        <rect
          className="f-paper f-mute"
          x="10"
          y="33.2"
          width="28"
          height="11"
        />
        <rect className="f-paper f-ink" x="8" y="34.4" width="28" height="11" />
        <path
          className="f-mute"
          d="M10.5 38 L24 38 M10.5 40.6 L32 40.6 M10.5 43 L28 43"
        />
        <path className="f-ink" d="M6.5 46.6 L37.5 33.2" />
        <text className="f-label f-label-ink" x="42" y="40.6">
          A deck nobody runs
        </text>
      </g>

      {/* and work we can't finish: the line around what we take */}
      <rect
        className="f-mute f-dash s-stay8"
        x="3.5"
        y="1"
        width="94"
        height="103"
      />
    </svg>
  );
}

const REFUSE = [
  {
    title: "Clinical or licensed work",
    body: "If it needs a license we don't hold, it isn't ours.",
  },
  {
    title: "On-site physical work",
    body: "We build systems a company runs, but we don't staff a floor.",
  },
  {
    title: "Hard engineering",
    body: "Things like avionics, composites and propulsion belong to people trained for them.",
  },
  {
    title: "Anything week one would expose",
    body: "If we can't finish it, our first reply tells you so.",
  },
];

export default function AboutPage() {
  const names = LEADERSHIP.map((p) => p.name);
  const team = `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  // Where the advisors work, McKinsey first (Caleb, 2026-10-04). Advisors,
  // never called alumni.
  const firms = ["McKinsey & Company", "Google", "Reddit"]
    .filter((c) => ADVISORS.some((p) => p.company === c))
    .map((c) => c.replace(" & Company", ""));
  const advisedBy = `${firms.slice(0, -1).join(", ")} and ${firms[firms.length - 1]}`;

  return (
    <Shell>
      <div className="pg-scene">
        <section className="pg-step is-first t1" aria-labelledby="about-title">
          <p className="pg-kicker">About</p>
          <h1 id="about-title" className="pg-title">
            USC&apos;s AI implementation lab.
          </h1>
          <p className="pg-lead">
            If a company needs AI work done, we do it. That&apos;s automations,
            CRM setup, GTM engineering, agents inside their product, and even
            teaching, since right now one client has us building an AI
            curriculum for their students. Members learn all of it by building
            it.
          </p>
        </section>

        <section className="pg-step t2" aria-labelledby="a-2">
          <span className="pg-n">01</span>
          <h2 id="a-2">Data sets</h2>
          <p>
            Every system starts with a list a company owns, the accounts and
            contacts, enriched and scored so they&apos;re ready to work.
          </p>
        </section>

        <section className="pg-step t3" aria-labelledby="a-3">
          <span className="pg-n">02</span>
          <h2 id="a-3">GTM engineering</h2>
          <p>
            Enrichment, qualification, routing and outbound run every week on
            that data, and every verdict comes with a written reason.
          </p>
        </section>

        <section className="pg-step t4" aria-labelledby="a-4">
          <span className="pg-n">03</span>
          <h2 id="a-4">Custom agents</h2>
          <p>
            These are research and qualification agents with a real job and a
            test set behind them, and they say none when they&apos;re unsure.
          </p>
        </section>

        <section className="pg-step t5" aria-labelledby="a-5">
          <span className="pg-n">04</span>
          <h2 id="a-5">AI inside products</h2>
          <p>
            These are features a company ships to its own users, built in its
            own stack, so nothing has to move when we leave.
          </p>
        </section>

        <section className="pg-step t6" aria-labelledby="a-6">
          <span className="pg-n">05</span>
          <h2 id="a-6">Teaching AI</h2>
          <p>
            We&apos;re building an AI curriculum for one client&apos;s students,
            and inside the club every member learns the same way, by building
            the thing, from a first list to a system that runs weekly.{" "}
            <Link className="link" href="/build">
              The build team&apos;s sessions
            </Link>{" "}
            are where it starts.
          </p>
        </section>

        <section className="pg-step t7" aria-labelledby="a-7">
          <span className="pg-n">What we refuse</span>
          <h2 id="a-7">A deck as the deliverable.</h2>
          <p>
            A lot of student consulting ends at a recommendation nobody
            implements. We scope every engagement to end with a working system,
            a person who owns it, the SOP, and a number to measure before and
            after.
          </p>
        </section>

        <section className="pg-step t8" aria-labelledby="a-8">
          <span className="pg-n">And</span>
          <h2 id="a-8">Work we can&apos;t finish.</h2>
          <ul className="pg-list">
            {REFUSE.map((r) => (
              <li key={r.title}>
                <b>{r.title}</b>
                <span>{r.body}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="pg-step is-last t9" aria-labelledby="a-9">
          <span className="pg-n">Who runs it</span>
          {/* POSITIONING.md: "Dormant to a real roster in three months, with zero members inherited." */}
          <h2 id="a-9">Dormant to a real roster in three months.</h2>
          <p>
            We inherited zero members when we took it over, and now it&apos;s run by{" "}
            {team}, with advisors at {advisedBy}.
          </p>
          <div className="pg-actions">
            <Link href="/apply" className="btn btn-primary">
              Apply to join{" "}
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
            <Link href="/members" className="btn btn-secondary">
              Meet the people
            </Link>
          </div>
        </section>

        <div className="pg-stage">
          <div className="pg-well">
            <Machine />
          </div>
        </div>
      </div>
    </Shell>
  );
}
