"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/* Cmd-K over the 6,245-company index.
 *
 * The most on-brand gadget available: a club claiming to do GTM engineering
 * should have the shortcut a GTM engineer reaches for, and it opens onto real
 * data rather than a site search that returns three marketing pages.
 */

interface Hit { slug: string; name: string; oneLiner: string; batch: string }

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);
  const still = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else { setQ(""); setHits([]); setActive(0); }
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/yc/search?q=${encodeURIComponent(q)}`);
        const d = (await r.json()) as { hits: Hit[] };
        if (id === reqId.current) { setHits(d.hits ?? []); setActive(0); }
      } catch { /* ignore */ }
    }, 130);
    return () => clearTimeout(t);
  }, [q]);

  const go = useCallback((slug: string) => {
    window.location.href = `/tc/for/${slug}`;
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, hits.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && hits[active]) { e.preventDefault(); go(hits[active].slug); }
  };

  return (
    <>
      <button className="cmdk-trigger" onClick={() => setOpen(true)} aria-label="Search Y Combinator companies">
        <span>Search 6,245 YC companies</span>
        <kbd>⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="cmdk-scrim"
            initial={still ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Company search"
          >
            <motion.div
              className="cmdk"
              initial={still ? false : { opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={inputRef}
                className="cmdk-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a YC company, see what we would take"
                autoComplete="off"
                spellCheck={false}
              />
              {hits.length > 0 && (
                <ul className="cmdk-list">
                  {hits.map((h, i) => (
                    <li key={h.slug}>
                      <button
                        className={i === active ? "cmdk-hit cmdk-hit-on" : "cmdk-hit"}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(h.slug)}
                      >
                        <span className="cmdk-name">{h.name}</span>
                        <span className="cmdk-batch">{h.batch.replace("-", " ")}</span>
                        <span className="cmdk-one">{h.oneLiner}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="cmdk-foot">
                <span>↑↓ to move</span><span>↵ to open</span><span>esc to close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
