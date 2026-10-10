"use client";

import { useEffect, useRef } from "react";
import { easeOut3 } from "../engine/math";
import DotFloor from "./DotFloor";

/*
 * Who TTS is, the first thing on home's sheet (Tyler, 2026-10-09: a big
 * statement of who we are). The line is Caleb's own description of the club
 * (RUBRIC: "We do everything AI. Automations, teaching, crm, blah blah
 * blah, wtv a company needs!"), global since 2026-10-10: "TTS is global
 * businesses, not just la". Under it the two partners, each valuation
 * with its date and never summed, and always through Blue Modern Advisory
 * (Caleb, 2026-10-04: "We are OFFICIAL Partners of clay and perplexity
 * through bma").
 *
 * The numbers count up once, over 1.2s, when the row comes into view, and
 * start at their first digit so "$0B" never shows. Reduced motion and no
 * script show the finished numbers, which is what the HTML holds.
 */
const ROWS = [
  {
    name: "Clay",
    // Rendered from the official clay.svg at 800x252, 2x its largest size.
    // That SVG is 6.6MB around one raster and cost a 67 to 75ms frame to
    // decode (headed trace, 2026-10-04). This PNG is 100KB.
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
const COUNT_MS = 1200;

export default function Statement() {
  const row = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nums = [...el.querySelectorAll<HTMLElement>(".st-n")];
    let id = 0;
    const run = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const k = easeOut3(Math.min(1, (now - t0) / COUNT_MS));
        ROWS.forEach((r, i) => {
          // From a tenth of the value up, so it never reads $0B.
          const v = r.value * (0.1 + 0.9 * k);
          nums[i].textContent = `$${v.toFixed(r.decimals)}B`;
        });
        if (k < 1) id = requestAnimationFrame(step);
      };
      id = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        run();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <>
      <h2 id="ld-who-h" className="ld-say" data-reveal="0">
        We build whatever AI a company or nonprofit needs, anywhere in the
        world: automations, CRMs, outbound, training their teams.{" "}
        <em className="ld-accent">Students build all of it.</em>
      </h2>
      {/* The one big scene on home: a clay LA at golden hour, USC's tower
       * and red dot on the left, downtown on the right, a freeway between
       * (blender/heroes.py, world). It sits under the line it illustrates:
       * students, from USC, building for the city and past it. */}
      {/* The city scene stands on the real one: a floor of the opener's
       * points, the streets around USC, runs out past the frame's edges. */}
      <div className="ld-ground" data-reveal="1">
        <DotFloor
          win={[-4200, -2100, 4200, 2100]}
          alpha={0.36}
          max={4200}
          hold
          className="ld-ground-floor"
        />
        <div className="ld-frame is-world">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tts/home/world-1200.webp"
            srcSet="/tts/home/world-1200.webp 1200w, /tts/home/world-2400.webp 2400w"
            sizes="(min-width: 1280px) 1184px, 100vw"
            alt="A clay Los Angeles at golden hour: green hills, a downtown of rounded towers, palm trees, and USC's cardinal tower with a red map dot above it, joined by a freeway"
            width={2400}
            height={1200}
            decoding="async"
          />
        </div>
      </div>
      <div className="st">
        <ul ref={row} className="st-row" aria-label="Official partners">
          {ROWS.map((r, i) => (
            <li key={r.name} className="st-cell" data-reveal={String(i + 1)}>
              <span className="st-name">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.logo}
                  alt={r.wordmark ? r.name : ""}
                  className={r.wordmark ? "st-wordmark" : "st-mark"}
                />
                {!r.wordmark && r.name}
              </span>
              <span className="st-n">${r.value.toFixed(r.decimals)}B</span>
              <span className="st-asof">{r.asOf}</span>
            </li>
          ))}
        </ul>
        <p className="st-line" data-reveal="3">
          You build on Clay and Perplexity, the tools real companies pay for to
          find their customers, through our partner Blue Modern Advisory.
        </p>
      </div>
    </>
  );
}
