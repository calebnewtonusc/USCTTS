"use client";

import { usePathname } from "next/navigation";
import Lookup from "./Lookup";

/* not-found.tsx receives no params, so the slug comes from the path. The
 * search starts already filled with it, hyphens read as spaces, which turns
 * "/for/strpe" into a search for "strpe" and usually one obvious fix. */
export default function MissingCompany() {
  const pathname = usePathname();
  const raw = decodeURIComponent(
    pathname.split("/").filter(Boolean).pop() ?? "",
  );
  const guess = raw.replace(/[-_]+/g, " ").trim();

  return (
    <>
      <h1 id="missing-h" className="tc-h1 tc-h1--sm">
        We couldn&apos;t find &ldquo;{raw || "that company"}&rdquo; in the YC
        directory.
      </h1>
      <p className="tc-lead tc-prose">
        It might be a typo in the link, or a company renamed since our copy of
        the directory was built. Search for it here and the brief opens.
      </p>
      <Lookup demo={[]} initialQuery={guess} label="Search the directory" />
    </>
  );
}
