import { ADVISORS, ALUMNI } from "@/data/people";
import type { YcCompany } from "@/lib/yc";

/* The bench. Rule 13 of DESIGN.md: the proof unit is a named party plus a
 * specific fact, never a logo. Every USC club on the campus survey puts up a
 * logo wall it cannot attach an engagement to, so this deliberately does the
 * opposite and names the human next to the company. */
const BENCH = [...ADVISORS, ...ALUMNI]
  .filter((p) => p.company)
  .slice(0, 12);

export function Bench() {
  return (
    <section className="tc-wrap" style={{ paddingTop: "var(--rhythm)", paddingBottom: "var(--rhythm)" }}>
      <p className="tc-mono">Who you actually get</p>
      <h2 className="tc-display" style={{ fontSize: "var(--step-2)", margin: "1rem 0 0.75rem" }}>
        Everyone here came out of the same club.
      </h2>
      <p className="tc-prose" style={{ color: "var(--ink-2)", marginBottom: "2.5rem" }}>
        Not a client list. These are people who ran this thing before us and now
        sit on the other side of it, plus the mentor who joins whichever team
        works on your company.
      </p>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: "1px",
          background: "var(--line-faint)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
        }}
      >
        {BENCH.map((p) => (
          <li
            key={p.name}
            style={{
              background: "var(--s1)",
              padding: "1.15rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.2rem",
            }}
          >
            <span style={{ fontWeight: 540 }}>{p.name}</span>
            <span style={{ color: "var(--ink-3)", fontSize: "var(--step--1)" }}>
              {p.role}
            </span>
            <span style={{ color: "var(--accent)", fontSize: "var(--step--1)", marginTop: "0.3rem" }}>
              {p.company}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Shown only on /tc/for/[slug]. This is the entire reason the site exists in
 * this shape: the founder opens a link from a DM and the page is already about
 * their company. It is the product demonstrated on them rather than described
 * to them. */
export function PersonalBand({ company }: { company: YcCompany }) {
  const size = company.teamSize;
  return (
    <section
      className="tc-rise"
      style={{ borderBottom: "1px solid var(--line)", background: "var(--s1)" }}
    >
      <div className="tc-wrap" style={{ paddingBlock: "clamp(2.5rem, 5vw, 4rem)" }}>
        <p className="tc-mono">
          {company.batch} · {company.status}
          {company.location ? ` · ${company.location}` : ""}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.1rem 0 0.9rem" }}>
          {company.logo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              width={46}
              height={46}
              style={{ borderRadius: "6px", background: "var(--s3)", flexShrink: 0 }}
            />
          )}
          <h1 className="tc-display" style={{ fontSize: "var(--step-3)", margin: 0 }}>
            {company.name}
          </h1>
        </div>

        {company.oneLiner && (
          <p className="tc-prose" style={{ color: "var(--ink-2)", fontSize: "var(--step-1)" }}>
            {company.oneLiner}
          </p>
        )}

        <p className="tc-prose" style={{ marginTop: "1.6rem", fontSize: "var(--step-1)" }}>
          {size !== null && size <= 12 ? (
            <>
              There are <strong style={{ color: "var(--accent)" }}>{size}</strong>{" "}
              of you, which means the growth work, the CRM, the lead list and the
              deck are all somebody&apos;s fourth priority.
            </>
          ) : (
            <>
              Somewhere on your team there is work that keeps sliding because it is
              nobody&apos;s first priority.
            </>
          )}{" "}
          That is the part we take.
        </p>

        {company.isHiring && (
          <p className="tc-prose" style={{ marginTop: "1rem", color: "var(--ink-2)" }}>
            You are hiring right now. We are the part that happens before the hire
            lands, and we hand it over when they start.
          </p>
        )}
      </div>
    </section>
  );
}

const HANDOFFS = [
  ["Growth", "Outbound that a human would actually reply to."],
  ["Lead lists", "Your addressable market, enumerated and enriched, in a week."],
  ["CRM", "The HubSpot or Salesforce instance nobody has owned since the seed."],
  ["Design and brand", "Site, deck, identity, the things you keep redoing at midnight."],
  ["Engineering", "Internal tools, integrations, the scripts holding ops together."],
  ["The deck", "The one you keep not making."],
];

export function Handoffs() {
  return (
    <section className="tc-wrap" style={{ paddingTop: "var(--rhythm)", paddingBottom: "0" }}>
      <p className="tc-mono">The role is whatever you need</p>
      <h2 className="tc-display" style={{ fontSize: "var(--step-2)", margin: "1rem 0 2.5rem" }}>
        Pick the thing you keep pushing to next week.
      </h2>

      <dl
        style={{
          margin: 0,
          display: "grid",
          gap: "1px",
          background: "var(--line-faint)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(17rem, 100%), 1fr))",
          maxWidth: "min(100%, 66rem)",
        }}
      >
        {HANDOFFS.map(([term, detail]) => (
          <div key={term} style={{ background: "var(--s1)", padding: "1.6rem 1.4rem" }}>
            <dt className="tc-display" style={{ fontSize: "var(--step-1)", marginBottom: "0.45rem" }}>
              {term}
            </dt>
            <dd style={{ margin: 0, color: "var(--ink-2)", fontSize: "var(--step--1)", lineHeight: 1.6 }}>
              {detail}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* Saying what gets turned down is the cheapest credibility on the page, and
 * nobody else on this campus does it. Content is from t-combinator/OFFER.md. */
export function Refusals() {
  return (
    <section style={{ borderBlock: "1px solid var(--line)", background: "var(--s1)" }}>
      <div className="tc-wrap" style={{ paddingBlock: "var(--rhythm)" }}>
        <p className="tc-mono">What we turn down</p>
        <h2 className="tc-display" style={{ fontSize: "var(--step-2)", margin: "1rem 0 1.2rem" }}>
          We say no to four things, on purpose.
        </h2>
        <p className="tc-prose" style={{ color: "var(--ink-2)" }}>
          Clinical or licensed work. Anything physical or on-site. Hard
          engineering: avionics, composites, geotech, propulsion. And anything
          where the first status update would reveal the team cannot do it. One
          of those burns a founder relationship permanently, and the batch is
          small enough that word travels.
        </p>
      </div>
    </section>
  );
}

export function Close() {
  return (
    <section className="tc-wrap" style={{ paddingBlock: "var(--rhythm)" }}>
      <h2 className="tc-display" style={{ fontSize: "var(--step-2)", marginBottom: "1.2rem" }}>
        I want twenty minutes, not a yes.
      </h2>
      <p className="tc-prose" style={{ color: "var(--ink-2)", marginBottom: "1rem" }}>
        We are spending this semester building the team around what companies
        actually need, so the call is me asking what you would hand off if you
        had somebody to hand it to. One call to hand it over and then you are out
        of it. We will sign whatever you need us to sign, you meet whoever would
        be on it before you commit to anything, and you can kill it whenever.
      </p>
      <p className="tc-prose" style={{ color: "var(--ink-3)", fontSize: "var(--step--1)", marginBottom: "2rem" }}>
        Caleb Newton, Co-President. USC Iovine and Young Academy.
      </p>
      <a className="tc-cta" href="mailto:hello@usctts.com?subject=T%20Combinator">
        Take the twenty minutes
      </a>
    </section>
  );
}

export function TcFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)" }}>
      <div
        className="tc-wrap"
        style={{
          paddingBlock: "2.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "space-between",
          color: "var(--ink-3)",
          fontSize: "var(--step--1)",
        }}
      >
        <span>T Combinator, a program of Trojan Tech Solutions at USC.</span>
        {/* Required, not decorative. The RSO office told Tyler on 2026-09-16 not
         * to imply any official association with Y Combinator without their
         * agreement, and company data here comes from an unofficial mirror. */}
        <span style={{ maxWidth: "34rem" }}>
          Not affiliated with, endorsed by, or sponsored by Y Combinator. Company
          data from the community-maintained yc-oss directory.
        </span>
      </div>
    </footer>
  );
}
