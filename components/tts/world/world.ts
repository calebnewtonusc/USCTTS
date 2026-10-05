/* The renderer for the cubes in field.ts: one bright scene, one light.
 *
 * Caleb, 2026-10-04: "brighten it up while keeping it profesional, like
 * clay". So a pale sky over warm white ground, soft studio light from a
 * room environment computed once, glossy-matte clay cubes with rounded
 * edges, and a soft contact shadow under every cube instead of a shadow map
 * (the per-frame shadow pass was the jank in the 2026-10-04 trace).
 *
 * Framework-free on purpose: WorldScene.tsx owns scroll and the DOM, and
 * drives this through setState / setLoad / setPointer / frame. */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  BLUE,
  CARDINAL,
  COUNT,
  GOLD,
  SIZE,
  createField,
  newForm,
  type Lean,
} from "./field";

export interface WorldNumbers {
  /** The run's shortlist share, which sets how many cubes are cardinal. */
  keptShare: number;
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut3 = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const SKY_TOP = new THREE.Color("#b9d7f1");
const SKY_LOW = new THREE.Color("#f9f7f2");
const GROUND = new THREE.Color("#f6f3ec");
const SHADOW = new THREE.Color("#5b6b7d");
const COL = [
  new THREE.Color("#f7f5f0"), // white
  new THREE.Color("#990000"), // cardinal
  new THREE.Color("#ffcc00"), // USC gold, a clean yellow
  new THREE.Color("#8ec5ff"), // soft sky blue
];

/* The camera on the block, set by rendering the hero at 1440x900: a low
 * three-quarter view, slightly above the top face. */
interface Key {
  n: number;
  pos: [number, number, number];
  look: [number, number, number];
}
export const CAMERA: Key[] = [
  { n: 0, pos: [15.5, 7.8, 19], look: [0, 3, 0] },
  { n: 1, pos: [15.5, 7.8, 19], look: [0, 3, 0] },
];

export interface World {
  /** walk: kept at 0 since the walkthrough became drawn objects (review,
   * 2026-10-04); the cubes are the hero's alone. crane: how far the hero has
   * scrolled away, 0 to 1, which tilts the camera up into the sky. */
  setState(walk: number, crane: number): void;
  setLoad(l: number): void;
  /** The pointer in canvas coordinates, -1 to 1, or null when it left. */
  setPointer(x: number | null, y: number | null): void;
  /** The box, in canvas pixels, the cubes must stay inside so they never
   * touch the copy, or null for anywhere. */
  setBox(b: { l: number; r: number; t: number; b: number } | null): void;
  /** For checks: the cubes' on-screen bounds with the current camera. */
  bounds(): { l: number; r: number; t: number; b: number };
  frame(timeMs: number): void;
  resize(w: number, h: number): void;
  dispose(): void;
}

export function createWorld(
  canvas: HTMLCanvasElement,
  nums: WorldNumbers,
  narrow: boolean,
): World {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 1.5),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  /* No real-time shadows. A headed trace on 2026-10-04 (Chrome, ANGLE Metal,
   * M4 Pro, DPR 2) showed GPU tasks of 120 to 270ms during a fast scroll;
   * the shadow pass was the biggest per-frame cost. Contact shadows below
   * are one instanced quad per cube. */
  renderer.shadowMap.enabled = false;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(SKY_LOW, 60, 170);
  const camera = new THREE.PerspectiveCamera(narrow ? 50 : 34, 1, 0.5, 900);

  // Studio light, computed once: the room environment gives the soft
  // highlights that make the cubes read as glossy clay.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = env;
  scene.environmentIntensity = 0.9;
  const key = new THREE.DirectionalLight("#fffaf0", 1.6);
  key.position.set(-14, 26, 18);
  scene.add(key);
  scene.add(new THREE.HemisphereLight("#eaf3ff", "#f3eee4", 0.55));

  // The sky: pale blue overhead into warm white at the horizon, unlit.
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(600, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      uniforms: { top: { value: SKY_TOP }, low: { value: SKY_LOW } },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 top; uniform vec3 low; varying vec3 vDir;
        void main(){
          float h = smoothstep(0.0, 0.55, vDir.y);
          gl_FragColor = vec4(mix(low, top, h), 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  scene.add(sky);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshBasicMaterial({ color: GROUND, toneMapped: false }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const field = createField(nums.keptShare);
  const cubes = new THREE.InstancedMesh(
    new RoundedBoxGeometry(SIZE, SIZE, SIZE, 4, 0.16),
    new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0 }),
    COUNT,
  );
  cubes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  cubes.frustumCulled = false;
  for (let i = 0; i < COUNT; i++) cubes.setColorAt(i, COL[0]);
  scene.add(cubes);

  /* Contact shadows: a soft round quad under each cube, darker the closer
   * the cube is to the ground. Overlapping quads darken the seams between
   * neighbours, which is the ambient occlusion a block needs. */
  const blobGeo = new THREE.PlaneGeometry(2.3, 2.3);
  blobGeo.rotateX(-Math.PI / 2);
  const blobs = new THREE.InstancedMesh(
    blobGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      uniforms: { tint: { value: SHADOW } },
      vertexShader: `
        varying vec2 vUv; varying float vS;
        void main(){
          vUv = uv;
          #ifdef USE_INSTANCING_COLOR
          vS = instanceColor.r;
          #else
          vS = 0.0;
          #endif
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 tint; varying vec2 vUv; varying float vS;
        void main(){
          float d = length(vUv - 0.5) * 2.0;
          float a = vS * pow(1.0 - smoothstep(0.0, 1.0, d), 1.6);
          gl_FragColor = vec4(tint, a);
        }`,
    }),
    COUNT,
  );
  blobs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  blobs.frustumCulled = false;
  blobs.renderOrder = 1;
  const sCol = new THREE.Color();
  for (let i = 0; i < COUNT; i++) blobs.setColorAt(i, sCol.setRGB(0, 0, 0));
  scene.add(blobs);

  const posCurve = new THREE.CatmullRomCurve3(
    CAMERA.map((k) => new THREE.Vector3(...k.pos)),
    false,
    "centripetal",
  );
  const lookCurve = new THREE.CatmullRomCurve3(
    CAMERA.map((k) => new THREE.Vector3(...k.look)),
    false,
    "centripetal",
  );
  const camAt = (n: number) => {
    let k = 0;
    while (k < CAMERA.length - 2 && n > CAMERA[k + 1].n) k++;
    const t = easeInOut3(prog(n, CAMERA[k].n, CAMERA[k + 1].n));
    const u = (k + t) / (CAMERA.length - 1);
    return { pos: posCurve.getPoint(u), look: lookCurve.getPoint(u) };
  };

  let walk = 0,
    crane = 0,
    load = 0;
  let px: number | null = null,
    py = 0;
  let leanAmt = 0;
  const lean: Lean = { ox: 0, oy: 0, oz: 0, dx: 0, dy: 0, dz: 1, amt: 0 };
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const out = newForm();
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const upAxis = new THREE.Vector3(0, 1, 0);
  const one = new THREE.Vector3(1, 1, 1);
  const p = new THREE.Vector3();
  const sc = new THREE.Vector3();
  const tmp = new THREE.Color();
  let lastLit = "";
  let lastT = -1;

  /* Text and cubes never touch (review, 2026-10-04: "implementation" ran
   * into the block at 1440). WorldScene measures the copy on screen and
   * hands over the box the cubes must stay inside; each frame the cubes are
   * projected with the plain camera, and the camera then stands back (when
   * the form is too big for the box) and the view slides (when it sits in
   * the wrong place), both eased so a change of box never jumps. */
  let viewW = 1,
    viewH = 1;
  const baseOff = { x: 0, y: 0 };
  let box: { l: number; r: number; t: number; b: number } | null = null;
  let fitS = 1,
    fitX = 0,
    fitY = 0;
  const v = new THREE.Vector3();
  const lookV = new THREE.Vector3();
  function frameIt(pos: THREE.Vector3, look: THREE.Vector3, c: number, dt: number) {
    camera.position.copy(pos);
    camera.lookAt(look);
    camera.setViewOffset(viewW, viewH, baseOff.x, baseOff.y, viewW, viewH);
    camera.updateMatrixWorld();
    let tS = 1,
      tX = 0,
      tY = 0;
    if (box && c < 0.5) {
      const f = viewH / 2 / Math.tan((camera.fov * Math.PI) / 360);
      let x0 = Infinity,
        x1 = -Infinity,
        y0 = Infinity,
        y1 = -Infinity;
      for (let i = 0; i < COUNT; i++) {
        // Cubes in the air (falling in, or crossing) are not the form.
        if (out.y[i] > 12) continue;
        v.set(out.x[i], out.y[i], out.z[i]).applyMatrix4(camera.matrixWorldInverse);
        const depth = -v.z;
        if (depth < 1) continue;
        const rad = (0.87 * f) / depth;
        v.applyMatrix4(camera.projectionMatrix);
        const sx = ((v.x + 1) / 2) * viewW,
          sy = ((1 - v.y) / 2) * viewH;
        x0 = Math.min(x0, sx - rad);
        x1 = Math.max(x1, sx + rad);
        y0 = Math.min(y0, sy - rad);
        y1 = Math.max(y1, sy + rad);
      }
      if (x1 > x0) {
        lookV.copy(look).project(camera);
        const ax = ((lookV.x + 1) / 2) * viewW,
          ay = ((1 - lookV.y) / 2) * viewH;
        tS = Math.max(0.35, Math.min(1, (box.r - box.l) / (x1 - x0), (box.b - box.t) / (y1 - y0)));
        const nx0 = ax + (x0 - ax) * tS,
          nx1 = ax + (x1 - ax) * tS,
          ny0 = ay + (y0 - ay) * tS,
          ny1 = ay + (y1 - ay) * tS;
        if (nx0 < box.l) tX = box.l - nx0;
        else if (nx1 > box.r) tX = box.r - nx1;
        if (ny1 > box.b) tY = box.b - ny1;
        else if (ny0 < box.t) tY = box.t - ny0;
      }
    }
    const k = fitS === 1 && fitX === 0 && fitY === 0 && dt === 0 ? 1 : clamp(dt * 7);
    fitS += (tS - fitS) * k;
    fitX += (tX - fitX) * k;
    fitY += (tY - fitY) * k;
    camera.position.copy(pos.sub(look).multiplyScalar(1 / fitS).add(look));
    camera.lookAt(look);
    camera.setViewOffset(viewW, viewH, baseOff.x - fitX, baseOff.y - fitY, viewW, viewH);
    camera.updateMatrixWorld();
  }

  function update(time: number) {
    const s = time / 1000;
    const dt = lastT < 0 ? 0 : clamp(s - lastT, 0, 0.1);
    lastT = s;

    // The pointer, on last frame's view: the block's outer cubes lift toward it, only while the
    // block is the form on screen and the load has landed.
    const block = load >= 1 && crane < 0.3;
    const want = block && px !== null ? 1 : 0;
    leanAmt += (want - leanAmt) * clamp(dt * 6);
    if (px !== null) {
      ndc.set(px, py);
      ray.setFromCamera(ndc, camera);
      lean.ox = ray.ray.origin.x;
      lean.oy = ray.ray.origin.y;
      lean.oz = ray.ray.origin.z;
      lean.dx = ray.ray.direction.x;
      lean.dy = ray.ray.direction.y;
      lean.dz = ray.ray.direction.z;
    }
    lean.amt = leanAmt;

    field.frame(walk, s, load, leanAmt > 0.001 ? lean : null, out);

    // The camera.
    const { pos, look } = camAt(walk);
    // The load is a slow push in, 18% further out at the start.
    const push = 1 + 0.18 * (1 - easeOut3(load));
    pos.sub(look).multiplyScalar(push).add(look);
    // A tall screen sees less width, so the camera stands back in proportion.
    if (camera.aspect < 1)
      pos
        .sub(look)
        .multiplyScalar(Math.min(2.2, Math.pow(1 / camera.aspect, 0.7)))
        .add(look);
    // A breath of drift, so a still frame is never dead.
    pos.x += Math.sin(s * 0.21) * 0.35;
    pos.y += Math.sin(s * 0.17) * 0.2;
    // The crane: up and looking into the sky, so the cubes sink out of the
    // frame while the partners section is over it.
    const c = easeInOut3(crane);
    pos.y += 4 * c;
    look.y += 14 * c;
    frameIt(pos, look, c, dt);

    for (let i = 0; i < COUNT; i++) {
      p.set(out.x[i], out.y[i], out.z[i]);
      q.setFromAxisAngle(upAxis, out.yaw[i]);
      m4.compose(p, q, one);
      cubes.setMatrixAt(i, m4);
      const h = Math.max(0, out.y[i] - SIZE / 2);
      p.set(out.x[i] + 0.12, 0.01 + i * 0.00002, out.z[i] + 0.1);
      sc.setScalar(1 + h * 0.12);
      m4.compose(p, q, sc);
      blobs.setMatrixAt(i, m4);
      blobs.setColorAt(i, sCol.setRGB(0.5 * Math.exp(-h / 2.2), 0, 0));
    }
    cubes.instanceMatrix.needsUpdate = true;
    blobs.instanceMatrix.needsUpdate = true;
    if (blobs.instanceColor) blobs.instanceColor.needsUpdate = true;

    const lit = field.lit(walk);
    const litKey = lit.map((v) => v.toFixed(3)).join();
    if (litKey !== lastLit) {
      lastLit = litKey;
      for (let i = 0; i < COUNT; i++) {
        const c = field.cat[i];
        const w =
          c === CARDINAL
            ? lit[0]
            : c === GOLD
              ? lit[1]
              : c === BLUE
                ? lit[2]
                : 0;
        cubes.setColorAt(i, tmp.copy(COL[0]).lerp(COL[c], w));
      }
      if (cubes.instanceColor) cubes.instanceColor.needsUpdate = true;
    }
  }

  renderer.compile(scene, camera);

  return {
    setState(w, c) {
      walk = w;
      crane = c;
    },
    setLoad(l) {
      load = l;
    },
    setBox(b) {
      box = b;
    },
    bounds() {
      const f = viewH / 2 / Math.tan((camera.fov * Math.PI) / 360);
      const o = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
      for (let i = 0; i < COUNT; i++) {
        v.set(out.x[i], out.y[i], out.z[i]).applyMatrix4(camera.matrixWorldInverse);
        const depth = -v.z;
        if (depth < 1) continue;
        const rad = (0.87 * f) / depth;
        v.applyMatrix4(camera.projectionMatrix);
        const sx = ((v.x + 1) / 2) * viewW,
          sy = ((1 - v.y) / 2) * viewH;
        o.l = Math.min(o.l, sx - rad);
        o.r = Math.max(o.r, sx + rad);
        o.t = Math.min(o.t, sy - rad);
        o.b = Math.max(o.b, sy + rad);
      }
      return o;
    },
    setPointer(x, y) {
      px = x;
      if (y !== null) py = y;
    },
    frame(time) {
      update(time);
      renderer.render(scene, camera);
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w < 768 ? 50 : 34;
      // The copy is a column on the left (desktop) or at the foot (phone), so
      // what the camera looks at lands at about 66% across, or 36% down.
      viewW = w;
      viewH = h;
      baseOff.x = w >= 768 ? -w * 0.16 : 0;
      baseOff.y = w >= 768 ? 0 : h * 0.14;
      camera.setViewOffset(w, h, baseOff.x, baseOff.y, w, h);
      camera.updateProjectionMatrix();
    },
    dispose() {
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mm = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mm)) mm.forEach((x) => x.dispose());
        else mm?.dispose();
      });
      env.dispose();
      renderer.dispose();
    },
  };
}
