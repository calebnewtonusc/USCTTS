"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ADVISORS, type Person } from "@/data/people";
import { clamp, easeOut3, smooth } from "../engine/math";
import { onFrame } from "../v4/choreo";
import "./advisors.css";

/*
 * The club advisors (Tyler's voice memos, 2026-10-09: Duncan and the others'
 * real photos and background; his retitle "Club advisors, open to a coffee
 * chat anytime"). Caleb, 2026-10-10: "Put all of Sagar's logos bruh" and
 * "all the advisors section is lame af". So each advisor gets a whole screen
 * of their own colour in a journey that travels sideways as you scroll: a
 * big portrait, the name huge, and every line of their background as its
 * real mark, joined to them by a dotted line in the network's language that
 * draws as their screen arrives. The marks are the story. Every line and
 * mark is sourced (data/people.ts, public/tts/marks/SOURCES.md); a line
 * with no company, or no official mark, is set in type.
 *
 * Reduced motion, and screens too short to pin, show the six panels one
 * after another with no travel.
 */

const TONES = [
  { bg: "#1f5f2c", fg: "#ffffff" },
  { bg: "#1d5a95", fg: "#ffffff" },
  { bg: "#a8331f", fg: "#ffffff" },
  { bg: "#ffcc00", fg: "#2a1b1e" },
  { bg: "#5a3291", fg: "#ffffff" },
  { bg: "#990000", fg: "#ffffff" },
];

const LINK_SAYS: Record<string, string> = {
  "Chris Swain": "faculty page",
};

type Row = NonNullable<Person["background"]>[number];

function Marks({ r }: { r: Row }) {
  const list = r.logos ?? (r.logo ? [r.logo] : []);
  if (list.length) {
    return (
      <span className="ad-marks">
        {list.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt="" loading="lazy" decoding="async" />
        ))}
      </span>
    );
  }
  return (
    <span className="ad-marks is-type">
      {r.type === "TTS" && <span className="ad-tts" aria-hidden="true" />}
      <span>{r.type ?? ""}</span>
    </span>
  );
}

function Panel({ p, i }: { p: Person; i: number }) {
  const rows = p.background ?? [{ label: p.role, logo: p.logo }];
  const t = TONES[i % TONES.length];
  const style = { "--tone": t.bg, "--fg": t.fg } as CSSProperties;
  const go = p.link ? (LINK_SAYS[p.name] ?? "LinkedIn") : null;
  return (
    <li className="ad-panel" style={style} data-panel={i}>
      <div className="ad-panel-in">
        <div className="ad-who">
          <span className="ad-photo">
            {p.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.photo} alt="" loading="lazy" decoding="async" />
            )}
          </span>
          <span className="ad-n">
            {String(i + 1).padStart(2, "0")} /{" "}
            {String(ADVISORS.length).padStart(2, "0")}
          </span>
          <b className="ad-name">{p.name}</b>
          {p.link && (
            <a
              className="ad-go"
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.name}, ${go} (opens in a new tab)`}
            >
              {go} <span aria-hidden="true">&#8599;</span>
            </a>
          )}
        </div>
        <ul className="ad-rows" aria-label={`${p.name}'s background`}>
          {rows.map((r, k) => (
            <li
              key={r.label}
              className="ad-row"
              style={{ "--k": k } as CSSProperties}
            >
              <span className="ad-chip">
                <Marks r={r} />
              </span>
              <span className="ad-label">{r.label}</span>
            </li>
          ))}
        </ul>
        <svg className="ad-lines" aria-hidden="true" />
      </div>
    </li>
  );
}

export function Mentors() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const track = el.querySelector<HTMLElement>(".ad-track");
    const panels = [...el.querySelectorAll<HTMLElement>(".ad-panel")];
    if (!track) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const N = panels.length;
    let docTop = 0;
    let run = 1;
    let pinned = false;

    // Each panel's dotted lines, from the portrait to every chip.
    const drawLines = () => {
      for (const panel of panels) {
        const svg = panel.querySelector<SVGSVGElement>(".ad-lines");
        const box = panel.querySelector<HTMLElement>(".ad-panel-in");
        const photo = panel.querySelector<HTMLElement>(".ad-photo");
        if (!svg || !box || !photo) continue;
        const b = box.getBoundingClientRect();
        const ph = photo.getBoundingClientRect();
        svg.setAttribute(
          "viewBox",
          `0 0 ${b.width.toFixed(0)} ${b.height.toFixed(0)}`,
        );
        const stacked =
          ph.bottom < b.top + b.height * 0.6 &&
          ph.right > b.left + b.width * 0.6;
        const ax = stacked
          ? ph.left - b.left + ph.width / 2
          : ph.right - b.left;
        const ay = stacked ? ph.bottom - b.top : ph.top - b.top + ph.height / 2;
        const paths = [...panel.querySelectorAll<HTMLElement>(".ad-chip")].map(
          (c) => {
            const r = c.getBoundingClientRect();
            const bx = stacked
              ? r.left - b.left + r.width / 2
              : r.left - b.left;
            const by = stacked ? r.top - b.top : r.top - b.top + r.height / 2;
            const mx = (ax + bx) / 2;
            return stacked
              ? `M${ax} ${ay} C${ax} ${(ay + by) / 2} ${bx} ${(ay + by) / 2} ${bx} ${by}`
              : `M${ax} ${ay} C${mx} ${ay} ${mx} ${by} ${bx} ${by}`;
          },
        );
        svg.replaceChildren(
          ...paths.map((d) => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d);
            return path;
          }),
        );
      }
    };

    const measure = () => {
      pinned = !reduced && window.innerHeight >= 560;
      el.dataset.pinned = pinned ? "1" : "";
      el.style.setProperty("--n", String(N));
      const r = el.getBoundingClientRect();
      docTop = r.top + window.scrollY;
      run = Math.max(1, el.offsetHeight - window.innerHeight);
      track.style.transform = "";
      drawLines();
    };

    const paint = (p: number) => {
      const at = p * (N - 1);
      track.style.transform = `translate3d(${(-at * 100).toFixed(3)}vw, 0, 0)`;
      panels.forEach((panel, i) => {
        // 1 when this panel is centred, falling to 0 a panel away.
        const t = clamp(1 - Math.abs(at - i));
        panel.style.setProperty("--t", easeOut3(t).toFixed(3));
        panel.style.setProperty(
          "--d",
          smooth(clamp((t - 0.35) / 0.55)).toFixed(3),
        );
      });
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
      if (!pinned) panels.forEach((x) => x.style.setProperty("--d", "1"));
    });
    ro.observe(el);
    if (!pinned) {
      panels.forEach((x) => {
        x.style.setProperty("--t", "1");
        x.style.setProperty("--d", "1");
      });
    }
    let last = -1;
    const off = onFrame((f) => {
      if (!pinned) return;
      const p = Math.round(clamp((f.y - docTop) / run) * 4000) / 4000;
      if (p === last) return;
      last = p;
      paint(p);
    }, 5);
    return () => {
      ro.disconnect();
      off();
    };
  }, []);

  return (
    <div ref={root} className="ad">
      <div className="ad-stage">
        <ul className="ad-track">
          {ADVISORS.map((p, i) => (
            <Panel key={p.name} p={p} i={i} />
          ))}
        </ul>
      </div>
    </div>
  );
}
