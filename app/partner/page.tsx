import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import PartnerForm from "@/components/tts/PartnerForm";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Sponsor, speak or recruit | Trojan Tech Solutions",
  description:
    "Sponsor Trojan Tech Solutions, speak at a meeting, or recruit from the club.",
};

export default function PartnerPage() {
  return (
    <Shell>
      <section className="pg-sec" aria-labelledby="partner-title">
        <div className="pg-head">
          <p className="pg-kicker">Partner</p>
          <h1 id="partner-title" className="pg-title">
            Sponsor, speak, or recruit.
          </h1>
          <p className="pg-lead">
            You can back the club, talk to the people in it, or hire them, and if
            you&apos;re bringing a problem for us to build instead,{" "}
            <Link className="link" href="/work-with-us#intake">
              the project form
            </Link>{" "}
            is the one you want.
          </p>
        </div>
        <PartnerForm />
      </section>
    </Shell>
  );
}
