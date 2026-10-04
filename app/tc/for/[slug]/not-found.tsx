import Link from "next/link";
import { Footer, Masthead } from "@/components/tc/sections";
import MissingCompany from "@/components/tc/MissingCompany";

/* An unknown slug is almost always a typo in a DM or a company renamed since
 * the index was built. A bare 404 in front of a founder is the worst outcome
 * of the whole idea, so this page does the search for them, starting from
 * whatever they typed. */
export default function CompanyNotFound() {
  return (
    <>
      <Masthead base="/tc" />
      <main id="main" className="tc-main">
        <section className="tc-hero" aria-labelledby="missing-h">
          <div className="tc-wrap">
          <div className="tc-missing">
            <MissingCompany />
            <p className="tc-note-line">
              Or skip the brief and{" "}
              <Link href="/tc" className="tc-link tc-link--inline">
                read the general version
              </Link>
              .
            </p>
          </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
