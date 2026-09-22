// Builds data/yc-index.json: a slug to batch-slug map for every launched YC company.
//
// The full company dump is 10.5MB, which is too much to ship in a bundle or to
// fetch on a request. But yc-oss also serves one small JSON per company under
// its batch, and the only thing needed to construct that URL is the batch. So
// the index is just slug -> batch, about 6,200 short strings, and the
// per-company fetch happens at request time behind Next's cache.
//
// Re-run when a new batch is announced: `node scripts/build-yc-index.mjs`.

import { writeFile } from "node:fs/promises";

const ALL = "https://yc-oss.github.io/api/companies/all.json";

const batchSlug = (batch) =>
  batch.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const res = await fetch(ALL);
if (!res.ok) throw new Error(`yc-oss returned ${res.status} for ${ALL}`);
const companies = await res.json();

const index = {};
for (const c of companies) {
  if (!c.slug || !c.batch) continue;
  index[c.slug] = batchSlug(c.batch);
}

const out = {
  generated: new Date().toISOString(),
  source: ALL,
  count: Object.keys(index).length,
  index,
};

await writeFile("data/yc-index.json", JSON.stringify(out));
console.log(`wrote data/yc-index.json: ${out.count} companies`);
