import { Schibsted_Grotesk, Source_Serif_4 } from "next/font/google";

// Two families and never a third (docs/DESIGN-tts.md). The serif carries every
// word a person reads; the grotesk is the instrument face for labels, buttons
// and figures. T Combinator owns the single-sans look, so TTS never sets a
// heading in the grotesk.
export const serif = Source_Serif_4({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--tts-serif",
  display: "swap",
});

export const grotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--tts-grotesk",
  display: "swap",
});

export const fontVars = `${serif.variable} ${grotesk.variable}`;
