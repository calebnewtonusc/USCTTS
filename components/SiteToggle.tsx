"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* TTS and T Combinator are two sites that currently share one deployment.
 *
 * middleware.ts already routes a T Combinator hostname to /tc with the prefix
 * hidden, so the split is a DNS record and one entry in TC_HOSTS whenever the
 * domain is bought. Until then this toggle is how a visitor crosses between
 * them, and it is deliberately the first thing in the document so the two
 * sites read as siblings rather than one site with a subsection.
 *
 * When they do split, this component is the only thing that has to go.
 */
export default function SiteToggle() {
  const pathname = usePathname();
  const onTc = pathname === "/tc" || pathname.startsWith("/tc/");

  return (
    <div className="sitetoggle" role="navigation" aria-label="Switch site">
      <div className="sitetoggle-track">
        <Link
          href="/"
          className={onTc ? "sitetoggle-opt" : "sitetoggle-opt is-on"}
          aria-current={onTc ? undefined : "page"}
        >
          <span className="sitetoggle-mark">TTS</span>
          <span className="sitetoggle-name">Implementation lab</span>
        </Link>
        <Link
          href="/tc"
          className={onTc ? "sitetoggle-opt is-on" : "sitetoggle-opt"}
          aria-current={onTc ? "page" : undefined}
        >
          <span className="sitetoggle-mark">TC</span>
          <span className="sitetoggle-name">T Combinator</span>
        </Link>
      </div>
    </div>
  );
}
