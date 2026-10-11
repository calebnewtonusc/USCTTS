"use client";

import { useEffect, useRef } from "react";
import { easeOut3 } from "../engine/math";
import DotFloor from "./DotFloor";
import "./partners.css";

/*
 * The partners, as the loudest moment on home (Caleb, 2026-10-10: "Mog
 * harder here it feels like this is talking in lowercase we need ppl to
 * think HOLY SHIT THEYRE PARTNERED WITH THEM????"). Its own full-height navy
 * band: the field's points underneath, each brand's colour drifting behind
 * its number, the marks huge on white, and the two valuations as glass
 * numerals that count up once with a light sweep across them. The glass is
 * on these two numbers and nowhere else on the site.
 *
 * The headline says it outright. Caleb, 2026-10-10, after a call where both
 * companies confirmed TTS is partnered with them through Blue Modern
 * Advisory: "it's gotta be loud and clear that we're official partners".
 * The BMA credit stays one quiet line under the numbers.
 * Valuations, checked 2026-10-10: the first company's $7.1B Series D is on
 * its own blog (clay.com/blog/series-d, 2026-09-09); the $20B round was
 * reported by The Information on 2025-09-11 and not confirmed by the
 * company, hence "as reported". Sagar Tiwari worked at the first company
 * (Caleb, 2026-10-10).
 */
const ROWS = [
  {
    id: "clay",
    name: "Clay",
    value: 7.1,
    decimals: 1,
    asOf: "valued Sept 2026, Series D",
  },
  {
    id: "pplx",
    name: "Perplexity",
    value: 20,
    decimals: 0,
    asOf: "valued Sept 2025, as reported",
  },
];
const COUNT_MS = 1600;

export default function Partners() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const nums = [...el.querySelectorAll<HTMLElement>(".pt-n")];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let id = 0;
    const run = () => {
      el.querySelectorAll(".pt-cell").forEach((c) =>
        c.classList.add("is-sweep"),
      );
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
      { threshold: 0.45 },
    );
    io.observe(el.querySelector(".pt-row") ?? el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div ref={root} className="pt">
      <div className="pt-floor" aria-hidden="true">
        <DotFloor
          win={[-6000, -3600, 6000, 3600]}
          color="#ffcc00"
          alpha={0.22}
          max={5200}
          hold
        />
      </div>
      <span className="pt-glow is-clay" aria-hidden="true" />
      <span className="pt-glow is-pplx" aria-hidden="true" />

      <div className="ld-wrap pt-in">
        <h2 id="ld-pt-h" className="pt-h" data-reveal="0">
          Official partners of <em>Clay</em> and <em>Perplexity.</em>
        </h2>

        <ul className="pt-row" aria-label="Our official partners">
          {ROWS.map((r, i) => (
            <li
              key={r.id}
              className={`pt-cell is-${r.id}`}
              data-reveal={String(i + 1)}
            >
              <span className="pt-tile">
                {r.id === "clay" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/tts/partners/clay.png"
                    alt="Clay"
                    width={800}
                    height={252}
                    className="pt-clay"
                  />
                ) : (
                  <span className="pt-pplx">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/tts/partners/perplexity.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                    Perplexity
                  </span>
                )}
              </span>
              <span className="pt-n">${r.value.toFixed(r.decimals)}B</span>
              <span className="pt-asof">{r.asOf}</span>
            </li>
          ))}
        </ul>

        <p className="pt-meta" data-reveal="3">
          <span className="pt-dot" aria-hidden="true" />
          Through Blue Modern Advisory. Our advisor Sagar Tiwari worked at Clay.
        </p>
      </div>
    </div>
  );
}
