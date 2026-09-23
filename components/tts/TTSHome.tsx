import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Hero, Partners, AlumniTicker, Bench, TCombinatorTeaser, Footer } from "./sections";
import Nav from "./Nav";
import ScrollScenes from "./ScrollScenes";
import SmoothScroll from "./SmoothScroll";
import "./tts.css";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const body = Inter_Tight({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export default function TTSHome() {
  return (
    <div className={`tts-root ${display.variable} ${body.variable} ${mono.variable}`}>
      <SmoothScroll />
      <Nav />
      <main>
        <Hero />
        <ScrollScenes />
        <Partners />
        <AlumniTicker />
        <Bench />
        <TCombinatorTeaser />
      </main>
      <Footer />
    </div>
  );
}
