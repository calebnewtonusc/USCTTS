import type { Metadata } from "next";
import Shell from "@/components/tts/Shell";
import IntakeForm from "@/components/tts/IntakeForm";

export const metadata: Metadata = {
  title: "Tell us the problem | Trojan Tech Solutions",
  description: "Send Trojan Tech Solutions a problem a tool could solve.",
};

export default function IntakePage() {
  return (
    <Shell>
      <section className="hero col section-head prose" aria-labelledby="intake-title">
        <h1 id="intake-title" className="t-h2">
          Tell us the problem.
        </h1>
        <p className="t-lead">
          What happens today, and what you wish happened instead. If it is not work we can finish, our first reply says
          so.
        </p>
      </section>
      <section className="col mt-l" aria-label="Project intake">
        <IntakeForm />
      </section>
    </Shell>
  );
}
