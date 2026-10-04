import SiteToggle from "@/components/SiteToggle";
import "@/components/site-toggle.css";
import { fontVars } from "./fonts";
import Nav from "./Nav";
import Footer from "./Footer";
import "./tts.css";

/* Every TTS route renders inside this. The .tts class is the scope for the
 * whole system in tts.css, so nothing TTS styles can reach /tc. */
export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`tts ${fontVars}`}>
      <a className="skip" href="#main">Skip to content</a>
      <SiteToggle />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
