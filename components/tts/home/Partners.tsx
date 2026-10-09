"use client";

import { useEffect, useRef } from "react";
import { easeOut3, prog, smooth } from "../engine/math";
import { onFrame, P } from "../v4/choreo";

/* Who TTS is, then Clay and Perplexity through Blue Modern Advisory.
 *
 * Reader: both. The line is Caleb's own description of the club (RUBRIC:
 * "We do everything AI. Automations, teaching, crm, blah blah blah, wtv a
 * company needs!"), set once, large, on the sky. Under it the two partner
 * marks and their valuations, each with its date, never summed. Caleb,
 * 2026-10-04: "We are OFFICIAL Partners of clay and perplexity through
 * bma", so the line always carries Blue Modern Advisory. The "only
 * university club" line is gone: it was never sourced.
 *
 * It sits straight on the field while the camera eases back out over the
 * basin. The line and the two rows drift at three depths on the region's
 * one followed value, and the numbers count up while it pins. Reduced motion shows the finished numbers.
 */
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
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const nums = [...el.querySelectorAll<HTMLElement>(".pt-n")];
    const rows = [...el.querySelectorAll<HTMLElement>(".pt-row > li")];
    const say = el.querySelector<HTMLElement>(".pt-say");
    const line = el.querySelector<HTMLElement>(".pt-line");
    if (reduced) return;
    const off = onFrame(() => {
      const p = P.partners;
      // The section pins for most of a screen (v4.css); the numbers count
      // up while it holds, a beat apart.
      ROWS.forEach((r, i) => {
        const k = easeOut3(prog(p, 0.3 + i * 0.03, 0.5 + i * 0.03));
        const s = `$${(r.value * k).toFixed(r.decimals)}B`;
        if (nums[i] && nums[i].textContent !== s) nums[i].textContent = s;
        const depth = i === 0 ? 90 : 130;
        rows[i].style.transform =
          `translate3d(0, ${((0.5 - p) * depth).toFixed(1)}px, 0)`;
        rows[i].style.opacity = smooth(
          prog(p, 0.16 + i * 0.04, 0.34 + i * 0.04),
        ).toFixed(3);
      });
      if (say) {
        say.style.transform = `translate3d(0, ${((0.5 - p) * 40).toFixed(1)}px, 0)`;
        say.style.opacity = (
          smooth(prog(p, 0.04, 0.2)) *
          (1 - smooth(prog(p, 0.86, 0.98)))
        ).toFixed(3);
      }
      if (line) {
        line.style.transform = `translate3d(0, ${((0.5 - p) * 60).toFixed(1)}px, 0)`;
        line.style.opacity = (
          smooth(prog(p, 0.3, 0.46)) *
          (1 - smooth(prog(p, 0.86, 0.98)))
        ).toFixed(3);
      }
    });
    return off;
  }, []);

  return (
    <section ref={sec} id="v4-partners" className="pt" aria-labelledby="pt-say">
      <div className="pt-inner">
        <h2 id="pt-say" className="pt-say">
          We do everything AI for LA businesses: automations, CRMs, outbound,
          teaching their people, whatever a company needs. Students build all of
          it.
        </h2>
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
              <span className="pt-n">${r.value.toFixed(r.decimals)}B</span>
              <span className="pt-asof">{r.asOf}</span>
            </li>
          ))}
        </ul>
        {/* What a member gets, in one plain line (STUDENT-POV, 3). */}
        <p className="pt-line">
          You build on Clay and Perplexity, the tools real companies pay for to
          find their customers, through our partner Blue Modern Advisory.
        </p>
      </div>
    </section>
  );
}
