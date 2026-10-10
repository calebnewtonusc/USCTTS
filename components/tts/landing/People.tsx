import type { CSSProperties } from "react";
import { ADVISORS } from "@/data/people";

/*
 * The club advisors on home's sheet (Tyler's voice memos, 2026-10-09:
 * Duncan and the others' real photos and background; his retitle "Club
 * advisors, open to a coffee chat anytime"). Caleb, 2026-10-10, of the row
 * of small white cards: "TS so ugly and doesn't make em go WOAHHHHH". So
 * each advisor is a big portrait on a saturated clay colour, the mark of
 * where they are at its real size on a white chip, and the whole card is a
 * link to them. Every line is sourced in data/people.ts and nothing is
 * added here. The cardinal point from the opener marks the card under the
 * pointer, the same mark the section rail and the network use.
 */

// One saturated colour per advisor, so no two neighbours match. Gold
// carries ink; the rest carry white.
const TONES = [
  { bg: "#2f7a3a", fg: "#ffffff" },
  { bg: "#2b6fae", fg: "#ffffff" },
  { bg: "#c2412b", fg: "#ffffff" },
  { bg: "#ffcc00", fg: "#2a1b1e" },
  { bg: "#6b3fa0", fg: "#ffffff" },
  { bg: "#990000", fg: "#ffffff" },
];

const LINK_SAYS: Record<string, string> = {
  "Chris Swain": "faculty page",
};

export function Mentors() {
  return (
    <ul className="ad-grid">
      {ADVISORS.map((p, i) => {
        const rows = p.background ?? [{ label: p.role, logo: p.logo }];
        const mark = p.logo ?? rows.find((r) => r.logo)?.logo;
        const body = (
          <>
            <span className="ad-photo">
              {p.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt="" loading="lazy" decoding="async" />
              )}
              {mark && (
                <span className="ad-chip">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mark}
                    alt={p.company ?? ""}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              )}
              <span className="ad-dot" aria-hidden="true" />
            </span>
            <span className="ad-body">
              <b className="ad-name">{p.name}</b>
              <ul className="ad-rows">
                {rows.map((r) => (
                  <li key={r.label}>{r.label}</li>
                ))}
              </ul>
              {p.link && (
                <span className="ad-go">
                  {LINK_SAYS[p.name] ?? "LinkedIn"}{" "}
                  <span aria-hidden="true">&#8599;</span>
                </span>
              )}
            </span>
          </>
        );
        const t = TONES[i % TONES.length];
        const style = { "--tone": t.bg, "--fg": t.fg } as CSSProperties;
        return (
          <li
            key={p.name}
            className="ad-card"
            style={style}
            data-reveal={String(i % 3)}
          >
            {p.link ? (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="ad-link"
                aria-label={`${p.name}, ${rows[0].label}, ${LINK_SAYS[p.name] ?? "LinkedIn"} (opens in a new tab)`}
              >
                {body}
              </a>
            ) : (
              <div className="ad-link is-static">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
