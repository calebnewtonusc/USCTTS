// Look up a single YC company by slug, for the personalized pages at
// /tc/for/[slug].
//
// This is the whole point of the T Combinator site. Caleb sends a founder
// tcombinator.io/for/their-company and the page already knows their batch,
// their headcount and whether they are hiring. That is the product being
// demonstrated on the founder rather than described to them, which is the one
// thing no other student club on this campus can do.
//
// Data is yc-oss.github.io, an unofficial mirror of YC's public company
// directory. It is not YC, it carries no YC endorsement, and nothing here
// implies one.

import ycIndex from "@/data/yc-index.json";

export interface YcCompany {
  name: string;
  slug: string;
  batch: string;
  oneLiner: string;
  longDescription: string;
  website: string;
  logo: string | null;
  teamSize: number | null;
  location: string;
  industry: string;
  tags: string[];
  isHiring: boolean;
  status: string;
  stage: string;
  ycUrl: string;
}

// [batchSlug, name, oneLiner]
type Entry = [string, string, string];
// TypeScript widens the JSON tuples to string[], so this goes through unknown
// rather than pretending the shapes overlap.
const INDEX = (ycIndex as unknown as { index: Record<string, Entry> }).index;

/** Every slug we can personalize for. Used by generateStaticParams. */
export function knownSlugs(): string[] {
  return Object.keys(INDEX);
}

export function isKnownCompany(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(INDEX, slug);
}

// A day. The fields that matter here (batch, team size, hiring) move on the
// order of weeks, and a stale headcount is a much cheaper failure than a page
// that hangs while a founder is looking at it.
const REVALIDATE_SECONDS = 86_400;

export async function getCompany(slug: string): Promise<YcCompany | null> {
  const entry = INDEX[slug];
  if (!entry) return null;
  const [batch] = entry;

  const url = `https://yc-oss.github.io/api/batches/${batch}/${slug}.json`;

  let raw: Record<string, unknown>;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    raw = (await res.json()) as Record<string, unknown>;
  } catch {
    // A personalized page that 500s in front of a founder is worse than one
    // that quietly falls back to the generic pitch, so the caller renders that
    // instead of an error.
    return null;
  }

  const str = (k: string): string => (typeof raw[k] === "string" ? (raw[k] as string) : "");
  const num = (k: string): number | null => (typeof raw[k] === "number" ? (raw[k] as number) : null);

  return {
    name: str("name") || slug,
    slug,
    batch: str("batch"),
    oneLiner: str("one_liner"),
    longDescription: str("long_description"),
    website: str("website"),
    logo: str("small_logo_thumb_url") || null,
    teamSize: num("team_size"),
    location: str("all_locations").split(";")[0]?.trim() ?? "",
    industry: str("industry"),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    isHiring: raw.isHiring === true,
    status: str("status"),
    stage: str("stage"),
    ycUrl: str("url"),
  };
}

export interface YcHit {
  slug: string;
  name: string;
  oneLiner: string;
  batch: string;
}

/**
 * Name search over the index, for the homepage lookup.
 *
 * Ranked so an exact name wins, then a prefix, then a substring. Without the
 * ranking "ai" returns six thousand companies in insertion order and the one
 * the person meant is never on screen.
 */
export function searchCompanies(query: string, limit = 6): YcHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const scored: Array<{ hit: YcHit; score: number }> = [];

  for (const slug in INDEX) {
    const [batch, name, oneLiner] = INDEX[slug];
    const n = name.toLowerCase();

    let score: number;
    if (n === q) score = 0;
    else if (n.startsWith(q)) score = 1;
    else if (slug.startsWith(q)) score = 2;
    else if (n.includes(q)) score = 3;
    else continue;

    // Shorter names first inside a tier, so "clay" beats "Clay Sciences".
    scored.push({ hit: { slug, name, oneLiner, batch }, score: score * 1000 + n.length });
  }

  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.hit);
}

/** A spread of real company names, for ambient UI. Deterministic so the
 *  server and the client agree and hydration does not warn. */
export function sampleNames(count: number): string[] {
  const slugs = Object.keys(INDEX);
  const out: string[] = [];
  const stride = Math.max(1, Math.floor(slugs.length / count));
  for (let i = 0; i < slugs.length && out.length < count; i += stride) {
    const name = INDEX[slugs[i]][1];
    if (name && name.length <= 18) out.push(name);
  }
  return out;
}