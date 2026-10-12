#!/usr/bin/env node
/*
 * section-check: refuse a page whose sections read as combined, run as walls
 * of text, or repeat an image (Caleb, 2026-10-10: "Holy fucking wall of
 * text with each section feeling combined wtf fix chewb never make smth
 * this shitty ever again", and "No sections should read as combined, that
 * diminishes both of their power"). Prose did not stop it, so this does.
 *
 *   node tools/section-check.mjs [--base http://localhost:3000] [path ...]
 *
 * Loads every page at 1440x900 and 390x844 and fails when:
 *   1. a section shows more than 40 words of body text on one screen at once
 *      (headings, and mono labels under 13px, are not body text)
 *   2. two adjacent sections differ by under 6% in mean luminance with no
 *      transition element ([data-transition], .ld-seam, .ga) between them
 *   3. a section is shorter than 70% of the viewport at 1440
 *   4. the same image src appears more than once across all pages
 *   5. a clay render (/tts/home/, /tts/heroes/, /tts/apply/) ships as a still
 *      img with no <video> in the same slot
 *   6. in WebKit as an iPhone 15 Pro, the page scrolls sideways
 *   7. in WebKit as an iPhone 15 Pro, a visible img, video or canvas is under
 *      2px tall
 *
 * 6 and 7 run in WebKit because Chromium passed both while Caleb's iPhone
 * failed: five advisor faces drawn 0px tall (36f3af5), then /apply and
 * /work-with-us at 33,554,432px wide and the our-work mailbox 0px tall
 * (1d2ec97, 2026-10-11). Chromium at 390 showed none of the three.
 *
 * A top-level section is a <section> in <main> not inside another
 * <section>. Nav and footer are never checked. Known, owned exceptions live
 * in tools/section-check.pending.json, each with an owner and a reason;
 * they print as PENDING and never pass silently. Exit 1 on any failure.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices, webkit } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const baseAt = args.indexOf("--base");
const BASE =
  baseAt >= 0
    ? args.splice(baseAt, 2)[1]
    : process.env.SECTION_BASE || "http://localhost:3000";
const PAGES = args.length ? args : ["/", "/way", "/work-with-us", "/apply"];
const SIZES = [
  { w: 1440, h: 900 },
  { w: 390, h: 844 },
];
// Rule constants, each from Caleb's 2026-10-10 brief to the coordinator:
// "a section's visible body text is over 40 words", "under 6% luminance
// difference", "shorter than about 70% of the viewport height".
const MAX_WORDS = 40;
const MIN_LUM_DIFF = 0.06;
const MIN_HEIGHT = 0.7;
const CLAY = /\/tts\/(home|heroes|apply)\/[^/]+\.(webp|png|jpe?g)$/;

const pendingPath = join(here, "section-check.pending.json");
const PENDING = existsSync(pendingPath)
  ? JSON.parse(readFileSync(pendingPath, "utf8"))
  : [];
const isPending = (rule, page, key) =>
  PENDING.find(
    (p) =>
      p.rule === rule &&
      (p.page === "*" || p.page === page) &&
      (!p.match || key.includes(p.match)),
  );

const fails = [];
const pend = [];
const report = (rule, page, w, key, msg) => {
  const p = isPending(rule, page, key);
  (p ? pend : fails).push(
    `${p ? "PENDING" : "FAIL"} [${rule}] ${page} @${w}: ${msg}${p ? `  (owner: ${p.owner}; ${p.reason})` : ""}`,
  );
};

const imgSeen = new Map(); // src -> first "page section"

const browser = await chromium.launch();
try {
  for (const path of PAGES) {
    for (const { w, h } of SIZES) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
      });
      const pg = await ctx.newPage();
      const res = await pg.goto(BASE + path, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      if (!res || res.status() >= 400) {
        fails.push(
          `FAIL [load] ${path} @${w}: answered ${res ? res.status() : "nothing"}`,
        );
        await ctx.close();
        continue;
      }
      await pg.waitForTimeout(2500);
      // Walk the page once so lazy parts mount and reveals fire.
      const total = await pg.evaluate(
        () => document.documentElement.scrollHeight,
      );
      for (let y = 0; y < total; y += Math.round(h * 0.6)) {
        await pg.evaluate((y) => scrollTo(0, y), y);
        await pg.waitForTimeout(60);
      }
      const secs = await pg.evaluate(() => {
        const all = [...document.querySelectorAll("main section")].filter(
          (s) =>
            !s.parentElement?.closest("main section") &&
            !s.closest("nav, footer"),
        );
        return all.map((s, i) => {
          s.setAttribute("data-sc", String(i));
          const r = s.getBoundingClientRect();
          return {
            i,
            id:
              s.id ||
              s.getAttribute("aria-labelledby") ||
              s.className.split(" ").slice(0, 2).join("."),
            top: r.top + scrollY,
            h: r.height,
          };
        });
      });

      // 1. words on one screen, per section, sampled through its height.
      for (const s of secs) {
        let max = 0;
        const steps = Math.max(1, Math.ceil(s.h / (h * 0.5)));
        for (let k = 0; k <= steps; k++) {
          const y = Math.max(
            0,
            s.top + Math.min(s.h - h, (s.h - h) * (k / steps)),
          );
          await pg.evaluate((y) => scrollTo(0, y), y);
          await pg.waitForTimeout(180);
          const n = await pg.evaluate((idx) => {
            const sec = document.querySelector(`[data-sc="${idx}"]`);
            if (!sec) return 0;
            const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
            let words = 0;
            for (let t = walker.nextNode(); t; t = walker.nextNode()) {
              const el = t.parentElement;
              if (
                !el ||
                el.closest(
                  "h1, h2, h3, [aria-hidden='true'], script, style, svg",
                )
              )
                continue;
              const cs = getComputedStyle(el);
              if (parseFloat(cs.fontSize) < 13 || cs.visibility === "hidden")
                continue;
              let o = 1;
              for (
                let n = el;
                n && n !== sec.parentElement;
                n = n.parentElement
              )
                o *= parseFloat(getComputedStyle(n).opacity);
              if (o < 0.15) continue;
              const r = el.getBoundingClientRect();
              if (
                r.bottom < 0 ||
                r.top > innerHeight ||
                r.right < 0 ||
                r.left > innerWidth ||
                !r.width
              )
                continue;
              words += (t.textContent.trim().match(/\S+/g) || []).length;
            }
            return words;
          }, s.i);
          max = Math.max(max, n);
        }
        if (max > MAX_WORDS)
          report(
            "words",
            path,
            w,
            s.id,
            `section "${s.id}" shows ${max} words of body text on one screen (max ${MAX_WORDS})`,
          );
      }

      // 3. height, desktop only.
      if (w >= 1000) {
        for (const s of secs) {
          if (s.h < h * MIN_HEIGHT)
            report(
              "height",
              path,
              w,
              s.id,
              `section "${s.id}" is ${Math.round(s.h)}px, under ${MIN_HEIGHT * 100}% of ${h}`,
            );
        }
      }

      // 2. adjacent sections: mean luminance of each, and whether a
      // transition element sits between them.
      const lum = [];
      for (const s of secs) {
        const el = await pg.$(`[data-sc="${s.i}"]`);
        await pg.evaluate(
          (y) => scrollTo(0, y),
          Math.max(0, s.top + s.h / 2 - h / 2),
        );
        await pg.waitForTimeout(250);
        let L = null;
        try {
          const clip = await el.boundingBox();
          if (clip && clip.height > 4) {
            const buf = await pg.screenshot({
              clip: {
                x: 0,
                y: Math.max(0, clip.y),
                width: w,
                height: Math.min(h, clip.height),
              },
            });
            L = await pg.evaluate(async (b64) => {
              const img = new Image();
              img.src = "data:image/png;base64," + b64;
              await img.decode();
              const c = document.createElement("canvas");
              c.width = 64;
              c.height = 40;
              const x = c.getContext("2d");
              x.drawImage(img, 0, 0, 64, 40);
              const d = x.getImageData(0, 0, 64, 40).data;
              let s = 0;
              for (let i = 0; i < d.length; i += 4)
                s +=
                  (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
              return s / (d.length / 4);
            }, buf.toString("base64"));
          }
        } catch {
          L = null;
        }
        lum.push(L);
      }
      for (let k = 1; k < secs.length; k++) {
        const a = secs[k - 1];
        const b = secs[k];
        if (lum[k - 1] == null || lum[k] == null) continue;
        const between = await pg.evaluate(
          ([ia, ib]) => {
            const A = document.querySelector(`[data-sc="${ia}"]`);
            const B = document.querySelector(`[data-sc="${ib}"]`);
            if (!A || !B) return false;
            const marks = [
              ...document.querySelectorAll("[data-transition], .ld-seam, .ga"),
            ];
            return marks.some(
              (m) =>
                A.compareDocumentPosition(m) &
                  Node.DOCUMENT_POSITION_FOLLOWING &&
                B.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_PRECEDING,
            );
          },
          [a.i, b.i],
        );
        const d = Math.abs(lum[k] - lum[k - 1]);
        if (d < MIN_LUM_DIFF && !between)
          report(
            "adjacent",
            path,
            w,
            `${a.id}|${b.id}`,
            `"${a.id}" and "${b.id}" differ by ${(d * 100).toFixed(1)}% luminance with no transition between them`,
          );
      }

      // 4 and 5. images.
      const imgs = await pg.evaluate(() =>
        [...document.querySelectorAll("main img")]
          .filter((i) => !i.closest("nav, footer"))
          .map((i) => {
            const src = new URL(i.currentSrc || i.src, location.href).pathname;
            const slot = i.closest(
              "section, [data-slot], figure, .ld-frame, div",
            );
            const sec = i.closest("main section");
            return {
              src,
              video:
                !!(slot && slot.querySelector("video")) ||
                !!i.closest("[data-video-slot]"),
              where: sec
                ? sec.id || sec.getAttribute("aria-labelledby") || "section"
                : "page",
            };
          }),
      );
      const seenHere = new Set();
      for (const im of imgs) {
        const key = im.src.replace(/-\d+(\.\w+)$/, "$1"); // world-1200 and world-2400 are one image
        if (CLAY.test(im.src) && !im.video)
          report(
            "clay-still",
            path,
            w,
            im.src,
            `${im.src} in "${im.where}" is a clay render shipped as a still`,
          );
        if (w !== 1440 || seenHere.has(key + im.where)) continue;
        seenHere.add(key + im.where);
        const first = imgSeen.get(key);
        if (first && first !== `${path} ${im.where}`)
          report(
            "repeat",
            path,
            w,
            key,
            `${key} appears in "${im.where}" and already in ${first}`,
          );
        else if (!first) imgSeen.set(key, `${path} ${im.where}`);
      }
      await ctx.close();
    }
  }
  const phone = await webkit.launch();
  try {
    const ctx = await phone.newContext({ ...devices["iPhone 15 Pro"] });
    for (const path of PAGES) {
      const page = await ctx.newPage();
      await page.goto(BASE + path, { waitUntil: "load" });
      await page.waitForTimeout(2500);
      const got = await page.evaluate(() => ({
        over: document.documentElement.scrollWidth - window.innerWidth,
        flat: [...document.querySelectorAll("img,video,canvas")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            const s = getComputedStyle(e);
            return (
              r.height < 2 &&
              s.display !== "none" &&
              s.visibility !== "hidden" &&
              !e.closest("[aria-hidden=true]")
            );
          })
          .map((e) =>
            String(
              e.currentSrc || e.getAttribute("src") || e.className || e.tagName,
            ).slice(0, 80),
          ),
      }));
      if (got.over > 1)
        report(
          "overflow",
          path,
          "iphone",
          "page",
          `scrolls ${got.over}px sideways in iPhone Safari`,
        );
      for (const f of got.flat)
        report(
          "flat",
          path,
          "iphone",
          f,
          `${f} draws under 2px tall in iPhone Safari`,
        );
      await page.close();
    }
    await ctx.close();
  } finally {
    await phone.close();
  }
} finally {
  await browser.close();
}

for (const line of pend) console.log(line);
for (const line of fails) console.log(line);
console.log(
  `section-check: ${fails.length} failure(s), ${pend.length} pending, across ${PAGES.length} page(s) at ${SIZES.map((s) => s.w).join(" and ")}`,
);
process.exit(fails.length ? 1 : 0);
