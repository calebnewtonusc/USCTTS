import Lookup from "@/components/tc/Lookup";
import { demoCompanies } from "@/components/tc/directory";
import {
  Deal,
  Footer,
  Handoffs,
  Masthead,
  Proof,
  Refusals,
  Reply,
} from "@/components/tc/sections";

export default function TCombinatorPage() {
  const demo = demoCompanies();
  return (
    <>
      <Masthead />
      <main id="main" className="tc-main">
        <section className="tc-hero" aria-labelledby="tc-h">
          <div className="tc-wrap tc-hero-grid">
            <div className="tc-hero-copy">
              <h1 id="tc-h" className="tc-h1">
                Hand off the thing you keep not doing.
              </h1>
              <p className="tc-lead tc-prose">
                T Combinator puts the most cracked builders at USC on free
                contract work for YC companies. We&apos;re picking three for the
                spring cohort.
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
            <Lookup
              demo={demo}
              label="Name your YC company and this page becomes a brief for it."
            />
          </div>
        </section>
        <Deal />
        <Handoffs />
        <Refusals />
        <Proof />
        <Reply />
      </main>
      <Footer />
    </>
  );
}
