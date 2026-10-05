import { Instrument_Sans } from "next/font/google";

// One family (docs/DESIGN-tts.md), chosen by measured proportions, not by name:
// cap height 0.72em, x-height 0.708 of the caps, measured 2026-10-04 at 100px
// against eleven other free grotesques. next/font self-hosts it, so the page
// makes no third-party font request. The width axis stays available for the
// rare place a condensed setting earns its keep.
export const sans = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--tts-sans",
  display: "swap",
});

export const fontVars = sans.variable;
