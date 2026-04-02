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
import { toast } from "sonner";

// ── Utilities ────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Gaze nav engine ──────────────────────────────────────────────────────────
const DWELL_MS = 1000;
let _navTarget: string | null = null;
let _navStart = 0;

function gazeNavUpdate(x: number, y: number, now: number) {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>("[data-gaze-nav]"),
  );
  let hit: string | null = null;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (
      x >= r.left - 28 &&
      x <= r.right + 28 &&
      y >= r.top - 28 &&
      y <= r.bottom + 28
    ) {
      hit = el.dataset.gazeNav ?? null;
      break;
    }
  }
  if (hit !== _navTarget) {
    _navTarget = hit;
    _navStart = now;
  }
  return {
    target: _navTarget,
    progress: _navTarget ? Math.min((now - _navStart) / DWELL_MS, 1) : 0,
  };
}

const ARC = 2 * Math.PI * 10;

// ── Data ─────────────────────────────────────────────────────────────────────
const TRACKS = [
  {
    num: "01",
    icon: Hammer,
    accent: "#CC0000",
    title: "Building",
    sub: "Product & Startups",
    tagline: "Ship something real this semester.",
    featured: false,
    items: [
      "Build apps and tools with AI",
      "Deploy live products with real users",
      "6-week arc from idea to shipped",
      "No CS background required",
    ],
    for: "Builders, entrepreneurs, anyone who wants to make something.",
  },
  {
    num: "02",
    icon: Briefcase,
    accent: "#FFCC00",
    title: "Consulting",
    sub: "Client Work & Strategy",
    tagline: "Solve real problems for real organizations.",
    featured: true,
    items: [
      "Live client engagements",
      "AI-first research and analysis",
      "Actual deliverables and presentations",
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
    tagline: "Use AI to get ahead in your own field.",
    featured: false,
    items: [
      "Apply AI directly to your major",
      "Access YC founders and operators",
      "Speaker series with working practitioners",
      "Get ahead before you graduate",
    ],
    for: "Pre-med, law, finance, architecture, any major.",
  },
];

const FOUNDERS = [
  {
    id: "caleb",
    name: "Caleb Newton",
    role: "Co-Founder",
    focus: "Entrepreneurship & Technology",
    headshot: "/img/caleb_shot.jpg",
    position: "center 15%",
    link: "https://calebnewton.me/",
    linkLabel: "Personal site",
    accent: "#CC0000",
    owns: [
      "Product curriculum and AI systems",
      "Website, GitHub, and tooling",
      "Startup relationships and builder culture",
      "Technical execution and live demos",
    ],
  },
  {
    id: "tyler",
    name: "Tyler Larsen",
    role: "Co-Founder",
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
    a: "Weekly sessions each semester. Follow us on Instagram (@trojantechsolutions) for this semester's schedule and location on campus.",
  },
  {
    q: "Do I need coding experience?",
    a: "No. Building has beginner-friendly entry points. Consulting and Growing require zero technical background.",
  },
  {
    q: "What's the time commitment?",
    a: "About 3-5 hours per week including the meeting, depending on which track you choose.",
  },
  {
    q: "Can I join mid-semester?",
    a: "Yes. There's no cut-off date. Join any week and we'll place you into an active project.",
  },
  {
    q: "Is there a cost?",
    a: "Never. TTS is completely free. No dues, no fees, no catch.",
  },
  {
    q: "I'm pre-med, law, or not a CS major. Is this for me?",
    a: "The Growing track is built for non-technical majors. AI is changing every field — we help you use it in yours.",
  },
];

const APPLICATION_URL =
  "mailto:trojantechsolutions@gmail.com?subject=TTS Application";
const PARTNERSHIP_URL =
  "mailto:trojantechsolutions@gmail.com?subject=Partnership Inquiry";
const INSTAGRAM_URL = "https://instagram.com/trojantechsolutions";

// ── Component ─────────────────────────────────────────────────────────────────
export default function TTSSite() {
  const [gazeActive, setGazeActive] = useState(false);
  const [gazeNav, setGazeNav] = useState<{
    target: string | null;
    progress: number;
  }>({ target: null, progress: 0 });
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [heroProgress, setHeroProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const gazeStartedRef = useRef(false);
  const dwellFiredRef = useRef(false);
  const gazeDotRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
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

  // Scroll: progress bar + hero progress + nav
  useEffect(() => {
    const handle = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      if (scrollY > 50) setScrolled(true);
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${Math.min(scrollY / (docH - winH), 1)})`;
      }
      if (heroSectionRef.current) {
        const sect = heroSectionRef.current;
        const scrolled = scrollY - sect.offsetTop;
        const maxScroll = sect.offsetHeight - winH;
        const prog = Math.max(0, Math.min(1, scrolled / maxScroll));
        setHeroProgress(prog);
        const pastShip =
          prog > 0.6 || scrollY > sect.offsetTop + sect.offsetHeight;
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

  // Active section tracking
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.3)
            setActiveSection(e.target.id);
        }),
      { threshold: 0.3 },
    );
    ["hero", "mission", "tracks", "leadership", "faq", "join"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // WebGazer loads on demand — not on page load
  const injectWebGazer = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).webgazer) {
          resolve();
          return;
        }
        const existing = document.querySelector('script[src*="webgazer"]');
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () =>
            reject(new Error("WebGazer failed to load")),
          );
          return;
        }
        const script = document.createElement("script");
        script.src = "https://webgazer.cs.brown.edu/webgazer.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("WebGazer failed to load"));
        document.head.appendChild(script);
      }),
    [],
  );

  const startGaze = useCallback(async () => {
    if (gazeStartedRef.current) return;
    try {
      toast.loading("Loading eye tracking...", { id: "gaze", duration: 20000 });
      await injectWebGazer();
      let waited = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      while (
        typeof (window as any).webgazer?.setGazeListener !== "function" &&
        waited < 4000
      ) {
        await new Promise((r) => setTimeout(r, 150));
        waited += 150;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wg = (window as any).webgazer;
      if (typeof wg?.setGazeListener !== "function") {
        toast.error("WebGazer did not initialize.", { id: "gaze" });
        return;
      }
      gazeStartedRef.current = true;
      toast.loading("Starting camera...", { id: "gaze", duration: 15000 });
      if (wg.params) wg.params.saveDataAcrossSessions = false;
      await wg
        .setGazeListener((data: { x: number; y: number } | null) => {
          if (!data) return;
          const now = performance.now();
          if (gazeDotRef.current) {
            gazeDotRef.current.style.transform = `translate(${data.x - 12}px, ${data.y - 12}px)`;
            gazeDotRef.current.style.opacity = "1";
          }
          const nav = gazeNavUpdate(data.x, data.y, now);
          setGazeNav(nav);
          if (nav.progress >= 1 && nav.target && !dwellFiredRef.current) {
            dwellFiredRef.current = true;
            scrollTo(nav.target);
            _navTarget = null;
            _navStart = 0;
            setTimeout(() => {
              dwellFiredRef.current = false;
            }, 1400);
          } else if (nav.progress < 0.8) {
            dwellFiredRef.current = false;
          }
        })
        .begin();
      wg.showVideo(false);
      wg.showFaceOverlay(false);
      wg.showFaceFeedbackBox(false);
      wg.showPredictionPoints(false);
      setGazeActive(true);
      toast.success(
        "Gaze tracking on. Look at a nav link for 1s to navigate.",
        {
          id: "gaze",
          duration: 5000,
        },
      );
    } catch (err) {
      gazeStartedRef.current = false;
      toast.error(
        `Eye tracking failed: ${err instanceof Error ? err.message : String(err)}`,
        { id: "gaze" },
      );
    }
  }, [scrollTo, injectWebGazer]);

  const word2Shown = heroProgress > 0.2;
  const word3Shown = heroProgress > 0.38;
  const wordsMorphing = heroProgress > 0.54;
  const heroContentShown = heroProgress > 0.68;

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
        @keyframes tts-scroll-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        .tts-scroll-hint { animation: tts-scroll-bounce 2s ease-in-out infinite; }
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

      {/* Progress bar */}
      <div
        ref={progressBarRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg,#CC0000,#FFCC00)",
          transformOrigin: "left",
          transform: "scaleX(0)",
          zIndex: 10000,
          pointerEvents: "none",
        }}
      />

      {/* Nav dots — includes faq */}
      <div
        className="tts-nav-dots"
        aria-hidden="true"
        style={{
          position: "fixed",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {(
          ["hero", "mission", "tracks", "leadership", "faq", "join"] as const
        ).map((id) => (
          <button
            key={id}
            aria-label={`Go to ${id}`}
            onClick={() => scrollTo(id)}
            style={{
              width: 32,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <div
              style={{
                width: activeSection === id ? 6 : 4,
                height: activeSection === id ? 6 : 4,
                borderRadius: "50%",
                background:
                  activeSection === id ? "#CC0000" : "rgba(255,255,255,0.2)",
                transition: "all 0.2s",
              }}
            />
          </button>
        ))}
      </div>

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
        ref={gazeDotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "2px solid #FFCC00",
          background: "rgba(255,204,0,0.08)",
          pointerEvents: "none",
          zIndex: 9001,
          opacity: 0,
          transition: "opacity 0.2s",
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
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                width: "100%",
                padding: "0 40px",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Badge — semantic, not aria-hidden */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "4px 12px",
                  borderRadius: 100,
                  background: "rgba(204,0,0,0.08)",
                  border: "1px solid rgba(204,0,0,0.2)",
                  marginBottom: 40,
                  opacity: word3Shown && !wordsMorphing ? 1 : 0,
                  transform:
                    word3Shown && !wordsMorphing
                      ? "translateY(0)"
                      : "translateY(8px)",
                  transition:
                    "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#CC0000",
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#CC0000",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  USC Student Organization · Founded 2023
                </span>
              </div>

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
                      left: 0,
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
                      left: 0,
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
                      left: 0,
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

              {/* Content block */}
              <div
                style={{
                  marginTop: 48,
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
                  We build products you can actually ship while you&apos;re
                  still a student.
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#a1a1aa",
                    marginBottom: 44,
                  }}
                >
                  AI tools. Client work. Three tracks. Any major.
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
                  <button
                    onClick={() => scrollTo("join")}
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
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      boxShadow: "0 4px 24px rgba(204,0,0,0.3)",
                      minHeight: 44,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#aa0000";
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#CC0000";
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(0)";
                    }}
                  >
                    Apply Now <ArrowRight size={15} />
                  </button>
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

                {/* Stats */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 48,
                    paddingTop: 32,
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    flexWrap: "wrap",
                    rowGap: 24,
                  }}
                >
                  {[
                    ["3", "Active tracks"],
                    ["2023", "Founded at USC"],
                    ["Any major", "No prerequisites"],
                  ].map(([val, label]) => (
                    <div key={label}>
                      <div
                        style={{
                          fontSize: 36,
                          fontWeight: 800,
                          color: "#fff",
                          letterSpacing: "-0.03em",
                          lineHeight: 1,
                        }}
                      >
                        {val}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#a1a1aa",
                          marginTop: 5,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scroll hint */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: 40,
                left: "50%",
                transform: "translateX(-50%)",
                opacity: scrolled || heroProgress > 0.1 ? 0 : 1,
                transition: "opacity 0.6s ease",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Scroll
              </span>
              <div
                className="tts-scroll-hint"
                style={{
                  width: 28,
                  height: 28,
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
              </div>
            </div>
          </div>
        </section>

        {/* ── MISSION ── */}
        <section
          id="mission"
          className="tts-section-pad"
          style={{ background: "#0c0c0f", padding: "120px 40px" }}
        >
          <div
            className="tts-mission-grid"
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
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
                Make something real
                <br />
                <span style={{ color: "#CC0000" }}>before you graduate.</span>
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
                TTS is USC&apos;s club for students who want actual experience
                before they graduate. Not another resume line. Work that ships,
                advises clients, or lands the opportunity.
              </p>
              <p
                className="tts-fade"
                style={{
                  fontSize: 16,
                  color: "#d4d4d8",
                  lineHeight: 1.8,
                  marginBottom: 44,
                  transitionDelay: "0.12s",
                }}
              >
                The standard here is shipping, consulting, and growing. Not
                planning to.
              </p>
              <div
                className="tts-fade"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  transitionDelay: "0.18s",
                }}
              >
                {[
                  { c: "#CC0000", t: "Ship products that actually work" },
                  { c: "#FFCC00", t: "Advise clients this semester" },
                  { c: "#10b981", t: "Open to every major, every year" },
                  { c: "#CC0000", t: "Intensity with purpose, not burnout" },
                ].map(({ c, t }) => (
                  <div
                    key={t}
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <Check
                      size={14}
                      color={c}
                      strokeWidth={2.5}
                      style={{ flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 15, color: "#d4d4d8" }}>{t}</span>
                  </div>
                ))}
              </div>
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
          style={{ background: "#09090b", padding: "120px 40px" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ marginBottom: 72 }}>
              <h2
                className="tts-slide"
                style={{
                  fontSize: "clamp(28px, 4vw, 52px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                }}
              >
                Pick your track
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
                Not sure? You can be in multiple tracks at once. Most members
                are.
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
                          background: featured ? "#131208" : "#111113",
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
                              color: accent,
                              opacity: 0.12,
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
                              background: hexToRgba(accent, 0.08),
                              border: `1px solid ${hexToRgba(accent, 0.2)}`,
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
                              color: "#6b7280",
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

        {/* ── LEADERSHIP ── */}
        <section
          id="leadership"
          className="tts-section-pad"
          style={{ background: "#0c0c0f", padding: "120px 40px" }}
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
              Meet the founders
            </h2>
            <p
              className="tts-fade"
              style={{
                fontSize: 15,
                color: "#a1a1aa",
                marginBottom: 56,
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
                        aria-label={`${f.name} — ${f.linkLabel} (opens in new tab)`}
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

        {/* ── FAQ ── */}
        <section
          id="faq"
          className="tts-section-pad"
          style={{ background: "#09090b", padding: "120px 40px" }}
        >
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ marginBottom: 64 }}>
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
              className="tts-fade"
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
                    style={{
                      borderBottom:
                        i < FAQ_ITEMS.length - 1
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "none",
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
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
                      className="tts-faq-answer"
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
          style={{ background: "#0c0c0f", padding: "120px 40px" }}
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
                  Walk in any week. Pick a track. Work on a live project from
                  day one. No application form, no waitlist, no experience
                  required.
                </p>

                <div
                  className="tts-fade"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 48,
                    maxWidth: 420,
                    transitionDelay: "0.14s",
                  }}
                >
                  <a
                    href={APPLICATION_URL}
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
                        Send us a message to join
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.7)",
                          marginTop: 1,
                        }}
                      >
                        Opens your email · Any major, any year
                      </div>
                    </div>
                    <ArrowRight size={16} />
                  </a>

                  <a
                    href={PARTNERSHIP_URL}
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

                <div
                  className="tts-fade"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    transitionDelay: "0.22s",
                  }}
                >
                  {[
                    "Free to join, always — no dues or fees",
                    "Open to all USC majors and class years",
                    "No prior experience or applications",
                    "Live project work from your first week",
                  ].map((item) => (
                    <div
                      key={item}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Check
                        size={14}
                        color="#CC0000"
                        strokeWidth={2.5}
                        style={{ flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 14, color: "#a1a1aa" }}>
                        {item}
                      </span>
                    </div>
                  ))}
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
                        Stay in the loop
                      </h3>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#a1a1aa",
                          marginTop: 2,
                        }}
                      >
                        Get notified when the next session starts.
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
          className="tts-footer-wrap"
          style={{
            background: "#060608",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            padding: "48px 40px 32px",
          }}
        >
          <div
            className="tts-footer-cols"
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 40,
              marginBottom: 40,
            }}
          >
            {/* Brand */}
            <div style={{ maxWidth: 280 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: "rgba(204,0,0,0.08)",
                    border: "1px solid rgba(204,0,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Zap size={10} color="#CC0000" />
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    color: "#fff",
                    fontSize: 13,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Trojan Technology Solutions
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                USC&apos;s builder club. Founded 2023. Any major welcome.
              </p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TTS on Instagram (@trojantechsolutions)"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "#a1a1aa",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#a1a1aa";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "rgba(255,255,255,0.08)";
                }}
              >
                <ExternalLink size={12} />
                Instagram · @trojantechsolutions
              </a>
            </div>

            {/* Navigation */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Navigation
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {["Mission", "Tracks", "Team", "FAQ", "Join"].map((label) => (
                  <button
                    key={label}
                    onClick={() => scrollTo(label.toLowerCase())}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      fontSize: 13,
                      color: "#a1a1aa",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#a1a1aa";
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Contact
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[
                  { label: "Join as a student", href: APPLICATION_URL },
                  { label: "Partner with TTS", href: PARTNERSHIP_URL },
                  {
                    label: "trojantechsolutions@gmail.com",
                    href: "mailto:trojantechsolutions@gmail.com",
                  },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    style={{
                      fontSize: 13,
                      color: "#a1a1aa",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "#a1a1aa";
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              © {new Date().getFullYear()} Trojan Technology Solutions ·
              University of Southern California
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                color: "#6b7280",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#a1a1aa";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#6b7280";
              }}
            >
              Instagram
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
