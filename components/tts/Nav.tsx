"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TcLink from "./TcLink";

const LINKS = [
  { href: "/members", label: "People" },
  { href: "/work-with-us", label: "For companies" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet on navigation, and on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      // Focus goes back to the control that opened the sheet.
      menuBtn.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={scrolled ? "nav is-scrolled" : "nav"}>
      <nav className="nav-inner" aria-label="Main">
        <Link href="/" className="nav-mark" onClick={() => setOpen(false)}>
          <span className="nav-mark-name">Trojan Tech Solutions</span>
          <span className="nav-mark-sub">USC</span>
        </Link>
        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="link" aria-current={pathname === l.href ? "page" : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/apply" className="btn btn-primary" onClick={() => setOpen(false)}>
          Join
        </Link>
        <button
          type="button"
          ref={menuBtn}
          className="btn btn-secondary nav-menu-btn"
          aria-expanded={open}
          aria-controls="nav-sheet"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>
      {open && (
        <div className="nav-sheet" id="nav-sheet">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} aria-current={pathname === l.href ? "page" : undefined}>
                  {l.label}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </li>
            ))}
            <li>
              <TcLink hideWhenPending>
                T Combinator
                <span aria-hidden="true">&rarr;</span>
              </TcLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
