import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import SiteToggle from "@/components/SiteToggle";
import Choreography from "@/components/tc/Choreography";
import "@/components/site-toggle.css";
import "./tc.css";

/* One family, and width is the hierarchy: Archivo's wdth axis runs 62 to 125,
 * so display type goes wide instead of heavy. No serif (that is the TTS
 * site's voice) and no mono (that is every terminal-styled club at USC). */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--tc-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "T Combinator | USC builders on the work your company keeps not doing",
  description:
    "USC builders on free contract work for YC companies. Three companies in the spring cohort. Not affiliated with Y Combinator.",
  openGraph: {
    title: "T Combinator",
    description:
      "USC builders on free contract work for YC companies. Three companies in the spring cohort.",
    type: "website",
  },
};

export default function TcLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`tc-root tc-armed ${archivo.variable}`}>
      {/* Without JS nothing would ever fill the highlights, so unarm. */}
      <noscript>
        <style>
          {
            ".tc-armed .tc-fill{background-size:100% 100%!important;color:var(--on-fill)!important}"
          }
        </style>
      </noscript>
      <a href="#main" className="tc-skip">
        Skip to the page
      </a>
      <SiteToggle />
      <Choreography />
      {children}
    </div>
  );
}
