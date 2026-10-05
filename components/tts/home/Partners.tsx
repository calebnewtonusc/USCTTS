"use client";

import { useEffect, useRef } from "react";
import { clamp, easeOut3, prog } from "../engine/math";

/* Clay and Perplexity, through Blue Modern Advisory. Caleb, 2026-10-04: "We
 * are OFFICIAL Partners of clay and perplexity through bma". BMA holds both
 * partnerships (bluemodernadvisory.com, "The enterprise stack"), so the line
 * always carries "through Blue Modern Advisory".
 *
 * The reader is a USC student: the logos say "I know these" before a word is
 * read, the valuations say how big they are, and the line says what it means
 * for a member. Logos are the official files: Clay's from its Kiln logo kit
 * (assets.clayrun.dev), Perplexity's mark from Simple Icons, with its name set
 * in type beside it. Two valuations counting up as the section scrolls in,
 * each with its date, and one plain sentence. The numbers are never summed and
 * nothing here says "best". Reduced motion shows the finished numbers. */
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
            <span className="partners-name">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.logo}
                alt={r.wordmark ? r.name : ""}
                className={r.wordmark ? "partners-wordmark" : "partners-mark"}
              />
              {!r.wordmark && r.name}
            </span>
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
        We&apos;re official Clay and Perplexity partners through Blue Modern
        Advisory, so as a member you build with both, on real company work.
      </p>
    </section>
  );
}
