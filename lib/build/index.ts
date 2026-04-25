import type { Meeting } from "../meetings/types";
import { COLOR } from "../meetings/types";

export type BuildDeliverable = {
  title: string;
  description: string;
  status: "done" | "before" | "during" | "after";
};

export type BuildResource = {
  label: string;
  description: string;
  href?: string;
};

export type BuildSession = Meeting & {
  shortTitle: string;
  focus: string;
  preBuild?: BuildDeliverable[];
  deliverables: BuildDeliverable[];
  resources?: BuildResource[];
};

export const buildMeeting01: BuildSession = {
  slug: "meeting-01",
  number: 1,
  title: "Build Meeting 1: Vibe Coding 101",
  shortTitle: "Meeting one",
  focus:
    "Understand the ecosystem: AI coding tools, IDEs, GitHub, Vercel, and how they fit together.",
  date: "2026-04-18",
  dateLabel: "Build Meeting 1",
  timeLabel: "Foundation session",
  location: "TTS Build Team",
  summary:
    "A beginner-friendly walkthrough of the builder ecosystem and the mindset shift from syntax to resourcefulness.",
  status: "past",
  accent: COLOR.red,
  deliverables: [
    {
      title: "Know the builder pipeline",
      description:
        "Explain the path from idea, to AI coding tool, to editor, to GitHub, to Vercel.",
      status: "done",
    },
    {
      title: "Pick an on-ramp",
      description:
        "Choose whether to start with Cursor, VS Code, Claude, Gemini, or another AI coding flow.",
      status: "done",
    },
    {
      title: "Leave with less fear around code",
      description:
        "Understand that your job is clear thinking, prompting, taste, and iteration, not memorizing syntax.",
      status: "done",
    },
  ],
  resources: [
    {
      label: "GitHub",
      description: "Where code lives, versions, and gets shared.",
      href: "https://github.com/",
    },
    {
      label: "Vercel",
      description: "Where a project becomes a live URL.",
      href: "https://vercel.com/",
    },
    {
      label: "Claude",
      description: "AI assistant for planning, prompting, and code generation.",
      href: "https://claude.ai/",
    },
  ],
  slides: [
    {
      kind: "title",
      eyebrow: "Build Meeting 01",
      title: "Vibe Coding 101",
      subtitle: "How ideas become live websites without memorizing syntax.",
      footer: "TTS Build Team",
    },
    {
      kind: "section",
      number: "01",
      title: "The builder ecosystem",
      blurb: "You do not need every tool mastered. You need to know what each tool is for.",
    },
    {
      kind: "bullets",
      eyebrow: "The pipeline",
      title: "Idea to live URL, in plain English",
      items: [
        { label: "You", detail: "Describe what you want to build." },
        {
          label: "AI coding tool",
          detail:
            "Claude, Gemini, Cursor, or another assistant helps generate and edit code.",
        },
        {
          label: "IDE",
          detail: "VS Code or Cursor is where you open folders and run the project.",
        },
        {
          label: "GitHub",
          detail: "Save changes, push commits, and recover from mistakes.",
        },
        {
          label: "Vercel",
          detail: "Deploy the project so it has a real URL anyone can visit.",
        },
      ],
    },
    {
      kind: "cta",
      eyebrow: "Before next time",
      title: "Come ready to build",
      body: "Meeting 2 is hands-on. Set up the tools first so the room can spend time making instead of installing.",
      actions: [
        {
          label: "Create GitHub",
          detail: "You need an account before you can save and publish code.",
        },
        {
          label: "Pick an AI tool",
          detail: "Use Claude, Gemini, Cursor, or another tool you can access.",
        },
        {
          label: "Install an editor",
          detail: "VS Code or Cursor. Either is fine.",
        },
      ],
    },
  ],
};

export const buildMeeting02: BuildSession = {
  slug: "meeting-02",
  number: 2,
  title: "Build Meeting 2: Vibe Code Your First Web Page",
  shortTitle: "Meeting two",
  focus:
    "Arrive set up, follow along, and leave with a first webpage started and saved to GitHub.",
  date: "2026-04-25",
  dateLabel: "Build Meeting 2",
  timeLabel: "Hands-on build session",
  location: "TTS Build Team",
  summary:
    "A hands-on session for setting up the builder workflow, prompting resourcefully, and vibe coding a first personal webpage.",
  status: "upcoming",
  accent: COLOR.gold,
  preBuild: [
    {
      title: "Create or log into GitHub",
      description:
        "You should be able to make a repo, commit changes, and push code before the meeting starts.",
      status: "before",
    },
    {
      title: "Choose your AI coding tool",
      description:
        "Have Claude, Gemini, Cursor, or another AI coding assistant ready to use.",
      status: "before",
    },
    {
      title: "Install Cursor or VS Code",
      description:
        "Open the editor once before the meeting so we do not spend the first half installing software.",
      status: "before",
    },
    {
      title: "Create or log into Vercel",
      description:
        "Vercel is how the project becomes a public link when you are ready to ship it.",
      status: "before",
    },
    {
      title: "Bring your laptop charged",
      description:
        "If something breaks, bring the exact error message so we can debug quickly.",
      status: "before",
    },
  ],
  deliverables: [
    {
      title: "A first working webpage",
      description:
        "Use an AI coding tool to generate a simple webpage that runs locally or can be previewed.",
      status: "during",
    },
    {
      title: "One personal design change",
      description:
        "Make the page feel like you: edit copy, colors, layout, images, or a visual effect.",
      status: "during",
    },
    {
      title: "A project direction",
      description:
        "Write down what your personal portfolio or first site should become next.",
      status: "after",
    },
    {
      title: "Saved to GitHub",
      description:
        "Push your progress so the work can continue after the meeting.",
      status: "after",
    },
  ],
  resources: [
    {
      label: "GitHub",
      description: "Create an account and save your first repo.",
      href: "https://github.com/",
    },
    {
      label: "Vercel",
      description: "Deploy a GitHub repo to a live URL.",
      href: "https://vercel.com/",
    },
    {
      label: "VS Code",
      description: "A free code editor that works for every project.",
      href: "https://code.visualstudio.com/",
    },
    {
      label: "Cursor",
      description: "An AI-first code editor for building with prompts.",
      href: "https://cursor.com/",
    },
    {
      label: "Claude",
      description: "Useful for prompt engineering, planning, and debugging.",
      href: "https://claude.ai/",
    },
  ],
  slides: [
    {
      kind: "title",
      eyebrow: "Build Meeting 02",
      title: "Vibe Coding 101",
      subtitle: "How ideas become live websites. No syntax required.",
      footer: "TTS Build Team",
    },
    {
      kind: "bullets",
      eyebrow: "Tonight",
      title: "What we're covering",
      items: [
        {
          label: "10 min video",
          detail: "How Caleb got into building — problem space, resourcefulness, idea to launch",
        },
        {
          label: "Vibe Coding 101",
          detail: "Tech stacks, the ecosystem, GitHub basics, which tools to use",
        },
        {
          label: "2 min form",
          detail: "What you want to build and how the BUILD team should look",
        },
      ],
    },
    {
      kind: "video",
      eyebrow: "Part 1 — 10 min",
      title: "How I got into building",
      src: "/video/caleb-intro.mp4",
    },
    {
      kind: "stat",
      eyebrow: "Do you need to know how to code?",
      value: "No.",
      label: "Vibe coding = describe what you want. AI writes the code.",
      context:
        "Your job is to think clearly and direct the AI — not memorize syntax. Programming is still valuable, but it's shifting toward resourcefulness over syntax.",
    },
    {
      kind: "split-bullets",
      eyebrow: "The mindset shift",
      title: "You are the PM. Claude is the engineer.",
      columns: [
        {
          eyebrow: "You",
          title: "Product Manager",
          accent: COLOR.gold,
          items: [
            { label: "Know what you want to build" },
            { label: "Describe it clearly" },
            { label: "Test what gets built" },
            { label: "Give feedback and iterate" },
          ],
        },
        {
          eyebrow: "Claude",
          title: "Your Engineer",
          accent: COLOR.blue,
          items: [
            { label: "Reads your entire codebase" },
            { label: "Writes and edits code" },
            { label: "Follows your direction" },
            { label: "Handles all the syntax" },
          ],
        },
      ],
    },
    {
      kind: "three-up",
      eyebrow: "Tech stack",
      title: "Every product has three layers",
      cards: [
        {
          label: "Frontend",
          heading: "What users see",
          body: "Webpages, buttons, forms — everything visible. Built with tools like Next.js and React.",
          accent: COLOR.emerald,
        },
        {
          label: "Backend",
          heading: "Logic behind the scenes",
          body: '"When they submit the form, save it." The rules that run when users do things.',
          accent: COLOR.blue,
        },
        {
          label: "Database",
          heading: "Where data lives",
          body: "User accounts, orders, posts. Tools like Supabase and Firebase give you this out of the box.",
          accent: COLOR.violet,
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "Common tools",
      title: "Know what each tool is for",
      body: "You don't need to master these — just know they exist so you can tell the AI what to use.",
      items: [
        { label: "Next.js / React", detail: "Builds the frontend — what users see and interact with" },
        { label: "Tailwind CSS", detail: "Makes it look good without writing much CSS" },
        { label: "Supabase / Firebase", detail: "Database and login, ready out of the box" },
        { label: "Stripe", detail: "Accepting payments" },
        { label: "Vercel", detail: "Puts your site on the internet with a real URL" },
        { label: "GitHub", detail: "Saves your code and tracks every change — push, pull, commit" },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "The ecosystem",
      title: "How it all fits together",
      body: "Before any of this — validate your idea first. Caleb covers this in the video.",
      items: [
        { label: "You", detail: "Describe what you want to build" },
        { label: "Claude / AI", detail: "Writes and edits code. Free alternative: Gemini CLI." },
        { label: "IDE — Cursor or VS Code", detail: "Where the code lives on your computer. You see and run it here." },
        { label: "GitHub", detail: "Saves every version like Google Drive for code. Commit, push, pull." },
        { label: "Vercel", detail: "One click to a live URL anyone can visit." },
      ],
    },
    {
      kind: "split-bullets",
      eyebrow: "GitHub basics",
      title: "Save, back up, and collaborate on code",
      body: "Think of GitHub as Google Drive — but smarter. It saves every version of your code forever.",
      columns: [
        {
          eyebrow: "The concepts",
          title: "What you need to know",
          accent: COLOR.emerald,
          items: [
            { label: "Repo", detail: "The folder holding your entire project on GitHub." },
            { label: "Main", detail: "Your official branch — the finished, working copy everyone uses." },
            { label: "Commit", detail: "A snapshot of your code at this moment. GitHub remembers every save." },
          ],
        },
        {
          eyebrow: "The actions",
          title: "What you'll actually do",
          accent: COLOR.gold,
          items: [
            { label: "Push", detail: "Upload your commits to GitHub — backed up in the cloud." },
            { label: "Pull", detail: "Download the latest version to stay in sync with your team." },
            { label: "Branch", detail: "A separate copy to try things without touching what works." },
          ],
        },
      ],
    },
    {
      kind: "split-bullets",
      eyebrow: "The tools",
      title: "Claude Chat vs Claude Code",
      body: "Same AI. Very different levels of power.",
      columns: [
        {
          eyebrow: "Claude Chat",
          title: "claude.ai",
          accent: COLOR.blue,
          items: [
            { label: "Browser-based", detail: "Nothing to install. Free tier available." },
            { label: "You paste code in", detail: "It doesn't see your files automatically." },
            { label: "Great for questions", detail: "Drafts, planning, and quick tasks." },
          ],
        },
        {
          eyebrow: "Claude Code",
          title: "CLI — runs in your terminal",
          accent: COLOR.violet,
          items: [
            { label: "Lives in your project", detail: "Reads your entire codebase automatically." },
            { label: "Runs commands", detail: "Edits files, pushes to GitHub, deploys." },
            { label: "Autonomous", detail: "Works while you describe. Idea to live URL." },
          ],
        },
      ],
    },
    {
      kind: "three-up",
      eyebrow: "Which tool?",
      title: "Start simple. Graduate up.",
      cards: [
        {
          label: "Just exploring",
          heading: "Lovable / Base44",
          body: "Zero setup. No files on your computer. Great for prototypes and first experiments.",
          accent: COLOR.emerald,
        },
        {
          label: "First real project",
          heading: "Cursor + Claude",
          body: "Build something real you own. Code lives on your machine. Medium effort.",
          accent: COLOR.gold,
        },
        {
          label: "Going deeper",
          heading: "Claude Code",
          body: "Claude runs commands, pushes to GitHub, and deploys — autonomously.",
          accent: COLOR.violet,
        },
      ],
    },
    {
      kind: "cta",
      eyebrow: "Getting started",
      title: "Start with Claude. Right now.",
      body: "Go to claude.ai — free account. Describe your idea like you'd explain it to a smart friend. Be specific: vague prompts get vague results.",
      actions: [
        {
          label: "Describe it",
          detail: '"Build me a simple webpage with a header, a sign-up form, and a button."',
        },
        {
          label: "Paste it",
          detail: "Copy the code into Cursor or VS Code and run it.",
        },
        {
          label: "Iterate",
          detail: '"Make the button blue." / "Add a second page." Keep going.',
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "Recap",
      title: "What you just learned",
      items: [
        { label: "Tech stack", detail: "Frontend + backend + database — the tools your product runs on." },
        { label: "IDE", detail: "Cursor or VS Code — where code lives on your computer." },
        { label: "GitHub", detail: "Saves every version. Commit, push, pull, branch." },
        { label: "Vercel", detail: "One click to a live URL." },
        { label: "Claude", detail: "Your AI engineer. Describe it → it builds it." },
        { label: "Start simple", detail: "Lovable / Base44 → Cursor → Claude Code. Graduate up." },
      ],
    },
    {
      kind: "cta",
      eyebrow: "Before you leave",
      title: "Fill out the form.",
      body: "Two minutes. Helps us make every future meeting worth your time.",
      actions: [
        { label: "Background", detail: "Interest level + vibe coding confidence (1–10)" },
        {
          label: "What you want to build",
          detail: "Web app, AI tool, mobile app, or marketplace — rate each 1–5",
        },
        { label: "Feedback", detail: "What do you think the BUILD team should look like?" },
      ],
    },
  ],
};

export const BUILD_SESSIONS: BuildSession[] = [buildMeeting01, buildMeeting02];

export function getBuildSession(slug: string) {
  return BUILD_SESSIONS.find((session) => session.slug === slug);
}

export function buildSessionSlugs() {
  return BUILD_SESSIONS.map((session) => session.slug);
}

export const currentBuildSession = buildMeeting02;
