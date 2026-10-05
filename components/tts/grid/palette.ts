// The chapter colour ramp. grid.world moves continuously along it (0..4) and
// every role interpolates, so a chapter change is a change of light, never a
// seam. Roles: bg/bg2 the ground (edge/centre), street/art the residential
// and arterial light, flow the data (freeways, packets, sweeps), hot USC and
// the agent, hi the worth-reaching businesses, wash the glow, grid the
// graticule, gain how hard points print on this ground.
// The wash stays in the ground's own family: gold over navy or sky measured
// as a grey patch around USC.

export interface ColourWorld {
  name: string;
  bg: string;
  bg2: string;
  street: string;
  art: string;
  flow: string;
  hot: string;
  hi: string;
  wash: string;
  grid: string;
  gain: number;
}

export const WORLDS: ColourWorld[] = [
  // 0 opening: LA at night from above
  { name: "night", bg: "#0d1020", bg2: "#1b2140", street: "#ffcc00", art: "#ffe39a", flow: "#5fa8e0", hot: "#d0102e", hi: "#ffcc00", wash: "#3a55b0", grid: "#ffffff", gain: 1.5 },
  // 1 stream into partners: dawn over the basin
  { name: "dawn", bg: "#5fa8e0", bg2: "#bfe0f7", street: "#ffffff", art: "#ffffff", flow: "#ffffff", hot: "#990000", hi: "#ffcc00", wash: "#d8ecfa", grid: "#ffffff", gain: 1.7 },
  // 2 finding customers: a full cardinal field
  { name: "cardinal", bg: "#990000", bg2: "#b3122a", street: "#fbf3e0", art: "#fff4d6", flow: "#ffe39a", hot: "#ffffff", hi: "#ffcc00", wash: "#c41e3a", grid: "#fbf3e0", gain: 1.45 },
  // 3 the week: warm cream, calm, so the panel reads
  { name: "cream", bg: "#fff4d6", bg2: "#fffaf0", street: "#1a1416", art: "#1a1416", flow: "#5fa8e0", hot: "#990000", hi: "#990000", wash: "#ffcc00", grid: "#1a1416", gain: 1.0 },
  // 4 join: back to cardinal, deep and saturated
  { name: "join", bg: "#6e0010", bg2: "#990000", street: "#fbf3e0", art: "#fff4d6", flow: "#ffe39a", hot: "#ffffff", hi: "#ffcc00", wash: "#b3122a", grid: "#fbf3e0", gain: 1.3 },
];

type Rgb = [number, number, number];

// The ground passes through a saturated waypoint halfway through each world
// change. Interpolating straight across, navy to sky measured #40556c at the
// midpoint in OKLab and about #9aa3ad in sRGB: grey mud the H1 washed out on.
// Each waypoint keeps every in-between frame rich (see VIA_CHROMA_FLOOR).
const VIA: { bg: string; bg2: string }[] = [
  { bg: "#1b3a8f", bg2: "#2f5fc0" }, // night to dawn: deep blue
  { bg: "#5b3fa6", bg2: "#8a5cc4" }, // dawn to cardinal: violet
  { bg: "#c8304f", bg2: "#e06a83" }, // cardinal to cream: rose
  { bg: "#c8304f", bg2: "#b3122a" }, // cream to join: rose into cardinal
];

// Roles interpolate in OKLab. Straight sRGB from cardinal to cream passes
// through #cc7a6b, a salmon that reads as orange, which the brief bans;
// OKLab keeps the midpoint on the pink side of the cardinal hue.
const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function srgbToOklab([r, g, b]: Rgb): Rgb {
  const R = toLin(r), G = toLin(g), B = toLin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function oklabToSrgb([L, A, Bb]: Rgb, out: Rgb): Rgb {
  const l = (L + 0.3963377774 * A + 0.2158037573 * Bb) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * Bb) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * Bb) ** 3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  out[0] = Math.min(1, Math.max(0, toSrgb(Math.max(0, R))));
  out[1] = Math.min(1, Math.max(0, toSrgb(Math.max(0, G))));
  out[2] = Math.min(1, Math.max(0, toSrgb(Math.max(0, B))));
  return out;
}
const parse = (hex: string): Rgb => {
  const n = parseInt(hex.slice(1), 16);
  return srgbToOklab([((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]);
};
const PARSED = WORLDS.map((w) => ({
  bg: parse(w.bg),
  bg2: parse(w.bg2),
  street: parse(w.street),
  art: parse(w.art),
  flow: parse(w.flow),
  hot: parse(w.hot),
  hi: parse(w.hi),
  wash: parse(w.wash),
  grid: parse(w.grid),
  gain: w.gain,
}));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const VIA_PARSED = VIA.map((v) => ({ bg: parse(v.bg), bg2: parse(v.bg2) }));

/** OKLCh chroma of a role at a world position, for the no-grey check. */
export function worldChroma(world: number, role: ColourRole) {
  const lab = srgbToOklab(worldColour(world, role, [0, 0, 0]));
  return Math.hypot(lab[1], lab[2]);
}

export type ColourRole = Exclude<keyof (typeof PARSED)[number], "gain">;
export const ROLES: ColourRole[] = ["bg", "bg2", "street", "art", "flow", "hot", "hi", "wash", "grid"];

/** Interpolated colour for a role at a fractional world position. */
export function worldColour(world: number, role: ColourRole, out: Rgb): Rgb {
  const w = Math.min(WORLDS.length - 1, Math.max(0, world));
  const i = Math.min(WORLDS.length - 2, Math.floor(w));
  const k = w - i;
  const a = PARSED[i][role];
  const b = PARSED[i + 1][role];
  if (role === "bg" || role === "bg2") {
    const v = VIA_PARSED[i][role];
    const [p, q, u] = k < 0.5 ? [a, v, k * 2] : [v, b, (k - 0.5) * 2];
    // Lightness moves linearly; hue and chroma stay with the more saturated
    // end longer. Rose to cream measured #f9cfb9, a peach, at 90% without it;
    // a square hold still left bg2 at #ffd7d8, chroma 0.044, so it's cubic.
    const cp = Math.hypot(p[1], p[2]);
    const cq = Math.hypot(q[1], q[2]);
    const w = cq < cp ? u * u * u : 1 - (1 - u) ** 3;
    return oklabToSrgb([p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * w, p[2] + (q[2] - p[2]) * w], out);
  }
  // Light roles switch over the middle 40% of a segment, so points spend as
  // little scroll as possible the same tone as the ground they sit on.
  const t = smoothstep(0.3, 0.7, k);
  // Chroma dips toward a segment's middle: cardinal to cream measured
  // #d3886f at k = 0.5 without it, a peach; with it, a muted rose.
  // Only where the hue actually turns: night to dawn stays blue throughout
  // and keeps its chroma.
  const ca = Math.hypot(a[1], a[2]);
  const cb = Math.hypot(b[1], b[2]);
  const turn = ca > 0.02 && cb > 0.02 ? Math.acos(Math.max(-1, Math.min(1, (a[1] * b[1] + a[2] * b[2]) / (ca * cb)))) : 0;
  const c = 1 - 0.65 * Math.min(1, turn / 1.0) * Math.sin(Math.PI * t);
  return oklabToSrgb([a[0] + (b[0] - a[0]) * t, (a[1] + (b[1] - a[1]) * t) * c, (a[2] + (b[2] - a[2]) * t) * c], out);
}

export function worldGain(world: number) {
  const w = Math.min(WORLDS.length - 1, Math.max(0, world));
  const i = Math.min(WORLDS.length - 2, Math.floor(w));
  return PARSED[i].gain + (PARSED[i + 1].gain - PARSED[i].gain) * (w - i);
}

const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
/** WCAG relative luminance of the ground at this world. */
export function groundLuminance(world: number) {
  const a: Rgb = [0, 0, 0];
  const b: Rgb = [0, 0, 0];
  worldColour(world, "bg", a);
  worldColour(world, "bg2", b);
  const c = [0, 1, 2].map((i) => (a[i] + b[i]) / 2);
  return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
}

// Ink (#1a1416) and white text reach equal contrast on a ground of relative
// luminance 0.179; above it ink reads better, below it white does.
export const isDarkWorld = (world: number) => groundLuminance(world) < 0.179;
