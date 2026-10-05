import type { Metadata } from "next";
import Shell from "@/components/tts/Shell";
import PartnerForm from "@/components/tts/PartnerForm";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Sponsor, speak or recruit | Trojan Tech Solutions",
  description: "Sponsor Trojan Tech Solutions, speak at a meeting, or recruit from the club.",
};

export default function PartnerPage() {
  return (
    <Shell>
      <div className="pgx">
        <section className="pg-hero" aria-labelledby="partner-title">
          <div className="pg-hero-in is-split">
            <div className="pg-hero-copy">
              <p className="pg-kicker">Partner with TTS</p>
              <h1 id="partner-title" className="pg-title">
                Sponsor the club, speak to it, or hire from it.
              </h1>
              <p className="pg-lead">
                Tell us which one and a little about it, like the date you have in mind or the roles you&apos;re hiring
                for, and the people running the club will reply to the email you leave.
              </p>
            </div>
          </div>
        </section>
        <section className="pg-sec" aria-labelledby="pf-title">
          <h2 id="pf-title" className="sr-only">
            The partner form
          </h2>
          <div className="pg-formwrap">
            <PartnerForm />
          </div>
        </section>
      </div>
    </Shell>
  );
}
