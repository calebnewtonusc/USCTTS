/* The home page's world: from a USC desk to real businesses.
 *
 * Caleb, 2026-10-05, on the cube block: "WTF does a cube have anything to
 * do with the club? I like the long 3d animation storytelling you had
 * earlier, just gotta refactor it to fit the club." So every object here
 * means something to a student or a business owner:
 *
 *   the desk     a student at night by a window onto campus brick and
 *                arches, laptop open: the visitor
 *   the street   a sunny LA street of small businesses: who TTS builds for
 *   the windows  each storefront shows the work, drawn into the world
 *                (panels.ts): a café's inbox, a law firm's CRM, a shop's
 *                customer list, a dental office's AI lesson
 *
 * One timeline T drives everything. The intro region of the page covers
 * T 0 to 1 (the desk, through the screen, a glimpse of the street, up into
 * the sky), Clay and Perplexity sit between, and the story region covers T
 * 1 to 2 (down from the same sky, one storefront per beat, back up). Both
 * regions meet at the same sky pose at T 1, so the handoffs are continuous.
 *
 * Framework-free on purpose: WorldScene.tsx owns scroll and the DOM. */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PANEL_H, PANEL_W, drawPanel } from "./panels";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeInOut3 = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

import { BEATS, BEAT_HALF, T_SWITCH } from "./timeline";

/** Stores along the street, by beat. */
const STORE_X = [0, 16, 32, 48];
const STORE_FRONT_Z = -6;
const WIN = { w: 5.2, h: 4.2, y: 2.75 };

const rbox = (w: number, h: number, d: number, r = 0.08) =>
  new RoundedBoxGeometry(w, h, d, 3, Math.min(r, Math.min(w, h, d) * 0.45));
const matte = (c: string | THREE.Color, rough = 0.82) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0 });

function canvasTex(
  w: number,
  h: number,
  draw: (c: CanvasRenderingContext2D) => void,
) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  draw(ctx);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export interface Box {
  l: number;
  r: number;
  t: number;
  b: number;
}

export interface Story {
  setT(t: number): void;
  setLoad(l: number): void;
  setBox(b: Box | null): void;
  frame(timeMs: number): void;
  resize(w: number, h: number): void;
  dispose(): void;
}

export function createStory(canvas: HTMLCanvasElement, narrow: boolean): Story {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.92;
  /* No real-time shadows: the shadow pass was the jank in the 2026-10-04
   * headed trace. Contact shadows are baked into soft gradient planes. */
  renderer.shadowMap.enabled = false;
  const camera = new THREE.PerspectiveCamera(narrow ? 52 : 38, 1, 0.03, 900);
  const font = getComputedStyle(document.body).fontFamily || "sans-serif";

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  /* A soft round shadow, reused under everything that touches a floor. */
  const blobTex = canvasTex(128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(40,45,60,0.55)");
    g.addColorStop(1, "rgba(40,45,60,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
  });
  const blobMat = new THREE.MeshBasicMaterial({
    map: blobTex,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const blob = (
    w: number,
    d: number,
    at: THREE.Vector3,
    parent: THREE.Object3D,
  ) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), blobMat);
    m.rotation.x = -Math.PI / 2;
    m.position.copy(at);
    parent.add(m);
    return m;
  };

  /* ================= the room: a desk by a window, at night ============== */
  const room = new THREE.Scene();
  room.background = new THREE.Color("#0e1530");
  room.environment = env;
  room.environmentIntensity = 0.12;
  room.fog = new THREE.Fog("#101a38", 14, 60);
  room.add(new THREE.HemisphereLight("#5a6fa8", "#1a1a26", 0.55));
  const lampLight = new THREE.PointLight("#ffe2b8", 0, 5, 1.6);
  room.add(lampLight);
  const screenLight = new THREE.PointLight("#cfe2ff", 0, 2.4, 1.8);
  room.add(screenLight);

  // The back wall with a wide window in it.
  const WALL_Z = -0.95;
  const OPEN = { x0: -0.7, x1: 1.5, y0: 0.98, y1: 2.25 };
  const wallMat = matte("#323b5c", 0.95);
  const wallPiece = (x0: number, x1: number, y0: number, y1: number) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(x1 - x0, y1 - y0, 0.12),
      wallMat,
    );
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, WALL_Z - 0.06);
    room.add(m);
  };
  wallPiece(-4, OPEN.x0, -1, 4);
  wallPiece(OPEN.x1, 5, -1, 4);
  wallPiece(OPEN.x0, OPEN.x1, -1, OPEN.y0);
  wallPiece(OPEN.x0, OPEN.x1, OPEN.y1, 4);
  const frameMat = matte("#ece6da", 0.7);
  const frameBar = (w: number, h: number, x: number, y: number) => {
    const m = new THREE.Mesh(rbox(w, h, 0.09, 0.02), frameMat);
    m.position.set(x, y, WALL_Z + 0.01);
    room.add(m);
  };
  const ow = OPEN.x1 - OPEN.x0,
    oh = OPEN.y1 - OPEN.y0,
    ocx = (OPEN.x0 + OPEN.x1) / 2,
    ocy = (OPEN.y0 + OPEN.y1) / 2;
  frameBar(ow + 0.08, 0.06, ocx, OPEN.y0);
  frameBar(ow + 0.08, 0.06, ocx, OPEN.y1);
  frameBar(0.06, oh, OPEN.x0, ocy);
  frameBar(0.06, oh, OPEN.x1, ocy);
  frameBar(0.04, oh, ocx, ocy);
  frameBar(ow, 0.035, ocx, OPEN.y0 + oh * 0.62);
  // The sill.
  const sill = new THREE.Mesh(rbox(ow + 0.3, 0.04, 0.22, 0.015), frameMat);
  sill.position.set(ocx, OPEN.y0 - 0.02, WALL_Z + 0.08);
  room.add(sill);

  // The desk.
  const deskMat = matte("#d8c7ad", 0.7);
  const desk = new THREE.Mesh(rbox(2.1, 0.05, 0.82, 0.02), deskMat);
  desk.position.set(0.35, 0.75, -0.48);
  room.add(desk);
  for (const [x, z] of [
    [-0.65, -0.82],
    [1.35, -0.82],
    [-0.65, -0.12],
    [1.35, -0.12],
  ]) {
    const leg = new THREE.Mesh(rbox(0.05, 0.75, 0.05, 0.015), deskMat);
    leg.position.set(x, 0.375, z);
    room.add(leg);
  }

  // The laptop, open, angled a little toward the chair.
  const laptop = new THREE.Group();
  laptop.position.set(0.42, 0.776, -0.42);
  laptop.rotation.y = -0.22;
  room.add(laptop);
  const alu = matte("#c9ced8", 0.45);
  const base = new THREE.Mesh(rbox(0.36, 0.014, 0.25, 0.006), alu);
  laptop.add(base);
  const keys = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.1),
    matte("#9aa1ad", 0.8),
  );
  keys.rotation.x = -Math.PI / 2;
  keys.position.set(0, 0.0075, -0.03);
  laptop.add(keys);
  const lid = new THREE.Group();
  lid.position.set(0, 0.007, -0.125);
  lid.rotation.x = -0.26;
  laptop.add(lid);
  const lidBox = new THREE.Mesh(rbox(0.36, 0.235, 0.008, 0.006), alu);
  lidBox.position.set(0, 0.1175, 0);
  lid.add(lidBox);
  // The screen: a note being typed at night, and the glow the camera goes
  // through. Its ground is the DOM glow's colour, so the pass through it
  // has no seam. Redrawn only when a character or the caret changes.
  const TYPED = "ok so what if the café just... didn't have to answer every email";
  const scrCv = document.createElement("canvas");
  scrCv.width = 1024;
  scrCv.height = 640;
  const scrCtx = scrCv.getContext("2d")!;
  const screenTex = new THREE.CanvasTexture(scrCv);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  screenTex.anisotropy = 8;
  let typedShown = -1,
    caretShown = false;
  const drawScreen = (n: number, caret: boolean) => {
    const c = scrCtx;
    const g = c.createLinearGradient(0, 0, 0, 640);
    g.addColorStop(0, "#dbe9f8");
    g.addColorStop(1, "#eef4fb");
    c.fillStyle = g;
    c.fillRect(0, 0, 1024, 640);
    // A plain notes window.
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.roundRect(96, 70, 832, 500, 22);
    c.fill();
    c.fillStyle = "#eef1f6";
    c.beginPath();
    c.roundRect(96, 70, 832, 56, [22, 22, 0, 0]);
    c.fill();
    ["#f26b5b", "#f5be4f", "#5fc454"].forEach((col, i) => {
      c.fillStyle = col;
      c.beginPath();
      c.arc(132 + i * 30, 98, 9, 0, Math.PI * 2);
      c.fill();
    });
    c.fillStyle = "#8a8f99";
    c.font = `28px ${font}`;
    c.textAlign = "center";
    c.fillText("ideas.txt", 512, 108);
    c.textAlign = "left";
    c.fillStyle = "#2a1b1e";
    c.font = `46px ${font}`;
    // Wrap at the window's width.
    const words = TYPED.slice(0, n).split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const next = cur ? cur + " " + w : w;
      if (c.measureText(next).width > 720 && cur) {
        lines.push(cur);
        cur = w;
      } else cur = next;
    }
    lines.push(cur);
    lines.forEach((l, i) => c.fillText(l, 150, 210 + i * 66));
    if (caret) {
      const last = lines[lines.length - 1];
      c.fillStyle = "#2f80ed";
      c.fillRect(150 + c.measureText(last).width + 6, 172 + (lines.length - 1) * 66, 4, 50);
    }
    screenTex.needsUpdate = true;
  };
  drawScreen(0, false);
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTex,
    toneMapped: false,
    color: "#000000",
  });
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.33, 0.206),
    screenMat,
  );
  screen.position.set(0, 0.1175, 0.0045);
  lid.add(screen);
  blob(0.62, 0.42, new THREE.Vector3(0.42, 0.7765, -0.42), room);

  // A notebook in USC cardinal, and a mug.
  const book = new THREE.Mesh(
    rbox(0.22, 0.016, 0.29, 0.006),
    matte("#990000", 0.75),
  );
  book.position.set(0.02, 0.783, -0.28);
  book.rotation.y = 0.32;
  room.add(book);
  const pages = new THREE.Mesh(
    rbox(0.21, 0.012, 0.28, 0.004),
    matte("#f3eee4"),
  );
  pages.position.set(0.02, 0.773, -0.28);
  pages.rotation.y = 0.32;
  room.add(pages);
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.038, 0.1, 28),
    matte("#f1ece3", 0.5),
  );
  mug.position.set(-0.05, 0.825, -0.62);
  room.add(mug);
  blob(0.2, 0.2, new THREE.Vector3(-0.05, 0.7765, -0.62), room);

  // The lamp: what comes on first.
  const lamp = new THREE.Group();
  lamp.position.set(1.12, 0.775, -0.72);
  lamp.rotation.y = Math.PI;
  room.add(lamp);
  const lampMat = matte("#2b3040", 0.5);
  const lbase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.09, 0.025, 32),
    lampMat,
  );
  lamp.add(lbase);
  const arm1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.011, 0.42, 12),
    lampMat,
  );
  arm1.position.set(0.04, 0.2, 0);
  arm1.rotation.z = -0.2;
  lamp.add(arm1);
  const arm2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.011, 0.3, 12),
    lampMat,
  );
  arm2.position.set(0.17, 0.43, 0.02);
  arm2.rotation.z = -1.15;
  lamp.add(arm2);
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.085, 0.13, 32, 1, true),
    lampMat,
  );
  shade.position.set(0.3, 0.44, 0.03);
  shade.rotation.z = 0.5;
  (shade.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  lamp.add(shade);
  const bulbMat = new THREE.MeshBasicMaterial({
    color: "#000000",
    toneMapped: false,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 20, 12), bulbMat);
  bulb.position.set(0.32, 0.4, 0.03);
  lamp.add(bulb);
  lamp.updateMatrixWorld(true);
  lampLight.position.copy(bulb.getWorldPosition(new THREE.Vector3()));
  // The pool of light the lamp throws on the desk.
  const poolTex = canvasTex(128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,226,184,0.55)");
    g.addColorStop(1, "rgba(255,226,184,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
  });
  const poolMat = new THREE.MeshBasicMaterial({
    map: poolTex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    opacity: 0,
  });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0.78, 0.778, -0.5);
  room.add(pool);

  /* Outside: campus at night. Generic Romanesque brick with an arcade of
   * round arches and a bell tower: no landmark, no logo. */
  const campus = new THREE.Group();
  campus.position.set(0.6, -5, -15);
  room.add(campus);
  const brickTex = canvasTex(256, 256, (c) => {
    c.fillStyle = "#7d3f36";
    c.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 16) {
      c.fillStyle = "rgba(40,18,16,0.35)";
      c.fillRect(0, y, 256, 2);
      for (let x = (y / 16) % 2 ? 0 : 16; x < 256; x += 32)
        c.fillRect(x, y, 2, 16);
    }
  });
  brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
  brickTex.repeat.set(6, 3);
  const brick = new THREE.MeshStandardMaterial({
    map: brickTex,
    roughness: 0.95,
  });
  const hall = new THREE.Mesh(rbox(22, 9, 3, 0.1), brick);
  hall.position.set(0, 4.5, -1.5);
  campus.add(hall);
  const cap = new THREE.Mesh(rbox(22.6, 0.4, 3.4, 0.05), matte("#c8b9a2"));
  cap.position.set(0, 9.1, -1.5);
  campus.add(cap);
  const tower = new THREE.Mesh(rbox(3.2, 17, 3.2, 0.08), brick);
  tower.position.set(7.5, 8.5, -2);
  campus.add(tower);
  const towerCap = new THREE.Mesh(
    new THREE.ConeGeometry(2.5, 2.6, 4),
    matte("#5b4b45"),
  );
  towerCap.position.set(7.5, 18.3, -2);
  towerCap.rotation.y = Math.PI / 4;
  campus.add(towerCap);
  const archShape = (w: number, h: number) => {
    const s = new THREE.Shape();
    const r = w / 2;
    s.moveTo(-r, 0);
    s.lineTo(-r, h - r);
    s.absarc(0, h - r, r, Math.PI, 0, true);
    s.lineTo(r, 0);
    s.lineTo(-r, 0);
    return new THREE.ShapeGeometry(s, 24);
  };
  // Every lit arch shares one material per row, so the load clock can
  // bring the rows up in turn.
  const litWarm = new THREE.Color("#ffe3b4");
  const dark = new THREE.Color("#1d1a26");
  const rows: THREE.MeshBasicMaterial[] = [];
  const archRow = (
    n: number,
    w: number,
    h: number,
    y: number,
    x0: number,
    gap: number,
    parentZ: number,
  ) => {
    const m = new THREE.MeshBasicMaterial({
      color: dark.clone(),
      toneMapped: false,
    });
    rows.push(m);
    const g = archShape(w, h);
    for (let i = 0; i < n; i++) {
      const a = new THREE.Mesh(g, m);
      a.position.set(x0 + i * gap, y, parentZ);
      campus.add(a);
    }
  };
  archRow(7, 1.9, 3.2, 0.2, -9, 2.6, 0.02);
  archRow(9, 0.9, 1.8, 4.4, -9.4, 2.0, 0.02);
  archRow(2, 0.8, 1.6, 13.4, 6.9, 1.2, -0.38);
  const groundOut = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 40),
    matte("#1a2034"),
  );
  groundOut.rotation.x = -Math.PI / 2;
  groundOut.position.set(0, 0, 8);
  campus.add(groundOut);
  // Lamp posts along the walk, their heads glowing.
  const postMat = matte("#22263a");
  const headMat = new THREE.MeshBasicMaterial({
    color: dark.clone(),
    toneMapped: false,
  });
  rows.push(headMat);
  for (const x of [-7, -1, 5]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 3.2, 10),
      postMat,
    );
    post.position.set(x, 1.6, 4);
    campus.add(post);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 10),
      headMat,
    );
    head.position.set(x, 3.3, 4);
    campus.add(head);
  }
  // The night sky, with a few stars.
  const nightTex = canvasTex(512, 512, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#0a1230");
    g.addColorStop(0.7, "#1d2b57");
    g.addColorStop(1, "#33406e");
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 512);
    let seed = 7;
    const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 90; i++) {
      c.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.5})`;
      c.fillRect(r() * 512, r() * 340, 1.6, 1.6);
    }
  });
  const night = new THREE.Mesh(
    new THREE.PlaneGeometry(140, 70),
    new THREE.MeshBasicMaterial({
      map: nightTex,
      toneMapped: false,
      fog: false,
    }),
  );
  night.position.set(0.6, 18, -50);
  room.add(night);

  /* ================= the street: small businesses at golden hour ======= */
  const street = new THREE.Scene();
  street.environment = env;
  street.environmentIntensity = 0.3;
  const SKY_TOP = new THREE.Color("#78b4ea");
  const SKY_LOW = new THREE.Color("#fbf6ec");
  street.fog = new THREE.Fog(SKY_LOW, 130, 420);
  const sunDir = new THREE.Vector3(-0.55, 0.32, 0.77).normalize();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(600, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      uniforms: {
        top: { value: SKY_TOP },
        low: { value: SKY_LOW },
        sunDir: { value: sunDir },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 top; uniform vec3 low; uniform vec3 sunDir; varying vec3 vDir;
        void main(){
          float h = smoothstep(-0.02, 0.6, vDir.y);
          vec3 c = mix(low, top, h);
          float s = max(dot(normalize(vDir), sunDir), 0.0);
          c += vec3(1.0, 0.97, 0.9) * (pow(s, 600.0) * 0.5 + pow(s, 12.0) * 0.12);
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  street.add(sky);
  street.add(new THREE.HemisphereLight("#cfe3f8", "#dcd0bd", 0.6));
  const sun = new THREE.DirectionalLight("#fff1dc", 2.0);
  sun.position.copy(sunDir).multiplyScalar(100);
  street.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    matte("#e9e4da", 0.95),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(30, -0.01, 0);
  street.add(ground);
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 11),
    matte("#aeb6c2", 0.95),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(30, 0.005, 3.5);
  street.add(road);
  const dashMat = new THREE.MeshBasicMaterial({ color: "#f7f5ef" });
  for (let x = -80; x < 160; x += 6) {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.18), dashMat);
    d.rotation.x = -Math.PI / 2;
    d.position.set(x, 0.01, 3.5);
    street.add(d);
  }
  const walkMat = matte("#f1ece2", 0.9);
  const walk = new THREE.Mesh(rbox(400, 0.16, 3.6, 0.04), walkMat);
  walk.position.set(30, 0.08, -4.2);
  street.add(walk);
  const walk2 = new THREE.Mesh(rbox(400, 0.16, 3.6, 0.04), walkMat);
  walk2.position.set(30, 0.08, 10.8);
  // (The far side's buildings stand back at z 22.5 behind a wide walk.)
  street.add(walk2);

  // Contact shadow along every building's foot.
  const footTex = canvasTex(4, 64, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "rgba(40,45,60,0.32)");
    g.addColorStop(1, "rgba(40,45,60,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 64);
  });
  const footMat = new THREE.MeshBasicMaterial({
    map: footTex,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const foot = (x: number, w: number, z: number, y: number, flip = false) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.6), footMat);
    m.rotation.x = -Math.PI / 2;
    if (flip) m.rotation.z = Math.PI;
    m.position.set(x, y, z + (flip ? -0.8 : 0.8));
    street.add(m);
  };

  interface Store {
    win: THREE.Mesh;
    winMat: THREE.MeshBasicMaterial;
    tex: THREE.CanvasTexture;
    ctx: CanvasRenderingContext2D;
    lastP: number;
    corners: THREE.Vector3[];
  }
  const stores: Store[] = [];
  const STORE = [
    { name: "CAFÉ", body: "#efdcbf", accent: "#8ec5ff", accentInk: "#2f6aa6" },
    {
      name: "LAW OFFICE",
      body: "#cfdcec",
      accent: "#12a594",
      accentInk: "#0b6e63",
    },
    {
      name: "GIFT SHOP",
      body: "#efd2d8",
      accent: "#990000",
      accentInk: "#990000",
    },
    {
      name: "DENTAL",
      body: "#c9e8e0",
      accent: "#ffcc00",
      accentInk: "#7a5a00",
    },
  ];
  const wallShadeTex = canvasTex(4, 64, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "rgba(40,45,60,0.28)");
    g.addColorStop(1, "rgba(40,45,60,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 64);
  });
  const wallShadeMat = new THREE.MeshBasicMaterial({ map: wallShadeTex, transparent: true, depthWrite: false, toneMapped: false });
  const glassMat = new THREE.MeshStandardMaterial({
    color: "#58708a",
    roughness: 0.25,
    metalness: 0.1,
  });
  const trimMat = matte("#ffffff", 0.6);
  STORE.forEach((s, k) => {
    const x = STORE_X[k];
    const g = new THREE.Group();
    g.position.set(x, 0, STORE_FRONT_Z);
    street.add(g);
    const body = new THREE.Mesh(rbox(10, 10, 8, 0.3), matte(s.body, 0.85));
    body.position.set(0, 5, -4);
    g.add(body);
    const cornice = new THREE.Mesh(rbox(10.4, 0.5, 8.4, 0.12), trimMat);
    cornice.position.set(0, 10, -4);
    g.add(cornice);
    // The display window: the work, drawn into the world.
    const cv = document.createElement("canvas");
    cv.width = PANEL_W;
    cv.height = PANEL_H;
    const ctx = cv.getContext("2d")!;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const winMat = new THREE.MeshBasicMaterial({
      map: tex,
      toneMapped: false,
      color: "#ffffff",
    });
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(WIN.w, WIN.w * (PANEL_H / PANEL_W)),
      winMat,
    );
    win.position.set(-1.4, WIN.y, 0.03);
    g.add(win);
    const fw = WIN.w,
      fh = WIN.w * (PANEL_H / PANEL_W);
    const frame = (w: number, h: number, px: number, py: number) => {
      const m = new THREE.Mesh(rbox(w, h, 0.22, 0.05), trimMat);
      m.position.set(px, py, 0.08);
      g.add(m);
    };
    frame(fw + 0.4, 0.2, -1.4, WIN.y - fh / 2 - 0.1);
    frame(fw + 0.4, 0.2, -1.4, WIN.y + fh / 2 + 0.1);
    frame(0.2, fh + 0.4, -1.4 - fw / 2 - 0.1, WIN.y);
    frame(0.2, fh + 0.4, -1.4 + fw / 2 + 0.1, WIN.y);
    // The door.
    const door = new THREE.Mesh(rbox(1.5, 2.9, 0.08, 0.04), glassMat);
    door.position.set(3.2, 1.45 + 0.16, 0.04);
    g.add(door);
    frame(1.8, 0.18, 3.2, 3.15);
    // The awning, in the colour of the work in its window.
    // The awning's shade on the wall and window under it.
    const shadeStrip = new THREE.Mesh(new THREE.PlaneGeometry(fw + 2.2, 1.4), wallShadeMat);
    shadeStrip.position.set(-0.3, WIN.y + fh / 2 - 0.25, 0.06);
    g.add(shadeStrip);
    const awn = new THREE.Mesh(
      rbox(fw + 2.2, 0.12, 1.7, 0.05),
      matte(s.accent, 0.7),
    );
    awn.position.set(-0.3, WIN.y + fh / 2 + 0.75, 0.75);
    awn.rotation.x = 0.32;
    g.add(awn);
    const val = new THREE.Mesh(
      rbox(fw + 2.2, 0.32, 0.06, 0.03),
      matte(s.accent, 0.7),
    );
    val.position.set(-0.3, WIN.y + fh / 2 + 0.35, 1.55);
    g.add(val);
    // The sign.
    const signTex = canvasTex(1024, 192, (c) => {
      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, 1024, 192);
      c.fillStyle = s.accentInk;
      c.font = `500 104px ${font}`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(s.name, 512, 100);
    });
    const sign = new THREE.Mesh(rbox(5.6, 1.05, 0.14, 0.05), trimMat);
    sign.position.set(-0.3, 7.2, 0.08);
    g.add(sign);
    const signFace = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 1.0125),
      new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false }),
    );
    signFace.position.set(-0.3, 7.2, 0.16);
    g.add(signFace);
    // Upper windows.
    for (const ux of [-3.2, 0, 3.2]) {
      const uw = new THREE.Mesh(rbox(1.5, 1.2, 0.06, 0.04), glassMat);
      uw.position.set(ux, 8.6, 0.02);
      g.add(uw);
    }
    foot(x, 10.4, STORE_FRONT_Z, 0.17);
    g.updateMatrixWorld(true);
    const corners = [
      [-fw / 2, -fh / 2],
      [fw / 2, -fh / 2],
      [-fw / 2, fh / 2],
      [fw / 2, fh / 2],
    ]
      .map(([a, b]) => new THREE.Vector3(-1.4 + a, WIN.y + b, 0.03))
      // The sign too, so no line of text ever sits on it.
      .concat([new THREE.Vector3(-3.1, 7.75, 0.1), new THREE.Vector3(2.5, 7.75, 0.1)])
      .map((v) => v.applyMatrix4(g.matrixWorld));
    stores.push({ win, winMat, tex, ctx, lastP: -1, corners });
  });
  // The rest of the street, plain, so the four read as the ones that matter.
  const FILL = ["#e9dfcf", "#d9e2ec", "#eee1d6", "#dde8de"];
  // Plain windows, so the neighbours read as buildings, not slabs.
  const winGeo = rbox(1.3, 1.5, 0.06, 0.04);
  const windows = (cx: number, frontZ: number, w: number, h: number) => {
    const cols = Math.max(1, Math.floor(w / 3));
    for (let r = 0; r * 3 + 3 < h; r++)
      for (let c = 0; c < cols; c++) {
        const m = new THREE.Mesh(winGeo, glassMat);
        m.position.set(cx + (c - (cols - 1) / 2) * 3, 2.4 + r * 3, frontZ + 0.03);
        street.add(m);
      }
  };
  for (let i = -3; i < 9; i++) {
    const x = -8 + i * 16;
    if (i >= 0 && i < 4) {
      // Between the four stores, one narrow building each.
      const b = new THREE.Mesh(
        rbox(5.4, 8 + (i % 2) * 2, 7, 0.25),
        matte(FILL[i % 4]),
      );
      b.position.set(x, 4 + (i % 2), STORE_FRONT_Z - 4.2);
      street.add(b);
      windows(x, STORE_FRONT_Z - 0.7, 5.4, 8 + (i % 2) * 2);
      foot(x, 5.6, STORE_FRONT_Z - 0.7, 0.17);
      continue;
    }
    const b = new THREE.Mesh(
      rbox(14.5, 9 + (i % 3) * 2.5, 8, 0.3),
      matte(FILL[(i + 4) % 4]),
    );
    b.position.set(x + 8, 4.5 + (i % 3) * 1.25, STORE_FRONT_Z - 4);
    street.add(b);
    windows(x + 8, STORE_FRONT_Z, 14.5, 9 + (i % 3) * 2.5);
    foot(x + 8, 14.6, STORE_FRONT_Z, 0.17);
  }
  // Across the street, low and simple.
  for (let i = -4; i < 10; i++) {
    const h = 6 + ((i * 7) % 4);
    const b = new THREE.Mesh(rbox(12, h, 7, 0.3), matte(FILL[(i + 8) % 4]));
    b.position.set(i * 13.5, h / 2, 26);
    street.add(b);
    foot(i * 13.5, 12, 22.5, 0.17, true);
  }
  // The city behind, pale in the haze.
  for (let i = -6; i < 14; i++) {
    const h = 14 + ((i * 13) % 9) * 2.2;
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(9, h, 9),
      matte("#e4e8ee", 1),
    );
    b.position.set(i * 11, h / 2, -38 - ((i * 5) % 3) * 6);
    street.add(b);
  }

  /* ================= the camera ================= */
  interface Key {
    t: number;
    pos: [number, number, number];
    look: [number, number, number];
  }
  // The screen's centre and facing, for the push through it.
  lid.updateMatrixWorld(true);
  const sc = screen.getWorldPosition(new THREE.Vector3());
  const sn = new THREE.Vector3(0, 0, 1).transformDirection(screen.matrixWorld);
  const at = (d: number) =>
    sc.clone().addScaledVector(sn, d).toArray() as [number, number, number];
  const ROOM: Key[] = [
    { t: 0, pos: [1.45, 1.36, 1.25], look: [0.2, 1.02, -0.62] },
    { t: 0.12, pos: [1.3, 1.3, 1.08], look: [0.24, 1.0, -0.6] },
    { t: 0.3, pos: at(0.75), look: sc.toArray() as [number, number, number] },
    {
      t: T_SWITCH,
      pos: at(0.13),
      look: sc.toArray() as [number, number, number],
    },
  ];
  const beatKeys = (k: number): Key[] => {
    const x = STORE_X[k];
    const c = BEATS[k];
    // Arrive on the whole storefront, sign and all, then push in toward
    // the window while its work plays.
    return [
      { t: c - BEAT_HALF, pos: [x + 8.5, 4.6, 15.5], look: [x - 0.4, 4.4, STORE_FRONT_Z] },
      { t: c + BEAT_HALF, pos: [x + 5.4, 3.6, 9.6], look: [x - 0.9, 3.6, STORE_FRONT_Z] },
    ];
  };
  const STREET: Key[] = [
    { t: T_SWITCH, pos: [-16, 9, 16], look: [6, 4, -6] },
    { t: 0.55, pos: [-12, 7.5, 14], look: [14, 3.5, -6] },
    { t: 0.8, pos: [2, 7, 13], look: [32, 3.5, -6] },
    { t: 1, pos: [2, 14, 16], look: [34, 46, -10] },
    { t: 1.06, pos: [-2, 13, 16], look: [20, 34, -8] },
    { t: 1.13, pos: [-7, 6, 15], look: [4, 3.5, -6] },
    ...beatKeys(0),
    ...beatKeys(1),
    ...beatKeys(2),
    ...beatKeys(3),
    { t: 1.92, pos: [58, 12, 18], look: [80, 30, -20] },
    { t: 2, pos: [62, 20, 18], look: [90, 70, -20] },
  ];
  const curve = (keys: Key[]) => ({
    keys,
    pos: new THREE.CatmullRomCurve3(
      keys.map((k) => new THREE.Vector3(...k.pos)),
      false,
      "centripetal",
    ),
    look: new THREE.CatmullRomCurve3(
      keys.map((k) => new THREE.Vector3(...k.look)),
      false,
      "centripetal",
    ),
  });
  const roomPath = curve(ROOM);
  const streetPath = curve(STREET);
  const sample = (path: ReturnType<typeof curve>, t: number) => {
    const K = path.keys;
    let k = 0;
    while (k < K.length - 2 && t > K[k + 1].t) k++;
    const f = easeInOut3(prog(t, K[k].t, K[k + 1].t));
    const u = (k + f) / (K.length - 1);
    return { pos: path.pos.getPoint(u), look: path.look.getPoint(u) };
  };

  /* ================= state ================= */
  let T = 0,
    load = 0;
  let box: Box | null = null;
  let viewW = 1,
    viewH = 1;
  let fitS = 1,
    fitX = 0,
    fitY = 0,
    lastS = -1;
  const v = new THREE.Vector3();

  // The key object, for keeping text off it: the laptop in the intro, the
  // window in each beat.
  const laptopCorners = (() => {
    room.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(laptop).union(new THREE.Box3().setFromObject(lamp)).union(new THREE.Box3().setFromObject(book));
    const out: THREE.Vector3[] = [];
    for (const x of [b.min.x, b.max.x])
      for (const y of [b.min.y, b.max.y])
        for (const z of [b.min.z, b.max.z])
          out.push(new THREE.Vector3(x, y, z));
    return out;
  })();
  const keyPoints = (): THREE.Vector3[] | null => {
    if (T < 0.14) return laptopCorners;
    for (let k = 0; k < BEATS.length; k++)
      if (Math.abs(T - BEATS[k]) < BEAT_HALF + 0.05) return stores[k].corners;
    return null;
  };
  /** How far the view slides to put the subject at 66% across (desktop) or
   * in the top half (phone), by T: off for the pass through the screen and
   * the glimpse, on for the desk and the beats. */
  const sideWeight = () => {
    if (T < 1) return 1 - smooth(prog(T, 0.12, 0.3));
    return smooth(prog(T, 1.08, 1.16)) * (1 - smooth(prog(T, 1.88, 1.94)));
  };

  function frameCamera(pos: THREE.Vector3, look: THREE.Vector3, dt: number) {
    const w = sideWeight();
    const ox = viewW >= 768 ? -viewW * 0.16 * w : 0;
    const oy = viewW >= 768 ? 0 : viewH * 0.14 * w;
    camera.position.copy(pos);
    camera.lookAt(look);
    camera.setViewOffset(viewW, viewH, ox, oy, viewW, viewH);
    camera.updateMatrixWorld();
    let tS = 1,
      tX = 0,
      tY = 0;
    const pts = keyPoints();
    if (box && pts) {
      let x0 = Infinity,
        x1 = -Infinity,
        y0 = Infinity,
        y1 = -Infinity;
      for (const p of pts) {
        v.copy(p).project(camera);
        const sx = ((v.x + 1) / 2) * viewW,
          sy = ((1 - v.y) / 2) * viewH;
        x0 = Math.min(x0, sx);
        x1 = Math.max(x1, sx);
        y0 = Math.min(y0, sy);
        y1 = Math.max(y1, sy);
      }
      v.copy(look).project(camera);
      const ax = ((v.x + 1) / 2) * viewW,
        ay = ((1 - v.y) / 2) * viewH;
      tS = Math.max(
        0.3,
        Math.min(1, (box.r - box.l) / (x1 - x0), (box.b - box.t) / (y1 - y0)),
      );
      const nx0 = ax + (x0 - ax) * tS,
        nx1 = ax + (x1 - ax) * tS,
        ny0 = ay + (y0 - ay) * tS,
        ny1 = ay + (y1 - ay) * tS;
      if (nx0 < box.l) tX = box.l - nx0;
      else if (nx1 > box.r) tX = box.r - nx1;
      if (ny1 > box.b) tY = box.b - ny1;
      else if (ny0 < box.t) tY = box.t - ny0;
    }
    const k = dt === 0 ? 1 : clamp(dt * 7);
    fitS += (tS - fitS) * k;
    fitX += (tX - fitX) * k;
    fitY += (tY - fitY) * k;
    camera.position.copy(
      pos
        .sub(look)
        .multiplyScalar(1 / fitS)
        .add(look),
    );
    camera.lookAt(look);
    camera.setViewOffset(viewW, viewH, ox - fitX, oy - fitY, viewW, viewH);
    camera.updateMatrixWorld();
  }

  const black = new THREE.Color("#000000");
  const white = new THREE.Color("#ffffff");
  const glassDim = new THREE.Color("#6e8196");
  function update(time: number) {
    const s = time / 1000;
    const dt = lastS < 0 ? 0 : clamp(s - lastS, 0, 0.1);
    lastS = s;

    // The load: the lamp flickers on, then the campus windows row by row,
    // then the laptop screen.
    const lampOn = (() => {
      const t = prog(load, 0.05, 0.45);
      if (t >= 1) return 1;
      // Two quick catches before it holds: a fluorescent's start, slowed.
      const f =
        t < 0.25
          ? t * 4 * 0.7
          : t < 0.35
            ? 0.15
            : t < 0.55
              ? 0.85
              : t < 0.62
                ? 0.3
                : t;
      return clamp(f);
    })();
    lampLight.intensity = 2.4 * lampOn;
    bulbMat.color.copy(black).lerp(new THREE.Color("#fff1d6"), lampOn);
    poolMat.opacity = lampOn;
    rows.forEach((m, i) =>
      m.color
        .copy(dark)
        .lerp(
          litWarm,
          smooth(prog(load, 0.3 + i * 0.12, 0.5 + i * 0.12)) * 0.85,
        ),
    );
    const scr = smooth(prog(load, 0.6, 0.95));
    screenMat.color.copy(black).lerp(white, scr);
    // The note types itself: the first words on the load, the rest as the
    // camera leans in, at a person's pace.
    const typed = Math.round(
      TYPED.length * Math.min(1, 0.22 * prog(load, 0.7, 1) + 0.78 * prog(T, 0.04, 0.24)),
    );
    const caret = typed < TYPED.length ? true : Math.floor(s * 2) % 2 === 0;
    if (typed !== typedShown || caret !== caretShown) {
      typedShown = typed;
      caretShown = caret;
      drawScreen(typed, caret && scr > 0.5);
    }
    screenLight.intensity = 0.9 * scr + 1.6 * smooth(prog(T, 0.2, T_SWITCH));
    screenLight.position.copy(sc).addScaledVector(sn, 0.25);

    // The windows on the street: lit one after another in the glimpse, and
    // each one plays its work during its beat.
    stores.forEach((st, k) => {
      const lit = T < 1 ? smooth(prog(T, 0.52 + k * 0.06, 0.6 + k * 0.06)) : 1;
      st.winMat.color.copy(glassDim).lerp(white, lit);
      const p =
        T < 1
          ? lit
          : prog(T, BEATS[k] - BEAT_HALF - 0.04, BEATS[k] + BEAT_HALF * 0.4);
      // Redraw only when the panel changes, so a still frame uploads
      // nothing.
      if (Math.abs(p - st.lastP) > 0.002 || (st.lastP < 0 && p === 0)) {
        st.lastP = p;
        drawPanel(k, st.ctx, p, font);
        st.tex.needsUpdate = true;
      }
    });

    const inRoom = T < T_SWITCH;
    const { pos, look } = inRoom ? sample(roomPath, T) : sample(streetPath, T);
    // A breath of drift, so a still frame is never dead; none in the push.
    const drift = inRoom ? 1 - prog(T, 0.12, 0.25) : 1;
    pos.x += Math.sin(s * 0.23) * (inRoom ? 0.02 : 0.25) * drift;
    pos.y += Math.sin(s * 0.19) * (inRoom ? 0.012 : 0.15) * drift;
    frameCamera(pos, look, dt);
    return inRoom ? room : street;
  }

  // Draw every panel once so no window is ever blank.
  stores.forEach((st, k) => {
    drawPanel(k, st.ctx, 0, font);
    st.tex.needsUpdate = true;
  });
  renderer.compile(room, camera);
  renderer.compile(street, camera);

  return {
    setT(t) {
      T = t;
    },
    setLoad(l) {
      load = l;
    },
    setBox(b) {
      box = b;
    },
    frame(time) {
      const scene = update(time);
      renderer.render(scene, camera);
    },
    resize(w, h) {
      viewW = w;
      viewH = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w < 768 ? 52 : 38;
      camera.updateProjectionMatrix();
    },
    dispose() {
      for (const sc of [room, street])
        sc.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          const mm = m.material as
            | THREE.Material
            | THREE.Material[]
            | undefined;
          const list = Array.isArray(mm) ? mm : mm ? [mm] : [];
          for (const x of list) {
            const tex = (x as THREE.MeshBasicMaterial).map;
            if (tex) tex.dispose();
            x.dispose();
          }
        });
      env.dispose();
      renderer.dispose();
    },
  };
}
