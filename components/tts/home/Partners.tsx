"use client";

import { useEffect, useRef } from "react";
import { clamp, easeOut3, prog } from "../engine/math";

/* Clay and Perplexity, through Blue Modern Advisory. Approved by Caleb on
 * 2026-10-04 and sourced in docs/POSITIONING.md: BMA is an enterprise partner
 * of both (bluemodernadvisory.com, "The enterprise stack"), and TTS builds on
 * them through BMA. TTS is never called the partner.
 *
 * Two names as type, two valuations counting up as the section scrolls in,
 * each with its date, and one plain sentence. The numbers are never summed and
 * nothing here says "best". Reduced motion shows the finished numbers. */
const ROWS = [
  { name: "Clay", value: 7.1, decimals: 1, asOf: "as of Sept 2026, Series D" },
  { name: "Perplexity", value: 20, decimals: 0, asOf: "as of Sept 2025" },
];

export default function Partners() {
  const sec = useRef<HTMLElement>(null);
  const nums = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = sec.current;
    if (!el) return;
    let raf = 0;
    let top = 0;
    const layout = () => {
      top = el.getBoundingClientRect().top + window.scrollY;
    };
    const tick = () => {
      raf = 0;
      // 0 when the section's top reaches the bottom of the screen, 1 when it
      // reaches 35% of the way down: the counting is done before you read it.
      const p = clamp(
        (window.scrollY + window.innerHeight - top) /
          (window.innerHeight * 0.65),
      );
      ROWS.forEach((r, i) => {
        const n = nums.current[i];
        const k = easeOut3(prog(p, i * 0.15, 0.85 + i * 0.15));
        if (n) n.textContent = `$${(r.value * k).toFixed(r.decimals)}B`;
      });
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      layout();
      kick();
    };
    layout();
    tick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={sec} className="partners" aria-labelledby="partners-line">
      <ul className="partners-row">
        {ROWS.map((r, i) => (
          <li key={r.name}>
            <span className="partners-name">{r.name}</span>
            <span
              className="partners-n"
              ref={(n) => {
                nums.current[i] = n;
              }}
            >
              ${r.value.toFixed(r.decimals)}B
            </span>
            <span className="partners-asof">{r.asOf}</span>
          </li>
        ))}
      </ul>
      <p id="partners-line" className="partners-line">
        We build on Clay and Perplexity, through Blue Modern Advisory, an
        official partner of both.
      </p>
    </section>
  );
}
