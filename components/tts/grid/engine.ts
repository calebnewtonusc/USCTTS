import * as THREE from "three";
import {
  buildRail,
  planRoute,
  railAt,
  routeAt,
  type GridData,
  type Route,
} from "./data";
import {
  AGENT_N,
  groundFrag,
  groundVert,
  lineFrag,
  lineVert,
  pointFrag,
  pointVert,
} from "./shaders";
import { isDarkWorld, ROLES, viaColour, worldColour, worldGain, WORLDS, type ColourRole } from "./palette";
import { buildWave, OUTSIDE, sampleWave, WAVE_N, waveRadius, type WaveField } from "./wave";
import { grid, KOREATOWN, type GridMode } from "./store";

const PAPER = 0xfbfaf7;
const FOV = 30;
// Vertical field of the camera reaches 15 degrees off its axis, so 62 degrees
// of pitch puts the top ray at 77: the far basin shows without a horizon.
const MAX_PITCH = (62 * Math.PI) / 180;
// Metres spanned by the viewport's long side at zoom 1. 9 km on a 1440 wide
// screen is 6.25 m/px, so 25 m street samples sit 4 px apart and read as
// lines; on a phone 6.5 km keeps the same density instead of grey mush.
const SPAN_LANDSCAPE = 9000;
const SPAN_PORTRAIT = 6500;
const BURST_POOL = 6000;
// Pixels of a dissolving block per spawned point; a 300 x 40 block becomes 150.
const BURST_DENSITY = 80;
// Camera follow rate per second. 2.6 settles 90% in under a second, slow
// enough that a chapter change reads as a move, never a cut.
const CAMERA_RATE = 2.6;
// Store values the page writes are followed at this rate per second, so a
// discrete write never teleports a single point.
const FOLLOW_RATE = 10;
// When nothing is changing, ambient flow renders at 30 fps.
const IDLE_FRAME_MS = 1000 / 30;
// A colour world follows at 3/s, a little behind geometry: a chapter's light
// arrives over about a second of scroll settle. At 1.8/s a parked frame 1.1 s
// after a jump was still 13% cardinal over cream, a peach.
const WORLD_RATE = 3;
// Painted pointer light fades out over 1.2 s after the hand stops.
const POINTER_DECAY_S = 1.2;

interface Pose {
  x: number;
  y: number;
  zoom: number;
  tilt: number;
  yaw: number;
}

export interface GridEngine {
  dispose: () => void;
}

function hexToRgb(hex: string | undefined): [number, number, number] {
  const m = hex && /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return [0.102, 0.078, 0.086];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function createGridEngine(
  canvas: HTMLCanvasElement,
  data: GridData,
): GridEngine {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(PAPER, 1);
  const clear = new THREE.Color();
  const rgb: [number, number, number] = [0, 0, 0];
  const roleUniform: Record<ColourRole, string> = {
    bg: "Bg",
    bg2: "Bg2",
    street: "Street",
    art: "Art",
    flow: "Flow",
    hot: "Hot",
    hi: "HiCol",
    wash: "Wash",
    grid: "Grid",
  };
  const roleSet = (p: "a" | "b") =>
    Object.fromEntries(
      Object.values(roleUniform).map((n) => [p + n, { value: new THREE.Vector3() }]),
    ) as Record<string, { value: THREE.Vector3 }>;
  let pointerX = 0;
  let pointerY = 0;
  let pointerFresh = false;
  let pointerAmt = 0;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 200000);

  const uniforms = {
    uTime: { value: 0 },
    uNow: { value: 0 },
    uLoad: { value: 0 },
    uPulse: { value: 0 },
    uStream: { value: 0 },
    uHighlight: { value: 0 },
    uDim: { value: 0 },
    uExit: { value: 0 },
    uPx: { value: 1 },
    uDist: { value: 1 },
    uMotion: { value: reduced ? 0 : 1 },
    uHi: { value: new THREE.Vector2() },
    uAgent: {
      value: Array.from({ length: AGENT_N }, () => new THREE.Vector2()),
    },
    uAgentCount: { value: 0 },
    uAgentOn: { value: 0 },
    uHalfRes: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector3(0, 0, 300) },
    uPointerAmt: { value: 0 },
    uDpr: { value: 1 },
    aGain: { value: 1 },
    bGain: { value: 1 },
    ...roleSet("a"),
    ...roleSet("b"),
    uVia: { value: new THREE.Vector3() },
    uVia2: { value: new THREE.Vector3() },
    uWaveTex: { value: null as THREE.Texture | null },
    uWaveR: { value: 0 },
    uWaveOn: { value: 0 },
  };
  const matOpts = {
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    premultipliedAlpha: true,
    blending: THREE.NormalBlending,
    // Ribbons are built without a winding convention; never cull them.
    side: THREE.DoubleSide,
  };

  /* ---------------------------------------------------------- ground */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60000, 60000),
    new THREE.ShaderMaterial({
      ...matOpts,
      vertexShader: groundVert,
      fragmentShader: groundFrag,
    }),
  );
  ground.renderOrder = 0;
  ground.frustumCulled = false;
  scene.add(ground);

  /* -------------------------------------------------------- freeways */
  {
    const nv = data.fwyPos.length / 2;
    const pos = new Float32Array(nv * 2 * 3);
    const dir = new Float32Array(nv * 2 * 2);
    const side = new Float32Array(nv * 2);
    const index: number[] = [];
    for (const l of data.fwyLines) {
      for (let k = 0; k < l.count; k++) {
        const i = l.start + k;
        const a = Math.max(l.start, i - 1);
        const b = Math.min(l.start + l.count - 1, i + 1);
        let dx = data.fwyPos[b * 2] - data.fwyPos[a * 2];
        let dy = data.fwyPos[b * 2 + 1] - data.fwyPos[a * 2 + 1];
        const dl = Math.hypot(dx, dy) || 1;
        dx /= dl;
        dy /= dl;
        for (let s = 0; s < 2; s++) {
          const v = i * 2 + s;
          pos[v * 3] = data.fwyPos[i * 2];
          pos[v * 3 + 1] = data.fwyPos[i * 2 + 1];
          dir[v * 2] = dx;
          dir[v * 2 + 1] = dy;
          side[v] = s === 0 ? -1 : 1;
        }
        if (k > 0) {
          const p0 = (i - 1) * 2;
          const p1 = i * 2;
          index.push(p0, p0 + 1, p1, p1, p0 + 1, p1 + 1);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aDir", new THREE.BufferAttribute(dir, 2));
    g.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
    g.setIndex(index);
    const lines = new THREE.Mesh(
      g,
      new THREE.ShaderMaterial({
        ...matOpts,
        vertexShader: lineVert,
        fragmentShader: lineFrag,
      }),
    );
    lines.renderOrder = 1;
    lines.frustumCulled = false;
    scene.add(lines);
  }

  /* ---------------------------------------------------------- points */
  {
    const nStreet = data.streets.length / 2;
    const nBiz = data.biz.length / 2;
    const PACKET_TRAIL = 9;
    const total = nStreet + nBiz + nBiz * PACKET_TRAIL + AGENT_N;
    const pos = new Float32Array(total * 3);
    const meta = new Float32Array(total * 4);
    let v = 0;
    const put = (
      x: number,
      y: number,
      kind: number,
      seed: number,
      e1 = 0,
      e2 = 0,
    ) => {
      pos[v * 3] = x;
      pos[v * 3 + 1] = y;
      meta[v * 4] = kind;
      meta[v * 4 + 1] = seed;
      meta[v * 4 + 2] = e1;
      meta[v * 4 + 3] = e2;
      v++;
    };
    // Seeds come from a fixed sequence so the scatter is identical on every load.
    let s = 0x9e3779b9;
    const rand = () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return (s >>> 0) / 4294967296;
    };
    for (let i = 0; i < nStreet; i++)
      put(
        data.streets[i * 2],
        data.streets[i * 2 + 1],
        data.streetClass[i],
        rand(),
      );
    const bizDelay: number[] = [];
    for (let i = 0; i < nBiz; i++) {
      const x = data.biz[i * 2];
      const y = data.biz[i * 2 + 1];
      // Packets leave USC nearest first, a wave rolling outward.
      const delay = 0.5 * Math.min(1, Math.hypot(x, y) / 6000) + 0.08 * rand();
      bizDelay.push(delay);
      put(x, y, 4, rand(), data.bizKind[i], delay);
    }
    for (let i = 0; i < nBiz; i++)
      for (let k = 0; k < PACKET_TRAIL; k++)
        put(data.biz[i * 2], data.biz[i * 2 + 1], 5, rand(), k, bizDelay[i]);
    for (let i = 0; i < AGENT_N; i++) put(0, 0, 6, rand(), i, 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aMeta", new THREE.BufferAttribute(meta, 4));
    const pts = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        ...matOpts,
        vertexShader: pointVert,
        fragmentShader: pointFrag,
      }),
    );
    pts.renderOrder = 2;
    pts.frustumCulled = false;
    scene.add(pts);
  }

  /* ---------------------------------------------------------- bursts */
  const bPos = new Float32Array(BURST_POOL * 3);
  const bMeta = new Float32Array(BURST_POOL * 4);
  const bStart = new Float32Array(BURST_POOL * 4).fill(-1e6);
  const bColor = new Float32Array(BURST_POOL * 3);
  for (let i = 0; i < BURST_POOL; i++) {
    bMeta[i * 4] = 7;
    bMeta[i * 4 + 1] = (i * 0.61803398875) % 1;
  }
  const bGeom = new THREE.BufferGeometry();
  const bPosAttr = new THREE.BufferAttribute(bPos, 3).setUsage(
    THREE.DynamicDrawUsage,
  );
  const bStartAttr = new THREE.BufferAttribute(bStart, 4).setUsage(
    THREE.DynamicDrawUsage,
  );
  const bColorAttr = new THREE.BufferAttribute(bColor, 3).setUsage(
    THREE.DynamicDrawUsage,
  );
  bGeom.setAttribute("position", bPosAttr);
  bGeom.setAttribute("aMeta", new THREE.BufferAttribute(bMeta, 4));
  bGeom.setAttribute("aStart", bStartAttr);
  bGeom.setAttribute("aColor", bColorAttr);
  const burstPts = new THREE.Points(
    bGeom,
    new THREE.ShaderMaterial({
      ...matOpts,
      vertexShader: pointVert,
      fragmentShader: pointFrag,
      defines: { BURST: "" },
    }),
  );
  burstPts.renderOrder = 3;
  burstPts.frustumCulled = false;
  scene.add(burstPts);
  let burstHead = 0;
  let burstLiveUntil = -1;

  // Street lookup for where a dissolving block's light lands: 200 m cells.
  const CELL = 200;
  const cells = new Map<number, number[]>();
  const cellKey = (cx: number, cy: number) => (cx + 100) * 1000 + (cy + 100);
  for (let i = 0; i < data.streets.length / 2; i++) {
    const k = cellKey(
      Math.floor(data.streets[i * 2] / CELL),
      Math.floor(data.streets[i * 2 + 1] / CELL),
    );
    let list = cells.get(k);
    if (!list) cells.set(k, (list = []));
    list.push(i);
  }
  const nearestStreet = (
    x: number,
    y: number,
    jitter: number,
  ): [number, number] => {
    const cx = Math.floor(x / CELL);
    const cy = Math.floor(y / CELL);
    const cand: number[] = [];
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
        const list = cells.get(cellKey(cx + dx, cy + dy));
        if (list) for (const i of list) cand.push(i);
      }
    if (!cand.length) return [x, y];
    cand.sort(
      (a, b) =>
        (data.streets[a * 2] - x) ** 2 +
        (data.streets[a * 2 + 1] - y) ** 2 -
        ((data.streets[b * 2] - x) ** 2 + (data.streets[b * 2 + 1] - y) ** 2),
    );
    const pick = cand[Math.min(cand.length - 1, Math.floor(jitter * 6))];
    return [data.streets[pick * 2], data.streets[pick * 2 + 1]];
  };

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const landHit = new THREE.Vector3();
  let t0Wall = performance.now();

  function spawnBursts() {
    if (!grid.bursts.length) return;
    const list = grid.bursts.splice(0, grid.bursts.length);
    const w = window.innerWidth;
    const h = window.innerHeight;
    let lo = Infinity;
    let hi = -Infinity;
    for (const b of list) {
      const n = Math.max(
        16,
        Math.min(900, Math.round((b.w * b.h) / BURST_DENSITY)),
      );
      const [cr, cg, cb] = hexToRgb(b.color);
      const tStart = (b.t0 - t0Wall) / 1000;
      for (let k = 0; k < n; k++) {
        const u = Math.random();
        const vv = Math.random();
        const sx = b.x + u * b.w;
        const sy = b.y + vv * b.h;
        ndc.set((sx / w) * 2 - 1, -(sy / h) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        if (!ray.ray.intersectPlane(groundPlane, hit)) continue;
        const slot = burstHead;
        burstHead = (burstHead + 1) % BURST_POOL;
        const camPos = camera.position;
        // Start on the same pixel, 45% of the way down the view ray, so the
        // block's light begins exactly where the block was.
        bStart[slot * 4] = camPos.x + (hit.x - camPos.x) * 0.45;
        bStart[slot * 4 + 1] = camPos.y + (hit.y - camPos.y) * 0.45;
        bStart[slot * 4 + 2] = camPos.z + (hit.z - camPos.z) * 0.45;
        // Left to right wipe across the block, plus a little scatter.
        bStart[slot * 4 + 3] = tStart + u * 0.28 + Math.random() * 0.12;
        // Land somewhere the eye can follow: out of the block and up over the
        // field (a DOM panel usually still covers the block's own pixels),
        // snapped to a real street sample.
        ndc.set(
          ((sx + (u - 0.5) * b.w * 0.5 + (Math.random() - 0.5) * 240) / w) * 2 - 1,
          -((sy - 70 - Math.random() * 320) / h) * 2 + 1,
        );
        ray.setFromCamera(ndc, camera);
        const land = ray.ray.intersectPlane(groundPlane, landHit) ?? hit;
        const [ex, ey] = nearestStreet(land.x, land.y, Math.random());
        bPos[slot * 3] = ex;
        bPos[slot * 3 + 1] = ey;
        bPos[slot * 3 + 2] = 0;
        bColor[slot * 3] = cr;
        bColor[slot * 3 + 1] = cg;
        bColor[slot * 3 + 2] = cb;
        lo = Math.min(lo, slot);
        hi = Math.max(hi, slot);
      }
      burstLiveUntil = Math.max(burstLiveUntil, tStart + 2.8);
    }
    if (hi >= lo) {
      // A wrap inside one frame makes lo..hi the whole pool, which is correct.
      for (const [attr, size] of [
        [bPosAttr, 3],
        [bStartAttr, 4],
        [bColorAttr, 3],
      ] as const) {
        attr.clearUpdateRanges();
        attr.addUpdateRange(lo * size, (hi - lo + 1) * size);
        attr.needsUpdate = true;
      }
    }
  }

  /* ---------------------------------------------------------- camera */
  const rail = buildRail(data);
  const pose: Pose = {
    x: grid.camera.x,
    y: grid.camera.y,
    zoom: grid.camera.zoom,
    tilt: grid.camera.tilt,
    yaw: 0,
  };
  let poseInit = false;

  function targetPose(mode: GridMode, time: number, follow: Follow): Pose {
    const c = grid.camera;
    switch (mode) {
      case "basin":
        return {
          x: c.x,
          y: c.y,
          zoom: c.zoom * 0.8,
          tilt: Math.max(c.tilt, 0.55),
          yaw: reduced ? 0 : 0.14 * Math.sin(time * 0.05),
        };
      case "freeway": {
        // Northbound on the 110 from the south edge, arriving at USC as the
        // stream finishes; the camera sits low and looks up the road.
        const y = -5600 + 5900 * follow.stream;
        const r = railAt(rail, y);
        const ahead = railAt(rail, y + 1100);
        return {
          x: ahead.x,
          y: ahead.y,
          zoom: 2.1,
          tilt: 0.84,
          yaw: Math.atan2(-r.hx, r.hy),
        };
      }
      case "topdown":
        return { x: c.x, y: c.y, zoom: c.zoom, tilt: 0, yaw: 0 };
      case "block":
        return {
          x: grid.agent.to[0],
          y: grid.agent.to[1],
          zoom: 7,
          tilt: 0.66,
          yaw: reduced ? -0.4 : -0.4 + 0.035 * time,
        };
      default:
        return { x: c.x, y: c.y, zoom: c.zoom, tilt: c.tilt, yaw: 0 };
    }
  }

  /* ------------------------------------------------------- the wave */
  // One distance field per origin, built once: USC for the first change,
  // the agent in Koreatown for the rest. The page says which origin each
  // change spreads from through grid.wave; the engine remembers it per
  // segment, because its eased world can still be finishing the previous
  // change while the page has scrolled into the next.
  const fields = new Map<string, { f: WaveField; tex: THREE.DataTexture }>();
  const fieldFor = (o: [number, number]) => {
    const key = `${Math.round(o[0])},${Math.round(o[1])}`;
    let hitF = fields.get(key);
    if (!hitF) {
      const f = buildWave(data, o);
      const half = new Uint16Array(f.d.length);
      for (let i = 0; i < f.d.length; i++) half[i] = THREE.DataUtils.toHalfFloat(f.d[i]);
      const tex = new THREE.DataTexture(half, WAVE_N, WAVE_N, THREE.RedFormat, THREE.HalfFloatType);
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      hitF = { f, tex };
      fields.set(key, hitF);
    }
    return hitF;
  };
  const originBySeg: [number, number][] = [[0, 0], KOREATOWN, KOREATOWN, KOREATOWN];
  fieldFor(originBySeg[0]);
  fieldFor(KOREATOWN);

  function setRoles(prefix: "a" | "b", world: number) {
    for (const role of ROLES) {
      worldColour(world, role, rgb);
      (uniforms[(prefix + roleUniform[role]) as keyof typeof uniforms].value as THREE.Vector3).set(rgb[0], rgb[1], rgb[2]);
    }
    (prefix === "a" ? uniforms.aGain : uniforms.bGain).value = worldGain(world);
  }

  function applyWorld(world: number) {
    const top = WORLDS.length - 1;
    const w = Math.min(top, Math.max(0, world));
    const seg = Math.min(top - 1, Math.floor(w));
    const t = w - seg;
    if (t < 1e-4 || t > 1 - 1e-4) {
      // Settled in one world: both sets the same, no front.
      const at = t > 0.5 ? seg + 1 : seg;
      setRoles("a", at);
      setRoles("b", at);
      uniforms.uWaveOn.value = 0;
      grid.isDark = isDarkWorld(at);
    } else {
      setRoles("a", seg);
      setRoles("b", seg + 1);
      viaColour(seg, "bg", rgb);
      uniforms.uVia.value.set(rgb[0], rgb[1], rgb[2]);
      viaColour(seg, "bg2", rgb);
      uniforms.uVia2.value.set(rgb[0], rgb[1], rgb[2]);
      const fld = fieldFor(originBySeg[seg]);
      const R = waveRadius(t);
      uniforms.uWaveTex.value = fld.tex;
      uniforms.uWaveR.value = R;
      uniforms.uWaveOn.value = 1;
      // Text follows the world that covers most of the screen: 7 x 7 rays
      // to the ground. The middle of the screen alone flipped the H1 to
      // ink while it still sat on navy in the lower left (2026-10-05).
      let got = 0;
      let all = 0;
      for (let i = 0; i < 7; i++)
        for (let j = 0; j < 7; j++) {
          ndc.set(-0.9 + (i * 1.8) / 6, -0.9 + (j * 1.8) / 6);
          ray.setFromCamera(ndc, camera);
          const p = ray.ray.intersectPlane(groundPlane, hit);
          all++;
          if ((p ? sampleWave(fld.f, p.x, p.y) : OUTSIDE) < R - 0.02) got++;
        }
      grid.isDark = isDarkWorld(got * 2 > all ? seg + 1 : seg);
    }
    worldColour(w < 1e-4 ? 0 : seg, "bg", rgb);
    clear.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace);
    renderer.setClearColor(clear, 1);
  }

  let width = 1;
  let height = 1;
  let dpr = 1;
  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    uniforms.uDpr.value = dpr;
    uniforms.uHalfRes.value.set((width * dpr) / 2, (height * dpr) / 2);
    dirty = true;
  }

  const up = new THREE.Vector3();
  function placeCamera() {
    const portrait = height > width;
    const span =
      (portrait ? SPAN_PORTRAIT : SPAN_LANDSCAPE) / Math.max(0.05, pose.zoom);
    const vSpan = portrait ? span : (span * height) / width;
    const dist = vSpan / 2 / Math.tan((FOV * Math.PI) / 360);
    const pitch = pose.tilt * MAX_PITCH;
    const sy = Math.sin(pose.yaw);
    const cy = Math.cos(pose.yaw);
    // Back off along the heading (-sin yaw, cos yaw) and rise.
    const back = Math.sin(pitch) * dist;
    camera.position.set(
      pose.x + sy * back,
      pose.y - cy * back,
      Math.cos(pitch) * dist,
    );
    up.set(-sy, cy, 0);
    camera.up.copy(up);
    camera.lookAt(pose.x, pose.y, 0);
    camera.near = dist * 0.02;
    camera.far = dist * 30;
    camera.updateProjectionMatrix();
    uniforms.uDist.value = dist;
    uniforms.uPx.value =
      dpr * Math.min(2, Math.max(0.85, Math.pow(pose.zoom, 0.3)));
  }

  /* ----------------------------------------------------------- agent */
  let route: Route | null = null;
  let routeKey = "";
  const tmp: [number, number] = [0, 0];
  function updateAgent(t: number) {
    const { from, to } = grid.agent;
    const on = from[0] !== to[0] || from[1] !== to[1];
    uniforms.uAgentOn.value = on ? 1 : 0;
    if (!on) {
      uniforms.uHi.value.set(0, 0);
      return;
    }
    const key = `${from[0]},${from[1]}>${to[0]},${to[1]}`;
    if (key !== routeKey) {
      route = planRoute(data, from, to);
      routeKey = key;
    }
    if (!route) return;
    // A trail of light behind the head, sampled back in drive time, so it
    // stretches on straights and bunches as the agent brakes for a corner.
    const lag = Math.min(0.0024, 260 / Math.max(1, route.length) / AGENT_N);
    let count = 0;
    for (let i = 0; i < AGENT_N; i++) {
      const ti = t - i * lag;
      if (ti < 0 && i > 0) break;
      routeAt(route, ti, tmp);
      uniforms.uAgent.value[i].set(tmp[0], tmp[1]);
      count++;
    }
    uniforms.uAgentCount.value = count;
    const head = uniforms.uAgent.value[0];
    uniforms.uHi.value.set(head.x, head.y);
  }

  /* ------------------------------------------- lit businesses, on screen */
  const proj = new THREE.Vector3();
  const near6: number[] = [];
  let litKey = "";
  function projectLit() {
    if (!uniforms.uAgentOn.value) {
      grid.lit.length = 0;
      return;
    }
    const hx = uniforms.uHi.value.x;
    const hy = uniforms.uHi.value.y;
    const key = `${Math.round(hx / 20)},${Math.round(hy / 20)}`;
    if (key !== litKey) {
      litKey = key;
      const n = data.biz.length / 2;
      const order = Array.from({ length: n }, (_, i) => i);
      const dist = (i: number) => (data.biz[i * 2] - hx) ** 2 + (data.biz[i * 2 + 1] - hy) ** 2;
      order.sort((a, b) => dist(a) - dist(b));
      near6.length = 0;
      near6.push(...order.slice(0, 6));
    }
    grid.lit.length = 0;
    for (const i of near6) {
      proj.set(data.biz[i * 2], data.biz[i * 2 + 1], 0).project(camera);
      grid.lit.push([((proj.x + 1) / 2) * width, ((1 - proj.y) / 2) * height]);
    }
  }

  /* ------------------------------------------------------------ loop */
  interface Follow {
    load: number;
    pulse: number;
    stream: number;
    highlight: number;
    dim: number;
    exit: number;
    agentT: number;
    world: number;
  }
  const follow: Follow = {
    load: reduced ? 1 : grid.load,
    pulse: grid.pulse,
    stream: grid.stream,
    highlight: grid.highlight,
    dim: grid.dim,
    exit: grid.exit,
    agentT: grid.agent.t,
    world: grid.world,
  };
  let dirty = true;
  let raf = 0;
  let last = performance.now();
  let lastRender = 0;
  let disposed = false;

  const approach = (cur: number, target: number, k: number) => {
    const next = cur + (target - cur) * k;
    return Math.abs(target - next) < 1e-4 ? target : next;
  };

  function frame(now: number) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const time = (now - t0Wall) / 1000;

    const k = reduced ? 1 : 1 - Math.exp(-dt * FOLLOW_RATE);
    let moving = false;
    const step = (key: keyof Follow, target: number) => {
      const v = approach(follow[key], target, k);
      if (v !== follow[key]) moving = true;
      follow[key] = v;
    };
    step("load", reduced ? 1 : grid.load);
    step("pulse", grid.pulse);
    step("stream", grid.stream);
    step("highlight", grid.highlight);
    step("dim", grid.dim);
    step("exit", grid.exit);
    step("agentT", grid.agent.t);
    {
      const kw = reduced ? 1 : 1 - Math.exp(-dt * WORLD_RATE);
      const v = approach(follow.world, grid.world, kw);
      if (v !== follow.world) moving = true;
      follow.world = v;
    }
    {
      const wv = grid.wave;
      if (wv.from >= 0 && wv.from < originBySeg.length) originBySeg[wv.from] = wv.origin;
    }
    // Pointer light decays back to rest after the hand stops.
    if (pointerAmt > 0) {
      pointerAmt = Math.max(0, pointerAmt - dt / POINTER_DECAY_S);
      moving = true;
    }

    const tp = targetPose(grid.mode, time, follow);
    if (!poseInit || reduced) {
      Object.assign(pose, tp);
      poseInit = true;
      moving = true;
    } else {
      const kc = 1 - Math.exp(-dt * CAMERA_RATE);
      const before = pose.x + pose.y + pose.zoom + pose.tilt + pose.yaw;
      pose.x += (tp.x - pose.x) * kc;
      pose.y += (tp.y - pose.y) * kc;
      pose.zoom = Math.exp(
        Math.log(pose.zoom) +
          (Math.log(Math.max(0.05, tp.zoom)) - Math.log(pose.zoom)) * kc,
      );
      pose.tilt += (tp.tilt - pose.tilt) * kc;
      let dy = tp.yaw - pose.yaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      pose.yaw += dy * kc;
      if (
        Math.abs(pose.x + pose.y + pose.zoom + pose.tilt + pose.yaw - before) >
        1e-3
      )
        moving = true;
    }

    if (grid.bursts.length) {
      placeCamera();
      spawnBursts();
      moving = true;
    }
    if (time < burstLiveUntil) moving = true;
    if (pointerFresh) {
      placeCamera();
      ndc.set((pointerX / width) * 2 - 1, -(pointerY / height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(groundPlane, hit)) {
        // 70 css px of influence at the current scale, in metres.
        const metresPerPx = (2 * camera.position.distanceTo(hit) * Math.tan((FOV * Math.PI) / 360)) / height;
        uniforms.uPointer.value.set(hit.x, hit.y, 70 * metresPerPx);
        pointerAmt = Math.min(1, pointerAmt + 0.35);
      }
      pointerFresh = false;
      moving = true;
    }

    const ambient = !reduced && follow.exit < 1;
    const due =
      moving || dirty || (ambient && now - lastRender >= IDLE_FRAME_MS);
    if (!due) return;
    if (follow.exit >= 1 && !moving && !dirty) return;

    placeCamera();
    updateAgent(follow.agentT);
    uniforms.uTime.value = time;
    uniforms.uNow.value = time;
    uniforms.uLoad.value = follow.load;
    uniforms.uPulse.value = follow.pulse;
    uniforms.uStream.value = follow.stream;
    uniforms.uHighlight.value = follow.highlight;
    uniforms.uDim.value = follow.dim;
    uniforms.uExit.value = follow.exit;
    uniforms.uPointerAmt.value = pointerAmt;
    applyWorld(follow.world);
    projectLit();
    renderer.render(scene, camera);
    lastRender = now;
    dirty = false;
  }

  const onPointer = (e: PointerEvent) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    pointerFresh = true;
  };
  const finePointer = !reduced && window.matchMedia("(pointer: fine)").matches;
  if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });

  const onVisible = () => {
    if (document.visibilityState === "visible") {
      last = performance.now();
      dirty = true;
    }
  };
  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisible);
  t0Wall = performance.now();
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisible);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | undefined;
        if (mat) mat.dispose();
      });
      renderer.dispose();
    },
  };
}
