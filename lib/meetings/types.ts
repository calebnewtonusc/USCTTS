// Shared types for the /meetings deck system.
// If you want to add a NEW kind of slide, add it here and render it in SlideDeck.tsx.
// Otherwise, just write new meeting content using the existing kinds.

export type Person = {
  name: string;
  role: string;
  photo?: string;
  // CSS object-position value for the photo. Defaults to "center top"
  // because most TTS headshots frame the face near the top of the image.
  // Examples: "center top", "center center", "center 15%".
  position?: string;
  initials: string;
  accent: string;
  bullets?: string[];
  // Optional affiliation chip (e.g. "McKinsey", "Reddit", "Stanford GSB").
  // Renders as a subtle pill below the role on people slides.
  affiliation?: string;
  // Optional affiliation logo path (e.g. "/img/logos/mckinsey.png").
  // Renders next to the affiliation label if provided.
  affiliationLogo?: string;
  // If the logo is dark-on-transparent, set this so the renderer inverts
  // the colors for dark slide backgrounds (black becomes white).
  affiliationLogoInvert?: boolean;
};

export type Slide =
  | {
      kind: "title";
      eyebrow: string;
      title: string;
      subtitle?: string;
      footer?: string;
    }
  | {
      kind: "section";
      number: string;
      title: string;
      blurb?: string;
    }
  | {
      kind: "bullets";
      eyebrow?: string;
      title: string;
      body?: string;
      items: { label: string; detail?: string }[];
    }
  | {
      kind: "three-up";
      eyebrow?: string;
      title: string;
      cards: { label: string; heading: string; body: string; accent: string }[];
    }
  | {
      kind: "quote";
      quote: string;
      attribution?: string;
    }
  | {
      kind: "stat";
      eyebrow?: string;
      value: string;
      label: string;
      context?: string;
    }
  | {
      kind: "people";
      eyebrow?: string;
      title: string;
      body?: string;
      // 1 to 3 people. Bullets are rendered.
      people: Person[];
    }
  | {
      kind: "cabinet";
      eyebrow?: string;
      title: string;
      body?: string;
      // Many people. Renders compact photo + name + role, no bullets.
      people: Person[];
    }
  | {
      kind: "cta";
      eyebrow?: string;
      title: string;
      body?: string;
      actions: { label: string; detail?: string }[];
    }
  | {
      kind: "venn";
      eyebrow?: string;
      title: string;
      body?: string;
      // Exactly three circles. Rendered as overlapping Venn with TTS in the middle.
      circles: [VennCircle, VennCircle, VennCircle];
      center: { label: string; sub?: string };
    };

export type VennCircle = {
  label: string; // short label like "Advisors", "Tools", "Knowledge"
  heading: string; // one-line claim
  body?: string; // supporting sentence
  accent: string;
};

export interface Meeting {
  slug: string;
  number: number;
  title: string;
  date: string; // ISO, e.g. "2026-04-14"
  dateLabel: string; // "Tuesday, April 14"
  timeLabel: string; // "7:00 PM PT"
  location: string;
  summary: string;
  status: "upcoming" | "live" | "past";
  accent: string;
  slides: Slide[];
}

// Shared palette so every meeting uses the same accents.
export const COLOR = {
  red: "#CC0000", // USC cardinal
  gold: "#FFCC00", // USC gold
  emerald: "#10b981",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  zinc: "#52525b",
} as const;
