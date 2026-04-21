import type { Meeting } from "./types";
import { COLOR } from "./types";

// Meeting 02 — Tuesday, April 28, 2026
// First half: Building (Caleb + Kaitlyn). Second half: Consulting (Tyler).
// Tyler's slides are left as clearly-marked placeholders for him to fill.

export const meeting02: Meeting = {
  slug: "meeting-02",
  number: 2,
  title: "Building Team 1st Meeting",
  date: "2026-04-28",
  dateLabel: "Tuesday, April 28",
  timeLabel: "7:00 PM PT",
  location: "USC Campus, location on Instagram",
  summary:
    "Building first half, Consulting second half. Vibe coding from zero.",
  status: "upcoming",
  accent: COLOR.red,
  slides: [
    {
      kind: "title",
      eyebrow: "Meeting 02",
      title: "Build. Build. Build.",
      subtitle: "First half Building. Second half Consulting.",
      footer: "Tuesday, April 28, 2026",
    },

    {
      kind: "bullets",
      eyebrow: "Tonight",
      title: "Two halves, one meeting",
      items: [
        {
          label: "Caleb's intro video",
          detail: "Ten minutes. How he got into building.",
        },
        {
          label: "Vibe Coding 101",
          detail: "Ten minutes. Caleb and Kaitlyn. Zero experience required.",
        },
        {
          label: "Two-minute form",
          detail: "Tell us what you want the Building Team to look like.",
        },
        {
          label: "Consulting second half",
          detail: "Tyler runs the room.",
        },
      ],
    },

    {
      kind: "section",
      number: "01",
      title: "Building",
      blurb: "How we got here. How you can start tonight.",
    },

    // TODO: Caleb, drop the unlisted YouTube ID here once the video is uploaded.
    // Covers: how he got into building, ambiguity vs excitement, personal Claude
    // examples, resourcefulness 101, problem space, idea → good idea → launch → scale.
    {
      kind: "video",
      eyebrow: "A word from Caleb",
      title: "How I got into building",
      youtubeId: "REPLACE_WITH_YOUTUBE_ID",
    },

    {
      kind: "section",
      number: "02",
      title: "Vibe Coding 101",
      blurb:
        "Ten minutes for anyone who has never touched code. Led by Caleb and Kaitlyn.",
    },

    {
      kind: "stat",
      eyebrow: "The only question that matters",
      value: "No.",
      label: "You do not need to know how to code",
      context:
        "Describe what you want in plain English. AI writes the code. Your job is to think clearly and direct it.",
    },

    {
      kind: "quote",
      quote:
        "Programming is still problem solving. What's shifting is resourcefulness over syntax.",
      attribution: "The vibe coder's edge",
    },

    {
      kind: "bullets",
      eyebrow: "The basics",
      title: "What is a tech stack?",
      body: "The combination of tools your product is built with. Like a kitchen: stove, pots, ingredients. Every product has a stack.",
      items: [
        {
          label: "Frontend",
          detail: "What users see and click. Webpage, button, form.",
        },
        {
          label: "Backend",
          detail:
            "Logic that runs behind the scenes. When someone submits a form, save it.",
        },
        {
          label: "Database",
          detail: "Where data is stored. Accounts, orders, posts.",
        },
      ],
    },

    {
      kind: "three-up",
      eyebrow: "Common tools",
      title: "What you will hear us say",
      cards: [
        {
          label: "UI",
          heading: "Next.js + Tailwind",
          body: "Next.js builds the pages users see. Tailwind makes it look good without writing CSS.",
          accent: COLOR.red,
        },
        {
          label: "Data",
          heading: "Supabase",
          body: "Database, auth, storage. Ready out of the box. Free to start.",
          accent: COLOR.emerald,
        },
        {
          label: "Money",
          heading: "Stripe",
          body: "Accept real payments. A few lines of code and you're live.",
          accent: COLOR.violet,
        },
      ],
    },

    {
      kind: "three-up",
      eyebrow: "More tools",
      title: "Where your code lives and ships",
      cards: [
        {
          label: "Write",
          heading: "Cursor or VS Code",
          body: "The IDE. Where the code lives on your computer and you see it run.",
          accent: COLOR.gold,
        },
        {
          label: "Save",
          heading: "GitHub",
          body: "Google Drive for code. Saves every version. You can undo anything.",
          accent: COLOR.zinc,
        },
        {
          label: "Ship",
          heading: "Vercel",
          body: "One click and your project has a real URL anyone can visit.",
          accent: COLOR.blue,
        },
      ],
    },

    {
      kind: "quote",
      quote:
        "You do not need to deeply understand each one. You need to know they exist so you can tell the AI what to use.",
      attribution: "The vibe coder's mindset",
    },

    {
      kind: "section",
      number: "03",
      title: "How the pieces fit",
      blurb:
        "Before any tool, think through your idea and validate it. Then start with GitHub.",
    },

    {
      kind: "bullets",
      eyebrow: "The pipeline",
      title: "Idea to live URL, in plain English",
      items: [
        { label: "You", detail: "Describe what you want to build." },
        {
          label: "Claude",
          detail: "Reads your whole project and writes or edits the code.",
        },
        {
          label: "Cursor or VS Code",
          detail: "Your text editor. Where you see and run the code.",
        },
        {
          label: "GitHub",
          detail: "Version control. Saves every change. Undo anything.",
        },
        {
          label: "Vercel",
          detail: "One-click deploy. Real URL. Real users.",
        },
      ],
    },

    {
      kind: "quote",
      quote:
        "If you do not want to pay the twenty a month, look into Gemini CLI for a free alternative.",
      attribution: "Caleb's practical tip",
    },

    {
      kind: "three-up",
      eyebrow: "Pick your on-ramp",
      title: "Which tool should you use?",
      cards: [
        {
          label: "Easiest",
          heading: "Lovable or Base44",
          body: "Fully managed. No code access. Fastest way to try an idea tonight.",
          accent: COLOR.emerald,
        },
        {
          label: "Real project",
          heading: "Cursor + Claude",
          body: "Your first real project with some guidance. You own the code.",
          accent: COLOR.gold,
        },
        {
          label: "Most control",
          heading: "Claude Code",
          body: "Claude runs commands, pushes to GitHub, deploys. Autonomously. For bigger projects.",
          accent: COLOR.red,
        },
      ],
    },

    {
      kind: "bullets",
      eyebrow: "Rule of thumb",
      title: "Start simple and graduate up",
      items: [
        {
          label: "Just want to try something",
          detail: "Lovable or Base44.",
        },
        {
          label: "Want to build something real you own",
          detail: "Cursor and Claude.",
        },
        {
          label: "Want to move fast on bigger projects",
          detail: "Claude Code.",
        },
      ],
    },

    {
      kind: "bullets",
      eyebrow: "Your first hour",
      title: "How to get started with Claude",
      items: [
        { label: "Go to claude.ai", detail: "The free account is enough." },
        {
          label: "Describe your idea",
          detail: "Like you are explaining it to a smart friend.",
        },
        {
          label: "Ask for something specific",
          detail:
            '"Build a webpage with a header, a sign-up form, and a button."',
        },
        {
          label: "Paste it into Cursor",
          detail: "Or VS Code. Either works.",
        },
        {
          label: "Iterate",
          detail:
            '"Make the button blue." "Add a second page." "Now connect the form."',
        },
      ],
    },

    {
      kind: "quote",
      quote:
        "Be specific. Vague prompts get vague results. The more clearly you describe what you want, the better the output.",
      attribution: "The one habit that matters",
    },

    {
      kind: "section",
      number: "04",
      title: "The mindset shift",
      blurb: "You are the product manager. Claude is the engineer.",
    },

    {
      kind: "bullets",
      eyebrow: "Your job",
      title: "What you actually do",
      items: [
        { label: "Know what you want to build" },
        { label: "Describe it clearly" },
        { label: "Test what gets built" },
        { label: "Give feedback and iterate" },
      ],
    },

    {
      kind: "quote",
      quote: "You do not write code. You direct the process.",
      attribution: "The new builder's role",
    },

    {
      kind: "bullets",
      eyebrow: "Quick recap",
      title: "What you now know",
      items: [
        {
          label: "Tech stack",
          detail:
            "Frontend, backend, database. The tools your product is built with.",
        },
        {
          label: "IDE",
          detail:
            "Where code lives on your computer. Cursor is beginner-friendly.",
        },
        {
          label: "GitHub",
          detail: "Saves every version of your code.",
        },
        {
          label: "Vercel",
          detail: "One click to put your project on the internet.",
        },
        {
          label: "Claude",
          detail:
            "Your AI engineer. Describe what you want, it writes the code.",
        },
        {
          label: "Lovable and Base44",
          detail: "The even-simpler starting point if you want zero setup.",
        },
      ],
    },

    {
      kind: "cta",
      eyebrow: "Go deeper",
      title: "howtovibecode.dev",
      body: "Free curriculum. Idea to live product accepting payments. No experience required.",
      actions: [
        { label: "Open howtovibecode.dev tonight" },
        { label: "Pick an idea you actually care about" },
        { label: "Have a live URL by the weekend" },
      ],
    },

    {
      kind: "section",
      number: "05",
      title: "Two minutes. Your turn.",
      blurb: "Tell us what you want the Building Team to look like.",
    },

    {
      kind: "bullets",
      eyebrow: "The form",
      title: "Three quick questions",
      items: [
        {
          label: "Interest",
          detail: "One to ten, how interested are you in building?",
        },
        {
          label: "Confidence",
          detail: "One to ten, how confident in your vibe coding skills?",
        },
        {
          label: "Open box",
          detail: "What do you think the Building Team should look like?",
        },
      ],
    },

    {
      kind: "section",
      number: "06",
      title: "Consulting",
      blurb: "Tyler takes it from here.",
    },

    // ------------------------------------------------------------------
    // TYLER — Consulting second half. Replace these placeholders with
    // your actual slides. Any slide kind works (bullets, three-up, quote,
    // stat, people, cabinet, cta, venn, split-bullets, video).
    // See _TEMPLATE.ts for examples.
    // ------------------------------------------------------------------

    {
      kind: "title",
      eyebrow: "Tyler · Consulting",
      title: "Placeholder",
      subtitle: "Tyler, fill me in.",
    },

    {
      kind: "title",
      eyebrow: "Tyler · Consulting",
      title: "Placeholder",
      subtitle: "Tyler, fill me in.",
    },

    {
      kind: "title",
      eyebrow: "Tyler · Consulting",
      title: "Placeholder",
      subtitle: "Tyler, fill me in.",
    },

    {
      kind: "title",
      eyebrow: "Tyler · Consulting",
      title: "Placeholder",
      subtitle: "Tyler, fill me in.",
    },

    {
      kind: "cta",
      eyebrow: "Before you leave",
      title: "Pick a team. Show up. Build.",
      body: "Two more meetings this spring. Grab Tyler, Caleb, or Kaitlyn after.",
      actions: [
        { label: "usctts.com" },
        { label: "@trojantechsolutions on Instagram" },
        { label: "Start tonight with something you actually care about" },
      ],
    },
  ],
};
