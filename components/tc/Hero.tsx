/* The hero renders its final copy in static HTML. Rule 12 of DESIGN.md, found
 * the hard way: Blockchain@USC ships an H1 reading "Pioneering the Future of"
 * with nothing after it, and Code the Change ships the literal word UNTITLED,
 * because both animate the headline and the completion never lands for a
 * crawler, a screen reader, or a link preview. The animation here is opacity
 * and transform on an element that already contains the words. */
export default function Hero({ compact = false }: { compact?: boolean }) {
  // On /tc/for/[slug] the company name is the h1, so the pitch headline steps
  // down to h2. Two h1 elements on one page breaks the document outline for
  // anyone navigating by heading.
  const Heading = compact ? "h2" : "h1";
  return (
    <header className="tc-wrap" style={{ paddingBlock: compact ? "3.5rem" : "var(--rhythm)" }}>
      <p className="tc-mono tc-rise">Three companies a semester</p>

      <Heading
        className="tc-display tc-rise"
        style={{ fontSize: compact ? "var(--step-2)" : "var(--step-4)", margin: "1.2rem 0 0" }}
      >
        Hand off the thing you keep not doing.
      </Heading>

      <p
        className="tc-prose tc-rise"
        style={{ fontSize: "var(--step-1)", color: "var(--ink-2)", marginTop: "1.8rem" }}
      >
        We take the most cracked builders at USC and put them on free contract
        work for YC companies. You get a lead from our cabinet and an industry
        mentor on the team.
      </p>

      <p className="tc-prose tc-rise" style={{ color: "var(--ink-3)", marginTop: "1rem" }}>
        It is free because our guys want a YC company on their resume a lot more
        than they want money right now. That changes in the spring. It does not
        change for this cohort.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "2.4rem" }}>
        <a className="tc-cta" href="mailto:hello@usctts.com?subject=T%20Combinator">
          Take the twenty minutes
        </a>
        <a className="tc-ghost" href="#bench">
          See who would be on it
        </a>
      </div>
    </header>
  );
}
