import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import IntakeForm from "@/components/tts/IntakeForm";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Tell us the problem | Trojan Tech Solutions",
  description: "Tell Trojan Tech Solutions what's eating your team's time.",
};

export default function IntakePage() {
  return (
    <Shell>
      <div className="pgx">
        <section className="pg-hero" aria-labelledby="intake-title">
          <div className="pg-hero-in is-solo">
            <div className="pg-hero-copy">
              <p className="pg-kicker">For companies</p>
              <h1 id="intake-title" className="pg-title">
                What&apos;s eating your team&apos;s time?
              </h1>
              <p className="pg-lead">
                Tell us in plain words. If it&apos;s not work we can finish, our first reply says so.{" "}
                <Link className="link" href="/work-with-us">
                  See examples and how it works
                </Link>
                .
              </p>
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
