"use client";

import { useEffect, useRef } from "react";

/* The path from docs/COPY-tts.md (build sessions, practice builds on public
 * data, real company work for the strongest teams), as four stops on one
 * dotted thread. USC's point travels the thread once when it comes into
 * view and each stop lights as the point reaches it. A few words per stop.
 * Reduced motion shows every stop lit. */
const STOPS = [
  { title: "You apply", line: "We read every one." },
  { title: "Build sessions", line: "Ship a working piece each night." },
  { title: "Practice builds", line: "Real pipelines on public data." },
  { title: "Real company work", line: "The strongest teams take it on." },
];

export default function Path() {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.run = "done";
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        el.dataset.run = "go";
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <ol ref={ref} className="jo-path" data-run="wait">
      <span className="jo-path-head" aria-hidden="true" />
      {STOPS.map((s, i) => (
        <li key={s.title} style={{ ["--i" as string]: i }}>
          <span className="jo-path-dot" aria-hidden="true" />
          <span className="jo-n">{String(i + 1).padStart(2, "0")}</span>
          <b>{s.title}</b>
          <span>{s.line}</span>
        </li>
      ))}
    </ol>
  );
}
