"use client";

import { motion, useReducedMotion } from "motion/react";

/* THE MOTIF.
 *
 * Every framed thing on both sites is a record being enriched: a catalog
 * number in mono, a rule, then fields that resolve one at a time from a
 * skeleton bar into a real value.
 *
 * The reason this and not Lemma's wireframe plates: theirs are spheres and
 * grids that mean nothing, decoration standing in for a product. Enrichment
 * IS the product here. A visitor watching a field resolve is watching the
 * thing TTS sells, performed on data they chose. That is a claim the page
 * makes by doing rather than by asserting, which is the whole argument the
 * copy is trying to win.
 */

export interface Field {
  label: string;
  value: string | null;
  /** Renders as the accent. For the one field that carries the argument. */
  hot?: boolean;
}

interface Props {
  code: string;
  title: string;
  subtitle?: string;
  fields: Field[];
  logo?: string | null;
  /** Seconds of delay before the first field resolves. */
  delay?: number;
  tone?: "paper" | "ink";
}

export default function Record({
  code, title, subtitle, fields, logo, delay = 0, tone = "paper",
}: Props) {
  const still = useReducedMotion();
  const ink = tone === "ink";

  return (
    <div className={`rec ${ink ? "rec-ink" : ""}`}>
      <div className="rec-head">
        <span className="rec-code">{code}</span>
        <span className="rec-dot" aria-hidden="true" />
      </div>

      <div className="rec-title-row">
        {logo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={logo} alt="" className="rec-logo" width={34} height={34} />
        )}
        <div>
          <p className="rec-title">{title}</p>
          {subtitle && <p className="rec-sub">{subtitle}</p>}
        </div>
      </div>

      <dl className="rec-fields">
        {fields.map((f, i) => (
          <div className="rec-row" key={f.label}>
            <dt>{f.label}</dt>
            <dd>
              {f.value === null ? (
                <span className="rec-skel" aria-label="resolving" />
              ) : (
                <motion.span
                  className={f.hot ? "rec-hot" : undefined}
                  initial={still ? false : { opacity: 0, filter: "blur(4px)", y: 4 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.26,
                    // Staggered so fields land one after another, which is
                    // what makes it read as resolving rather than as a card
                    // that faded in.
                    delay: still ? 0 : delay + i * 0.09,
                    ease: [0.22, 0.61, 0.36, 1],
                  }}
                >
                  {f.value}
                </motion.span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
