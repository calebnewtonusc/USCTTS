import type { Metadata } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import SiteToggle from "@/components/SiteToggle";
import "@/components/site-toggle.css";
import "./tc.css";

// Three lanes, never crossed: serif display, tight grotesk for everything a
// person reads, mono only for data and labels. All three are free, which is
// the whole reason this pairing was picked over the licensed faces the
// reference sites run.
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});
const body = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "T Combinator | USC builders, working on your company",
  description:
    "We put USC's best builders on free contract work for YC companies. Three companies a semester.",
  openGraph: {
    title: "T Combinator",
    description:
      "USC builders on free contract work for YC companies. Three companies a semester.",
    type: "website",
  },
  // The personalized pages exist to be opened by one founder from one DM.
  // They are not search results and should never be indexed.
  robots: { index: true, follow: true },
};

export default function TcLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`tc-root ${display.variable} ${body.variable} ${mono.variable}`}>
      <SiteToggle />
      {children}
    </div>
  );
}
