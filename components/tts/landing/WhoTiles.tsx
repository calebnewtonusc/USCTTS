/*
 * The four things the statement names, each one drawn as a small looping
 * scene under it: clay-soft tinted cards with a manim-style figure inside
 * that writes itself, moves, and holds. Caleb, 2026-10-11 2:48am, on the
 * statement standing alone over a blank band: "Bro I thought i had told
 * you to never make a lame section", then "clay X lemma with our manim
 * twist". Tyler had cut the city for being too big to scroll through, so
 * this stays one compact row: the work shown happening, not described twice.
 */
import "./who-tiles.css";

const TILES = [
  {
    key: "auto",
    tint: "is-blush",
    label: "Automations",
    note: "Every intake runs itself",
  },
  {
    key: "crm",
    tint: "is-sky",
    label: "CRMs",
    note: "Every contact in one place",
  },
  {
    key: "out",
    tint: "is-sage",
    label: "Outbound",
    note: "From first email to booked call",
  },
  {
    key: "train",
    tint: "is-sun",
    label: "Team training",
    note: "Your team runs it after we leave",
  },
] as const;

type Kind = (typeof TILES)[number]["key"];

function Scene({ kind }: { kind: Kind }) {
  if (kind === "auto") {
    return (
      <svg className="wt-svg wt-auto" viewBox="0 0 200 96" aria-hidden="true">
        <path className="wt-draw" pathLength={1} d="M30 48 H100 H170" />
        <circle className="wt-node n1" cx="30" cy="48" r="11" />
        <circle className="wt-node n2" cx="100" cy="48" r="11" />
        <circle className="wt-node n3" cx="170" cy="48" r="11" />
        <circle className="wt-run" cx="30" cy="48" r="5" />
      </svg>
    );
  }
  if (kind === "crm") {
    return (
      <svg className="wt-svg wt-crm" viewBox="0 0 200 96" aria-hidden="true">
        {[0, 1, 2, 3].map((r) => (
          <g key={r} className={`wt-row r${r}`}>
            <circle cx="34" cy={18 + r * 20} r="5" />
            <rect
              x="48"
              y={14 + r * 20}
              width={64 + ((r * 23) % 40)}
              height="8"
              rx="4"
            />
            <rect
              className="wt-pill"
              x="150"
              y={13 + r * 20}
              width="26"
              height="10"
              rx="5"
            />
          </g>
        ))}
      </svg>
    );
  }
  if (kind === "out") {
    return (
      <svg className="wt-svg wt-out" viewBox="0 0 200 96" aria-hidden="true">
        <path
          className="wt-draw"
          pathLength={1}
          d="M26 70 C 70 70, 90 22, 150 30"
        />
        <rect className="wt-cal" x="148" y="16" width="30" height="30" rx="7" />
        <path className="wt-tick" pathLength={1} d="M156 31 l5 5 l10 -11" />
        <circle className="wt-send" cx="26" cy="70" r="6" />
      </svg>
    );
  }
  return (
    <svg className="wt-svg wt-train" viewBox="0 0 200 96" aria-hidden="true">
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect
            className="wt-track"
            x="26"
            y={20 + r * 24}
            width="120"
            height="10"
            rx="5"
          />
          <rect
            className={`wt-fill f${r}`}
            x="26"
            y={20 + r * 24}
            width="120"
            height="10"
            rx="5"
          />
        </g>
      ))}
      <path className="wt-tick" pathLength={1} d="M160 49 l7 7 l14 -16" />
    </svg>
  );
}

export default function WhoTiles() {
  return (
    <ul className="wt" aria-label="What we build">
      {TILES.map((t, i) => (
        <li
          key={t.key}
          className={`wt-tile ${t.tint}`}
          data-reveal={String(Math.min(i + 1, 3))}
        >
          <Scene kind={t.key} />
          <span className="wt-label">{t.label}</span>
          <span className="wt-note">{t.note}</span>
        </li>
      ))}
    </ul>
  );
}
