"use client";

/*
 * The machine film as an image sequence drawn on a canvas (crafts/website.md,
 * "Scroll-scrubbed film"). It was a 1280x720 H.264 file stretched across
 * 1440 to 2880px retina screens and scrubbed by setting currentTime, which
 * Caleb called "Both of them blurry asf" (2026-10-09), and seeking a
 * long-GOP file stalls on every seek. Now:
 *
 *   - frames are WebP stills rendered at 2560x1440 (1440x2560 for phones),
 *     encoded by blender/encode_seq.py, drawn into a canvas sized to the
 *     screen's own pixels
 *   - a low set (1280 or 720 wide) loads first so the film is never blank,
 *     then the sharp set loads stage by stage, nearest stage first
 *   - frames stay compressed in memory (about 56MB of blobs at 2560) and
 *     only a window around the playhead is decoded, off the main thread,
 *     with createImageBitmap: all 375 decoded at 2560 would be 5.5GB
 *   - every frame paints the two nearest frames blended by the fractional
 *     position, so a slow scroll still changes something on every rAF
 */

export type SeqSet = { dir: string; w: number; h: number };
const N_DEFAULT = 375;

const SETS = {
  landHi: { dir: "/tts/machine/seq/land-2560", w: 2560, h: 1440 },
  landLo: { dir: "/tts/machine/seq/land-1280", w: 1280, h: 720 },
  portHi: { dir: "/tts/machine/seq/port-1440", w: 1440, h: 2560 },
  portLo: { dir: "/tts/machine/seq/port-720", w: 720, h: 1280 },
} satisfies Record<string, SeqSet>;

const url = (s: SeqSet, i: number) =>
  `${s.dir}/${String(i + 1).padStart(4, "0")}.webp`;

// Decoded frames kept per set around the playhead. 2560x1440 RGBA is
// 14.7MB a frame, so 10 of them is about 150MB; guessed, never measured
// against a memory budget.
const KEEP = { hi: 10, lo: 24 };
// Fetches in flight per set: enough to fill the pipe on a fast link
// without starving the rest of the page. Guessed.
const PARALLEL = { hi: 4, lo: 6 };

type Layer = {
  set: SeqSet;
  blobs: (Blob | null)[];
  bitmaps: Map<number, ImageBitmap>;
  decoding: Set<number>;
  fetching: Set<number>;
  keep: number;
};

export type Film = {
  /** Start loading. Safe to call more than once. */
  load: () => void;
  /** Draw frame f (fractional, 0-based). Returns true once something real drew. */
  draw: (f: number) => boolean;
  /** Stage boundaries in frames, to order the sharp set's loading. */
  setStages: (starts: number[]) => void;
  /** Size the backing store to the box at the screen's pixel ratio. */
  resize: () => void;
  dispose: () => void;
  n: number;
};

export function createFilm(
  canvas: HTMLCanvasElement,
  portrait: boolean,
  onReady: () => void,
): Film {
  const ctx = canvas.getContext("2d", { alpha: false });
  const n = N_DEFAULT;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const box = () => canvas.getBoundingClientRect();
  // The sharp set when the screen has more pixels than the low set carries.
  const needHi = () => {
    const r = box();
    const lo = portrait ? SETS.portLo : SETS.landLo;
    return (
      Math.max(r.width * dpr, r.height * dpr * (lo.w / lo.h)) > lo.w * 1.05
    );
  };
  const mk = (s: SeqSet, keep: number): Layer => ({
    set: s,
    blobs: new Array(n).fill(null),
    bitmaps: new Map(),
    decoding: new Set(),
    fetching: new Set(),
    keep,
  });
  const lo = mk(portrait ? SETS.portLo : SETS.landLo, KEEP.lo);
  const hi = mk(portrait ? SETS.portHi : SETS.landHi, KEEP.hi);
  let stages: number[] = [0];
  let started = false;
  let disposed = false;
  let head = 0;
  const ctrl = new AbortController();

  async function fetchAll(L: Layer, order: number[], parallel: number) {
    let k = 0;
    const worker = async () => {
      while (!disposed && k < order.length) {
        const i = order[k++];
        if (L.blobs[i] || L.fetching.has(i)) continue;
        L.fetching.add(i);
        try {
          const r = await fetch(url(L.set, i), { signal: ctrl.signal });
          if (!r.ok) continue;
          L.blobs[i] = await r.blob();
          // A frame near the playhead is worth decoding the moment it lands.
          if (Math.abs(i - head) <= 2) decodeAround(L, head);
        } catch {
          if (disposed) return;
        } finally {
          L.fetching.delete(i);
        }
      }
    };
    await Promise.all(Array.from({ length: parallel }, worker));
  }

  function decodeAround(L: Layer, at: number) {
    const c = Math.round(at);
    const half = Math.floor(L.keep / 2);
    for (let d = 0; d <= half; d++) {
      for (const i of d ? [c + d, c - d] : [c]) {
        if (i < 0 || i >= n) continue;
        if (L.bitmaps.has(i) || L.decoding.has(i)) continue;
        // At most a few decodes in flight per layer; the rest wait a frame.
        if (L.decoding.size >= 4) return;
        const b = L.blobs[i];
        if (!b) continue;
        L.decoding.add(i);
        createImageBitmap(b)
          .then((bm) => {
            L.decoding.delete(i);
            // Dropped if the playhead has moved on while it decoded: a fast
            // scroll otherwise kept every late decode for good.
            if (disposed || Math.abs(i - head) > half + 2) return bm.close();
            L.bitmaps.set(i, bm);
            // Evict the farthest from the playhead until within budget.
            while (L.bitmaps.size > L.keep) {
              let far = -1;
              let dist = -1;
              for (const j of L.bitmaps.keys()) {
                const dd = Math.abs(j - head);
                if (dd > dist) {
                  dist = dd;
                  far = j;
                }
              }
              L.bitmaps.get(far)?.close();
              L.bitmaps.delete(far);
            }
            onReady();
          })
          .catch(() => L.decoding.delete(i));
      }
    }
  }

  /* Frames ordered from the playhead's stage outward, stage by stage. */
  function stageOrder(): number[] {
    const starts = [...stages, n];
    const blocks: number[][] = [];
    for (let s = 0; s < starts.length - 1; s++) {
      const b: number[] = [];
      for (let i = starts[s]; i < starts[s + 1]; i++) b.push(i);
      blocks.push(b);
    }
    let cur = 0;
    for (let s = 0; s < starts.length - 1; s++) if (head >= starts[s]) cur = s;
    const out: number[] = [];
    for (let d = 0; d < blocks.length; d++) {
      if (blocks[cur + d]) out.push(...blocks[cur + d]);
      if (d && blocks[cur - d]) out.push(...blocks[cur - d]);
    }
    return out;
  }

  function resize() {
    const r = box();
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      // Resizing clears the canvas to black; the next draw must repaint.
      lastKey = "";
    }
  }

  // Cover-fit, like the video's object-fit: cover.
  function blit(bm: ImageBitmap, alpha: number) {
    if (!ctx) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const s = Math.max(cw / bm.width, ch / bm.height);
    const w = bm.width * s;
    const h = bm.height * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(bm, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  function pick(i: number): ImageBitmap | null {
    return hi.bitmaps.get(i) ?? lo.bitmaps.get(i) ?? null;
  }
  /* The nearest decoded frame, for when the exact one isn't in yet. */
  function nearest(i: number): ImageBitmap | null {
    for (let d = 1; d < 30; d++) {
      const b = pick(i - d) ?? pick(i + d);
      if (b) return b;
    }
    return null;
  }

  let lastKey = "";
  function draw(f: number): boolean {
    if (!ctx) return false;
    const x = Math.max(0, Math.min(n - 1, f));
    head = x;
    // The low set only matters where the sharp set hasn't landed yet.
    if (!hi.blobs[Math.round(x)]) decodeAround(lo, x);
    decodeAround(hi, x);
    const i0 = Math.floor(x);
    const i1 = Math.min(n - 1, i0 + 1);
    const t = x - i0;
    const exact = pick(i0);
    const a = exact ?? nearest(i0);
    if (!a) {
      if (lastKey !== "ground") {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#f4efe6";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        lastKey = "ground";
      }
      return false;
    }
    // Blend only two true neighbours at the same sharpness: a stand-in
    // frame blended with the real next one drew the machine twice.
    const nb = exact && t > 0.01 ? pick(i1) : null;
    const b = nb && nb.width === exact?.width ? nb : null;
    const key = `${i0}:${a.width}:${b ? b.width : 0}:${t.toFixed(3)}`;
    if (key === lastKey) return true;
    lastKey = key;
    blit(a, 1);
    if (b) blit(b, t);
    ctx.globalAlpha = 1;
    return true;
  }

  function load() {
    if (started) return;
    started = true;
    resize();
    // Low set first, in order from the top, so the rack focus is in hand
    // the moment the film fades up; then the sharp set by stage.
    const all = Array.from({ length: n }, (_, i) => i);
    fetchAll(lo, all, PARALLEL.lo).then(() => {
      if (!disposed && needHi()) fetchAll(hi, stageOrder(), PARALLEL.hi);
    });
    // Begin the sharp set's first stage alongside, so the opening shot is
    // sharp by the time anyone reaches it.
    if (needHi()) fetchAll(hi, all.slice(0, Math.min(n, stages[1] ?? 48)), 2);
  }

  return {
    load,
    draw,
    resize,
    setStages: (starts) => {
      stages = starts.length ? starts : [0];
    },
    dispose: () => {
      disposed = true;
      ctrl.abort();
      for (const L of [lo, hi]) {
        L.bitmaps.forEach((b) => b.close());
        L.bitmaps.clear();
      }
    },
    n,
  };
}
