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
    "Introductory meeting. The mission, the six verticals, the advisors, the tools, and how you plug in.",
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
      kind: "video",
      eyebrow: "A word from Caleb",
      title: "Before we get into it",
      src: "/video/caleb-intro.mp4",
    },

    {
      kind: "bullets",
      eyebrow: "Meeting Objectives",
      title: "Today's Agenda",
      items: [
        {
          label: "Mission and cadence",
          detail: "Why TTS exists and how this spring runs.",
        },
        {
          label: "The six verticals",
          detail:
            "How TTS is structured. Deep dives on Consulting, Building, Music, and Web3.",
        },
        {
          label: "The people behind TTS",
          detail:
            "Leadership, the six-advisor board, and the alumni network you're joining.",
        },
        {
          label: "Clay and the Consulting Team",
          detail:
            "The AI platform top companies pay six figures for, in our hands.",
        },
        {
          label: "Building, Music, and Web3",
          detail:
            "The ten-week Builder cohort, 3D Nuos, and on-chain delivery.",
        },
        {
          label: "How it compounds and Q&A",
          detail: "Cross-vertical collaboration, then how you plug in.",
        },
      ],
    },

    {
      kind: "stat",
      eyebrow: "Our cadence",
      value: "4",
      label: "focused meetings this spring",
      context:
        "We started late, so spring is four focused meetings instead of a dozen. No filler, no busywork. Every meeting earns its place on your calendar.",
    },

    {
      kind: "section",
      number: "01",
      title: "A team-based collective",
      blurb:
        "TTS is composed of six specialized verticals. Each team focuses on high-level execution within a specific domain.",
    },
    {
      kind: "bullets",
      eyebrow: "Organizational structure",
      title: "Six verticals, one club",
      items: [
        {
          label: "Consulting",
          detail:
            "AI-first strategic work for nonprofits and charity organizations.",
        },
        {
          label: "Building",
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
        {
          label: "Music",
          detail:
            "Music-tech: inventing the hardware, software, and AI tools that reshape how music gets made.",
        },
        {
          label: "Web3",
          detail:
            "Research, build, and ship on-chain products alongside every other TTS vertical.",
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
          name: "Shirley Park",
          role: "Co-President, Building Team",
          photo: "/img/shirley_shot.jpeg",
          position: "center center",
          initials: "SP",
          accent: COLOR.red,
        },
        {
          name: "Austin Chen",
          role: "President, Biotech Team",
          photo: "/img/austin_shot.png",
          position: "center 15%",
          initials: "AC",
          accent: COLOR.emerald,
        },
        {
          name: "Gabriel Oliveri",
          role: "President, Engineering Team",
          photo: "/img/gabriel_shot.png",
          position: "center 15%",
          initials: "GO",
          accent: COLOR.blue,
        },
        {
          name: "Omniya Mohamed",
          role: "Lead of Operations",
          photo: "/img/omniya_shot.jpeg",
          position: "center 30%",
          initials: "OM",
          accent: COLOR.red,
        },
        {
          name: "Mary Zewdie",
          role: "Lead of Marketing",
          photo: "/img/mary_shot.jpeg",
          position: "center 30%",
          initials: "MZ",
          accent: COLOR.red,
        },
        {
          name: "Esrom Dawit",
          role: "External Affairs",
          photo: "/img/esrom_shot.jpeg",
          position: "center 30%",
          initials: "ED",
          accent: COLOR.red,
        },
        {
          name: "Annabelle Forbes",
          role: "Social Chair",
          photo: "/img/annabelle_shot.jpeg",
          position: "center 30%",
          initials: "AF",
          accent: COLOR.red,
        },
        {
          name: "Malakai Carey",
          role: "President, Music Team",
          photo: "/img/malakai_shot.jpeg",
          position: "center 30%",
          initials: "MC",
          accent: COLOR.red,
        },
        {
          name: "Jet Jadeja",
          role: "President, Web3 Team",
          photo: "/img/jet_shot.jpeg",
          position: "center 30%",
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
        "McKinsey, Reddit, Google, Stanford, medicine, and a $100M-revenue founder. All personally committed to making TTS the strongest club on campus.",
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
          affiliationLogo: "/img/logos/mckinsey.png",
          affiliationLogoInvert: true,
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
          affiliationLogo: "/img/logos/reddit.png",
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
          affiliationLogo: "/img/logos/stanford.png",
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
          affiliationLogo: "/img/logos/google.png",
          bullets: [
            "Software engineer at Google",
            "Active mentor to USC students through ACTS2 Fellowship",
            "Engineering guidance and a tight line to the Building Team",
          ],
        },
        {
          name: "Catherine Newton, M.D.",
          role: "Pediatrician",
          photo: "/img/catherine_shot.jpg",
          position: "center center",
          initials: "CN",
          accent: COLOR.violet,
          affiliation: "Medicine",
          affiliationLogo: "/img/logos/kaiser.png",
          bullets: [
            "Practicing pediatrician in Southern California",
            "Former member of a med school admission board",
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
          affiliationLogo: "/img/logos/mixbook.png",
          affiliationLogoInvert: true,
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
      title: "TTS Alumni",
      blurb:
        "Where TTS members land. Engineers, consultants, bankers, and founders shipping at the companies setting the pace for the industry.",
    },
    {
      kind: "cabinet",
      eyebrow: "Where they are now",
      title: "The TTS alumni network",
      body: "Proof that the work done here compounds. Every name below started in this club.",
      people: [
        {
          name: "Elizabeth Abbey",
          role: "SWE, Reddit · ex-Microsoft",
          photo: "/img/alumni/elizabethabbey.jpeg",
          initials: "EA",
          accent: COLOR.red,
        },
        {
          name: "Susan Nyirenda",
          role: "SWE, Apple",
          photo: "/img/alumni/susannyirenda.jpeg",
          initials: "SN",
          accent: COLOR.emerald,
        },
        {
          name: "Senai Assefa",
          role: "SWE, Bloomberg · ex-Microsoft",
          photo: "/img/alumni/senaiassefa.jpeg",
          initials: "SA",
          accent: COLOR.blue,
        },
        {
          name: "David Esquivel",
          role: "Cybersecurity Engineer, Capital One",
          photo: "/img/alumni/davidesquivel.jpeg",
          initials: "DE",
          accent: COLOR.emerald,
        },
        {
          name: "Anthony Nasser",
          role: "SWE, NBC Universal",
          photo: "/img/alumni/anthonynasser.jpeg",
          initials: "AN",
          accent: COLOR.gold,
        },
        {
          name: "Emerson Kahle",
          role: "SDE, Fastly",
          photo: "/img/alumni/emersonkahle.jpeg",
          initials: "EK",
          accent: COLOR.red,
        },
        {
          name: "Albert Chung",
          role: "FDE, Palantir Technologies",
          photo: "/img/alumni/albertchung.jpeg",
          initials: "AC",
          accent: COLOR.gold,
        },
        {
          name: "Kelly Kim",
          role: "JD Candidate, USC Gould",
          photo: "/img/alumni/kellykim.jpeg",
          initials: "KK",
          accent: COLOR.red,
        },
        {
          name: "Akshar Aiyer",
          role: "Investment Banking, Citi",
          photo: "/img/alumni/aksharaiyer.jpeg",
          initials: "AA",
          accent: COLOR.violet,
        },
        {
          name: "Abhi Shah",
          role: "Investment Banking, Jefferies",
          photo: "/img/alumni/abhishah.jpeg",
          initials: "AS",
          accent: COLOR.violet,
        },
        {
          name: "Parth Juthani",
          role: "Investment Banking, Nomura",
          photo: "/img/alumni/parthjuthani.jpeg",
          initials: "PJ",
          accent: COLOR.violet,
        },
        {
          name: "James La",
          role: "Technology Consulting, PwC",
          photo: "/img/alumni/jamesla.jpeg",
          initials: "JL",
          accent: COLOR.red,
        },
        {
          name: "Brandon McGowan",
          role: "Product Manager, Epic",
          photo: "/img/alumni/brandonmcgowan.jpeg",
          initials: "BM",
          accent: COLOR.red,
        },
        {
          name: "Rohan Singh",
          role: "Sales & Analytics, Bloomberg",
          photo: "/img/alumni/rohansingh.jpeg",
          initials: "RS",
          accent: COLOR.blue,
        },
        {
          name: "Joshua Kim",
          role: "Analyst, Roxborough Group",
          photo: "/img/alumni/joshuakim.jpeg",
          initials: "JK",
          accent: COLOR.violet,
        },
      ],
    },

    {
      kind: "section",
      number: "05",
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
      number: "06",
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
      number: "07",
      title: "The Building Team",
      blurb:
        "Transform individuals into entrepreneurs who follow their passion, develop lasting relationships in the startup ecosystem, and ship ventures that create real impact.",
    },
    {
      kind: "quote",
      quote: "Ideas don't build businesses, people do.",
      attribution: "The Building Team thesis",
    },
    {
      kind: "three-up",
      eyebrow: "Three core pillars",
      title: "How the Building Team operates",
      cards: [
        {
          label: "01",
          heading: "Build",
          body: "A cohort-style startup accelerator that opens with vibe coding. Learn to ship working apps with Claude, Cursor, and the AI tools real founders use today, regardless of your major.",
          accent: COLOR.red,
        },
        {
          label: "02",
          heading: "Grow",
          body: "A tight community of passionate founders. Social events, cross-team projects, and real relationships across every discipline.",
          accent: COLOR.gold,
        },
        {
          label: "03",
          heading: "Compete",
          body: "Demo Day at the end of the semester. New member startups pitch for funding in front of investors, operators, and founders.",
          accent: COLOR.emerald,
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "10-week curriculum · spring into summer",
      title: "From vibe coding to Demo Day",
      body: "Every Building member runs this cohort. It spans our four spring meetings and carries straight into summer. We open with vibe coding so no one is blocked by how to build, then roll straight into shipping real startups.",
      items: [
        {
          label: "Week 1 · Vibe coding foundations",
          detail:
            "Claude, Cursor, and the modern AI stack. Ship your first working app in one session, no CS required.",
        },
        {
          label: "Week 2 · Vibe coding II",
          detail:
            "Prototype to production: auth, data, deploy. Ship something real users can actually touch.",
        },
        {
          label: "Week 3 · Customer and problem discovery",
          detail:
            "Identify and validate the real customer problem worth solving.",
        },
        {
          label: "Week 4 · Ideation and team formation",
          detail:
            "Turn validated problems into concrete solutions and lock in founding teams.",
        },
        {
          label: "Week 5 · MVPs",
          detail:
            "Apply your vibe coding stack to ship your team's MVP in a single session.",
        },
        {
          label: "Week 6 · Product iteration",
          detail: "Refine the MVP with real user feedback.",
        },
        {
          label: "Week 7 · Guest speaker and Demo Night",
          detail: "Industry insights plus an internal progress demo.",
        },
        {
          label: "Week 8 · GTM, growth, distribution, and pitch design",
          detail: "Go-to-market strategy and pitch craft.",
        },
        {
          label: "Week 9 · Pitch Night",
          detail: "Present the pitch to peers and mentors for hard feedback.",
        },
        {
          label: "Week 10 · Demo Day",
          detail:
            "Final pitch in front of investors and founders for real funding.",
        },
      ],
    },
    {
      kind: "cta",
      eyebrow: "The Building Team ask",
      title: "Build the future, today.",
      body: "Ten weeks. Real founders. Real funding on the line.",
      actions: [
        { label: "Join USC's premier builder track" },
        { label: "Ship something users touch by Week 5" },
        { label: "Pitch on Demo Day by Week 10" },
      ],
    },

    {
      kind: "section",
      number: "08",
      title: "The Music Team",
      blurb:
        "Music-tech. Not a production club. The Music Team invents the hardware, software, and AI tools that reshape how music gets made.",
    },
    {
      kind: "quote",
      quote:
        "We do not just make music. We build the tools that make new music possible.",
      attribution: "The Music Team thesis",
    },
    {
      kind: "three-up",
      eyebrow: "Three core pillars",
      title: "How the Music Team operates",
      cards: [
        {
          label: "01",
          heading: "Research",
          body: "Find where music creation is bottlenecked and where new primitives unlock real creators. Weekly deep dives into spatial audio, AI engineering, capture hardware, and creator workflows.",
          accent: COLOR.red,
        },
        {
          label: "02",
          heading: "Build",
          body: "Ship music-tech products: capture hardware, creator software, and AI tooling. The team ships prototypes users can touch, not slide decks.",
          accent: COLOR.gold,
        },
        {
          label: "03",
          heading: "Ship",
          body: "Put real products in creator hands. Partner with Building and Engineering on the hardware and software layers, and use Clay to find the right artists to test with.",
          accent: COLOR.emerald,
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "What you ship as a Music-Tech member",
      title: "From research to real prototypes",
      body: "Led by Malakai Carey, President of the Music Team. Members pick an active project and contribute to it end-to-end across research, design, and build.",
      items: [
        {
          label: "Research onboarding",
          detail:
            "DAW fluency, a crash course on spatial audio, and a working map of today's music-tech landscape.",
        },
        {
          label: "Pick a project",
          detail:
            "Join an active Music Team project, starting with our flagship concept: 3D Nuos.",
        },
        {
          label: "Prototype and test",
          detail:
            "Build something users can touch: a capture rig, a software mockup, an AI coaching loop, or a creator workflow tool.",
        },
        {
          label: "Cross-vertical delivery",
          detail:
            "Partner with Building on software, Engineering on hardware, and Consulting on creator outreach.",
        },
      ],
    },

    {
      kind: "section",
      number: "08.1",
      title: "Example project · 3D Nuos",
      blurb:
        "3 Dimensional Neural Unified Omni Sound. A native 3D sound creation platform. A compact modular recording pod plus an AI creator OS so any artist can capture at studio quality without studio friction.",
    },
    {
      kind: "quote",
      quote: "Capture sound as space, not just as a flat track.",
      attribution: "3D Nuos · founding principle",
    },
    {
      kind: "three-up",
      eyebrow: "The 3D Nuos stack",
      title: "Three layers, one system",
      cards: [
        {
          label: "01",
          heading: "Hardware · The Nuos Pod",
          body: "An egg-shaped enclosure with hexagonal acoustic paneling, a central primary mic, and a distributed mic array. Captures the performer and the full sonic field around them.",
          accent: COLOR.red,
        },
        {
          label: "02",
          heading: "Software · Nuos OS",
          body: "Voice-first session control. Tell the system what you want, and it configures tracks, routing, and effects. Creator profiles remember your setup and style over time.",
          accent: COLOR.gold,
        },
        {
          label: "03",
          heading: "AI · Coach and Engineer",
          body: "An AI layer that handles setup, cleans takes, and coaches the performer. Does not replace the artist. Removes the technical friction around the artist.",
          accent: COLOR.emerald,
        },
      ],
    },

    {
      kind: "section",
      number: "09",
      title: "The Web3 Team",
      blurb:
        "Real web3 work, not speculation. Research, build, and ship on-chain products alongside every other TTS vertical.",
    },
    {
      kind: "quote",
      quote: "Deployed contracts, not whitepapers.",
      attribution: "The Web3 Team thesis",
    },
    {
      kind: "three-up",
      eyebrow: "Three core pillars",
      title: "How the Web3 Team operates",
      cards: [
        {
          label: "01",
          heading: "Research",
          body: "Stay current on protocols, primitives, and emerging infrastructure. Weekly deep dives inform what the team actually builds.",
          accent: COLOR.violet,
        },
        {
          label: "02",
          heading: "Build",
          body: "Smart contracts, DAOs, and tokenized systems as real product infra. Solidity fluency from day one.",
          accent: COLOR.blue,
        },
        {
          label: "03",
          heading: "Ship",
          body: "Every Consulting engagement that touches web3 gets on-chain delivery. Deployed to mainnet or testnet, not just slides.",
          accent: COLOR.gold,
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "What you ship as a Web3 member",
      title: "From Solidity onboarding to mainnet",
      body: "Led by Jet Jadeja, President of the Web3 Team. The cohort runs alongside the other verticals and feeds real on-chain deliverables into client work.",
      items: [
        {
          label: "Solidity and wallets onboarding",
          detail:
            "Foundry or Hardhat, test networks, and a personal wallet that can actually ship.",
        },
        {
          label: "Weekly protocol deep dives",
          detail:
            "Study one protocol or primitive per week. Write the one-pager the team actually references.",
        },
        {
          label: "Ship an on-chain demo",
          detail:
            "Working smart contract deployed to a testnet by week 5. Open the Etherscan link in the pitch.",
        },
        {
          label: "Back TTS clients with on-chain delivery",
          detail:
            "Pair with Consulting engagements where web3 is the right answer, not a buzzword.",
        },
      ],
    },

    {
      kind: "section",
      number: "10",
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
      body: "Three more meetings this spring. Questions, ideas, or a team you want on? Grab Tyler or Caleb after the meeting.",
      actions: [
        { label: "usctts.com" },
        { label: "@trojantechsolutions on Instagram" },
        { label: "Pick a team. Show up in two weeks. Build." },
      ],
    },
  ],
};
