import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import IntakeForm from "@/components/tts/IntakeForm";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Tell us the problem | Trojan Tech Solutions",
  description: "Send Trojan Tech Solutions the work a system should be doing.",
};

export default function IntakePage() {
  return (
    <Shell>
      <section className="pg-sec" aria-labelledby="intake-title">
        <div className="pg-head">
          <p className="pg-kicker">For companies</p>
          <h1 id="intake-title" className="pg-title">
            Tell us the problem.
          </h1>
          <p className="pg-lead">
            Tell us what happens today and what you wish happened instead. If
            it&apos;s not work we can finish, our first reply says so.{" "}
            <Link className="link" href="/work-with-us">
              How an engagement runs
            </Link>
            .
          </p>
        </div>
        <IntakeForm />
      </section>
    </Shell>
  );
}
