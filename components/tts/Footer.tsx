import Link from "next/link";
import TcLink from "./TcLink";
import { INSTAGRAM_URL, TC_URL } from "./links";
import { mono } from "./v4/mono";

/* Two shapes. "full" is the white closing block every inner page ends on.
 * "ending" is home's: the same links, small and in mono, inside the
 * cardinal ending under the two doors, because Join followed by a white
 * footer was two endings (Caleb, 2026-10-05: "Why do you have back to back
 * footers?"). It leaves out Join and Instagram: the student door right
 * above already carries both, and nothing on home appears twice (Caleb,
 * 2026-10-09: "Repeating things is low aura"). */
export default function Footer({ variant = "full" }: { variant?: "full" | "ending" }) {
  if (variant === "ending") {
    return (
      <footer className={`footer is-ending ${mono.variable}`}>
        <nav className="footer-strip" aria-label="Footer">
          <ul>
            <li>
              <Link href="/members">People</Link>
            </li>
            <li>
              <Link href="/work-with-us">Work with us</Link>
            </li>
            <li>
              <Link href="/partner">Sponsor, speak or recruit</Link>
            </li>
            {TC_URL && (
              <li>
                <TcLink>T Combinator</TcLink>
              </li>
            )}
            <li>
              <a
                href="https://www.linkedin.com/company/trojan-tech-solutions/"
                rel="noreferrer"
                target="_blank"
              >
                LinkedIn
              </a>
            </li>
          </ul>
          <p>
            Trojan Tech Solutions, a student organization at USC.{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              rel="noreferrer"
              target="_blank"
            >
              Map &copy; OpenStreetMap contributors
            </a>
          </p>
        </nav>
      </footer>
    );
  }
  return (
    <footer className={`footer ${mono.variable}`}>
      <div className="footer-inner">
        <div>
          <h2>Trojan Tech Solutions</h2>
          <p className="label mt-s">
            USC&apos;s AI implementation lab, a student organization at the
            University of Southern California.
          </p>
        </div>
        <nav aria-label="Footer, for students">
          <p className="footer-head">Students</p>
          <ul>
            <li>
              <Link href="/apply">Join TTS</Link>
            </li>
            <li>
              <Link href="/members">People</Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Footer, for companies">
          <p className="footer-head">Companies</p>
          <ul>
            <li>
              <Link href="/work-with-us">Work with us</Link>
            </li>
            <li>
              <Link href="/partner">Sponsor, speak or recruit</Link>
            </li>
            {TC_URL && (
              <li>
                <TcLink>T Combinator</TcLink>
              </li>
            )}
          </ul>
        </nav>
        <nav aria-label="Footer, elsewhere">
          <p className="footer-head">Elsewhere</p>
          <ul>
            <li>
              <a
                href="https://www.linkedin.com/company/trojan-tech-solutions/"
                rel="noreferrer"
                target="_blank"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_URL}
                rel="noreferrer"
                target="_blank"
              >
                Instagram
              </a>
            </li>
          </ul>
        </nav>
      </div>
      {/* Home's grid of light is drawn from OpenStreetMap (ODbL), which asks
       * for this credit wherever the map appears; it sits on every page. */}
      <div className="footer-base">
        <a href="https://www.openstreetmap.org/copyright" rel="noreferrer" target="_blank">
          &copy; OpenStreetMap contributors
        </a>
      </div>
    </footer>
  );
}
