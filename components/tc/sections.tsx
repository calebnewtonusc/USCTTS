import Link from "next/link";
import { ADVISORS, ALUMNI, LEADERSHIP } from "@/data/people";
import type { YcCompany } from "@/lib/yc";
import { HANDOFFS, REFUSALS, buildBrief, peopleLabel, shortLocation } from "./reasoning";
import { Fill, ReasonText, Row } from "./Sheet";
import { YC_OSS_URL } from "./contact";
import ReplyForm from "./ReplyForm";

/* "Cleaning your CRM" mid-sentence, without turning CRM into crm. */
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/* Founder-facing copy in first person is Caleb's, from
 * t-combinator/outreach/00-THE-MESSAGE.md (send version, 2026-09-17) and the
 * previous /tc page. Where a line below is his, it keeps his contractions. */

export function Masthead({ base = "" }: { base?: string }) {
  return (
    <header className="tc-mast">
      <div className="tc-wrap tc-mast-in">
        <Link href="/tc" className="tc-mark">
          T Combinator
        </Link>
        <nav aria-label="T Combinator" className="tc-mast-nav">
          <a href={`${base}#deal`} className="tc-link">
            The deal
          </a>
          <a href={`${base}#bench`} className="tc-link">
            Who&apos;s on it
          </a>
          <a href={`${base}#reply`} className="tc-link">
            Reply
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Deal() {
  return (
    <section className="tc-sec" id="deal" aria-labelledby="deal-h">
      <div className="tc-wrap">
        <h2 id="deal-h" className="tc-h2">
          What it costs you
        </h2>
        <div className="tc-sheet tc-sheet--dense">
          <Row label="Money">
            <p className="tc-strong">Nothing, for this cohort.</p>
            {/* NEED: what changes after the spring cohort, and whether TTS can
             * invoice at all (RSO status, entity, bank account). OFFER.md has
             * both open. Until then the page promises only this cohort. */}
            <p>
              It&apos;s free because our guys want a YC company on their resume
              a lot more than they want money right now.
            </p>
          </Row>
          <Row label="Cohort">
            <p className="tc-strong">Three companies, in the spring.</p>
          </Row>
          <Row label="Your time">
            <p className="tc-strong">
              One call to hand it off, and then you&apos;re out of it.
            </p>
          </Row>
          <Row label="The team">
            <p className="tc-strong">
              A lead from our cabinet, plus an industry mentor on the team.
            </p>
            <p>
              You meet whoever would be on it before you commit to anything.
            </p>
          </Row>
          <Row label="Paper">
            <p className="tc-strong">
              We&apos;ll sign whatever you need us to sign.
            </p>
          </Row>
          <Row label="Leaving">
            <p className="tc-strong">You can kill it whenever.</p>
          </Row>
        </div>
      </div>
    </section>
  );
}

export function Handoffs() {
  return (
    <section className="tc-sec" aria-labelledby="handoffs-h">
      <div className="tc-wrap">
        <h2 id="handoffs-h" className="tc-h2">
          The role is whatever you need
        </h2>
        <p className="tc-lead tc-prose">
          Pick the thing you keep pushing to next week. If you name your company
          above, this list reorders itself around your listing and says why.
        </p>
        <ul className="tc-sheet tc-list">
          {HANDOFFS.map((h) => (
            <li key={h.id}>
              <Row label={h.name}>
                <p>{h.detail}</p>
              </Row>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Saying what gets turned down is the cheapest credibility on the page. Set
 * large, because a founder skims for the catch and this is where it is. */
export function Refusals() {
  return (
    <section className="tc-sec tc-sec--band" aria-labelledby="no-h">
      <div className="tc-wrap">
        <h2 id="no-h" className="tc-h2">
          Four things we turn down
        </h2>
        <ul className="tc-noes">
          {REFUSALS.map((r) => (
            <li key={r.id} className="tc-no">
              <span className="tc-no-name">{r.name}</span>
              <span className="tc-no-detail">{r.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const ALUMNI_SHOWN = 9;

/* The bench. Names next to companies, never logos: there are no clients on
 * record (POSITIONING.md), so the proof is the people and one dated piece of
 * work. Advisors and alumni come from data/people.ts, the one roster both
 * sites read. */
export function Proof() {
  const advisors = ADVISORS.filter((p) => p.company);
  const alumni = ALUMNI.filter((p) => p.company);
  const shown = alumni.slice(0, ALUMNI_SHOWN);
  const more = alumni.slice(ALUMNI_SHOWN);
  const [caleb, tyler] = LEADERSHIP;

  return (
    <section className="tc-sec" id="bench" aria-labelledby="bench-h">
      <div className="tc-wrap">
        <h2 id="bench-h" className="tc-h2">
          Who you&apos;re actually dealing with
        </h2>

        <div className="tc-sheet">
          <Row label="The work">
            {/* POSITIONING.md, "The artifact", built 2026-09-15. */}
            <p className="tc-claim">
              In September we mapped a venture fund&apos;s whole portfolio the
              way we&apos;d map your market: <span className="tc-num">180</span>{" "}
              companies enumerated, <span className="tc-num">388</span> open
              roles pulled, and <span className="tc-num">2,158</span> LinkedIn
              connections matched against them.
            </p>
            <p>
              It also caught a data-quality trap before a fabricated number reached the top of the
              list.
            </p>
          </Row>

          <Row label="Who runs it">
            <p>
              {caleb.link ? (
                <a className="tc-link tc-link--inline" href={caleb.link}>
                  {caleb.name}
                </a>
              ) : (
                caleb.name
              )}{" "}
              and{" "}
              {tyler.link ? (
                <a className="tc-link tc-link--inline" href={tyler.link}>
                  {tyler.name}
                </a>
              ) : (
                tyler.name
              )}
              , co-presidents of Trojan Tech Solutions. We took it over dormant,
              with zero members inherited, and rebuilt the roster in three
              months. T Combinator is the part of it that works with founders.
            </p>
          </Row>

          <Row label="Advisors">
            <ul className="tc-people">
              {advisors.map((p) => (
                <li key={p.name}>
                  <span className="tc-person">{p.name}</span>
                  <span className="tc-person-at">
                    {p.role}, {p.company}
                  </span>
                </li>
              ))}
            </ul>
          </Row>

          <Row label="Started here">
            <p className="tc-note-line">
              Everyone below came out of this club. Not a client list.
            </p>
            <ul className="tc-people">
              {shown.map((p) => (
                <li key={p.name}>
                  <span className="tc-person">{p.name}</span>
                  <span className="tc-person-at">
                    {p.role}, {p.company}
                  </span>
                </li>
              ))}
            </ul>
            {more.length > 0 && (
              <details className="tc-more">
                <summary className="tc-link">{more.length} more</summary>
                <ul className="tc-people">
                  {more.map((p) => (
                    <li key={p.name}>
                      <span className="tc-person">{p.name}</span>
                      <span className="tc-person-at">
                        {p.role}, {p.company}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </Row>
        </div>
      </div>
    </section>
  );
}

export function Reply({ company }: { company?: YcCompany }) {
  return (
    <section
      className="tc-sec tc-sec--reply"
      id="reply"
      aria-labelledby="reply-h"
    >
      <div className="tc-wrap tc-reply">
        <div className="tc-reply-copy">
          <h2 id="reply-h" className="tc-h2">
            I want twenty minutes, not a yes.
          </h2>
          <p className="tc-lead">
            We&apos;re spending this semester building the team around what
            companies actually need, so right now I just want twenty minutes to
            hear what you&apos;d hand off if you had someone to hand it to.
          </p>
          <p className="tc-sign">
            Caleb Newton, Co-President, Trojan Tech Solutions at USC
          </p>
        </div>
        <ReplyForm
          company={
            company ? { name: company.name, slug: company.slug } : undefined
          }
        />
      </div>
    </section>
  );
}

export function Footer({ company }: { company?: YcCompany }) {
  return (
    <footer className="tc-foot">
      <div className="tc-wrap tc-foot-in">
        <p>
          T Combinator is a program of{" "}
          <Link href="/" className="tc-link tc-link--inline">
            Trojan Tech Solutions
          </Link>{" "}
          at USC.
        </p>
        {/* Required, not decorative. The RSO office told Tyler on 2026-09-16
         * not to imply any official association with Y Combinator, and the
         * company data comes from an unofficial mirror. */}
        <p>
          Not affiliated with, endorsed by, or sponsored by Y Combinator.
          Company data from the community-maintained{" "}
          <a className="tc-link tc-link--inline" href={YC_OSS_URL}>
            yc-oss directory
          </a>
          {company?.ycUrl ? (
            <>
              , and you can check every highlighted value against{" "}
              <a className="tc-link tc-link--inline" href={company.ycUrl}>
                your public listing
              </a>
            </>
          ) : null}
          .
        </p>
      </div>
    </footer>
  );
}

/* ---------- /tc/for/<slug> only ---------- */

export function BriefHead({ company }: { company: YcCompany }) {
  const loc = shortLocation(company.location);
  // yc-oss ships "/company/thumb/missing.png", a path relative to YC's own
  // site, for companies with no logo (seen on assorted-bits, 2026-10-03).
  // Rendered here it is a 404 on our origin, so only absolute URLs pass.
  const logo = company.logo && /^https:\/\//.test(company.logo) && !company.logo.includes("missing") ? company.logo : null;
  const meta = [
    company.batch,
    loc,
    company.status && company.status !== "Active" ? company.status : "",
  ].filter(Boolean);
  return (
    <section
      className="tc-hero tc-hero--brief"
      data-sheet
      aria-labelledby="brief-h"
    >
      <div className="tc-wrap">
        <h1 id="brief-h" className="tc-h1">
          For <Fill>{company.name}</Fill>
        </h1>
        <div className="tc-brief-id">
          {logo ? (
            /* A remote thumbnail from yc-oss; next/image would need the S3
             * host allowlisted in next.config, which the lead owns. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="tc-logo"
              src={logo}
              alt=""
              width={56}
              height={56}
            />
          ) : null}
          <div>
            {company.oneLiner ? (
              <p className="tc-lead">
                You describe it as <Fill>{company.oneLiner}</Fill>
              </p>
            ) : null}
            {meta.length > 0 ? (
              <p className="tc-meta">
                {meta.map((m, i) => (
                  <span key={m}>
                    {i > 0 ? <span aria-hidden="true"> / </span> : null}
                    <Fill>{m}</Fill>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </div>
        <p className="tc-pitch tc-prose">
          USC builders, taking real ownership of a role at {company.name}. Free
          for this cohort, three companies in the spring, and everything
          highlighted on this page came from your own listing.
        </p>
        <div className="tc-actions">
          <a className="tc-btn" href="#reply">
            Take the twenty minutes
          </a>
          <a className="tc-link" href="#deal">
            Read the deal first
          </a>
        </div>
      </div>
    </section>
  );
}

export function BriefRead({ company }: { company: YcCompany }) {
  const brief = buildBrief(company);
  const size = company.teamSize;
  const people = size !== null && size > 0 ? peopleLabel(size) : null;

  return (
    <section className="tc-sec" data-sheet aria-labelledby="read-h">
      <div className="tc-wrap">
        <h2 id="read-h" className="tc-h2">
          What we read, and what it changes
        </h2>
        <div className="tc-sheet">
          {people && brief.fit === "early" ? (
            <Row label="Team">
              <p>
                There are <Fill>{people}</Fill>{" "}on your listing, which means the
                growth work, the CRM, the lead list and the deck are all
                somebody&apos;s fourth priority. That&apos;s the part we take.
              </p>
            </Row>
          ) : null}
          {people && brief.fit === "unknown" ? (
            <Row label="Team">
              <p>
                <Fill>{people}</Fill>. Somewhere on a team that size there is
                work that keeps sliding because it is nobody&apos;s first
                priority. That&apos;s the part we take.
              </p>
            </Row>
          ) : null}
          {brief.fit === "large" && people ? (
            <Row label="Honest read">
              <p>
                At <Fill>{people}</Fill>,{" "}you likely have someone for most of
                what&apos;s below. This is built for early teams. If
                there&apos;s one project nobody owns, the offer still stands.
              </p>
            </Row>
          ) : null}
          {brief.fit === "public" ? (
            <Row label="Honest read">
              <p>
                Your listing says <Fill>{company.status}</Fill>
                {people ? (
                  <>
                    {" "}
                    at <Fill>{people}</Fill>
                  </>
                ) : null}
                . This is built for early teams, so you likely have someone for
                most of what&apos;s below. If there&apos;s one project nobody
                owns, the offer still stands.
              </p>
            </Row>
          ) : null}
          {brief.fit === "inactive" ? (
            <Row label="Honest read">
              <p>
                Your listing marks {company.name} as <Fill>Inactive</Fill>. If
                you&apos;re building something new, this page still applies.
                Tell us what it is in the reply below.
              </p>
            </Row>
          ) : null}
          {company.isHiring && (brief.fit === "early" || brief.fit === "unknown") ? (
            <Row label="Hiring">
              <p>
                You&apos;re <Fill>hiring right now</Fill>. We&apos;re the part
                that happens before the hire lands, and we hand it over when
                they start.
              </p>
            </Row>
          ) : null}
          {company.tags.length > 0 || company.industry ? (
            <Row label="Tags">
              <p className="tc-tags">
                {[company.industry, ...company.tags]
                  .filter((t, i, all) => t && all.indexOf(t) === i)
                  .map((t) => (
                    <Fill key={t}>{t}</Fill>
                  ))}
              </p>
              <p className="tc-note-line">
                These decided where we&apos;d start, below.
              </p>
            </Row>
          ) : (
            <Row label="Tags">
              <p className="tc-note-line">
                Your listing carries no tags, so the order below is our default
                rather than a read.
              </p>
            </Row>
          )}
        </div>
      </div>
    </section>
  );
}

export function BriefWork({ company }: { company: YcCompany }) {
  const brief = buildBrief(company);
  return (
    <>
      <section className="tc-sec" data-sheet aria-labelledby="start-h">
        <div className="tc-wrap">
          <h2 id="start-h" className="tc-h2">
            Where we&apos;d start at {company.name}
          </h2>
          <ol className="tc-sheet tc-list">
            {brief.start.map(({ handoff, reason }) => (
              <li key={handoff.id}>
                <Row label={handoff.name}>
                  <p className="tc-strong">{handoff.detail}</p>
                  {reason ? (
                    <p className="tc-why">
                      <ReasonText reason={reason} />
                    </p>
                  ) : null}
                </Row>
              </li>
            ))}
          </ol>
          <p className="tc-also">
            Also on the table:{" "}
            {brief.rest.map((h) => lowerFirst(h.name)).join(", ")}. The role
            is whatever you need.
          </p>
        </div>
      </section>

      <section
        className="tc-sec tc-sec--band"
        data-sheet
        aria-labelledby="touch-h"
      >
        <div className="tc-wrap">
          <h2 id="touch-h" className="tc-h2">
            What we wouldn&apos;t touch
          </h2>
          {brief.flags.length > 0 ? (
            <ul className="tc-noes">
              {brief.flags.map(({ refusal, matched }) => (
                <li key={refusal.id} className="tc-no">
                  <span className="tc-no-name">{refusal.name}</span>
                  <span className="tc-no-detail">
                    Your listing says <Fill>{matched}</Fill>. We&apos;d stay out
                    of that part and take the work around it. {refusal.detail}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="tc-lead tc-prose">
              Nothing on your listing hits one of our four noes. We still
              publish them, because a founder should know the catch before the
              call.
            </p>
          )}
          <p className="tc-also">
            {brief.flags.length > 0 ? "And for anyone: " : "The four: "}
            {(brief.flags.length > 0 ? brief.clear : REFUSALS)
              .map((r) => lowerFirst(r.name))
              .join(", ")}
            .
          </p>
        </div>
      </section>
    </>
  );
}

