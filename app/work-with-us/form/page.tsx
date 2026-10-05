import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { mono } from "@/components/tts/v4/mono";
import IntakeForm from "@/components/tts/IntakeForm";
import GridEcho from "../GridEcho";
import { CALENDLY_URL } from "@/lib/contact";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Tell us the problem | Trojan Tech Solutions",
  description: "Tell Trojan Tech Solutions what's eating your team's time.",
};

export default function IntakePage() {
  return (
    <Shell>
      <div className={`pgx ${mono.variable}`}>
        <section className="ix is-short" aria-labelledby="intake-title">
          <GridEcho usc={null} />
          <div className="ix-in is-solo">
            <div>
              <h1 id="intake-title" className="ix-line">
                What&apos;s eating your team&apos;s time?
              </h1>
              <div className="ix-actions">
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  Rather talk? Book 30 minutes with Caleb
                </a>
                <Link className="btn btn-secondary" href="/work-with-us">
                  See examples first
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="pg-sec" aria-labelledby="if-title">
          <h2 id="if-title" className="sr-only">
            The project form
          </h2>
          <div className="pg-formwrap">
            <IntakeForm />
          </div>
        </section>
      </div>
    </Shell>
  );
}
