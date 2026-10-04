"use client";

/* The trace grid, replicating uselemma.ai's mechanism.
 *
 * Measured off their page on 2026-09-23 rather than guessed:
 *
 *   container ....... ONE <svg>, not DOM cells. viewBox "-1200 -800 2400 1500",
 *                     which is centred on the origin so the whole field can be
 *                     scaled or panned from its middle.
 *   cell ............ <g> holding a <rect width=320 height=130 rx=6>,
 *                     stroke 2px, plus <text> in IBM Plex Mono
 *   count ........... 42 rects, constant at every scroll position
 *
 * The part that is the actual trick, and the reason scrolling it feels alive:
 * NOTHING TRANSFORMS. Sampling their scroll showed 42 rects the whole way
 * through while the text count went 33 -> 51 and the filled count went 0 -> 9.
 * Scroll progress drives state, and the state decides how much of the grid has
 * been written. The field builds itself as you move through it.
 *
 * A first attempt here was CSS keyframes on DOM divs with fixed delays, which
 * plays the same animation whether you scroll or sit still. That is the whole
 * difference between a page that reacts to a reader and one that does not.
 */

import { rng } from "./gizmos/geometry";

/* Their geometry, in their units. */
const VB = { x: -1200, y: -800, w: 2400, h: 1500 };
const CELL = { w: 320, h: 130, rx: 6, stroke: 2 };
const COLS = 6;
const ROWS = 7;
const GAP = 14;

const GHOST = [
  "Recommendations", "Strategic plan", "Final deliverable", "Actionable insights",
  "Market analysis", "Tailored solutions", "Deck", "Findings report",
  "Competitive landscape", "Roadmap", "Executive summary", "Deck",
  "Implementation plan", "Proposal", "Slide review", "Recommendations",
  "Case study", "Final presentation", "Insights deck", "Strategy memo",
  "Deck", "Workshop readout", "Opportunity map", "Deck", "Synthesis",
  "Next steps", "Strategic review", "Deck", "Benchmarking", "Gap analysis",
  "Findings", "Deck", "Readout", "Prioritisation", "Deck", "Summary",
  "Recommendations", "Deck", "Final report", "Slide deck", "Deck", "Playbook",
];

/* The lit cells, in the order they should arrive. Theirs bloom nine at a time
 * against 42; four against 42 keeps the same ratio of signal to field without
 * claiming more than TTS actually delivers. */
const LIT = [
  { at: 9,  tag: "Shipped",      quote: "A tool that runs without us" },
  { at: 16, tag: "Named owner",  quote: "The person on their team who owns it" },
  { at: 26, tag: "Written down", quote: "The SOP, so it survives us leaving" },
  { at: 34, tag: "Measured",     quote: "A number, before and after" },
];

interface Cell {
  i: number; x: number; y: number; w: number;
  code: string; ghost: string;
  lit?: { tag: string; quote: string };
}

function layout(): Cell[] {
  const rand = rng(17);
  const litBy = new Map(LIT.map((l) => [l.at, l]));
  const cells: Cell[] = [];
  const rowH = CELL.h + GAP;
  const startY = VB.y + 140;

  for (let r = 0; r < ROWS; r++) {
    // Brick offset: each row starts at a different inset so the field reads as
    // records rather than as a table. Theirs varies both offset and width.
    const offset = [0, 0.42, 0.18, 0.55, 0.1, 0.36, 0.26][r] * (CELL.w + GAP);
    let x = VB.x + 120 + offset;
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      if (i >= 42) break;
      const w = CELL.w * (0.82 + rand() * 0.5);
      cells.push({
        i, x, y: startY + r * rowH, w,
        code: `TRC-${(i * 37 + 41).toString(16).toUpperCase().padStart(3, "0").slice(-3)}`,
        ghost: GHOST[i % GHOST.length],
        lit: litBy.get(i),
      });
      x += w + GAP;
    }
  }
  return cells;
}

const CELLS = layout();

/**
 * @param progress 0 to 1 through the scene. Drives how much of the field has
 *        been written, exactly as their scroll position does.
 */
export default function TraceGrid({ progress }: { progress: number }) {
  const p = Math.min(1, Math.max(0, progress));

  // Labels appear first, across the first 60% of the scene. Theirs went 33 of
  // 42 to 51 of 42 (some cells carry two text nodes), so labels are already
  // well underway before anything fills.
  const labelled = Math.round(CELLS.length * Math.min(1, p / 0.6));
  // The lit cells bloom last, over the final 45%, so the answer arrives after
  // the reader has taken in the field it is answering.
  const litShown = Math.round(LIT.length * Math.min(1, Math.max(0, (p - 0.55) / 0.45)));
  let litSeen = 0;

  return (
    <svg
      className="tgrid"
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      role="img"
      aria-label="A field of consulting deliverables reading recommendations, strategic plan and deck. Four of them instead read: a tool that runs without us, the person on their team who owns it, the SOP so it survives us leaving, and a number before and after."
    >
      {CELLS.map((c) => {
        const isLit = Boolean(c.lit);
        const litIndex = isLit ? litSeen++ : -1;
        const litOn = isLit && litIndex < litShown;
        const hasLabel = c.i < labelled;

        return (
          <g key={c.i} className={litOn ? "tg-cell tg-lit" : "tg-cell"}>
            <rect
              x={c.x} y={c.y} width={c.w} height={CELL.h} rx={CELL.rx}
              className={litOn ? "tg-rect tg-rect-on" : "tg-rect"}
            />
            {hasLabel && !litOn && (
              <text x={c.x + 22} y={c.y + 38} className="tg-code">{c.code}</text>
            )}
            {hasLabel && !litOn && (
              <text x={c.x + 22} y={c.y + 76} className="tg-ghost">{c.ghost}</text>
            )}
            {litOn && (
              <>
                <text x={c.x + 22} y={c.y + 40} className="tg-tag">
                  {c.lit!.tag.toUpperCase()}
                </text>
                <text x={c.x + 22} y={c.y + 84} className="tg-quote">
                  &ldquo;{c.lit!.quote}&rdquo;
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
