"use client";

import { useState } from "react";
import { ArrowLeft, Check, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

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
  fontSize: 12,
  fontWeight: 600,
  color: "#71717a",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 8,
};

export default function ApplyPage() {
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
      className="tts-page-enter"
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
        .form-animate-delay { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        @media (max-width: 768px) {
          .apply-split { flex-direction: column !important; }
          .apply-left { position: relative !important; height: auto !important; min-height: 260px !important; padding: 40px 24px !important; }
          .apply-right { padding: 40px 24px !important; }
        }
        select option { background: #111113; }
      `}</style>

      {/* Left column */}
      <div
        className="apply-left"
        style={{
          width: "42%",
          position: "sticky",
          top: 0,
          height: "100vh",
          background:
            "radial-gradient(ellipse at 20% 80%, rgba(204,0,0,0.12) 0%, transparent 60%), #09090b",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "56px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              marginBottom: 56,
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
          </Link>

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
              fontSize: 16,
              color: "#a1a1aa",
              lineHeight: 1.6,
              marginBottom: 48,
              maxWidth: 320,
            }}
          >
            USC&apos;s AI builder club. No prerequisites. No gatekeeping.
          </p>

          {/* Reason pills */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              "Ship a live product in Week 1",
              "Real client work with Consulting track",
              "Access to YC founders and operators",
            ].map((reason) => (
              <div
                key={reason}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
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
                  }}
                >
                  <Check size={11} color="#CC0000" />
                </div>
                <span
                  style={{ fontSize: 14, color: "#d4d4d8", lineHeight: 1.4 }}
                >
                  {reason}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: 13, color: "#52525b", marginTop: 40 }}>
          Spring 2026 · Open enrollment
        </p>
      </div>

      {/* Right column */}
      <div
        className="apply-right"
        style={{
          flex: 1,
          padding: "60px 48px",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#52525b",
            textDecoration: "none",
            marginBottom: 48,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#a1a1aa";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#52525b";
          }}
        >
          <ArrowLeft size={14} /> Back to TTS
        </Link>

        {submitted ? (
          <div
            className="form-animate"
            style={{
              textAlign: "center",
              paddingTop: 40,
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
              We got it.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#a1a1aa",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              We&apos;ll follow up at your email within a few days. In the
              meantime, follow us on Instagram{" "}
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
            <Link
              href="/"
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
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              Back to home
            </Link>
          </div>
        ) : (
          <div className="form-animate" style={{ maxWidth: 540 }}>
            {/* Form header */}
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#52525b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              No application required — just submit your interest
            </p>
            <h2
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: 10,
              }}
            >
              Tell us about yourself
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#71717a",
                lineHeight: 1.6,
                marginBottom: 36,
              }}
            >
              Show up, pick a track, and ship something real.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 22 }}
            >
              {/* Name + Email */}
              <div
                className="form-animate-delay apply-two-col"
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

              {/* Major + Year */}
              <div
                className="apply-two-col"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Major</label>
                  <input
                    required
                    value={form.major}
                    onChange={(e) => set("major", e.target.value)}
                    placeholder="Computer Science"
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
                  <label style={labelStyle}>Year</label>
                  <select
                    required
                    value={form.year}
                    onChange={(e) => set("year", e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLSelectElement).style.borderColor =
                        "rgba(204,0,0,0.5)";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLSelectElement).style.borderColor =
                        "rgba(255,255,255,0.1)";
                    }}
                  >
                    <option value="" disabled>
                      Select year
                    </option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Track picker */}
              <div>
                <label style={labelStyle}>Which track interests you?</label>
                <div
                  className="apply-two-col"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
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
                          padding: "20px",
                          borderRadius: 14,
                          background: selected
                            ? `${color}13`
                            : "rgba(255,255,255,0.02)",
                          border: selected
                            ? `1px solid ${color}50`
                            : "1px solid rgba(255,255,255,0.07)",
                          borderLeft: `4px solid ${selected ? color : "transparent"}`,
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: selected ? color : "#e4e4e7",
                            marginBottom: 4,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
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
                  Why do you want to join TTS?{" "}
                  <span
                    style={{
                      color: "#3f3f46",
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (min 10 characters)
                  </span>
                </label>
                <textarea
                  required
                  value={form.why}
                  onChange={(e) => set("why", e.target.value)}
                  placeholder="What are you trying to build, learn, or do before you graduate?"
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 110 }}
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
                  transition: "background 0.15s, transform 0.1s",
                  boxShadow:
                    loading || !form.track || !form.year
                      ? "none"
                      : "0 4px 24px rgba(204,0,0,0.28)",
                }}
                onMouseEnter={(e) => {
                  if (!loading && form.track && form.year) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#aa0000";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && form.track && form.year) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#CC0000";
                  }
                }}
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit application <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p
                style={{
                  fontSize: 12,
                  color: "#3f3f46",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                We&apos;ll get back to you within a few days. No spam, ever.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
