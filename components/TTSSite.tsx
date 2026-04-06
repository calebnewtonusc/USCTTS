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
    id: "caleb",
    name: "Caleb Newton",
    role: "Co-President",
    focus: "USC Innovation · Iovine & Young",
    headshot: "/img/caleb_shot.jpg",
    position: "center 15%",
    link: "https://calebnewton.me/",
    linkLabel: "Personal site",
    accent: "#CC0000",
    owns: [
      "Product curriculum and AI systems",
      "Website, codebase, and internal tooling",
      "Startup relationships and builder culture",
      "Technical execution and live demos",
    ],
  },
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
      "E-board building and people operations",
      "Partnerships and cross-club ecosystem",
      "Community culture and recruiting",
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
    name: "Esrom Dawit",
    role: "External Affairs",
    initials: "ED",
    accent: "#CC0000",
    link: "https://www.linkedin.com/in/esrom-dawit-4780302b2/",
    headshot: "/img/esrom_shot.jpeg",
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
    name: "Ephrem Adugna",
    role: "Co-lead of Entrepreneurship",
    initials: "EA",
    accent: "#CC0000",
    link: "https://www.linkedin.com/in/ephrem-adugna/",
    headshot: "/img/ephrem_shot.jpeg",
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
    name: "Austin Chen",
    role: "Lead of Biotech",
    initials: "AC",
    accent: "#CC0000",
    link: "https://www.linkedin.com/in/austin-f-chen/",
    headshot: "/img/austin_shot.jpeg",
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
    name: "Malakai Carey",
    role: "Lead of Music",
    initials: "MC",
    accent: "#CC0000",
    link: "https://www.linkedin.com/in/malakai-carey-11187038a/",
    headshot: "/img/malakai_shot.jpeg",
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
}[] = [
  {
    name: "Matthew Kim",
    role: "OG Co-Founder",
    title: "Board of Advisors",
    initials: "MK",
    link: "https://www.linkedin.com/in/matthewkiiim",
    headshot: "/img/matthew_shot.jpeg",
    position: "center top",
  },
  {
    name: "Kevin Sangmuah",
    role: "OG Co-Founder",
    title: "Board of Advisors",
    initials: "KS",
    link: "https://www.linkedin.com/in/kevin-sangmuah-4a780a221",
    headshot: "/img/kevin_shot.jpeg",
    position: "center top",
  },
];

const INSTAGRAM_URL = "https://instagram.com/trojantechsolutions";

// ── Component ─────────────────────────────────────────────────────────────────
export default function TTSSite() {
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [heroProgress, setHeroProgress] = useState(0);
  const [revealProgress, setRevealProgress] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const revealSectionRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const h1WrapperRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(0);

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
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Scroll reveal for animation classes
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("tts-visible");
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(
        ".tts-fade, .tts-slide, .tts-from-left, .tts-from-right, .tts-scale, .tts-curtain, .tts-perspective",
      )
      .forEach((el) => obs.observe(el));
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

  // Reverse-scroll reveal derived values
  const revealSlide = Math.max(0, (revealProgress - 0.25) / 0.65);
  const panelBY = -100 + revealSlide * 100;
  const panelAExitY = revealSlide * 100;

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
        }
        @media (max-width: 480px) {
          .tts-stats-grid { grid-template-columns: 1fr 1fr !important; }
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
                        color: "#fff",
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
                        color: "#CC0000",
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

              {/* Content block */}
              <div
                style={{
                  marginTop: 12,
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
                    maxWidth: 480,
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

        {/* ── MISSION ── */}
        <section
          id="mission"
          className="tts-section-pad"
          style={{ background: "#0c0c0f", padding: "80px 40px" }}
        >
          <div
            className="tts-mission-grid"
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 52,
              alignItems: "start",
            }}
          >
            <div>
              <h2
                className="tts-from-left"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 46px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  marginBottom: 32,
                }}
              >
                The club that
                <br />
                <span style={{ color: "#CC0000" }}>actually lets you in.</span>
              </h2>
              <p
                className="tts-fade"
                style={{
                  fontSize: 16,
                  color: "#d4d4d8",
                  lineHeight: 1.8,
                  marginBottom: 16,
                  transitionDelay: "0.08s",
                }}
              >
                SEP, BTG, BPX: great clubs. All have applications, waitlists,
                and cuts. TTS has none of that. Walk in any week. No
                application, no interview, no rejection email.
              </p>
              <p
                className="tts-fade"
                style={{
                  fontSize: 16,
                  color: "#d4d4d8",
                  lineHeight: 1.8,
                  marginBottom: 28,
                  transitionDelay: "0.12s",
                }}
              >
                We run tracks across consulting, engineering, biotech, music
                tech, and Web3. AI is reshaping every field, not just software.
                Show up once and get value. Or join four project teams and go
                deep. Both work.
              </p>
              <p
                className="tts-fade"
                style={{
                  fontSize: 15,
                  color: "#a1a1aa",
                  lineHeight: 1.8,
                  marginBottom: 44,
                  transitionDelay: "0.16s",
                  fontStyle: "italic",
                  borderLeft: "2px solid #CC0000",
                  paddingLeft: 16,
                }}
              >
                &ldquo;Think the international student who can&apos;t land an
                interview. Or the pre-med with no idea how AI is reshaping their
                field. We&apos;re here for that student, and building them into
                someone who lands their dream program.&rdquo;
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                className="tts-curtain"
                style={{
                  position: "relative",
                  borderRadius: 16,
                  overflow: "hidden",
                  aspectRatio: "16/10",
                }}
              >
                <Image
                  src="/img/ttsgroup.png"
                  alt="TTS members at USC"
                  fill
                  style={{ objectFit: "cover", objectPosition: "center 30%" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(9,9,11,0.8) 0%, transparent 50%)",
                  }}
                />
                <div style={{ position: "absolute", bottom: 18, left: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    TTS · Spring 2025
                  </div>
                  <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 2 }}>
                    University of Southern California
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRACKS ── */}
        <section
          id="tracks"
          className="tts-section-pad"
          style={{ background: "#09090b", padding: "80px 40px" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ marginBottom: 48 }}>
              <h2
                className="tts-slide"
                style={{
                  fontSize: "clamp(28px, 4vw, 52px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                }}
              >
                Three ways in
              </h2>
              <p
                className="tts-fade"
                style={{
                  fontSize: 15,
                  color: "#a1a1aa",
                  marginTop: 10,
                  transitionDelay: "0.1s",
                }}
              >
                Pick one or explore all three. Most people drift across tracks
                depending on what they&apos;re working on.
              </p>
            </div>

            <div
              className="tts-tracks-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 20,
                alignItems: "stretch",
              }}
            >
              {TRACKS.map(
                (
                  {
                    num,
                    icon: Icon,
                    accent,
                    title,
                    sub,
                    tagline,
                    items,
                    for: forText,
                    featured,
                  },
                  i,
                ) => {
                  const animClass =
                    i === 0
                      ? "tts-from-left"
                      : i === 1
                        ? "tts-scale"
                        : "tts-from-right";
                  return (
                    <div
                      key={num}
                      className={animClass}
                      style={{
                        transitionDelay: `${i * 0.1}s`,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        className="tts-card"
                        style={{
                          background: featured ? "#141414" : "#111113",
                          borderRadius: 16,
                          border: featured
                            ? "1px solid rgba(255,204,0,0.2)"
                            : "1px solid rgba(255,255,255,0.07)",
                          borderTop: `3px solid ${accent}`,
                          padding: featured ? "40px 28px 32px" : "32px 28px",
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                          boxShadow: featured
                            ? "0 0 0 1px rgba(255,204,0,0.08), 0 24px 64px rgba(0,0,0,0.4)"
                            : "none",
                          position: "relative",
                          overflow: "visible",
                        }}
                      >
                        {/* Featured badge — inside the card, above the border */}
                        {featured && (
                          <div
                            style={{
                              position: "absolute",
                              top: -12,
                              left: "50%",
                              transform: "translateX(-50%)",
                              background: "#FFCC00",
                              color: "#09090b",
                              fontSize: 10,
                              fontWeight: 800,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              padding: "3px 10px",
                              borderRadius: 100,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Most popular
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            marginBottom: 28,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 64,
                              fontWeight: 900,
                              color: "rgba(255,255,255,0.12)",
                              letterSpacing: "-0.05em",
                              lineHeight: 1,
                              userSelect: "none",
                            }}
                          >
                            {num}
                          </div>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 11,
                              background: hexToRgba(accent, 0.15),
                              border: `1px solid ${hexToRgba(accent, 0.4)}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={18} color={accent} />
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: accent,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginBottom: 6,
                          }}
                        >
                          {sub}
                        </div>
                        <h3
                          style={{
                            fontSize: 26,
                            fontWeight: 800,
                            color: "#fff",
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                            marginBottom: 12,
                            margin: "0 0 12px",
                          }}
                        >
                          {title}
                        </h3>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#a1a1aa",
                            lineHeight: 1.65,
                            marginBottom: 28,
                          }}
                        >
                          {tagline}
                        </div>

                        <div
                          style={{
                            height: 1,
                            background: "rgba(255,255,255,0.06)",
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
                            gap: 11,
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
                                fontSize: 13,
                                color: "#c4c4c8",
                              }}
                            >
                              <Check
                                size={13}
                                color={accent}
                                strokeWidth={2.5}
                                style={{ flexShrink: 0, marginTop: 1 }}
                              />
                              {item}
                            </li>
                          ))}
                        </ul>

                        <div
                          style={{
                            marginTop: 24,
                            paddingTop: 20,
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#9ca3af",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              marginBottom: 6,
                            }}
                          >
                            Best for
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#d4d4d8",
                              lineHeight: 1.65,
                              marginBottom: 18,
                            }}
                          >
                            {forText}
                          </div>
                          <button
                            onClick={() => scrollTo("join")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 13,
                              fontWeight: 600,
                              color: accent,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              transition: "gap 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.gap =
                                "8px";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.gap =
                                "5px";
                            }}
                          >
                            Join this track <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </section>

        {/* ── REVERSE SCROLL REVEAL ── */}
        <div
          ref={revealSectionRef}
          style={{ height: "220vh", position: "relative" }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              height: "100vh",
              overflow: "hidden",
            }}
          >
            {/* Panel A: exits downward as Panel B arrives */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#09090b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `translateY(${panelAExitY}%)`,
                zIndex: 1,
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
                    lineHeight: 0.92,
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
                  No audition. No prerequisites. No waitlist. Just show up, pick
                  a track, and start doing real work.
                </p>
              </div>
            </div>

            {/* Panel B: slides in from above — brand new content */}
            <div
              aria-hidden={panelBY < -5}
              style={{
                position: "absolute",
                inset: 0,
                background: "#0d0d10",
                transform: `translateY(${panelBY}%)`,
                zIndex: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
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
                {/* Left: headline */}
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
                    <span style={{ color: "#CC0000" }}>Not just classes.</span>
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

                {/* Right: stats */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    borderLeft: "1px solid rgba(255,255,255,0.07)",
                    paddingLeft: 48,
                  }}
                >
                  {[
                    {
                      stat: "0",
                      label: "Applications required",
                      sub: "Walk in any week. No application, no waitlist, no rejection.",
                    },
                    {
                      stat: "7+",
                      label: "Active tracks",
                      sub: "Consulting, engineering, biotech, music tech, Web3, and growing.",
                    },
                    {
                      stat: "1",
                      label: "Semester to ship something real",
                      sub: "Not a class project. A live product or delivered client deck.",
                    },
                  ].map(({ stat, label, sub }, i) => (
                    <div
                      key={label}
                      style={{
                        padding: "28px 0",
                        borderBottom:
                          i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
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
                          color: "#52525b",
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
          </div>
        </div>

        {/* ── LEADERSHIP ── */}
        <section
          id="leadership"
          className="tts-section-pad"
          style={{ background: "#0c0c0f", padding: "80px 40px" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h2
              className="tts-slide"
              style={{
                fontSize: "clamp(28px, 4vw, 52px)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                marginBottom: 12,
              }}
            >
              Meet the presidents
            </h2>
            <p
              className="tts-fade"
              style={{
                fontSize: 15,
                color: "#a1a1aa",
                marginBottom: 40,
                transitionDelay: "0.08s",
              }}
            >
              Two USC students who wanted actual experience before they
              graduated. So they built it.
            </p>

            <div
              className="tts-leadership-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              {FOUNDERS.map((f, i) => (
                <div
                  key={f.id}
                  className={i === 0 ? "tts-from-left" : "tts-from-right"}
                  style={{ transitionDelay: `${i * 0.12}s` }}
                >
                  <div
                    style={{
                      background: "#111113",
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "4/5",
                        overflow: "hidden",
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
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to top, rgba(9,9,11,0.88) 0%, transparent 60%)",
                        }}
                      />
                      <div
                        style={{ position: "absolute", bottom: 20, left: 20 }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: f.accent,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          {f.role} · {f.focus}
                        </div>
                        <h3
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: "#fff",
                            letterSpacing: "-0.02em",
                            margin: 0,
                          }}
                        >
                          {f.name}
                        </h3>
                      </div>
                    </div>
                    <div style={{ padding: "20px 24px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 9,
                          marginBottom: 20,
                        }}
                      >
                        {f.owns.map((item) => (
                          <div
                            key={item}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 3,
                                height: 3,
                                borderRadius: "50%",
                                background: f.accent,
                                flexShrink: 0,
                                marginTop: 7,
                                opacity: 0.7,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                color: "#c4c4c8",
                                lineHeight: 1.6,
                              }}
                            >
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                      <a
                        href={f.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${f.name}, ${f.linkLabel} (opens in new tab)`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 13,
                          fontWeight: 600,
                          color: f.accent,
                          textDecoration: "none",
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.opacity =
                            "0.7";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.opacity =
                            "1";
                        }}
                      >
                        {f.linkLabel} <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Section CTA */}
            <div
              className="tts-fade"
              style={{
                marginTop: 48,
                textAlign: "center",
                transitionDelay: "0.2s",
              }}
            >
              <p style={{ fontSize: 14, color: "#a1a1aa", marginBottom: 16 }}>
                Questions? Reach either of them directly.
              </p>
              <a
                href="mailto:trojantechsolutions@gmail.com"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#CC0000",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(204,0,0,0.2)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(204,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "transparent";
                }}
              >
                <Mail size={13} /> trojantechsolutions@gmail.com
              </a>
            </div>
          </div>
        </section>

        {/* ── CABINET ── */}
        <section
          id="cabinet"
          className="tts-section-pad"
          style={{
            background: "#09090b",
            padding: "80px 40px",
            position: "relative",
            overflow: "hidden",
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
                className="tts-slide"
                style={{
                  fontSize: "clamp(28px, 4vw, 52px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  marginBottom: 12,
                }}
              >
                E-Board
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
                  className="tts-scale"
                  style={{
                    transitionDelay: `${i * 0.07}s`,
                    display: "block",
                    textDecoration: "none",
                    borderRadius: 16,
                    overflow: "hidden",
                    position: "relative",
                    aspectRatio: "3/4",
                    background: "#111113",
                    border: `1px solid rgba(255,255,255,0.07)`,
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
                      "rgba(255,255,255,0.07)";
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
                  background: "rgba(255,255,255,0.06)",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: "#52525b",
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
                  background: "rgba(255,255,255,0.06)",
                }}
              />
            </div>
          </div>
        </section>

        {/* ── ALUMNI / BOARD ── */}
        <section
          id="alumni"
          className="tts-section-pad"
          style={{
            background: "#0c0c0f",
            padding: "80px 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
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
              className="tts-perspective"
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
                className="tts-slide"
                style={{
                  fontSize: "clamp(28px, 4vw, 52px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  marginBottom: 12,
                }}
              >
                Alumni &amp; Advisors
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

            {/* Board of Advisors */}
            <div style={{ marginBottom: 48 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#52525b",
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
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 20,
                  maxWidth: 640,
                }}
              >
                {BOARD.map((person, i) => (
                  <div
                    key={person.name}
                    className={i === 0 ? "tts-from-left" : "tts-from-right"}
                    style={{ transitionDelay: `${i * 0.12}s` }}
                  >
                    <div
                      style={{
                        background: "#111113",
                        borderRadius: 16,
                        border: "1px solid rgba(255,204,0,0.1)",
                        overflow: "hidden",
                        transition: "border-color 0.2s, transform 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor =
                          "rgba(255,204,0,0.35)";
                        (e.currentTarget as HTMLDivElement).style.transform =
                          "translateY(-3px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor =
                          "rgba(255,204,0,0.1)";
                        (e.currentTarget as HTMLDivElement).style.transform =
                          "translateY(0)";
                      }}
                    >
                      {/* Photo */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "4/5",
                          overflow: "hidden",
                        }}
                      >
                        {person.headshot ? (
                          <Image
                            src={person.headshot}
                            alt={person.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            style={{
                              objectFit: "cover",
                              objectPosition: person.position ?? "center top",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background: "rgba(255,204,0,0.05)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 40,
                                fontWeight: 800,
                                color: "rgba(255,204,0,0.2)",
                              }}
                            >
                              {person.initials}
                            </span>
                          </div>
                        )}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to top, rgba(9,9,11,0.92) 0%, transparent 55%)",
                          }}
                        />
                        {/* Name pinned to bottom of photo */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 18,
                            left: 20,
                            right: 20,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#FFCC00",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              marginBottom: 4,
                            }}
                          >
                            {person.role} · {person.title}
                          </div>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: "#fff",
                              letterSpacing: "-0.02em",
                              lineHeight: 1.1,
                            }}
                          >
                            {person.name}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ padding: "16px 20px" }}>
                        <a
                          href={person.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${person.name} LinkedIn`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#FFCC00",
                            textDecoration: "none",
                            transition: "opacity 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            (
                              e.currentTarget as HTMLAnchorElement
                            ).style.opacity = "0.7";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.currentTarget as HTMLAnchorElement
                            ).style.opacity = "1";
                          }}
                        >
                          LinkedIn <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alumni placeholders */}
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#52525b",
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
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
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
                        background: "transparent",
                        borderRadius: 14,
                        border: "1px dashed rgba(255,255,255,0.07)",
                        padding: "20px",
                        opacity: 0.4,
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
                            border: "1px dashed rgba(255,255,255,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: 14, color: "#3f3f46" }}>
                            ?
                          </span>
                        </div>
                        <div>
                          <div
                            style={{
                              width: 80,
                              height: 10,
                              background: "rgba(255,255,255,0.07)",
                              borderRadius: 4,
                              marginBottom: 6,
                            }}
                          />
                          <div
                            style={{
                              width: 56,
                              height: 8,
                              background: "rgba(255,255,255,0.04)",
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
                              background: "rgba(255,255,255,0.02)",
                              border: "1px dashed rgba(255,255,255,0.06)",
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
                  color: "#3f3f46",
                  marginTop: 20,
                  fontStyle: "italic",
                }}
              >
                Alumni profiles coming soon. Reach out to add yours.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section
          id="faq"
          className="tts-section-pad"
          style={{ background: "#09090b", padding: "80px 40px" }}
        >
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ marginBottom: 48 }}>
              <h2
                className="tts-slide"
                style={{
                  fontSize: "clamp(28px, 4vw, 52px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                }}
              >
                Questions we always get
              </h2>
              <p
                className="tts-fade"
                style={{
                  fontSize: 15,
                  color: "#a1a1aa",
                  marginTop: 10,
                  transitionDelay: "0.1s",
                }}
              >
                Everything you need to decide if TTS is right for you.
              </p>
            </div>

            {/* Accordion */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {FAQ_ITEMS.map(({ q, a }, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={q}
                    className="tts-fade"
                    style={{
                      transitionDelay: `${i * 0.07}s`,
                      borderBottom:
                        i < FAQ_ITEMS.length - 1
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "none",
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${i}`}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        padding: "20px 24px",
                        background: isOpen ? "#111113" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isOpen)
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isOpen)
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: isOpen ? "#fff" : "#e4e4e7",
                          lineHeight: 1.4,
                        }}
                      >
                        {q}
                      </span>
                      <ChevronDown
                        size={16}
                        color={isOpen ? "#CC0000" : "#6b7280"}
                        style={{
                          flexShrink: 0,
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    </button>
                    <div
                      id={`faq-answer-${i}`}
                      className="tts-faq-answer"
                      role="region"
                      aria-label={q}
                      style={{
                        maxHeight: isOpen ? "300px" : "0px",
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          color: "#a1a1aa",
                          lineHeight: 1.7,
                          padding: "0 24px 20px",
                          margin: 0,
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            i === 0
                              ? a.replace(
                                  "@trojantechsolutions",
                                  `<a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" style="color:#CC0000;text-decoration:none;">@trojantechsolutions</a>`,
                                )
                              : a,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Still have questions */}
            <div
              className="tts-fade"
              style={{
                marginTop: 20,
                padding: "20px 24px",
                borderRadius: 12,
                background: "rgba(204,0,0,0.04)",
                border: "1px solid rgba(204,0,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                transitionDelay: "0.15s",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                Still have a question?
              </div>
              <a
                href="mailto:trojantechsolutions@gmail.com"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "rgba(204,0,0,0.1)",
                  border: "1px solid rgba(204,0,0,0.2)",
                  color: "#CC0000",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(204,0,0,0.18)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(204,0,0,0.1)";
                }}
              >
                <Mail size={13} /> Email us
              </a>
            </div>
          </div>
        </section>

        {/* ── JOIN ── */}
        <section
          id="join"
          className="tts-section-pad"
          style={{ background: "#0c0c0f", padding: "80px 40px" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              className="tts-join-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr minmax(300px, 420px)",
                gap: 80,
                alignItems: "start",
              }}
            >
              <div>
                <h2
                  className="tts-slide"
                  style={{
                    fontSize: "clamp(28px, 4vw, 52px)",
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    marginBottom: 20,
                  }}
                >
                  Start this
                  <br />
                  <span style={{ color: "#CC0000" }}>semester.</span>
                </h2>
                <p
                  className="tts-fade"
                  style={{
                    fontSize: 16,
                    color: "#d4d4d8",
                    lineHeight: 1.8,
                    marginBottom: 44,
                    maxWidth: 480,
                    transitionDelay: "0.08s",
                  }}
                >
                  Walk in any week. No application, no waitlist, no interview.
                  Pick a direction and start building, consulting, or learning
                  AI tools right away.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 48,
                    maxWidth: 420,
                  }}
                >
                  <a
                    href="/apply"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderRadius: 12,
                      background: "#CC0000",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      boxShadow: "0 4px 20px rgba(204,0,0,0.25)",
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
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        Join TTS
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.7)",
                          marginTop: 1,
                        }}
                      >
                        Short form · Any major, any year
                      </div>
                    </div>
                    <ArrowRight size={16} />
                  </a>

                  <a
                    href="/partner"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderRadius: 12,
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#e4e4e7",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "rgba(255,255,255,0.3)";
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "#fff";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "rgba(255,255,255,0.15)";
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "#e4e4e7";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "transparent";
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        Partner with TTS
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#a1a1aa",
                          marginTop: 1,
                        }}
                      >
                        Clients, sponsors, and organizations
                      </div>
                    </div>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>

              {/* Email capture */}
              <div
                className="tts-perspective"
                style={{ paddingTop: 8, transitionDelay: "0.15s" }}
              >
                <div
                  style={{
                    background: "#111113",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.07)",
                    padding: "32px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(204,0,0,0.1)",
                        border: "1px solid rgba(204,0,0,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Mail size={16} color="#CC0000" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#fff",
                          margin: 0,
                        }}
                      >
                        Get session updates
                      </h3>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#a1a1aa",
                          marginTop: 2,
                        }}
                      >
                        We email when a new session opens. That&apos;s it.
                      </div>
                    </div>
                  </div>

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
                            ).style.borderColor = "rgba(255,255,255,0.08)";
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
                          cursor: emailLoading ? "not-allowed" : "pointer",
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
                        We&apos;ll only use your email to notify you about TTS
                        sessions. No spam, ever.
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
                        style={{ margin: "0 auto 10px", display: "block" }}
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
        </section>

        {/* ── FOOTER ── */}
        <footer
          style={{
            background: "#060608",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            padding: "0 40px",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            {/* Brand */}
            <div style={{ flexShrink: 0 }}>
              <Image
                src="/ttslogo2026.png"
                alt="TTS"
                width={40}
                height={40}
                style={{ objectFit: "contain", display: "block" }}
              />
            </div>

            {/* Nav links */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
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
                    background: "none",
                    border: "none",
                    padding: "4px 8px",
                    fontSize: 12,
                    color: "#71717a",
                    cursor: "pointer",
                    transition: "color 0.15s",
                    whiteSpace: "nowrap",
                    minHeight: 44,
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#a1a1aa";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#71717a";
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Right: copyright + instagram */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 11, color: "#3f3f46" }}>
                © {new Date().getFullYear()} Trojan Technology Solutions
              </span>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11,
                  color: "#52525b",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#a1a1aa";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#52525b";
                }}
              >
                Instagram
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
