/* The mesh gradient: a few coloured points drifting on slow orbits, blended
 * by inverse distance, with the plane warped and twisted before the blend and
 * a fine grain on top. One small WebGL canvas per use.
 *
 * Ported to TypeScript from our own lemma-replica engine
 * (src/sections/mesh-gradient.js), recoloured for TTS. The shader maths, the
 * orbit rule and the banked clock are unchanged from the replica, where they
 * were checked against an idle sweep of the reference.
 *
 * Returns a cleanup function, or null when WebGL is unavailable, in which case
 * nothing is added to the DOM and the host keeps its CSS background. */

export interface MeshOptions {
  colors: string[];
  speed?: number;
  distortion?: number;
  swirl?: number;
  grainMixer?: number;
  grainOverlay?: number;
  /** Backing px per CSS px ceiling. A full-viewport background runs at 1. */
  maxDpr?: number;
}

const ORBITS = [0, 1, 2, 3, 4].map((i) => [
  0.6 + (i % 3) * 0.3,
  0.8 + ((i + 1) % 4) * 0.25,
  0.37 * i,
  0.555 * i,
]);
const MAX_POINTS = ORBITS.length;
// One 4K frame, the replica's cap on the backing store.
const MAX_PIXELS = 8294400;
// The replica's phase offset, so the first frame is already mid-drift.
const PHASE0 = 0.5 * 41.5;

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_phase;
uniform vec3 u_col[${MAX_POINTS}];
uniform vec4 u_orbit[${MAX_POINTS}];
uniform float u_count;
uniform float u_warp;
uniform float u_twist;
uniform float u_jitter;
uniform float u_speckle;
uniform float u_grain;

float h2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 c = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = h2(c);
  float b = h2(c + vec2(1.0, 0.0));
  float d = h2(c + vec2(0.0, 1.0));
  float e = h2(c + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(d, e, f.x), f.y);
}

void main() {
  /* Fit contain: the unit square spans the shorter side, centred, and the
     longer side runs past 0..1. */
  float side = min(u_res.x, u_res.y);
  vec2 px = gl_FragCoord.xy - 0.5 * u_res;
  /* y runs UP, as gl_FragCoord does and as theirs does. Ours was flipped,
     which mirrored the whole field top to bottom against theirs. */
  vec2 p = px / side + 0.5;

  float grain = vnoise(px * u_grain);
  float nudge = 0.4 * u_jitter * (grain - 0.5);

  float t = u_phase;
  float r = smoothstep(0.0, 1.0, length(p - 0.5));
  float pull = 1.0 - r;

  /* Two passes of centre-weighted warp, the second half the first. The
     three inner frequencies (.4, 2.4, 2.0) are theirs from lazy chunk 8408;
     ours were .45, 2.3 and 1.9, close enough to look alike in a still and
     far enough apart that the fold drifted off theirs within seconds. */
  for (int k = 1; k <= 2; k++) {
    float fk = float(k);
    float sy = smoothstep(0.0, 1.0, p.y);
    p.x += u_warp * pull / fk * sin(t + fk * 0.4 * sy) * cos(0.2 * t + fk * 2.4 * sy);
    float sx = smoothstep(0.0, 1.0, p.x);
    p.y += u_warp * pull / fk * cos(t + fk * 2.0 * sx);
  }

  /* Twist grows with distance from the centre. */
  float ang = -3.0 * u_twist * r;
  vec2 q = p - 0.5;
  q = mat2(cos(ang), sin(ang), -sin(ang), cos(ang)) * q + 0.5;

  vec3 acc = vec3(0.0);
  float wsum = 0.0;
  for (int i = 0; i < ${MAX_POINTS}; i++) {
    if (float(i) >= u_count) break;
    vec4 o = u_orbit[i];
    vec2 at = 0.5 + 0.5 * vec2(sin(t * o.x + o.z), cos(t * o.y + o.w)) + nudge;
    float d = pow(length(q - at), 3.5);
    float w = 1.0 / (d + 0.001);
    acc += u_col[i] * w;
    wsum += w;
  }
  vec3 col = acc / wsum;

  vec3 speck = vec3(
    vnoise(px * u_grain + vec2(13.0, 7.0)),
    vnoise(px * u_grain + vec2(-5.0, 29.0)),
    vnoise(px * u_grain + vec2(41.0, -3.0))
  );
  col = mix(col, speck, 0.01 + 0.3 * u_speckle);
  gl_FragColor = vec4(col, 1.0);
}
`;


function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export function attachMesh(host: HTMLElement, options: MeshOptions) {
  const o = {
    speed: 0.4,
    distortion: 4,
    swirl: 1.2,
    grainMixer: 0.5,
    grainOverlay: 0.25,
    maxDpr: 2,
    ...options,
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.createElement("canvas");
  canvas.className = "mesh-canvas";
  canvas.setAttribute("aria-hidden", "true");

  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
  } catch {
    gl = null;
  }
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const loc = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const g = gl;
  const U = (n: string) => g.getUniformLocation(program, n);
  const uRes = U("u_res"),
    uPhase = U("u_phase"),
    uGrain = U("u_grain");
  const colors = o.colors.slice(0, MAX_POINTS);
  g.uniform3fv(U("u_col"), new Float32Array(colors.flatMap(hexToRgb)));
  g.uniform4fv(U("u_orbit"), new Float32Array(ORBITS.flat()));
  g.uniform1f(U("u_count"), colors.length);
  g.uniform1f(U("u_warp"), o.distortion);
  g.uniform1f(U("u_twist"), o.swirl);
  g.uniform1f(U("u_jitter"), o.grainMixer);
  g.uniform1f(U("u_speckle"), o.grainOverlay);
  host.appendChild(canvas);

  let elapsed = 0,
    scale = 1,
    last = 0,
    raf = 0,
    onScreen = false,
    dead = false;
  const phase = () => PHASE0 + 0.5 * 0.001 * elapsed * o.speed;
  const draw = () => {
    g.uniform1f(uGrain, (0.7 * 2) / scale);
    g.viewport(0, 0, canvas.width, canvas.height);
    g.uniform2f(uRes, canvas.width, canvas.height);
    g.uniform1f(uPhase, phase());
    g.drawArrays(g.TRIANGLES, 0, 6);
  };
  const size = () => {
    const r = host.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    let w = r.width * dpr,
      h = r.height * dpr;
    const k = Math.min(1, Math.sqrt(MAX_PIXELS / (w * h)));
    w = Math.max(1, Math.round(w * k));
    h = Math.max(1, Math.round(h * k));
    scale = w / r.width;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return true;
  };
  const running = () => !reduced && onScreen && !document.hidden && !dead;
  const frame = (now: number) => {
    raf = 0;
    if (dead) return;
    if (last) elapsed += now - last;
    last = now;
    draw();
    if (running()) raf = requestAnimationFrame(frame);
  };
  const update = () => {
    if (running()) {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  const still = () => {
    if (!dead && size()) draw();
  };
  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      if (onScreen) still();
      update();
    },
    { rootMargin: "100px 0px" },
  );
  io.observe(host);
  const ro = new ResizeObserver(still);
  ro.observe(host);
  document.addEventListener("visibilitychange", update);
  const onLost = (e: Event) => {
    e.preventDefault();
    teardown();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  still();

  function teardown() {
    if (dead) return;
    dead = true;
    if (raf) cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", update);
    canvas.removeEventListener("webglcontextlost", onLost);
    if (!g.isContextLost()) {
      g.deleteBuffer(buf);
      g.deleteProgram(program);
      g.deleteShader(vs);
      g.deleteShader(fs);
    }
    canvas.remove();
  }
  return teardown;
}
