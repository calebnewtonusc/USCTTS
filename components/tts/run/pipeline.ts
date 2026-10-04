// The pipeline behind the homepage run, as pure functions so the server can
// render the finished result into static HTML and the browser can run the
// same code live.
//
// The dataset is public/tts/run/portfolio-board-2026-09-15.json, built from a
// private research scrape of one venture fund's public portfolio job board on
// 2026-09-15. The fund is not named in this public repo. Company names are withheld and
// replaced by an index; role titles are as posted, minus any other company's
// name. Every count the page shows comes out of these functions, not out of
// copy, so the page cannot drift from the data.

export type Role = [
  company: number,
  daysOpen: number,
  title: string,
  namesOtherCompany: 0 | 1,
  deliverable: 0 | 1,
];

export interface Dataset {
  source: { board: string; pulled: string; via: string; note: string };
  sectors: string[];
  /** [sectorIndex, sizeBand] per company. Size band is Getro's 1 to 5 ordinal, not a headcount. */
  companies: [number, number][];
  roles: Role[];
}

// A feed holding more than this share of every listing gets opened by hand.
// On 2026-09-15 one company held 102 of 388 (26%); the next largest held 44
// (11%). Set between the two, so the rule fires on the one feed that was
// actually wrong and on no honest employer in this pull.
export const AUDIT_SHARE = 0.2;

// An audited feed is set aside whole when more than this fraction of its
// listings name a different company in the title. The bad feed measured
// 66 of 102 (65%). Half is the line because the remaining 36 were founding
// roles in SF and NY that did not fit the company either (noted in the
// private research repo), so the whole feed was a different board.
export const FOREIGN_SHARE = 0.5;

// "Open a long time" means past a normal hiring cycle. 90 days is the line
// TTS-PIPELINE.md drew on 2026-09-15; guessed from hiring norms, not measured.
export const LONG_OPEN_DAYS = 90;

export interface StageResult {
  id: "enumerate" | "pull" | "verify" | "rank" | "shortlist";
  count: number;
  ms: number;
}

export interface CompanyRank {
  company: number;
  sector: string;
  open: number;
  flagged: boolean;
}

export interface ShortRole {
  title: string;
  sector: string;
  days: number;
}

export interface RunResult {
  stages: StageResult[];
  setAside: { company: number; listings: number; namingOthers: number } | null;
  ranking: CompanyRank[];
  shortlist: ShortRole[];
  shortlistTotal: number;
  longOpen: number;
  verified: boolean;
}

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

function timed<T>(fn: () => T): [T, number] {
  const start = now();
  const out = fn();
  return [out, now() - start];
}

/** Which feeds the verify rule sets aside, and why. */
export function audit(data: Dataset) {
  const total = data.roles.length;
  const byCompany = new Map<
    number,
    { listings: number; namingOthers: number }
  >();
  for (const [company, , , other] of data.roles) {
    const entry = byCompany.get(company) ?? { listings: 0, namingOthers: 0 };
    entry.listings += 1;
    entry.namingOthers += other;
    byCompany.set(company, entry);
  }
  const setAside = new Map<
    number,
    { listings: number; namingOthers: number }
  >();
  for (const [company, entry] of byCompany) {
    if (
      entry.listings / total > AUDIT_SHARE &&
      entry.namingOthers / entry.listings > FOREIGN_SHARE
    ) {
      setAside.set(company, entry);
    }
  }
  return setAside;
}

export function runPipeline(data: Dataset, verify = true): RunResult {
  const stages: StageResult[] = [];

  const [companies, msEnumerate] = timed(() => data.companies.length);
  stages.push({ id: "enumerate", count: companies, ms: msEnumerate });

  const [roles, msPull] = timed(() => data.roles.slice());
  stages.push({ id: "pull", count: roles.length, ms: msPull });

  const [verified, msVerify] = timed(() => {
    if (!verify)
      return {
        kept: roles,
        aside: new Map<number, { listings: number; namingOthers: number }>(),
      };
    const aside = audit(data);
    return { kept: roles.filter((r) => !aside.has(r[0])), aside };
  });
  stages.push({ id: "verify", count: verified.kept.length, ms: msVerify });

  const [ranking, msRank] = timed(() => {
    const open = new Map<number, number>();
    for (const r of verified.kept) open.set(r[0], (open.get(r[0]) ?? 0) + 1);
    // Flag what the check would have caught, so the unverified run can say
    // which bar was misattributed.
    const wouldFlag = audit(data);
    return [...open.entries()]
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
      .slice(0, 5)
      .map(([company, n]) => ({
        company,
        // The set-aside feed never carries its sector: with six companies in
        // some sectors, a sector plus a count identifies the company.
        sector: wouldFlag.has(company) ? "" : data.sectors[data.companies[company][0]],
        open: n,
        flagged: wouldFlag.has(company),
      }));
  });
  // The rank stage reports the top company's open roles, because that is the
  // number the unverified run gets wrong.
  stages.push({ id: "rank", count: ranking[0]?.open ?? 0, ms: msRank });

  const [short, msShort] = timed(() => {
    const deliverable = verified.kept
      .filter((r) => r[4] === 1)
      .sort((a, b) => b[1] - a[1]);
    return deliverable;
  });
  stages.push({ id: "shortlist", count: short.length, ms: msShort });

  const first = [...verified.aside.entries()][0];
  return {
    stages,
    setAside: first ? { company: first[0], ...first[1] } : null,
    ranking,
    shortlist: short.slice(0, 6).map((r) => ({
      title: r[2],
      sector: data.sectors[data.companies[r[0]][0]],
      days: r[1],
    })),
    shortlistTotal: short.length,
    longOpen: verified.kept.filter((r) => r[1] >= LONG_OPEN_DAYS).length,
    verified: verify,
  };
}

/** The verdict the intake stream stamps on one role. */
export function verdict(
  role: Role,
  aside: Map<number, unknown>,
): "kept" | "set aside" | "shortlisted" {
  if (aside.has(role[0])) return "set aside";
  return role[4] === 1 ? "shortlisted" : "kept";
}
