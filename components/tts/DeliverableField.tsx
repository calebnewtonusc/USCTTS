"use client";

import { rng } from "./gizmos/geometry";

/* The consulting-club argument, drawn instead of bulleted.
 *
 * Rebuilt 2026-09-23 from three frames of uselemma.ai's trace grid that Caleb
 * sent. The earlier version here was a uniform CSS grid that faded in once,
 * which missed every mechanism that makes theirs land:
 *
 *   1. BRICK OFFSET. Rows are shifted horizontally against each other and
 *      cell widths vary inside a row. A uniform grid reads as a table; an
 *      offset one reads as a field of records.
 *   2. THREE-PHASE SPAWN. Frame one is empty outlines with no text at all.
 *      The cells arrive first, then labels populate, then the flagged ones
 *      bloom. Fading in a finished grid throws away two of the three beats.
 *   3. IT KEEPS MOVING. Frames two and three carry identical content at a
 *      different offset, so the whole field drifts after it settles.
 *
 * The ghosted words are quoted off fourteen live USC club pages, read on
 * 2026-09-22. The lit ones are what TTS hands over instead.
 */

const GHOST = [
  "Recommendations", "Strategic plan", "Final deliverable", "Actionable insights",
  "Market analysis", "Tailored solutions", "Deck", "Findings report",
  "Competitive landscape", "Roadmap", "Executive summary", "Deck",
  "Implementation plan", "Proposal", "Slide review", "Recommendations",
  "Case study", "Final presentation", "Insights deck", "Strategy memo",
  "Deck", "Workshop readout", "Opportunity map", "Deck",
  "Synthesis", "Next steps", "Strategic review", "Deck",
];

const LIT: Record<number, { tag: string; quote: string }> = {
  5:  { tag: "Shipped", quote: "A tool that runs without us" },
  11: { tag: "Named owner", quote: "The person on their team who owns it" },
  17: { tag: "Written down", quote: "The SOP, so it survives us leaving" },
  23: { tag: "Measured", quote: "A number, before and after" },
};

const ROWS = 7;
const PER_ROW = 4;

export default function DeliverableField() {
  const rand = rng(31);

  // Pre-computed so the server and client agree; Math.random here would
  // desync the markup and warn on hydration.
  const rows = Array.from({ length: ROWS }, (_, r) => ({
    // Each row starts at a different inset, which is the brick bond.
    offset: [0, 3.5, 1.8, 5.2, 0.9, 4.4, 2.6][r],
    cells: Array.from({ length: PER_ROW }, (_, c) => {
      const i = r * PER_ROW + c;
      return {
        i,
        // Widths vary inside a row rather than filling a fixed track.
        grow: 0.82 + rand() * 0.55,
        ghost: GHOST[i % GHOST.length],
        lit: LIT[i],
      };
    }),
  }));

  return (
    <div
      className="tfield"
      role="img"
      aria-label="A field of consulting deliverables. Most read recommendations, strategic plan, deck. Four read differently: a tool that runs without us, the person on their team who owns it, the SOP so it survives us leaving, and a number before and after."
    >
      <div className="tfield-drift">
        {rows.map((row, r) => (
          <div className="tfield-row" key={r} style={{ marginLeft: `${row.offset}%` }}>
            {row.cells.map((cell) => (
              <div
                key={cell.i}
                className={cell.lit ? "tcell tcell-lit" : "tcell"}
                style={{
                  flexGrow: cell.grow,
                  // Phase one: the empty outline arrives, row by row.
                  animationDelay: `${r * 0.05 + (cell.i % PER_ROW) * 0.025}s`,
                }}
                aria-hidden="true"
              >
                <span
                  className="tcell-body"
                  style={{
                    // Phase two: the text populates, after every outline is
                    // on screen. Phase three for lit cells, later still.
                    animationDelay: `${(cell.lit ? 1.5 : 0.85) + r * 0.05}s`,
                  }}
                >
                  {cell.lit ? (
                    <>
                      <span className="tcell-tag">{cell.lit.tag}</span>
                      <span className="tcell-quote">&ldquo;{cell.lit.quote}&rdquo;</span>
                    </>
                  ) : (
                    <span className="tcell-code">{cell.ghost}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
