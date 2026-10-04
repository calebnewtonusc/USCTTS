"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/* Two clocks, kept apart (crafts/website.md):
 *
 * TIMED. The highlighter. The words under every `.tc-fill` are in the server
 * HTML; only the highlight waits. The layout ships `.tc-armed`, which holds
 * highlights at zero width, and this component fills each `[data-sheet]` block
 * when it first enters the viewport, staggered by order. Without JS a
 * <noscript> style in the layout unarms the page, and under reduced motion this
 * removes the class, so neither ever sees an unfilled brief.
 *
 * SCROLL. One value, page progress 0 to 1, computed once per frame and written
 * to one custom property. The margin rule is the only thing reading it.
 */

// Each fill waits this much longer than the one before it. Twenty fills at
// 70ms plus the 420ms sweep land at 2.1s, under the 2.5s load budget in
// REBUILD-PROMPT.md; anything past twenty shares the last slot.
const STAGGER_CAP = 20;

export default function Choreography() {
  const pathname = usePathname();
  const ruleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".tc-root");
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.remove("tc-armed");
      return;
    }

    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>("[data-sheet]"),
    );
    for (const block of blocks) {
      block.classList.remove("is-in");
      block.querySelectorAll<HTMLElement>(".tc-fill").forEach((fill, i) => {
        fill.style.setProperty("--i", String(Math.min(i, STAGGER_CAP)));
      });
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      // Fill a little before the block is fully in view, so the sweep is
      // underway as the eye arrives rather than starting after it.
      { rootMargin: "0px 0px -12% 0px" },
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const rule = ruleRef.current;
    if (!rule) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      rule.style.setProperty("--p", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return <div ref={ruleRef} className="tc-progress" aria-hidden="true" />;
}
