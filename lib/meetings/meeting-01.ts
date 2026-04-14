import type { Meeting } from "./types";
import { COLOR } from "./types";

// Meeting 01 — Tuesday, April 14, 2026
// Introductory meeting. Club overview, four verticals, advisors, Clay, collaboration.

export const meeting01: Meeting = {
  slug: "meeting-01",
  number: 1,
  title: "Trojan Technology Solutions",
  date: "2026-04-14",
  dateLabel: "Tuesday, April 14",
  timeLabel: "7:00 PM PT",
  location: "USC Campus, location on Instagram",
  summary:
    "Introductory meeting. The mission, the four verticals, the advisors, the tools, and how you plug in.",
  status: "upcoming",
  accent: COLOR.red,
  slides: [
    {
      kind: "title",
      eyebrow: "Introductory Meeting",
      title: "Trojan Technology Solutions",
      subtitle:
        "A multidisciplinary club dedicated to shipping real-world products and delivering real solutions.",
      footer: "Tuesday, April 14, 2026",
    },

    {
      kind: "bullets",
      eyebrow: "Meeting Objectives",
      title: "Today's Agenda",
      items: [
        {
          label: "Mission overview",
          detail: "How we approach impact, technology, and the work itself.",
        },
        {
          label: "Vertical breakdowns",
          detail: "An in-depth look at the four core teams.",
        },
        {
          label: "Open Q&A",
          detail: "How you join, which team fits, and how to contribute.",
        },
      ],
    },

    {
      kind: "section",
      number: "01",
      title: "A team-based collective",
      blurb:
        "TTS is composed of four specialized verticals. Each team focuses on high-level execution within a specific domain.",
    },
    {
      kind: "bullets",
      eyebrow: "Organizational structure",
      title: "Four verticals, one club",
      items: [
        {
          label: "Consulting",
          detail:
            "AI-first strategic work for nonprofits and charity organizations.",
        },
        {
          label: "Entrepreneurship",
          detail:
            "Design, build, and ship real-world applications and digital products.",
        },
        {
          label: "Engineering",
          detail:
            "Complex hardware and software projects delivered at production-grade standards.",
        },
        {
          label: "Biotech",
          detail:
            "Research and real-world project work across biotech and biomedical engineering.",
        },
      ],
    },

    {
      kind: "section",
      number: "02",
      title: "The people running TTS",
      blurb:
        "Leadership transferred roughly three weeks ago. Two co-presidents and nine cabinet leads now drive every function of the club.",
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
      kind: "section",
      number: "03",
      title: "The professional advisors behind TTS",
      blurb:
        "Not guest speakers. Active mentors personally invested in TTS winning.",
    },
    {
      kind: "stat",
      eyebrow: "Board of Advisors",
      value: "6",
      label: "advisors behind TTS",
      context:
        "McKinsey, Reddit, Google, Stanford, Kaiser, and a $100M-revenue founder. All personally committed to making TTS the strongest club on campus.",
    },
    {
      kind: "people",
      eyebrow: "Consulting & strategy",
      title: "The advisors driving the Consulting Team",
      people: [
        {
          name: "Matthew Kim",
          role: "Incoming Analyst, McKinsey",
          photo: "/img/matthew_shot.jpeg",
          initials: "MK",
          accent: COLOR.gold,
          affiliation: "McKinsey & Company",
          bullets: [
            "Joins the top consulting firm in the world in eight months",
            "Using that runway to make TTS the strongest club on campus",
            "Personally mentoring the Consulting Team",
          ],
        },
        {
          name: "Kevin Sangmuah",
          role: "Software Engineer, Reddit · Startup Founder",
          photo: "/img/kevin_shot.jpeg",
          initials: "KS",
          accent: COLOR.red,
          affiliation: "Reddit",
          bullets: [
            "Software engineer at Reddit",
            "Founder and current CFO of Retax 360",
            "Engineering and entrepreneurship muscle, fully committed to TTS",
          ],
        },
        {
          name: "Sagar Tiwari",
          role: "Stanford MBA · Former McKinsey · Clay Co-Developer",
          photo: "/img/sagar_shot.jpeg",
          position: "center center",
          initials: "ST",
          accent: COLOR.emerald,
          affiliation: "Stanford GSB",
          bullets: [
            "Helped launch Clay, the AI tool TTS now uses",
            "Current Stanford MBA, one of the most competitive programs in the world",
            "Recognized by senior McKinsey leadership",
          ],
        },
      ],
    },
    {
      kind: "people",
      eyebrow: "Engineering, medical, startup",
      title: "The advisors backing every other team",
      people: [
        {
          name: "Duncan Inganji",
          role: "Software Engineer, Google",
          photo: "/img/duncan_shot.jpeg",
          position: "center center",
          initials: "DI",
          accent: COLOR.blue,
          affiliation: "Google",
          bullets: [
            "Software engineer at Google",
            "Active mentor to USC students through ACTS2 Fellowship",
            "Engineering guidance and a tight line to the Building Team",
          ],
        },
        {
          name: "Catherine Newton, M.D.",
          role: "Pediatrician, Kaiser Permanente",
          photo: "/img/catherine_shot.jpg",
          position: "center center",
          initials: "CN",
          accent: COLOR.violet,
          affiliation: "Kaiser Permanente",
          bullets: [
            "Practicing pediatrician in Southern California",
            "Former member of the Kaiser Med School admission board",
            "Knows exactly what top pre-med students need to stand out",
          ],
        },
        {
          name: "Andrew Laffoon",
          role: "Founder & CEO, Mixbook",
          photo: "/img/andrew_shot.jpeg",
          position: "center center",
          initials: "AL",
          accent: COLOR.gold,
          affiliation: "Mixbook",
          bullets: [
            "Founder and CEO of Mixbook, $100M+ in annual revenue",
            "Two decades scaling a consumer tech company end-to-end",
            "Real startup wisdom for Building and Entrepreneurship",
          ],
        },
      ],
    },
    {
      kind: "quote",
      quote:
        "Every advisor in this club is personally invested in its members. They do not mentor from a distance.",
      attribution: "The TTS advisor thesis",
    },

    {
      kind: "section",
      number: "04",
      title: "The Consulting Team",
      blurb:
        "Consulting work for real nonprofits and charity organizations. Every project serves a real organization.",
    },
    {
      kind: "bullets",
      eyebrow: "Objective",
      title: "Real social change, real consulting experience",
      body: "We are not a case-competition club. We create measurable impact while gaining genuine consulting chops and hands-on knowledge of advanced AI tools.",
      items: [
        {
          label: "Nonprofits and charities only",
          detail:
            "Every engagement serves a real organization doing real good.",
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
      ],
    },

    {
      kind: "section",
      number: "05",
      title: "Clay",
      blurb:
        "The Consulting Team's secret weapon. A comprehensive data orchestration and AI agent platform.",
    },
    {
      kind: "three-up",
      eyebrow: "What Clay does",
      title: "Three capabilities, one platform",
      cards: [
        {
          label: "01",
          heading: "Precision list building",
          body: "Find any target persona at scale. LACI alumni. Series A founders. High-net-worth donors. TTS impact: instantly identify the nonprofit partners and donors worth reaching.",
          accent: COLOR.gold,
        },
        {
          label: "02",
          heading: "Deep data enrichment",
          body: "Surface any data point, from direct emails to AI-scored social mutuals. TTS impact: bypass generic inboxes and reach the actual decision-makers.",
          accent: COLOR.red,
        },
        {
          label: "03",
          heading: "Smart sequencing",
          body: "Auto-send personalized messages across Email, LinkedIn, and Instagram in one coordinated campaign.",
          accent: COLOR.emerald,
        },
      ],
    },
    {
      kind: "stat",
      eyebrow: "Why it matters for us",
      value: "Six figures",
      label: "what OpenAI, Anthropic, and Canva pay for Clay",
      context:
        "Companies like OpenAI, Anthropic, and Canva pay hundreds of thousands of dollars for this tool. Because of TTS's connections, we get complete access.",
    },

    {
      kind: "three-up",
      eyebrow: "Clay in the hands of TTS",
      title: "High-level strategic value for our nonprofit partners",
      cards: [
        {
          label: "01",
          heading: "Strategic donor acquisition",
          body: "Scenario: St. Jude launches a campaign and needs the right donors. TTS solution: identify every high-net-worth individual in California with a donation history and deliver the campaign directly to their inbox.",
          accent: COLOR.gold,
        },
        {
          label: "02",
          heading: "Precision volunteer mobilization",
          body: "Scenario: Friends of the LA River needs a specialized volunteer force. TTS solution: pinpoint every able-bodied person in LA with prior service experience and automate a direct recruitment sequence.",
          accent: COLOR.emerald,
        },
        {
          label: "03",
          heading: "National scale for local causes",
          body: "Scenario: a small local nonprofit is struggling to gain momentum. TTS solution: grant them enterprise-grade reach with an instant nationwide advocacy and awareness campaign.",
          accent: COLOR.blue,
        },
      ],
    },
    {
      kind: "quote",
      quote:
        "We have direct advice from Maddie Kelly, future president of the Impact Investing Group. Years of nonprofit consulting experience, hundreds of organizations served, and a playbook for applying TTS's tools.",
      attribution: "Maddie Kelly · Impact Investing Group",
    },

    {
      kind: "venn",
      eyebrow: "The Consulting Team recap",
      title: "Where advisors, tools, and knowledge meet",
      body: "Every other club on campus has one of these. TTS is the only one with all three.",
      circles: [
        {
          label: "Advisors",
          heading: "McKinsey-level advisement",
          body: "Guidance from consultants at the world's top firm. Not student guesswork.",
          accent: COLOR.gold,
        },
        {
          label: "Tools",
          heading: "Full access to Clay",
          body: "The AI platform top companies pay six figures to use. TTS gets complete access.",
          accent: COLOR.red,
        },
        {
          label: "Knowledge",
          heading: "Impact Investing expertise",
          body: "Hundreds of nonprofits served. A clear playbook for how to apply it.",
          accent: COLOR.emerald,
        },
      ],
      center: { label: "TTS Impact", sub: "Where it all meets" },
    },

    {
      kind: "section",
      number: "06",
      title: "Collaboration",
      blurb:
        "The verticals are not silos. They back each other, and that is the point.",
    },
    {
      kind: "three-up",
      eyebrow: "How TTS compounds",
      title: "Multidisciplinary by design",
      cards: [
        {
          label: "01",
          heading: "Multidisciplinary intelligence",
          body: "TTS bridges CS, Biotech, Engineering, and Business. Members are not stuck in silos. They are backed by a full-stack network of top students across every discipline.",
          accent: COLOR.gold,
        },
        {
          label: "02",
          heading: "Vertical integration",
          body: "Each team is a force multiplier for the others. An engineer's build powers a consultant's strategic delivery, creating an exponential value loop for partners and members.",
          accent: COLOR.red,
        },
        {
          label: "03",
          heading: "Collaborative excellence",
          body: "We move beyond individual contribution to high-stakes, cross-functional execution. Merging diverse expertise delivers results a single-discipline team cannot replicate.",
          accent: COLOR.blue,
        },
      ],
    },

    {
      kind: "cta",
      eyebrow: "Next steps",
      title: "Welcome to TTS.",
      body: "Questions, ideas, or a team you want on? Grab Tyler or Caleb after the meeting.",
      actions: [
        { label: "trojantechsolutions.com" },
        { label: "@trojantechsolutions on Instagram" },
        { label: "Pick a team. Show up next week. Build." },
      ],
    },
  ],
};
