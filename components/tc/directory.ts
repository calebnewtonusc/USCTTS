import ycIndex from "@/data/yc-index.json";
import type { YcCompany } from "@/lib/yc";

/* Server-only reads of the bundled yc-oss index. lib/yc.ts owns the network
 * fetch; this file covers the two things the T Combinator pages need without
 * a network call: a fallback brief when yc-oss is unreachable, and a short,
 * deterministic sample of real companies for the lookup's idle demo. */

type Entry = [string, string, string];
const INDEX = (ycIndex as unknown as { index: Record<string, Entry> }).index;

/** "summer-2026" to "Summer 2026". The index stores batch slugs. */
export function batchLabel(batchSlug: string): string {
  return batchSlug
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

/**
 * The brief for a known slug when yc-oss did not answer. Only the three
 * fields the index carries are filled; everything else is empty, and every
 * section that reads a missing field skips itself rather than guessing.
 */
export function companyFromIndex(slug: string): YcCompany | null {
  const entry = INDEX[slug];
  if (!entry) return null;
  const [batch, name, oneLiner] = entry;
  return {
    name,
    slug,
    batch: batchLabel(batch),
    oneLiner,
    longDescription: "",
    website: "",
    logo: null,
    teamSize: null,
    location: "",
    industry: "",
    tags: [],
    isHiring: false,
    status: "",
    stage: "",
    ycUrl: "",
  };
}

export interface SampleCompany {
  slug: string;
  name: string;
  batch: string;
  oneLiner: string;
}

/* The idle demo on /tc types these into the lookup one at a time. Recent
 * batches only, because a founder who sees a 2012 company being typed reads
 * the page as stale; short names only, because the demo types them
 * character by character and a 30-character name is a 2s wait. */
const DEMO_BATCHES = [
  "summer-2026",
  "spring-2026",
  "winter-2026",
  "fall-2025",
  "summer-2025",
];
const DEMO_COUNT = 10;
const DEMO_MAX_NAME = 14;

export function demoCompanies(): SampleCompany[] {
  const pool = Object.entries(INDEX).filter(
    ([, [batch, name, oneLiner]]) =>
      DEMO_BATCHES.includes(batch) &&
      name.length <= DEMO_MAX_NAME &&
      oneLiner.length > 12 &&
      oneLiner.length <= 90,
  );
  // A fixed stride rather than Math.random, so the server render and every
  // visit see the same ten and nothing reshuffles between deploys.
  const stride = Math.max(1, Math.floor(pool.length / DEMO_COUNT));
  const out: SampleCompany[] = [];
  for (let i = 0; i < pool.length && out.length < DEMO_COUNT; i += stride) {
    const [slug, [batch, name, oneLiner]] = pool[i];
    out.push({ slug, name, batch: batchLabel(batch), oneLiner });
  }
  return out;
}

/** Optimal string alignment distance: Levenshtein plus adjacent swaps, so
 *  "strpie" is one edit from "stripe" rather than two. */
function editDistance(a: string, b: string, ceiling: number): number {
  if (Math.abs(a.length - b.length) > ceiling) return ceiling + 1;
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    rows.push([i]);
  }
  for (let j = 1; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d = Math.min(d, rows[i - 2][j - 2] + 1);
      }
      rows[i][j] = d;
      rowMin = Math.min(rowMin, d);
    }
    if (rowMin > ceiling) return ceiling + 1;
  }
  return rows[a.length][b.length];
}

/**
 * Companies whose slug or name is a typo away from what was typed, for the
 * not-found page. lib/yc's search is substring-only, so "strpe" finds
 * nothing there; this is the fallback for exactly that case.
 *
 * The allowed distance grows with length: one edit up to five characters,
 * two up to ten, three beyond. Guessed, never measured against real typos;
 * checked by hand on 2026-10-03 only that "strpe" finds Stripe alone,
 * "afterqeury" finds AfterQuery alone, and "baud" finds Baud and Bud.
 */
export function suggestCompanies(raw: string, limit = 5): SampleCompany[] {
  const q = raw.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (q.length < 2) return [];
  const ceiling = q.length <= 5 ? 1 : q.length <= 10 ? 2 : 3;
  const scored: Array<{ hit: SampleCompany; d: number }> = [];
  for (const slug in INDEX) {
    const [batch, name, oneLiner] = INDEX[slug];
    const flatSlug = slug.replace(/-/g, "");
    const flatName = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const d = Math.min(editDistance(q, flatSlug, ceiling), editDistance(q, flatName, ceiling));
    if (d <= ceiling) scored.push({ hit: { slug, name, batch: batchLabel(batch), oneLiner }, d });
  }
  scored.sort((x, y) => x.d - y.d || x.hit.name.length - y.hit.name.length);
  return scored.slice(0, limit).map((s) => s.hit);
}
