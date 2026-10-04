// =====================================================================
// TTS Meeting Template
// =====================================================================
// How to add a new meeting:
//
//   1. Copy this file to `meeting-XX.ts` (e.g. `meeting-02.ts`).
//   2. Export a const named `meetingXX` (e.g. `meeting02`).
//   3. Open `lib/meetings/index.ts` and import + add it to MEETINGS.
//   4. Fill in the slides. Delete slide blocks you do not use.
//   5. Every slide kind available to you is shown below with an example.
//
// Nothing else required. The password gate, list page, slide viewer,
// keyboard nav, and mobile swipe all work automatically.
// =====================================================================

import type { Meeting } from "./types";
import { COLOR } from "./types";

export const meetingTemplate: Meeting = {
  // URL slug. Must be unique. Goes in the route: /meetings/<slug>
  slug: "meeting-xx",
  number: 0, // Sequential meeting number
  title: "Meeting Title Here",
  date: "2026-01-01", // ISO date
  dateLabel: "Day, Month DD", // Human label shown in list
  timeLabel: "7:00 PM PT",
  location: "USC Campus, location on Instagram",
  summary: "One-line summary for the list page.",
  status: "upcoming", // "upcoming" | "live" | "past"
  accent: COLOR.red, // Color used in header and progress bar

  slides: [
    // ------------------------------------------------------------------
    // 1. TITLE: use once, as the first slide.
    // ------------------------------------------------------------------
    {
      kind: "title",
      eyebrow: "Meeting 0X",
      title: "Slide Title",
      subtitle: "Optional subtitle under the big title.",
      footer: "Date or venue line.",
    },

    // ------------------------------------------------------------------
    // 2. SECTION: big number + section title. Use to break up the deck.
    // ------------------------------------------------------------------
    {
      kind: "section",
      number: "01",
      title: "Section heading",
      blurb: "One short paragraph of context, optional.",
    },

    // ------------------------------------------------------------------
    // 3. BULLETS: heading + list of points. 3 to 5 items is the sweet spot.
    // ------------------------------------------------------------------
    {
      kind: "bullets",
      eyebrow: "Optional small label above title",
      title: "The slide's main point",
      body: "Optional one-liner under the title.",
      items: [
        { label: "First point", detail: "Optional second line of detail." },
        { label: "Second point", detail: "Detail can be omitted." },
        { label: "Third point" },
      ],
    },

    // ------------------------------------------------------------------
    // 4. THREE-UP: three cards side by side. Good for frameworks / tracks.
    // ------------------------------------------------------------------
    {
      kind: "three-up",
      eyebrow: "Optional label",
      title: "The three things",
      cards: [
        {
          label: "01",
          heading: "First card",
          body: "Two to three sentences of detail.",
          accent: COLOR.red,
        },
        {
          label: "02",
          heading: "Second card",
          body: "Two to three sentences of detail.",
          accent: COLOR.gold,
        },
        {
          label: "03",
          heading: "Third card",
          body: "Two to three sentences of detail.",
          accent: COLOR.emerald,
        },
      ],
    },

    // ------------------------------------------------------------------
    // 5. QUOTE: big pull-quote. Use sparingly, 1 per deck.
    // ------------------------------------------------------------------
    {
      kind: "quote",
      quote: "A short, punchy line worth stopping on.",
      attribution: "Optional attribution",
    },

    // ------------------------------------------------------------------
    // 6. STAT: one huge number with label + context. Use for a wow moment.
    // ------------------------------------------------------------------
    {
      kind: "stat",
      eyebrow: "Optional label",
      value: "$7M+",
      label: "What the number means",
      context: "One or two sentences of context.",
    },

    // ------------------------------------------------------------------
    // 7. PEOPLE: 1 to 3 people with rich bullets. Use for leadership,
    //    advisors, or team presidents. Bullets show credentials.
    // ------------------------------------------------------------------
    {
      kind: "people",
      eyebrow: "Optional label",
      title: "Who these people are",
      body: "Optional one-liner context.",
      people: [
        {
          name: "Full Name",
          role: "Title or role",
          photo: "/img/filename.jpg", // Optional. Falls back to initials.
          initials: "FN",
          accent: COLOR.red,
          bullets: [
            "Accomplishment or credential",
            "Another bullet",
            "Another bullet",
          ],
        },
        // ... up to 3 total
      ],
    },

    // ------------------------------------------------------------------
    // 8. CABINET: many people (4+), compact photo + name + role only.
    //    Use when introducing a full team.
    // ------------------------------------------------------------------
    {
      kind: "cabinet",
      eyebrow: "Optional label",
      title: "Meet the team",
      body: "Optional one-liner context.",
      people: [
        {
          name: "Name",
          role: "Role",
          photo: "/img/name_shot.jpeg",
          initials: "NN",
          accent: COLOR.red,
        },
        // ... as many as you want. Grid is responsive.
      ],
    },

    // ------------------------------------------------------------------
    // 9. CTA: closing slide. Use once as the last slide.
    // ------------------------------------------------------------------
    {
      kind: "cta",
      eyebrow: "Closing label",
      title: "The ask",
      body: "Optional one-paragraph body.",
      actions: [
        { label: "usctts.com" },
        { label: "@trojantechsolutions on Instagram" },
        { label: "Show up next week" },
      ],
    },
  ],
};
