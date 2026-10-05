import type { GridData } from "./data";

/*
 * The wavefront a colour world spreads by (Caleb, 2026-10-05, on the old
 * site's blurred cream-to-red band: "uncreative ahh transitions"). A new
 * world doesn't fade in; it travels out from where the work is, along the
 * real arterial streets first and then into the blocks between them, like
 * the AI work painting the city street by street.
 *
 * For one origin this builds a field over the 12 km data box: at every
 * 62.5 m cell, how far the work has to travel to get there, normalised so
 * 1 is the far edge of the city. Shaders read it as a texture and colour a
 * point or a pixel with the new world once the front's radius passes it.
 */

export const WAVE_N = 192;
// Everything past the field's last ring, including the ground beyond the
// box that a tilted camera sees at the horizon, arrives at this distance:
// at 1.6 the horizon stayed cream behind a city already cardinal.
export const OUTSIDE = 1.15;
export const WAVE_BOX = 6000; // half-size of the box in metres, same as the data
const CELL = (2 * WAVE_BOX) / WAVE_N;
// Off the arterials the front moves 2.2 times slower than along them. At 1
// (plain distance) the front read as a circle with streets in it; at 2.2 it
// visibly runs up Wilshire and Western ahead of the blocks, then fills them.
// Chosen by eye at 1440 on 2026-10-05.
// 2.2 drew the chamfer's diamonds as big torn triangles at the front
// (review, 2026-10-05); 1.6 still runs ahead along the arterials.
const OFF_NETWORK = 1.6;

export interface WaveField {
  /** normalised distance per cell, row-major from (-BOX, -BOX), 0..~1.3 */
  d: Float32Array;
  /** the same field blurred over about 450 m, for the ground's soft fill */
  blur: Float32Array;
  /** normalised units per metre, so shaders can size bands in metres */
  unit: number;
}

function dijkstra(data: GridData, s: number) {
  const n = data.adj.length;
  const dist = new Float64Array(n).fill(Infinity);
  const done = new Uint8Array(n);
  dist[s] = 0;
  // 1,680 nodes: a linear scan for the next node is a few ms, no heap needed.
  for (let it = 0; it < n; it++) {
    let u = -1;
    let best = Infinity;
    for (let i = 0; i < n; i++)
      if (!done[i] && dist[i] < best) {
        best = dist[i];
        u = i;
      }
    if (u < 0) break;
    done[u] = 1;
    for (const v of data.adj[u]) {
      const w = Math.hypot(
        data.nodes[v * 2] - data.nodes[u * 2],
        data.nodes[v * 2 + 1] - data.nodes[u * 2 + 1],
      );
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  return dist;
}

export function buildWave(data: GridData, origin: [number, number]): WaveField {
  const nNode = data.adj.length;
  let s = 0;
  let sd = Infinity;
  for (let i = 0; i < nNode; i++) {
    const dd =
      (data.nodes[i * 2] - origin[0]) ** 2 +
      (data.nodes[i * 2 + 1] - origin[1]) ** 2;
    if (dd < sd) {
      sd = dd;
      s = i;
    }
  }
  const nd = dijkstra(data, s);
  const lead = Math.sqrt(sd) * OFF_NETWORK;

  const N = WAVE_N;
  const g = new Float64Array(N * N).fill(Infinity);
  const cellOf = (x: number, y: number) => {
    const cx = Math.floor((x + WAVE_BOX) / CELL);
    const cy = Math.floor((y + WAVE_BOX) / CELL);
    return cx < 0 || cy < 0 || cx >= N || cy >= N ? -1 : cy * N + cx;
  };
  const seed = (x: number, y: number, v: number) => {
    const c = cellOf(x, y);
    if (c >= 0 && v < g[c]) g[c] = v;
  };
  seed(origin[0], origin[1], 0);
  // Every arterial edge is drawn into the field at its network distance,
  // so the front runs along the street, not only from node to node.
  for (let a = 0; a < nNode; a++) {
    if (!Number.isFinite(nd[a])) continue;
    for (const b of data.adj[a]) {
      if (b < a || !Number.isFinite(nd[b])) continue;
      const ax = data.nodes[a * 2];
      const ay = data.nodes[a * 2 + 1];
      const bx = data.nodes[b * 2];
      const by = data.nodes[b * 2 + 1];
      const len = Math.hypot(bx - ax, by - ay);
      const steps = Math.max(1, Math.ceil(len / (CELL * 0.5)));
      for (let k = 0; k <= steps; k++) {
        const u = k / steps;
        const v = Math.min(nd[a] + u * len, nd[b] + (1 - u) * len) + lead;
        seed(ax + (bx - ax) * u, ay + (by - ay) * u, v);
      }
    }
  }
  // Chamfer passes spread it into the blocks at the off-network rate.
  const o = CELL * OFF_NETWORK;
  const od = o * Math.SQRT2;
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const i = y * N + x;
        let v = g[i];
        if (x > 0) v = Math.min(v, g[i - 1] + o);
        if (y > 0) {
          v = Math.min(v, g[i - N] + o);
          if (x > 0) v = Math.min(v, g[i - N - 1] + od);
          if (x < N - 1) v = Math.min(v, g[i - N + 1] + od);
        }
        g[i] = v;
      }
    for (let y = N - 1; y >= 0; y--)
      for (let x = N - 1; x >= 0; x--) {
        const i = y * N + x;
        let v = g[i];
        if (x < N - 1) v = Math.min(v, g[i + 1] + o);
        if (y < N - 1) {
          v = Math.min(v, g[i + N] + o);
          if (x < N - 1) v = Math.min(v, g[i + N + 1] + od);
          if (x > 0) v = Math.min(v, g[i + N - 1] + od);
        }
        g[i] = v;
      }
  }
  // Normalise so 1 is the 92nd percentile of the city inside 5.5 km of
  // USC: the far corners of the box are still arriving as t reaches 1, and
  // the shader runs the front a little past 1 to finish them.
  const inside: number[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const px = -WAVE_BOX + (x + 0.5) * CELL;
      const py = -WAVE_BOX + (y + 0.5) * CELL;
      if (Math.hypot(px, py) < 5500 && Number.isFinite(g[y * N + x]))
        inside.push(g[y * N + x]);
    }
  inside.sort((p, q) => p - q);
  const norm = inside[Math.floor(inside.length * 0.92)] || 1;
  const d = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++)
    d[i] = Number.isFinite(g[i]) ? Math.min(OUTSIDE, g[i] / norm) : OUTSIDE;
  // Three box passes of 4 cells (250 m) each way approximate a gaussian of
  // about 450 m: the ground fills in behind the street points with no
  // triangle left in its edge.
  let blur = d.slice();
  const tmp = new Float32Array(N * N);
  const R = 4;
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        let acc = 0;
        let n = 0;
        for (let k = -R; k <= R; k++) {
          const xx = x + k;
          if (xx < 0 || xx >= N) continue;
          acc += blur[y * N + xx];
          n++;
        }
        tmp[y * N + x] = acc / n;
      }
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        let acc = 0;
        let n = 0;
        for (let k = -R; k <= R; k++) {
          const yy = y + k;
          if (yy < 0 || yy >= N) continue;
          acc += tmp[yy * N + x];
          n++;
        }
        blur[y * N + x] = acc / n;
      }
  }
  blur = blur.slice();
  return { d, blur, unit: OFF_NETWORK / norm };
}

/** The field's value at a world point, bilinear, for the CPU side. */
export function sampleWave(f: WaveField, x: number, y: number) {
  if (Math.abs(x) > WAVE_BOX || Math.abs(y) > WAVE_BOX) return OUTSIDE;
  const fx = Math.min(WAVE_N - 1.001, Math.max(0, (x + WAVE_BOX) / CELL - 0.5));
  const fy = Math.min(WAVE_N - 1.001, Math.max(0, (y + WAVE_BOX) / CELL - 0.5));
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const u = fx - x0;
  const v = fy - y0;
  const i = y0 * WAVE_N + x0;
  const a = f.d[i] + (f.d[i + 1] - f.d[i]) * u;
  const b = f.d[i + WAVE_N] + (f.d[i + WAVE_N + 1] - f.d[i + WAVE_N]) * u;
  return a + (b - a) * v;
}

// The front's width, in normalised distance: about 450 m at city scale.
export const WAVE_EDGE = 0.035;
/** Front radius for a progress t: it starts just behind the origin and at
 *  t = 1 has passed every cell, so t = 0 is all old world and t = 1 all new.
 *  The last 8% of cells (the box's far corners, already faded out by the
 *  box edge) arrive over the final stretch. */
export const waveRadius = (t: number) =>
  t >= 1 ? 9 : -WAVE_EDGE + t * (OUTSIDE + 0.05 + WAVE_EDGE);
