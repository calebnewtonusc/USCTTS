import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Not found | Trojan Tech Solutions",
};

/* Any unknown URL lands here inside the site, with the two doors most
 * visitors were looking for: students to the application, companies to the
 * project form. About, Build and the meeting slides redirect to / instead. */
export default function NotFound() {
  return (
    <Shell>
      <div className="pgx">
        <section className="pg-hero" aria-labelledby="nf-title">
          <div className="pg-hero-in is-solo">
            <div className="pg-hero-copy">
              <p className="pg-kicker">Page not found</p>
              <h1 id="nf-title" className="pg-title">
                There&apos;s no page at this address.
              </h1>
              <p className="pg-lead">
                It may have moved when we rebuilt the site. If you&apos;re a student, the application is the place to
                start. If you run a business, tell us what&apos;s eating your team&apos;s time.
              </p>
              <div className="pg-actions">
                <Link className="btn btn-primary" href="/">
                  Go to the home page
                </Link>
                <Link className="btn btn-secondary" href="/apply">
                  Apply to join
                </Link>
                <Link className="btn btn-secondary" href="/work-with-us">
                  For companies
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
