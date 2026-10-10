import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import DotFloor from "@/components/tts/landing/DotFloor";
import { mono } from "@/components/tts/v4/mono";
import { INSTAGRAM_URL } from "@/components/tts/links";
import { ADVISORS, NETWORK_PEOPLE } from "@/data/people";
import { APPLY_FORM_URL, APPLICATIONS_OPEN } from "@/lib/apply";
import NotifyForm from "./NotifyForm";
import "@/components/tts/pages.css";
import "./join.css";

export const metadata: Metadata = {
  title: "Apply | Trojan Tech Solutions",
  description:
    "Join Trojan Tech Solutions, USC's AI implementation and go-to-market lab. Learn to build AI in build sessions, then ship it for real companies and nonprofits anywhere in the world.",
};

/*
 * Join (Caleb, 2026-10-10: "The join page lame af"). Short, and it leads
 * with what a USC student gets: real AI projects for real clients around
 * the world, the tools, the path, and where the people before them went.
 * One action, at the top and again at the end: apply when the Google Form
 * is set (lib/apply.ts), and until then the email signup, whose form and
 * endpoint (NotifyForm, /api/notify) are unchanged. Same world as home
 * (docs/INTENT-home.md, "One world").
 */

/* What a member builds, shown working: the funder list from /way's example
 * project, a nonprofit in Ghana that needs donor outreach, filling itself
 * row by row with a reason and a drafted first email. Timed once on load;
 * reduced motion shows it finished. */
const LEADS = [
  {
    biz: "Family foundation",
    where: "London",
    why: "Just opened a West Africa education fund",
  },
  {
    biz: "Corporate giving arm",
    where: "Accra",
    why: "New Accra office, looking for local programs",
  },
  {
    biz: "Diaspora giving circle",
    where: "Houston",
    why: "Members from the same region",
  },
  {
    biz: "Health foundation",
    where: "Geneva",
    why: "Clinic outreach is in scope this year",
  },
];

/* The path, from docs/COPY-tts.md: build sessions, practice builds on
 * public data, real company work for the strongest teams. */
const STEPS = [
  { title: "You apply", line: "Caleb, Tyler and Emily read every one." },
  {
    title: "Build sessions",
    line: "Hands-on nights where you ship a working piece.",
  },
  { title: "Practice builds", line: "Real pipelines on public data." },
  { title: "Real company work", line: "The strongest teams take it on." },
];

// Marks in their own colours, one per company people went on to.
const MARKS = [
  { name: "Apple", src: "/tts/alumni/apple.svg", h: 26 },
  { name: "Reddit", src: "/tts/alumni/reddit.svg", h: 24 },
  { name: "Microsoft", src: "/tts/alumni/microsoft.svg", h: 22 },
  { name: "Bloomberg", src: "/tts/alumni/bloomberg.svg", h: 18 },
  { name: "McKinsey & Company", src: "/tts/marks/mckinsey.png", h: 28 },
  { name: "Capital One", src: "/tts/alumni/capitalone.svg", h: 26 },
  { name: "NBCUniversal", src: "/tts/marks/nbcuniversal.svg", h: 15 },
  { name: "Citi", src: "/tts/alumni/citi.svg", h: 28 },
  { name: "PwC", src: "/tts/alumni/pwc.svg", h: 30 },
  { name: "Jefferies", src: "/tts/alumni/jefferies.svg", h: 20 },
  { name: "Nomura", src: "/tts/alumni/nomura.svg", h: 18 },
  { name: "Fastly", src: "/tts/alumni/fastly.svg", h: 24 },
];

function ApplyAction({ id }: { id?: string }) {
  if (APPLICATIONS_OPEN) {
    return (
      <div className="jo-action" id={id}>
        <a
          className="jo-apply"
          href={APPLY_FORM_URL}
          target="_blank"
          rel="noreferrer"
        >
          Apply on Google Forms <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    );
  }
  return (
    <div className="jo-action" id={id}>
      <p className="jo-status">
        <span className="jo-dot" aria-hidden="true" />
        applications open soon. Get an email the day they do.
      </p>
      <NotifyForm />
      <a
        className="jo-ig"
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
      >
        Follow us on Instagram
      </a>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Shell>
      <div className={`pgx jo ${mono.variable}`}>
        {/* 1. The promise, and the one action. */}
        <section className="jo-hero" aria-labelledby="jo-h">
          <div className="jo-wrap jo-hero-in">
            <div className="jo-hero-copy">
              <p className="jo-mark is-light">
                <span className="jo-dot" aria-hidden="true" />
                join TTS
              </p>
              <h1 id="jo-h" className="jo-h1">
                You&apos;d build real AI{" "}
                <em>for real clients, anywhere in the world.</em>
              </h1>
              <p className="jo-lede">
                Learn to build it in build sessions, then ship it for companies
                and nonprofits, on the tools real companies pay for.
              </p>
              <ApplyAction id="apply" />
            </div>
            <div className="jo-scene">
              <div className="jo-scene-floor" aria-hidden="true">
                <DotFloor
                  win={[-3000, -2200, 3000, 2200]}
                  color="#ffcc00"
                  alpha={0.34}
                  usc
                  hold
                  max={3600}
                />
              </div>
              <div className="jo-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/tts/home/world-1200.webp"
                  srcSet="/tts/home/world-1200.webp 1200w, /tts/home/world-2400.webp 2400w"
                  sizes="(min-width: 900px) 560px, 100vw"
                  alt="A clay Los Angeles at golden hour, with USC's cardinal tower and a red map dot above it"
                  width={2400}
                  height={1200}
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. What you'd build, shown as itself. */}
        <section className="jo-sec" aria-labelledby="jo-build-h">
          <div className="jo-wrap jo-split">
            <div>
              <p className="jo-mark">
                <span className="jo-n">01</span> what you&apos;d build
              </p>
              <h2 id="jo-build-h" className="jo-h2">
                Like this: who&apos;s worth reaching for a nonprofit in Ghana,{" "}
                <em>with the first email drafted.</em>
              </h2>
              <Link href="/way" className="jo-link">
                Follow that project start to finish, in 3D{" "}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <figure
              className="ix-panel jo-panel"
              aria-label="An example lead list a member builds, filling itself"
            >
              <div className="ix-bar">
                <span>Who&apos;s worth reaching, for a nonprofit in Ghana</span>
                <span>{LEADS.length} found, drafts ready</span>
              </div>
              <ul className="ix-rows">
                <li className="is-head" aria-hidden="true">
                  <span>funder</span>
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
              <figcaption className="jo-cap">
                an example build, not a past client
              </figcaption>
            </figure>
          </div>
        </section>

        {/* 3. Where the work goes, and the tools. */}
        <section className="jo-sec is-tight" aria-labelledby="jo-work-h">
          <div className="jo-wrap">
            <div className="jo-card">
              <div>
                <p className="jo-mark">
                  <span className="jo-n">02</span> real clients
                </p>
                <h2 id="jo-work-h" className="jo-h2">
                  From Nigeria <em>to Yemen.</em>
                </h2>
                <p className="jo-tools">
                  You build on Clay and Perplexity, the tools real companies pay
                  for to find their customers, through our partner Blue Modern
                  Advisory.
                </p>
              </div>
              <ul className="jo-manifest" aria-label="Client projects">
                <li>
                  <span className="jo-code">NG</span>
                  <b>Nigeria</b>
                  <span>an AI curriculum for an education nonprofit</span>
                </li>
                <li>
                  <span className="jo-code">GH</span>
                  <b>Ghana</b>
                  <span>healthcare</span>
                </li>
                <li>
                  <span className="jo-code">YE</span>
                  <b>Yemen</b>
                </li>
                <li>
                  <span className="jo-code is-field" aria-hidden="true" />
                  <b>Cancer therapeutics</b>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. The path. */}
        <section className="jo-sec is-tight" aria-labelledby="jo-path-h">
          <div className="jo-wrap">
            <p className="jo-mark">
              <span className="jo-n">03</span> how it goes
            </p>
            <h2 id="jo-path-h" className="jo-h2">
              From your first build night <em>to real company work.</em>
            </h2>
            <ol className="jo-steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <svg className="jo-step-dot" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="11" className="halo" />
                    <circle cx="12" cy="12" r="6" />
                  </svg>
                  <span className="jo-n">{String(i + 1).padStart(2, "0")}</span>
                  <b>{s.title}</b>
                  <span>{s.line}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 5. Where it takes you. */}
        <section className="jo-net" aria-labelledby="jo-net-h">
          <div className="jo-wrap">
            <p className="jo-mark is-light">
              <span className="jo-n">04</span> where it takes you
            </p>
            <h2 id="jo-net-h" className="jo-h2">
              {NETWORK_PEOPLE.length} people started here{" "}
              <em>and went on to these companies.</em>
            </h2>
            <ul
              className="jo-marks"
              aria-label="Companies people who started at TTS went on to"
            >
              {MARKS.map((m) => (
                <li key={m.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.src}
                    alt={m.name}
                    style={{ height: m.h }}
                    loading="lazy"
                    decoding="async"
                  />
                </li>
              ))}
            </ul>
            <div className="jo-advisors">
              <ul className="jo-faces" aria-label="Club advisors">
                {ADVISORS.map((p) => (
                  <li key={p.name}>
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${p.name}, ${p.background?.[0]?.label ?? p.role} (opens in a new tab)`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.photo}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  </li>
                ))}
              </ul>
              <p>
                And {ADVISORS.length} club advisors, open to a coffee chat
                anytime.
              </p>
              <Link href="/members" className="jo-link is-light">
                Meet everyone <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. The same one action. */}
        <section className="jo-end" aria-labelledby="jo-end-h">
          <div className="jo-wrap jo-end-in">
            <h2 id="jo-end-h" className="jo-end-h">
              {APPLICATIONS_OPEN
                ? "Applications are open now."
                : "Get an email the day applications open."}
            </h2>
            {APPLICATIONS_OPEN ? (
              <a
                className="jo-apply is-light"
                href={APPLY_FORM_URL}
                target="_blank"
                rel="noreferrer"
              >
                Apply on Google Forms <span aria-hidden="true">&rarr;</span>
              </a>
            ) : (
              <a className="jo-apply is-light" href="#apply">
                Get on the list <span aria-hidden="true">&uarr;</span>
              </a>
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}
