// GLSL for the LA grid. One vocabulary, three passes: the ground (paper
// treatment, the USC glow, the pulse ring, a 1 km hairline graticule), the
// freeway ribbons, and every point of light (streets, businesses, packets,
// the agent and its trail, dissolving page blocks).

export const AGENT_N = 40;

const COMMON = /* glsl */ `
// The colour world, interpolated on the CPU from the chapter ramp in
// palette.ts. Roles, not hues: INK is the street light, SKY the data flow,
// CARD the hot USC and agent light, GOLD the warm wash.
//
// Two worlds at once: A is the world the city is leaving, B the one it is
// going to. A world change is a wavefront (wave.ts): each point takes B once
// the front, travelling out from the work along real streets, has reached
// it. uWaveR is the front's radius in the field's normalised distance.
uniform vec3 aStreet, aArt, aFlow, aHot, aHiCol, aWash, aGrid, aBg, aBg2;
uniform vec3 bStreet, bArt, bFlow, bHot, bHiCol, bWash, bGrid, bBg, bBg2;
uniform float aGain, bGain;
uniform sampler2D uWaveTex, uWaveSoft;
uniform float uWaveR, uWaveOn, uWaveUnit;
uniform vec3 uVia, uVia2;
vec3 uStreet, uArt, uFlow, uHot, uHiCol, uWash, uGrid, uBg, uBg2;
float uGain;
vec2 waveUv(vec2 p) { return (p + 6000.0) / 12000.0; }
bool outBox(vec2 uv) { return uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0; }
// Street distance at a point, sharp: the street points light by this one,
// so the front is the points themselves switching on in sequence.
float waveD(vec2 p) { vec2 uv = waveUv(p); return outBox(uv) ? 1.15 : texture2D(uWaveTex, uv).r; }
// The same, blurred over about 450 m: the ground fills in by this one.
float waveSoftD(vec2 p) { vec2 uv = waveUv(p); return outBox(uv) ? 1.15 : texture2D(uWaveSoft, uv).r; }
// A street point: 0 still in the old world, 1 reached. About 40 m wide.
float waveM(float d) { return uWaveOn < 0.5 ? 0.0 : 1.0 - smoothstep(uWaveR - 40.0 * uWaveUnit, uWaveR, d); }
// The ground follows 150 m behind the points and fades in over 500 m, so
// the blocks fill in after their streets with no hard edge at all.
float waveGround(float d) {
  if (uWaveOn < 0.5) return 0.0;
  float lag = 150.0 * uWaveUnit;
  return 1.0 - smoothstep(uWaveR - lag - 500.0 * uWaveUnit, uWaveR - lag, d);
}
// The crest, on street points only: about 70 m of the new world's hot
// light right at the front.
float waveCrest(float d) {
  if (uWaveOn < 0.5) return 0.0;
  float w = 70.0 * uWaveUnit;
  return exp(-pow((d - uWaveR + w * 0.5) / w, 2.0)) * step(-0.05, uWaveR) * step(uWaveR, 1.5);
}
void setWorld(float m) {
  uStreet = mix(aStreet, bStreet, m); uArt = mix(aArt, bArt, m); uFlow = mix(aFlow, bFlow, m);
  uHot = mix(aHot, bHot, m); uHiCol = mix(aHiCol, bHiCol, m); uWash = mix(aWash, bWash, m);
  uGrid = mix(aGrid, bGrid, m); uBg = mix(aBg, bBg, m); uBg2 = mix(aBg2, bBg2, m);
  uGain = mix(aGain, bGain, m);
}
#define INK uStreet
#define SKY uFlow
#define CARD uHot
#define GOLD uWash
float h1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float e3(float t) { t = clamp(t, 0.0, 1.0); return 1.0 - pow(1.0 - t, 3.0); }
float eio(float t) { t = clamp(t, 0.0, 1.0); return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }
// The data box is 12 km square; fading inside its last 1.7 km means no hard
// edge ever shows, at any zoom or tilt.
float boxFade(vec2 p) { return 1.0 - smoothstep(4300.0, 6000.0, max(abs(p.x), abs(p.y))); }
`;

/* ------------------------------------------------------------------ points */

export const pointVert = /* glsl */ `
${COMMON}
uniform float uTime, uNow, uLoad, uPulse, uStream, uHighlight, uDim, uExit, uPx, uDist, uMotion;
uniform vec2 uHi;
uniform float uDpr;
uniform vec3 uPointer; // world xy, radius in metres
uniform float uPointerAmt;
uniform vec2 uAgent[${AGENT_N}];
uniform float uAgentCount, uAgentOn;
attribute vec4 aMeta; // kind, seed, extra, extra
#ifdef BURST
attribute vec4 aStart; // world xyz the block was at, t0 in engine seconds
attribute vec3 aColor;
#endif
varying vec3 vColor;
varying float vAlpha;
varying float vShape;
varying float vLit;

void main() {
  float kind = aMeta.x;
  float seed = aMeta.y;
  vec2 p = position.xy;
  float wd = waveD(p);
  setWorld(waveM(wd));
  float wcrest = waveCrest(wd);
  float r = length(p);
  float edge = boxFade(p);
  float radial = mix(1.0, 0.5, smoothstep(1200.0, 6000.0, r));
  float r2 = h1(seed * 13.7 + 1.3);
  float r3 = h1(seed * 7.1 + 4.2);

  // Load clock: inner streets land first, each point on a cubic ease-out
  // from a scattered position up in the air.
  float delay = 0.04 + 0.42 * smoothstep(0.0, 7000.0, r) + 0.16 * r2;
  float lt = clamp((uLoad - delay) / 0.36, 0.0, 1.0);
  float le = e3(lt);
  float ang = seed * 43.98;
  vec3 start = vec3(p + vec2(cos(ang), sin(ang)) * (400.0 + 2400.0 * r2), 300.0 + 1900.0 * r3);

  vec3 world = vec3(p, 0.0);
  vec3 col = INK;
  float a = 0.0;
  float size = 1.5;
  float shape = 0.0;
  float lit = 0.0;
  float screenPx = 0.0;

  float s2 = clamp((uStream - 0.42) / 0.58, 0.0, 1.0);
  float pulseR = uPulse * 7800.0;
  float ring = exp(-pow((r - pulseR) / 420.0, 2.0)) * step(0.001, uPulse) * (1.0 - smoothstep(0.55, 1.0, uPulse));

  if (kind < 3.5) {
    // street sample, kind is the road class
    world = mix(start, world, le);
    col = mix(uStreet, uArt, kind / 3.0);
    a = min(1.0, (0.34 + 0.11 * kind) * uGain) * radial * edge * mix(0.16, 1.0, le);
    size = 1.45 + 0.3 * kind;
    // The pointer paints light: nearby points brighten and lean away from
    // it, then settle back as uPointerAmt decays.
    vec2 away = p - uPointer.xy;
    float pf = exp(-dot(away, away) / (uPointer.z * uPointer.z)) * uPointerAmt * le;
    world.xy += normalize(away + vec2(0.001)) * pf * uPointer.z * 0.22;
    world.z += pf * uPointer.z * 0.35;
    col = mix(col, SKY, pf * 0.85);
    a += pf * 0.5 * edge;
    size *= 1.0 + pf * 1.1;
    float flash = smoothstep(0.5, 0.9, lt) * (1.0 - smoothstep(0.9, 1.0, lt));
    col = mix(col, SKY, flash);
    a += flash * 0.35 * edge;
    a *= 1.0 + 0.14 * sin(uTime * 0.9 + seed * 61.0) * uMotion;
    // The ambient crest, after Lemma's lattice sweep: a soft band of sky
    // light crosses the city every 21 s while nobody touches anything.
    float q = dot(p, vec2(0.8, 0.6));
    float crest = mod(uTime * 900.0, 19000.0) - 9500.0;
    float sw = exp(-pow((q - crest) / 280.0, 2.0)) * uMotion * le;
    col = mix(col, SKY, sw * 0.75);
    a += sw * 0.28 * edge;
    size *= 1.0 + sw * 0.5;
    float near = exp(-r * r / (650.0 * 650.0));
    col = mix(col, CARD, near * (0.3 + 0.4 * clamp(uStream * 2.0, 0.0, 1.0)));
    col = mix(col, CARD, ring * 0.85);
    a += ring * 0.45 * edge;
    size *= 1.0 + ring * 0.9;
    // The front passing: each street point flares in the new world's hot
    // light as the work reaches it, then settles into the new colour.
    col = mix(col, bHot, wcrest * 0.9);
    a += wcrest * 0.7 * edge * le;
    size *= 1.0 + wcrest * 1.4;
  } else if (kind < 4.5) {
    // business: a faint ring until the agent's neighbourhood lights up
    world = mix(start, world, le);
    shape = 1.0;
    a = min(1.0, 0.26 * uGain) * edge * le;
    size = 3.4;
    float arrive = smoothstep(aMeta.w + 0.36, aMeta.w + 0.42, s2);
    col = mix(col, SKY, arrive);
    a = max(a, 0.75 * arrive * edge);
    size = max(size, 4.6 * arrive);
    float d = distance(p, uHi);
    float R = uHighlight * 1400.0;
    float h = smoothstep(R, R - 240.0, d) * step(0.001, uHighlight);
    col = mix(col, uHiCol, h);
    a = mix(a, 1.0, h);
    size = mix(size, 16.0, h);
    lit = max(h, arrive * 0.7);
    a += ring * 0.3 * edge;
  } else if (kind < 5.5) {
    // packet: light leaving USC on a low arc for one business
    float idx = aMeta.z;
    float u = (s2 - aMeta.w) / 0.4 - idx * 0.02;
    float vis = step(0.0, u) * step(u, 1.0);
    float e = eio(u);
    world = vec3(p * e, sin(3.14159 * clamp(u, 0.0, 1.0)) * min(r * 0.16, 650.0));
    col = SKY;
    a = vis * (1.0 - idx / 9.0) * 0.9 * edge;
    size = 2.8 - idx * 0.16;
  } else if (kind < 6.5) {
    // agent and trail
    int i = int(aMeta.z + 0.5);
    float fi = aMeta.z;
    world = vec3(uAgent[i], 0.0);
    float vis = step(fi, uAgentCount - 1.0) * uAgentOn;
    col = CARD;
    if (fi < 0.5) {
      shape = 2.0;
      a = vis;
      size = 40.0;
    } else {
      float f = 1.0 - fi / ${AGENT_N}.0;
      a = vis * pow(f, 1.4) * 0.85;
      size = 1.6 + 3.6 * f;
    }
  }
#ifdef BURST
  {
    float t = uNow - aStart.w;
    float dur = 1.6 + 0.7 * r2;
    float tt = clamp(t / dur, 0.0, 1.0);
    float e = eio(tt);
    vec3 side = vec3(cos(ang), sin(ang), 0.0) * sin(3.14159 * tt) * (30.0 + 70.0 * r3);
    world = mix(aStart.xyz, position, e) + side;
    col = mix(aColor, SKY, smoothstep(0.35, 0.7, tt));
    col = mix(col, INK, smoothstep(0.8, 1.0, tt));
    a = step(0.0, t) * step(t, dur) * smoothstep(0.0, 0.05, tt) * (1.0 - smoothstep(0.85, 1.0, tt));
    size = mix(3.8, 1.8, e);
    // A block's light is drawn in screen pixels: perspective would blow
    // points near the camera up into soft blobs.
    screenPx = 1.0;
  }
#endif

  // exit: each point dissolves at its own threshold, drifting up as it goes
  float ex = smoothstep(seed - 0.12, seed + 0.02, uExit * 1.14);
  world.z += ex * 260.0 * r3;
  a *= (1.0 - ex) * (1.0 - 0.72 * uDim);

  vec4 mv = modelViewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;
  float atten = clamp(uDist / max(-mv.z, 1.0), 0.4, 2.4);
  gl_PointSize = a < 0.003 ? 0.0 : max(1.0, screenPx > 0.5 ? size * uDpr : size * uPx * atten);
  vColor = col;
  vAlpha = a;
  vShape = shape;
  vLit = lit;
}
`;

export const pointFrag = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vShape;
varying float vLit;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d = length(c);
  float m;
  if (vShape < 0.5) {
    m = 1.0 - smoothstep(0.25, 1.0, d);
  } else if (vShape < 1.5) {
    // unlit: a hairline ring; lit: the same light as the agent, core and halo
    float ringM = (1.0 - smoothstep(0.0, 0.24, abs(d - 0.7))) * step(d, 1.0);
    float glowM = max(1.0 - smoothstep(0.16, 0.3, d), exp(-d * d * 7.0) * 0.4 * (1.0 - smoothstep(0.85, 1.0, d)));
    m = mix(ringM, glowM, clamp(vLit, 0.0, 1.0));
  } else {
    float core = 1.0 - smoothstep(0.1, 0.22, d);
    float halo = exp(-d * d * 5.0) * 0.55 * (1.0 - smoothstep(0.85, 1.0, d));
    m = max(core, halo);
  }
  float a = vAlpha * m;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vColor * a, a);
}
`;

/* ---------------------------------------------------------------- freeways */

export const lineVert = /* glsl */ `
uniform vec2 uHalfRes;
uniform float uPx, uStream;
attribute vec2 aDir;
attribute float aSide;
varying vec2 vP;
varying float vSide;
void main() {
  vec4 c0 = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 c1 = projectionMatrix * modelViewMatrix * vec4(position + vec3(aDir * 10.0, 0.0), 1.0);
  vec2 s0 = c0.xy / c0.w * uHalfRes;
  vec2 s1 = c1.xy / c1.w * uHalfRes;
  vec2 dir = s1 - s0;
  dir = length(dir) > 1e-4 ? normalize(dir) : vec2(1.0, 0.0);
  vec2 n = vec2(-dir.y, dir.x);
  float half_w = (4.0 + 2.5 * clamp(uStream * 3.0, 0.0, 1.0)) * uPx;
  c0.xy += n * aSide * half_w / uHalfRes * c0.w;
  gl_Position = c0;
  vP = position.xy;
  vSide = aSide;
}
`;

export const lineFrag = /* glsl */ `
${COMMON}
uniform float uTime, uLoad, uStream, uDim, uExit, uMotion;
varying vec2 vP;
varying float vSide;
void main() {
  float wd = waveD(vP);
  setWorld(waveM(wd));
  float r = length(vP);
  float edge = boxFade(vP);
  // drawn outward from USC late in the load clock
  float drawR = smoothstep(0.35, 1.0, uLoad) * 9000.0;
  float drawn = 1.0 - smoothstep(drawR - 500.0, drawR, r);
  float t = uTime * uMotion;
  // traffic of light, always flowing toward USC
  float flow = pow(0.5 + 0.5 * sin((r + t * 150.0) / 40.0), 12.0);
  float s1 = e3(clamp(uStream / 0.5, 0.0, 1.0));
  float on = step(0.001, uStream);
  float H = mix(7600.0, 0.0, s1);
  float lit = smoothstep(H - 40.0, H + 260.0, r) * on * (1.0 - 0.45 * smoothstep(0.5, 1.0, uStream));
  float head = exp(-pow((r - H) / 240.0, 2.0)) * on * (1.0 - s1 * 0.4);
  float fast = pow(0.5 + 0.5 * sin((r + t * 420.0) / 55.0), 6.0);
  vec3 col = mix(uArt, SKY, 0.65 + 0.35 * clamp(flow + lit, 0.0, 1.0));
  float a = 0.3 + 0.36 * flow + lit * (0.32 + 0.38 * fast) + head * 0.7;
  // a bright core about a third of the ribbon wide, inside a soft halo
  float across = abs(vSide);
  float prof = exp(-pow(across * 3.2, 2.0)) + 0.22 * exp(-pow(across * 1.5, 2.0));
  a *= edge * drawn * prof * (1.0 - smoothstep(0.85, 1.0, across));
  a = min(1.0, a * uGain) * (1.0 - uExit) * (1.0 - 0.72 * uDim);
  if (a < 0.003) discard;
  gl_FragColor = vec4(col * a, a);
}
`;

/* ------------------------------------------------------------------ ground */

export const groundVert = /* glsl */ `
varying vec2 vP;
void main() {
  vP = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const groundFrag = /* glsl */ `
${COMMON}
uniform float uLoad, uPulse, uStream, uDim, uExit, uTime, uMotion;
varying vec2 vP;
vec4 over(vec4 dst, vec3 c, float a) { return vec4(c * a + dst.rgb * (1.0 - a), a + dst.a * (1.0 - a)); }
void main() {
  float wd = waveSoftD(vP);
  float m = waveGround(wd);
  setWorld(m);
  float r = length(vP);
  float k = (1.0 - uExit) * (1.0 - 0.6 * uDim);
  // The ground is the colour world itself: a radial lift toward USC, so the
  // field is never one flat fill. Across the front it passes through the
  // segment's waypoint colour (palette.ts VIA), never a straight mix: a
  // straight mix of night and dawn is the grey the H1 washed out on.
  float rr = smoothstep(0.0, 9000.0, r);
  vec3 ga = mix(aBg2, aBg, rr);
  vec3 gb = mix(bBg2, bBg, rr);
  vec3 gv = mix(uVia2, uVia, rr);
  vec4 o = vec4(m < 0.5 ? mix(ga, gv, m * 2.0) : mix(gv, gb, m * 2.0 - 1.0), 1.0);
  float breathe = 1.0 + 0.06 * sin(uTime * 0.7) * uMotion;
  float glow = exp(-r * r / (1900.0 * 1900.0)) * (0.10 + 0.08 * clamp(uStream * 2.0, 0.0, 1.0)) * breathe;
  o = over(o, GOLD, glow * smoothstep(0.0, 0.6, uLoad) * k);
  // 1 km hairline graticule, a system readout under the city
  vec2 g = vP / 1000.0;
  vec2 gw = fwidth(g);
  vec2 gl = abs(fract(g - 0.5) - 0.5) / max(gw, vec2(1e-5));
  float line = 1.0 - min(min(gl.x, gl.y), 1.0);
  float fade = 1.0 - smoothstep(2000.0, 7500.0, r);
  o = over(o, uGrid, line * 0.09 * fade * smoothstep(0.3, 0.9, uLoad) * k);
  float core = exp(-r * r / (85.0 * 85.0)) * (0.45 + 0.35 * clamp(uStream * 2.0, 0.0, 1.0)) * breathe;
  o = over(o, CARD, core * smoothstep(0.0, 0.4, uLoad) * k);
  float pulseR = uPulse * 7800.0;
  float ring = exp(-pow((r - pulseR) / 60.0, 2.0)) * step(0.001, uPulse) * (1.0 - smoothstep(0.5, 1.0, uPulse));
  o = over(o, CARD, ring * 0.45 * k);
  // A soft wake of the new world's wash just behind the street points; the
  // bright crest itself lives on the points, never as a line on the ground.
  float lead = uWaveR - wd;
  float wake = uWaveOn < 0.5 ? 0.0 : smoothstep(0.0, 200.0 * uWaveUnit, lead) * exp(-max(0.0, lead) / (600.0 * uWaveUnit)) * (1.0 - m * 0.5);
  o = over(o, bWash, wake * 0.12 * boxFade(vP));
  gl_FragColor = o;
}
`;
