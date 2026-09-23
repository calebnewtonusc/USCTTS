"use client";

import { motion, useReducedMotion } from "motion/react";

/* The consulting-club argument, drawn instead of bulleted.
 *
 * A field of engagements. Most are ghosted and carry the word every USC
 * consulting club actually uses for its deliverable. A few are lit and carry
 * what TTS hands over instead. You get the argument before reading a sentence,
 * which is exactly the trick Lemma's trace grid pulls, aimed at our claim.
 *
 * The ghosted words are not invented. They were read off fourteen USC club
 * sites on 2026-09-22 and every one is quotable from a live page.
 */

const GHOST = [
  "Recommendations", "Strategic plan", "Final deliverable", "Actionable insights",
  "Market analysis", "Tailored solutions", "Deck", "Findings report",
  "Competitive landscape", "Roadmap", "Strategic recommendations", "Executive summary",
  "Implementation plan", "Deck", "Proposal", "Slide review", "Recommendations",
  "Case study", "Final presentation", "Insights deck", "Strategy memo", "Deck",
];

const LIT = [
  { at: 4, label: "Shipped", value: "A tool that runs without us" },
  { at: 9, label: "Shipped", value: "The owner, named, on their team" },
  { at: 14, label: "Shipped", value: "The SOP, written down" },
  { at: 19, label: "Shipped", value: "A number, measured before and after" },
];

export default function DeliverableField() {
  const still = useReducedMotion();
  const litAt = new Map(LIT.map((l) => [l.at, l]));

  return (
    <div className="field" role="img"
      aria-label="A field of consulting deliverables. Most read recommendations, strategic plan, deck. Four read shipped: a tool that runs without us, the owner named on their team, the SOP written down, and a number measured before and after.">
      {GHOST.map((word, i) => {
        const lit = litAt.get(i);
        return (
          <motion.div
            key={i}
            className={lit ? "field-cell field-lit" : "field-cell"}
            initial={still ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.32,
              // Lit cells land last so the eye catches the ghosts settling
              // first and then the answer arriving.
              delay: still ? 0 : (lit ? 0.5 : 0) + i * 0.022,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            aria-hidden="true"
          >
            {lit ? (
              <>
                <span className="field-tag">{lit.label}</span>
                <span className="field-val">{lit.value}</span>
              </>
            ) : (
              <span className="field-ghost">{word}</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
