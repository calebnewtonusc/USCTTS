"use client";

import { motion, useReducedMotion } from "motion/react";
import { ADVISORS, ALUMNI } from "@/data/people";
import LiveEnrich from "./LiveEnrich";
import AmbientField from "./AmbientField";
import CommandPalette from "./CommandPalette";
import Ticker from "./Ticker";

/* Scroll-bound reveal. Every section below uses it, which is what gives the
 * page a pulse instead of being a long document. transform and opacity only,
 * under 300ms, once, and skipped entirely under reduced motion. */
function Rise({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const still = useReducedMotion();
  return (
    <motion.div
      initial={still ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.45, delay: still ? 0 : delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  return (
    <header className="tts-wrap" style={{ position: "relative", paddingTop: "clamp(2.5rem,6vw,4.5rem)", paddingBottom: "var(--rhythm)" }}>
      <AmbientField />
      <div style={{ position: "relative", zIndex: 1 }}>
      <p className="tts-mono tts-rise">Trojan Tech Solutions · USC</p>
      <h1 className="tts-display tts-rise" style={{ fontSize: "var(--step-4)", margin: "1.1rem 0 0" }}>
        Every engagement ends with something running.
      </h1>
      <p className="tts-prose tts-rise" style={{ fontSize: "var(--step-1)", color: "var(--ink-2)", margin: "1.5rem 0 3rem" }}>
        USC&apos;s applied AI implementation lab. Not a consulting club. Here is
        the work, running right now, on any company you want to name.
      </p>

      <div style={{ marginBottom: "2rem" }}>
        <CommandPalette />
      </div>

      <LiveEnrich />
      </div>
    </header>
  );
}

const PARTNERS = [
  {
    name: "Clay", logo: "/img/logos/clay.png", val: "$7.1B",
    as: "Series D · Sept 2026 · Wellington",
    body: "The GTM data platform. We work through Blue Modern Advisory, a listed Clay Solutions Partner at Advanced Artisan tier, which is how a student team gets its hands on this at all.",
    href: "https://www.clay.com/experts/partner/blue-modern-advisory",
  },
  {
    name: "Perplexity", logo: "/img/logos/perplexity.svg", val: "$20B",
    as: "as of Sept 2025",
    body: "Blue Modern Advisory is named on Perplexity's Computer Implementation Partners page, alongside FullFunnel and Enso Labs. That is the program for teams building production workflows, not a reseller badge.",
    href: "https://www.perplexity.ai/hub/computer-partners",
  },
];

export function Partners() {
  return (
    <section style={{ borderBlock: "1px solid var(--line)", background: "var(--p1)" }}>
      <div className="tts-wrap" style={{ paddingBlock: "var(--rhythm)" }}>
        <Rise>
          <p className="tts-mono">The tools we actually have</p>
          <h2 className="tts-display" style={{ fontSize: "var(--step-2)", margin: "1rem 0 2.5rem" }}>
            No other club at USC is running these.
          </h2>
        </Rise>
        <div className="pmarks">
          {PARTNERS.map((p, i) => (
            <Rise key={p.name} delay={i * 0.08}>
              <div className="pmark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.logo} alt={p.name} className="pmark-logo" />
                <span className="pmark-val">{p.val}</span>
                <span className="pmark-as">{p.as}</span>
                <p className="pmark-body">
                  {p.body}{" "}
                  <a href={p.href} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textUnderlineOffset: "3px" }}>
                    Check it
                  </a>
                </p>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

const WORDS = ["zero","one","two","three","four","five","six","seven","eight","nine","ten",
  "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen",
  "nineteen","twenty","twenty-one","twenty-two","twenty-three"];

export function AlumniTicker() {
  return <Ticker />;
}

export function Bench() {
  const people = [...ADVISORS, ...ALUMNI].filter((p) => p.company);
  const count = WORDS[people.length] ?? String(people.length);
  const still = useReducedMotion();

  return (
    <section className="tts-wrap" style={{ paddingBlock: "var(--rhythm)" }}>
      <Rise>
        <p className="tts-mono">Where this club goes</p>
        <h2 className="tts-display" style={{ fontSize: "var(--step-2)", margin: "1rem 0 0.9rem" }}>
          {count.charAt(0).toUpperCase() + count.slice(1)} people, and every one
          of them sat in the same room.
        </h2>
        <p className="tts-prose" style={{ color: "var(--ink-2)", marginBottom: "2.5rem" }}>
          Not a client wall. These are the founders of this club, the advisors
          who came back, and the alumni who ran it before we did.
        </p>
      </Rise>

      <ul style={{
        listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "1px",
        background: "var(--line)", border: "1px solid var(--line)",
        borderRadius: "var(--radius)", overflow: "hidden",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(14rem, 100%), 1fr))",
      }}>
        {people.map((p, i) => (
          <motion.li
            key={p.name}
            initial={still ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: still ? 0 : i * 0.025 }}
            style={{ background: "var(--p0)", padding: "1.1rem 1.2rem" }}
          >
            <div style={{ fontWeight: 560 }}>{p.name}</div>
            <div style={{ color: "var(--ink-3)", fontSize: "var(--step--1)" }}>{p.role}</div>
            <div style={{ color: "var(--accent)", fontSize: "var(--step--1)", marginTop: "0.3rem" }}>
              {p.company}
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

export function TCombinatorTeaser() {
  return (
    <section className="tts-wrap" style={{ paddingBottom: "var(--rhythm)" }}>
      <Rise>
        <div style={{ background: "var(--p3)", color: "#f4f0ea", borderRadius: "var(--radius)", padding: "clamp(2rem, 5vw, 3.5rem)" }}>
          <p className="tts-mono" style={{ color: "#8a7f73" }}>The other half</p>
          <h2 className="tts-display" style={{ fontSize: "var(--step-2)", margin: "1rem 0 1rem" }}>
            T Combinator
          </h2>
          <p style={{ maxWidth: "58ch", color: "#b8ada0", marginBottom: "2rem" }}>
            We put the best builders here on free contract work for Y Combinator
            companies, three a semester, in whatever role the company actually
            needs. Real ownership of something at a company people have heard
            of, which no other club at USC offers.
          </p>
          <a href="/tc" className="tts-cta" style={{ background: "#ff6b35", color: "#141210" }}>
            See how it works
          </a>
        </div>
      </Rise>
    </section>
  );
}

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "var(--p1)" }}>
      <div className="tts-wrap" style={{ paddingBlock: "2.5rem", display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "space-between", fontSize: "var(--step--1)", color: "var(--ink-3)" }}>
        <div>
          <p style={{ margin: 0, color: "var(--ink)", fontWeight: 560 }}>Trojan Tech Solutions</p>
          <p style={{ margin: "0.3rem 0 0" }}>University of Southern California</p>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <a href="/about">About</a>
          <a href="/members">Team</a>
          <a href="/work-with-us">For companies</a>
          <a href="/tc">T Combinator</a>
          <a href="/apply">Join</a>
        </div>
      </div>
    </footer>
  );
}
