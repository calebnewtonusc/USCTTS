/* The GTM and AI machine, as one world at golden hour.
 *
 * docs/DIRECTION-tts-v3.md: a physical world made of the objects of the work,
 * at cinematic scale. Raw accounts pour into a funnel, enrichment pipes twist
 * across the land, a magnifier qualifies records on a belt, agents work at
 * their stations, a mailbox sends, and a pipeline chart climbs. Scroll flies
 * one camera through it. Everything is built here from primitives, so there
 * are no model files to load and nothing anyone else made.
 *
 * Framework-free on purpose: Scene.tsx owns scroll, the follower and the DOM,
 * and drives this through setN / setLoad / frame. */

import * as THREE from "three";

export interface WorldNumbers {
  /** Share of records the qualification station sets aside (the verify rule). */
  asideShare: number;
}

const COL = {
  skyTop: new THREE.Color("#57524e"),
  skyMid: new THREE.Color("#ab9886"),
  skyLow: new THREE.Color("#efd3ad"),
  haze: new THREE.Color("#e8d5ba"),
  sun: new THREE.Color("#ffd49a"),
  groundA: new THREE.Color("#8f8373"),
  groundB: new THREE.Color("#c4b39b"),
  bone: new THREE.Color("#e9e1d2"),
  boneDark: new THREE.Color("#bdb3a4"),
  // The ink of the page, used for the dark parts so the world has one accent.
  cardinal: new THREE.Color("#2a1b1e"),
  gold: new THREE.Color("#ffb547"),
  ink: new THREE.Color("#1b1714"),
  slate: new THREE.Color("#34302c"),
  ash: new THREE.Color("#6f6961"),
};

/* Where each station stands. The camera path below is written against these,
 * and the stations are spread along -z so one forward move visits them in
 * reading order. */
export const STATIONS = {
  funnel: new THREE.Vector3(0, 0, 0),
  magnifier: new THREE.Vector3(26, 0, -62),
  agents: new THREE.Vector3(6, 0, -98),
  mailbox: new THREE.Vector3(-16, 0, -128),
  chart: new THREE.Vector3(8, 0, -160),
};

/* The camera, as keys on N. Close pairs make a hold: the camera drifts a few
 * metres while a caption is up, then travels. Positions and targets were set
 * by rendering each key at 1440x900 and moving things until the station sat
 * where its caption does not. */
interface Key {
  n: number;
  pos: [number, number, number];
  look: [number, number, number];
}
export const CAMERA: Key[] = [
  { n: 0, pos: [-46, 40, 52], look: [16, 2, -74] },
  { n: 0.055, pos: [-58, 54, 78], look: [16, 2, -74] },
  { n: 0.12, pos: [-30, 13, 36], look: [-4, 13, 0] },
  { n: 0.19, pos: [-26, 11, 31], look: [-4, 12, 0] },
  { n: 0.26, pos: [46, 20, 8], look: [6, 9, -30] },
  { n: 0.32, pos: [48, 18, 0], look: [8, 8, -36] },
  { n: 0.39, pos: [50, 15, -28], look: [27, 9, -62] },
  { n: 0.5, pos: [52, 14, -31], look: [27, 8, -62] },
  { n: 0.58, pos: [-16, 13, -64], look: [2, 7, -98] },
  { n: 0.64, pos: [-12, 12, -68], look: [2, 7, -98] },
  { n: 0.71, pos: [16, 13, -98], look: [-20, 10, -128] },
  { n: 0.77, pos: [14, 12, -101], look: [-20, 10, -128] },
  { n: 0.84, pos: [-12, 17, -131], look: [2, 13, -160] },
  { n: 0.89, pos: [-14, 19, -130], look: [2, 13, -160] },
  { n: 0.93, pos: [-112, 64, -80], look: [10, 3, -82] },
  { n: 1, pos: [-106, 60, -82], look: [10, 3, -83] },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn3 = (t: number) => t * t * t;
const easeInOut3 = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function rng(seed: number) {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let a = Math.imul(t ^ (t >>> 15), 1 | t);
    a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
    return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, z: number) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, z: number) {
  const xi = Math.floor(x),
    zi = Math.floor(z);
  const xf = x - xi,
    zf = z - zi;
  const u = xf * xf * (3 - 2 * xf),
    v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi),
    b = hash(xi + 1, zi),
    c = hash(xi, zi + 1),
    d = hash(xi + 1, zi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/** Ground height. Flat along the path, rising into hills away from it. */
function groundY(x: number, z: number) {
  // Distance from the station corridor, a band from the funnel to the chart.
  const pathX = 8 + Math.sin(z * 0.03) * 12;
  const d = Math.abs(x - pathX);
  const away = clamp((d - 30) / 70);
  const far = clamp((-z - 200) / 120) + clamp((z - 40) / 80);
  const hills =
    vnoise(x * 0.018, z * 0.018) * 0.7 + vnoise(x * 0.05, z * 0.05) * 0.3;
  return (away + far * 0.8) * (hills * 30 + 4) + vnoise(x * 0.2, z * 0.2) * 0.5;
}

const mat = (
  color: THREE.Color,
  rough = 0.82,
  extra: Partial<THREE.MeshStandardMaterialParameters> = {},
) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: 0.02,
    ...extra,
  });

function person(m: THREE.Material) {
  // A tiny human, 1.8 units tall, for scale beside the machines.
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.9, 4, 10), m);
  body.position.y = 0.75;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), m);
  head.position.y = 1.58;
  body.castShadow = head.castShadow = true;
  g.add(body, head);
  return g;
}

export interface World {
  setN(n: number): void;
  setLoad(l: number): void;
  frame(timeMs: number): void;
  resize(w: number, h: number): void;
  dispose(): void;
  /** For still renders: freeze ambient time at t and draw once. With
   * sweepMs, the build is shown that far into its sweep. */
  still(n: number, timeMs: number, sweepMs?: number): void;
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
    Math.min(window.devicePixelRatio || 1, narrow ? 1.25 : 1.5),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COL.haze, 120, 520);
  const camera = new THREE.PerspectiveCamera(narrow ? 58 : 40, 1, 0.5, 1200);

  /* ---------- sky: a gradient dome with the sun low in it ---------- */
  const sunDir = new THREE.Vector3(-0.82, 0.26, -0.32).normalize();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(900, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: COL.skyTop },
        mid: { value: COL.skyMid },
        low: { value: COL.skyLow },
        sun: { value: COL.sun },
        sunDir: { value: sunDir },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 top; uniform vec3 mid; uniform vec3 low; uniform vec3 sun; uniform vec3 sunDir;
        varying vec3 vDir;
        void main(){
          float h = clamp(vDir.y, -0.2, 1.0);
          vec3 c = mix(low, mid, smoothstep(0.0, 0.18, h));
          c = mix(c, top, smoothstep(0.18, 0.75, h));
          float s = max(dot(normalize(vDir), sunDir), 0.0);
          c += sun * (pow(s, 900.0) * 2.2 + pow(s, 24.0) * 0.35 + pow(s, 4.0) * 0.12);
          gl_FragColor = vec4(c, 1.0);
        }`,
    }),
  );
  scene.add(sky);

  /* ---------- light: low golden sun, warm sky, dark warm ground ---------- */
  const hemi = new THREE.HemisphereLight("#f3dcc0", "#2e2823", 0.9);
  scene.add(hemi);
  const sunLight = new THREE.DirectionalLight(COL.sun, 3.4);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(narrow ? 1024 : 2048, narrow ? 1024 : 2048);
  const sc = sunLight.shadow.camera;
  sc.left = -70;
  sc.right = 70;
  sc.top = 70;
  sc.bottom = -70;
  sc.near = 1;
  sc.far = 400;
  sunLight.shadow.bias = -0.0004;
  sunLight.shadow.radius = 4;
  sunLight.shadow.normalBias = 0.04;
  scene.add(sunLight, sunLight.target);
  const rim = new THREE.DirectionalLight("#cfd6e0", 0.35);
  rim.position.set(60, 30, 80);
  scene.add(rim);

  /* ---------- ground ---------- */
  const G = 520;
  const groundGeo = new THREE.PlaneGeometry(G, G, 180, 180);
  groundGeo.rotateX(-Math.PI / 2);
  groundGeo.translate(10, 0, -90);
  const gp = groundGeo.attributes.position as THREE.BufferAttribute;
  const gcol = new Float32Array(gp.count * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i),
      z = gp.getZ(i);
    const y = groundY(x, z);
    gp.setY(i, y);
    tmp
      .copy(COL.groundA)
      .lerp(COL.groundB, clamp(y / 40 + vnoise(x * 0.08, z * 0.08) * 0.35));
    gcol.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  groundGeo.setAttribute("color", new THREE.BufferAttribute(gcol, 3));
  groundGeo.computeVertexNormals();
  const ground = new THREE.Mesh(
    groundGeo,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96 }),
  );
  ground.receiveShadow = true;
  scene.add(ground);

  /* Cypress spires scattered off the path: scale and depth. Instanced. */
  const R = rng(1015);
  const spireGeo = new THREE.ConeGeometry(1, 1, 7);
  spireGeo.translate(0, 0.5, 0);
  const spires = new THREE.InstancedMesh(
    spireGeo,
    mat(new THREE.Color("#574f46"), 0.9),
    220,
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sV = new THREE.Vector3();
  const pV = new THREE.Vector3();
  let placed = 0;
  for (let tries = 0; placed < 130 && tries < 3000; tries++) {
    const x = (R() - 0.5) * 420 + 10;
    const z = (R() - 0.5) * 420 - 90;
    const pathX = 8 + Math.sin(z * 0.03) * 12;
    if (Math.abs(x - pathX) < 34 && z < 50 && z > -190) continue;
    // Never in the lens: no spire within 22 units of any camera key.
    if (CAMERA.some((k) => Math.hypot(k.pos[0] - x, k.pos[2] - z) < 22)) continue;
    const h = 6 + R() * 16;
    pV.set(x, groundY(x, z) - 0.3, z);
    sV.set(h * 0.18, h, h * 0.18);
    m4.compose(pV, q.identity(), sV);
    spires.setMatrixAt(placed++, m4);
  }
  spires.count = placed;
  spires.castShadow = true;
  scene.add(spires);

  const bone = mat(COL.bone, 0.78);
  const boneDark = mat(COL.boneDark, 0.85);
  const cardinal = mat(COL.cardinal, 0.7);
  const gold = mat(COL.gold, 0.45, {
    emissive: COL.gold,
    emissiveIntensity: 0.35,
  });
  const slate = mat(COL.slate, 0.7);
  const ash = mat(COL.ash, 0.9);
  const peopleMat = mat(new THREE.Color("#1d1512"), 0.9);

  const groups: { g: THREE.Group; base: THREE.Vector3; start: number }[] = [];
  const station = (at: THREE.Vector3, start: number) => {
    const g = new THREE.Group();
    g.position.copy(at);
    scene.add(g);
    groups.push({ g, base: at.clone(), start });
    return g;
  };
  const shadow = (o: THREE.Object3D) =>
    o.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });

  /* ---------- 1. the funnel, raw accounts pouring in ---------- */
  const funnelG = station(STATIONS.funnel, 0.04);
  const lathePts: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    lathePts.push(new THREE.Vector2(1.3 + Math.pow(t, 1.7) * 9.5, t * 10));
  }
  const funnel = new THREE.Mesh(
    new THREE.LatheGeometry(lathePts, 64),
    new THREE.MeshStandardMaterial({
      color: COL.bone,
      roughness: 0.75,
      side: THREE.DoubleSide,
    }),
  );
  funnel.position.y = 12;
  const spout = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.3, 5, 32, 1, true),
    boneDark,
  );
  spout.position.y = 9.5;
  const rimRing = new THREE.Mesh(
    new THREE.TorusGeometry(10.8, 0.45, 12, 72),
    cardinal,
  );
  rimRing.rotation.x = Math.PI / 2;
  rimRing.position.y = 22;
  funnelG.add(funnel, spout, rimRing);
  // A gantry holding it up: two cardinal beams, like a press.
  for (const sx of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 20, 1.2), slate);
    leg.position.set(sx * 11.5, 10, 0);
    funnelG.add(leg);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(25, 1.4, 1.6), slate);
  beam.position.y = 17;
  funnelG.add(beam);
  for (const [x, z] of [
    [-5, 9],
    [-3.6, 10.5],
    [4.5, 8],
  ]) {
    const p = person(peopleMat);
    p.position.set(x, 0, z);
    p.rotation.y = R() * 6;
    funnelG.add(p);
  }
  shadow(funnelG);
  // Accounts: many small blocks, falling into the mouth on a loop.
  const ACC = 260;
  const accGeo = new THREE.BoxGeometry(1, 1, 1);
  const accMat = new THREE.MeshStandardMaterial({
    roughness: 0.6,
    vertexColors: false,
  });
  const accounts = new THREE.InstancedMesh(accGeo, accMat, ACC);
  // Raw accounts are neutral: nothing is gold until it has been worked.
  const accPal = [COL.bone, COL.boneDark, new THREE.Color("#8d857b"), COL.bone, new THREE.Color("#5b554f")];
  const accSeed = Array.from({ length: ACC }, () => ({
    r: Math.sqrt(R()) * 7.5,
    a: R() * Math.PI * 2,
    s: 0.55 + R() * 0.7,
    off: R(),
    spin: (R() - 0.5) * 4,
  }));
  accSeed.forEach((_, i) => accounts.setColorAt(i, accPal[i % accPal.length]));
  accounts.castShadow = true;
  funnelG.add(accounts);

  /* ---------- 2. enrichment pipes ---------- */
  const pipeG = station(new THREE.Vector3(0, 0, 0), 0.12);
  const pipeCurves = [
    new THREE.CatmullRomCurve3(
      [
        [0, 7, 0],
        [0, 3.5, -8],
        [8, 4, -18],
        [2, 9, -26],
        [12, 12, -30],
        [20, 6, -36],
        [14, 3.5, -46],
        [12, 3.2, -62],
      ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    ),
    new THREE.CatmullRomCurve3(
      [
        [0, 7, 0],
        [-3, 2.5, -10],
        [6, 2.5, -24],
        [22, 4, -22],
        [30, 10, -28],
        [24, 14, -38],
        [16, 7, -44],
        [12, 3.2, -62],
      ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    ),
  ];
  const pipeMats = [bone, mat(new THREE.Color("#7a726a"), 0.75)];
  pipeCurves.forEach((c, i) => {
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(c, 160, i ? 1 : 1.35, 20, false),
      pipeMats[i],
    );
    pipeG.add(tube);
    // Couplings every so often, so the pipes read as built, not drawn.
    for (let k = 1; k < 9; k++) {
      const u = k / 9;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(i ? 1.15 : 1.5, 0.22, 8, 24),
        slate,
      );
      ring.position.copy(c.getPointAt(u));
      ring.lookAt(c.getPointAt(Math.min(1, u + 0.01)));
      pipeG.add(ring);
    }
  });
  shadow(pipeG);
  // Data moving through them: glowing beads riding just over the surface.
  const BEADS = 34;
  const beads = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.34, 12, 8),
    gold,
    BEADS,
  );
  pipeG.add(beads);

  /* ---------- 3. the magnifier, qualifying records on a belt ---------- */
  const magG = station(STATIONS.magnifier, 0.2);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(44, 0.8, 5), slate);
  belt.position.set(0, 2.6, 0);
  const beltTop = new THREE.Mesh(
    new THREE.BoxGeometry(44, 0.1, 4.4),
    mat(new THREE.Color("#141110"), 0.95),
  );
  beltTop.position.set(0, 3.05, 0);
  magG.add(belt, beltTop);
  for (let k = -20; k <= 20; k += 5) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 4.6), slate);
    leg.position.set(k, 1.2, 0);
    magG.add(leg);
  }
  const lens = new THREE.Group();
  const lensRim = new THREE.Mesh(
    new THREE.TorusGeometry(6, 0.75, 20, 80),
    cardinal,
  );
  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(5.6, 64),
    new THREE.MeshPhysicalMaterial({
      color: "#ffe6c2",
      transmission: 0,
      transparent: true,
      opacity: 0.16,
      roughness: 0.05,
      metalness: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.95, 11, 20),
    slate,
  );
  handle.position.set(5.2, -8.4, 0);
  handle.rotation.z = 0.6;
  lens.add(lensRim, glass, handle);
  lens.position.set(0, 12.5, 0);
  lens.rotation.y = 0.62;
  magG.add(lens);
  // Two bins at the far end: kept, and set aside.
  const keptBin = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 6), gold);
  keptBin.position.set(25, 1.5, 0);
  const asideBin = new THREE.Mesh(new THREE.BoxGeometry(5, 2.4, 5), ash);
  asideBin.position.set(6, 1.2, 6.5);
  magG.add(keptBin, asideBin);
  for (const [x, z] of [
    [-10, 5],
    [-8.6, 6.2],
  ]) {
    const p = person(peopleMat);
    p.position.set(x, 0, z);
    magG.add(p);
  }
  shadow(magG);
  glass.castShadow = false;
  const ITEMS = 26;
  const items = new THREE.InstancedMesh(
    new THREE.BoxGeometry(2, 1.4, 2.6),
    new THREE.MeshStandardMaterial({ roughness: 0.6 }),
    ITEMS,
  );
  items.castShadow = true;
  magG.add(items);
  const itemAside = Array.from({ length: ITEMS }, () => R() < nums.asideShare);

  /* ---------- 4. agents at their stations ---------- */
  const agG = station(STATIONS.agents, 0.28);
  const AGENTS = 5;
  const visors: THREE.Mesh[] = [];
  const agentDocs: THREE.Mesh[] = [];
  const visorMat = new THREE.MeshStandardMaterial({
    color: COL.gold,
    emissive: COL.gold,
    emissiveIntensity: 1.6,
    roughness: 0.3,
  });
  for (let i = 0; i < AGENTS; i++) {
    const a = ((i / (AGENTS - 1)) * 2 - 1) * 0.9;
    const x = Math.sin(a) * 16;
    const z = -Math.cos(a) * 9 + 6;
    const ag = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 9, 2.2), slate);
    body.position.y = 4.5;
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.5, 0.1),
      visorMat.clone(),
    );
    visor.position.set(0, 7.6, 1.12);
    visors.push(visor);
    const desk = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 3), bone);
    desk.position.set(0, 3, 2.8);
    const deskLeg = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 3, 2.4),
      boneDark,
    );
    deskLeg.position.set(0, 1.5, 2.8);
    ag.add(body, visor, desk, deskLeg);
    for (let d = 0; d < 3; d++) {
      const doc = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 2), bone);
      doc.position.set(-1.4 + d * 1.4, 3.3, 2.8);
      agentDocs.push(doc);
      ag.add(doc);
    }
    ag.position.set(x, 0, z);
    ag.lookAt(0, 0, 18);
    agG.add(ag);
  }
  for (const [x, z] of [
    [-3, 12],
    [2.5, 13],
  ]) {
    const p = person(peopleMat);
    p.position.set(x, 0, z);
    p.rotation.y = Math.PI;
    agG.add(p);
  }
  shadow(agG);

  /* ---------- 5. the mailbox ---------- */
  const mbG = station(STATIONS.mailbox, 0.36);
  const post = new THREE.Mesh(new THREE.BoxGeometry(1.6, 9, 1.6), slate);
  post.position.y = 4.5;
  const box = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 12), bone);
  box.position.y = 11.5;
  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5, 3.5, 12, 40, 1, false, 0, Math.PI),
    bone,
  );
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = Math.PI / 2;
  roof.position.y = 14;
  const door = new THREE.Mesh(
    new THREE.CircleGeometry(3.5, 40, 0, Math.PI),
    boneDark,
  );
  door.position.set(0, 14, 6.01);
  const doorRect = new THREE.Mesh(new THREE.PlaneGeometry(7, 5), boneDark);
  doorRect.position.set(0, 11.5, 6.01);
  const flag = new THREE.Group();
  const flagPole = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5, 0.4), gold);
  flagPole.position.y = 2.5;
  const flagTip = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 1.6, 2.2),
    gold,
  );
  flagTip.position.set(0, 4.3, 1);
  flag.add(flagPole, flagTip);
  flag.position.set(3.7, 11, 1);
  mbG.add(post, box, roof, door, doorRect, flag);
  for (const [x, z] of [
    [-5, 7],
    [-6.2, 5.8],
  ]) {
    const p = person(peopleMat);
    p.position.set(x, 0, z);
    mbG.add(p);
  }
  shadow(mbG);
  const ENV = 30;
  const envelopes = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.6, 0.08, 1.1),
    mat(new THREE.Color("#f5efe4"), 0.6),
    ENV,
  );
  envelopes.castShadow = true;
  mbG.add(envelopes);
  const envSeed = Array.from({ length: ENV }, () => ({
    off: R(),
    dx: (R() - 0.5) * 50,
    h: 10 + R() * 18,
    spin: R() * 6,
  }));

  /* ---------- 6. the pipeline chart, climbing ---------- */
  const chG = station(STATIONS.chart, 0.44);
  const BARS = 7;
  const bars: THREE.Mesh[] = [];
  const caps: THREE.Mesh[] = [];
  for (let i = 0; i < BARS; i++) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 1, 3.4),
      i % 2 ? bone : boneDark,
    );
    b.position.set(-12 + i * 4, 0.5, 0);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.5, 3.5), gold);
    bars.push(b);
    caps.push(cap);
    chG.add(b, cap);
  }
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 16), gold);
  chG.add(ball);
  for (const [x, z] of [
    [-16, 5],
    [-14.8, 6],
  ]) {
    const p = person(peopleMat);
    p.position.set(x, 0, z);
    chG.add(p);
  }
  shadow(chG);

  /* ---------- hairline edges: the figures' line family, in 3D ---------- */
  const edgeMat = new THREE.LineBasicMaterial({ color: COL.cardinal, transparent: true, opacity: 0.32 });
  for (const { g } of groups)
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || (m as THREE.InstancedMesh).isInstancedMesh) return;
      const t = m.geometry.type;
      if (t !== "BoxGeometry" && t !== "CylinderGeometry") return;
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 35), edgeMat));
    });

  /* ---------- the build: the climax of the flight ----------
   * The replica's timed sweep, rebuilt for this world: a wavefront crosses the
   * ground from the funnel to the chart in SWEEP_MS, every part of the machine
   * rises out of the ground as the front passes it, each over its own short
   * window, the pipes connect behind the front, and each station only starts
   * running once its parts have landed. It replays once per entry to the
   * phase. Before it, the machine sinks into the ground on scroll and a few
   * lattice cells light up ahead of the front. */
  const SWEEP_MS = 1800; // the replica's sweep: 1800ms from end to end
  const RISE_MS = 560; // one part's rise; chosen by eye, the front stays legible
  const FRONT_FROM = 30;
  const FRONT_TO = -195;
  const SINK: [number, number] = [0.9, 0.925];
  const ENTER = 0.93;
  const fOf = (z: number) => clamp((FRONT_FROM - z) / (FRONT_FROM - FRONT_TO));
  interface Part {
    obj: THREE.Object3D;
    y: number;
    depth: number;
    f: number;
  }
  const parts: Part[] = [];
  const tubes: { mesh: THREE.Mesh; count: number }[] = [];
  const bb = new THREE.Box3();
  for (const { g } of groups) {
    g.updateMatrixWorld(true);
    for (const child of g.children) {
      if ((child as THREE.InstancedMesh).isInstancedMesh) continue;
      const geo = (child as THREE.Mesh).geometry;
      if (geo && geo.type === "TubeGeometry") {
        tubes.push({ mesh: child as THREE.Mesh, count: geo.index ? geo.index.count : 0 });
        continue;
      }
      bb.setFromObject(child);
      parts.push({
        obj: child,
        y: child.position.y,
        depth: Math.max(1, bb.max.y - g.position.y + 1.5),
        f: fOf((bb.min.z + bb.max.z) / 2),
      });
    }
  }
  const dynamic = new Set<THREE.Object3D>([...bars, ...caps, ball, lens]);
  const PIPE_Z0 = 0;
  const PIPE_Z1 = -62;
  // Which station each running layer belongs to, by where the front must be.
  const gates: [THREE.Object3D, number][] = [
    [accounts, fOf(STATIONS.funnel.z)],
    [beads, fOf(PIPE_Z1)],
    [items, fOf(STATIONS.magnifier.z)],
    [envelopes, fOf(STATIONS.mailbox.z)],
  ];

  const lattice = new THREE.GridHelper(300, 60, COL.cardinal, COL.cardinal);
  const latMat = lattice.material as THREE.LineBasicMaterial;
  latMat.transparent = true;
  latMat.opacity = 0;
  latMat.depthWrite = false;
  lattice.position.set(8, 0.6, -82);
  scene.add(lattice);
  const goldLine = new THREE.MeshStandardMaterial({ color: COL.gold, emissive: COL.gold, emissiveIntensity: 1.4, roughness: 0.4 });
  const front = new THREE.Mesh(new THREE.BoxGeometry(320, 0.3, 1.1), goldLine);
  const wake = new THREE.Mesh(
    new THREE.PlaneGeometry(320, 16),
    new THREE.MeshBasicMaterial({ color: COL.gold, transparent: true, opacity: 0.22, depthWrite: false }),
  );
  wake.rotation.x = -Math.PI / 2;
  front.visible = wake.visible = false;
  scene.add(front, wake);
  // Foreshadow: lattice cells along the corridor that light before the front.
  const cellMat = new THREE.MeshBasicMaterial({ color: COL.gold, transparent: true, opacity: 0, depthWrite: false });
  const cells: { m: THREE.Mesh; f: number; at: number }[] = [];
  for (let i = 0; i < 9; i++) {
    const z = -10 - i * 20 - Math.floor(R() * 3) * 5;
    const x = Math.round((8 + Math.sin(z * 0.03) * 12 + (R() - 0.5) * 30) / 5) * 5 + 3;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), cellMat.clone());
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.65, Math.round(z / 5) * 5 - 2);
    scene.add(m);
    cells.push({ m, f: fOf(m.position.z), at: R() });
  }
  let sweep0 = -1;

  /* ---------- the camera path ---------- */
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

  let N = 0;
  let load = 0;
  const tmpObj = new THREE.Object3D();
  const cGold = COL.gold.clone();
  const cAsh = COL.ash.clone();
  const cBone = COL.bone.clone();

  function update(time: number) {
    const s = time / 1000;
    // Assembly on the load clock: each station drops into place, staggered.
    for (const { g, base, start } of groups) {
      const a = easeOut3(clamp((load - start) / 0.35));
      g.position.set(base.x, base.y + (1 - a) * 46, base.z);
      g.visible = a > 0.001;
    }

    // Accounts fall into the funnel mouth and vanish down the spout.
    for (let i = 0; i < ACC; i++) {
      const sd = accSeed[i];
      const u = (s * 0.16 + sd.off) % 1;
      const y = 40 - u * 24;
      const r = sd.r * (u > 0.75 ? 1 - (u - 0.75) * 3.4 : 1);
      tmpObj.position.set(
        Math.cos(sd.a + u * 2) * r,
        y,
        Math.sin(sd.a + u * 2) * r,
      );
      tmpObj.rotation.set(sd.spin * u * 3, sd.spin * u * 2, 0);
      const sz = sd.s * (u > 0.85 ? (1 - u) / 0.15 : 1);
      tmpObj.scale.setScalar(Math.max(0.001, sz));
      tmpObj.updateMatrix();
      accounts.setMatrixAt(i, tmpObj.matrix);
    }
    accounts.instanceMatrix.needsUpdate = true;

    // Beads through both pipes.
    for (let i = 0; i < BEADS; i++) {
      const c = pipeCurves[i % 2];
      const u = (s * 0.05 + i / BEADS) % 1;
      const p = c.getPointAt(u);
      tmpObj.position.set(p.x, p.y + (i % 2 ? 1.05 : 1.4), p.z);
      tmpObj.rotation.set(0, 0, 0);
      tmpObj.scale.setScalar(1);
      tmpObj.updateMatrix();
      beads.setMatrixAt(i, tmpObj.matrix);
    }
    beads.instanceMatrix.needsUpdate = true;

    // Records along the belt. Under the lens each is judged: kept ones turn
    // gold and ride on to the bin, set-aside ones grey out and drop off.
    for (let i = 0; i < ITEMS; i++) {
      const u = (s * 0.045 + i / ITEMS) % 1;
      const x = -21 + u * 44;
      const judged = x > 0;
      const aside = judged && itemAside[i];
      let y = 3.8,
        z = 0;
      if (aside) {
        const d = clamp((x - 0) / 8);
        z = d * 6.5;
        y = 3.8 - d * d * 2.2;
      }
      tmpObj.position.set(aside ? Math.min(x, 6) : x, y, z);
      tmpObj.rotation.set(0, 0, 0);
      tmpObj.scale.setScalar(u > 0.94 ? Math.max(0.001, (1 - u) / 0.06) : 1);
      tmpObj.updateMatrix();
      items.setMatrixAt(i, tmpObj.matrix);
      items.setColorAt(i, judged ? (aside ? cAsh : cGold) : cBone);
    }
    items.instanceMatrix.needsUpdate = true;
    if (items.instanceColor) items.instanceColor.needsUpdate = true;
    lens.position.y = 12.5 + Math.sin(s * 0.8) * 0.25;

    // Agents: visors breathe, documents lift and settle as they read.
    visors.forEach((v, i) => {
      (v.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.1 + 0.8 * Math.max(0, Math.sin(s * 2.2 + i * 1.3));
    });
    agentDocs.forEach((d, i) => {
      d.position.y = 3.3 + Math.max(0, Math.sin(s * 1.4 + i * 0.9)) * 1.2;
      d.rotation.x = Math.max(0, Math.sin(s * 1.4 + i * 0.9)) * -0.5;
    });

    // Mailbox: the flag rises as you arrive; envelopes leave in arcs.
    flag.rotation.x =
      -Math.PI / 2 + (Math.PI / 2) * easeOut3(prog(N, 0.66, 0.72));
    for (let i = 0; i < ENV; i++) {
      const e = envSeed[i];
      const u = (s * 0.11 + e.off) % 1;
      tmpObj.position.set(e.dx * u, 13 + Math.sin(u * Math.PI) * e.h, -u * 120);
      tmpObj.rotation.set(0.2, e.spin + u * 2, Math.sin(u * 8) * 0.3);
      tmpObj.scale.setScalar(u < 0.05 ? u / 0.05 : 1);
      tmpObj.updateMatrix();
      envelopes.setMatrixAt(i, tmpObj.matrix);
    }
    envelopes.instanceMatrix.needsUpdate = true;

    // Chart: bars grow on scroll toward the chart, the ball climbs them.
    const grow = easeOut3(prog(N, 0.72, 0.86));
    let lastTop = 0;
    for (let i = 0; i < BARS; i++) {
      const target = 3 + Math.pow(i + 1, 1.45) * 2.6;
      const local = clamp(grow * 1.6 - i * 0.09);
      const h = Math.max(
        0.3,
        target * easeOut3(local) + Math.sin(s * 1.3 + i) * 0.12 * local,
      );
      bars[i].scale.y = h;
      bars[i].position.y = h / 2;
      caps[i].position.set(bars[i].position.x, h + 0.25, 0);
      if (i === BARS - 1) lastTop = h;
    }
    const climb = (s * 0.18) % 1;
    const step = Math.min(BARS - 1, Math.floor(climb * BARS));
    const bx = -12 + step * 4;
    const by =
      bars[step].scale.y +
      1.6 +
      Math.abs(Math.sin(climb * BARS * Math.PI)) * 1.2;
    ball.position.set(bx, Math.min(by, lastTop + 3), 0);

    // The build. sink: how far each part is under the ground, 0 to 1.
    let tS = -1;
    if (N >= ENTER) {
      if (sweep0 < 0) sweep0 = time;
      tS = time - sweep0;
    } else sweep0 = -1;
    const sinkScroll = easeIn3(prog(N, SINK[0], SINK[1]));
    const riseOf = (f: number) => (tS < 0 ? 0 : easeOut3(clamp((tS - f * SWEEP_MS) / RISE_MS)));
    for (const p of parts) {
      const sink = N >= ENTER ? 1 - riseOf(p.f) : sinkScroll;
      if (dynamic.has(p.obj)) p.obj.position.y -= p.depth * sink;
      else p.obj.position.y = p.y - p.depth * sink;
      p.obj.visible = sink < 0.999;
    }
    const frontZ = tS < 0 ? FRONT_FROM : FRONT_FROM + (FRONT_TO - FRONT_FROM) * clamp(tS / SWEEP_MS);
    for (const t of tubes) {
      const u = N >= ENTER ? clamp((PIPE_Z0 - frontZ) / (PIPE_Z0 - PIPE_Z1)) : 1 - sinkScroll;
      t.mesh.geometry.setDrawRange(0, Math.floor((t.count * u) / 6) * 6);
      t.mesh.visible = u > 0.002;
    }
    for (const [layer, f] of gates) {
      layer.visible = N >= ENTER ? tS > f * SWEEP_MS + RISE_MS : sinkScroll < 0.5;
    }
    const inSweep = tS >= 0 && tS <= SWEEP_MS;
    front.visible = wake.visible = inSweep;
    if (inSweep) {
      front.position.set(8, 0.7, frontZ);
      wake.position.set(8, 0.68, frontZ + 8);
    }
    latMat.opacity = 0.16 * prog(N, SINK[0], ENTER) * (tS < 0 ? 1 : 1 - clamp((tS - SWEEP_MS) / 900) * 0.6);
    lattice.visible = latMat.opacity > 0.002;
    for (const c of cells) {
      const before = prog(N, SINK[1] - 0.01 + c.at * 0.006, ENTER);
      const passed = tS < 0 ? 0 : clamp((tS - c.f * SWEEP_MS) / 300);
      (c.m.material as THREE.MeshBasicMaterial).opacity = 0.55 * before * (1 - passed);
      c.m.visible = (c.m.material as THREE.MeshBasicMaterial).opacity > 0.002;
    }

    // Camera, and a shadow frustum that follows what it looks at.
    const { pos, look } = camAt(N);
    camera.position.copy(pos);
    camera.lookAt(look);
    sunLight.target.position.copy(look);
    sunLight.position.copy(look).addScaledVector(sunDir, 160);
    const wide = N < 0.06 || N > 0.92;
    const span = wide ? 130 : 70;
    if (sc.right !== span) {
      sc.left = -span;
      sc.right = span;
      sc.top = span;
      sc.bottom = -span;
      sc.updateProjectionMatrix();
    }
  }

  return {
    setN(n) {
      N = n;
    },
    setLoad(l) {
      load = l;
    },
    frame(time) {
      update(time);
      renderer.render(scene, camera);
    },
    still(n, time, sweepMs) {
      N = n;
      load = 1;
      // A still of the last phase shows the build finished, unless asked for
      // a moment inside it.
      if (n >= ENTER) sweep0 = time - (sweepMs ?? SWEEP_MS + RISE_MS + 1000);
      update(time);
      renderer.render(scene, camera);
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w < 768 ? 58 : 40;
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
      renderer.dispose();
    },
  };
}
