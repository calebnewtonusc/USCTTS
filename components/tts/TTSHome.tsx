import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Hero, TheDifference, Bench, TCombinatorTeaser } from "./sections";
import Partners from "./partners";
import "./tts.css";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const body = Inter_Tight({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export default function TTSHome() {
  return (
    <div className={`tts-root ${display.variable} ${body.variable} ${mono.variable}`}>
      <main>
        <Hero />
        <hr className="tts-rule" />
        <TheDifference />
        <Partners />
        <Bench />
        <TCombinatorTeaser />
      </main>
    </div>
  );
}
