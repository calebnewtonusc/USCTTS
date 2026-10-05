import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { mono } from "@/components/tts/v4/mono";
import "@/components/tts/pages.css";
import GridEcho from "./work-with-us/GridEcho";

export const metadata: Metadata = {
  title: "Not found | Trojan Tech Solutions",
};

/* The map is the whole page's one scene: it fades to paper before the
 * footer, so the page has one ending, not a map band stacked on a footer
 * (review, 2026-10-05). Any unknown URL lands here inside the site, with the two doors most
 * visitors were looking for: students to the application, companies to the
 * project form. About, Build and the meeting slides redirect to / instead. */
export default function NotFound() {
  return (
    <Shell>
      <div className={`pgx ${mono.variable}`}>
        <section className="ix is-nf" aria-labelledby="nf-title">
          <GridEcho />
          <div className="ix-in is-solo">
            <div>
              <h1 id="nf-title" className="ix-line">
                No route to this page.
              </h1>
              <div className="ix-actions">
                <Link className="btn btn-primary" href="/">
                  Back to the home page
                </Link>
                <Link className="btn btn-secondary" href="/apply">
                  Join TTS
                </Link>
                <Link className="btn btn-secondary" href="/work-with-us">
                  For companies
                </Link>
              </div>
            </div>
          </div>
          <svg className="ix-ways" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path className="ix-route is-dash" d="M72 46 C80 52 86 60 92 74" />
            <path className="ix-route" d="M90.6 72 L93.4 76 M93.4 72 L90.6 76" />
          </svg>
          <p className="ix-readout">
            <span>
              <b>404</b> no route from USC to this address
            </span>
            <span>it may have moved when the site was rebuilt</span>
          </p>
        </section>
      </div>
    </Shell>
  );
}
