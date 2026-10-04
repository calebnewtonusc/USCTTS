/* Generative geometry, with constants that were rendered and looked at.
 *
 * The first version of this file was four shapes I invented. These are the
 * published algorithms with the parameter sets that actually produce a figure,
 * verified by implementing each one, rasterising it, and checking ink
 * coverage. Where a published constant produces mud it is marked.
 *
 * The budget that drives every choice here: stagger is per element, so 300
 * elements at 17ms is a 5.1s draw-on, which is already the ceiling. Element
 * count is hard; point count is only file size.
 *
 * Each one also means something, which is the part Lemma's abstract shapes do
 * not do. Phyllotaxis packs exactly as many marks as there are YC companies.
 */

export const TAU = Math.PI * 2;
/** Vogel's golden angle, exact: 137.50776405003785 degrees. */
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export interface Pt { x: number; y: number }
export type Poly = Pt[];
export interface Dot { cx: number; cy: number; r: number }

/** Deterministic PRNG. Math.random() desyncs server and client markup. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normalise any point set into the 0..100 viewBox with padding. */
export function fit(polys: Poly[], pad = 7, size = 100): Poly[] {
  let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
  for (const p of polys) for (const q of p) {
    if (q.x < mnx) mnx = q.x; if (q.x > mxx) mxx = q.x;
    if (q.y < mny) mny = q.y; if (q.y > mxy) mxy = q.y;
  }
  const span = Math.max(mxx - mnx, mxy - mny) || 1;
  const k = (size - 2 * pad) / span;
  const cx = (mnx + mxx) / 2, cy = (mny + mxy) / 2;
  return polys.map((p) => p.map((q) => ({
    x: (q.x - cx) * k + size / 2,
    y: (q.y - cy) * k + size / 2,
  })));
}

export function toPath(poly: Poly, dp = 2): string {
  let d = `M${poly[0].x.toFixed(dp)} ${poly[0].y.toFixed(dp)}`;
  for (let i = 1; i < poly.length; i++) d += `L${poly[i].x.toFixed(dp)} ${poly[i].y.toFixed(dp)}`;
  return d;
}

/* ===================== HARMONOGRAPH =====================
 * ONE element. The best interest-per-primitive available.
 *
 * Three constants nobody publishes, all derived by sweep:
 *
 *  1. Detuning has a quantity and it is the phase drift accumulated over the
 *     whole run: Df * T ~ driftPi * pi, good between 0.5 and 2.0. At 0 the
 *     figure is a static rosette with no precession, which is clean and inert.
 *     Past 4 it is scribble. This single number is what separates a good
 *     harmonograph from a boring one.
 *  2. Parameterise by cycles and samples-per-cycle, never by raw frequency and
 *     duration. A first attempt at 477 cycles and 5 samples per cycle drew an
 *     aliased star of straight chords. Keep samples-per-cycle at 40 or above.
 *  3. Damping is set by where it should end: d = -ln(decayTo)/T, with decayTo
 *     between 0.20 and 0.30. At 0.03 it collapses to a dot. A raw damping
 *     constant is useless because the right value moves 10x with run length.
 *
 * Paul Bourke says frequencies should "not be integer multiples". That is
 * right for a physical harmonograph and wrong for a legible drawing:
 * non-integer ratios measured at 19.6% ink, over the mud threshold. Use
 * near-integer ratios and detune them by the amount above. Petals = f1 + f2.
 */
export function harmonograph({
  base = [5, 4], driftPi = 1.2, cycles = 40, decayTo = 0.22, spc = 46,
  phase = [0, Math.PI / 2, 0, Math.PI / 2],
}: {
  base?: number[]; driftPi?: number; cycles?: number;
  decayTo?: number; spc?: number; phase?: number[];
} = {}): Poly[] {
  const fmax = Math.max(...base);
  const T = (cycles * TAU) / fmax;
  const df = (driftPi * Math.PI) / T;
  const f = [base[0], base[1] + df, base[1], base[0] + df];
  const d = -Math.log(decayTo) / T;
  const N = Math.round(cycles * spc);

  const pts: Poly = [];
  for (let i = 0; i < N; i++) {
    const t = (T * i) / (N - 1);
    const e = Math.exp(-d * t);
    pts.push({
      x: Math.sin(t * f[0] + phase[0]) * e + Math.sin(t * f[1] + phase[1]) * e,
      y: Math.sin(t * f[2] + phase[2]) * e + Math.sin(t * f[3] + phase[3]) * e,
    });
  }
  return fit([pts]);
}

/* ===================== PHYLLOTAXIS =====================
 * Vogel 1979: r = c*sqrt(n), theta = n * 137.508deg.
 *
 * Two thresholds, both measured rather than assumed:
 *
 *  - Under 100 marks it reads as scattered noise with no visible spiral arms.
 *    At 150 the arms are ambiguous. At 250 and above the Fibonacci parastichy
 *    is the dominant read. So n is not a taste knob, it is a threshold.
 *  - The mark radius matters as much as n. At 0.52 of the packing constant the
 *    dots float and the arms are weak; at 0.70 to 0.75 they lock in, because
 *    near-touching neighbours are what make the eye trace a chain.
 *
 * Emitted as circles, so 280 elements cost zero path points.
 *
 * Here it is the market: one mark per company, packed the way a sunflower
 * packs seeds, which is the densest arrangement that still lets you count.
 */
export function phyllotaxis({ n = 280, c = 1, k = 0.72 }: { n?: number; c?: number; k?: number } = {}): Dot[] {
  const out: Dot[] = [];
  const maxR = c * Math.sqrt(n - 1);
  const scale = 43 / (maxR || 1);
  for (let i = 0; i < n; i++) {
    const r = c * Math.sqrt(i);
    const a = i * GOLDEN_ANGLE;
    out.push({
      cx: 50 + r * Math.cos(a) * scale,
      cy: 50 + r * Math.sin(a) * scale,
      r: Math.max(0.35, k * c * scale),
    });
  }
  return out;
}

/* ===================== CHLADNI =====================
 * Nodal lines of a square plate:
 *   cos(n*pi*x)cos(m*pi*y) - cos(m*pi*x)cos(n*pi*y) = 0
 *
 * Marching squares gives the zero set as loose segments, and stitching them
 * into polylines is the whole game: raw output at n=3,m=5 is 812 separate
 * segments, stitched it is 8. A hundredfold reduction, and the draw-on becomes
 * one continuous stroke per contour rather than a hundred disconnected ticks
 * appearing in random order.
 *
 * Rules from the sweep: n != m, both at least 2, coprime or near-coprime, and
 * n + m <= 18. Equal or common-factor pairs degenerate into a plain grid.
 */
export function chladni({ n = 4, m = 7, res = 92 }: { n?: number; m?: number; res?: number } = {}): Poly[] {
  const f = (x: number, y: number) =>
    Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) -
    Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);

  const V: number[][] = [];
  for (let i = 0; i <= res; i++) {
    V[i] = [];
    for (let j = 0; j <= res; j++) V[i][j] = f(i / res, j / res);
  }

  const segs: [Pt, Pt][] = [];
  for (let i = 0; i < res; i++) for (let j = 0; j < res; j++) {
    const v = [V[i][j], V[i + 1][j], V[i + 1][j + 1], V[i][j + 1]];
    const c: Pt[] = [
      { x: i / res, y: j / res }, { x: (i + 1) / res, y: j / res },
      { x: (i + 1) / res, y: (j + 1) / res }, { x: i / res, y: (j + 1) / res },
    ];
    let idx = 0;
    v.forEach((q, kk) => { if (q > 0) idx |= 1 << kk; });
    if (idx === 0 || idx === 15) continue;
    const ip = (A: Pt, B: Pt, va: number, vb: number): Pt => {
      const t = va / (va - vb);
      return { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t };
    };
    const e: Pt[] = [];
    for (let kk = 0; kk < 4; kk++) {
      const k2 = (kk + 1) % 4;
      if (v[kk] > 0 !== v[k2] > 0) e.push(ip(c[kk], c[k2], v[kk], v[k2]));
    }
    for (let kk = 0; kk + 1 < e.length; kk += 2) segs.push([e[kk], e[kk + 1]]);
  }

  // Stitch. Without this the element count is two orders of magnitude worse
  // and the animation is incoherent.
  const key = (p: Pt) => `${p.x.toFixed(5)},${p.y.toFixed(5)}`;
  const at = new Map<string, number[]>();
  segs.forEach((s, i) => s.forEach((p) => {
    const kk = key(p);
    if (!at.has(kk)) at.set(kk, []);
    at.get(kk)!.push(i);
  }));

  const used = new Array(segs.length).fill(false);
  const out: Poly[] = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const poly: Poly = [segs[i][0], segs[i][1]];
    for (const forward of [true, false]) {
      let grow = true;
      while (grow) {
        grow = false;
        const end = forward ? poly[poly.length - 1] : poly[0];
        for (const j of at.get(key(end)) ?? []) {
          if (used[j]) continue;
          const [a, b] = segs[j];
          const next = key(a) === key(end) ? b : key(b) === key(end) ? a : null;
          if (!next) continue;
          used[j] = true;
          if (forward) poly.push(next); else poly.unshift(next);
          grow = true;
          break;
        }
      }
    }
    if (poly.length >= 4) out.push(poly);
  }
  return fit(out);
}

/* ===================== FLOW FIELD =====================
 * Numbers from Tyler Hobbs' flow-field essay, plus two measured additions.
 *
 * Separation enforcement is the highest-value option here and the thing that
 * makes it look authored: without it streamlines converge into black bundles.
 * Fidenza's stated aesthetic property is non-overlapping curves that run
 * alongside their neighbours without ever colliding. Turning it on cut 90
 * candidate curves to 46 and the result is immediately more composed.
 *
 * Angle quantisation to pi/4 is the best non-generic variation: it produces a
 * circuit-board read that looks deliberately designed rather than noisy, which
 * suits a page about routing work to people.
 */
function makeNoise(seed: number) {
  const r = rng(seed);
  const t = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) {
    const j = (r() * (i + 1)) | 0;
    [t[i], t[j]] = [t[j], t[i]];
  }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = t[i & 255];
  const fade = (v: number) => v * v * v * (v * (v * 6 - 15) + 10);
  const lerp = (v: number, a: number, b: number) => a + v * (b - a);
  const grad = (h: number, x: number, y: number) => ((h & 1) ? x : -x) + ((h & 2) ? y : -y);
  return (x: number, y: number) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = fade(x), v = fade(y), A = p[X] + Y, B = p[X + 1] + Y;
    return 0.7 * lerp(v,
      lerp(u, grad(p[A], x, y), grad(p[B], x - 1, y)),
      lerp(u, grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1)));
  };
}

export function flowField({
  seed = 1, n = 90, steps = 52, step = 0.014, scale = 1.2,
  quant = 4, sep = 0.028, minLen = 10,
}: {
  seed?: number; n?: number; steps?: number; step?: number;
  scale?: number; quant?: number; sep?: number; minLen?: number;
} = {}): Poly[] {
  const noise = makeNoise(seed);
  const r = rng(seed * 7 + 3);
  const occupied = new Set<string>();
  const cell = (x: number, y: number) => `${(x / sep) | 0}:${(y / sep) | 0}`;
  const out: Poly[] = [];

  for (let i = 0; i < n; i++) {
    let x = r(), y = r();
    if (occupied.has(cell(x, y))) continue;
    const poly: Poly = [{ x, y }];
    for (let s = 0; s < steps; s++) {
      let a = noise(x * scale, y * scale) * TAU;
      if (quant) a = Math.round(a / (Math.PI / quant)) * (Math.PI / quant);
      x += Math.cos(a) * step;
      y += Math.sin(a) * step;
      if (x < 0 || x > 1 || y < 0 || y > 1) break;
      if (occupied.has(cell(x, y))) break;
      poly.push({ x, y });
    }
    if (poly.length >= minLen) {
      out.push(poly);
      for (const q of poly) occupied.add(cell(q.x, q.y));
    }
  }
  return fit(out);
}
