/* The Clay and Perplexity band.
 *
 * Caleb's brief was to flex this hard and show the valuations "non chalant",
 * small, with the detail on hover. The wording below is the strongest version
 * that is actually checkable today.
 *
 * What verification found on 2026-09-22: Blue Modern Advisory IS a listed Clay
 * Solutions Partner at Advanced Artisan tier, publicly at
 * clay.com/experts/partner/blue-modern-advisory, and IS named on Perplexity's
 * own Computer Implementation Partners hub. Trojan Tech Solutions is NOT in
 * the Clay directory; that was confirmed by fetching the candidate slugs and
 * comparing response sizes against the known-good BMA page.
 *
 * So the claim is routed through BMA, which is true, links to a page a founder
 * can open, and is more persuasive than an unverifiable direct claim. If Sagar
 * confirms in writing that TTS can claim partner status directly, this is the
 * one file to change.
 *
 * Valuations are the defensible ones only. Perplexity's widely reported $23B
 * and the "in talks above $30B" figure could not be sourced to a primary
 * announcement and are deliberately absent.
 */

interface Partner {
  name: string;
  valuation: string;
  asOf: string;
  body: string;
  href: string;
}

const PARTNERS: Partner[] = [
  {
    name: "Clay",
    valuation: "$7.1B",
    asOf: "Series D, Sept 2026",
    body:
      "The GTM data platform. Raised $115M led by Wellington in September 2026. We work through Blue Modern Advisory, a listed Clay Solutions Partner at Advanced Artisan tier, which is how a student team gets its hands on the tooling at all.",
    href: "https://www.clay.com/experts/partner/blue-modern-advisory",
  },
  {
    name: "Perplexity",
    valuation: "$20B",
    asOf: "as of Sept 2025",
    body:
      "Blue Modern Advisory is named on Perplexity's Computer Implementation Partners page, alongside FullFunnel and Enso Labs. That is the program for teams building production Perplexity workflows, not a reseller badge.",
    href: "https://www.perplexity.ai/hub/computer-partners",
  },
];

export default function Partners() {
  return (
    <section style={{ borderBlock: "1px solid var(--line)", background: "var(--p1)" }}>
      <div className="tts-wrap" style={{ paddingBlock: "var(--rhythm)" }}>
        <p className="tts-mono">The tools we actually have</p>
        <h2 className="tts-display" style={{ fontSize: "var(--step-2)", margin: "1rem 0 0.9rem" }}>
          Two of them cost more than this university&apos;s endowment cares to think about.
        </h2>
        <p className="tts-prose" style={{ color: "var(--ink-2)", marginBottom: "2.5rem" }}>
          No other club on this campus is running these. Hover any of them for
          what it actually means, because half of USC has never heard of Clay.
        </p>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(21rem, 100%), 1fr))",
            maxWidth: "min(100%, 62rem)",
          }}
        >
          {PARTNERS.map((p) => (
            <details key={p.name} className="tts-partner" open>
              <summary>
                <span className="tts-partner-name">{p.name}</span>
                <span className="tts-partner-val">
                  {p.valuation} · {p.asOf}
                </span>
              </summary>
              <p className="tts-partner-body">
                {p.body}{" "}
                <a
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--accent)", textUnderlineOffset: "3px" }}
                >
                  Check it
                </a>
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
