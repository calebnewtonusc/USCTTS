"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/members", label: "Team" },
  { href: "/work-with-us", label: "For companies" },
  { href: "/tc", label: "T Combinator" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* The recruiting date. The campus survey found nobody at USC publishes
        * one: TroyLabs points at an Instagram handle and LavaLab's apply
        * button goes to a closed Google Form. It was the cheapest available
        * win and the first build shipped without it. */}
      <div className="topbar">
        <span className="topbar-dot" aria-hidden="true" />
        Spring cohort applications open in October. Three companies, not more.
        <Link href="/apply" className="topbar-link">Get the date</Link>
      </div>

      <nav className={scrolled ? "nav nav-scrolled" : "nav"} aria-label="Main">
        <Link href="/" className="nav-mark">
          <span className="nav-mark-badge">TTS</span>
          <span className="nav-mark-name">Trojan Tech Solutions</span>
        </Link>
        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
          ))}
        </ul>
        <Link href="/apply" className="nav-cta">Join</Link>
      </nav>
    </>
  );
}
