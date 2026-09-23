"use client";

import { ADVISORS, ALUMNI } from "@/data/people";

/* Where the alumni went, running continuously. Duplicated once so the
 * translation loops seamlessly; paused on hover so anyone who wants to read
 * a name can. */
export default function Ticker() {
  const companies = Array.from(
    new Set([...ADVISORS, ...ALUMNI].map((p) => p.company).filter(Boolean)),
  ) as string[];
  const run = [...companies, ...companies];

  return (
    <div className="ticker" aria-label={`Alumni and advisors work at ${companies.join(", ")}`}>
      <div className="ticker-run">
        {run.map((c, i) => (
          <span className="ticker-item" key={`${c}-${i}`} aria-hidden={i >= companies.length}>
            {c}
            <span className="ticker-sep" aria-hidden="true">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
