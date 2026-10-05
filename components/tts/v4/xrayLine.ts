"use client";

import { clamp, easeOut3, lerp } from "../engine/math";
import { kick, P, phaseAt, stageProgress, type Stage } from "./choreo";
import { attachFlap } from "./flap";

/*
 * The x-ray line over the week's film (DIRECTION-tts-v4.md, point 6, after
 * Gavin's assets/xray.js). Tap the small "x-ray" word and a hairline glides
 * in; right of it, each stage shows how a member would build it: the lead
 * table, the prompt, the workflow, the lesson plan, and the manim clip for
 * that stage, scrubbed by scroll. Quiet by design: someone who never taps
 * the word sees nothing different and downloads none of the clips.
 */

export function attachXray(el: HTMLElement, reduced: boolean) {
  const one = <T extends HTMLElement>(s: string) => el.querySelector<T>(s);
  const body = one(".w4-body");
  const word = one<HTMLButtonElement>(".w4-xword");
  const xline = one(".xr-line");
  const grip = one(".xr-grip");
  const side = one(".xr-side");
  const views = [...el.querySelectorAll<HTMLElement>(".xr-view")];
  const v4root = el.closest<HTMLElement>(".v4");
  let view = "";

  /* The manim clips (public/tts/manim, manim/README.md). Only the stage on
   * screen: its view's clip box is filled the first time the x-ray is open
   * on it. They never play on their own; the stage's scroll progress sets
   * their time. Under reduced motion each one is its poster. */
  let clipsLoaded = false;
  const clipEls: HTMLElement[] = [];
  const loadClips = () => {
    clipsLoaded = true;
    el.querySelectorAll<HTMLElement>(
      ".xr-view.is-on .xr-clip:not([data-loaded])",
    ).forEach((box) => {
      box.dataset.loaded = "1";
      for (const name of (box.dataset.clips ?? "").split(" ").filter(Boolean)) {
        let m: HTMLElement;
        if (reduced) {
          const img = document.createElement("img");
          img.src = `/tts/manim/${name}.png`;
          img.alt = "";
          m = img;
        } else {
          const v = document.createElement("video");
          v.muted = true;
          v.playsInline = true;
          v.preload = "auto";
          v.poster = `/tts/manim/${name}.png`;
          // HEVC first: Safari takes it, everyone else skips to the WebM.
          const mov = document.createElement("source");
          mov.src = `/tts/manim/${name}.mov`;
          mov.type = 'video/mp4; codecs="hvc1"';
          const webm = document.createElement("source");
          webm.src = `/tts/manim/${name}.webm`;
          webm.type = "video/webm";
          v.append(mov, webm);
          v.addEventListener("loadedmetadata", kick);
          m = v;
        }
        m.className = "xr-media";
        m.dataset.name = name;
        m.setAttribute("aria-hidden", "true");
        box.append(m);
        clipEls.push(m);
      }
    });
  };

  let split = 1;
  let glideId = 0;
  let dragging = false;
  const setSplit = (v: number) => {
    split = clamp(v);
    if (!body || !xline || !side || !grip || !word) return;
    const w = body.clientWidth;
    const on = split < 1;
    xline.style.transform = `translateX(${Math.round(split * w)}px)`;
    side.style.clipPath = `inset(0 0 0 ${(split * 100).toFixed(2)}%)`;
    side.style.setProperty("--vis", `${Math.round((1 - split) * w)}px`);
    body.classList.toggle("is-xray", on);
    if (on) loadClips();
    word.setAttribute("aria-pressed", String(on));
    const pct = Math.round(split * 100);
    grip.setAttribute("aria-valuenow", String(pct));
    grip.setAttribute(
      "aria-valuetext",
      on ? `x-ray, ${100 - pct}% of the film` : "parked",
    );
  };
  const glide = (to: number) => {
    cancelAnimationFrame(glideId);
    if (reduced) {
      setSplit(to);
      return;
    }
    const from = split;
    const ms = to < from ? 240 : 200;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = easeOut3(clamp((t - t0) / ms));
      setSplit(lerp(from, to, k));
      if (k < 1) glideId = requestAnimationFrame(step);
    };
    glideId = requestAnimationFrame(step);
  };
  // On a phone the film is too narrow to read half of it, so the line
  // comes out further.
  const onWord = () =>
    glide(split < 1 ? 1 : (body?.clientWidth ?? 0) < 560 ? 0.12 : 0.5);
  const onDown = (e: PointerEvent) => {
    cancelAnimationFrame(glideId);
    dragging = true;
    grip?.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging || !body) return;
    const r = body.getBoundingClientRect();
    setSplit(Math.min(0.99, (e.clientX - r.left) / r.width));
  };
  const onUp = () => {
    dragging = false;
  };
  const onKey = (e: KeyboardEvent) => {
    const dir: Record<string, number> = {
      ArrowLeft: -1,
      ArrowDown: -1,
      ArrowRight: 1,
      ArrowUp: 1,
    };
    if (dir[e.key]) {
      cancelAnimationFrame(glideId);
      setSplit(Math.min(0.95, Math.round(split * 20 + dir[e.key]) / 20));
    } else if (e.key === "Home") setSplit(0);
    else if (e.key === "End" || e.key === "Escape") {
      setSplit(1);
      word?.focus();
    } else return;
    e.preventDefault();
  };
  const onResize = () => setSplit(split);
  const offFlap = word ? attachFlap(word) : () => {};
  word?.addEventListener("click", onWord);
  grip?.addEventListener("pointerdown", onDown);
  grip?.addEventListener("pointermove", onMove);
  grip?.addEventListener("pointerup", onUp);
  grip?.addEventListener("pointercancel", onUp);
  grip?.addEventListener("keydown", onKey);
  window.addEventListener("resize", onResize);
  setSplit(1);

  return {
    frame(p: number) {
      // The line parks itself when the week leaves the screen.
      if (split < 1 && (P.weekIn < 0.5 || p >= 1) && !dragging) setSplit(1);
      // Each stage of the film opens its artifact (SCRIPT-v5): the tray
      // the lead table, the sorter the qualifying prompt, the typewriter
      // and the mailbox the drafted email, the blocks the CRM workflow, the
      // pull-back the lesson outline.
      const ph = phaseAt(p);
      const VIEW: Record<string, string> = {
        tray: "gtm",
        sorter: "qualify",
        typewriter: "email",
        mailbox: "email",
        blocks: "sheet",
        pullback: "teach",
        out: "teach",
      };
      const v = VIEW[ph] ?? "intro";
      if (v !== view) {
        view = v;
        views.forEach((x) => x.classList.toggle("is-on", x.dataset.view === v));
      }
      if (split < 1) loadClips();
      if (!clipsLoaded || split >= 1) return;
      const cardinal = v4root?.dataset.world === "cardinal";
      const CLIP: Record<string, Stage[]> = {
        gtm_score: ["sorter"],
        gtm_score_on_cardinal: ["sorter"],
        email_draft: ["typewriter", "mailbox"],
        crm_merge: ["blocks"],
        teach_curve: ["pullback"],
      };
      for (const m of clipEls) {
        const name = m.dataset.name ?? "";
        const isGtm = name.startsWith("gtm_score");
        m.classList.toggle("is-on", !isGtm || (name === "gtm_score_on_cardinal") === cardinal);
        if (!(m instanceof HTMLVideoElement)) continue;
        const stages = CLIP[name] ?? [];
        const at = stages.indexOf(ph as Stage);
        if (at < 0 || m.readyState < 1 || m.seeking || !m.duration) continue;
        // Spread the clip across all of its stages, in order.
        const k = (at + stageProgress(p, stages[at])) / stages.length;
        const tgt = k * (m.duration - 0.05);
        if (Math.abs(m.currentTime - tgt) > 1 / 30) m.currentTime = tgt;
      }
    },
    dispose() {
      offFlap();
      cancelAnimationFrame(glideId);
      word?.removeEventListener("click", onWord);
      grip?.removeEventListener("pointerdown", onDown);
      grip?.removeEventListener("pointermove", onMove);
      grip?.removeEventListener("pointerup", onUp);
      grip?.removeEventListener("pointercancel", onUp);
      grip?.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    },
  };
}
