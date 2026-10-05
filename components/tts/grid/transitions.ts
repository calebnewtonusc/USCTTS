/*
 * How the city changes from one colour world to the next. Caleb, 2026-10-05:
 * "You use the same animation multiple times, the expansion for color
 * change." So each change is its own idea, tied to what its chapter means,
 * the way Gavin gives every chapter its own camera:
 *
 *  0 night to sky, the opening into Partners: SUNRISE. A terminator rakes
 *    across the grid from the east-southeast, a warm band of grazing light
 *    on its edge, the ground lightening behind it. Time passing.
 *  1 sky to cardinal, finding customers: a HEAT MAP. The worth-reaching
 *    businesses near the agent flare first, and cardinal bleeds out of each
 *    one as soft overlapping pools that merge. The data paints the field.
 *  2 cardinal to cream, the week: the DIVE. The camera drops onto the
 *    office's block, its light comes on and fills the screen as we arrive,
 *    and the world under that light is cream. A zoom-through, not a spread.
 *  3 cream to Join's cardinal: RAIN. The week's cleared blocks come down as
 *    points onto the map, and the city fills cardinal from where they land,
 *    then finishes full-bleed so the doors sit on one clean field.
 *
 * The GLSL below and transM() on the CPU are the same function: the CPU one
 * decides which world covers most of the screen, so the text flips with
 * what's behind it.
 */

export const SITE_N = 16;

export const TRANSITION_GLSL = /* glsl */ `
uniform float uMode, uT;
uniform vec2 uSite[${SITE_N}];
uniform float uSiteT[${SITE_N}];
// The dive's light: the middle of the screen as the camera drops, so it
// fills the frame instead of blooming behind the story's lines.
uniform vec2 uFocus;
// The world that sits behind the story's lines while a change runs: the
// lane is held to whichever world the text has flipped to, so a pool or a
// band never washes out a caption (review 3).
uniform vec4 uProtect;
uniform float uProtectOn, uProtectM;

float sunX(vec2 p) { return p.x * 0.94 + p.y * 0.34; }
float sunS(float t) { return mix(7600.0, -7600.0, t); }

// 0 still the old world, 1 the new one; crest is this change's own accent.
float transM(vec2 p, out float crest) {
  crest = 0.0;
  if (uT <= 0.0) return 0.0;
  if (uT >= 1.0) return 1.0;
  if (uMode < 0.5) {
    float x = sunX(p), s = sunS(uT);
    crest = exp(-pow((x - s - 500.0) / 700.0, 2.0));
    return smoothstep(s - 900.0, s + 1600.0, x);
  }
  if (uMode < 1.5) {
    float h = 0.0;
    for (int i = 0; i < ${SITE_N}; i++) {
      float age = clamp((uT - uSiteT[i]) / (1.0 - uSiteT[i]), 0.0, 1.0);
      float r = 120.0 + 3600.0 * pow(age, 1.6);
      vec2 d = p - uSite[i];
      h += step(0.0001, age) * exp(-dot(d, d) / (r * r));
    }
    crest = smoothstep(0.12, 0.35, h) * (1.0 - smoothstep(0.35, 0.7, h));
    return max(smoothstep(0.35, 0.75, h), smoothstep(0.82, 1.0, uT));
  }
  if (uMode < 2.5) {
    float d = length(p - uFocus);
    // Wide enough to cover the frame while the camera is still easing in.
    float r = mix(30.0, 6500.0, smoothstep(0.05, 0.5, uT));
    crest = 1.0 - smoothstep(r * 0.7, r, d);
    return smoothstep(0.5, 0.62, uT);
  }
  float m = 0.0;
  for (int i = 0; i < ${SITE_N}; i++) {
    float age = uT - uSiteT[i];
    float r = 40.0 + max(age, 0.0) * 2600.0;
    float d = length(p - uSite[i]);
    m = max(m, step(0.0, age) * (1.0 - smoothstep(r * 0.82, r, d)));
    crest = max(crest, step(0.0, age) * exp(-pow((d - r) / 55.0, 2.0)) * (1.0 - smoothstep(0.0, 0.3, age)));
  }
  return max(m, smoothstep(0.86, 0.98, uT));
}

float protectMask(vec2 frag) {
  if (uProtectOn < 0.5) return 0.0;
  vec2 lo = uProtect.xy, hi = uProtect.xy + uProtect.zw;
  vec2 f = vec2(110.0);
  float mx = smoothstep(lo.x - f.x, lo.x, frag.x) * (1.0 - smoothstep(hi.x, hi.x + f.x, frag.x));
  float my = smoothstep(lo.y - f.y, lo.y, frag.y) * (1.0 - smoothstep(hi.y, hi.y + f.y, frag.y));
  return mx * my;
}
`;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** transM's CPU twin, without the crest. */
export function transM(
  mode: number,
  t: number,
  x: number,
  y: number,
  sites: Float32Array,
  siteT: Float32Array,
  focus: [number, number],
) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (mode === 0) {
    const s = 7600 + -15200 * t;
    return smooth(s - 900, s + 1600, x * 0.94 + y * 0.34);
  }
  if (mode === 1) {
    let h = 0;
    for (let i = 0; i < SITE_N; i++) {
      const age = Math.min(1, Math.max(0, (t - siteT[i]) / (1 - siteT[i])));
      if (age <= 0.0001) continue;
      const r = 120 + 3600 * Math.pow(age, 1.6);
      const dx = x - sites[i * 2];
      const dy = y - sites[i * 2 + 1];
      h += Math.exp(-(dx * dx + dy * dy) / (r * r));
    }
    return Math.max(smooth(0.35, 0.75, h), smooth(0.82, 1, t));
  }
  if (mode === 2) return smooth(0.5, 0.62, t);
  let m = 0;
  for (let i = 0; i < SITE_N; i++) {
    const age = t - siteT[i];
    if (age < 0) continue;
    const r = 40 + age * 2600;
    const d = Math.hypot(x - sites[i * 2], y - sites[i * 2 + 1]);
    m = Math.max(m, 1 - smooth(r * 0.82, r, d));
  }
  void focus;
  return Math.max(m, smooth(0.86, 0.98, t));
}

/** The 16 businesses nearest a point, nearest first, and when each one
 *  starts: heat pools flare nearest first over the first quarter; rain
 *  lands scattered over the first 40%, seeded so it's the same every load. */
export function pickSites(biz: Float32Array, at: [number, number]) {
  const n = biz.length / 2;
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) =>
      (biz[a * 2] - at[0]) ** 2 +
      (biz[a * 2 + 1] - at[1]) ** 2 -
      ((biz[b * 2] - at[0]) ** 2 + (biz[b * 2 + 1] - at[1]) ** 2),
  );
  const sites = new Float32Array(SITE_N * 2);
  // Rain lands wider: every fourth of the 64 nearest, so drops fall across
  // the frame and not only behind the week's panel.
  const rainSites = new Float32Array(SITE_N * 2);
  const heatT = new Float32Array(SITE_N);
  const rainT = new Float32Array(SITE_N);
  let s = 0x2f6b1d3;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  for (let i = 0; i < SITE_N; i++) {
    const j = order[Math.min(order.length - 1, i)];
    sites[i * 2] = biz[j * 2];
    sites[i * 2 + 1] = biz[j * 2 + 1];
    const k = order[Math.min(order.length - 1, i * 4 + 1)];
    rainSites[i * 2] = biz[k * 2];
    rainSites[i * 2 + 1] = biz[k * 2 + 1];
    heatT[i] = (i / SITE_N) * 0.25;
    rainT[i] = 0.04 + rand() * 0.55;
  }
  return { sites, rainSites, heatT, rainT };
}
