import type { Metadata } from "next";
import Shell from "@/components/tts/Shell";
import ApplyForm from "@/components/tts/ApplyForm";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Apply | Trojan Tech Solutions",
  description: "Apply to Trojan Tech Solutions, USC's GTM and AI club.",
};

export default function ApplyPage() {
  return (
    <Shell>
      <section className="pg-sec" aria-labelledby="apply-title">
        <div className="pg-head">
          <p className="pg-kicker">Join</p>
          <h1 id="apply-title" className="pg-title">
            Join TTS, learn to build all of this, and build it for a real company.
          </h1>
          <p className="pg-lead">
            Six short questions. The last one matters most: one thing you&apos;ve made, or want to make. It only
            needs to be yours.
          </p>
          {/* [NEED: the next cohort's application window and reply time. Neither is on record.] */}
        </div>
        <ApplyForm />
      </section>
    </Shell>
  );
}
