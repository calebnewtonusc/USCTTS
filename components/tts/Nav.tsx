"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TcLink from "./TcLink";
import "./pages.css";

// About, Build and the meeting slides are gone (next.config.mjs sends them
// to /), so the nav is the two pages a visitor actually looks for plus Join.
const LINKS = [
  { href: "/way", label: "The TTS way" },
  { href: "/members", label: "People" },
  { href: "/work-with-us", label: "For companies" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The sheet remembers the path it was opened on, so any navigation closes
  // it without an effect watching the route.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenOn(null);
      menuBtn.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpenOn(null);
  const cls = ["nav", scrolled ? "is-scrolled" : "", open ? "is-open" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={cls}>
      <nav className="nav-inner" aria-label="Main">
        <Link href="/" className="nav-mark" onClick={close}>
          <span className="nav-mark-dot" aria-hidden="true" />
          <span className="nav-mark-name">Trojan Tech Solutions</span>
          <span className="nav-mark-sub">USC</span>
        </Link>
        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/apply"
          className="btn nav-join"
          onClick={close}
          aria-current={pathname === "/apply" ? "page" : undefined}
        >
          Join
        </Link>
        <button
          type="button"
          ref={menuBtn}
          className="btn nav-menu-btn"
          aria-expanded={open}
          aria-controls="nav-sheet"
          onClick={() => setOpenOn(open ? null : pathname)}
        >
          <span className="nav-burger" aria-hidden="true" />
          {open ? "Close" : "Menu"}
        </button>
      </nav>
      {open && (
        <div className="nav-sheet" id="nav-sheet">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={close}
                  aria-current={pathname === l.href ? "page" : undefined}
                >
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
          <Link href="/apply" className="btn nav-join" onClick={close}>
            Join TTS
          </Link>
        </div>
      )}
    </header>
  );
}
