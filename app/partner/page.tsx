"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ArrowRight,
  Zap,
  Hammer,
  Star,
  Mic2,
  Users2,
} from "lucide-react";
import Link from "next/link";

type PartnerType =
  | "Client Project"
  | "Sponsor"
  | "Speaker"
  | "Recruiting"
  | "Other";

const PARTNER_TYPES: {
  id: PartnerType;
  label: string;
  sub: string;
  color: string;
}[] = [
  {
    id: "Client Project",
    label: "Client Project",
    sub: "Build something with us",
    color: "#CC0000",
  },
  {
    id: "Sponsor",
    label: "Sponsor",
    sub: "Support the org",
    color: "#FFCC00",
  },
  {
    id: "Speaker",
    label: "Speaker",
    sub: "Share your expertise",
    color: "#10b981",
  },
  {
    id: "Recruiting",
    label: "Recruiting",
    sub: "Find talent at USC",
    color: "#6366f1",
  },
  {
    id: "Other",
    label: "Other",
    sub: "Something else entirely",
    color: "#a1a1aa",
  },
];

const LEFT_CARDS: {
  id: PartnerType;
  label: string;
  sub: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "Client Project",
    label: "Client Work",
    sub: "Build something with our members",
    icon: <Hammer size={14} color="#CC0000" />,
  },
  {
    id: "Sponsor",
    label: "Sponsor",
    sub: "Support the org, get visibility",
    icon: <Star size={14} color="#CC0000" />,
  },
  {
    id: "Speaker",
    label: "Speaker",
    sub: "Share your story with our builders",
    icon: <Mic2 size={14} color="#CC0000" />,
  },
  {
    id: "Recruiting",
    label: "Recruiting",
    sub: "Find talent before graduation",
    icon: <Users2 size={14} color="#CC0000" />,
  },
];

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

export default function PartnerPage() {
  const [form, setForm] = useState({
    orgName: "",
    contactName: "",
    email: "",
    partnerType: "" as PartnerType | "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.partnerType) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/partner", {
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
            "radial-gradient(ellipse at 20% 20%, rgba(204,0,0,0.10) 0%, transparent 55%), #09090b",
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
              fontSize: "clamp(40px, 5vw, 68px)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              marginBottom: 20,
            }}
          >
            Partner with TTS.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#a1a1aa",
              lineHeight: 1.65,
              marginBottom: 40,
              maxWidth: 320,
            }}
          >
            Access USC&apos;s sharpest builders. Bring us a project, a cause, or
            a seat at your table.
          </p>

          {/* 2x2 partnership type cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {LEFT_CARDS.map(({ id, label, sub, icon }) => (
              <div
                key={id}
                style={{
                  padding: "14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "rgba(204,0,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  {icon}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 3,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{ fontSize: 11, color: "#52525b", lineHeight: 1.4 }}
                >
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: 13, color: "#52525b", marginTop: 40 }}>
          We respond within 2 business days.
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
              Message received.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#a1a1aa",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              We&apos;ll review your inquiry and follow up at the email you
              provided within a few business days.
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
              We respond to all inquiries within a few business days
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
              Let&apos;s work together
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#71717a",
                lineHeight: 1.6,
                marginBottom: 36,
              }}
            >
              Whether you have a project, want to sponsor, or want to get in
              front of USC&apos;s best builders.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 22 }}
            >
              {/* Org + Contact Name */}
              <div
                className="form-animate-delay apply-two-col"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Organization name</label>
                  <input
                    required
                    value={form.orgName}
                    onChange={(e) => set("orgName", e.target.value)}
                    placeholder="Acme Corp"
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
                  <label style={labelStyle}>Your name</label>
                  <input
                    required
                    value={form.contactName}
                    onChange={(e) => set("contactName", e.target.value)}
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
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Work email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@company.com"
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

              {/* Partner type picker */}
              <div>
                <label style={labelStyle}>
                  What best describes this inquiry?
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {PARTNER_TYPES.map(({ id, label, sub, color }) => {
                    const selected = form.partnerType === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => set("partnerType", id)}
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

              {/* Description */}
              <div>
                <label style={labelStyle}>
                  Tell us more{" "}
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
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="What are you looking to do? The more detail, the faster we can respond."
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
                disabled={loading || !form.partnerType}
                style={{
                  width: "100%",
                  height: 56,
                  borderRadius: 14,
                  background:
                    loading || !form.partnerType
                      ? "rgba(204,0,0,0.35)"
                      : "#CC0000",
                  border: "none",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  cursor:
                    loading || !form.partnerType ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "background 0.15s, transform 0.1s",
                  boxShadow:
                    loading || !form.partnerType
                      ? "none"
                      : "0 4px 24px rgba(204,0,0,0.28)",
                }}
                onMouseEnter={(e) => {
                  if (!loading && form.partnerType) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#aa0000";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && form.partnerType) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#CC0000";
                  }
                }}
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send inquiry <ArrowRight size={16} />
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
                We respond to all inquiries within a few business days.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
