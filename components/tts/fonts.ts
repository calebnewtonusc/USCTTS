import { Archivo } from "next/font/google";

// One family (docs/DESIGN-tts.md). Archivo's width axis runs 62 to 125, so the
// expanded heavy display and the normal-width body are the same font, and the
// page never needs a second one. The terminal figure in the hero draws in the
// system monospace inside its canvas, because that is what a terminal is.
export const sans = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--tts-sans",
  display: "swap",
});

export const fontVars = sans.variable;
