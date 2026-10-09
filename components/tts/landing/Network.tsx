"use client";

import { useState } from "react";
import { ALUMNI } from "@/data/people";

// Marks on disk in public/tts/alumni. A company without one renders as its
// name, so a new alum never needs a logo before they can be listed.
const LOGOS: Record<string, string> = {
  Apple: "/tts/alumni/apple.svg",
  Bloomberg: "/tts/alumni/bloomberg.svg",
  "Capital One": "/tts/alumni/capitalone.svg",
  Citi: "/tts/alumni/citi.svg",
  Fastly: "/tts/alumni/fastly.svg",
  Jefferies: "/tts/alumni/jefferies.svg",
  Nomura: "/tts/alumni/nomura.svg",
  PwC: "/tts/alumni/pwc.svg",
  Reddit: "/tts/alumni/reddit.svg",
};

const COMPANIES = Array.from(
  new Set(ALUMNI.map((p) => p.company).filter((c): c is string => Boolean(c))),
).sort((a, b) => Number(Boolean(LOGOS[b])) - Number(Boolean(LOGOS[a])));

/* Tyler asked for "some interactive thing about the alumni and where
 * they've gone". The wall is the companies; picking one lights its people
 * below and dims the rest, and picking it again shows everyone. */
export default function Network() {
  const [pick, setPick] = useState<string | null>(null);

  return (
    <div className="ld-net">
      <ul className="ld-logos" aria-label="Companies our alumni work at">
        {COMPANIES.map((c) => {
          const on = pick === c;
          return (
            <li key={c}>
              <button
                type="button"
                className={`ld-logo${on ? " is-on" : ""}`}
                aria-pressed={on}
                onClick={() => setPick(on ? null : c)}
              >
                {LOGOS[c] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={LOGOS[c]} alt={c} />
                ) : (
                  <span>{c}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <ul className="ld-faces" aria-live="polite">
        {ALUMNI.map((p) => {
          const dim = pick !== null && p.company !== pick;
          return (
            <li key={p.name} className={`ld-face${dim ? " is-dim" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.photo && <img src={p.photo} alt="" loading="lazy" />}
              <b>{p.name}</b>
              <span>
                {p.role}
                {p.company ? `, ${p.company}` : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
