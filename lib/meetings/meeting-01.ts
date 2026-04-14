import type { Meeting } from "./types";
import { COLOR } from "./types";

// Meeting 01 — Tuesday, April 14, 2026
// Kickoff under new leadership. Cabinet, advisors, tools, teams.

export const meeting01: Meeting = {
  slug: "meeting-01",
  number: 1,
  title: "Welcome to TTS",
  date: "2026-04-14",
  dateLabel: "Tuesday, April 14",
  timeLabel: "7:00 PM PT",
  location: "USC Campus, location on Instagram",
  summary:
    "The kickoff under new leadership. The cabinet, the advisors, the tools, the teams, and why we need you.",
  status: "upcoming",
  accent: COLOR.red,
  slides: [
    {
      kind: "title",
      eyebrow: "Meeting 01",
      title: "Welcome to TTS",
      subtitle:
        "USC's AI-native club for builders, consultants, and operators. Every major. No gatekeeping.",
      footer: "Tuesday, April 14, 2026",
    },

    {
      kind: "section",
      number: "01",
      title: "The new chapter",
      blurb:
        "Leadership transferred roughly three weeks ago. We are rebuilding TTS into the strongest club on campus. Here is who is driving it.",
    },
    {
      kind: "people",
      eyebrow: "Co-Presidents",
      title: "Running the club",
      body: "Three weeks in. Building infrastructure, team, and an advisor network worth being part of.",
      people: [
        {
          name: "Tyler Larsen",
          role: "Co-President · Consulting & People",
          photo: "/img/tyler_shot.jpeg",
          position: "center center",
          initials: "TL",
          accent: COLOR.gold,
          bullets: [
            "Consulting curriculum and client pipeline",
            "E-board, partnerships, cross-club ecosystem",
            "Community culture and recruiting",
          ],
        },
        {
          name: "Caleb Newton",
          role: "Co-President · Innovation & Building",
          photo: "/img/caleb_shot.jpg",
          position: "center 15%",
          initials: "CN",
          accent: COLOR.red,
          bullets: [
            "Product curriculum and AI systems",
            "Website, internal tooling, and builder culture",
            "Startup relationships, demos, investor access",
          ],
        },
      ],
    },

    {
      kind: "cabinet",
      eyebrow: "Meet the cabinet",
      title: "The nine who run the rest of TTS",
      body: "Every team, every function. If you need something, one of these people owns it.",
      people: [
        {
          name: "Ephrem Adugna",
          role: "Co-President, Building Team",
          photo: "/img/ephrem_shot.jpeg",
          initials: "EA",
          accent: COLOR.red,
        },
        {
          name: "Austin Chen",
          role: "President, Biotech Team",
          photo: "/img/austin_shot.png",
          initials: "AC",
          accent: COLOR.emerald,
        },
        {
          name: "Gabriel Oliveri",
          role: "President, Engineering Team",
          photo: "/img/gabriel_shot.png",
          initials: "GO",
          accent: COLOR.blue,
        },
        {
          name: "Omniya Mohamed",
          role: "Lead of Operations",
          photo: "/img/omniya_shot.jpeg",
          initials: "OM",
          accent: COLOR.red,
        },
        {
          name: "Mary Zewdie",
          role: "Lead of Marketing",
          photo: "/img/mary_shot.jpeg",
          initials: "MZ",
          accent: COLOR.red,
        },
        {
          name: "Esrom Dawit",
          role: "External Affairs",
          photo: "/img/esrom_shot.jpeg",
          initials: "ED",
          accent: COLOR.red,
        },
        {
          name: "Annabelle Forbes",
          role: "Social Chair",
          photo: "/img/annabelle_shot.jpeg",
          initials: "AF",
          accent: COLOR.red,
        },
        {
          name: "Malakai Carey",
          role: "Lead of Music",
          photo: "/img/malakai_shot.jpeg",
          initials: "MC",
          accent: COLOR.red,
        },
        {
          name: "Jet Jadeja",
          role: "Lead of Web3",
          photo: "/img/jet_shot.jpeg",
          initials: "JJ",
          accent: COLOR.red,
        },
      ],
    },

    {
      kind: "bullets",
      eyebrow: "Three weeks in",
      title: "What is already in place",
      items: [
        {
          label: "Leadership team, assembled",
          detail:
            "Two co-presidents, nine cabinet members covering every function.",
        },
        {
          label: "Advisor network",
          detail:
            "Incoming McKinsey analyst, Reddit engineer and startup founder, Stanford MBA and Clay co-developer.",
        },
        {
          label: "Tools most students never touch",
          detail:
            "Full access to Clay, the AI data platform companies pay six figures for.",
        },
        {
          label: "Four active teams",
          detail:
            "Consulting, Building, Biotech, and Engineering. Each shipping something real this semester.",
        },
      ],
    },

    {
      kind: "section",
      number: "02",
      title: "Why join TTS",
      blurb:
        "We have the leadership, the advisors, and the tools. We need committed members to help execute.",
    },
    {
      kind: "bullets",
      eyebrow: "What membership gives you",
      title: "Three things you get here and nowhere else on campus",
      items: [
        {
          label: "Real consulting experience",
          detail:
            "Active engagements with real nonprofits. Deliverables that actually ship.",
        },
        {
          label: "Mentorship from people in the arena",
          detail:
            "McKinsey, Reddit, Stanford GSB. Not a guest speaker, an active mentor.",
        },
        {
          label: "A competitive tool stack",
          detail:
            "Clay and the AI platforms professionals pay to learn. You use them on real projects.",
        },
      ],
    },

    {
      kind: "section",
      number: "03",
      title: "The Consulting Team",
      blurb:
        "Our primary focus. AI-first engagements for nonprofits and mission-driven organizations.",
    },
    {
      kind: "bullets",
      eyebrow: "Mission",
      title: "What the Consulting Team does",
      body: "We are not a case-competition club. Every engagement serves a real organization doing real good.",
      items: [
        {
          label: "Nonprofits and charities only",
          detail:
            "Cancer research, social services, community orgs. Work that moves the needle.",
        },
        {
          label: "Advisor-backed execution",
          detail:
            "Every project runs with McKinsey-level guidance, not student guesswork.",
        },
        {
          label: "AI-native deliverables",
          detail:
            "Clay and similar tools applied directly to the client's hardest problem.",
        },
        {
          label: "Genuine client outcomes",
          detail:
            "Measurable impact, not a slide deck. Your name on work that actually shipped.",
        },
      ],
    },
    {
      kind: "three-up",
      eyebrow: "Why this matters for you",
      title: "Gain experience. Master tools. Create impact.",
      cards: [
        {
          label: "01",
          heading: "Gain experience",
          body: "Live client engagements as an underclassman. Build the resume a generic case club cannot.",
          accent: COLOR.gold,
        },
        {
          label: "02",
          heading: "Master AI tools",
          body: "Hands-on with Clay and the platforms firms pay to train their analysts on.",
          accent: COLOR.red,
        },
        {
          label: "03",
          heading: "Create impact",
          body: "Every hour goes toward an organization already doing work you believe in.",
          accent: COLOR.emerald,
        },
      ],
    },
    {
      kind: "quote",
      quote:
        "The connections and access we have to certain AI-powered tools is what truly sets us apart.",
      attribution: "The TTS thesis",
    },

    {
      kind: "section",
      number: "04",
      title: "The advisors",
      blurb:
        "Not guest speakers. Active mentors personally invested in TTS succeeding.",
    },
    {
      kind: "people",
      eyebrow: "Board of Advisors",
      title: "Three people with runway to make TTS the best club on campus",
      people: [
        {
          name: "Matthew Kim",
          role: "Incoming McKinsey Analyst",
          photo: "/img/matthew_shot.jpeg",
          initials: "MK",
          accent: COLOR.gold,
          bullets: [
            "Joins the world's top consulting firm in eight months",
            "Using that runway to build TTS into USC's strongest club",
            "Personally mentoring the Consulting Team",
          ],
        },
        {
          name: "Kevin Sangmuah",
          role: "Engineer at Reddit · Startup Founder",
          photo: "/img/kevin_shot.jpeg",
          initials: "KS",
          accent: COLOR.red,
          bullets: [
            "Software engineer at Reddit",
            "Founder and current CFO at Retax 360",
            "Brings engineering and operator muscle to TTS",
          ],
        },
        {
          name: "Sagar Tiwari",
          role: "Stanford MBA · Clay Co-Developer",
          initials: "ST",
          accent: COLOR.emerald,
          bullets: [
            "Former McKinsey consultant",
            "Co-developer of Clay, the AI tool TTS now uses",
            "Recognized by senior McKinsey leadership",
          ],
        },
      ],
    },

    {
      kind: "section",
      number: "05",
      title: "Clay",
      blurb:
        "The AI data platform companies pay hundreds of thousands to use. TTS has full access through Sagar.",
    },
    {
      kind: "bullets",
      eyebrow: "What you get",
      title: "Clay, unlocked",
      body: "An AI-powered tool that scrapes, enriches, and targets data at internet scale. Most professionals never touch it. You will.",
      items: [
        {
          label: "Companies pay six figures for access",
          detail:
            "Clay sits behind the GTM motion of some of the fastest-growing startups on the market.",
        },
        {
          label: "TTS has full access",
          detail:
            "Through our advisor Sagar Tiwari, who co-developed the platform.",
        },
        {
          label: "Deployed on nonprofit work",
          detail:
            "Every Clay campaign we run supports an organization doing real good.",
        },
      ],
    },
    {
      kind: "stat",
      eyebrow: "The Clay playbook, proven",
      value: "$7M+",
      label: "revenue in year one",
      context:
        "Sagar used Clay to grow an AI receptionist startup from near-zero to over $7M in its first year. That same playbook is now in the hands of TTS members.",
    },
    {
      kind: "three-up",
      eyebrow: "Clay for nonprofits",
      title: "Three campaigns we can run, day one",
      cards: [
        {
          label: "01",
          heading: "Targeted donor outreach",
          body: "Identify families with a history of major giving. Run St. Jude-style campaigns with personalized emails at scale.",
          accent: COLOR.gold,
        },
        {
          label: "02",
          heading: "Volunteer recruitment",
          body: "Find able-bodied 18 to 40 year-olds within ten miles of the site, with prior volunteer history. Fill an LA River cleanup.",
          accent: COLOR.emerald,
        },
        {
          label: "03",
          heading: "Nationwide nonprofit outreach",
          body: "Reach every nonprofit in the United States. Filter by mission, geography, and size for surgical campaigns.",
          accent: COLOR.blue,
        },
      ],
    },

    {
      kind: "section",
      number: "06",
      title: "The Building Team",
      blurb:
        "Ship real apps. Run real campaigns. Learn startup execution directly from Caleb.",
    },
    {
      kind: "people",
      eyebrow: "Building Team Co-Presidents",
      title: "The people running Building",
      body: "Rapid development, startup strategy, and investor access. Members ship working products on day one.",
      people: [
        {
          name: "Caleb Newton",
          role: "Co-President, Building Team",
          photo: "/img/caleb_shot.jpg",
          position: "center 15%",
          initials: "CN",
          accent: COLOR.red,
          bullets: [
            "Software Engineer at AINA Tech, building holographic video",
            "AI, Data, Product and GTM Engineer at Blue Modern Advisory",
            "Consultant: Pallas Care, Beamlink, Cosasco",
            "Research Assistant at Caltech (control theory)",
          ],
        },
        {
          name: "Ephrem Adugna",
          role: "Co-President, Building Team",
          photo: "/img/ephrem_shot.jpeg",
          initials: "EA",
          accent: COLOR.red,
          bullets: [
            "Software Implementation Intern at The Aerospace Corporation",
            "Founder of INVERT LLC, digital advertising screens in storefronts",
            "USC Viterbi researcher on LLM code synthesis",
            "Algoverse AI Bootcamp graduate",
          ],
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "What Building ships",
      title: "A typical day on the Building Team",
      items: [
        {
          label: "Design, build, deploy in one session",
          detail:
            "Caleb built this entire website in a few hours. That same vibe-coding muscle gets taught here.",
        },
        {
          label: "Apps and email campaigns in a single day",
          detail:
            "Learn to prototype, ship, and reach users inside one meeting.",
        },
        {
          label: "Startup and investor insights",
          detail:
            "Direct reps on founder playbooks, investor conversations, and GTM strategy.",
        },
      ],
    },

    {
      kind: "section",
      number: "07",
      title: "The Biotech Team",
      blurb:
        "Working on Amber with Sagar. Demoing to executives at Google, OpenAI, and LinkedIn.",
    },
    {
      kind: "people",
      eyebrow: "Biotech Team President",
      title: "Who runs Biotech",
      body: "Amber is Sagar Tiwari's new startup. The Marshall AI team is building the product. TTS Biotech is inside that build.",
      people: [
        {
          name: "Austin Chen",
          role: "President, Biotech Team",
          photo: "/img/austin_shot.png",
          initials: "AC",
          accent: COLOR.emerald,
          bullets: [
            "Leads the TTS Biotech track",
            "Driving Amber product development with the Marshall AI team",
            "Integrating AI and ML into real biotech workflows",
          ],
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "Who sees the demos",
      title: "The audience for Biotech's next demo",
      body: "Product demonstrations delivered directly to executives who shape the AI industry.",
      items: [
        { label: "Google's Director of Data Analytics" },
        { label: "OpenAI's Technical Program Manager" },
        { label: "LinkedIn's CEO" },
      ],
    },

    {
      kind: "section",
      number: "08",
      title: "The Engineering Team",
      blurb:
        "The technical backbone. Builds the systems that power every other team.",
    },
    {
      kind: "people",
      eyebrow: "Engineering Team President",
      title: "Who runs Engineering",
      body: "Production-grade systems, shared infrastructure, and the deep technical support every other team leans on.",
      people: [
        {
          name: "Gabriel Oliveri",
          role: "President, Engineering Team",
          photo: "/img/gabriel_shot.png",
          initials: "GO",
          accent: COLOR.blue,
          bullets: [
            "Leads scalable software systems and infrastructure",
            "Ships production-ready solutions on real engagements",
            "Cross-team technical support and mentoring",
          ],
        },
      ],
    },

    {
      kind: "section",
      number: "09",
      title: "Teams that back each other",
      blurb:
        "As TTS grows, cross-functional support is the point. No team ships alone.",
    },
    {
      kind: "bullets",
      eyebrow: "In practice",
      title: "How teams compound",
      items: [
        {
          label: "Need music for a project? Music delivers.",
          detail:
            "Malakai and the Music team score demos, events, and campaigns on request.",
        },
        {
          label: "Need financial modeling? Consulting delivers.",
          detail:
            "Austin needs revenue projections for Amber. Consulting turns them around.",
        },
        {
          label: "Need a website in a weekend? Building delivers.",
          detail:
            "Every team ships faster because Building sits one room over.",
        },
        {
          label: "Need a campaign at scale? Marketing + Clay deliver.",
          detail:
            "Mary, Omniya, and the Clay stack run outreach no other club can match.",
        },
      ],
    },

    {
      kind: "cta",
      eyebrow: "See you next week",
      title: "Welcome to TTS.",
      body: "Questions, ideas, or someone you want on a team? Grab Tyler or Caleb after the meeting.",
      actions: [
        { label: "trojantechsolutions.com" },
        { label: "@trojantechsolutions on Instagram" },
        { label: "Pick a team. Show up next week. Build." },
      ],
    },
  ],
};
