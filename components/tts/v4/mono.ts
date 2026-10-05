import { Geist_Mono } from "next/font/google";

// The readout face (docs/DIRECTION-tts-v4.md: "the existing grotesk, plus
// mono for the readouts"). Mono is a lane for values a machine could have
// written, coordinates, times, status, never a kicker over a heading.
export const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--tts-mono",
  display: "swap",
});
