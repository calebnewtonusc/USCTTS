#!/usr/bin/env node
/*
 * Builds public/tts/grid/la-grid.bin, the LA street field the home page draws.
 *
 * Source: OpenStreetMap via the Overpass API. Data (c) OpenStreetMap
 * contributors, ODbL 1.0. The site never calls Overpass at runtime; this
 * script runs once and the binary is committed.
 *
 *   node scripts/build-la-grid.mjs            fetch (or reuse cache) and build
 *   node scripts/build-la-grid.mjs --refetch  ignore the cache
 *
 * Raw responses are cached in $LA_GRID_CACHE (default os.tmpdir()/la-grid-cache)
 * so tuning the decimation never re-queries the API.
 *
 * Layout of la-grid.bin (little endian), all coordinates are int16 metres on a
 * local plane centred on USC (34.0224, -118.2851), x east, y north:
 *   header   uint32 x 8: magic 0x4c414731 ("LAG1"), streetCount, fwyVertCount,
 *            fwyLineCount, bizCount, nodeCount, edgeCount, reserved
 *   streets  int16 x,y * streetCount, then uint8 class * streetCount (padded to 4)
 *            class: 0 residential, 1 tertiary, 2 secondary, 3 primary
 *   freeways int16 x,y * fwyVertCount, then uint32 start,count,route * fwyLineCount
 *            route: 0 I-10, 1 I-110, 2 US-101, 3 I-5
 *   biz      int16 x,y * bizCount, then uint8 kind * bizCount (padded to 4)
 *            kind: 0 shop, 1 restaurant, 2 cafe, 3 dentist, 4 office
 *   graph    int16 x,y * nodeCount, then uint32 a,b * edgeCount
 *            arterial intersections (primary, secondary, tertiary) for routing
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public/tts/grid");
const CACHE = process.env.LA_GRID_CACHE || join(tmpdir(), "la-grid-cache");
const REFETCH = process.argv.includes("--refetch");

const LAT0 = 34.0224;
const LON0 = -118.2851;
const HALF = 6000; // metres: the brief asked for a 12 by 12 km box
const M_PER_DEG_LAT = 111320;
const M_PER_DEG_LON = 111320 * Math.cos((LAT0 * Math.PI) / 180);
const S = LAT0 - HALF / M_PER_DEG_LAT;
const N = LAT0 + HALF / M_PER_DEG_LAT;
const W = LON0 - HALF / M_PER_DEG_LON;
const E = LON0 + HALF / M_PER_DEG_LON;
const BBOX = `${S.toFixed(5)},${W.toFixed(5)},${N.toFixed(5)},${E.toFixed(5)}`;

// Spacing per class. The brief asked for 25 to 40 m; arterials get the tight
// end so the big streets read as continuous lines of light.
const SPACING = { 0: 26, 1: 25, 2: 24, 3: 22 };
// Two samples closer than this collapse into one (intersections, dual
// carriageways drawn as two parallel ways).
const MERGE = 9;
const BIZ_TARGET = 420;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
const SOURCE_URL = ENDPOINTS[0];

const project = (lat, lon) => [
  (lon - LON0) * M_PER_DEG_LON,
  (lat - LAT0) * M_PER_DEG_LAT,
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function overpass(name, query) {
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, `${name}.json`);
  if (!REFETCH && existsSync(file))
    return JSON.parse(readFileSync(file, "utf8"));
  let wait = 5000;
  for (let attempt = 0; attempt < 8; attempt++) {
    const url = ENDPOINTS[attempt % ENDPOINTS.length];
    try {
      process.stdout.write(`overpass ${name} via ${new URL(url).host} ... `);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "usctts.com-grid-builder/1.0 (one-off build, github.com/calebnewtonusc)",
        },
        body: "data=" + encodeURIComponent(query),
      });
      if (res.status === 429 || res.status === 504 || res.status >= 500) {
        console.log(`HTTP ${res.status}, backing off ${wait / 1000}s`);
        await sleep(wait);
        wait = Math.min(wait * 2, 120000);
        continue;
      }
      if (!res.ok)
        throw new Error(
          `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`,
        );
      const text = await res.text();
      const json = JSON.parse(text);
      if (json.remark && /runtime error|timed out/i.test(json.remark))
        throw new Error(json.remark);
      writeFileSync(file, text);
      console.log(
        `${(text.length / 1e6).toFixed(1)} MB, ${json.elements.length} elements`,
      );
      return json;
    } catch (err) {
      console.log(`failed: ${err.message}; backing off ${wait / 1000}s`);
      await sleep(wait);
      wait = Math.min(wait * 2, 120000);
    }
  }
  throw new Error(`overpass ${name}: gave up after 8 attempts`);
}

const CLASS = { residential: 0, tertiary: 1, secondary: 2, primary: 3 };

function resample(coords, spacing, closed = false) {
  // coords: [[x,y],...] -> points every `spacing` metres along the polyline,
  // offset by half a step so neighbouring ways do not pile up at shared ends.
  // `closed` keeps both true endpoints instead, so freeway ribbons built from
  // consecutive OSM ways meet without a gap.
  const out = closed && coords.length ? [coords[0]] : [];
  let carry = closed ? spacing : spacing * 0.5;
  for (let i = 1; i < coords.length; i++) {
    const [ax, ay] = coords[i - 1];
    const [bx, by] = coords[i];
    const len = Math.hypot(bx - ax, by - ay);
    let d = carry;
    while (d <= len) {
      const t = d / len;
      out.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
      d += spacing;
    }
    carry = d - len;
  }
  if (closed && coords.length > 1) out.push(coords[coords.length - 1]);
  return out;
}

const inBox = (x, y, pad = 0) =>
  Math.abs(x) <= HALF + pad && Math.abs(y) <= HALF + pad;

async function main() {
  const roads = await overpass(
    "roads",
    `[out:json][timeout:240];way["highway"~"^(primary|secondary|tertiary|residential)$"](${BBOX});out geom;`,
  );
  const fwys = await overpass(
    "motorways",
    `[out:json][timeout:120];way["highway"="motorway"](${BBOX});out geom;`,
  );
  const biz = await overpass(
    "business",
    `[out:json][timeout:180];(node["shop"](${BBOX});node["amenity"~"^(restaurant|cafe|dentist)$"](${BBOX});node["office"](${BBOX}););out;`,
  );

  // ---- streets ----------------------------------------------------------
  // Higher classes go first so the merge keeps the arterial sample.
  const ways = roads.elements
    .filter((e) => e.type === "way" && e.geometry)
    .map((e) => ({
      cls: CLASS[e.tags.highway],
      coords: e.geometry.map((g) => project(g.lat, g.lon)),
    }))
    .sort((a, b) => b.cls - a.cls);
  const cell = MERGE;
  const hash = new Map();
  const streets = [];
  const keyOf = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
  const tooClose = (x, y) => {
    const cx = Math.floor(x / cell);
    const cy = Math.floor(y / cell);
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
        const list = hash.get(`${cx + dx},${cy + dy}`);
        if (list)
          for (const [px, py] of list)
            if (Math.hypot(px - x, py - y) < MERGE) return true;
      }
    return false;
  };
  for (const w of ways) {
    for (const [x, y] of resample(w.coords, SPACING[w.cls])) {
      if (!inBox(x, y) || tooClose(x, y)) continue;
      const k = keyOf(x, y);
      if (!hash.has(k)) hash.set(k, []);
      hash.get(k).push([x, y]);
      streets.push([x, y, w.cls]);
    }
  }

  // ---- arterial routing graph ----------------------------------------------
  // Shared OSM nodes have identical coordinates, so a rounded coordinate key
  // recovers the topology without a second (node-id) query.
  const nodeIndex = new Map();
  const nodes = [];
  const adj = [];
  const nid = ([x, y]) => {
    const k = `${Math.round(x)},${Math.round(y)}`;
    let i = nodeIndex.get(k);
    if (i === undefined) {
      i = nodes.length;
      nodeIndex.set(k, i);
      nodes.push([x, y]);
      adj.push(new Set());
    }
    return i;
  };
  for (const w of ways) {
    if (w.cls === 0) continue;
    for (let i = 1; i < w.coords.length; i++) {
      const a = nid(w.coords[i - 1]);
      const b = nid(w.coords[i]);
      if (a !== b) {
        adj[a].add(b);
        adj[b].add(a);
      }
    }
  }
  // Collapse degree-2 chains so only intersections and bends over 25 degrees
  // stay; the agent's trail is drawn straight between kept nodes.
  const keep = nodes.map((p, i) => {
    if (!inBox(p[0], p[1], 300)) return false;
    if (adj[i].size !== 2) return true;
    const [a, b] = [...adj[i]];
    const ux = p[0] - nodes[a][0],
      uy = p[1] - nodes[a][1];
    const vx = nodes[b][0] - p[0],
      vy = nodes[b][1] - p[1];
    const cos =
      (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1);
    return cos < Math.cos((25 * Math.PI) / 180);
  });
  const remap = new Map();
  const gNodes = [];
  nodes.forEach((p, i) => {
    if (keep[i]) {
      remap.set(i, gNodes.length);
      gNodes.push(p);
    }
  });
  const edgeSet = new Set();
  const gEdges = [];
  for (const [i] of remap) {
    for (const start of adj[i]) {
      let prev = i;
      let cur = start;
      let guard = 0;
      while (!keep[cur] && adj[cur].size === 2 && guard++ < 5000) {
        const next = [...adj[cur]].find((n) => n !== prev);
        prev = cur;
        cur = next;
      }
      if (!keep[cur] || cur === i) continue;
      const a = remap.get(i),
        b = remap.get(cur);
      const k = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edgeSet.has(k)) {
        edgeSet.add(k);
        gEdges.push([a, b]);
      }
    }
  }

  // ---- freeways ------------------------------------------------------------
  const routeOf = (ref = "") => {
    const refs = ref.split(/[;,]/).map((r) => r.trim().replace(/\s+/g, " "));
    if (refs.some((r) => /^I 110$|^CA 110$/.test(r))) return 1;
    if (refs.some((r) => /^US 101$/.test(r))) return 2;
    if (refs.some((r) => /^I 10$/.test(r))) return 0;
    if (refs.some((r) => /^I 5$/.test(r))) return 3;
    return -1;
  };
  const fwyLines = [];
  for (const e of fwys.elements) {
    if (e.type !== "way" || !e.geometry) continue;
    const route = routeOf(e.tags.ref);
    if (route < 0) continue;
    const pts = resample(
      e.geometry.map((g) => project(g.lat, g.lon)),
      14,
      true,
    ).filter(([x, y]) => inBox(x, y, 400));
    if (pts.length >= 2) fwyLines.push({ route, pts });
  }

  // ---- businesses ----------------------------------------------------------
  const kindOf = (t) =>
    t.amenity === "dentist" || t.healthcare === "dentist"
      ? 3
      : t.amenity === "restaurant"
        ? 1
        : t.amenity === "cafe"
          ? 2
          : t.office
            ? 4
            : 0;
  const allBiz = biz.elements
    .filter((e) => e.type === "node" && e.tags && e.tags.name)
    .map((e) => {
      const [x, y] = project(e.lat, e.lon);
      return { x, y, kind: kindOf(e.tags), id: e.id };
    })
    .filter((b) => inBox(b.x, b.y));
  // Koreatown: Wilshire and Western is the commercial heart.
  const [ktx, kty] = project(34.0617, -118.3089);
  const dentists = allBiz
    .filter((b) => b.kind === 3)
    .sort(
      (a, b) =>
        Math.hypot(a.x - ktx, a.y - kty) - Math.hypot(b.x - ktx, b.y - kty),
    );
  const anchor =
    dentists[0] ||
    allBiz.sort(
      (a, b) =>
        Math.hypot(a.x - ktx, a.y - kty) - Math.hypot(b.x - ktx, b.y - kty),
    )[0];
  // One per 600 m cell across the box, then the densest picks within 1.5 km
  // of the anchor so "nearby, worth reaching" has a real neighbourhood to light.
  const picked = new Map();
  const seededOrder = [...allBiz].sort(
    (a, b) =>
      ((a.id * 2654435761) % 4294967296) - ((b.id * 2654435761) % 4294967296),
  );
  for (const b of seededOrder) {
    const k = `${Math.floor(b.x / 600)},${Math.floor(b.y / 600)}`;
    if (!picked.has(k)) picked.set(k, b);
  }
  const chosen = new Set([anchor, ...picked.values()]);
  const near = seededOrder
    .filter((b) => Math.hypot(b.x - anchor.x, b.y - anchor.y) < 1500)
    .sort(
      (a, b) =>
        Math.hypot(a.x - anchor.x, a.y - anchor.y) -
        Math.hypot(b.x - anchor.x, b.y - anchor.y),
    );
  for (const b of near) {
    if (chosen.size >= BIZ_TARGET) break;
    if ([...chosen].every((c) => Math.hypot(c.x - b.x, c.y - b.y) > 45))
      chosen.add(b);
  }
  const bizOut = [...chosen];

  // ---- write ------------------------------------------------------------
  const fwyVerts = fwyLines.reduce((n, l) => n + l.pts.length, 0);
  const pad4 = (n) => (n + 3) & ~3;
  const size =
    32 +
    streets.length * 4 +
    pad4(streets.length) +
    fwyVerts * 4 +
    fwyLines.length * 12 +
    bizOut.length * 4 +
    pad4(bizOut.length) +
    gNodes.length * 4 +
    gEdges.length * 8;
  const buf = Buffer.alloc(size);
  let o = 0;
  const u32 = (v) => {
    buf.writeUInt32LE(v, o);
    o += 4;
  };
  const i16 = (v) => {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v))), o);
    o += 2;
  };
  const u8 = (v) => {
    buf.writeUInt8(v, o);
    o += 1;
  };
  const align = () => {
    o = pad4(o);
  };
  [
    0x4c414731,
    streets.length,
    fwyVerts,
    fwyLines.length,
    bizOut.length,
    gNodes.length,
    gEdges.length,
    0,
  ].forEach(u32);
  for (const [x, y] of streets) {
    i16(x);
    i16(y);
  }
  for (const s of streets) u8(s[2]);
  align();
  for (const l of fwyLines)
    for (const [x, y] of l.pts) {
      i16(x);
      i16(y);
    }
  let start = 0;
  for (const l of fwyLines) {
    u32(start);
    u32(l.pts.length);
    u32(l.route);
    start += l.pts.length;
  }
  for (const b of bizOut) {
    i16(b.x);
    i16(b.y);
  }
  for (const b of bizOut) u8(b.kind);
  align();
  for (const [x, y] of gNodes) {
    i16(x);
    i16(y);
  }
  for (const [a, b] of gEdges) {
    u32(a);
    u32(b);
  }
  if (o !== size) throw new Error(`size mismatch ${o} vs ${size}`);

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "la-grid.bin"), buf);
  const sha = createHash("sha256").update(buf).digest("hex");
  const gz = gzipSync(buf, { level: 9 }).length;
  const stats = {
    streets: streets.length,
    freewayVertices: fwyVerts,
    freewayLines: fwyLines.length,
    businesses: bizOut.length,
    graphNodes: gNodes.length,
    graphEdges: gEdges.length,
    bytes: size,
    gzipBytes: gz,
    sha256: sha,
    koreatown: [Math.round(anchor.x), Math.round(anchor.y)],
    koreatownKind: anchor.kind,
    bbox: BBOX,
  };
  console.log(stats);

  const readme = `# LA grid data

\`la-grid.bin\` is the street field behind the usctts.com home page: Los Angeles
roads, the 10, 110, 101 and 5, a sample of real business locations, and an
arterial routing graph, all projected to metres on a local plane centred on
USC (34.0224, -118.2851).

- Built by \`scripts/build-la-grid.mjs\` (the file header documents the layout)
- Source: OpenStreetMap via the Overpass API, ${SOURCE_URL}
- Query box (S,W,N,E): ${BBOX}
- Built: ${new Date().toISOString().slice(0, 10)}
- sha256: \`${sha}\`
- Size: ${size} bytes, ${gz} bytes gzipped
- Counts: ${streets.length} street points, ${fwyVerts} freeway vertices in ${fwyLines.length} lines, ${bizOut.length} businesses, ${gNodes.length} graph nodes, ${gEdges.length} graph edges
- KOREATOWN in components/tts/grid/store.ts: [${stats.koreatown.join(", ")}], the dental office nearest Wilshire and Western

Only positions and a category are kept; no names, addresses or IDs ship.

## License

Map data © OpenStreetMap contributors, available under the Open Database
License (ODbL 1.0), https://www.openstreetmap.org/copyright. This file is a
derived database under the same license. The page footer must carry
"© OpenStreetMap contributors" linked to https://www.openstreetmap.org/copyright.
`;
  writeFileSync(join(OUT_DIR, "README.md"), readme);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
