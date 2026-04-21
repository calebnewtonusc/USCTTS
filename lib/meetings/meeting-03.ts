import type { Meeting } from "./types";
import { COLOR } from "./types";

// Meeting 03 — Build session with team breakouts.
// General meeting: 2 slides. Build team breakout: 1 slide.
// Biotech and Consulting teams run their own slides separately.

export const meeting03: Meeting = {
  slug: "meeting-03",
  number: 3,
  title: "General Meeting 2: Team Build Session",
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
      title: "Team Build Day",
      subtitle: "Tonight we build. Teams split off after this.",
      footer: "Monday, May 5, 2026",
    },

    {
      kind: "three-up",
      eyebrow: "Tonight's teams",
      title: "Where you're headed",
      cards: [
        {
          label: "Building",
          heading: "Building",
          body: "Staying here. Caleb runs the room.",
          accent: COLOR.red,
        },
        {
          label: "Consulting",
          heading: "Consulting",
          body: "Breaking off. Tyler runs the room.",
          accent: COLOR.gold,
        },
        {
          label: "Biotech",
          heading: "Biotech",
          body: "Breaking off to their own session.",
          accent: COLOR.emerald,
        },
      ],
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
  ],
};
