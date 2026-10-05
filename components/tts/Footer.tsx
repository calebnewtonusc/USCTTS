import Link from "next/link";
import TcLink from "./TcLink";
import { TC_URL } from "./links";

export default function Footer() {
  return (
    <footer className="footer">
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
                href="https://www.instagram.com/trojantechsolutions"
                rel="noreferrer"
                target="_blank"
              >
                Instagram
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
