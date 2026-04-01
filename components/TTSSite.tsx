"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import {
  Eye,
  Zap,
  ArrowRight,
  ChevronDown,
  Code2,
  Briefcase,
  Users,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

// ── Gaze nav engine (module-level) ─────────────────────────────────────────
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

export default function TTSSite() {
  const [gazeActive, setGazeActive] = useState(false);
  const [gazeNav, setGazeNav] = useState<{
    target: string | null;
    progress: number;
  }>({ target: null, progress: 0 });
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const gazeStartedRef = useRef(false);
  const dwellFiredRef = useRef(false);
  const gazeDotRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
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

  // Scroll-aware nav
  useEffect(() => {
    const handle = () => {
      const scrollY = window.scrollY;
      const nearBottom =
        scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 200;
      setNavVisible(scrollY > 80 && !nearBottom);
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("tts-visible");
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".tts-fade").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const startGaze = useCallback(async () => {
    if (gazeStartedRef.current) return;
    let waited = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    while (!(window as any).webgazer && waited < 8000) {
      await new Promise((r) => setTimeout(r, 200));
      waited += 200;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wg = (window as any).webgazer;
    if (!wg) {
      toast.error("WebGazer failed to load. Try refreshing.", { id: "gaze" });
      return;
    }
    // Guard: wait for internal methods to be available (object exists before fully init'd)
    let methodWait = 0;
    while (typeof wg.setGazeListener !== "function" && methodWait < 3000) {
      await new Promise((r) => setTimeout(r, 100));
      methodWait += 100;
    }
    if (typeof wg.setGazeListener !== "function") {
      toast.error("WebGazer did not initialize correctly. Try refreshing.", {
        id: "gaze",
      });
      return;
    }
    try {
      gazeStartedRef.current = true;
      toast.loading("Starting camera…", { id: "gaze", duration: 15000 });

      // Disable localStorage to avoid cross-session init errors
      if (wg.params) wg.params.saveDataAcrossSessions = false;

      // Chained API matches the Brown CDN version of WebGazer
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
        "Eye tracking on — look at a nav link for 1 sec to navigate",
        { id: "gaze", duration: 5000 },
      );
    } catch (err) {
      console.error("[WebGazer]", err);
      gazeStartedRef.current = false;
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Eye tracking failed: ${msg}`, { id: "gaze" });
    }
  }, [scrollTo]);

  const NAV_LINKS = [
    { label: "About", id: "about" },
    { label: "Tracks", id: "tracks" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Leadership", id: "leadership" },
  ] as const;

  return (
    <>
      <Script
        src="https://webgazer.cs.brown.edu/webgazer.js"
        strategy="afterInteractive"
      />

      {/* Cursor dot */}
      <div
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
          willChange: "transform",
        }}
      />
      {/* Cursor ring */}
      <div
        ref={cursorRingRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          border: "1.5px solid rgba(204,0,0,0.3)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          willChange: "transform",
        }}
      />
      {/* Gaze indicator */}
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
          willChange: "transform",
        }}
      />

      <div
        style={{ cursor: "none", background: "#09090b", minHeight: "100vh" }}
      >
        {/* ── NAV ── scroll-aware: hidden at top, slides in after 80px */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background: "rgba(9,9,11,0.9)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            transform: navVisible ? "translateY(0)" : "translateY(-100%)",
            opacity: navVisible ? 1 : 0,
            transition: "transform 0.3s ease, opacity 0.3s ease",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "0 24px",
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(204,0,0,0.15)",
                  border: "1px solid rgba(204,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={13} color="#CC0000" />
              </div>
              <span
                style={{
                  fontWeight: 700,
                  color: "#fff",
                  fontSize: 14,
                  letterSpacing: "-0.01em",
                }}
              >
                TTS
              </span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {NAV_LINKS.map(({ label, id }) => {
                const isTarget = gazeNav.target === id;
                return (
                  <button
                    key={id}
                    data-gaze-nav={id}
                    onClick={() => scrollTo(id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#a1a1aa",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.color =
                        "#fff")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.color =
                        "#a1a1aa")
                    }
                  >
                    {gazeActive && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        style={{
                          transform: "rotate(-90deg)",
                          opacity: isTarget ? 1 : 0,
                          transition: "opacity 0.2s",
                          flexShrink: 0,
                        }}
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="rgba(255,204,0,0.15)"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="#FFCC00"
                          strokeWidth="2.5"
                          strokeDasharray={`${gazeNav.progress * ARC} ${ARC}`}
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Eye Nav — icon only so Apply owns the last position (Serial Position Effect) */}
              {!gazeActive ? (
                <button
                  onClick={startGaze}
                  aria-label="Enable eye tracking navigation"
                  title="Eye tracking navigation"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    color: "#CC0000",
                    background: "rgba(204,0,0,0.1)",
                    border: "1px solid rgba(204,0,0,0.25)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(204,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(204,0,0,0.1)";
                  }}
                >
                  <Eye size={15} />
                </button>
              ) : (
                <div
                  aria-label="Eye tracking active"
                  title="Eye tracking active"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    color: "#FFCC00",
                    background: "rgba(255,204,0,0.08)",
                    border: "1px solid rgba(255,204,0,0.2)",
                  }}
                >
                  <Eye size={15} />
                </div>
              )}
              <button
                onClick={() => scrollTo("join")}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  background: "#CC0000",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(204,0,0,0.35)",
                  transition: "all 0.15s",
                  minWidth: 72,
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
                Apply
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            paddingTop: 60,
            background: "#09090b",
          }}
        >
          {/* Red glow */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -200,
              left: "50%",
              transform: "translateX(-50%)",
              width: 800,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(204,0,0,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          {/* Dot grid */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div
            style={{
              textAlign: "center",
              maxWidth: 900,
              margin: "0 auto",
              padding: "0 24px",
              position: "relative",
            }}
          >
            <div
              className="tts-fade"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 100,
                background: "rgba(204,0,0,0.1)",
                border: "1px solid rgba(204,0,0,0.25)",
                color: "#CC0000",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 40,
              }}
            >
              USC Builder Club · Spring 2026
            </div>

            <h1
              className="tts-fade"
              style={{
                fontSize: "clamp(56px, 10vw, 120px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.92,
                margin: "0 0 32px",
                color: "#fff",
              }}
            >
              Build.
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #CC0000 0%, #FF4444 40%, #FFCC00 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Solve.
              </span>
              <br />
              Ship.
            </h1>

            <p
              className="tts-fade"
              style={{
                fontSize: 18,
                color: "#71717a",
                maxWidth: 560,
                margin: "0 auto 48px",
                lineHeight: 1.7,
              }}
            >
              Trojan Technology Solutions is USC&apos;s hands-on tech club. No
              prerequisites. No gatekeeping. Just people who want to ship real
              things.
            </p>

            <div
              className="tts-fade"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => scrollTo("join")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 28px",
                  borderRadius: 14,
                  background: "#CC0000",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(204,0,0,0.4)",
                  transition: "all 0.15s",
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
                Apply Now <ArrowRight size={16} />
              </button>
              <button
                onClick={() => scrollTo("about")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 28px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  color: "#a1a1aa",
                  fontSize: 15,
                  fontWeight: 500,
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#a1a1aa";
                }}
              >
                Learn More <ChevronDown size={16} />
              </button>
            </div>

            {/* Stats */}
            <div
              className="tts-fade"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 48,
                marginTop: 80,
              }}
            >
              {[
                ["40–60", "Members"],
                ["3", "Tracks"],
                ["Real clients", "Day 1"],
              ].map(([num, label]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: "#FFCC00",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {num}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#52525b",
                      marginTop: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              color: "#3f3f46",
            }}
          >
            <ChevronDown size={20} className="animate-bounce" />
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section
          id="about"
          style={{ background: "#0d0d10", padding: "120px 24px" }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            {/* Manifesto row */}
            <div className="tts-fade" style={{ marginBottom: 80 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 24,
                    background: "#CC0000",
                    borderRadius: 2,
                    marginTop: 4,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#CC0000",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  What We Are
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(36px, 5vw, 64px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                  maxWidth: 800,
                  margin: "0 0 24px",
                }}
              >
                The club that exists to make you dangerous.
              </h2>
              <p
                style={{
                  fontSize: 17,
                  color: "#71717a",
                  maxWidth: 600,
                  lineHeight: 1.75,
                }}
              >
                Not another resume-padding org. Not another AI club that
                doesn&apos;t ship anything. TTS is where you come to actually
                build — products, client work, and career leverage — in one
                semester.
              </p>
            </div>

            {/* 3 pillars — different layout, visible cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {[
                {
                  Icon: Code2,
                  accent: "#CC0000",
                  accentDim: "rgba(204,0,0,0.1)",
                  num: "01",
                  title: "Startup Studio",
                  body: "Build apps with AI, deploy live products, find real users — all in one semester. 6-week arcs from idea to shipped.",
                },
                {
                  Icon: Briefcase,
                  accent: "#FFCC00",
                  accentDim: "rgba(255,204,0,0.1)",
                  num: "02",
                  title: "Consulting Arm",
                  body: "Solve real client problems with AI-first workflows. Real scope. Real deliverables. Strategic reps before you graduate.",
                },
                {
                  Icon: Users,
                  accent: "#fff",
                  accentDim: "rgba(255,255,255,0.07)",
                  num: "03",
                  title: "Builder Community",
                  body: "Anyone can join — no technical background required. Engineering, business, pre-med, design — all welcome.",
                },
              ].map(({ Icon, accent, accentDim, num, title, body }) => (
                <div
                  key={num}
                  className="tts-fade"
                  style={{
                    background: "#111113",
                    borderRadius: 20,
                    border: "1px solid #1f1f23",
                    padding: "32px 28px",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform =
                      "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform =
                      "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 28,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: accentDim,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={20} color={accent} />
                    </div>
                    <span
                      style={{
                        fontSize: 48,
                        fontWeight: 900,
                        color: "rgba(255,255,255,0.04)",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {num}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 12,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{ fontSize: 14, color: "#52525b", lineHeight: 1.7 }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRACKS ── */}
        <section
          id="tracks"
          style={{ background: "#09090b", padding: "120px 24px" }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="tts-fade" style={{ marginBottom: 80 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 24,
                    background: "#FFCC00",
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#FFCC00",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Pick Your Path
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  marginBottom: 16,
                }}
              >
                Three tracks. One community.
              </h2>
              <p style={{ fontSize: 16, color: "#52525b" }}>
                You can switch. Most people end up doing two.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                {
                  num: "01",
                  accent: "#CC0000",
                  title: "Vibe Coding",
                  sub: "Product & Startups",
                  items: [
                    "Build apps and tools with AI",
                    "Deploy live products this semester",
                    "Find real users and iterate",
                    "6-week arc to a shipped product",
                  ],
                },
                {
                  num: "02",
                  accent: "#FFCC00",
                  title: "Consulting",
                  sub: "Client Work & Strategy",
                  items: [
                    "Solve real problems for real clients",
                    "AI-first research and analysis",
                    "Build and present deliverables",
                    "Get strategic reps before you graduate",
                  ],
                },
                {
                  num: "03",
                  accent: "#a1a1aa",
                  title: "Community",
                  sub: "Career Acceleration",
                  items: [
                    "Apply AI directly to your major",
                    "Build your network intentionally",
                    "Speaker series with real operators",
                    "Career positioning that actually works",
                  ],
                },
              ].map(({ num, accent, title, sub, items }) => (
                <div
                  key={num}
                  className="tts-fade"
                  style={{
                    background: "#111113",
                    borderRadius: 20,
                    border: "1px solid #1f1f23",
                    padding: "36px 36px",
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 1fr",
                    gap: 40,
                    alignItems: "center",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.transform =
                      "translateY(-3px)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.transform =
                      "translateY(0)")
                  }
                >
                  <div>
                    <div
                      style={{
                        fontSize: 56,
                        fontWeight: 900,
                        color: accent,
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                        opacity: 0.3,
                      }}
                    >
                      {num}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: accent,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      {sub}
                    </div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {title}
                    </div>
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px 16px",
                    }}
                  >
                    {items.map((item) => (
                      <li
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          fontSize: 13,
                          color: "#71717a",
                        }}
                      >
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: accent,
                            flexShrink: 0,
                            marginTop: 5,
                          }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          id="how-it-works"
          style={{ background: "#0d0d10", padding: "120px 24px" }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="tts-fade" style={{ marginBottom: 80 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 24,
                    background: "#CC0000",
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#CC0000",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Weekly Cadence
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  marginBottom: 16,
                }}
              >
                How TTS actually runs
              </h2>
              <p style={{ fontSize: 16, color: "#52525b" }}>
                Consistent rhythm. Real output. No fluff.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {[
                {
                  accent: "#CC0000",
                  day: "Tuesday",
                  time: "6–7pm",
                  label: "General Meeting",
                  desc: "Full club. Core lesson or live demo, track breakouts, accountability check-in, and goals for the week.",
                },
                {
                  accent: "#FFCC00",
                  day: "Tue – Fri",
                  time: "Open",
                  label: "Workspace Sessions",
                  desc: "Co-working. Build, get mentorship, or help onboard someone. Always staffed by e-board.",
                },
                {
                  accent: "#52525b",
                  day: "Sunday",
                  time: "E-board only",
                  label: "Leadership Sync",
                  desc: "Review wins and problems, plan Monday, assign owners, protect founder health.",
                },
              ].map(({ accent, day, time, label, desc }) => (
                <div
                  key={day}
                  className="tts-fade"
                  style={{
                    background: "#111113",
                    borderRadius: 20,
                    border: "1px solid #1f1f23",
                    padding: "32px 28px",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.transform =
                      "translateY(-3px)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.transform =
                      "translateY(0)")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: accent,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {day}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#3f3f46",
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "#1a1a1e",
                      }}
                    >
                      {time}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 12,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {label}
                  </h3>
                  <p
                    style={{ fontSize: 14, color: "#52525b", lineHeight: 1.7 }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Week 1 callout */}
            <div
              className="tts-fade"
              style={{
                background: "#111113",
                borderRadius: 20,
                border: "1px solid rgba(204,0,0,0.3)",
                padding: "40px 44px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#CC0000",
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#CC0000",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Week 1 Meeting
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  "What TTS is and who it's for",
                  "Why AI changes everything before you graduate",
                  "Pick your track — switch anytime",
                  "Live vibe coding demo: ship something in 20 min",
                  "Join Discord, meet your cohort",
                  "Leave with a clear next action",
                ].map((item, i) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#FFCC00",
                        flexShrink: 0,
                        marginTop: 2,
                        minWidth: 20,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        color: "#a1a1aa",
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
        </section>

        {/* ── LEADERSHIP ── */}
        <section
          id="leadership"
          style={{ background: "#09090b", padding: "120px 24px" }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="tts-fade" style={{ marginBottom: 80 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 24,
                    background: "#FFCC00",
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#FFCC00",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Founders
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                }}
              >
                Built by builders
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 16,
                maxWidth: 800,
              }}
            >
              {[
                {
                  initials: "CN",
                  accent: "#CC0000",
                  accentDim: "rgba(204,0,0,0.12)",
                  name: "Caleb Newton",
                  role: "Entrepreneurship Lead",
                  owns: [
                    "Product curriculum & technical systems",
                    "Website, GitHub, and tooling",
                    "Startup-facing relationships",
                    "Builder culture and live demos",
                  ],
                },
                {
                  initials: "TL",
                  accent: "#FFCC00",
                  accentDim: "rgba(255,204,0,0.1)",
                  name: "Tyler Larsen",
                  role: "Consulting Lead",
                  owns: [
                    "Consulting curriculum & client pipeline",
                    "E-board building and people ops",
                    "Partnerships & cross-club ecosystem",
                    "Community culture and recruiting",
                  ],
                },
              ].map(({ initials, accent, accentDim, name, role, owns }) => (
                <div
                  key={name}
                  className="tts-fade"
                  style={{
                    background: "#111113",
                    borderRadius: 20,
                    border: "1px solid #1f1f23",
                    padding: "36px 32px",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.transform =
                      "translateY(-3px)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.transform =
                      "translateY(0)")
                  }
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: accentDim,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 24,
                    }}
                  >
                    <span
                      style={{ fontSize: 20, fontWeight: 900, color: accent }}
                    >
                      {initials}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: accent,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    {role}
                  </div>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.02em",
                      marginBottom: 24,
                    }}
                  >
                    {name}
                  </h3>
                  <ul
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {owns.map((item) => (
                      <li
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          fontSize: 13,
                          color: "#52525b",
                        }}
                      >
                        <div
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "#3f3f46",
                            flexShrink: 0,
                            marginTop: 6,
                          }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── JOIN ── */}
        <section
          id="join"
          style={{ background: "#0d0d10", padding: "120px 24px" }}
        >
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <div
              className="tts-fade"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 100,
                background: "rgba(204,0,0,0.1)",
                border: "1px solid rgba(204,0,0,0.25)",
                color: "#CC0000",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 32,
              }}
            >
              Spring 2026
            </div>
            <h2
              className="tts-fade"
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: 24,
              }}
            >
              Ready to{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #CC0000 0%, #FFCC00 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                build?
              </span>
            </h2>
            <p
              className="tts-fade"
              style={{
                fontSize: 16,
                color: "#52525b",
                lineHeight: 1.75,
                marginBottom: 48,
              }}
            >
              Show up. Try things before you feel ready. Help each other. No
              ego. If you&apos;re stuck, ask. If you learn something, share it.
            </p>

            {/* Goal-Gradient: show the 3-step path so users see how close they are */}
            <div
              className="tts-fade"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
                marginBottom: 40,
              }}
            >
              {[
                { num: "01", label: "Join Discord" },
                { num: "02", label: "Show up Week 3" },
                { num: "03", label: "Pick your track" },
              ].map(({ num, label }, i) => (
                <div
                  key={num}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: i === 0 ? "#CC0000" : "#1f1f23",
                        border: `1px solid ${i === 0 ? "#CC0000" : "#2a2a2e"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                        fontSize: 11,
                        fontWeight: 800,
                        color: i === 0 ? "#fff" : "#3f3f46",
                      }}
                    >
                      {num}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: i === 0 ? "#a1a1aa" : "#3f3f46",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                  {i < 2 && (
                    <div
                      style={{
                        width: 48,
                        height: 1,
                        background: "#1f1f23",
                        marginBottom: 24,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div
              className="tts-fade"
              style={{
                background: "#111113",
                borderRadius: 24,
                border: "1px solid #1f1f23",
                padding: "32px",
              }}
            >
              <button
                onClick={() => window.open("https://discord.gg/tts", "_blank")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: "100%",
                  padding: "16px",
                  borderRadius: 14,
                  background: "#CC0000",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(204,0,0,0.35)",
                  transition: "all 0.15s",
                  marginBottom: 16,
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
                <Globe size={16} /> Join Discord
              </button>

              {/* Zeigarnik: email capture for users not ready to commit */}
              <div
                style={{
                  borderTop: "1px solid #1f1f23",
                  paddingTop: 16,
                  marginBottom: 24,
                }}
              >
                {!emailSubmitted ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (email.trim()) setEmailSubmitted(true);
                    }}
                    style={{ display: "flex", gap: 8 }}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Not ready yet? Leave your email"
                      required
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "#0d0d10",
                        border: "1px solid #2a2a2e",
                        color: "#fff",
                        fontSize: 13,
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        (
                          e.currentTarget as HTMLInputElement
                        ).style.borderColor = "rgba(204,0,0,0.5)";
                      }}
                      onBlur={(e) => {
                        (
                          e.currentTarget as HTMLInputElement
                        ).style.borderColor = "#2a2a2e";
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: "10px 16px",
                        borderRadius: 10,
                        background: "rgba(204,0,0,0.12)",
                        border: "1px solid rgba(204,0,0,0.25)",
                        color: "#CC0000",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(204,0,0,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(204,0,0,0.12)";
                      }}
                    >
                      Notify me
                    </button>
                  </form>
                ) : (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "rgba(255,204,0,0.06)",
                      border: "1px solid rgba(255,204,0,0.15)",
                      color: "#FFCC00",
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    You&apos;re on the list. See you Week 3.
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                  textAlign: "center",
                }}
              >
                {[
                  ["40–60", "Target members"],
                  ["3 tracks", "To choose from"],
                  ["Week 3", "First meeting"],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div
                      style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}
                    >
                      {val}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#52525b", marginTop: 3 }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          style={{
            background: "#09090b",
            borderTop: "1px solid #1a1a1e",
            padding: "32px 24px",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#52525b",
                fontSize: 13,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  background: "rgba(204,0,0,0.1)",
                  border: "1px solid rgba(204,0,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={10} color="#CC0000" />
              </div>
              Trojan Technology Solutions · USC
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#52525b",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Build. Solve. Ship.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
