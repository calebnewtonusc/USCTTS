import type { YcCompany } from "@/lib/yc";

/* The reasoning behind /tc/for/<slug>. Pure functions over the founder's YC
 * listing, so the page can show the reason next to every choice and a
 * founder can check each one against their own listing.
 *
 * The work list is Caleb's, from the send version of the DM
 * (t-combinator/outreach/00-THE-MESSAGE.md): "Growth, marketing, design,
 * engineering, outbound lists, cleaning your CRM, the deck you keep not
 * making." The refusals are t-combinator/OFFER.md, word for word in meaning.
 * Nothing here adds a capability that is not in one of those two files. */

export type HandoffId =
  | "leads"
  | "growth"
  | "crm"
  | "design"
  | "engineering"
  | "deck";

export interface Handoff {
  id: HandoffId;
  name: string;
  detail: string;
}

export const HANDOFFS: Handoff[] = [
  {
    id: "leads",
    name: "Outbound lists",
    // OFFER.md, "The artifact".
    detail:
      "Your addressable market, enumerated, enriched, and mapped to the warm paths you already have into it.",
  },
  {
    id: "growth",
    name: "Growth and marketing",
    detail:
      "Outbound a human would actually reply to, and the content that has to exist before it.",
  },
  {
    id: "crm",
    name: "Cleaning your CRM",
    detail:
      "The HubSpot or Salesforce instance nobody has owned since the seed.",
  },
  {
    id: "design",
    name: "Design",
    detail: "Site, identity, the screens you keep redoing at midnight.",
  },
  {
    id: "engineering",
    name: "Engineering",
    detail: "Internal tools, integrations, the scripts holding ops together.",
  },
  {
    id: "deck",
    name: "The deck",
    detail: "The one you keep not making.",
  },
];

export type RefusalId = "clinical" | "physical" | "hard" | "unready";

export interface Refusal {
  id: RefusalId;
  name: string;
  detail: string;
}

export const REFUSALS: Refusal[] = [
  {
    id: "clinical",
    name: "Clinical or licensed work",
    detail: "Medicine, law, and anything else that needs a license.",
  },
  {
    id: "physical",
    name: "Physical or on-site work",
    detail: "Everyone on the team is a full-time USC student.",
  },
  {
    id: "hard",
    name: "Hard engineering",
    detail:
      "Avionics, composites, geotech, propulsion, and the core of anything like them.",
  },
  {
    id: "unready",
    name: "Anything we cannot actually do",
    detail:
      "If the first status update would reveal the team cannot do it, we say no before it starts. One of those burns a founder relationship permanently.",
  },
];

/** A value lifted from the listing, rendered with the highlighter. */
export interface Reason {
  /** Plain text before the filled value. */
  lead: string;
  /** The value from their listing. */
  fill: string;
  /** Plain text after it. */
  tail: string;
}

export interface Pick {
  handoff: Handoff;
  reason: Reason | null;
}

export interface Flag {
  refusal: Refusal;
  /** The tag or industry on their listing that tripped it. */
  matched: string;
}

export interface Brief {
  start: Pick[];
  rest: Handoff[];
  flags: Flag[];
  clear: Refusal[];
  fit: "early" | "large" | "public" | "inactive" | "unknown";
}

const has = (list: string[], pattern: RegExp) =>
  list.find((t) => pattern.test(t));

// Patterns are matched against the listing's tags plus its industry. Each one
// was read off real yc-oss records on 2026-10-03 (Baud: Hard Tech,
// Semiconductors; Moving Atoms: Robotics, Hard Tech; Lemonbox: Health Tech;
// Sameday: B2B, Sales Enablement), not guessed from category names.
const B2B =
  /^(b2b|saas|sales|sales enablement|enterprise|developer tools|fintech|crm|analytics|productivity|legal|recruiting|infrastructure)$/i;
const CONSUMER =
  /^(consumer|marketplace|e-commerce|social|travel|food and beverage|gaming|fashion|creator economy|education|consumer health and wellness)$/i;
const CLINICAL =
  /(health|medical|clinical|biotech|therapeut|diagnos|pharma|telehealth|mental health|legal)/i;
const PHYSICAL = /(robotic|hardware|manufactur|construction)/i;
const HARD =
  /(hard tech|semiconductor|aerospace|space|nuclear|propulsion|drone|robotic|industrials)/i;

/** Team sizes that change the copy. Caleb's DM targeted teams of 1 to 10
 *  (YC-TARGETS.md, "34 of them founders at 2025-26 companies with teams of 1
 *  to 10"), so 12 keeps that segment with a little slack. Above 150 a cohort
 *  of three student builders is plainly not built for the company, and saying
 *  so is cheaper than letting a VP find out on the call. Guessed, never
 *  measured: there is no reply data by team size yet. */
const EARLY_MAX = 12;
const LARGE_MIN = 150;

export function fitOf(c: YcCompany): Brief["fit"] {
  const status = c.status.toLowerCase();
  if (status === "inactive") return "inactive";
  if (status === "public" || status === "acquired") return "public";
  if (c.teamSize !== null && c.teamSize >= LARGE_MIN) return "large";
  if (c.teamSize !== null && c.teamSize > 0 && c.teamSize <= EARLY_MAX)
    return "early";
  return "unknown";
}

export function buildBrief(c: YcCompany): Brief {
  const signals = [...c.tags, c.industry].filter(Boolean);
  const score: Record<HandoffId, number> = {
    leads: 3,
    growth: 2,
    crm: 1,
    design: 1,
    engineering: 0,
    deck: 0,
  };
  const reasons: Partial<Record<HandoffId, Reason>> = {};

  const b2b = has(signals, B2B);
  const consumer = has(signals, CONSUMER);

  if (b2b) {
    score.leads += 4;
    score.crm += 3;
    reasons.leads = {
      lead: "Your listing says ",
      fill: b2b,
      tail: ", so somebody has to find every buyer by name. That list is week one.",
    };
    reasons.crm = {
      lead: "Every ",
      fill: b2b,
      tail: " deal you run lands in a CRM, and nobody owns it until it hurts.",
    };
  }
  if (consumer) {
    score.growth += 5;
    score.design += 3;
    reasons.growth = {
      lead: "Your listing says ",
      fill: consumer,
      tail: ", so growth is the job, and it never finishes.",
    };
    reasons.design = {
      lead: "A ",
      fill: consumer,
      tail: " product is judged on its surface before anyone tries it.",
    };
  }
  if (c.teamSize !== null && c.teamSize > 0 && c.teamSize <= 5) {
    score.deck += 4;
    reasons.deck = {
      lead: "At ",
      fill: peopleLabel(c.teamSize),
      tail: ", the deck is somebody's fourth priority, every week.",
    };
  }
  if (c.isHiring) {
    score.engineering += 1;
  }

  const ordered = [...HANDOFFS].sort((a, b) => score[b.id] - score[a.id]);
  const start = ordered
    .slice(0, 3)
    .map((handoff) => ({ handoff, reason: reasons[handoff.id] ?? null }));
  const rest = ordered.slice(3);

  const flags: Flag[] = [];
  const clinical = has(signals, CLINICAL);
  const physical = has(signals, PHYSICAL);
  const hard = has(signals, HARD);
  if (clinical) flags.push({ refusal: REFUSALS[0], matched: clinical });
  if (physical) flags.push({ refusal: REFUSALS[1], matched: physical });
  if (hard) flags.push({ refusal: REFUSALS[2], matched: hard });
  const flagged = new Set(flags.map((f) => f.refusal.id));
  const clear = REFUSALS.filter((r) => !flagged.has(r.id));

  return { start, rest, flags, clear, fit: fitOf(c) };
}

/** First location only, without the country when it is the US, because
 *  "San Francisco, CA, USA" in a headline line reads like a form field. */
export function shortLocation(location: string): string {
  return location.replace(/,\s*USA$/, "");
}

/** "1 person", "30 people", "7,000 people". */
export function peopleLabel(size: number): string {
  return `${size.toLocaleString("en-US")} ${size === 1 ? "person" : "people"}`;
}
