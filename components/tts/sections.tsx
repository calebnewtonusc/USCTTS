import { ADVISORS, ALUMNI } from "@/data/people";

export function Hero() {
  return (
    <header className="tts-wrap" style={{ paddingBlock: "var(--rhythm)" }}>
      <p className="tts-mono tts-rise">Trojan Tech Solutions · USC</p>

      {/* Static in the HTML, not assembled by an animation. Blockchain@USC ships
        * an H1 reading "Pioneering the Future of" with nothing after it, and
        * Code the Change ships the word UNTITLED, both for that reason. */}
      <h1 className="tts-display tts-rise" style={{ fontSize: "var(--step-4)", margin: "1.2rem 0 0" }}>
        Every engagement ends with something running.
      </h1>

      <p
        className="tts-prose tts-rise"
        style={{ fontSize: "var(--step-1)", color: "var(--ink-2)", marginTop: "1.8rem" }}
      >
        USC&apos;s applied AI implementation lab. A working tool, a named owner,
        a written SOP, a short training, and a number that moved. If we cannot
        hand you those five things, we did not do the work.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "2.4rem" }}>
        <a className="tts-cta" href="/apply">Join the lab</a>
        <a className="tts-ghost" href="/tc">T Combinator, for YC companies</a>
      </div>
    </header>
  );
}

/* The attack. Aimed at the format, never at a named USC organization, because
 * TTS is mid-push to become an RSO and because the house rule from
 * pro-bono-post is to punch at the experience rather than the people. Every
 * claim here came out of reading fourteen USC club sites on 2026-09-22 and is
 * checkable by opening them. */
export function TheDifference() {
  return (
    <section className="tts-wrap" style={{ paddingBlock: "var(--rhythm)" }}>
      <p className="tts-mono">Why this is not a consulting club</p>
      <h2 className="tts-display" style={{ fontSize: "var(--step-2)", margin: "1rem 0 1.4rem" }}>
        Read any consulting club&apos;s site on this campus. Count how many say
        &ldquo;shipped.&rdquo;
      </h2>

      <p className="tts-prose" style={{ color: "var(--ink-2)", marginBottom: "1.1rem" }}>
        The answer is none. The word is always <em>recommendations</em>, or{" "}
        <em>strategic plans</em>, or <em>actionable insights</em>, or{" "}
        <em>tailored solutions that drive measurable impact</em>. One of them
        promises a final deliverable and never says what the deliverable is.
        Another anonymizes its own client. A third shows eight enterprise logos
        that are, if you open the page source, image files downloaded off Google
        Images with the filenames still attached.
      </p>

      <p className="tts-prose" style={{ color: "var(--ink-2)", marginBottom: "2.5rem" }}>
        The deck gets presented in week ten and then everybody graduates. That is
        the whole model, and it is not anybody&apos;s fault: a semester is short
        and implementation is the hard part. We just decided to do the hard part.
      </p>

      <div
        style={{
          display: "grid",
          gap: "1px",
          background: "var(--line)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(18rem, 100%), 1fr))",
          maxWidth: "min(100%, 58rem)",
        }}
      >
        <div style={{ background: "var(--p1)", padding: "1.6rem 1.4rem" }}>
          <p className="tts-mono" style={{ marginBottom: "0.9rem" }}>What they hand over</p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--ink-3)", lineHeight: 1.9 }}>
            <li>A slide deck</li>
            <li>A recommendation</li>
            <li>A final presentation</li>
            <li>Nothing anybody logs into on Monday</li>
          </ul>
        </div>
        <div style={{ background: "var(--p0)", padding: "1.6rem 1.4rem" }}>
          <p className="tts-mono" style={{ marginBottom: "0.9rem", color: "var(--accent)" }}>
            What we hand over
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", lineHeight: 1.9 }}>
            <li>A tool that runs without us</li>
            <li>The person on your team who owns it</li>
            <li>The SOP, written down</li>
            <li>A number, measured before and after</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

const WORDS = ["zero","one","two","three","four","five","six","seven","eight","nine",
  "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen",
  "eighteen","nineteen","twenty","twenty-one","twenty-two","twenty-three"];

export function Bench() {
  const people = [...ADVISORS, ...ALUMNI].filter((p) => p.company);
  // Written by hand this said twenty-one and rendered twenty, because one
  // advisor carries no company and gets filtered out above. A headline number
  // that disagrees with the grid under it is the exact failure this site is
  // built to call out in other clubs.
  const count = WORDS[people.length] ?? String(people.length);
  return (
    <section style={{ borderBlock: "1px solid var(--line)", background: "var(--p1)" }}>
      <div className="tts-wrap" style={{ paddingBlock: "var(--rhythm)" }}>
        <p className="tts-mono">Where this club goes</p>
        <h2 className="tts-display" style={{ fontSize: "var(--step-2)", margin: "1rem 0 0.9rem" }}>
          {count.charAt(0).toUpperCase() + count.slice(1)} people, and every one
          of them sat in the same room.
        </h2>
        <p className="tts-prose" style={{ color: "var(--ink-2)", marginBottom: "2.5rem" }}>
          This is not a client wall. These are the founders of this club, the
          advisors who came back, and the alumni who ran it before we did.
        </p>

        <ul
          style={{
            listStyle: "none", padding: 0, margin: 0,
            display: "grid", gap: "1px",
            background: "var(--line)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)", overflow: "hidden",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(14rem, 100%), 1fr))",
          }}
        >
          {people.map((p) => (
            <li key={p.name} style={{ background: "var(--p0)", padding: "1.1rem 1.2rem" }}>
              <div style={{ fontWeight: 560 }}>{p.name}</div>
              <div style={{ color: "var(--ink-3)", fontSize: "var(--step--1)" }}>{p.role}</div>
              <div style={{ color: "var(--accent)", fontSize: "var(--step--1)", marginTop: "0.3rem" }}>
                {p.company}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function TCombinatorTeaser() {
  return (
    <section className="tts-wrap" style={{ paddingBlock: "var(--rhythm)" }}>
      <div
        style={{
          background: "var(--p3)", color: "#f4f0ea",
          borderRadius: "var(--radius)",
          padding: "clamp(2rem, 5vw, 3.5rem)",
        }}
      >
        <p className="tts-mono" style={{ color: "#8a7f73" }}>The other half</p>
        <h2 className="tts-display" style={{ fontSize: "var(--step-2)", margin: "1rem 0 1rem" }}>
          T Combinator
        </h2>
        <p style={{ maxWidth: "58ch", color: "#b8ada0", marginBottom: "2rem" }}>
          We put the best builders here on free contract work for Y Combinator
          companies, three a semester, in whatever role the company actually
          needs. You get real ownership of something at a company people have
          heard of, which is not a thing any other club at USC offers.
        </p>
        <a
          href="/tc"
          className="tts-cta"
          style={{ background: "#ff6b35", color: "#141210" }}
        >
          See how it works
        </a>
      </div>
    </section>
  );
}
