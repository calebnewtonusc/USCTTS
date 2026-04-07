"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  Zap,
  ArrowRight,
  Check,
  Hammer,
  Briefcase,
  TrendingUp,
  ExternalLink,
  Mail,
  ChevronDown,
  Code,
  Cpu,
  Globe,
  GitBranch,
  Terminal,
  Rocket,
  Brain,
  BarChart2,
  Music,
  Network,
  Users,
  Star,
  Layers,
  Award,
  Lightbulb,
  BookOpen,
  Target,
  HelpCircle,
  Flame,
  Compass,
  Trophy,
  Guitar,
  FlaskConical,
} from "lucide-react";
// ── Utilities ────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const TRACKS = [
  {
    num: "01",
    icon: Hammer,
    accent: "#CC0000",
    title: "Building",
    sub: "Product & Startups",
    tagline: "Come in with an idea. Leave with a live link.",
    featured: false,
    items: [
      "Build real apps and tools using AI",
      "Deploy live products with real users",
      "Learn by doing, not by watching",
      "No CS background required",
    ],
    for: "Anyone who wants to make something. Any major, any year.",
  },
  {
    num: "02",
    icon: Briefcase,
    accent: "#FFCC00",
    title: "Consulting",
    sub: "Client Work & Strategy",
    tagline: "Work on real problems for real organizations.",
    featured: true,
    items: [
      "Live client engagements",
      "AI-first research and analysis",
      "Actual deliverables, not slide decks for class",
      "Strategic reps before you graduate",
    ],
    for: "Business, econ, poli-sci, and anyone going into strategy or ops.",
  },
  {
    num: "03",
    icon: TrendingUp,
    accent: "#10b981",
    title: "Growing",
    sub: "Career & Network",
    tagline: "Learn AI tools that apply to your actual field.",
    featured: false,
    items: [
      "Apply AI directly to your major or career path",
      "Access YC founders and working operators",
      "Speaker series with real practitioners",
      "Get ahead before everyone else catches up",
    ],
    for: "Pre-med, law, finance, architecture, any major.",
  },
];

const FOUNDERS = [
  {
    id: "tyler",
    name: "Tyler Larsen",
    role: "Co-President",
    focus: "Consulting & People",
    headshot: "/img/tyler_shot.jpeg",
    position: "center center",
    link: "https://www.linkedin.com/in/tyler-larsen-4130a7294/",
    linkLabel: "LinkedIn",
    accent: "#FFCC00",
    owns: [
      "Consulting curriculum and client pipeline",
      "E-board, partnerships, and cross-club ecosystem",
      "Community culture and recruiting",
    ],
  },
  {
    id: "caleb",
    name: "Caleb Newton",
    role: "Co-President",
    focus: "Innovation & Entrepreneurship",
    headshot: "/img/caleb_shot.jpg",
    position: "center 15%",
    link: "https://calebnewton.me/",
    linkLabel: "Personal site",
    accent: "#CC0000",
    owns: [
      "Product curriculum and AI systems",
      "Website, codebase, and internal tooling",
      "Startup relationships, demos, and builder culture",
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "When do we meet?",
    a: "Weekly general meetings plus open workspace sessions throughout the week. Follow us on Instagram (@trojantechsolutions) for this semester's schedule and location.",
  },
  {
    q: "Do I need coding experience?",
    a: "No. We teach AI tools that let anyone build and ship, regardless of technical background. Consulting and Growing require zero coding.",
  },
  {
    q: "What's the time commitment?",
    a: "Show up when you can. The weekly meeting is the core. Workspace sessions are optional but encouraged: that's where real momentum happens.",
  },
  {
    q: "Can I join mid-semester?",
    a: "Yes. Walk in any week. There is no application, no waitlist, and no cut-off date.",
  },
  {
    q: "Is there a cost?",
    a: "Never. TTS is completely free. No dues, no fees, no catch.",
  },
  {
    q: "I'm pre-med, law, finance, or architecture. Is this for me?",
    a: "Yes. AI is reshaping every field. TTS helps you learn the tools that actually matter for your career, not just for software engineers.",
  },
];

const CABINET: {
  name: string;
  role: string;
  initials: string;
  accent: string;
  link: string | null;
  headshot: string | null;
  position?: string;
  placeholder?: boolean;
}[] = [
  {
    name: "Ephrem Adugna",
    role: "Co-lead of Entrepreneurship",
    initials: "EA",
    accent: "#CC0000",
    link: "https://www.linkedin.com/in/ephrem-adugna/",
    headshot: "/img/ephrem_shot.jpeg",
    position: "center top",
  },
  {
    name: "Malakai Carey",
    role: "Lead of Music",
    initials: "MC",
    accent: "#CC0000",
    link: "https://www.linkedin.com/in/malakai-carey-11187038a/",
    headshot: "/img/malakai_shot.jpeg",
    position: "center top",
  },
  {
    name: "Austin Chen",
    role: "Lead of Biotech",
    initials: "AC",
    accent: "#CC0000",
    link: "https://www.linkedin.com/in/austin-f-chen/",
    headshot: "/img/austin_shot.jpeg",
    position: "center top",
  },
  {
    name: "Esrom Dawit",
    role: "External Affairs",
    initials: "ED",
    accent: "#CC0000",
    link: "https://www.linkedin.com/in/esrom-dawit-4780302b2/",
    headshot: "/img/esrom_shot.jpeg",
    position: "center top",
  },
  {
    name: "Annabelle Forbes",
    role: "Social Chair",
    initials: "AF",
    accent: "#CC0000",
    link: "https://www.linkedin.com/in/annabelle-forbes-9b381838b/",
    headshot: "/img/annabelle_shot.jpeg",
    position: "center top",
  },
  {
    name: "Jet Jadeja",
    role: "Lead of Web3",
    initials: "JJ",
    accent: "#CC0000",
    link: "https://www.linkedin.com/in/jet-jadeja/",
    headshot: "/img/jet_shot.jpeg",
    position: "center top",
  },
  {
    name: "Gabriel Oliveri",
    role: "Lead of Engineering",
    initials: "GO",
    accent: "#CC0000",
    link: "https://www.linkedin.com/in/gabriel-oliveri/",
    headshot: "/img/gabriel_shot.jpeg",
    position: "center top",
  },
  {
    name: "Coming Soon",
    role: "TBD",
    initials: "?",
    accent: "#52525b",
    link: null,
    headshot: null,
    placeholder: true,
  },
  {
    name: "Coming Soon",
    role: "TBD",
    initials: "?",
    accent: "#52525b",
    link: null,
    headshot: null,
    placeholder: true,
  },
  {
    name: "Coming Soon",
    role: "TBD",
    initials: "?",
    accent: "#52525b",
    link: null,
    headshot: null,
    placeholder: true,
  },
  {
    name: "Coming Soon",
    role: "TBD",
    initials: "?",
    accent: "#52525b",
    link: null,
    headshot: null,
    placeholder: true,
  },
];

const BOARD: {
  name: string;
  role: string;
  title: string;
  initials: string;
  link: string;
  headshot: string | null;
  position?: string;
  companies: string[];
}[] = [
  {
    name: "Matthew Kim",
    role: "OG Co-Founder",
    title: "Board of Advisors",
    initials: "MK",
    link: "https://www.linkedin.com/in/matthewkiiim",
    headshot: "/img/matthew_shot.jpeg",
    position: "center top",
    companies: [],
  },
  {
    name: "Kevin Sangmuah",
    role: "OG Co-Founder",
    title: "Board of Advisors",
    initials: "KS",
    link: "https://www.linkedin.com/in/kevin-sangmuah-4a780a221",
    headshot: "/img/kevin_shot.jpeg",
    position: "center top",
    companies: [],
  },
];

const INSTAGRAM_URL = "https://instagram.com/trojantechsolutions";

// ── Split-text character reveal ───────────────────────────────────────────────
function SplitText({
  text,
  style,
  baseDelay = 0,
  charDelay = 0.028,
}: {
  text: string;
  style?: React.CSSProperties;
  baseDelay?: number;
  charDelay?: number;
}) {
  return (
    <span className="tts-split-heading" style={style}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            verticalAlign: "bottom",
            lineHeight: "inherit",
            paddingBottom: "0.15em",
            marginBottom: "-0.15em",
          }}
        >
          <span
            className="tts-char"
            style={{ transitionDelay: `${baseDelay + i * charDelay}s` }}
          >
            {char === " " ? "\u00a0" : char}
          </span>
        </span>
      ))}
    </span>
  );
}

// ── Ocean wave divider — scroll-driven SVG ────────────────────────────────────
function WaveDivider({
  reverse = false,
  speed = 10,
  amplitude = 24,
  topColor = "#09090b",
  bottomColor = "#09090b",
}: {
  reverse?: boolean;
  speed?: number;
  amplitude?: number;
  topColor?: string;
  bottomColor?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // rate: px of SVG travel per px of page scroll.
    // At speed=10 default: 0.4 → one full wave cycle (2560px) every 6400px of scroll.
    const scrollRate = (reverse ? -1 : 1) * (4 / speed);
    const handle = () => {
      if (!svgRef.current) return;
      const offset = (((window.scrollY * scrollRate) % 2560) + 2560) % 2560;
      svgRef.current.style.transform = `translateX(${-offset}px)`;
    };
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, [reverse, speed]);

  const h = 80;
  const cy = 40;
  const A = amplitude;
  const buildPath = (offsetX: number) => {
    const o = offsetX;
    return [
      `M${o},${cy}`,
      `C${o + 96},${cy - A} ${o + 224},${cy - A} ${o + 320},${cy}`,
      `C${o + 416},${cy + A} ${o + 544},${cy + A} ${o + 640},${cy}`,
      `C${o + 736},${cy - A} ${o + 864},${cy - A} ${o + 960},${cy}`,
      `C${o + 1056},${cy + A} ${o + 1184},${cy + A} ${o + 1280},${cy}`,
      `C${o + 1376},${cy - A} ${o + 1504},${cy - A} ${o + 1600},${cy}`,
      `C${o + 1696},${cy + A} ${o + 1824},${cy + A} ${o + 1920},${cy}`,
      `C${o + 2016},${cy - A} ${o + 2144},${cy - A} ${o + 2240},${cy}`,
      `C${o + 2336},${cy + A} ${o + 2464},${cy + A} ${o + 2560},${cy}`,
    ].join(" ");
  };
  // Fill path: wave line + close down to bottom of box = bottom section color floods below the wave
  const buildFillPath = (o: number) =>
    buildPath(o) + ` L${o + 2560},${h} L${o},${h} Z`;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        height: h,
        background: topColor,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <svg
        ref={svgRef}
        className="tts-ocean-track"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
        width="5120"
        height={h}
        viewBox={`0 0 5120 ${h}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bottom color flood below the wave */}
        <path d={buildFillPath(0)} fill={bottomColor} />
        <path d={buildFillPath(2560)} fill={bottomColor} />
        {/* Glow strokes on top */}
        <path
          d={buildPath(0)}
          stroke="rgba(204,0,0,0.08)"
          strokeWidth="36"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={buildPath(2560)}
          stroke="rgba(204,0,0,0.08)"
          strokeWidth="36"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={buildPath(0)}
          stroke="rgba(204,0,0,0.28)"
          strokeWidth="5"
          fill="none"
        />
        <path
          d={buildPath(2560)}
          stroke="rgba(204,0,0,0.28)"
          strokeWidth="5"
          fill="none"
        />
        <path
          d={buildPath(0)}
          stroke="rgba(204,0,0,0.75)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d={buildPath(2560)}
          stroke="rgba(204,0,0,0.75)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TTSSite() {
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [heroProgress, setHeroProgress] = useState(0);
  const [revealProgress, setRevealProgress] = useState(0);
  const [trackExitProg, setTrackExitProg] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [joinActive, setJoinActive] = useState(false);
  const [joinScrollProg, setJoinScrollProg] = useState(0);
  const [missionActive, setMissionActive] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const joinSectionRef = useRef<HTMLElement>(null);
  const joinScrollRef = useRef<HTMLElement>(null);
  const missionSectionRef = useRef<HTMLElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const revealSectionRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const h1WrapperRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(0);
  const trackScrollRef = useRef<HTMLElement>(null);
  const trackStickyRef = useRef<HTMLDivElement>(null);
  const trackInnerRef = useRef<HTMLDivElement>(null);
  const trackTitleRef = useRef<HTMLDivElement>(null);
  const floatRefs = useRef<HTMLDivElement[]>([]);
  // Custom cursor
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };
    document.addEventListener("mousemove", onMove);
    const tick = () => {
      ringRef.current.x += (mouseRef.current.x - ringRef.current.x) * 0.13;
      ringRef.current.y += (mouseRef.current.y - ringRef.current.y) * 0.13;
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate(${ringRef.current.x - 16}px, ${ringRef.current.y - 16}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Scroll: hero progress
  useEffect(() => {
    const handle = () => {
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      if (heroSectionRef.current) {
        const sect = heroSectionRef.current;
        const scrolled = scrollY - sect.offsetTop;
        const maxScroll = sect.offsetHeight - winH;
        setHeroProgress(Math.max(0, Math.min(1, scrolled / maxScroll)));
      }
      if (revealSectionRef.current) {
        const sect = revealSectionRef.current;
        const scrolled = scrollY - sect.offsetTop;
        const maxScroll = sect.offsetHeight - winH;
        setRevealProgress(Math.max(0, Math.min(1, scrolled / maxScroll)));
      }
      if (joinScrollRef.current) {
        const sect = joinScrollRef.current;
        const scrolled = scrollY - sect.offsetTop;
        const maxScroll = sect.offsetHeight - winH;
        setJoinScrollProg(Math.max(0, Math.min(1, scrolled / maxScroll)));
      }
      const docH = document.documentElement.scrollHeight;
      const nearBottom = scrollY + winH >= docH - 160;
      setFooterVisible(nearBottom);
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Scroll reveal for animation classes
  useEffect(() => {
    const scramble = (el: Element) => {
      const original = el.textContent ?? "";
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let frame = 0;
      const total = 22;
      const iv = setInterval(() => {
        el.textContent = original
          .split("")
          .map((ch, i) => {
            if (ch === " " || ch === "\n") return ch;
            if (frame / total > i / original.length) return ch;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");
        if (++frame > total) {
          el.textContent = original;
          clearInterval(iv);
        }
      }, 38);
    };

    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("tts-visible");
            if (e.target.classList.contains("tts-scramble")) {
              scramble(e.target);
              obs.unobserve(e.target);
            }
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(
        ".tts-fade, .tts-slide, .tts-from-left, .tts-from-right, .tts-scale, .tts-curtain, .tts-highlight, .tts-counter, .tts-line-reveal, .tts-cascade, .tts-tilt-left, .tts-tilt-right, .tts-tilt-up, .tts-scramble, .tts-split-heading",
      )
      .forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Tracks: title shifts center-to-left, cards arc UP as they fly in from right, intense bounce at landing
  useEffect(() => {
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    // Arc trajectory: card rises as it moves left, then slams down with intense gravity bounce
    // t=0: level (far right), t=0.5: peak (-280px), t=0.5→1: gravity slam + bounce
    const arcY = (t: number): number => {
      if (t <= 0) return 0;
      if (t >= 1) return 0;
      if (t <= 0.5) {
        // Rise phase: smooth quadratic arc up to -280px at t=0.5
        const p = t / 0.5;
        return -280 * p * (2 - p);
      } else {
        // Gravity slam: from -280px, plunges down with intense multi-bounce
        const bt = (t - 0.5) / 0.5;
        return -280 * Math.exp(-6 * bt) * Math.cos(3.5 * Math.PI * bt);
      }
    };

    const handle = () => {
      if (!trackScrollRef.current) return;
      const rect = trackScrollRef.current.getBoundingClientRect();
      const scrolled = -rect.top;
      const total = trackScrollRef.current.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, scrolled / total));

      // Title: slides from horizontally centered to left-aligned
      if (trackTitleRef.current) {
        const titleEl = trackTitleRef.current;
        const titleW = titleEl.offsetWidth;
        const centerOffset = window.innerWidth / 2 - 80 - titleW / 2;
        const titleP = easeOut(Math.max(0, Math.min(1, p / 0.38)));
        titleEl.style.transform = `translateY(-50%) translateX(${centerOffset * (1 - titleP)}px)`;
        const sub = titleEl.querySelector<HTMLElement>(".track-title-sub");
        if (sub)
          sub.style.opacity = String(
            Math.max(0, Math.min(1, (p - 0.18) / 0.22)),
          );
      }

      // Cards: stagger arc in — rise as they fly from right, slam landing with intense bounce
      if (trackInnerRef.current) {
        const cards =
          trackInnerRef.current.querySelectorAll<HTMLElement>(".track-card");
        cards.forEach((card, i) => {
          const start = 0.18 + i * 0.18;
          const rawP = Math.max(0, Math.min(1, (p - start) / 0.34));
          const xP = easeOut(rawP);
          const xOffset = (1 - xP) * (window.innerWidth + 400);
          const yOffset = arcY(rawP);
          card.style.transform = `translateX(${xOffset}px) translateY(${yOffset}px)`;
          card.style.opacity = String(Math.min(1, rawP * 3));
        });
      }

      // Section exit: starts only after Growing (card 3) fully lands at p≈0.88
      if (trackStickyRef.current) {
        const exitP = easeOut(Math.max(0, Math.min(1, (p - 0.88) / 0.12)));
        trackStickyRef.current.style.transform = `translateX(${-exitP * 100}%)`;
        setTrackExitProg(exitP);
      }
    };
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Floating parallax icons — Y + X drift driven by absolute scrollY so icons
  // animate even during sticky-section scroll phases where getBoundingClientRect
  // stays constant (viewport position locked).
  useEffect(() => {
    const handle = () => {
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      floatRefs.current.forEach((el) => {
        if (!el) return;
        const speedY = parseFloat(el.dataset.speed ?? "0.08");
        const speedX = parseFloat(el.dataset.speedx ?? "0");
        const rotate = el.dataset.rotate ?? "0";
        // Cache each element's absolute page-Y once (at the scroll position of
        // first render, before any transforms). This makes parallax work even
        // inside sticky containers where getBoundingClientRect is constant.
        if (!el.dataset.initialPageY) {
          const rect = el.getBoundingClientRect();
          el.dataset.initialPageY = String(rect.top + scrollY);
        }
        const initialPageY = parseFloat(el.dataset.initialPageY);
        const centerOffset =
          initialPageY + el.offsetHeight / 2 - (scrollY + winH / 2);
        const yShift = centerOffset * speedY;
        const xShift = centerOffset * speedX;
        el.style.transform = `translateY(${yShift}px) translateX(${xShift}px) rotate(${rotate}deg)`;
      });
    };
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Epic section entrances — join rings + mission flash
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          if (e.target === joinSectionRef.current) setJoinActive(true);
          if (e.target === missionSectionRef.current) setMissionActive(true);
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.15 },
    );
    if (joinSectionRef.current) obs.observe(joinSectionRef.current);
    if (missionSectionRef.current) obs.observe(missionSectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Stat counter animation
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-count-to]");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const target = parseFloat(el.dataset.countTo ?? "0");
          const suffix = el.dataset.countSuffix ?? "";
          const duration = 1400;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 4);
            el.textContent = Math.floor(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = target + suffix;
          };
          requestAnimationFrame(tick);
          obs.unobserve(el);
        }),
      { threshold: 0.6 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const word2Shown = heroProgress > 0.16;
  const word3Shown = heroProgress > 0.28;
  const heroSlideProgress = Math.max(
    0,
    Math.min(1, (heroProgress - 0.36) / (0.57 - 0.36)),
  );
  const wordsMorphing = heroProgress > 0.62;
  const heroContentShown = heroProgress > 0.76;
  const h1WrapperW = h1WrapperRef.current?.offsetWidth ?? 0;
  const heroContainerW = heroContentRef.current?.clientWidth ?? 0;
  const slideX =
    heroSlideProgress * Math.max(0, heroContainerW - 80 - h1WrapperW);

  // Reveal section: two-phase choreography (no enter animation — Panel A is immediate)
  // Phase 1 (0→0.42):  Panel A DWELLS — visible from the very first pixel
  // Phase 2 (0.42→0.56): simultaneous swap — A exits down, B enters from top (touching)
  // Phase 3 (0.56→1.0): Panel B DWELLS
  const revealSlide = revealProgress;
  // Panel A: slides in from RIGHT locked to tracks exit (same exitP = no gap)
  // then exits DOWN (0.42→0.56)
  const panelRealWorkX = (1 - trackExitProg) * 100;
  const transP = Math.max(0, Math.min(1, (revealSlide - 0.42) / 0.14));
  const panelRealWorkY = transP * 100;
  const panelWalkInY = (-1 + transP) * 100;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || emailLoading) return;
    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);
    setEmailLoading(true);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error("Server error");
      setEmailSubmitted(true);
    } catch {
      setEmailError(
        "Something went wrong. Email us at trojantechsolutions@gmail.com",
      );
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .tts-mission-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .tts-join-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .tts-leadership-grid { grid-template-columns: 1fr !important; }
          .tts-footer-cols { flex-direction: column !important; gap: 32px !important; align-items: flex-start !important; }
          .tts-advisors-alumni-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 768px) {
          .tts-tracks-grid { grid-template-columns: 1fr !important; }
          .tts-hero-content { padding: 0 20px !important; }
          .tts-section-pad { padding: 80px 20px !important; }
          .tts-nav-dots { display: none !important; }
          .tts-footer-wrap { padding: 40px 20px 24px !important; }
          .tts-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .tts-panel-b-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .tts-hero-h1 { font-size: clamp(44px, 13vw, 80px) !important; }
          .tts-panel-b-inner { padding: 0 20px !important; }
          .tts-panel-b-stats { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.1) !important; padding-top: 32px !important; }
          .tts-track-title { left: 20px !important; width: clamp(120px, 30vw, 220px) !important; }
          .tts-join-phase3-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 480px) {
          .tts-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .tts-leadership-grid { grid-template-columns: 1fr !important; }
        }
        @media (hover: none), (pointer: coarse) {
          #tts-cursor-dot, #tts-cursor-ring { display: none !important; }
          .tts-main { cursor: auto !important; }
        }
        button:focus-visible, a:focus-visible, input:focus-visible {
          outline: 2px solid #CC0000 !important;
          outline-offset: 2px !important;
          border-radius: 4px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .tts-faq-answer {
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.3s ease;
        }
      `}</style>

      {/* Skip to main content */}
      <a
        href="#mission"
        style={{
          position: "fixed",
          top: -100,
          left: 8,
          zIndex: 99999,
          padding: "8px 16px",
          background: "#CC0000",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 8,
          textDecoration: "none",
          transition: "top 0.2s",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.top = "8px";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.top = "-100px";
        }}
      >
        Skip to main content
      </a>

      {/* Reading progress bar */}
      <div className="tts-progress-bar" aria-hidden="true" />

      {/* Custom cursor */}
      <div
        id="tts-cursor-dot"
        ref={cursorDotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          background: "#CC0000",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
      <div
        id="tts-cursor-ring"
        ref={cursorRingRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          border: "1px solid rgba(204,0,0,0.25)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />

      <div
        className="tts-main"
        style={{
          cursor: "none",
          background: "#09090b",
          minHeight: "100vh",
          overflow: "clip",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* ── HERO ── */}
        <section
          id="hero"
          ref={heroSectionRef}
          style={{ height: "260vh", position: "relative" }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              overflow: "hidden",
              background: "#09090b",
            }}
          >
            {/* Background grid */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
                pointerEvents: "none",
              }}
            />

            {/* Floating parallax icons — hero (3 depth layers) */}
            {[
              // FOREGROUND — large, natural parallax
              {
                Icon: Code,
                top: "8%",
                left: "5%",
                size: 120,
                speed: "0.14",
                speedx: "0.05",
                rotate: -12,
                color: "#CC0000",
              },
              {
                Icon: Globe,
                top: "30%",
                right: "5%",
                size: 100,
                speed: "0.14",
                speedx: "-0.05",
                rotate: -25,
                color: "#FFCC00",
              },
              {
                Icon: Network,
                bottom: "8%",
                left: "12%",
                size: 90,
                speed: "0.14",
                speedx: "0.04",
                rotate: -10,
                color: "#CC0000",
              },
              // MIDGROUND — medium icons
              {
                Icon: Rocket,
                top: "12%",
                right: "8%",
                size: 70,
                speed: "0.10",
                speedx: "-0.03",
                rotate: 14,
                color: "rgba(255,255,255,0.65)",
              },
              {
                Icon: Brain,
                bottom: "22%",
                left: "7%",
                size: 65,
                speed: "0.07",
                speedx: "0.03",
                rotate: 8,
                color: "rgba(255,204,0,0.7)",
              },
              {
                Icon: GitBranch,
                bottom: "12%",
                right: "10%",
                size: 60,
                speed: "0.07",
                speedx: "-0.02",
                rotate: 20,
                color: "rgba(255,255,255,0.55)",
              },
              // BACKGROUND — small icons
              {
                Icon: Cpu,
                top: "52%",
                right: "5%",
                size: 40,
                speed: "0.05",
                speedx: "-0.02",
                rotate: -6,
                color: "rgba(204,0,0,0.45)",
              },
              {
                Icon: Terminal,
                top: "35%",
                left: "5%",
                size: 35,
                speed: "0.05",
                speedx: "0.02",
                rotate: 30,
                color: "rgba(255,255,255,0.25)",
              },
              {
                Icon: Zap,
                top: "68%",
                left: "5%",
                size: 30,
                speed: "0.03",
                speedx: "-0.01",
                rotate: -18,
                color: "rgba(255,204,0,0.35)",
              },
              {
                Icon: Layers,
                bottom: "40%",
                right: "5%",
                size: 28,
                speed: "0.03",
                speedx: "0.01",
                rotate: 15,
                color: "rgba(255,255,255,0.2)",
              },
            ].map(
              (
                {
                  Icon,
                  top,
                  left,
                  right,
                  bottom,
                  size,
                  speed,
                  speedx,
                  rotate,
                  color,
                },
                idx,
              ) => (
                <div
                  key={`hero-float-${idx}`}
                  ref={(el) => {
                    if (el) floatRefs.current[idx + 20] = el;
                  }}
                  className="tts-float-icon"
                  data-speed={speed}
                  data-speedx={speedx}
                  data-rotate={rotate}
                  aria-hidden="true"
                  style={{
                    top,
                    left,
                    right,
                    bottom,
                    color,
                    opacity: Math.max(
                      0.15,
                      Math.min(1, heroSlideProgress * 3 + 0.15),
                    ),
                    transition: "opacity 0.4s ease",
                  }}
                >
                  <Icon size={size} />
                </div>
              ),
            )}
            {/* Red glow */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "40%",
                left: "45%",
                transform: "translate(-50%,-50%)",
                width: 700,
                height: 700,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(204,0,0,0.08) 0%, transparent 65%)",
                pointerEvents: "none",
              }}
            />

            <div
              className="tts-hero-content"
              ref={heroContentRef}
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                width: "100%",
                padding: "0 40px",
                position: "relative",
                zIndex: 1,
                minHeight: "3em",
              }}
            >
              {/* Slide wrapper — tracks scroll right before morph */}
              <div
                ref={h1WrapperRef}
                style={{
                  display: "inline-block",
                  transform: `translateX(${slideX}px)`,
                }}
              >
                {/* Morph h1 */}
                <h1
                  aria-label="Trojan Technology Solutions"
                  style={{
                    fontSize: "clamp(60px, 9vw, 112px)",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.9,
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{ display: "block", position: "relative" }}
                  >
                    <span
                      style={{
                        display: "block",
                        color: "transparent",
                        WebkitTextStroke: "2px #fff",
                        opacity: wordsMorphing ? 0 : 1,
                        transform: wordsMorphing
                          ? "translateY(0.12em) scale(0.96)"
                          : "translateY(0) scale(1)",
                        transition:
                          "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    >
                      Build.
                    </span>
                    <span
                      style={{
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 0,
                        color: "#fff",
                        opacity: wordsMorphing ? 1 : 0,
                        transform: wordsMorphing
                          ? "translateY(0) scale(1)"
                          : "translateY(-0.12em) scale(0.96)",
                        transition:
                          "opacity 0.55s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.55s cubic-bezier(0.16,1,0.3,1) 0.1s",
                      }}
                    >
                      Trojan
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    style={{ display: "block", position: "relative" }}
                  >
                    <span
                      style={{
                        display: "block",
                        color: "#fff",
                        opacity: wordsMorphing ? 0 : word2Shown ? 1 : 0,
                        transform: wordsMorphing
                          ? "scale(0.94)"
                          : word2Shown
                            ? "translateY(0)"
                            : "translateY(48px)",
                        transition:
                          "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    >
                      Solve.
                    </span>
                    <span
                      style={{
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 0,
                        color: "#FFCC00",
                        opacity: wordsMorphing ? 1 : 0,
                        transform: wordsMorphing ? "scale(1)" : "scale(0.94)",
                        transition:
                          "opacity 0.55s cubic-bezier(0.16,1,0.3,1) 0.18s, transform 0.55s cubic-bezier(0.16,1,0.3,1) 0.18s",
                      }}
                    >
                      Tech
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    style={{ display: "block", position: "relative" }}
                  >
                    <span
                      style={{
                        display: "block",
                        color: "transparent",
                        WebkitTextStroke: "2px #fff",
                        opacity: wordsMorphing ? 0 : word3Shown ? 1 : 0,
                        transform: wordsMorphing
                          ? "translateY(-0.12em) scale(0.96)"
                          : word3Shown
                            ? "translateY(0) scale(1)"
                            : "translateY(48px) scale(1)",
                        transition:
                          "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    >
                      Ship.
                    </span>
                    <span
                      style={{
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 0,
                        color: "#CC0000",
                        opacity: wordsMorphing ? 1 : 0,
                        transform: wordsMorphing
                          ? "translateY(0) scale(1)"
                          : "translateY(0.12em) scale(0.96)",
                        transition:
                          "opacity 0.55s cubic-bezier(0.16,1,0.3,1) 0.26s, transform 0.55s cubic-bezier(0.16,1,0.3,1) 0.26s",
                      }}
                    >
                      Solutions
                    </span>
                  </span>
                </h1>
              </div>
              {/* end slide wrapper */}

              {/* Content block — absolutely positioned at top so it aligns with first line of heading */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 40,
                  maxWidth: 480,
                  opacity: heroContentShown ? 1 : 0,
                  transform: heroContentShown
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transition:
                    "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                  pointerEvents: heroContentShown ? "auto" : "none",
                }}
              >
                <p
                  style={{
                    fontSize: 18,
                    color: "#d4d4d8",
                    lineHeight: 1.65,
                    marginBottom: 8,
                  }}
                >
                  A USC builder club where you actually use AI: ship products,
                  solve real problems, and get ahead.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 72,
                    flexWrap: "wrap",
                  }}
                >
                  <a
                    href="/apply"
                    style={{
                      padding: "12px 28px",
                      borderRadius: 10,
                      background: "#CC0000",
                      border: "none",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      boxShadow: "0 4px 24px rgba(204,0,0,0.3)",
                      minHeight: 44,
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "#aa0000";
                      (e.currentTarget as HTMLAnchorElement).style.transform =
                        "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "#CC0000";
                      (e.currentTarget as HTMLAnchorElement).style.transform =
                        "translateY(0)";
                    }}
                  >
                    Join Now <ArrowRight size={15} />
                  </a>
                  <button
                    onClick={() => scrollTo("tracks")}
                    style={{
                      padding: "12px 24px",
                      borderRadius: 10,
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#e4e4e7",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      minHeight: 44,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "rgba(255,255,255,0.3)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#fff";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "rgba(255,255,255,0.15)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#e4e4e7";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                    }}
                  >
                    See the tracks
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gradient: Hero → Mission */}
        <div
          aria-hidden="true"
          style={{
            height: 80,
            background: "linear-gradient(to bottom, #09090b 0%, #0c0c0f 100%)",
            pointerEvents: "none",
            flexShrink: 0,
          }}
        />

        {/* ── MISSION ── */}
        <section
          ref={missionSectionRef}
          id="mission"
          className="tts-section-pad"
          style={{
            background: "#0c0c0f",
            padding: "130px 40px 160px",
            position: "relative",
            overflow: "visible",
          }}
        >
          {/* Mission entrance flash */}
          {missionActive && (
            <div className="tts-mission-flash" aria-hidden="true" />
          )}

          {/* Floating parallax icons — mission section (3 depth layers) */}
          {[
            // FOREGROUND — large, natural parallax
            {
              Icon: Lightbulb,
              top: "10%",
              right: "5%",
              size: 110,
              speed: "0.14",
              speedx: "-0.05",
              rotate: -8,
              color: "#FFCC00",
            },
            {
              Icon: Compass,
              bottom: "14%",
              left: "5%",
              size: 95,
              speed: "0.14",
              speedx: "0.04",
              rotate: -14,
              color: "#CC0000",
            },
            // MIDGROUND — medium icons
            {
              Icon: BookOpen,
              top: "8%",
              left: "5%",
              size: 68,
              speed: "0.10",
              speedx: "0.03",
              rotate: 12,
              color: "rgba(255,255,255,0.6)",
            },
            {
              Icon: Target,
              bottom: "18%",
              right: "5%",
              size: 62,
              speed: "0.07",
              speedx: "-0.02",
              rotate: 20,
              color: "rgba(255,255,255,0.5)",
            },
            {
              Icon: Network,
              top: "55%",
              right: "5%",
              size: 58,
              speed: "0.07",
              speedx: "-0.02",
              rotate: 18,
              color: "rgba(255,204,0,0.65)",
            },
            // BACKGROUND — small icons
            {
              Icon: Globe,
              top: "48%",
              left: "5%",
              size: 38,
              speed: "0.05",
              speedx: "0.02",
              rotate: 6,
              color: "rgba(255,255,255,0.22)",
            },
            {
              Icon: Zap,
              top: "28%",
              right: "5%",
              size: 32,
              speed: "0.03",
              speedx: "-0.01",
              rotate: -22,
              color: "rgba(204,0,0,0.35)",
            },
          ].map(
            (
              {
                Icon,
                top,
                left,
                right,
                bottom,
                size,
                speed,
                speedx,
                rotate,
                color,
              },
              idx,
            ) => (
              <div
                key={`mission-float-${idx}`}
                ref={(el) => {
                  if (el) floatRefs.current[idx + 60] = el;
                }}
                className="tts-float-icon"
                data-speed={speed}
                data-speedx={speedx}
                data-rotate={rotate}
                aria-hidden="true"
                style={{ top, left, right, bottom, color }}
              >
                <Icon size={size} />
              </div>
            ),
          )}

          <div
            className="tts-mission-grid"
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "55fr 45fr",
              gap: 80,
              alignItems: "start",
            }}
          >
            {/* Left column: headline + body */}
            <div>
              <h2
                style={{
                  fontSize: "clamp(42px, 5.5vw, 76px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.05,
                  marginBottom: 40,
                }}
              >
                <span className="tts-line-reveal">
                  <span>The club that</span>
                </span>
                <span
                  className="tts-line-reveal"
                  style={{ transitionDelay: "0.12s" }}
                >
                  <span style={{ color: "#CC0000" }}>
                    actually lets you in.
                  </span>
                </span>
              </h2>
              <p
                className="tts-fade"
                style={{
                  fontSize: 19,
                  color: "#d4d4d8",
                  lineHeight: 1.8,
                  marginBottom: 20,
                  transitionDelay: "0.08s",
                }}
              >
                SEP, BTG, BPX: great clubs. All have applications, waitlists,
                and cuts. TTS has{" "}
                <span className="tts-highlight">none of that</span>. Walk in any
                week. No application, no interview, no rejection email.
              </p>
              <p
                className="tts-fade"
                style={{
                  fontSize: 19,
                  color: "#d4d4d8",
                  lineHeight: 1.8,
                  marginBottom: 0,
                  transitionDelay: "0.12s",
                }}
              >
                We run tracks across consulting, engineering, biotech, music
                tech, and Web3. AI is reshaping every field, not just software.
                Show up once and get value. Or join four project teams and go
                deep. Both work.
              </p>
            </div>

            {/* Right column: pull-quote card + fact pills */}
            <div
              className="tts-fade"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                transitionDelay: "0.16s",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: 32,
                }}
              >
                <div
                  style={{
                    fontSize: 64,
                    color: "#CC0000",
                    lineHeight: 0.8,
                    fontFamily: "Georgia, serif",
                    fontWeight: 900,
                    marginBottom: 16,
                    userSelect: "none",
                  }}
                >
                  &ldquo;
                </div>
                <p
                  style={{
                    fontSize: 18,
                    fontStyle: "italic",
                    color: "#d4d4d8",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Think the international student who can&apos;t land an
                  interview. Or the pre-med with no idea how AI is reshaping
                  their field. We&apos;re here for that student, and building
                  them into someone who lands their dream program.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {["Any major", "Any year", "Zero gatekeeping"].map((fact) => (
                  <span
                    key={fact}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 999,
                      padding: "6px 16px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#a1a1aa",
                    }}
                  >
                    {fact}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gradient: Mission → Tracks */}
        <div
          aria-hidden="true"
          style={{
            height: 80,
            background: "linear-gradient(to bottom, #0c0c0f 0%, #09090b 100%)",
            pointerEvents: "none",
            flexShrink: 0,
          }}
        />

        {/* Wave 1 — before tracks */}
        <WaveDivider
          amplitude={24}
          speed={10}
          topColor="#09090b"
          bottomColor="#09090b"
        />

        {/* ── TRACKS — center-to-left title + gravity card reveal ── */}
        <section
          ref={trackScrollRef}
          id="tracks"
          style={{
            background: "#09090b",
            height: "clamp(200vh, 320vh, 320vh)",
            position: "relative",
          }}
        >
          <div
            ref={trackStickyRef}
            style={{
              position: "sticky",
              top: 0,
              height: "100vh",
              overflow: "visible",
              willChange: "transform",
            }}
          >
            {/* Background dot grid */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                pointerEvents: "none",
              }}
            />

            {/* Title — absolutely positioned, JS shifts it center → left */}
            <div
              ref={trackTitleRef}
              className="tts-track-title"
              style={{
                position: "absolute",
                left: 80,
                top: "50%",
                width: "clamp(220px, 24vw, 360px)",
                zIndex: 2,
                willChange: "transform",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(56px, 7.5vw, 108px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.05,
                  marginBottom: 20,
                }}
              >
                <SplitText text="Pick" style={{ display: "block" }} />
                <SplitText
                  text="your"
                  baseDelay={0.1}
                  style={{ display: "block" }}
                />
                <SplitText
                  text="track."
                  baseDelay={0.18}
                  style={{
                    display: "block",
                    color: "transparent",
                    WebkitTextStroke: "3px #fff",
                  }}
                />
              </h2>
              <p
                className="track-title-sub"
                style={{
                  fontSize: 14,
                  color: "#71717a",
                  lineHeight: 1.7,
                  maxWidth: 240,
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                Pick one or drift across all three. Most people do both.
              </p>
            </div>

            {/* Cards — flex row, each slides in from right with gravity bounce */}
            <div
              ref={trackInnerRef}
              style={{
                position: "absolute",
                left: "clamp(140px, 28vw, 460px)",
                right: "clamp(16px, 5vw, 60px)",
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                gap: 16,
                overflow: "visible",
              }}
            >
              {TRACKS.map(
                ({
                  num,
                  icon: Icon,
                  accent,
                  title,
                  sub,
                  tagline,
                  items,
                  for: forText,
                  featured,
                }) => (
                  <div
                    key={num}
                    className="track-card"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: "calc(100vh - 120px)",
                      background: featured ? "#141416" : "#111113",
                      borderRadius: 20,
                      border: featured
                        ? `1px solid ${accent}35`
                        : "1px solid rgba(255,255,255,0.1)",
                      borderTop: `4px solid ${accent}`,
                      padding: "32px 28px 28px",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                      opacity: 0,
                      willChange: "transform, opacity",
                      boxShadow: featured
                        ? `0 0 80px ${accent}12, 0 32px 80px rgba(0,0,0,0.5)`
                        : "0 16px 48px rgba(0,0,0,0.4)",
                    }}
                  >
                    {/* Giant ghost number — outlined with accent color */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        bottom: -50,
                        right: -16,
                        fontSize: 260,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: "transparent",
                        WebkitTextStroke: `1.5px ${accent}45`,
                        letterSpacing: "-0.08em",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    >
                      {num}
                    </div>

                    {featured && (
                      <div
                        style={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          background: accent,
                          color: "#09090b",
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          padding: "3px 10px",
                          borderRadius: 100,
                        }}
                      >
                        Most popular
                      </div>
                    )}

                    {/* Top row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 24,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 72,
                          fontWeight: 900,
                          color: "transparent",
                          WebkitTextStroke: `1px rgba(255,255,255,0.12)`,
                          letterSpacing: "-0.06em",
                          lineHeight: 1,
                          userSelect: "none",
                        }}
                      >
                        {num}
                      </div>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          background: hexToRgba(accent, 0.15),
                          border: `1px solid ${hexToRgba(accent, 0.4)}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={22} color={accent} />
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: accent,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      {sub}
                    </div>
                    <h3
                      style={{
                        fontSize: 32,
                        fontWeight: 900,
                        color: "#fff",
                        letterSpacing: "-0.03em",
                        lineHeight: 1.05,
                        marginBottom: 12,
                      }}
                    >
                      {title}
                    </h3>
                    <p
                      style={{
                        fontSize: 15,
                        color: "#a1a1aa",
                        lineHeight: 1.65,
                        marginBottom: 24,
                      }}
                    >
                      {tagline}
                    </p>

                    <div
                      style={{
                        height: 1,
                        background: "rgba(255,255,255,0.1)",
                        marginBottom: 20,
                      }}
                    />

                    <ul
                      style={{
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                        flex: 1,
                      }}
                    >
                      {items.map((item) => (
                        <li
                          key={item}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            fontSize: 14,
                            color: "#d4d4d8",
                            lineHeight: 1.5,
                          }}
                        >
                          <Check
                            size={14}
                            color={accent}
                            strokeWidth={2.5}
                            style={{ flexShrink: 0, marginTop: 2 }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div
                      style={{
                        marginTop: 24,
                        paddingTop: 18,
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          color: "#71717a",
                          maxWidth: 200,
                          lineHeight: 1.5,
                        }}
                      >
                        {forText}
                      </div>
                      <button
                        onClick={() => scrollTo("join")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 700,
                          color: accent,
                          background: hexToRgba(accent, 0.1),
                          border: `1px solid ${hexToRgba(accent, 0.3)}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          padding: "9px 16px",
                          flexShrink: 0,
                          transition: "background 0.15s",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = hexToRgba(accent, 0.2);
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = hexToRgba(accent, 0.1);
                        }}
                      >
                        Join <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Panel A proxy — sits at left:100% of the sticky container so it slides into view as trackStickyRef translates left.
                Crossfades out in the last 15% of exit so the real Panel A takes over seamlessly. */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "100%",
                top: 0,
                width: "100%",
                height: "100%",
                background: "#0d0d10",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                opacity: Math.max(
                  0,
                  1 - Math.max(0, (trackExitProg - 0.85) / 0.15),
                ),
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "12%",
                  right: "5%",
                  color: "rgba(204,0,0,0.65)",
                  transform: "rotate(20deg)",
                  pointerEvents: "none",
                }}
              >
                <Rocket size={80} />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "18%",
                  left: "5%",
                  color: "rgba(255,255,255,0.40)",
                  transform: "rotate(-14deg)",
                  pointerEvents: "none",
                }}
              >
                <GitBranch size={64} />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "55%",
                  right: "5%",
                  color: "rgba(255,204,0,0.50)",
                  transform: "rotate(8deg)",
                  pointerEvents: "none",
                }}
              >
                <Trophy size={52} />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  left: "5%",
                  color: "rgba(255,255,255,0.28)",
                  transform: "rotate(30deg)",
                  pointerEvents: "none",
                }}
              >
                <Globe size={44} />
              </div>
              <div
                style={{
                  maxWidth: 1200,
                  width: "100%",
                  padding: "0 40px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 80,
                  alignItems: "center",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#CC0000",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: 20,
                    }}
                  >
                    Why it works
                  </p>
                  <h2
                    style={{
                      fontSize: "clamp(32px, 4vw, 60px)",
                      fontWeight: 900,
                      color: "#fff",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.0,
                      marginBottom: 24,
                    }}
                  >
                    Real work.
                    <br />
                    <span style={{ color: "#CC0000" }}>
                      Not{" "}
                      <span
                        style={{
                          color: "transparent",
                          WebkitTextStroke: "2px #fff",
                        }}
                      >
                        just
                      </span>{" "}
                      classes.
                    </span>
                  </h2>
                  <p
                    style={{
                      fontSize: 15,
                      color: "#71717a",
                      lineHeight: 1.8,
                      maxWidth: 400,
                    }}
                  >
                    Build the portfolio and skills here, then use them to land
                    SEP, BTG, BPX, or whatever comes next. TTS is the rep room
                    those clubs assume you already have.
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    borderLeft: "1px solid rgba(255,255,255,0.12)",
                    paddingLeft: 48,
                  }}
                >
                  {[
                    { stat: "Week 1", label: "You ship something" },
                    { stat: "Real", label: "Client work every semester" },
                    { stat: "Yours", label: "Everything you build" },
                  ].map(({ stat, label }, i) => (
                    <div
                      key={label}
                      style={{
                        padding: "28px 0",
                        borderBottom:
                          i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "clamp(40px, 5vw, 64px)",
                          fontWeight: 900,
                          color: "#fff",
                          letterSpacing: "-0.04em",
                          lineHeight: 1,
                          marginBottom: 6,
                        }}
                      >
                        {stat}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#d4d4d8",
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── REVERSE SCROLL REVEAL ── */}
        <div
          ref={revealSectionRef}
          style={{ height: "230vh", position: "relative" }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              height: "100vh",
              overflow: "hidden",
            }}
          >
            {/* Panel A: "Real work" — proxy handles slide-in, this fades in after proxy crossfades out */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#0d0d10",
                display: "flex",
                alignItems: "center",
                transform: `translateY(${panelRealWorkY}%)`,
                opacity: Math.max(0, (trackExitProg - 0.85) / 0.15),
                zIndex: 1,
                overflow: "hidden",
              }}
            >
              {/* Floating icons — Panel A */}
              {(
                [
                  {
                    Icon: Rocket,
                    top: "12%",
                    right: "5%",
                    size: 80,
                    speed: "0.10",
                    speedx: "-0.03",
                    rotate: 20,
                    color: "rgba(204,0,0,0.65)",
                  },
                  {
                    Icon: GitBranch,
                    bottom: "18%",
                    left: "5%",
                    size: 64,
                    speed: "0.07",
                    speedx: "0.02",
                    rotate: -14,
                    color: "rgba(255,255,255,0.40)",
                  },
                  {
                    Icon: Trophy,
                    top: "55%",
                    right: "5%",
                    size: 52,
                    speed: "0.07",
                    speedx: "-0.02",
                    rotate: 8,
                    color: "rgba(255,204,0,0.50)",
                  },
                  {
                    Icon: Globe,
                    top: "25%",
                    left: "5%",
                    size: 44,
                    speed: "0.05",
                    speedx: "0.02",
                    rotate: 30,
                    color: "rgba(255,255,255,0.28)",
                  },
                  {
                    Icon: Layers,
                    bottom: "10%",
                    right: "12%",
                    size: 38,
                    speed: "0.05",
                    speedx: "-0.02",
                    rotate: -22,
                    color: "rgba(204,0,0,0.35)",
                  },
                ] as {
                  Icon: React.FC<{ size: number }>;
                  top?: string;
                  left?: string;
                  right?: string;
                  bottom?: string;
                  size: number;
                  speed: string;
                  speedx: string;
                  rotate: number;
                  color: string;
                }[]
              ).map(
                (
                  {
                    Icon,
                    top,
                    left,
                    right,
                    bottom,
                    size,
                    speed,
                    speedx,
                    rotate,
                    color,
                  },
                  idx,
                ) => {
                  const sY = parseFloat(speed);
                  const sX = parseFloat(speedx);
                  const drift = revealProgress - 0.3;
                  const yOff = drift * sY * 800;
                  const xOff = drift * sX * 800;
                  return (
                    <div
                      key={`panel-a-${idx}`}
                      className="tts-float-icon"
                      aria-hidden="true"
                      style={{
                        top,
                        left,
                        right,
                        bottom,
                        color,
                        zIndex: 0,
                        transform: `translateY(${yOff}px) translateX(${xOff}px) rotate(${rotate}deg)`,
                      }}
                    >
                      <Icon size={size} />
                    </div>
                  );
                },
              )}
              <div
                className="tts-panel-b-grid tts-panel-b-inner"
                style={{
                  maxWidth: 1200,
                  margin: "0 auto",
                  width: "100%",
                  padding: "0 40px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 80,
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#CC0000",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: 20,
                    }}
                  >
                    Why it works
                  </p>
                  <h2
                    style={{
                      fontSize: "clamp(32px, 4vw, 60px)",
                      fontWeight: 900,
                      color: "#fff",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.0,
                      marginBottom: 24,
                    }}
                  >
                    Real work.
                    <br />
                    <span style={{ color: "#CC0000" }}>
                      Not{" "}
                      <span
                        style={{
                          color: "transparent",
                          WebkitTextStroke: "2px #fff",
                        }}
                      >
                        just
                      </span>{" "}
                      classes.
                    </span>
                  </h2>
                  <p
                    style={{
                      fontSize: 15,
                      color: "#71717a",
                      lineHeight: 1.8,
                      maxWidth: 400,
                    }}
                  >
                    Build the portfolio and skills here, then use them to land
                    SEP, BTG, BPX, or whatever comes next. TTS is the rep room
                    those clubs assume you already have.
                  </p>
                </div>
                <div
                  className="tts-panel-b-stats"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    borderLeft: "1px solid rgba(255,255,255,0.12)",
                    paddingLeft: 48,
                  }}
                >
                  {[
                    {
                      stat: "Week 1",
                      label: "You ship something",
                      sub: "Building track members deploy a live product in the first session. Not the end of the semester.",
                    },
                    {
                      stat: "Real",
                      label: "Client work every semester",
                      sub: "Live engagements with actual organizations. Consulting track delivers real decks.",
                    },
                    {
                      stat: "Yours",
                      label: "Everything you build",
                      sub: "Goes on your resume. Never stays in a classroom.",
                    },
                  ].map(({ stat, label, sub }, i) => (
                    <div
                      key={label}
                      style={{
                        padding: "28px 0",
                        borderBottom:
                          i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "clamp(40px, 5vw, 64px)",
                          fontWeight: 900,
                          color: "#fff",
                          letterSpacing: "-0.04em",
                          lineHeight: 1,
                          marginBottom: 6,
                        }}
                      >
                        {stat}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#CC0000",
                          marginBottom: 6,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#71717a",
                          lineHeight: 1.6,
                          maxWidth: 320,
                        }}
                      >
                        {sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel B: "Walk in. Walk out different." — enters from TOP */}
            <div
              aria-hidden={panelWalkInY < -5}
              style={{
                position: "absolute",
                inset: 0,
                background: "#09090b",
                transform: `translateY(${panelWalkInY}%)`,
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* dot grid */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                  pointerEvents: "none",
                }}
              />
              {/* red glow */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 700,
                  height: 700,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(204,0,0,0.1) 0%, transparent 65%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  padding: "0 40px",
                  maxWidth: 900,
                  textAlign: "center",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#CC0000",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 28,
                  }}
                >
                  USC · Any major · Every semester
                </p>
                <h2
                  style={{
                    fontSize: "clamp(52px, 9vw, 112px)",
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: "-0.04em",
                    lineHeight: 1.0,
                    marginBottom: 36,
                  }}
                >
                  Walk in.
                  <br />
                  <span style={{ color: "#CC0000" }}>Walk out different.</span>
                </h2>
                <p
                  style={{
                    fontSize: 16,
                    color: "#71717a",
                    lineHeight: 1.7,
                    maxWidth: 520,
                    margin: "0 auto",
                  }}
                >
                  Most clubs gatekeep. TTS hands you the keys. One semester here
                  changes how you think about what you&apos;re capable of.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave 2 — after reveal */}
        <WaveDivider
          reverse
          amplitude={30}
          speed={8}
          topColor="#09090b"
          bottomColor="#000"
        />

        {/* ── LEADERSHIP ── */}
        <section
          id="leadership"
          className="tts-section-pad"
          style={{
            position: "relative",
            background: "#000",
            padding: "100px 0 120px",
            overflow: "visible",
          }}
        >
          {/* Tyler floating icons — consulting */}
          {(
            [
              {
                Icon: Briefcase,
                top: "22%",
                left: "5%",
                size: 84,
                speed: "0.10",
                speedx: "0.03",
                rotate: -12,
                color: "rgba(255,204,0,0.68)",
              },
              {
                Icon: TrendingUp,
                top: "62%",
                left: "5%",
                size: 58,
                speed: "0.07",
                speedx: "-0.02",
                rotate: 14,
                color: "rgba(255,204,0,0.52)",
              },
              {
                Icon: BarChart2,
                bottom: "12%",
                left: "10%",
                size: 46,
                speed: "0.05",
                speedx: "0.02",
                rotate: -8,
                color: "rgba(255,204,0,0.42)",
              },
              {
                Icon: Users,
                top: "42%",
                left: "20%",
                size: 36,
                speed: "0.05",
                speedx: "-0.02",
                rotate: 22,
                color: "rgba(255,204,0,0.28)",
              },
            ] as {
              Icon: React.FC<{ size: number }>;
              top?: string;
              left?: string;
              bottom?: string;
              size: number;
              speed: string;
              speedx: string;
              rotate: number;
              color: string;
            }[]
          ).map(
            (
              { Icon, top, left, bottom, size, speed, speedx, rotate, color },
              idx,
            ) => (
              <div
                key={`lead-tyler-${idx}`}
                ref={(el) => {
                  if (el) floatRefs.current[idx + 70] = el;
                }}
                className="tts-float-icon"
                data-speed={speed}
                data-speedx={speedx}
                data-rotate={rotate}
                aria-hidden="true"
                style={{ top, left, bottom, color }}
              >
                <Icon size={size} />
              </div>
            ),
          )}

          {/* Caleb floating icons — tech */}
          {(
            [
              {
                Icon: Cpu,
                top: "18%",
                right: "5%",
                size: 92,
                speed: "0.14",
                speedx: "-0.05",
                rotate: 8,
                color: "rgba(204,0,0,0.72)",
              },
              {
                Icon: Code,
                top: "58%",
                right: "5%",
                size: 62,
                speed: "0.07",
                speedx: "0.02",
                rotate: -16,
                color: "rgba(204,0,0,0.58)",
              },
              {
                Icon: Terminal,
                bottom: "14%",
                right: "8%",
                size: 50,
                speed: "0.07",
                speedx: "-0.02",
                rotate: 24,
                color: "rgba(204,0,0,0.44)",
              },
              {
                Icon: Brain,
                top: "38%",
                right: "21%",
                size: 38,
                speed: "0.05",
                speedx: "0.02",
                rotate: -28,
                color: "rgba(204,0,0,0.30)",
              },
            ] as {
              Icon: React.FC<{ size: number }>;
              top?: string;
              right?: string;
              bottom?: string;
              size: number;
              speed: string;
              speedx: string;
              rotate: number;
              color: string;
            }[]
          ).map(
            (
              { Icon, top, right, bottom, size, speed, speedx, rotate, color },
              idx,
            ) => (
              <div
                key={`lead-caleb-${idx}`}
                ref={(el) => {
                  if (el) floatRefs.current[idx + 74] = el;
                }}
                className="tts-float-icon"
                data-speed={speed}
                data-speedx={speedx}
                data-rotate={rotate}
                aria-hidden="true"
                style={{ top, right, bottom, color }}
              >
                <Icon size={size} />
              </div>
            ),
          )}

          {/* Section header */}
          <div
            style={{
              textAlign: "center",
              padding: "0 40px 72px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <p
              className="tts-fade"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#CC0000",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              Trojan Technology Solutions
            </p>
            <h2
              className="tts-fade"
              style={{
                fontSize: "clamp(52px, 8vw, 100px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
                margin: 0,
                transitionDelay: "0.05s",
              }}
            >
              <span style={{ color: "#fff" }}>Meet the </span>
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #FFCC00 0%, #CC0000 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Presidents
              </span>
            </h2>
          </div>

          {/* Split layout */}
          <div
            className="tts-leadership-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              maxWidth: 1360,
              margin: "0 auto",
              padding: "0 24px",
              gap: 20,
              position: "relative",
              zIndex: 2,
            }}
          >
            {FOUNDERS.map((f, i) => {
              const accentHex = f.id === "tyler" ? "#FFCC00" : "#CC0000";
              return (
                <div
                  key={f.id}
                  className={i === 0 ? "tts-from-left" : "tts-from-right"}
                  style={{ transitionDelay: `${i * 0.14}s` }}
                >
                  <a
                    href={f.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${f.name}, ${f.role} — ${f.linkLabel} (opens in new tab)`}
                    style={{ display: "block", textDecoration: "none" }}
                  >
                    <div
                      style={{
                        borderRadius: 20,
                        overflow: "hidden",
                        border: `1px solid ${hexToRgba(accentHex, 0.18)}`,
                        transition:
                          "border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderColor = hexToRgba(accentHex, 0.55);
                        el.style.transform = "scale(1.015)";
                        el.style.boxShadow = `0 28px 64px ${hexToRgba(accentHex, 0.18)}`;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderColor = hexToRgba(accentHex, 0.18);
                        el.style.transform = "scale(1)";
                        el.style.boxShadow = "none";
                      }}
                    >
                      {/* Photo */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "4/5",
                        }}
                      >
                        <Image
                          src={f.headshot}
                          alt={`${f.name}, ${f.role} of TTS`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{
                            objectFit: "cover",
                            objectPosition: f.position,
                          }}
                        />
                        {/* Gradient: dark top, clear mid, very dark bottom */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, transparent 32%, transparent 48%, rgba(0,0,0,0.96) 100%)",
                          }}
                        />
                        {/* Accent glow at bottom */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "45%",
                            background: `linear-gradient(to top, ${hexToRgba(accentHex, 0.14)} 0%, transparent 100%)`,
                          }}
                        />
                        {/* Name + focus — bottom */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 24,
                            left: 24,
                            right: 24,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: f.accent,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              marginBottom: 8,
                            }}
                          >
                            {f.focus}
                          </div>
                          <h3
                            style={{
                              fontSize: "clamp(30px, 3.2vw, 48px)",
                              fontWeight: 900,
                              color: "#fff",
                              letterSpacing: "-0.03em",
                              lineHeight: 1,
                              margin: 0,
                            }}
                          >
                            {f.name}
                          </h3>
                        </div>
                      </div>

                      {/* Owned domains */}
                      <div
                        style={{
                          background: "#080808",
                          padding: "22px 26px 26px",
                          borderTop: `1px solid ${hexToRgba(accentHex, 0.12)}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            marginBottom: 20,
                          }}
                        >
                          {f.owns.map((item) => (
                            <div
                              key={item}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: "50%",
                                  background: f.accent,
                                  flexShrink: 0,
                                  marginTop: 8,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: 13.5,
                                  color: "#d4d4d8",
                                  lineHeight: 1.6,
                                }}
                              >
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>

          {/* Bottom tagline */}
          <div
            className="tts-fade"
            style={{
              textAlign: "center",
              padding: "60px 40px 0",
              transitionDelay: "0.28s",
              position: "relative",
              zIndex: 2,
            }}
          >
            <p
              style={{
                fontSize: 14,
                color: "#3f3f46",
                maxWidth: 380,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Questions? Reach either of them directly at{" "}
              <a
                href="mailto:trojantechsolutions@gmail.com"
                style={{ color: "#CC0000", textDecoration: "none" }}
              >
                trojantechsolutions@gmail.com
              </a>
            </p>
          </div>
        </section>

        {/* Wave 3 — before cabinet */}
        <WaveDivider
          amplitude={36}
          speed={12}
          topColor="#000"
          bottomColor="#09090b"
        />

        {/* ── CABINET ── */}
        <section
          id="cabinet"
          className="tts-section-pad"
          style={{
            background: "#09090b",
            padding: "80px 40px",
            position: "relative",
            overflow: "visible",
          }}
        >
          {/* Dot grid background */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              pointerEvents: "none",
            }}
          />
          {/* Subtle red glow top-right */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-10%",
              right: "-5%",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(204,0,0,0.06) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          {/* Floating parallax icons — cabinet section (3 depth layers) */}
          {[
            // FOREGROUND — large, natural parallax
            {
              Icon: Zap,
              top: "52%",
              right: "5%",
              size: 105,
              speed: "0.14",
              speedx: "-0.05",
              rotate: -10,
              color: "#CC0000",
            },
            {
              Icon: Award,
              top: "10%",
              left: "5%",
              size: 95,
              speed: "0.14",
              speedx: "0.04",
              rotate: -28,
              color: "#FFCC00",
            },
            // MIDGROUND — medium icons
            {
              Icon: Hammer,
              top: "12%",
              right: "6%",
              size: 70,
              speed: "0.10",
              speedx: "-0.03",
              rotate: -18,
              color: "rgba(204,0,0,0.65)",
            },
            {
              Icon: Briefcase,
              bottom: "14%",
              left: "7%",
              size: 64,
              speed: "0.07",
              speedx: "0.02",
              rotate: 12,
              color: "rgba(255,204,0,0.65)",
            },
            {
              Icon: Mail,
              bottom: "12%",
              right: "12%",
              size: 60,
              speed: "0.07",
              speedx: "-0.02",
              rotate: 22,
              color: "rgba(255,204,0,0.6)",
            },
            // BACKGROUND — small icons
            {
              Icon: TrendingUp,
              bottom: "18%",
              right: "5%",
              size: 38,
              speed: "0.05",
              speedx: "-0.02",
              rotate: 8,
              color: "rgba(255,255,255,0.25)",
            },
            {
              Icon: Star,
              bottom: "35%",
              left: "5%",
              size: 32,
              speed: "0.03",
              speedx: "0.01",
              rotate: 16,
              color: "rgba(255,204,0,0.3)",
            },
            {
              Icon: Guitar,
              bottom: "20%",
              left: "6%",
              size: 56,
              speed: "0.09",
              speedx: "0.03",
              rotate: -25,
              color: "rgba(255,204,0,0.4)",
            },
            {
              Icon: FlaskConical,
              top: "15%",
              right: "8%",
              size: 48,
              speed: "0.07",
              speedx: "-0.02",
              rotate: 15,
              color: "rgba(16,185,129,0.4)",
            },
          ].map(
            (
              {
                Icon,
                top,
                left,
                right,
                bottom,
                size,
                speed,
                speedx,
                rotate,
                color,
              },
              idx,
            ) => (
              <div
                key={idx}
                ref={(el) => {
                  if (el) floatRefs.current[idx] = el;
                }}
                className="tts-float-icon"
                data-speed={speed}
                data-speedx={speedx}
                data-rotate={rotate}
                aria-hidden="true"
                style={{ top, left, right, bottom, color }}
              >
                <Icon size={size} />
              </div>
            ),
          )}
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ marginBottom: 48 }}>
              <p
                className="tts-from-left"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#CC0000",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                The team
              </p>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 52px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  marginBottom: 12,
                }}
              >
                <SplitText text="E-Board" />
              </h2>
              <p
                className="tts-fade"
                style={{
                  fontSize: 15,
                  color: "#a1a1aa",
                  maxWidth: 500,
                  transitionDelay: "0.08s",
                }}
              >
                The people running the tracks, building the community, and
                keeping the machine moving.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              {CABINET.filter((m) => !m.placeholder).map((member, i) => (
                <a
                  key={member.name}
                  href={member.link ?? "#"}
                  target={member.link ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={`${member.name}, ${member.role}`}
                  className="tts-cascade"
                  style={{
                    transitionDelay: `${i * 0.08}s`,
                    display: "block",
                    textDecoration: "none",
                    borderRadius: 16,
                    overflow: "hidden",
                    position: "relative",
                    aspectRatio: "3/4",
                    background: "#111113",
                    border: `1px solid rgba(255,255,255,0.12)`,
                    transition:
                      "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform =
                      "translateY(-6px) scale(1.02)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      `0 20px 60px ${member.accent}25`;
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      `${member.accent}50`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform =
                      "translateY(0) scale(1)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      "none";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "rgba(255,255,255,0.12)";
                  }}
                >
                  {/* Photo */}
                  {member.headshot ? (
                    <Image
                      src={member.headshot}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 300px"
                      style={{
                        objectFit: "cover",
                        objectPosition: member.position ?? "center top",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(135deg, ${member.accent}18 0%, #111113 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 52,
                          fontWeight: 900,
                          color: `${member.accent}40`,
                        }}
                      >
                        {member.initials}
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0.3) 45%, transparent 70%)",
                    }}
                  />

                  {/* Accent top bar */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: member.accent,
                    }}
                  />

                  {/* Name + role pinned to bottom */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "20px 20px 18px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                        marginBottom: 4,
                      }}
                    >
                      {member.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: member.accent,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {member.role}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Placeholder strip */}
            <div
              className="tts-fade"
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: 0.4,
              }}
            >
              <div
                style={{
                  height: 1,
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: "#71717a",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                + 4 roles opening soon
              </span>
              <div
                style={{
                  height: 1,
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
            </div>
          </div>
        </section>

        {/* Gradient: Cabinet → Alumni */}
        <div
          aria-hidden="true"
          style={{
            height: 60,
            background: "linear-gradient(to bottom, #09090b 0%, #0c0c0f 100%)",
            pointerEvents: "none",
          }}
        />

        {/* ── ALUMNI / BOARD ── */}
        <section
          id="alumni"
          className="tts-section-pad"
          style={{
            background: "#0c0c0f",
            padding: "80px 40px",
            position: "relative",
            overflow: "visible",
          }}
        >
          {/* Floating parallax icons — alumni section */}
          {[
            {
              Icon: Star,
              top: "8%",
              right: "6%",
              size: 56,
              speed: "0.08",
              speedx: "-0.02",
              rotate: 20,
              color: "rgba(255,204,0,0.35)",
            },
            {
              Icon: Award,
              top: "22%",
              left: "4%",
              size: 72,
              speed: "0.10",
              speedx: "0.03",
              rotate: -15,
              color: "rgba(255,255,255,0.15)",
            },
            {
              Icon: Users,
              bottom: "25%",
              right: "5%",
              size: 48,
              speed: "0.06",
              speedx: "-0.02",
              rotate: 8,
              color: "rgba(204,0,0,0.35)",
            },
            {
              Icon: Globe,
              bottom: "12%",
              left: "6%",
              size: 38,
              speed: "0.05",
              speedx: "0.02",
              rotate: 30,
              color: "rgba(255,255,255,0.18)",
            },
            {
              Icon: Network,
              top: "55%",
              right: "8%",
              size: 32,
              speed: "0.04",
              speedx: "-0.01",
              rotate: -10,
              color: "rgba(255,204,0,0.25)",
            },
          ].map(
            (
              {
                Icon,
                top,
                left,
                right,
                bottom,
                size,
                speed,
                speedx,
                rotate,
                color,
              },
              idx,
            ) => (
              <div
                key={idx}
                ref={(el) => {
                  if (el) floatRefs.current[idx + 90] = el;
                }}
                className="tts-float-icon"
                data-speed={speed}
                data-speedx={speedx}
                data-rotate={rotate}
                aria-hidden="true"
                style={{ top, left, right, bottom, color }}
              >
                <Icon size={size} />
              </div>
            ),
          )}
          {/* Gold glow bottom-left */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "-10%",
              left: "-5%",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,204,0,0.05) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Origin story quote */}
            <div
              className="tts-fade"
              style={{
                marginBottom: 64,
                padding: "24px 28px",
                borderRadius: 14,
                background: "rgba(255,204,0,0.04)",
                border: "1px solid rgba(255,204,0,0.1)",
                borderLeft: "3px solid #FFCC00",
                maxWidth: 680,
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  color: "#d4d4d8",
                  lineHeight: 1.75,
                  fontStyle: "italic",
                  margin: 0,
                  marginBottom: 12,
                }}
              >
                &ldquo;The OG club focused on IT solutions and consulting for
                local small businesses. Caleb and Tyler are taking the
                foundations and scaling big time to create impact on all
                levels.&rdquo;
              </p>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FFCC00" }}>
                Matthew Kim, OG Co-Founder
              </div>
            </div>

            <div style={{ marginBottom: 48 }}>
              <p
                className="tts-from-left"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#FFCC00",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Where it started
              </p>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 52px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  marginBottom: 12,
                }}
              >
                <SplitText text="Alumni & Advisors" />
              </h2>
              <p
                className="tts-fade"
                style={{
                  fontSize: 15,
                  color: "#a1a1aa",
                  maxWidth: 520,
                  transitionDelay: "0.08s",
                }}
              >
                TTS didn&apos;t start with us. These are the people who built
                the foundation we&apos;re standing on.
              </p>
            </div>

            {/* Board of Advisors + Alumni — side by side */}
            <div
              className="tts-advisors-alumni-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(280px, 500px) 1fr",
                gap: 64,
                alignItems: "start",
              }}
            >
              {/* Board of Advisors */}
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#71717a",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 20,
                  }}
                >
                  Board of Advisors
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 20,
                  }}
                >
                  {BOARD.map((person, i) => (
                    <a
                      key={person.name}
                      href={person.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${person.name}, ${person.role}`}
                      className={i === 0 ? "tts-from-left" : "tts-from-right"}
                      style={{
                        transitionDelay: `${i * 0.12}s`,
                        display: "block",
                        textDecoration: "none",
                        borderRadius: 16,
                        overflow: "hidden",
                        background: "#111113",
                        border: "1px solid rgba(255,204,0,0.1)",
                        transition:
                          "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.transform =
                          "translateY(-6px) scale(1.02)";
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                          "0 20px 60px rgba(255,204,0,0.15)";
                        (
                          e.currentTarget as HTMLAnchorElement
                        ).style.borderColor = "rgba(255,204,0,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.transform =
                          "translateY(0) scale(1)";
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                          "none";
                        (
                          e.currentTarget as HTMLAnchorElement
                        ).style.borderColor = "rgba(255,204,0,0.1)";
                      }}
                    >
                      {/* Portrait photo */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "3/4",
                          overflow: "hidden",
                        }}
                      >
                        {/* Accent bar */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: "#FFCC00",
                            zIndex: 2,
                          }}
                        />
                        {person.headshot ? (
                          <Image
                            src={person.headshot}
                            alt={person.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 280px"
                            style={{
                              objectFit: "cover",
                              objectPosition: person.position ?? "center top",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(255,204,0,0.05)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 48,
                                fontWeight: 900,
                                color: "rgba(255,204,0,0.2)",
                              }}
                            >
                              {person.initials}
                            </span>
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to top, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0.3) 45%, transparent 70%)",
                          }}
                        />
                        {/* Name pinned to bottom */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: "18px 18px 16px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 800,
                              color: "#fff",
                              letterSpacing: "-0.02em",
                              lineHeight: 1.2,
                              marginBottom: 4,
                            }}
                          >
                            {person.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#FFCC00",
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                            }}
                          >
                            {person.role}
                          </div>
                        </div>
                      </div>

                      {/* Company logo strip */}
                      <div
                        style={{
                          padding: "12px 18px",
                          borderTop: "1px solid rgba(255,204,0,0.07)",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          minHeight: 48,
                          flexWrap: "wrap",
                        }}
                      >
                        {person.companies.map((co) => (
                          <span
                            key={co}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#a1a1aa",
                              background: "rgba(255,255,255,0.07)",
                              border: "1px solid rgba(255,255,255,0.15)",
                              borderRadius: 6,
                              padding: "3px 8px",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {co}
                          </span>
                        ))}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Alumni */}
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#71717a",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 20,
                  }}
                >
                  Alumni
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="tts-fade"
                      style={{ transitionDelay: `${i * 0.05}s` }}
                    >
                      <div
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 14,
                          border: "1px dashed rgba(255,255,255,0.25)",
                          padding: "20px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 14,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              border: "1px dashed rgba(255,255,255,0.3)",
                              background: "rgba(255,255,255,0.06)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <span style={{ fontSize: 14, color: "#a1a1aa" }}>
                              ?
                            </span>
                          </div>
                          <div>
                            <div
                              style={{
                                width: 80,
                                height: 10,
                                background: "rgba(255,255,255,0.2)",
                                borderRadius: 4,
                                marginBottom: 6,
                              }}
                            />
                            <div
                              style={{
                                width: 56,
                                height: 8,
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: 4,
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {[0, 1, 2].map((j) => (
                            <div
                              key={j}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: "rgba(255,255,255,0.06)",
                                border: "1px dashed rgba(255,255,255,0.2)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p
                  className="tts-fade"
                  style={{
                    fontSize: 13,
                    color: "#71717a",
                    marginTop: 20,
                    fontStyle: "italic",
                  }}
                >
                  Alumni profiles coming soon. Reach out to add yours.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Wave 4 — before FAQ */}
        <WaveDivider
          reverse
          amplitude={20}
          speed={7}
          topColor="#0c0c0f"
          bottomColor="#09090b"
        />

        {/* ── FAQ ── */}
        <section
          id="faq"
          className="tts-section-pad"
          style={{
            background: "#09090b",
            padding: "80px 40px",
            position: "relative",
            overflow: "visible",
          }}
        >
          {/* Floating parallax icons — FAQ section (3 depth layers) */}
          {[
            // FOREGROUND — large, natural parallax
            {
              Icon: HelpCircle,
              top: "8%",
              left: "5%",
              size: 108,
              speed: "0.14",
              speedx: "0.05",
              rotate: 15,
              color: "rgba(255,255,255,0.55)",
            },
            {
              Icon: HelpCircle,
              bottom: "18%",
              right: "5%",
              size: 96,
              speed: "0.14",
              speedx: "-0.04",
              rotate: -18,
              color: "rgba(255,204,0,0.65)",
            },
            // MIDGROUND — medium icons
            {
              Icon: HelpCircle,
              top: "16%",
              right: "5%",
              size: 70,
              speed: "0.10",
              speedx: "-0.03",
              rotate: -10,
              color: "rgba(204,0,0,0.65)",
            },
            {
              Icon: HelpCircle,
              bottom: "10%",
              left: "5%",
              size: 64,
              speed: "0.07",
              speedx: "0.02",
              rotate: 8,
              color: "rgba(255,255,255,0.5)",
            },
            // BACKGROUND — small icons
            {
              Icon: HelpCircle,
              top: "48%",
              left: "5%",
              size: 38,
              speed: "0.05",
              speedx: "0.02",
              rotate: 25,
              color: "rgba(255,255,255,0.22)",
            },
            {
              Icon: HelpCircle,
              top: "33%",
              right: "5%",
              size: 30,
              speed: "0.03",
              speedx: "-0.01",
              rotate: -30,
              color: "rgba(204,0,0,0.3)",
            },
          ].map(
            (
              {
                Icon,
                top,
                left,
                right,
                bottom,
                size,
                speed,
                speedx,
                rotate,
                color,
              },
              idx,
            ) => (
              <div
                key={`faq-float-${idx}`}
                ref={(el) => {
                  if (el) floatRefs.current[idx + 50] = el;
                }}
                className="tts-float-icon"
                data-speed={speed}
                data-speedx={speedx}
                data-rotate={rotate}
                aria-hidden="true"
                style={{ top, left, right, bottom, color }}
              >
                <Icon size={size} />
              </div>
            ),
          )}

          {/* Radial spotlight that tracks open item */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 700,
              height: 700,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(204,0,0,0.06) 0%, transparent 60%)",
              pointerEvents: "none",
              transition: "opacity 0.5s ease",
              opacity: openFaq !== null ? 1 : 0.4,
            }}
          />

          <div
            style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}
          >
            <div style={{ marginBottom: 56 }}>
              <h2
                style={{
                  fontSize: "clamp(32px, 4.5vw, 60px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                }}
              >
                <SplitText text="Questions we" charDelay={0.018} />
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #CC0000 0%, #ff4444 50%, #FFCC00 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  always get.
                </span>
              </h2>
              <p
                className="tts-fade"
                style={{
                  fontSize: 16,
                  color: "#71717a",
                  marginTop: 14,
                  transitionDelay: "0.1s",
                }}
              >
                Everything you need to decide if TTS is right for you.
              </p>
            </div>

            {/* Two-panel FAQ split */}
            <div className="tts-faq-split">
              {/* Left panel: question list */}
              <div>
                {FAQ_ITEMS.map(({ q }, i) => {
                  const isActive = (openFaq ?? 0) === i;
                  return (
                    <button
                      key={q}
                      onClick={() => setOpenFaq(i)}
                      aria-pressed={isActive}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        padding: "20px 0",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        borderLeft: isActive
                          ? "3px solid #CC0000"
                          : "3px solid transparent",
                        paddingLeft: isActive ? 16 : 16,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.25s ease",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 32,
                          fontWeight: 900,
                          color: isActive ? "#CC0000" : "#1a1a1a",
                          lineHeight: 1,
                          minWidth: 52,
                          transition: "color 0.25s ease",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: isActive ? "#ffffff" : "#52525b",
                          lineHeight: 1.45,
                          transition: "color 0.25s ease",
                        }}
                      >
                        {q}
                      </span>
                    </button>
                  );
                })}

                {/* Still have a question */}
                <div
                  className="tts-fade"
                  style={{
                    marginTop: 32,
                    padding: "20px 20px",
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg, rgba(204,0,0,0.06) 0%, rgba(255,204,0,0.03) 100%)",
                    border: "1px solid rgba(204,0,0,0.2)",
                    transitionDelay: "0.15s",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 4,
                    }}
                  >
                    Still have a question?
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#71717a", marginBottom: 14 }}
                  >
                    We&apos;re a real club with real people. Just reach out.
                  </div>
                  <a
                    href="mailto:trojantechsolutions@gmail.com"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 18px",
                      borderRadius: 100,
                      background: "#CC0000",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 20px rgba(204,0,0,0.3)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "#aa0000";
                      (e.currentTarget as HTMLAnchorElement).style.transform =
                        "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "#CC0000";
                      (e.currentTarget as HTMLAnchorElement).style.transform =
                        "translateY(0)";
                    }}
                  >
                    <Mail size={13} /> Email us
                  </a>
                </div>
              </div>

              {/* Right panel: sticky answer */}
              <div
                style={{
                  position: "sticky",
                  top: "calc(50vh - 160px)",
                }}
              >
                <div
                  key={openFaq ?? 0}
                  className="tts-faq-content"
                  style={{
                    background: "rgba(204,0,0,0.04)",
                    border: "1px solid rgba(204,0,0,0.12)",
                    borderRadius: 24,
                    padding: "48px 44px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Giant decorative number */}
                  <div
                    aria-hidden="true"
                    style={{
                      fontSize: 220,
                      fontWeight: 900,
                      color: "rgba(204,0,0,0.05)",
                      position: "absolute",
                      top: -20,
                      right: -10,
                      lineHeight: 1,
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {String((openFaq ?? 0) + 1).padStart(2, "0")}
                  </div>

                  <p
                    style={{
                      fontSize: "clamp(18px, 1.8vw, 22px)",
                      fontWeight: 700,
                      color: "#fff",
                      margin: 0,
                      marginBottom: 20,
                      lineHeight: 1.35,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {FAQ_ITEMS[openFaq ?? 0].q}
                  </p>
                  <p
                    style={{
                      fontSize: 16,
                      color: "#a1a1aa",
                      lineHeight: 1.8,
                      margin: 0,
                      position: "relative",
                      zIndex: 1,
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        (openFaq ?? 0) === 0
                          ? FAQ_ITEMS[0].a.replace(
                              "@trojantechsolutions",
                              `<a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" style="color:#CC0000;text-decoration:none;">@trojantechsolutions</a>`,
                            )
                          : FAQ_ITEMS[openFaq ?? 0].a,
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      background: "#CC0000",
                      borderRadius: "50%",
                      marginTop: 28,
                      boxShadow: "0 0 12px rgba(204,0,0,0.5)",
                      position: "relative",
                      zIndex: 1,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wave 5 — before join */}
        <WaveDivider
          amplitude={28}
          speed={9}
          topColor="#09090b"
          bottomColor="#0a0508"
        />

        {/* ── JOIN — scroll-driven cinematic ── */}
        <section
          ref={joinScrollRef}
          id="join"
          style={{
            height: "clamp(160vh, 200vh, 240vh)",
            position: "relative",
            background: "#0a0508",
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              height: "100vh",
              overflow: "visible",
            }}
          >
            {/* Deep red glow — intensifies through scroll */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: "-20%",
                left: "50%",
                transform: `translate(-50%, 0) scale(${1 + joinScrollProg * 0.6})`,
                width: "140%",
                height: "80%",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at 50% 100%, rgba(204,0,0,0.22) 0%, transparent 65%)",
                pointerEvents: "none",
                transition: "none",
              }}
            />
            {/* Entrance rings — scroll-driven via joinScrollProg so they reverse on scroll back */}
            <div
              ref={joinSectionRef as React.RefObject<HTMLDivElement>}
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            >
              {[0, 1, 2, 3, 4].map((i) => {
                const ringStart = i * 0.08;
                const ringP = Math.max(
                  0,
                  Math.min(1, (joinScrollProg - ringStart) / 0.65),
                );
                const ringColors = [
                  "rgba(204,0,0,0.5)",
                  "rgba(204,0,0,0.35)",
                  "rgba(255,255,255,0.15)",
                  "rgba(255,204,0,0.25)",
                  "rgba(204,0,0,0.2)",
                ];
                return (
                  <div
                    key={`ring-${i}`}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 300,
                      height: 300,
                      borderRadius: "50%",
                      border: `1px solid ${ringColors[i]}`,
                      transform: `translate(-50%, -50%) scale(${ringP * 4})`,
                      opacity: ringP > 0 ? 0.7 * (1 - ringP) : 0,
                      pointerEvents: "none",
                    }}
                  />
                );
              })}
            </div>

            {/* Floating parallax icons — join section */}
            {[
              {
                Icon: Zap,
                top: "8%",
                left: "5%",
                size: 118,
                speed: "0.14",
                speedx: "0.05",
                rotate: -16,
                color: "#CC0000",
              },
              {
                Icon: Rocket,
                bottom: "12%",
                left: "6%",
                size: 104,
                speed: "0.13",
                speedx: "0.04",
                rotate: 22,
                color: "#FFCC00",
              },
              {
                Icon: Globe,
                top: "28%",
                left: "5%",
                size: 80,
                speed: "0.10",
                speedx: "0.03",
                rotate: 10,
                color: "rgba(204,0,0,0.5)",
              },
              {
                Icon: Globe,
                bottom: "18%",
                right: "5%",
                size: 92,
                speed: "0.12",
                speedx: "-0.04",
                rotate: -8,
                color: "#CC0000",
              },
              {
                Icon: Users,
                top: "15%",
                right: "6%",
                size: 70,
                speed: "0.09",
                speedx: "-0.03",
                rotate: 10,
                color: "rgba(255,255,255,0.6)",
              },
              {
                Icon: Award,
                top: "48%",
                right: "5%",
                size: 64,
                speed: "0.07",
                speedx: "-0.025",
                rotate: -20,
                color: "rgba(255,204,0,0.65)",
              },
              {
                Icon: Flame,
                top: "65%",
                left: "5%",
                size: 60,
                speed: "0.08",
                speedx: "0.025",
                rotate: -30,
                color: "rgba(204,0,0,0.65)",
              },
              {
                Icon: Star,
                top: "38%",
                left: "8%",
                size: 36,
                speed: "0.04",
                speedx: "0.015",
                rotate: 14,
                color: "rgba(255,255,255,0.25)",
              },
              {
                Icon: Brain,
                bottom: "40%",
                right: "8%",
                size: 30,
                speed: "0.03",
                speedx: "-0.01",
                rotate: 25,
                color: "rgba(255,255,255,0.2)",
              },
            ].map(
              (
                {
                  Icon,
                  top,
                  left,
                  right,
                  bottom,
                  size,
                  speed,
                  speedx,
                  rotate,
                  color,
                },
                idx,
              ) => (
                <div
                  key={`join-float-${idx}`}
                  ref={(el) => {
                    if (el) floatRefs.current[idx + 30] = el;
                  }}
                  className="tts-float-icon"
                  data-speed={speed}
                  data-speedx={speedx}
                  data-rotate={rotate}
                  aria-hidden="true"
                  style={{ top, left, right, bottom, color }}
                >
                  <Icon size={size} />
                </div>
              ),
            )}

            {/* ── PHASE 1: Zero stat (progress 0 → 0.35) ── */}
            {(() => {
              const p = joinScrollProg;
              const inP = Math.max(0, Math.min(1, p / 0.08));
              const inEased = 1 - Math.pow(1 - inP, 3);
              const outP = Math.max(0, Math.min(1, (p - 0.28) / 0.12));
              const outEased = 1 - Math.pow(1 - outP, 3);
              const op = inEased * (1 - outEased);

              return (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: op,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(100px, 20vw, 260px)",
                      fontWeight: 900,
                      lineHeight: 1,
                      textAlign: "center",
                      color: "transparent",
                      WebkitTextStroke: "3px rgba(255,255,255,0.85)",
                      letterSpacing: 0,
                    }}
                  >
                    0
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(18px, 2.8vw, 36px)",
                      fontWeight: 800,
                      color: "#CC0000",
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      marginTop: 16,
                      textAlign: "center",
                    }}
                  >
                    Applications required
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(13px, 1.4vw, 18px)",
                      color: "rgba(255,255,255,0.35)",
                      marginTop: 12,
                      letterSpacing: "0.08em",
                    }}
                  >
                    Any major · Any year · Walk in any week
                  </div>
                </div>
              );
            })()}

            {/* ── PHASE 2: Track trio (progress 0.3 → 0.65) ── */}
            {(() => {
              const p = joinScrollProg;
              const inP = Math.max(0, Math.min(1, (p - 0.28) / 0.12));
              const inEased = 1 - Math.pow(1 - inP, 3);
              const outP = Math.max(0, Math.min(1, (p - 0.57) / 0.12));
              const outEased = 1 - Math.pow(1 - outP, 3);
              const op = inEased * (1 - outEased);
              return (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: op,
                    transform: `translateY(${(1 - inEased) * 40 - outEased * 40}px)`,
                    pointerEvents: "none",
                    gap: 0,
                  }}
                >
                  {[
                    { word: "Build.", color: "#CC0000", delay: 0 },
                    { word: "Consult.", color: "#FFCC00", delay: 0.04 },
                    { word: "Grow.", color: "#10b981", delay: 0.08 },
                  ].map(({ word, color, delay }) => (
                    <div
                      key={word}
                      style={{
                        fontSize: "clamp(60px, 11vw, 130px)",
                        fontWeight: 900,
                        color: "transparent",
                        WebkitTextStroke: `2px ${color}`,
                        letterSpacing: "-0.04em",
                        lineHeight: 0.95,
                        opacity: Math.max(
                          0,
                          Math.min(1, (p - 0.28 - delay) / 0.1),
                        ),
                        transform: `translateX(${(1 - Math.max(0, Math.min(1, (p - 0.28 - delay) / 0.1))) * 60}px)`,
                      }}
                    >
                      {word}
                    </div>
                  ))}
                  <div
                    style={{
                      marginTop: 28,
                      fontSize: "clamp(13px, 1.4vw, 18px)",
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.1em",
                      opacity: Math.max(0, Math.min(1, (p - 0.38) / 0.1)),
                    }}
                  >
                    Three tracks · One club · Zero gatekeeping
                  </div>
                </div>
              );
            })()}

            {/* ── PHASE 3: Full CTA (progress 0.62 → 1.0) ── */}
            {(() => {
              const p = joinScrollProg;
              const inP = Math.max(0, Math.min(1, (p - 0.6) / 0.18));
              const inEased = 1 - Math.pow(1 - inP, 3);
              const op = inEased;
              const yShift = (1 - inEased) * 80;
              return (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: op,
                    transform: `translateY(${yShift}px)`,
                    pointerEvents: op > 0.5 ? "auto" : "none",
                    padding: "0 40px",
                  }}
                >
                  <div
                    className="tts-join-phase3-grid"
                    style={{
                      maxWidth: 680,
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "clamp(56px, 8vw, 100px)",
                        fontWeight: 900,
                        color: "#fff",
                        letterSpacing: "-0.03em",
                        lineHeight: 1.05,
                        marginBottom: 24,
                      }}
                    >
                      <span style={{ display: "block" }}>Start this</span>
                      <span style={{ display: "block", color: "#CC0000" }}>
                        semester.
                      </span>
                    </h2>
                    <p
                      style={{
                        fontSize: 17,
                        color: "#d4d4d8",
                        lineHeight: 1.8,
                        marginBottom: 40,
                        maxWidth: 560,
                        margin: "0 auto 40px",
                      }}
                    >
                      This is the rep room that SEP, BTG, and BPX assume you
                      already have. Show up with nothing and leave with a
                      portfolio, a network, and a real deliverable.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 12,
                        marginBottom: 40,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <a
                        href="/apply"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "14px 28px",
                          borderRadius: 12,
                          background: "#CC0000",
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          boxShadow: "0 4px 20px rgba(204,0,0,0.25)",
                          textDecoration: "none",
                          width: "auto",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLAnchorElement
                          ).style.background = "#aa0000";
                          (
                            e.currentTarget as HTMLAnchorElement
                          ).style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLAnchorElement
                          ).style.background = "#CC0000";
                          (
                            e.currentTarget as HTMLAnchorElement
                          ).style.transform = "translateY(0)";
                        }}
                      >
                        Join TTS
                        <ArrowRight size={15} />
                      </a>

                      <a
                        href="/partner"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "14px 28px",
                          borderRadius: 12,
                          background: "transparent",
                          border: "1px solid rgba(255,255,255,0.2)",
                          color: "#e4e4e7",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          textDecoration: "none",
                          width: "auto",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLAnchorElement
                          ).style.borderColor = "rgba(255,255,255,0.4)";
                          (e.currentTarget as HTMLAnchorElement).style.color =
                            "#fff";
                          (
                            e.currentTarget as HTMLAnchorElement
                          ).style.background = "rgba(255,255,255,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLAnchorElement
                          ).style.borderColor = "rgba(255,255,255,0.2)";
                          (e.currentTarget as HTMLAnchorElement).style.color =
                            "#e4e4e7";
                          (
                            e.currentTarget as HTMLAnchorElement
                          ).style.background = "transparent";
                        }}
                      >
                        Partner with TTS
                      </a>
                    </div>

                    {/* Email capture */}
                    <div style={{ width: "100%", maxWidth: 420 }}>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 20,
                          border: "1px solid rgba(255,255,255,0.08)",
                          padding: "24px 28px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#a1a1aa",
                            marginBottom: 14,
                            textAlign: "left",
                          }}
                        >
                          Get notified when the next session opens
                        </p>

                        {!emailSubmitted ? (
                          <form
                            onSubmit={handleEmailSubmit}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            <label
                              htmlFor="notify-email"
                              style={{
                                fontSize: 12,
                                color: "#a1a1aa",
                                marginBottom: 2,
                              }}
                            >
                              Your email address
                            </label>
                            <input
                              id="notify-email"
                              type="email"
                              autoComplete="email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (emailError) setEmailError(null);
                              }}
                              placeholder="your@email.com"
                              required
                              disabled={emailLoading}
                              aria-label="Email address for TTS session notifications"
                              aria-describedby={
                                emailError ? "email-error" : undefined
                              }
                              style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: 10,
                                background: "#0d0d10",
                                border: emailError
                                  ? "1px solid rgba(204,0,0,0.5)"
                                  : "1px solid rgba(255,255,255,0.08)",
                                color: "#fff",
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                                transition: "border-color 0.15s",
                              }}
                              onFocus={(e) => {
                                if (!emailError)
                                  (
                                    e.currentTarget as HTMLInputElement
                                  ).style.borderColor = "rgba(204,0,0,0.4)";
                              }}
                              onBlur={(e) => {
                                if (!emailError)
                                  (
                                    e.currentTarget as HTMLInputElement
                                  ).style.borderColor =
                                    "rgba(255,255,255,0.08)";
                              }}
                            />
                            {emailError && (
                              <p
                                id="email-error"
                                role="alert"
                                style={{
                                  fontSize: 12,
                                  color: "#f87171",
                                  margin: "2px 0 0",
                                  lineHeight: 1.5,
                                }}
                              >
                                {emailError}
                              </p>
                            )}
                            <button
                              type="submit"
                              disabled={emailLoading}
                              style={{
                                padding: "11px",
                                borderRadius: 10,
                                background: emailLoading
                                  ? "rgba(204,0,0,0.5)"
                                  : "#CC0000",
                                border: "none",
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: emailLoading
                                  ? "not-allowed"
                                  : "pointer",
                                transition: "background 0.15s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 7,
                                minHeight: 44,
                                marginTop: emailError ? 4 : 0,
                              }}
                              onMouseEnter={(e) => {
                                if (!emailLoading)
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.background = "#aa0000";
                              }}
                              onMouseLeave={(e) => {
                                if (!emailLoading)
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.background = "#CC0000";
                              }}
                            >
                              {emailLoading ? (
                                <>
                                  <div
                                    style={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: "50%",
                                      border: "2px solid rgba(255,255,255,0.3)",
                                      borderTopColor: "#fff",
                                      animation: "spin 0.7s linear infinite",
                                    }}
                                  />
                                  Signing up...
                                </>
                              ) : (
                                "Notify me"
                              )}
                            </button>
                            <p
                              style={{
                                fontSize: 11,
                                color: "#6b7280",
                                margin: "4px 0 0",
                                lineHeight: 1.5,
                              }}
                            >
                              We&apos;ll only use your email to notify you about
                              TTS sessions. No spam, ever.
                            </p>
                          </form>
                        ) : (
                          <div
                            role="status"
                            aria-live="polite"
                            style={{
                              padding: "20px 16px",
                              borderRadius: 10,
                              background: "rgba(16,185,129,0.05)",
                              border: "1px solid rgba(16,185,129,0.2)",
                              textAlign: "center",
                            }}
                          >
                            <Check
                              size={20}
                              color="#10b981"
                              className="tts-check-appear"
                              style={{
                                margin: "0 auto 10px",
                                display: "block",
                              }}
                            />
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#fff",
                                marginBottom: 4,
                              }}
                            >
                              You&apos;re on the list.
                            </div>
                            <div style={{ fontSize: 12, color: "#a1a1aa" }}>
                              We&apos;ll email you when the next session opens.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ── FOOTER — fixed floating pills, appear near page bottom ── */}
        <footer
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "20px 40px 28px",
            zIndex: 100,
            background: "transparent",
            transform: footerVisible ? "translateY(0)" : "translateY(120%)",
            opacity: footerVisible ? 1 : 0,
            transition:
              "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease",
            pointerEvents: footerVisible ? "auto" : "none",
          }}
        >
          {/* Floating nav pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 28,
            }}
          >
            {[
              { label: "Mission", id: "mission" },
              { label: "Tracks", id: "tracks" },
              { label: "Team", id: "leadership" },
              { label: "E-Board", id: "cabinet" },
              { label: "Alumni", id: "alumni" },
              { label: "FAQ", id: "faq" },
              { label: "Join", id: "join" },
            ].map(({ label, id }) => (
              <button
                key={label}
                onClick={() => scrollTo(id)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 100,
                  padding: "8px 18px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#a1a1aa",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "rgba(255,255,255,0.08)";
                  el.style.borderColor = "rgba(255,255,255,0.22)";
                  el.style.color = "#ffffff";
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "rgba(255,255,255,0.04)";
                  el.style.borderColor = "rgba(255,255,255,0.1)";
                  el.style.color = "#a1a1aa";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                {label}
              </button>
            ))}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(204,0,0,0.08)",
                border: "1px solid rgba(204,0,0,0.2)",
                borderRadius: 100,
                padding: "8px 18px",
                fontSize: 12,
                fontWeight: 600,
                color: "#CC0000",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                textDecoration: "none",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                letterSpacing: "0.02em",
                display: "inline-flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "rgba(204,0,0,0.16)";
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow = "0 8px 24px rgba(204,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "rgba(204,0,0,0.08)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              Instagram
            </a>
          </div>

          {/* Copyright */}
          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "#3f3f46",
              margin: 0,
              letterSpacing: "0.04em",
            }}
          >
            © {new Date().getFullYear()} Trojan Technology Solutions · USC
          </p>
        </footer>
      </div>
    </>
  );
}
