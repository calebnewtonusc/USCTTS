import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import TcLink from "@/components/tts/TcLink";
import IntakeForm from "@/components/tts/IntakeForm";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "For companies | Trojan Tech Solutions",
  description:
    "USC students who build data sets, GTM engines and AI agents for companies, and hand over something running, an owner, the SOP and a number.",
};

const CHIPS = [
  { label: "Data sets", x: 4, y: 3, w: 15 },
  { label: "GTM engineering", x: 21, y: 3, w: 24 },
  { label: "Custom agents", x: 47, y: 3, w: 22 },
  { label: "AI inside products", x: 4, y: 11, w: 27 },
  { label: "Research workflows", x: 33, y: 11, w: 28 },
];
const NODES = [26, 42, 58, 74, 90];
const NODE_LABELS = ["You tell us", "Yes or no", "Scope one thing", "Build in your stack", "Hand it over"];
const NO = [
  "Clinical or licensed work",
  "On-site physical work",
  "Hard engineering",
  "Work week one would expose",
];

/* The engagement as one track. The chips are what we build; each node is a
 * step and turns cardinal while its step is read; the track draws itself
 * down as you go. The turn-down list surfaces off the "no" branch. */
function Track() {
  return (
    <svg
      className="f"
      viewBox="0 0 100 104"
      role="img"
      aria-labelledby="track-t"
    >
      <title id="track-t">
        An engagement as five steps on one track: you tell us the problem, we
        say yes or no early, scope one thing, build it in your stack, and hand
        it over with a before and after number.
      </title>

      <g className="s-on2">
        {CHIPS.map((c) => (
          <g key={c.label}>
            <rect
              className="f-ink"
              x={c.x}
              y={c.y}
              width={c.w}
              height="6"
            />
            <text className="f-label f-label-ink" x={c.x + 2.4} y={c.y + 4.1}>
              {c.label}
            </text>
          </g>
        ))}
      </g>
      <g className="s-hot2">
        {CHIPS.map((c) => (
          <rect
            key={c.label}
            className="f-live"
            x={c.x}
            y={c.y}
            width={c.w}
            height="6"
          />
        ))}
      </g>

      {/* the track: one segment per step, drawn as you reach it */}
      <path className="f-mute" d="M12 19 L12 92.4" />
      {NODES.map((y, i) => (
        <path
          key={y}
          className={`f-ink f-draw s-draw${i + 3}`}
          pathLength={1}
          d={`M12 ${i === 0 ? 19 : NODES[i - 1] + 2.4} L12 ${y - 2.4}`}
        />
      ))}
      {NODES.map((y, i) => (
        <g key={y} className={`s-on${i + 3}`}>
          <circle className="f-ink f-paper" cx="12" cy={y} r="2.4" />
          <text className="f-label f-big" x="18" y={y + 1.2}>
            {NODE_LABELS[i]}
          </text>
        </g>
      ))}
      {NODES.map((y, i) => (
        <circle
          key={y}
          className={`f-live-fill s-hot${i + 3}`}
          cx="12"
          cy={y}
          r="1.5"
        />
      ))}

      {/* 1: the form */}
      <g className="s-on3">
        <rect
          className="f-ink"
          x="72"
          y="20"
          width="13"
          height="12.5"
        />
        <path
          className="f-mute"
          d="M74.5 23.5 L82.5 23.5 M74.5 26.2 L80.5 26.2 M74.5 28.9 L82 28.9"
        />
      </g>

      {/* 2: the fork, said early */}
      <g className="s-on4">
        <path
          className="f-ink"
          d="M64 46 L70 46 C74 46 74 42.5 78 42.5 L84 42.5 M70 46 C74 46 74 49.5 78 49.5 L84 49.5"
        />
        <text className="f-label" x="86" y="43.4">
          yes
        </text>
        <text className="f-label" x="86" y="50.4">
          no
        </text>
      </g>
      <path
        className="f-live s-hot4"
        d="M70 46 C74 46 74 42.5 78 42.5 L84 42.5"
      />

      {/* 3: one thing, and its before number */}
      <g className="s-on5">
        <rect className="f-ink" x="66" y="56" width="11" height="9" />
        <circle className="f-ink" cx="71.5" cy="60.5" r="2.2" />
        <rect className="f-mute" x="82" y="59.5" width="3" height="5.5" />
        <text className="f-label" x="87" y="64.6">
          before
        </text>
      </g>
      <circle className="f-live-fill s-hot5" cx="71.5" cy="60.5" r="0.9" />

      {/* 4: inside their stack */}
      <g className="s-on6">
        <rect
          className="f-ink"
          x="60"
          y="73"
          width="30"
          height="3.4"
        />
        <rect
          className="f-ink"
          x="60"
          y="77.4"
          width="30"
          height="3.4"
        />
        <rect
          className="f-ink"
          x="60"
          y="81.8"
          width="30"
          height="3.4"
        />
      </g>
      <rect
        className="f-live-fill s-hot6"
        x="70"
        y="77.9"
        width="10"
        height="2.4"
      />

      {/* 5: handed to a person, with the after number */}
      <g className="s-on7">
        <circle className="f-ink" cx="64" cy="91.4" r="1.6" />
        <path className="f-ink" d="M61 99 C61 95.4 67 95.4 67 99" />
        <rect className="f-mute" x="78" y="94" width="3" height="5.5" />
        <rect className="f-ink" x="83" y="88" width="3" height="11.5" />
        <text className="f-label" x="88" y="99.4">
          after
        </text>
      </g>
      <rect
        className="f-live-fill s-hot7 s-hot-end"
        x="83"
        y="88"
        width="3"
        height="11.5"
      />

      {/* what we turn down, off the "no" branch */}
      <g className="s-hot8">
        <path className="f-mute f-dash" d="M84 49.5 L88 49.5 L88 53" />
        <rect
          className="f-paper f-ink"
          x="50"
          y="53"
          width="46"
          height="21"
        />
        {NO.map((t, i) => (
          <g key={t}>
            <path
              className="f-ink"
              d={`M53 ${57 + i * 4.6} l2 2 M55 ${57 + i * 4.6} l-2 2`}
            />
            <text
              className="f-label f-label-ink"
              x="58"
              y={`${58.9 + i * 4.6}`}
            >
              {t}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

const BUILD = [
  {
    name: "Data sets",
    job: "Lists you own, enriched and scored.",
  },
  {
    name: "GTM engineering",
    job: "Routing and outbound that run weekly.",
  },
  {
    name: "Custom agents",
    job: "Research agents with a test set.",
  },
  {
    name: "AI inside products",
    job: "Features your users touch.",
  },
];

const STEPS = [
  {
    title: "You tell us the problem",
    body: "What happens today, and what you wish happened instead. The form below takes a few minutes.",
  },
  {
    title: "Yes or no, early",
    body: "If it's work we can't finish, you hear it in the first reply, not in week three.",
  },
  {
    title: "We scope one thing",
    body: "One problem, one system, and the number we'll measure before and after.",
  },
  {
    title: "We build it in your stack",
    body: "Your accounts, your data, your tools. Nothing to migrate when we leave.",
  },
  {
    title: "We hand it over",
    body: "To a named person on your team, with the SOP written down and the after number beside the before.",
  },
];

export default function WorkWithUsPage() {
  return (
    <Shell>
      <div className="pg-scene">
        <section className="pg-step is-first t1" aria-labelledby="wwu-title">
          <p className="pg-kicker">For companies</p>
          <h1 id="wwu-title" className="pg-title">
            Bring us the work a system should be doing.
          </h1>
          <p className="pg-lead">
            USC students who build data sets, GTM engines and AI agents for
            companies, and hand over something running.
          </p>
          <div className="pg-actions">
            <a href="#intake" className="btn btn-primary">
              Tell us the problem{" "}
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </a>
            <a href="#how" className="btn btn-secondary">
              How it runs
            </a>
          </div>
        </section>

        <section className="pg-step t2" aria-labelledby="w-build">
          <span className="pg-n">What we build</span>
          <h2 id="w-build">Data, engines, agents.</h2>
          <ul className="pg-list">
            {BUILD.map((b) => (
              <li key={b.name}>
                <b>{b.name}</b>
                <span>{b.job}</span>
              </li>
            ))}
          </ul>
        </section>

        {STEPS.map((s, i) => (
          <section
            key={s.title}
            id={i === 0 ? "how" : undefined}
            className={`pg-step t${i + 3}`}
            aria-labelledby={`w-s${i}`}
          >
            <span className="pg-n">0{i + 1}</span>
            <h2 id={`w-s${i}`}>{s.title}</h2>
            <p>{s.body}</p>
          </section>
        ))}

        <section className="pg-step is-last t8" aria-labelledby="w-no">
          <span className="pg-n">What we turn down</span>
          <h2 id="w-no">
            Saying no in public is cheaper than failing in private.
          </h2>
          <p>
            Clinical or licensed work, on-site physical work, and hard
            engineering like avionics, composites or propulsion. And anything
            the first status update would show we can&apos;t do.
          </p>
        </section>

        <div className="pg-stage">
          <div className="pg-well">
            <Track />
          </div>
        </div>
      </div>

      <section className="pg-sec" id="intake" aria-labelledby="intake-title">
        <div className="pg-head">
          <h2 id="intake-title">Tell us the problem.</h2>
          <p>If it&apos;s not work we can finish, our first reply says so.</p>
          {/* [NEED: pricing for non-YC companies. POSITIONING.md records the
           * T Combinator model as free for the first cohort and paid after,
           * and nothing for TTS engagements, so no price is on the page.] */}
        </div>
        <IntakeForm />
        <div className="pg-actions">
          <TcLink className="btn btn-secondary" hideWhenPending>
            A YC company? Go to T Combinator
          </TcLink>
        </div>
        <p className="label mt-m">
          Want to sponsor the club, speak at a meeting or recruit from it
          instead?{" "}
          <Link className="link" href="/partner">
            That form is here
          </Link>
          .
        </p>
      </section>
    </Shell>
  );
}
