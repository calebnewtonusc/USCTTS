import type { Metadata } from "next";
import Shell from "@/components/tts/Shell";
import ApplyForm from "@/components/tts/ApplyForm";

export const metadata: Metadata = {
  title: "Apply | Trojan Tech Solutions",
  description: "Apply to Trojan Tech Solutions, USC's applied AI implementation club.",
};

export default function ApplyPage() {
  return (
    <Shell>
      <section className="hero col section-head prose" aria-labelledby="apply-title">
        <h1 id="apply-title" className="t-h2">
          Apply to join.
        </h1>
        <p className="t-lead">
          Six short questions. The last one matters most: tell us about one thing you have made, or one thing you want
          to make. It only needs to be yours.
        </p>
        {/* [NEED: the next cohort's application window and reply time. Neither is on record.] */}
      </section>
      <section className="col mt-l" aria-label="Application">
        <ApplyForm />
      </section>
    </Shell>
  );
}
