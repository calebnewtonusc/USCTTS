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

const INDEX = (ycIndex as { index: Record<string, string> }).index;

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
  const batch = INDEX[slug];
  if (!batch) return null;

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
