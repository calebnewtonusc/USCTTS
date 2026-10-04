import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import PartnerForm from "@/components/tts/PartnerForm";

export const metadata: Metadata = {
  title: "Sponsor, speak or recruit | Trojan Tech Solutions",
  description: "Sponsor Trojan Tech Solutions, speak at a meeting, or recruit from the club.",
};

export default function PartnerPage() {
  return (
    <Shell>
      <section className="hero col section-head prose" aria-labelledby="partner-title">
        <h1 id="partner-title" className="t-h2">
          Sponsor, speak, or recruit.
        </h1>
        <p className="t-lead">
          For companies and people who want to back the club, talk to the people in it, or hire them. If you have a
          problem for us to build instead,{" "}
          <Link className="link" href="/work-with-us/form">
            use the project form
          </Link>
          .
        </p>
      </section>
      <section className="col mt-l" aria-label="Partnership inquiry">
        <PartnerForm />
      </section>
    </Shell>
  );
}
