/*
 * The LA street points, for everything on the site that draws in the
 * opener's language outside the WebGL field: the dot floors under the clay
 * scenes, the seams between sections and the network map. Every dot is a
 * real OpenStreetMap street sample from public/tts/grid/la-grid.bin, in
 * metres from USC (x east, y north), so no dot on the page is decoration:
 * each one is a place in the city (docs/INTENT-home.md, "One world").
 *
 * The file is fetched once. The home page already preloads it for the
 * field (Landing.tsx), with the same URL and CORS mode, so this read is
 * served from that request.
 */
import { parseGrid } from "../grid/data";

export const GRID_URL = "/tts/grid/la-grid.bin";

export interface Streets {
  /** x, y pairs in metres from USC */
  xy: Float32Array;
  /** 0 residential, 1 tertiary, 2 secondary, 3 primary */
  cls: Uint8Array;
}

let cached: Promise<Streets> | null = null;

export function loadStreets(): Promise<Streets> {
  if (!cached) {
    cached = fetch(GRID_URL, { mode: "cors", credentials: "same-origin" })
      .then((r) => {
        if (!r.ok) throw new Error(`la-grid: HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then((buf) => {
        const g = parseGrid(buf);
        return { xy: g.streets, cls: g.streetClass };
      })
      .catch((e: unknown) => {
        cached = null;
        throw e;
      });
  }
  return cached;
}

/** The points inside a window of the city, as metres, thinned to at most
 *  `max` by a fixed stride so the same street keeps the same dots. */
export function pick(
  s: Streets,
  win: [number, number, number, number],
  max: number,
): { xy: Float32Array; cls: Uint8Array } {
  const [x0, y0, x1, y1] = win;
  const idx: number[] = [];
  for (let i = 0; i < s.cls.length; i++) {
    const x = s.xy[i * 2];
    const y = s.xy[i * 2 + 1];
    if (x >= x0 && x <= x1 && y >= y0 && y <= y1) idx.push(i);
  }
  const stride = Math.max(1, Math.ceil(idx.length / max));
  const n = Math.ceil(idx.length / stride);
  const xy = new Float32Array(n * 2);
  const cls = new Uint8Array(n);
  for (let k = 0, j = 0; k < idx.length; k += stride, j++) {
    const i = idx[k];
    xy[j * 2] = s.xy[i * 2];
    xy[j * 2 + 1] = s.xy[i * 2 + 1];
    cls[j] = s.cls[i];
  }
  return { xy, cls };
}

/** Deterministic noise per index, so a dot scatters the same way each load. */
export const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
