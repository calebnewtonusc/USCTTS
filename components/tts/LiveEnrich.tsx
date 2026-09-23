"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Record, { type Field } from "./Record";
import type { YcCompany } from "@/lib/yc";

/* The homepage centerpiece.
 *
 * A visitor types a YC company and watches its record resolve out of the real
 * 6,245-company index. Nothing else on this campus does this, and Lemma has
 * nothing playable at all.
 *
 * It is also the honest version of the pitch. The site claims TTS does GTM
 * engineering; this performs it on a company the reader picked, in about a
 * second, which is a harder thing to disbelieve than a sentence saying so.
 */

interface Hit { slug: string; name: string; oneLiner: string; batch: string }

/* Verified against data/yc-index.json. The first draft seeded "cursor" and
 * "vercel", and neither is in YC's launched-company directory, so the hero
 * would have loaded nothing and shown skeleton bars forever. Every slug below
 * was checked to resolve. */
const SEEDS = ["brex", "deel", "retool", "vanta", "rippling"];

export default function LiveEnrich() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [company, setCompany] = useState<YcCompany | null>(null);
  const [resolving, setResolving] = useState(false);
  const [seedIndex, setSeedIndex] = useState(0);
  const still = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  // Load one company on mount so the hero is never an empty box. Without this
  // the most important element on the page is a placeholder until somebody
  // decides to interact, and most people never do.
  useEffect(() => {
    void load(SEEDS[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle the placeholder so it reads as a prompt rather than as chrome.
  useEffect(() => {
    if (still) return;
    const t = setInterval(() => setSeedIndex((i) => (i + 1) % SEEDS.length), 2600);
    return () => clearInterval(t);
  }, [still]);

  useEffect(() => {
    if (query.trim().length < 2) { setHits([]); return; }
    const id = ++requestId.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/yc/search?q=${encodeURIComponent(query)}`);
        const data = (await res.json()) as { hits: Hit[] };
        // A slower earlier request must not overwrite a newer one.
        if (id === requestId.current) setHits(data.hits ?? []);
      } catch { /* search failing should not break the hero */ }
    }, 140);
    return () => clearTimeout(t);
  }, [query]);

  async function load(slug: string) {
    setResolving(true);
    setHits([]);
    try {
      const res = await fetch(`/api/yc/company?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error(String(res.status));
      setCompany((await res.json()) as YcCompany);
    } catch {
      setCompany(null);
    } finally {
      setResolving(false);
    }
  }

  const fields: Field[] = company
    ? [
        { label: "Batch", value: company.batch },
        { label: "Team size", value: company.teamSize !== null ? String(company.teamSize) : "unlisted" },
        { label: "Location", value: company.location || "unlisted" },
        { label: "Hiring", value: company.isHiring ? "Yes, right now" : "Not posted" },
        {
          label: "What we'd take",
          value: company.isHiring
            ? "The work waiting on that hire"
            : "Whatever is nobody's first priority",
          hot: true,
        },
      ]
    : [
        { label: "Batch", value: null },
        { label: "Team size", value: null },
        { label: "Location", value: null },
        { label: "Hiring", value: null },
        { label: "What we'd take", value: null },
      ];

  return (
    <div className="enrich">
      <div className="enrich-bar">
        <label htmlFor="yc-q" className="enrich-label">
          Type any Y Combinator company
        </label>
        <div className="enrich-input-wrap">
          <input
            id="yc-q"
            ref={inputRef}
            className="enrich-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={SEEDS[seedIndex]}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="enrich-help"
          />
          <span className="enrich-count" aria-hidden="true">6,245 indexed</span>
        </div>
        <p id="enrich-help" className="enrich-help">
          We pull their batch, headcount and hiring status live. This is the
          work, running on whoever you picked.
        </p>

        <AnimatePresence>
          {hits.length > 0 && (
            <motion.ul
              className="enrich-hits"
              initial={still ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
            >
              {hits.map((h) => (
                <li key={h.slug}>
                  <button
                    type="button"
                    onClick={() => { setQuery(""); void load(h.slug); }}
                  >
                    <span className="enrich-hit-name">{h.name}</span>
                    <span className="enrich-hit-one">{h.oneLiner}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        key={company?.slug ?? "empty"}
        initial={still ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <Record
          code={company ? `YC.${company.slug.slice(0, 9).toUpperCase()}` : "YC.————"}
          title={company?.name ?? "Resolving"}
          subtitle={company?.oneLiner}
          logo={company?.logo}
          fields={resolving ? fields.map((f) => ({ ...f, value: null })) : fields}
          delay={0.12}
        />
      </motion.div>
    </div>
  );
}
