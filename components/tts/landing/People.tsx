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
 * chat anytime"). Every line and mark is sourced (data/people.ts,
 * public/tts/marks/SOURCES.md); a line with no official mark is set in type.
 *
 * Caleb, 2026-10-10, on the earlier full-screen sideways journey: "These
 * cards look so slop, bad visual heiarchy" (white logo pills louder than the
 * person, a pill that said only "3") and "Chewb should ALWAYS be intentional
 * with how it chooses to fill EVERY space" (Matthew's two pills left most of
 * a full screen empty). So each band is as tall as what it holds: the
 * portrait runs the band's full height, the person leads (name, one-line
 * role), and the credentials sit under them as a calm ledger, every mark one
 * tone on the band at one height, captions smaller than the name. A band
 * with one or two credentials sets them larger instead of floating them.
 * Dotted lines in the network's language join the portrait to each mark and
 * draw as the band scrolls in.
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
  "Chris Swain": "Faculty page",
};

/* Marks whose white is part of the drawing (R/GA's ground, Reddit's face,
 * Stanford's tree) lose it to a flat silhouette, so they get a one-tone
 * cut with the white punched out (public/tts/marks/mono). */
const MONO: Record<string, string> = {
  "/tts/marks/rga.png": "/tts/marks/mono/rga.png",
  "/tts/marks/reddit.png": "/tts/marks/mono/reddit.png",
  "/tts/marks/stanford.png": "/tts/marks/mono/stanford.png",
};

/* Symbol-only marks read as a blob beside wordmarks, so the name is set
 * next to them in type at the same height. */
const SAY: Record<string, string> = {
  "/tts/marks/reddit.png": "Reddit",
  "/tts/marks/google.png": "Google",
  "/tts/marks/stanford.png": "Stanford GSB",
};

/* Optical height: at one pixel height a two-line seal (USC) reads small
 * and a heavy slab (SONY) reads loud, so each mark is scaled to sit level
 * with the rest. Judged by eye on the 2026-10-10 screenshots. */
const OPTICAL: Record<string, number> = {
  "/tts/marks/usc.svg": 1.3,
  "/tts/marks/disney.svg": 1.15,
  "/tts/marks/sony.svg": 0.72,
  "/tts/marks/ibm.svg": 0.85,
  "/tts/marks/mckinsey.png": 1.2,
  "/tts/marks/rga.png": 0.85,
  "/tts/marks/180dc.png": 1.15,
  "/tts/marks/retax360.svg": 1.1,
  "/tts/marks/mixbook.png": 1.25,
};

/* A line above the name for the one advisor whose role at TTS is a title. */
const KICKER: Record<string, string> = {
  "Chris Swain": "Faculty advisor",
};

type Row = NonNullable<Person["background"]>[number];

function Marks({ r }: { r: Row }) {
  const list = r.logos ?? (r.logo ? [r.logo] : []);
  if (list.length) {
    return (
      <span className="ad-marks">
        {list.map((src) => (
          <span key={src} className="ad-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MONO[src] ?? src}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ "--o": OPTICAL[src] ?? 1 } as CSSProperties}
            />
            {SAY[src] && <span className="ad-say">{SAY[src]}</span>}
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className="ad-marks">
      <span className="ad-mark">
        {r.type === "TTS" && <span className="ad-tts" aria-hidden="true" />}
        <span className="ad-say">{r.type ?? ""}</span>
      </span>
    </span>
  );
}

function Panel({ p, i }: { p: Person; i: number }) {
  const rows = p.background ?? [{ label: p.role, logo: p.logo }];
  const t = TONES[i % TONES.length];
  const dark = t.fg !== "#ffffff";
  const style = { "--tone": t.bg, "--fg": t.fg } as CSSProperties;
  const go = p.link ? (LINK_SAYS[p.name] ?? "LinkedIn") : null;
  // The first line is where they are now: it sits under the name as their
  // role, mark and all, and the ledger holds the rest.
  const [now, ...rest] = rows;
  return (
    <li
      className="ad-panel"
      style={style}
      data-panel={i}
      data-few={rest.length <= 2 ? "1" : undefined}
      data-solo={rest.length === 0 ? "1" : undefined}
      data-ink={dark ? "dark" : undefined}
    >
      <div className="ad-panel-in">
        <span className="ad-photo">
          {p.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.photo} alt="" loading="lazy" decoding="async" />
          )}
        </span>
        <div className="ad-body">
          <div className="ad-who">
            <span className="ad-n">
              {String(i + 1).padStart(2, "0")} /{" "}
              {String(ADVISORS.length).padStart(2, "0")}
              {KICKER[p.name] && <span>{KICKER[p.name]}</span>}
            </span>
            <b className="ad-name">{p.name}</b>
            <span className="ad-now">
              <span className="ad-chip">
                <Marks r={now} />
              </span>
              <span className="ad-role">{now.label}</span>
            </span>
          </div>
          {rest.length > 0 && (
            <ul className="ad-rows" aria-label={`${p.name}'s background`}>
              {rest.map((r, k) => (
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
          )}
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
    const panels = [...el.querySelectorAll<HTMLElement>(".ad-panel")];
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let tops: number[] = [];

    // Each band's dotted lines, from the portrait's edge to every mark.
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
        const ax = ph.right - b.left;
        const ay = ph.top - b.top + ph.height / 2;
        const paths = [...panel.querySelectorAll<HTMLElement>(".ad-chip")].map(
          (c) => {
            const r = c.getBoundingClientRect();
            const bx = r.left - b.left - 10;
            const by = r.top - b.top + r.height / 2;
            const mx = (ax + bx) / 2;
            return `M${ax.toFixed(1)} ${ay.toFixed(1)} C${mx.toFixed(1)} ${ay.toFixed(1)} ${mx.toFixed(1)} ${by.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
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
      tops = panels.map((x) => x.getBoundingClientRect().top + window.scrollY);
      drawLines();
    };

    const settle = () =>
      panels.forEach((x) => {
        x.style.setProperty("--t", "1");
        x.style.setProperty("--d", "1");
      });

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (reduced) {
      settle();
      return () => ro.disconnect();
    }
    let last = "";
    // A band arrives over the first 70% of a screen of travel: the portrait
    // settles, then the lines draw and the credentials step in one by one.
    const off = onFrame((f) => {
      const vals = tops.map((top) =>
        clamp((f.y + f.vh - top) / (f.vh * 0.7)),
      );
      const key = vals.map((v) => v.toFixed(3)).join();
      if (key === last) return;
      last = key;
      panels.forEach((panel, i) => {
        const v = vals[i];
        panel.style.setProperty("--t", easeOut3(v).toFixed(3));
        panel.style.setProperty(
          "--d",
          smooth(clamp((v - 0.25) / 0.65)).toFixed(3),
        );
      });
    }, 5);
    return () => {
      ro.disconnect();
      off();
    };
  }, []);

  return (
    <div ref={root} className="ad">
      <ul className="ad-track">
        {ADVISORS.map((p, i) => (
          <Panel key={p.name} p={p} i={i} />
        ))}
      </ul>
    </div>
  );
}
