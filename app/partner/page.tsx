import type { Metadata } from "next";
import Shell from "@/components/tts/Shell";
import { mono } from "@/components/tts/v4/mono";
import PartnerForm from "@/components/tts/PartnerForm";
import GridEcho from "../work-with-us/GridEcho";
import Routes from "./Routes";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Sponsor, speak or recruit | Trojan Tech Solutions",
  description: "Sponsor Trojan Tech Solutions, speak at a meeting, or recruit from the club.",
};

export default function PartnerPage() {
  return (
    <Shell>
      <div className={`pgx ${mono.variable}`}>
        <section className="ix is-short" aria-labelledby="partner-title">
          <GridEcho usc={null} />
          <div className="ix-in">
            <h1 id="partner-title" className="ix-line">
              Partner with the club.
            </h1>
            <Routes />
          </div>
          <p className="ix-readout">
            <span>34.0224&deg; N 118.2851&deg; W</span>
            <span>
              <b>&bull;</b> three routes out of USC
            </span>
          </p>
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
