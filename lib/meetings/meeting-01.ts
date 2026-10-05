import type { Meeting } from "./types";
import { COLOR } from "./types";

// Meeting 01: Tuesday, April 14, 2026
// Introductory meeting. Club overview, six verticals, advisors, Clay, collaboration.

export const meeting01: Meeting = {
  slug: "meeting-01",
  number: 1,
  title: "Trojan Technology Solutions",
  date: "2026-04-14",
  dateLabel: "Tuesday, April 14",
  timeLabel: "7:00 PM PT",
  location: "USC Campus, location on Instagram",
  summary: "The mission, six verticals, advisors, tools, and how you plug in.",
  status: "past",
  accent: COLOR.red,
  slides: [
    {
      kind: "title",
      eyebrow: "Introductory Meeting",
      title: "Trojan Technology Solutions",
      subtitle: "We ship real products and deliver real solutions.",
      footer: "Tuesday, April 14, 2026",
    },

    {
      kind: "video",
      eyebrow: "A word from Caleb",
      title: "Before we get into it",
      youtubeId: "5qwbKRO199o",
    },

    {
      kind: "bullets",
      eyebrow: "Agenda",
      title: "Today",
      items: [
        { label: "Mission and cadence", detail: "Why TTS. How spring runs." },
        { label: "Six verticals", detail: "How TTS is structured." },
        { label: "People", detail: "Leadership, advisors, alumni." },
        { label: "Clay + Consulting", detail: "The tool. The team." },
        { label: "Building, Music, Web3, Biotech", detail: "What each ships." },
        { label: "How it compounds", detail: "Cross-vertical work. Then Q&A." },
      ],
    },

    {
      kind: "stat",
      eyebrow: "Our cadence",
      value: "4",
      label: "focused meetings this spring",
      context: "No filler. Every meeting earns its place.",
    },

    {
      kind: "section",
      number: "01",
      title: "A team-based collective",
      blurb: "Six verticals. Each one focused on high-level execution.",
    },
    {
      kind: "bullets",
      eyebrow: "Structure",
      title: "Six verticals, one club",
      items: [
        {
          label: "Consulting",
          detail: "AI-first work for nonprofits.",
        },
        {
          label: "Building",
          detail: "Design, build, and ship real products.",
        },
        {
          label: "Engineering",
          detail: "Production-grade hardware and software.",
        },
        {
          label: "Biotech",
          detail: "Research and prototypes across biomed.",
        },
        {
          label: "Music",
          detail: "Music-tech: hardware, software, and AI tools.",
        },
        {
          label: "Web3",
          detail: "On-chain products, shipped to real networks.",
        },
      ],
    },

    {
      kind: "section",
      number: "02",
      title: "The people running TTS",
      blurb: "Two co-presidents. Nine cabinet leads. Three weeks in.",
    },
    {
      kind: "people",
      eyebrow: "Co-Presidents",
      title: "Running the club",
      body: "Three weeks in. Building team, infrastructure, and advisor network.",
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
      eyebrow: "Cabinet",
      title: "The nine who run the rest of TTS",
      body: "Every team, every function. If you need something, one of them owns it.",
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
      title: "The advisors behind TTS",
      blurb: "Not guest speakers. Active mentors invested in us winning.",
    },
    {
      kind: "stat",
      eyebrow: "Board of Advisors",
      value: "6",
      label: "advisors behind TTS",
      context: "McKinsey. Reddit. Google. Stanford. Medicine. A $100M founder.",
    },
    {
      kind: "people",
      eyebrow: "Consulting & strategy",
      title: "Driving the Consulting Team",
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
          role: "Software Engineer, Reddit · Founder",
          photo: "/img/kevin_shot.jpeg",
          initials: "KS",
          accent: COLOR.red,
          affiliation: "Reddit",
          affiliationLogo: "/img/logos/reddit.png",
          bullets: [
            "Software engineer at Reddit",
            "Founder and CFO of Retax 360",
            "Engineering and entrepreneurship muscle",
          ],
        },
        {
          name: "Sagar Tiwari",
          role: "Stanford MBA · ex-McKinsey · Clay co-dev",
          photo: "/img/sagar_shot.jpeg",
          position: "center center",
          initials: "ST",
          accent: COLOR.emerald,
          affiliation: "Stanford GSB",
          affiliationLogo: "/img/logos/stanford.png",
          bullets: [
            "Helped launch Clay, the AI tool TTS now uses",
            "Current Stanford MBA",
            "Recognized by senior McKinsey leadership",
          ],
        },
      ],
    },
    {
      kind: "people",
      eyebrow: "Engineering, medical, startup",
      title: "Backing every other team",
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
            "Mentor to USC students via ACTS2",
            "Tight line to the Building Team",
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
            "Practicing pediatrician in SoCal",
            "Former med school admission board",
            "Knows what pre-meds need to stand out",
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
            "$100M+ annual revenue founder and CEO",
            "Two decades scaling consumer tech",
            "Real startup wisdom for our builders",
          ],
        },
      ],
    },
    {
      kind: "quote",
      quote:
        "Every advisor here is personally invested. They do not mentor from a distance.",
      attribution: "The TTS advisor thesis",
    },

    {
      kind: "section",
      number: "04",
      title: "TTS Alumni",
      blurb:
        "Where TTS members land. Engineers, consultants, bankers, founders.",
    },
    {
      kind: "cabinet",
      eyebrow: "Where they are now",
      title: "The TTS alumni network",
      body: "Every name below started in this club.",
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
          role: "Forward Deployed Engineer",
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
          role: "IB, Citi",
          photo: "/img/alumni/aksharaiyer.jpeg",
          initials: "AA",
          accent: COLOR.violet,
        },
        {
          name: "Abhi Shah",
          role: "IB, Jefferies",
          photo: "/img/alumni/abhishah.jpeg",
          initials: "AS",
          accent: COLOR.violet,
        },
        {
          name: "Parth Juthani",
          role: "IB, Nomura",
          photo: "/img/alumni/parthjuthani.jpeg",
          initials: "PJ",
          accent: COLOR.violet,
        },
        {
          name: "James La",
          role: "Tech Consulting, PwC",
          photo: "/img/alumni/jamesla.jpeg",
          initials: "JL",
          accent: COLOR.red,
        },
        {
          name: "Brandon McGowan",
          role: "PM, Epic",
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
      blurb: "Real consulting work for real nonprofits.",
    },
    {
      kind: "bullets",
      eyebrow: "Objective",
      title: "Real impact, real chops",
      body: "Not a case-competition club. Measurable work plus hands-on AI.",
      items: [
        {
          label: "Nonprofits only",
          detail: "Every engagement serves real good.",
        },
        {
          label: "Advisor-backed",
          detail: "McKinsey-level guidance on every project.",
        },
        {
          label: "AI-native",
          detail: "Clay applied to the client's hardest problem.",
        },
      ],
    },

    {
      kind: "section",
      number: "06",
      title: "Clay",
      blurb: "An AI data orchestration platform. Our secret weapon.",
    },
    {
      kind: "three-up",
      eyebrow: "What Clay does",
      title: "Three capabilities",
      cards: [
        {
          label: "01",
          heading: "List building",
          body: "Find any target persona at scale. Alumni, founders, donors.",
          accent: COLOR.gold,
        },
        {
          label: "02",
          heading: "Enrichment",
          body: "Direct emails and AI-scored social mutuals on every target.",
          accent: COLOR.red,
        },
        {
          label: "03",
          heading: "Sequencing",
          body: "Auto-send across Email, LinkedIn, and Instagram.",
          accent: COLOR.emerald,
        },
      ],
    },
    {
      kind: "stat",
      eyebrow: "Why it matters",
      value: "Six figures",
      label: "what OpenAI, Anthropic, and Canva pay",
      context: "We get complete access through TTS connections.",
    },

    {
      kind: "three-up",
      eyebrow: "Clay in our hands",
      title: "Value for our nonprofit partners",
      cards: [
        {
          label: "01",
          heading: "Donor acquisition",
          body: "Every HNW donor in California, reached directly.",
          accent: COLOR.gold,
        },
        {
          label: "02",
          heading: "Volunteer mobilization",
          body: "Pinpoint the right volunteers. Automate recruiting.",
          accent: COLOR.emerald,
        },
        {
          label: "03",
          heading: "National scale",
          body: "Enterprise-grade reach for a local nonprofit.",
          accent: COLOR.blue,
        },
      ],
    },
    {
      kind: "quote",
      quote:
        "Direct advice from Maddie Kelly. Hundreds of nonprofits served. A playbook for our tools.",
      attribution: "Maddie Kelly · Impact Investing Group",
    },

    {
      kind: "venn",
      eyebrow: "Consulting recap",
      title: "Where advisors, tools, and knowledge meet",
      circles: [
        {
          label: "Advisors",
          heading: "McKinsey-level",
          body: "Top-firm guidance, not student guesswork.",
          accent: COLOR.gold,
        },
        {
          label: "Tools",
          heading: "Full Clay access",
          body: "The tool top companies pay six figures for.",
          accent: COLOR.red,
        },
        {
          label: "Knowledge",
          heading: "Impact Investing",
          body: "A playbook from hundreds of nonprofits.",
          accent: COLOR.emerald,
        },
      ],
      center: { label: "TTS Impact", sub: "Where it all meets" },
    },

    {
      kind: "section",
      number: "07",
      title: "The Building Team",
      blurb: "Build passions. Ship ventures. Real impact.",
    },
    {
      kind: "quote",
      quote: "Ideas don't build businesses, people do.",
      attribution: "The Building Team thesis",
    },
    {
      kind: "three-up",
      eyebrow: "Three pillars",
      title: "How Building operates",
      cards: [
        {
          label: "01",
          heading: "Build",
          body: "Cohort accelerator. Ship working apps with Claude and Cursor.",
          accent: COLOR.red,
        },
        {
          label: "02",
          heading: "Grow",
          body: "Tight community. Social events. Cross-team projects.",
          accent: COLOR.gold,
        },
        {
          label: "03",
          heading: "Ship",
          body: "Every member ships a real startup. Pitches land with advisors.",
          accent: COLOR.emerald,
        },
      ],
    },
    {
      kind: "split-bullets",
      eyebrow: "Spring · Optional summer",
      title: "Vibe coding to shipped startup",
      body: "Weeks 1-4 this spring. Weeks 5-10 optional summer.",
      columns: [
        {
          eyebrow: "Required · Spring",
          title: "Weeks 1-4",
          accent: COLOR.red,
          items: [
            {
              label: "Vibe coding I",
              detail: "Claude, Cursor. Ship your first app.",
            },
            {
              label: "Vibe coding II",
              detail: "Auth, data, deploy. Real users can touch it.",
            },
            {
              label: "Problem discovery",
              detail: "Validate the customer problem.",
            },
            {
              label: "Ideation + teams",
              detail: "Lock in solutions and founding teams.",
            },
          ],
        },
        {
          eyebrow: "Optional · Summer",
          title: "Weeks 5-10",
          accent: COLOR.gold,
          items: [
            { label: "MVPs", detail: "Ship your team's MVP in one session." },
            { label: "Iteration", detail: "Refine with real user feedback." },
            { label: "Demo Night", detail: "Guest speaker + progress demo." },
            {
              label: "GTM + pitch",
              detail: "Growth strategy and pitch craft.",
            },
            { label: "Pitch Night", detail: "Peer and mentor feedback." },
            { label: "Founder pitches", detail: "Pitch to the TTS network." },
          ],
        },
      ],
    },
    {
      kind: "cta",
      eyebrow: "The Building ask",
      title: "Build the future, today.",
      body: "Four spring weeks. Optional summer. Real founders.",
      actions: [
        { label: "Join USC's premier builder track" },
        { label: "Ship something users touch by Week 5" },
        { label: "Pitch to mentors and advisors by Week 10" },
      ],
    },

    {
      kind: "section",
      number: "08",
      title: "The Music Team",
      blurb: "Music-tech. We build the tools that reshape how music gets made.",
    },
    {
      kind: "quote",
      quote:
        "We don't just make music. We build the tools that make new music possible.",
      attribution: "The Music Team thesis",
    },
    {
      kind: "three-up",
      eyebrow: "Three pillars",
      title: "How Music operates",
      cards: [
        {
          label: "01",
          heading: "Research",
          body: "Spatial audio, AI engineering, capture hardware, creator workflows.",
          accent: COLOR.red,
        },
        {
          label: "02",
          heading: "Build",
          body: "Capture hardware, creator software, AI tooling. Real prototypes.",
          accent: COLOR.gold,
        },
        {
          label: "03",
          heading: "Ship",
          body: "Real products in creator hands. Clay finds the test artists.",
          accent: COLOR.emerald,
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "What you ship",
      title: "Research to real prototypes",
      body: "Led by Malakai Carey. Pick a project. Contribute end-to-end.",
      items: [
        {
          label: "Research onboarding",
          detail: "DAW fluency. Spatial audio crash course.",
        },
        {
          label: "Pick a project",
          detail: "Join an active Music Team project.",
        },
        {
          label: "Prototype and test",
          detail: "Capture rig, software mockup, or AI coach.",
        },
        {
          label: "Cross-vertical",
          detail: "Partner with Building, Engineering, Consulting.",
        },
      ],
    },

    {
      kind: "section",
      number: "09",
      title: "The Web3 Team",
      blurb: "Real on-chain work. Not speculation.",
    },
    {
      kind: "quote",
      quote: "Deployed contracts, not whitepapers.",
      attribution: "The Web3 Team thesis",
    },
    {
      kind: "three-up",
      eyebrow: "Three pillars",
      title: "How Web3 operates",
      cards: [
        {
          label: "01",
          heading: "Research",
          body: "Protocols, primitives, emerging infra. Weekly deep dives.",
          accent: COLOR.violet,
        },
        {
          label: "02",
          heading: "Build",
          body: "Smart contracts, DAOs, tokenized systems. Solidity day one.",
          accent: COLOR.blue,
        },
        {
          label: "03",
          heading: "Ship",
          body: "On-chain delivery for Consulting engagements.",
          accent: COLOR.gold,
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "What you ship",
      title: "Solidity onboarding to mainnet",
      body: "Led by Jet Jadeja. Feeds on-chain work into client projects.",
      items: [
        {
          label: "Solidity + wallets",
          detail: "Foundry or Hardhat. Testnets. A real wallet.",
        },
        {
          label: "Protocol deep dives",
          detail: "One protocol per week. Write the team one-pager.",
        },
        {
          label: "On-chain demo",
          detail: "Contract deployed to testnet by week 5.",
        },
        {
          label: "Back TTS clients",
          detail: "Pair with Consulting where web3 fits.",
        },
      ],
    },

    {
      kind: "section",
      number: "10",
      title: "The Biotech Team",
      blurb: "Real research. Real projects. Not a reading group.",
    },
    {
      kind: "quote",
      quote: "Research that ships, not posters that gather dust.",
      attribution: "The Biotech Team thesis",
    },
    {
      kind: "three-up",
      eyebrow: "Three pillars",
      title: "How Biotech operates",
      cards: [
        {
          label: "01",
          heading: "Research",
          body: "Literature reviews across diagnostics, therapeutics, computational bio.",
          accent: COLOR.emerald,
        },
        {
          label: "02",
          heading: "Build",
          body: "Prototypes. Lab partnerships. Computational tooling.",
          accent: COLOR.red,
        },
        {
          label: "03",
          heading: "Ship",
          body: "Publish. Demo. Pair with Consulting on health work.",
          accent: COLOR.gold,
        },
      ],
    },
    {
      kind: "bullets",
      eyebrow: "What you ship",
      title: "Lit review to working prototype",
      body: "Led by Austin Chen. Pick a project. Contribute end-to-end.",
      items: [
        {
          label: "Research onboarding",
          detail: "PubMed fluency. USC lab resources.",
        },
        {
          label: "Pick a project",
          detail: "Diagnostics, therapeutics, devices, or comp bio.",
        },
        {
          label: "Prototype and validate",
          detail: "Diagnostic workflow, device mockup, or model.",
        },
        {
          label: "Cross-vertical",
          detail: "Partner with Engineering, Building, Consulting.",
        },
      ],
    },

    {
      kind: "section",
      number: "11",
      title: "Collaboration",
      blurb: "Verticals aren't silos. They back each other. That's the point.",
    },
    {
      kind: "three-up",
      eyebrow: "How TTS compounds",
      title: "Multidisciplinary by design",
      cards: [
        {
          label: "01",
          heading: "Cross-discipline",
          body: "CS, Biotech, Engineering, Business. Full-stack network.",
          accent: COLOR.gold,
        },
        {
          label: "02",
          heading: "Vertical integration",
          body: "Each team multiplies the others. Exponential loop.",
          accent: COLOR.red,
        },
        {
          label: "03",
          heading: "Cross-functional",
          body: "High-stakes execution no single team can replicate.",
          accent: COLOR.blue,
        },
      ],
    },

    {
      kind: "cta",
      eyebrow: "Next steps",
      title: "Welcome to TTS.",
      body: "Three more meetings this spring. Grab Tyler or Caleb after.",
      actions: [
        { label: "usctts.com" },
        { label: "@trojantechsolutions on Instagram" },
        { label: "Pick a team. Show up in two weeks. Build." },
      ],
    },
  ],
};
