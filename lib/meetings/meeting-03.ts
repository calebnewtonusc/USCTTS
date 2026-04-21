import type { Meeting } from "./types";
import { COLOR } from "./types";

// Meeting 03 — Build session with team breakouts.
// General meeting: 2 slides. Build team breakout: 1 slide.
// Biotech and Consulting teams run their own slides separately.

export const meeting03: Meeting = {
  slug: "meeting-03",
  number: 3,
  title: "Team Build Session",
  date: "2026-05-05",
  dateLabel: "Monday, May 5",
  timeLabel: "7:00 PM PT",
  location: "USC Campus, location on Instagram",
  summary: "General kickoff, then teams split off to build.",
  status: "upcoming",
  accent: COLOR.red,
  slides: [
    // ----------------------------------------------------------------
    // GENERAL MEETING (all teams together)
    // ----------------------------------------------------------------

    {
      kind: "title",
      eyebrow: "Meeting 03",
      title: "Team Build Session",
      subtitle: "General kickoff. Then teams split.",
      footer: "Monday, May 5, 2026",
    },

    // ----------------------------------------------------------------
    // BUILD TEAM BREAKOUT
    // ----------------------------------------------------------------

    {
      kind: "section",
      number: "01",
      title: "Build Team",
      blurb: "Let's build.",
    },

    {
      kind: "bullets",
      eyebrow: "Tonight",
      title: "How this works",
      items: [
        {
          label: "General session",
          detail: "Quick announcements. Then teams break off.",
        },
        {
          label: "Build team",
          detail: "Caleb runs the room.",
        },
        {
          label: "Biotech team",
          detail: "Running their own session.",
        },
        {
          label: "Consulting team",
          detail: "Tyler runs the room.",
        },
      ],
    },
  ],
};
