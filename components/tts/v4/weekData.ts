/*
 * The example project on /way. Labelled on the page as one example: a
 * nonprofit in Ghana that needs donor outreach (Tyler, relayed 2026-10-10).
 * It is not a named client and nothing here is a past result
 * (docs/RUBRIC-tts.md). Kinds of funders, never named ones, and no numbers
 * that would read as a result.
 */

export type Kind = "gtm" | "email" | "sheet" | "teach";

export type Block = {
  day: number; // 0 Mon .. 4 Fri
  start: number; // hours after 9am
  hours: number;
  label: string;
  kind: Kind;
  /** the work leaves it alone: a person still does it at the end */
  keep?: boolean;
};

const b = (
  day: number,
  start: number,
  hours: number,
  kind: Kind,
  label: string,
  keep = false,
): Block => ({
  day,
  start,
  hours,
  kind,
  label,
  keep,
});

// 9am to 5pm, Monday to Friday, every hour taken: a development lead's week.
export const BLOCKS: Block[] = [
  b(0, 0, 2, "email", "Inbox"),
  b(0, 2, 2, "gtm", "Search for funders"),
  b(0, 4, 1, "sheet", "Update the donor sheet"),
  b(0, 5, 2, "email", "Thank-you notes", true),
  b(0, 7, 1, "sheet", "Copy contacts over"),
  b(1, 0, 2, "gtm", "Read grant guidelines"),
  b(1, 2, 1, "email", "Report requests", true),
  b(1, 3, 2, "sheet", "Fix the sheet"),
  b(1, 5, 1, "email", "Donor questions", true),
  b(1, 6, 2, "teach", "Figure out the new tool"),
  b(2, 0, 2, "email", "Inbox"),
  b(2, 2, 2, "gtm", "First emails to funders"),
  b(2, 4, 1, "sheet", "Update the donor sheet"),
  b(2, 5, 2, "teach", "Train a volunteer", true),
  b(2, 7, 1, "email", "Follow-ups"),
  b(3, 0, 2, "email", "Report requests"),
  b(3, 2, 2, "gtm", "Search for funders"),
  b(3, 4, 2, "sheet", "Update the donor sheet"),
  b(3, 6, 2, "email", "Inbox"),
  b(4, 0, 1, "email", "Inbox"),
  b(4, 1, 2, "gtm", "Follow-up emails"),
  b(4, 3, 2, "sheet", "Clean up the sheet"),
  b(4, 5, 2, "teach", "Show staff the tool"),
  b(4, 7, 1, "email", "Inbox"),
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const HOURS = ["9", "10", "11", "12", "1", "2", "3", "4"];

/* The week doesn't go to zero (review 3): six hours stay, the ones a
 * person should still do. */
export const KEPT_HOURS = BLOCKS.filter((x) => x.keep).reduce(
  (s, x) => s + x.hours,
  0,
);

export const TOTAL_HOURS = BLOCKS.reduce((s, x) => s + x.hours, 0);

export const hoursOf = (k: Kind) =>
  BLOCKS.filter((x) => x.kind === k).reduce((s, x) => s + x.hours, 0);

/* The funders worth reaching, as the research would find them. Kinds of
 * funder, never named ones. */
export type Lead = {
  who: string;
  where: string;
  person: string;
  signal: string;
  why: string;
  stage: 0 | 1 | 2; // the CRM column they settle into
};

export const LEADS: Lead[] = [
  {
    who: "Family foundation",
    where: "London",
    person: "Program officer",
    signal: "New West Africa education fund",
    why: "Funds schooling in Ghana",
    stage: 1,
  },
  {
    who: "Corporate giving arm",
    where: "Accra",
    person: "CSR manager",
    signal: "Opened an Accra office this year",
    why: "Wants local programs to back",
    stage: 0,
  },
  {
    who: "Diaspora giving circle",
    where: "Houston",
    person: "Circle chair",
    signal: "Picks a cause each quarter",
    why: "Members from the same region",
    stage: 2,
  },
  {
    who: "Health foundation",
    where: "Geneva",
    person: "Grants manager",
    signal: "Call for proposals closes in March",
    why: "Clinic outreach is in scope",
    stage: 1,
  },
  {
    who: "University alumni fund",
    where: "Boston",
    person: "Fund director",
    signal: "An alumnus sits on the nonprofit's board",
    why: "A warm way in",
    stage: 0,
  },
  {
    who: "Community trust",
    where: "Toronto",
    person: "Grants lead",
    signal: "Grew its global grants budget",
    why: "Small first grants, fast",
    stage: 2,
  },
];

export const STAGES = ["New", "Talking", "Booked"];

export const INBOX = [
  { from: "Grace K.", subject: "Can we see your impact report?" },
  { from: "Daniel P.", subject: "Our next grant cycle opens in May" },
  { from: "Min-ji L.", subject: "Do you take restricted gifts?" },
];

export const ASK =
  "Hi, before our board meets, could you send last year's impact report? A one-page summary is fine.";

export const REPLY =
  "Hi Grace, of course. I'll send the full report and the one-page summary today, and I'm glad to walk your board through it.";

export const LESSON = [
  "Open the drafts, fix anything, hit send",
  "A new funder? Their card's already in the CRM",
  "Stuck? Ask it before you ask us",
];

/* What the x-ray shows: how a member would build each beat. */
/* The qualifying prompt: how the AI decides who's worth reaching, from
 * each funder's own site and recent news. An example, for the x-ray. */
export const QUALIFY = [
  ["goal", "donors for a nonprofit in Ghana"],
  ["reads", "each funder's site, past grants and recent news"],
  ["keep", "funds the region or the cause, with a reason to talk now"],
  ["drop", "closed to new applicants this year"],
  ["write", "one line on why each is worth reaching"],
] as const;

/* The first email, as the AI drafts it, and the prompt behind it. */
export const DRAFT =
  "Hi, I saw your foundation just opened a West Africa education fund. Our schools in Ghana are growing, and I'd love to share what's working. Could I send you a one-page summary this week?";

export const PROMPT = [
  ["role", "writes as the nonprofit's director of development"],
  ["reads", "the funder's row: who, the signal, why it's worth reaching"],
  ["rule", "open on their signal, in one specific line"],
  ["rule", "ask for one small next step"],
  ["rule", "under 90 words"],
  ["rule", "never sends. a person reads it first"],
] as const;

export const FLOW = [
  "Gmail: new reply",
  "Sort: funder, question or other",
  "Research: read the funder's site",
  "Draft: an answer for a person to check",
  "CRM: create or move the card",
  "Calendar: book the meeting",
];

export const OUTLINE = [
  "Lesson 1, 20 minutes, the whole team",
  "1. Where the drafts land, and how to send one",
  "2. A draft is wrong: fix it, and tell it why",
  "3. A new funder showed up: find their card",
  "4. What it should never do on its own",
  "Homework: send five drafts on Monday",
];
