/* Generative geometry for the hero gizmos.
 *
 * Lemma's six hero plates are SVG on a 0 0 100 100 viewBox carrying 48, 12,
 * 60, 378, 100 and 2,842 primitives respectively, every one placed by math.
 * That is what a gizmo is. The first attempt here was four styled divs with
 * labels, which is not the same category of object.
 *
 * Where these go further: Lemma's shapes are abstract and mean nothing, so a
 * sphere is just a sphere. Each of these draws a real quantity from the work.
 * Every generator is pure and deterministic, so the server and the client
 * produce identical markup and hydration never warns.
 */

/** Deterministic PRNG. Math.random() would desync server and client markup. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface Line { x1: number; y1: number; x2: number; y2: number }
export interface Dot { cx: number; cy: number; r: number }

/**
 * THE FUNNEL. 6,245 companies narrowing to a cohort of three.
 *
 * Every strand starts spread across the top and converges on three points at
 * the bottom, so the shape is the selection math: the whole index in, three
 * engagements out. The count is sampled down from 6,245 to `strands` because
 * six thousand paths costs more than it renders.
 */
export function funnel(strands = 220, seed = 7): Line[] {
  const rand = rng(seed);
  const exits = [28, 50, 72];
  const out: Line[] = [];
  for (let i = 0; i < strands; i++) {
    const x1 = (i / (strands - 1)) * 100;
    const exit = exits[i % 3];
    // Jitter the landing so the three bundles read as bundles, not as lines.
    const x2 = exit + (rand() - 0.5) * 3.2;
    out.push({ x1, y1: 2, x2, y2: 96 });
  }
  return out;
}

/**
 * THE SPHERE. A wireframe globe of latitude and longitude, the addressable
 * market enumerated. 100 paths, matching the density Lemma runs.
 */
export function sphere(lats = 11, longs = 18): Line[] {
  const out: Line[] = [];
  const R = 44, cx = 50, cy = 50;

  // Latitude rings, drawn as chord segments so the whole thing stays lines.
  for (let i = 1; i < lats; i++) {
    const phi = (i / lats) * Math.PI;
    const y = cy - R * Math.cos(phi);
    const r = R * Math.sin(phi);
    const seg = 26;
    for (let j = 0; j < seg; j++) {
      const a1 = (j / seg) * Math.PI * 2;
      const a2 = ((j + 1) / seg) * Math.PI * 2;
      // Squash vertically for the perspective read.
      out.push({
        x1: cx + r * Math.cos(a1), y1: y + r * 0.34 * Math.sin(a1),
        x2: cx + r * Math.cos(a2), y2: y + r * 0.34 * Math.sin(a2),
      });
    }
  }

  // Longitude arcs.
  for (let k = 0; k < longs; k++) {
    const theta = (k / longs) * Math.PI;
    const seg = 26;
    for (let j = 0; j < seg; j++) {
      const p1 = (j / seg) * Math.PI;
      const p2 = ((j + 1) / seg) * Math.PI;
      out.push({
        x1: cx + R * Math.sin(p1) * Math.cos(theta), y1: cy - R * Math.cos(p1),
        x2: cx + R * Math.sin(p2) * Math.cos(theta), y2: cy - R * Math.cos(p2),
      });
    }
  }
  return out;
}

/**
 * THE MATRIX. A dot field where a diagonal band is enriched and the rest is
 * not, which is the coverage gap a market map actually finds. Returns dots
 * plus the subset that is "filled", so the caller can colour them apart.
 */
export function matrix(cols = 34, rows = 26): { dots: Dot[]; filled: boolean[] } {
  const dots: Dot[] = [];
  const filled: boolean[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = 4 + (x / (cols - 1)) * 92;
      const py = 4 + (y / (rows - 1)) * 92;
      // A soft diagonal wave decides coverage, so the boundary is organic
      // rather than a straight cut.
      const band = Math.sin((x / cols) * Math.PI * 1.6 + (y / rows) * 2.2);
      const on = band > 0.18;
      dots.push({ cx: px, cy: py, r: on ? 1.15 : 0.62 });
      filled.push(on);
    }
  }
  return { dots, filled };
}

/**
 * THE GRAPH. Nodes with edges to their nearest neighbours: the warm-path map,
 * connections matched against an account list.
 */
export function graph(nodes = 46, seed = 19): { dots: Dot[]; edges: Line[] } {
  const rand = rng(seed);
  const dots: Dot[] = [];
  for (let i = 0; i < nodes; i++) {
    // Polar placement keeps it a cloud instead of a rectangle of confetti.
    const a = rand() * Math.PI * 2;
    const r = 8 + Math.sqrt(rand()) * 38;
    dots.push({ cx: 50 + r * Math.cos(a), cy: 50 + r * Math.sin(a), r: 0.9 + rand() * 1.5 });
  }

  const edges: Line[] = [];
  for (let i = 0; i < nodes; i++) {
    const near = dots
      .map((d, j) => ({ j, d: Math.hypot(d.cx - dots[i].cx, d.cy - dots[i].cy) }))
      .filter((n) => n.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const n of near) {
      // i < j dedupes the pair, so each edge is drawn once.
      if (i < n.j) edges.push({ x1: dots[i].cx, y1: dots[i].cy, x2: dots[n.j].cx, y2: dots[n.j].cy });
    }
  }
  return { dots, edges };
}
