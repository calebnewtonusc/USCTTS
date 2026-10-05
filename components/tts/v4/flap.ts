"use client";

/*
 * The split-flap toy (DIRECTION-tts-v4.md, point 6, after the board on
 * Gavin's site that spins when you point at it). Point at a rail stop or
 * the x-ray word and its letters flip through the board's characters and
 * land back on the word, left to right. The accessible name never changes,
 * and reduced motion leaves the word alone.
 */
const BOARD = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+:";

export function attachFlap(el: HTMLElement) {
  const word = el.textContent ?? "";
  if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", word.trim());
  let raf = 0;
  const run = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(raf);
    const t0 = performance.now();
    const step = (t: number) => {
      // A frame stamp can precede t0 by a few ms; a negative index read
      // past the board and threw (2026-10-05).
      const e = Math.max(0, t - t0);
      let out = "";
      let done = true;
      for (let i = 0; i < word.length; i++) {
        const c = word[i];
        // Each letter flips for 110ms plus 26ms per position, so the word
        // lands left to right in about half a second.
        if (c === " " || e >= 110 + i * 26) {
          out += c;
          continue;
        }
        done = false;
        const f = BOARD[Math.floor(e / 45 + i * 7) % BOARD.length];
        out += c === c.toLowerCase() ? f.toLowerCase() : f;
      }
      el.textContent = out;
      if (done) el.textContent = word;
      else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  el.addEventListener("pointerenter", run);
  el.addEventListener("focus", run);
  return () => {
    cancelAnimationFrame(raf);
    el.textContent = word;
    el.removeEventListener("pointerenter", run);
    el.removeEventListener("focus", run);
  };
}
