// Parses public/tts/grid/la-grid.bin (layout documented in
// scripts/build-la-grid.mjs) and answers the two spatial questions the engine
// asks: how does the agent drive from A to B, and where is the 110.

export interface GridData {
  /** street samples, x,y pairs in metres from USC */
  streets: Float32Array;
  /** 0 residential, 1 tertiary, 2 secondary, 3 primary */
  streetClass: Uint8Array;
  fwyPos: Float32Array;
  fwyLines: { start: number; count: number; route: number }[];
  biz: Float32Array;
  bizKind: Uint8Array;
  nodes: Float32Array;
  adj: number[][];
}

const MAGIC = 0x4c414731;

export async function loadGrid(
  url: string,
  signal?: AbortSignal,
): Promise<GridData> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`la-grid: HTTP ${res.status} for ${url}`);
  return parseGrid(await res.arrayBuffer());
}

export function parseGrid(buf: ArrayBuffer): GridData {
  const head = new Uint32Array(buf, 0, 8);
  if (head[0] !== MAGIC) throw new Error("la-grid: bad magic");
  const [, nStreet, nFwyVert, nFwyLine, nBiz, nNode, nEdge] = head;
  const pad4 = (n: number) => (n + 3) & ~3;
  let o = 32;
  const i16pairs = (n: number) => {
    const raw = new Int16Array(buf, o, n * 2);
    o += n * 4;
    return Float32Array.from(raw);
  };
  const streets = i16pairs(nStreet);
  const streetClass = new Uint8Array(buf, o, nStreet).slice();
  o += pad4(nStreet);
  const fwyPos = i16pairs(nFwyVert);
  const lineRaw = new Uint32Array(buf, o, nFwyLine * 3);
  o += nFwyLine * 12;
  const fwyLines = [];
  for (let i = 0; i < nFwyLine; i++)
    fwyLines.push({
      start: lineRaw[i * 3],
      count: lineRaw[i * 3 + 1],
      route: lineRaw[i * 3 + 2],
    });
  const biz = i16pairs(nBiz);
  const bizKind = new Uint8Array(buf, o, nBiz).slice();
  o += pad4(nBiz);
  const nodes = i16pairs(nNode);
  const edges = new Uint32Array(buf, o, nEdge * 2);
  const adj: number[][] = Array.from({ length: nNode }, () => []);
  for (let i = 0; i < nEdge; i++) {
    const a = edges[i * 2];
    const b = edges[i * 2 + 1];
    adj[a].push(b);
    adj[b].push(a);
  }
  return { streets, streetClass, fwyPos, fwyLines, biz, bizKind, nodes, adj };
}

/* ---------------------------------------------------------------- routing */

function nearestNode(d: GridData, x: number, y: number) {
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i < d.nodes.length / 2; i++) {
    const dd = (d.nodes[i * 2] - x) ** 2 + (d.nodes[i * 2 + 1] - y) ** 2;
    if (dd < bd) {
      bd = dd;
      best = i;
    }
  }
  return best;
}

/** A* over the arterial graph. 1,680 nodes, so a linear open-set scan is fine. */
function shortestPath(d: GridData, s: number, t: number): number[] {
  const n = d.adj.length;
  const g = new Float64Array(n).fill(Infinity);
  const f = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);
  const open = new Set<number>([s]);
  const tx = d.nodes[t * 2];
  const ty = d.nodes[t * 2 + 1];
  const h = (i: number) =>
    Math.hypot(d.nodes[i * 2] - tx, d.nodes[i * 2 + 1] - ty);
  g[s] = 0;
  f[s] = h(s);
  while (open.size) {
    let cur = -1;
    let cf = Infinity;
    for (const i of open)
      if (f[i] < cf) {
        cf = f[i];
        cur = i;
      }
    if (cur === t) break;
    open.delete(cur);
    closed[cur] = 1;
    for (const nb of d.adj[cur]) {
      if (closed[nb]) continue;
      const step = Math.hypot(
        d.nodes[nb * 2] - d.nodes[cur * 2],
        d.nodes[nb * 2 + 1] - d.nodes[cur * 2 + 1],
      );
      const ng = g[cur] + step;
      if (ng < g[nb]) {
        g[nb] = ng;
        f[nb] = ng + h(nb);
        prev[nb] = cur;
        open.add(nb);
      }
    }
  }
  if (s !== t && prev[t] < 0) return [s];
  const path = [t];
  while (path[path.length - 1] !== s) path.push(prev[path[path.length - 1]]);
  return path.reverse();
}

export interface Route {
  /** dense samples, x,y pairs */
  xy: Float32Array;
  /** normalised drive time at each sample, 0..1, monotonic */
  time: Float32Array;
  length: number;
}

// Sample spacing for the speed profile, in metres.
const DS = 8;
// Accelerating from a stop to cruise takes about 250 m, braking the same:
// at 6.25 m/px (zoom 1, 1440 wide) that is 40 px of visible easing, enough to
// read as a car and short enough that a 5 km route is mostly cruise.
const ACCEL = 1 / 500;

/**
 * The agent drives the real arterial graph: shortest path, then a speed
 * profile that brakes into each turn in proportion to how sharp it is and
 * accelerates out, so a linear t reads as a car, not a lerp.
 */
export function planRoute(
  d: GridData,
  from: [number, number],
  to: [number, number],
): Route {
  const a = nearestNode(d, from[0], from[1]);
  const b = nearestNode(d, to[0], to[1]);
  const ids = shortestPath(d, a, b);
  const corners: [number, number][] = [from];
  for (const i of ids) corners.push([d.nodes[i * 2], d.nodes[i * 2 + 1]]);
  corners.push(to);

  // Densify, recording the turn angle at each corner sample.
  const xs: number[] = [];
  const ys: number[] = [];
  const turn: number[] = [];
  for (let i = 0; i < corners.length - 1; i++) {
    const [ax, ay] = corners[i];
    const [bx, by] = corners[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    if (len < 0.5) continue;
    let ang = 0;
    if (i > 0) {
      const [px, py] = corners[i - 1];
      const ux = ax - px,
        uy = ay - py,
        vx = bx - ax,
        vy = by - ay;
      const nu = Math.hypot(ux, uy),
        nv = Math.hypot(vx, vy);
      if (nu > 0.5 && nv > 0.5)
        ang = Math.acos(
          Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (nu * nv))),
        );
    }
    const steps = Math.max(1, Math.ceil(len / DS));
    for (let k = 0; k < steps; k++) {
      xs.push(ax + ((bx - ax) * k) / steps);
      ys.push(ay + ((by - ay) * k) / steps);
      turn.push(k === 0 ? ang : 0);
    }
  }
  xs.push(to[0]);
  ys.push(to[1]);
  turn.push(0);
  const n = xs.length;

  // Speed limits: cruise 1, a right angle drops to 0.3, a U-turn to 0.12.
  const v = new Float64Array(n);
  for (let i = 0; i < n; i++)
    v[i] =
      1 -
      0.88 *
        Math.min(1, turn[i] / Math.PI) *
        (turn[i] > 0.2 ? 1 : turn[i] / 0.2);
  v[0] = 0.04;
  v[n - 1] = 0.04;
  const seg = (i: number) => Math.hypot(xs[i + 1] - xs[i], ys[i + 1] - ys[i]);
  for (let i = 1; i < n; i++)
    v[i] = Math.min(v[i], Math.sqrt(v[i - 1] ** 2 + 2 * ACCEL * seg(i - 1)));
  for (let i = n - 2; i >= 0; i--)
    v[i] = Math.min(v[i], Math.sqrt(v[i + 1] ** 2 + 2 * ACCEL * seg(i)));

  const time = new Float32Array(n);
  let T = 0;
  let L = 0;
  for (let i = 1; i < n; i++) {
    const s = seg(i - 1);
    L += s;
    T += s / Math.max(0.02, (v[i] + v[i - 1]) / 2);
    time[i] = T;
  }
  for (let i = 0; i < n; i++) time[i] = T > 0 ? time[i] / T : 0;
  const xy = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    xy[i * 2] = xs[i];
    xy[i * 2 + 1] = ys[i];
  }
  return { xy, time, length: L };
}

export function routeAt(r: Route, t: number, out: [number, number]) {
  const n = r.time.length;
  if (t <= 0 || n < 2) {
    out[0] = r.xy[0];
    out[1] = r.xy[1];
    return out;
  }
  if (t >= 1) {
    out[0] = r.xy[(n - 1) * 2];
    out[1] = r.xy[(n - 1) * 2 + 1];
    return out;
  }
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (r.time[mid] <= t) lo = mid;
    else hi = mid;
  }
  const span = r.time[hi] - r.time[lo] || 1;
  const k = (t - r.time[lo]) / span;
  out[0] = r.xy[lo * 2] + (r.xy[hi * 2] - r.xy[lo * 2]) * k;
  out[1] = r.xy[lo * 2 + 1] + (r.xy[hi * 2 + 1] - r.xy[lo * 2 + 1]) * k;
  return out;
}

/* ------------------------------------------------------------ the 110 rail */

/**
 * A smooth centreline of the 110 (route 1) from the south edge up through
 * USC, as x per 100 m of y. The freeway camera rides it northbound.
 */
export function buildRail(d: GridData) {
  const bins = new Map<number, { sx: number; n: number }>();
  for (const l of d.fwyLines) {
    if (l.route !== 1) continue;
    for (let i = l.start; i < l.start + l.count; i++) {
      const x = d.fwyPos[i * 2];
      const y = d.fwyPos[i * 2 + 1];
      if (Math.abs(x) > 2500) continue;
      const k = Math.round(y / 100);
      const b = bins.get(k) ?? { sx: 0, n: 0 };
      b.sx += x;
      b.n += 1;
      bins.set(k, b);
    }
  }
  const keys = [...bins.keys()].sort((a, b) => a - b);
  const raw = keys.map(
    (k) => [bins.get(k)!.sx / bins.get(k)!.n, k * 100] as [number, number],
  );
  // Moving average over 5 bins so the camera never jitters on a ramp merge.
  const rail = raw.map((p, i) => {
    let sx = 0;
    let c = 0;
    for (
      let j = Math.max(0, i - 2);
      j <= Math.min(raw.length - 1, i + 2);
      j++
    ) {
      sx += raw[j][0];
      c++;
    }
    return [sx / c, p[1]] as [number, number];
  });
  return rail.length >= 2
    ? rail
    : ([
        [0, -5000],
        [0, 1000],
      ] as [number, number][]);
}

export function railAt(
  rail: [number, number][],
  y: number,
): { x: number; y: number; hx: number; hy: number } {
  let i = 0;
  while (i < rail.length - 2 && rail[i + 1][1] < y) i++;
  const [ax, ay] = rail[i];
  const [bx, by] = rail[i + 1];
  const k = Math.max(0, Math.min(1, (y - ay) / (by - ay || 1)));
  const hx = bx - ax;
  const hy = by - ay;
  const hl = Math.hypot(hx, hy) || 1;
  return { x: ax + (bx - ax) * k, y, hx: hx / hl, hy: hy / hl };
}
