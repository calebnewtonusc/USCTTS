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
  title: "Build Meeting 1: Vibe Code Your First Web Page",
  shortTitle: "Meeting one",
  focus:
    "Arrive set up, follow along, and leave with a first webpage started and saved to GitHub.",
  date: "2026-04-25",
  dateLabel: "Build Meeting 1",
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
      eyebrow: "Build Meeting 01",
      title: "Vibe Code Your First Web Page",
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
          detail:
            "How Caleb got into building — problem space, resourcefulness, idea to launch",
        },
        {
          label: "Vibe Coding 101",
          detail:
            "Tech stacks, the ecosystem, GitHub basics, which tools to use",
        },
        {
          label: "Live demo",
          detail:
            "Watch a webpage get built from a single prompt — start to running in the browser",
        },
        {
          label: "2 min form",
          detail: "What you want to build and how the BUILD team should look",
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "Learning objectives",
      title: "What you'll leave knowing",
      body: "By the end of tonight, every one of these should feel obvious — not magic.",
      items: [
        {
          label: "What vibe coding actually is",
          detail:
            "Why describing what you want is now a real skill — and why syntax is no longer the bottleneck.",
        },
        {
          label: "The builder ecosystem",
          detail:
            "Frontend, backend, database, GitHub, Vercel — what each piece does and when you'd reach for it.",
        },
        {
          label: "How to prompt like a builder",
          detail:
            "Be specific, bring references, iterate one step at a time, paste errors back in.",
        },
        {
          label: "Which tool to start with",
          detail:
            "Lovable / Base44 → Cursor → Claude Code. You'll know which one fits where you are right now.",
        },
      ],
    },
    {
      kind: "cta",
      eyebrow: "Pre-lab",
      title: "Before tonight — the setup checklist",
      body: "These were assigned before Meeting 1. If you haven't done them yet, get them done now before we start.",
      actions: [
        {
          label: "GitHub",
          detail: "Account created — able to make a repo and push code.",
        },
        {
          label: "Cursor or VS Code",
          detail: "Installed and opened at least once.",
        },
        {
          label: "Claude or Gemini",
          detail: "An AI coding tool you can access right now.",
        },
        { label: "Vercel", detail: "Account created for deployment." },
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
        {
          label: "Next.js / React",
          detail: "Builds the frontend — what users see and interact with",
        },
        {
          label: "Tailwind CSS",
          detail: "Makes it look good without writing much CSS",
        },
        {
          label: "Supabase / Firebase",
          detail: "Database and login, ready out of the box",
        },
        { label: "Stripe", detail: "Accepting payments" },
        {
          label: "Vercel",
          detail: "Puts your site on the internet with a real URL",
        },
        {
          label: "GitHub",
          detail:
            "Saves your code and tracks every change — push, pull, commit",
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "The ecosystem",
      title: "How it all fits together",
      body: "Before any of this — validate your idea first. Caleb covers this in the video.",
      items: [
        { label: "You", detail: "Describe what you want to build" },
        {
          label: "Claude / AI",
          detail: "Writes and edits code. Free alternative: Gemini CLI.",
        },
        {
          label: "IDE — Cursor or VS Code",
          detail:
            "Where the code lives on your computer. You see and run it here.",
        },
        {
          label: "GitHub",
          detail:
            "Saves every version like Google Drive for code. Commit, push, pull.",
        },
        {
          label: "Vercel",
          detail: "One click to a live URL anyone can visit.",
        },
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
            {
              label: "Repo",
              detail: "The folder holding your entire project on GitHub.",
            },
            {
              label: "Main",
              detail:
                "Your official branch — the finished, working copy everyone uses.",
            },
            {
              label: "Commit",
              detail:
                "A snapshot of your code at this moment. GitHub remembers every save.",
            },
          ],
        },
        {
          eyebrow: "The actions",
          title: "What you'll actually do",
          accent: COLOR.gold,
          items: [
            {
              label: "Push",
              detail: "Upload your commits to GitHub — backed up in the cloud.",
            },
            {
              label: "Pull",
              detail:
                "Download the latest version to stay in sync with your team.",
            },
            {
              label: "Branch",
              detail:
                "A separate copy to try things without touching what works.",
            },
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
            {
              label: "Browser-based",
              detail: "Nothing to install. Free tier available.",
            },
            {
              label: "You paste code in",
              detail: "It doesn't see your files automatically.",
            },
            {
              label: "Great for questions",
              detail: "Drafts, planning, and quick tasks.",
            },
          ],
        },
        {
          eyebrow: "Claude Code",
          title: "CLI — runs in your terminal",
          accent: COLOR.violet,
          items: [
            {
              label: "Lives in your project",
              detail: "Reads your entire codebase automatically.",
            },
            {
              label: "Runs commands",
              detail: "Edits files, pushes to GitHub, deploys.",
            },
            {
              label: "Autonomous",
              detail: "Works while you describe. Idea to live URL.",
            },
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
          detail:
            '"Build me a simple webpage with a header, a sign-up form, and a button."',
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
      kind: "section",
      number: "02",
      title: "Prompt like a builder",
      blurb:
        "Vague prompts get vague pages. Specific prompts get pages you'd actually ship.",
    },
    {
      kind: "bullets",
      eyebrow: "The workflow",
      title: "Four moves that make AI useful",
      body: "Use this loop every time. It's how you go from blank screen to working page without getting stuck.",
      items: [
        {
          label: "Name the outcome",
          detail:
            "Say what the page should do, who it's for, and what should be visible. Outcomes beat instructions.",
        },
        {
          label: "Bring references",
          detail:
            "Find a site, layout, or effect you like. Paste the URL or describe it exactly. AI is much better with examples.",
        },
        {
          label: "One step at a time",
          detail:
            "Generate → run → notice one thing → fix one thing. Don't ask for ten changes at once.",
        },
        {
          label: "Paste errors back",
          detail:
            "If something breaks, paste the exact error into Claude. Most bugs get solved on the first reply.",
        },
      ],
    },
    {
      kind: "split-bullets",
      eyebrow: "Prompt anatomy",
      title: "Weak prompt vs. builder prompt",
      body: "Same idea, very different result. The right side is what gets pasted into Claude tonight.",
      columns: [
        {
          eyebrow: "Weak",
          title: '"Make me a website"',
          accent: COLOR.zinc,
          items: [
            {
              label: "No audience",
              detail: "Claude has to guess who it's for.",
            },
            { label: "No structure", detail: "You'll get a generic template." },
            {
              label: "No reference",
              detail: "Looks like every AI demo from 2024.",
            },
          ],
        },
        {
          eyebrow: "Builder",
          title: '"Personal site for a USC student"',
          accent: COLOR.gold,
          items: [
            {
              label: "Audience named",
              detail: "Recruiters and founders skimming on a phone.",
            },
            {
              label: "Sections listed",
              detail: "Hero, about, three projects, contact — in that order.",
            },
            {
              label: "Reference attached",
              detail: '"Clean and modern, like linear.app or vercel.com."',
            },
          ],
        },
      ],
    },
    {
      kind: "section",
      number: "03",
      title: "Live demo — your first page",
      blurb:
        "Watch one prompt go from idea to a real webpage running in a browser. Then we copy the same flow.",
    },
    {
      kind: "cta",
      eyebrow: "Demo flow",
      title: "What you'll see Caleb do",
      body: "Same loop you'll run after the meeting. The point is: the steps are short, and the AI does the typing.",
      actions: [
        {
          label: "Step 1 · Prompt",
          detail: "Paste the builder prompt into Claude. Hit enter.",
        },
        {
          label: "Step 2 · Save the file",
          detail:
            "Drop the generated HTML into a new file in Cursor or VS Code.",
        },
        {
          label: "Step 3 · Open it",
          detail: "Double-click the file. The browser opens. The page is real.",
        },
        {
          label: "Step 4 · Iterate",
          detail:
            '"Change the headline to my name." "Make the hero darker." Watch it update.',
        },
      ],
    },
    {
      kind: "cta",
      eyebrow: "The starter prompt",
      title: "Copy this — try it tonight",
      body: "Build me a single-file personal webpage. HTML and CSS only, no frameworks. Sections: hero with my name, short about, three project cards, contact. Clean, modern, dark background, gold accent. Tell me how to open the file in my browser.",
      actions: [
        {
          label: "Run it",
          detail: "Open the generated file in your browser. Confirm it loads.",
        },
        {
          label: "Make it yours",
          detail:
            "Swap in your name, your projects, your colors. One change at a time.",
        },
        {
          label: "Push it",
          detail:
            "Create a GitHub repo. Commit. Push. Now it lives somewhere safe.",
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "Recap",
      title: "What you just learned",
      items: [
        {
          label: "Tech stack",
          detail:
            "Frontend + backend + database — the tools your product runs on.",
        },
        {
          label: "IDE",
          detail: "Cursor or VS Code — where code lives on your computer.",
        },
        {
          label: "GitHub",
          detail: "Saves every version. Commit, push, pull, branch.",
        },
        { label: "Vercel", detail: "One click to a live URL." },
        {
          label: "Claude",
          detail: "Your AI engineer. Describe it → it builds it.",
        },
        {
          label: "Prompt loop",
          detail: "Outcome → reference → one step → paste the error back.",
        },
        {
          label: "Start simple",
          detail: "Lovable / Base44 → Cursor → Claude Code. Graduate up.",
        },
      ],
    },
    {
      kind: "cta",
      eyebrow: "Before Meeting 2",
      title: "What we expect before next time",
      body: "Meeting 2 is hands-on. Show up with these done so we spend the time building, not installing.",
      actions: [
        {
          label: "GitHub repo",
          detail: "Create a repo and push at least one commit.",
        },
        {
          label: "Editor working",
          detail: "Cursor or VS Code — open a folder, see some files.",
        },
        {
          label: "AI tool ready",
          detail: "Claude or Gemini — know how to open it and paste a prompt.",
        },
      ],
    },
    {
      kind: "cta",
      eyebrow: "Before you leave",
      title: "Fill out the form.",
      body: "Two minutes. Helps us make every future meeting worth your time.",
      actions: [
        {
          label: "Background",
          detail: "Interest level + vibe coding confidence (1–10)",
        },
        {
          label: "What you want to build",
          detail:
            "Web app, AI tool, mobile app, or marketplace — rate each 1–5",
        },
        {
          label: "Feedback",
          detail: "What do you think the BUILD team should look like?",
        },
      ],
    },
  ],
};

export const buildMeeting02: BuildSession = {
  slug: "meeting-02",
  number: 2,
  title: "Build Meeting 2: Build Your First Page",
  shortTitle: "Meeting two",
  focus:
    "Follow along, build a working webpage with Claude, and leave with a personal portfolio plan.",
  date: "2026-05-02",
  dateLabel: "Build Meeting 2",
  timeLabel: "Hands-on session",
  location: "TTS Build Team",
  summary:
    "Demo-first and hands-on. Everyone follows along using Claude to build a simple webpage, then gets a framework for their personal portfolio.",
  status: "upcoming",
  accent: COLOR.emerald,
  preBuild: [
    {
      title: "GitHub repo ready",
      description:
        "Create a repo and push at least one commit before the meeting.",
      status: "before",
    },
    {
      title: "Cursor or VS Code working",
      description:
        "Open your editor, open a folder, see some files. That's all.",
      status: "before",
    },
    {
      title: "Claude or Gemini ready",
      description: "Know how to open it and paste a prompt.",
      status: "before",
    },
  ],
  deliverables: [
    {
      title: "A working webpage",
      description: "Built with Claude. Running in your browser.",
      status: "during",
    },
    {
      title: "One personal change",
      description: "Your name, your colors, something that makes it yours.",
      status: "during",
    },
    {
      title: "First commit pushed",
      description:
        "Code saved to GitHub so you can keep building after the meeting.",
      status: "after",
    },
    {
      title: "A portfolio plan",
      description:
        "What your site should become — written using the problem → user → MVP framework.",
      status: "after",
    },
  ],
  resources: [
    {
      label: "Claude",
      description: "Prompt it to build your first page.",
      href: "https://claude.ai/",
    },
    {
      label: "Cursor",
      description: "AI-first editor for building with prompts.",
      href: "https://cursor.com/",
    },
    {
      label: "GitHub",
      description: "Save and push your first commit.",
      href: "https://github.com/",
    },
  ],
  slides: [
    {
      kind: "title",
      eyebrow: "Build Meeting 02",
      title: "Build Your First Page",
      subtitle: "Follow along. Leave with something real.",
      footer: "TTS Build Team",
    },
    {
      kind: "cta",
      eyebrow: "Pre-lab",
      title: "Tools check — do you have everything?",
      body: "Raise your hand if you still need to set something up. We'll sort it before we start.",
      actions: [
        {
          label: "GitHub",
          detail: "Account ready, repo created, able to push.",
        },
        { label: "Editor", detail: "Cursor or VS Code installed and open." },
        {
          label: "AI tool",
          detail: "Claude or Gemini — open and ready to use.",
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "Quick recap",
      title: "Meeting 1 in 60 seconds",
      body: "The whole ecosystem in one slide before we build.",
      items: [
        {
          label: "IDE",
          detail:
            "Cursor or VS Code — just how you see and run your code on your computer.",
        },
        {
          label: "Claude / AI",
          detail: "Describe what you want. It writes the code.",
        },
        {
          label: "GitHub",
          detail:
            "Saves every version. Commit → push → your code is backed up.",
        },
        {
          label: "Vercel",
          detail: "One click to a live URL anyone can visit.",
        },
      ],
    },
    {
      kind: "section",
      number: "01",
      title: "Everyone follow along",
      blurb: "Open Claude. We're all starting from the same prompt.",
    },
    {
      kind: "cta",
      eyebrow: "The prompt",
      title: "Paste this into Claude",
      body: "Build me a simple personal webpage with a hero section, an about section, a projects section, and a contact section. Keep it clean and modern. Use only HTML and CSS — no frameworks. Explain how to open it in my browser.",
      actions: [
        {
          label: "Run it",
          detail: "Open the file in your browser and see the page.",
        },
        {
          label: "Break something",
          detail: "Change one line. See what happens.",
        },
        {
          label: "Fix it",
          detail: "Paste the error back into Claude. Watch it solve it.",
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "Prompt like a builder",
      title: "How to get what you actually want",
      items: [
        {
          label: "Name the outcome",
          detail: "Say what the page should do and what should be visible.",
        },
        {
          label: "Bring references",
          detail:
            "Find a site or effect you want. Paste the URL or describe it exactly.",
        },
        {
          label: "One step at a time",
          detail:
            "Generate → run → paste the error → improve one thing. Repeat.",
        },
        {
          label: "Steal the mechanic",
          detail:
            "Use references to understand the pattern, then make it yours.",
        },
      ],
    },
    {
      kind: "quote",
      quote:
        "Good prompting is not magic. It is being specific, showing references, and staying resourceful when the first answer breaks.",
      attribution: "Build Team",
    },
    {
      kind: "section",
      number: "02",
      title: "Your personal portfolio",
      blurb: "This is the project. Not a demo — your actual site.",
    },
    {
      kind: "bullets",
      eyebrow: "The framework",
      title: "Problem → User → MVP",
      body: "Use this to define what your portfolio should actually be before you build it.",
      items: [
        {
          label: "Problem",
          detail:
            "What does your portfolio need to do for you? Get a job? Show clients? Document your work?",
        },
        {
          label: "User",
          detail:
            "Who is actually going to look at it — recruiters, founders, collaborators?",
        },
        {
          label: "MVP",
          detail:
            "What is the minimum version that accomplishes the goal? One page? Three sections?",
        },
      ],
    },
    {
      kind: "cta",
      eyebrow: "Walkaway",
      title: "Leave with proof you can build",
      body: "By the end of tonight you should have something real you made yourself.",
      actions: [
        {
          label: "Working webpage",
          detail: "Built with Claude. Running in your browser.",
        },
        {
          label: "One personal change",
          detail: "Your name, colors, or layout — something that's yours.",
        },
        {
          label: "First commit pushed",
          detail: "Code on GitHub so you can keep building.",
        },
        {
          label: "Portfolio plan",
          detail: "What your site should become — written down.",
        },
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
