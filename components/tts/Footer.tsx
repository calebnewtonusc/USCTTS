import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h2>Trojan Tech Solutions</h2>
          <p className="label mt-s">
            A student organization at the University of Southern California.
            Engineering and GTM engineering for companies, and the people who
            learn it by doing it.
          </p>
        </div>
        <nav aria-label="Footer, the club">
          <ul>
            <li><Link className="link" href="/about">About</Link></li>
            <li><Link className="link" href="/members">People</Link></li>
            <li><Link className="link" href="/build">Build team</Link></li>
            <li><Link className="link" href="/apply">Join</Link></li>
          </ul>
        </nav>
        <nav aria-label="Footer, for companies">
          <ul>
            <li><Link className="link" href="/work-with-us">For companies</Link></li>
            <li><Link className="link" href="/partner">Sponsor or speak</Link></li>
            <li><Link className="link" href="/tc">T Combinator</Link></li>
            <li><a className="link" href="https://www.linkedin.com/company/trojan-tech-solutions/" rel="noreferrer" target="_blank">LinkedIn</a></li>
            <li><a className="link" href="https://www.instagram.com/trojantechsolutions" rel="noreferrer" target="_blank">Instagram</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
