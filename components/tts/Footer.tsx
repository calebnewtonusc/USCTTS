import TcLink from "./TcLink";
import { INSTAGRAM_URL, TC_URL } from "./links";
import { mono } from "./v4/mono";
import "./footer.css";

/* The footer carries only what the header doesn't (Caleb, 2026-10-10: "The
 * footer shouldn't have anything the header has"): no The TTS way, no For
 * companies, no Join. What's left is the sponsor door, T Combinator when
 * its host is live, LinkedIn, Instagram, the student-org line and the
 * OpenStreetMap credit the map's licence asks for on every page.
 *
 * Two grounds, one design. "ending" sits inside home's and /way's cardinal
 * ending under the two doors, so Join followed by a white footer is never
 * two endings (Caleb, 2026-10-05: "Why do you have back to back
 * footers?"); it leaves out Instagram because the student door right above
 * links it. "full" is the same strip on paper for every other page. */
export default function Footer({
  variant = "full",
}: {
  variant?: "full" | "ending";
}) {
  const ending = variant === "ending";
  return (
    <footer
      className={`footer ${ending ? "is-ending" : "is-small"} ${mono.variable}`}
    >
      <nav className="footer-strip" aria-label="Footer">
        <ul>
          <li>
            <a href="/partner">Sponsor, speak or recruit</a>
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
          {!ending && (
            <li>
              <a href={INSTAGRAM_URL} rel="noreferrer" target="_blank">
                Instagram
              </a>
            </li>
          )}
        </ul>
        <p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="footer-mark"
            src="/tts/brand/mark-48.png"
            alt=""
            width={48}
            height={48}
          />
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
