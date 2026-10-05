/*
 * The example week. Labelled on the page, once, as an example: a dental
 * office in Koreatown is not a client and nothing here is a past result
 * (docs/RUBRIC-tts.md). It is specific on purpose (DIRECTION-tts-v4.md,
 * point 4): the emails and the leads are the kinds a front desk on Wilshire
 * really gets, never filler.
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

// 9am to 5pm, Monday to Friday, every hour taken.
export const BLOCKS: Block[] = [
  b(0, 0, 2, "email", "Inbox"),
  b(0, 2, 2, "gtm", "Cold calls"),
  b(0, 4, 1, "sheet", "Update the sheet"),
  b(0, 5, 2, "email", "Confirm appointments", true),
  b(0, 7, 1, "sheet", "Copy leads over"),
  b(1, 0, 2, "gtm", "Look for referrals"),
  b(1, 2, 1, "email", "Insurance emails", true),
  b(1, 3, 2, "sheet", "Fix the sheet"),
  b(1, 5, 1, "email", "Reply to reviews", true),
  b(1, 6, 2, "teach", "Figure out the new tool"),
  b(2, 0, 2, "email", "Inbox"),
  b(2, 2, 2, "gtm", "Cold calls"),
  b(2, 4, 1, "sheet", "Update the sheet"),
  b(2, 5, 2, "teach", "Train the new hire", true),
  b(2, 7, 1, "email", "Reschedules"),
  b(3, 0, 2, "email", "Insurance emails"),
  b(3, 2, 2, "gtm", "Drop off flyers"),
  b(3, 4, 2, "sheet", "Update the sheet"),
  b(3, 6, 2, "email", "Inbox"),
  b(4, 0, 1, "email", "Inbox"),
  b(4, 1, 2, "gtm", "Follow-up calls"),
  b(4, 3, 2, "sheet", "Clean up the sheet"),
  b(4, 5, 2, "teach", "Show staff the tool"),
  b(4, 7, 1, "email", "Inbox"),
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const HOURS = ["9", "10", "11", "12", "1", "2", "3", "4"];

/* The week doesn't go to zero (review 3): six hours stay, the ones a
 * person should still do. */
export const KEPT_HOURS = BLOCKS.filter((x) => x.keep).reduce((s, x) => s + x.hours, 0);

export const TOTAL_HOURS = BLOCKS.reduce((s, x) => s + x.hours, 0);

export const hoursOf = (k: Kind) =>
  BLOCKS.filter((x) => x.kind === k).reduce((s, x) => s + x.hours, 0);

/* The people worth reaching, as Clay and Perplexity would find them. Kinds
 * of business, never named ones. */
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
    who: "Orthodontist",
    where: "Wilshire Blvd",
    person: "Practice owner",
    signal: "Sends cleanings out",
    why: "Referrals both ways",
    stage: 1,
  },
  {
    who: "Pediatric clinic",
    where: "Western Ave",
    person: "Office manager",
    signal: "Opening a second location",
    why: "New families need a dentist",
    stage: 0,
  },
  {
    who: "Korean church",
    where: "Normandie Ave",
    person: "Admin pastor",
    signal: "Runs a monthly health fair",
    why: "A free screening table",
    stage: 2,
  },
  {
    who: "Coworking space",
    where: "Wilshire Blvd",
    person: "Community lead",
    signal: "Just posted a member perks page",
    why: "A dental day for members",
    stage: 1,
  },
  {
    who: "Hotel",
    where: "Wilshire Blvd",
    person: "HR director",
    signal: "Hiring front desk and housekeeping",
    why: "New staff need a dentist",
    stage: 0,
  },
  {
    who: "Taekwondo studio",
    where: "Vermont Ave",
    person: "Owner",
    signal: "Kids' sparring class starts next month",
    why: "Mouthguard fittings",
    stage: 2,
  },
];

export const STAGES = ["New", "Talking", "Booked"];

export const INBOX = [
  { from: "Grace K.", subject: "Can I move my cleaning to Thursday?" },
  { from: "Daniel P.", subject: "Do you take Delta Dental?" },
  { from: "Min-ji L.", subject: "Are you open Saturdays?" },
];

export const ASK =
  "Hi, something came up Tuesday. Can I move my cleaning to Thursday? Mornings are better for me.";

export const REPLY =
  "Hi Grace, of course. Thursday at 9:30 or 11:00 are open, which one works better? I'll move it as soon as you reply.";

export const LESSON = [
  "Open the drafts, fix anything, hit send",
  "A new lead? Their card's already in the CRM",
  "Stuck? Ask it before you ask us",
];

/* What the x-ray shows: how a member would build each beat. */
/* The qualifying prompt: how the AI decides who's worth reaching, from
 * each lead's Perplexity research. An example, for the x-ray. */
export const QUALIFY = [
  ["goal", "new patients for a Koreatown dental office"],
  ["reads", "each lead's site and recent news, from Perplexity"],
  ["keep", "within two miles, with a reason to talk now"],
  ["drop", "chains that already run their own dental plan"],
  ["write", "one line on why each is worth reaching"],
] as const;

/* The first email, as the AI drafts it, and the prompt behind it. */
export const DRAFT =
  "Hi Pastor Kim, I'm with a dental office on Western. Your monthly health fair looks great, and we'd love to bring a free screening table to the next one. Could I call you Thursday to set it up?";

export const PROMPT = [
  ["role", "writes as the office manager at a Koreatown dental office"],
  ["reads", "the lead's row: who, the signal, why it's worth reaching"],
  ["rule", "open on their signal, in one specific line"],
  ["rule", "ask for one small next step"],
  ["rule", "under 90 words"],
  ["rule", "never sends. a person reads it first"],
] as const;

export const FLOW = [
  "Gmail: new email",
  "Sort: patient, lead or other",
  "Perplexity: research the business",
  "Clay: find the decision maker",
  "CRM: create or move the card",
  "Slack: tell the front desk",
];

export const OUTLINE = [
  "Lesson 1, 20 minutes, the whole front desk",
  "1. Where the drafts land, and how to send one",
  "2. A draft is wrong: fix it, and tell it why",
  "3. A new lead showed up: find their card",
  "4. What it should never do on its own",
  "Homework: send five drafts on Monday",
];
