"use client";

import { useEffect, useRef } from "react";
import { easeOut3, prog, smooth } from "../engine/math";
import { onFrame, P } from "../v4/choreo";

/* Clay and Perplexity, through Blue Modern Advisory. Caleb, 2026-10-04: "We
 * are OFFICIAL Partners of clay and perplexity through bma". BMA holds both
 * partnerships (bluemodernadvisory.com, "The enterprise stack"), so the line
 * always carries "through Blue Modern Advisory". The "only university club"
 * claim is his and unverified, so it ships as "As far as we know"
 * (DIRECTION-tts-v4.md).
 *
 * Reader: a USC student. The marks say "I know these" before a word is
 * read, the valuations say how big they are, each with its date, never
 * summed. It sits straight on the field while the camera eases back out
 * over the basin; the two rows drift at different depths on the region's
 * one scroll value, and the numbers count up on it. Reduced motion shows
 * the finished numbers. */
const ROWS = [
  {
    name: "Clay",
    // Rendered from the official clay.svg at 800x252, 2x its largest size.
    // That SVG is 6.6MB around one raster, and decoding it on first sight
    // cost a 67 to 75ms frame on the first scroll of home (headed trace,
    // 2026-10-04). This PNG is 100KB and identical on screen.
    logo: "/tts/partners/clay.png",
    wordmark: true,
    value: 7.1,
    decimals: 1,
    asOf: "valued as of Sept 2026, Series D",
  },
  {
    name: "Perplexity",
    logo: "/tts/partners/perplexity.svg",
    wordmark: false,
    value: 20,
    decimals: 0,
    asOf: "valued as of Sept 2025",
  },
];

export default function Partners() {
  const sec = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sec.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nums = [...el.querySelectorAll<HTMLElement>(".pt-n")];
    const rows = [...el.querySelectorAll<HTMLElement>(".pt-row > li")];
    const line = el.querySelector<HTMLElement>(".pt-line");
    if (reduced) return;
    return onFrame(() => {
      const p = P.partners;
      ROWS.forEach((r, i) => {
        // Done counting by the time the row reaches the middle of the screen.
        const k = easeOut3(prog(p, 0.12 + i * 0.05, 0.42 + i * 0.05));
        const s = `$${(r.value * k).toFixed(r.decimals)}B`;
        if (nums[i] && nums[i].textContent !== s) nums[i].textContent = s;
        // Two depths: the rows travel 90 and 130px across the region.
        const depth = i === 0 ? 90 : 130;
        rows[i].style.transform = `translate3d(0, ${((0.5 - p) * depth).toFixed(1)}px, 0)`;
        rows[i].style.opacity = smooth(prog(p, 0.08 + i * 0.04, 0.3 + i * 0.04)).toFixed(3);
      });
      if (line) {
        line.style.transform = `translate3d(0, ${((0.5 - p) * 50).toFixed(1)}px, 0)`;
        line.style.opacity = (smooth(prog(p, 0.22, 0.4)) * (1 - smooth(prog(p, 0.8, 0.95)))).toFixed(3);
      }
    });
  }, []);

  return (
    <section ref={sec} id="v4-partners" className="pt" aria-labelledby="pt-line">
      <div className="pt-inner">
        <ul className="pt-row">
          {ROWS.map((r) => (
            <li key={r.name}>
              <span className="pt-name">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.logo}
                  alt={r.wordmark ? r.name : ""}
                  className={r.wordmark ? "pt-wordmark" : "pt-mark"}
                />
                {!r.wordmark && r.name}
              </span>
              <span className="pt-n">
                ${r.value.toFixed(r.decimals)}B
              </span>
              <span className="pt-asof">{r.asOf}</span>
            </li>
          ))}
        </ul>
        <p id="pt-line" className="pt-line">
          We&apos;re official Clay and Perplexity partners through Blue Modern
          Advisory. As far as we know, we&apos;re the only university club
          building on them.
        </p>
      </div>
    </section>
  );
}
