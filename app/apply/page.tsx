"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ArrowRight, Zap } from "lucide-react";

type Track = "Building" | "Consulting" | "Growing" | "Unsure";
type Year = "Freshman" | "Sophomore" | "Junior" | "Senior" | "Graduate";

const TRACKS: { id: Track; label: string; sub: string; color: string }[] = [
  {
    id: "Building",
    label: "Building",
    sub: "Ship products with AI",
    color: "#CC0000",
  },
  {
    id: "Consulting",
    label: "Consulting",
    sub: "Client work & strategy",
    color: "#FFCC00",
  },
  {
    id: "Growing",
    label: "Growing",
    sub: "Career & network",
    color: "#10b981",
  },
  {
    id: "Unsure",
    label: "Not sure yet",
    sub: "We'll help you pick",
    color: "#a1a1aa",
  },
];

const YEARS: Year[] = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#52525b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 8,
};

const pillBase: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.03)",
  color: "#71717a",
  fontSize: 13,
  fontWeight: 400,
  cursor: "pointer",
  transition: "all 0.15s",
  letterSpacing: "-0.01em",
};

export default function ApplyPage() {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    major: "",
    year: "" as Year | "",
    track: "" as Track | "",
    why: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigateHome = useCallback(() => {
    setExiting(true);
    setTimeout(() => router.push("/"), 360);
  }, [router]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.year || !form.track) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error: unknown };
        throw new Error(
          typeof data.error === "string" ? data.error : "Something went wrong.",
        );
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={exiting ? "tts-page-exit" : "tts-page-enter"}
      style={{
        minHeight: "100vh",
        background: "#09090b",
        fontFamily: "'Inter', -apple-system, sans-serif",
        display: "flex",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-animate { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @media (max-width: 768px) {
          .apply-split { flex-direction: column !important; }
          .apply-left { position: relative !important; height: auto !important; min-height: 240px !important; padding: 36px 24px !important; width: 100% !important; }
          .apply-right { padding: 36px 24px !important; }
        }
      `}</style>

      {/* Left column */}
      <div
        className="apply-split apply-left"
        style={{
          width: "40%",
          position: "sticky",
          top: 0,
          height: "100vh",
          background:
            "radial-gradient(ellipse at 20% 80%, rgba(204,0,0,0.13) 0%, transparent 58%), #09090b",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "56px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div>
          {/* Logo */}
          <button
            onClick={navigateHome}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 64,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#CC0000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              TTS
            </span>
          </button>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(48px, 6vw, 80px)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              marginBottom: 20,
            }}
          >
            Join TTS.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#71717a",
              lineHeight: 1.7,
              marginBottom: 52,
              maxWidth: 300,
            }}
          >
            USC&apos;s applied AI implementation lab. Every major, and we will teach you the stack.
          </p>

          {/* Value props — clean separator list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              {
                headline: "Ship in Week 1",
                sub: "Not the end of the semester",
              },
              {
                headline: "Real client work",
                sub: "Consulting track does live engagements",
              },
              {
                headline: "YC founders + operators",
                sub: "Speaker nights every month",
              },
            ].map(({ headline, sub }, i) => (
              <div
                key={headline}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "16px 0",
                  borderTop:
                    i === 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "rgba(204,0,0,0.15)",
                    border: "1px solid rgba(204,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <Check size={11} color="#CC0000" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#e4e4e7",
                      fontWeight: 600,
                      lineHeight: 1.3,
                      marginBottom: 2,
                    }}
                  >
                    {headline}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#52525b", lineHeight: 1.4 }}
                  >
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: "#3f3f46", letterSpacing: "0.02em" }}>
          Spring 2026 · Open enrollment
        </p>
      </div>

      {/* Right column */}
      <div
        className="apply-right"
        style={{
          flex: 1,
          padding: "56px 52px",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {/* Back link */}
        <button
          onClick={navigateHome}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#3f3f46",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            marginBottom: 52,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#a1a1aa";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#3f3f46";
          }}
        >
          <ArrowLeft size={14} /> Back to TTS
        </button>

        {submitted ? (
          <div
            className="form-animate"
            style={{
              textAlign: "center",
              paddingTop: 60,
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 28px",
              }}
            >
              <Check size={28} color="#10b981" />
            </div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.03em",
                marginBottom: 12,
              }}
            >
              You&apos;re in.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#71717a",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              We&apos;ll follow up within a few days. Follow us on Instagram{" "}
              <a
                href="https://instagram.com/trojantechsolutions"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#CC0000", textDecoration: "none" }}
              >
                @trojantechsolutions
              </a>{" "}
              to see what we&apos;re building.
            </p>
            <button
              onClick={navigateHome}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 20px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e4e4e7",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Back to home
            </button>
          </div>
        ) : (
          <div className="form-animate" style={{ maxWidth: 520 }}>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 40px)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                marginBottom: 8,
              }}
            >
              Tell us about yourself.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#52525b",
                lineHeight: 1.6,
                marginBottom: 40,
              }}
            >
              No application, no waitlist. Just show up.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 24 }}
            >
              {/* Name + Email */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Alex Chen"
                    style={inputStyle}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor =
                        "rgba(204,0,0,0.5)";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor =
                        "rgba(255,255,255,0.1)";
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>USC email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@usc.edu"
                    style={inputStyle}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor =
                        "rgba(204,0,0,0.5)";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor =
                        "rgba(255,255,255,0.1)";
                    }}
                  />
                </div>
              </div>

              {/* Major */}
              <div>
                <label style={labelStyle}>Major</label>
                <input
                  required
                  value={form.major}
                  onChange={(e) => set("major", e.target.value)}
                  placeholder="Any major welcome"
                  style={inputStyle}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor =
                      "rgba(204,0,0,0.5)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor =
                      "rgba(255,255,255,0.1)";
                  }}
                />
              </div>

              {/* Year — pills instead of native select */}
              <div>
                <label style={labelStyle}>Year</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {YEARS.map((y) => {
                    const selected = form.year === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => set("year", y)}
                        aria-pressed={selected}
                        style={{
                          ...pillBase,
                          background: selected
                            ? "rgba(204,0,0,0.12)"
                            : pillBase.background,
                          border: selected
                            ? "1px solid rgba(204,0,0,0.45)"
                            : pillBase.border,
                          color: selected ? "#fff" : pillBase.color,
                          fontWeight: selected ? 600 : pillBase.fontWeight,
                        }}
                        onMouseEnter={(e) => {
                          if (!selected)
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "rgba(255,255,255,0.2)";
                        }}
                        onMouseLeave={(e) => {
                          if (!selected)
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "rgba(255,255,255,0.1)";
                        }}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Track — 2x2 compact cards (4 items = clean grid, no orphan) */}
              <div>
                <label style={labelStyle}>Which track interests you?</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {TRACKS.map(({ id, label, sub, color }) => {
                    const selected = form.track === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => set("track", id)}
                        style={{
                          padding: "14px 16px",
                          borderRadius: 12,
                          background: selected
                            ? `${color}12`
                            : "rgba(255,255,255,0.02)",
                          border: selected
                            ? `1px solid ${color}45`
                            : "1px solid rgba(255,255,255,0.08)",
                          borderLeft: `3px solid ${selected ? color : "transparent"}`,
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!selected)
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "rgba(255,255,255,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          if (!selected)
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.cssText +=
                              `border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid transparent;`;
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: selected ? color : "#e4e4e7",
                            marginBottom: 2,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: selected ? "#a1a1aa" : "#52525b",
                          }}
                        >
                          {sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Why */}
              <div>
                <label style={labelStyle}>
                  Why do you want to join?{" "}
                  <span
                    style={{
                      color: "#3f3f46",
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (optional but helps)
                  </span>
                </label>
                <textarea
                  value={form.why}
                  onChange={(e) => set("why", e.target.value)}
                  placeholder="What are you trying to build, learn, or do before you graduate?"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLTextAreaElement).style.borderColor =
                      "rgba(204,0,0,0.5)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLTextAreaElement).style.borderColor =
                      "rgba(255,255,255,0.1)";
                  }}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  style={{ fontSize: 13, color: "#f87171", margin: 0 }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !form.track || !form.year}
                style={{
                  width: "100%",
                  height: 56,
                  borderRadius: 14,
                  background:
                    loading || !form.track || !form.year
                      ? "rgba(204,0,0,0.35)"
                      : "#CC0000",
                  border: "none",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  cursor:
                    loading || !form.track || !form.year
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "background 0.15s",
                  boxShadow:
                    loading || !form.track || !form.year
                      ? "none"
                      : "0 4px 24px rgba(204,0,0,0.25)",
                }}
                onMouseEnter={(e) => {
                  if (!loading && form.track && form.year)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#aa0000";
                }}
                onMouseLeave={(e) => {
                  if (!loading && form.track && form.year)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#CC0000";
                }}
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit interest <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p
                style={{
                  fontSize: 12,
                  color: "#3f3f46",
                  textAlign: "center",
                  margin: "-8px 0 0",
                }}
              >
                No spam. We&apos;ll only follow up about TTS sessions.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
