"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ArrowRight, Zap } from "lucide-react";

type PartnerType =
  | "Client Project"
  | "Sponsor"
  | "Speaker"
  | "Recruiting"
  | "Other";

const PARTNER_TYPES: { id: PartnerType; label: string; sub: string }[] = [
  {
    id: "Client Project",
    label: "Client Project",
    sub: "Build something with our members",
  },
  { id: "Sponsor", label: "Sponsor", sub: "Support the org, get visibility" },
  {
    id: "Speaker",
    label: "Speaker",
    sub: "Share your story with our builders",
  },
  {
    id: "Recruiting",
    label: "Recruiting",
    sub: "Find talent before graduation",
  },
  { id: "Other", label: "Other", sub: "Something else entirely" },
];

const STATS = [
  { value: "12+", label: "Organizations partnered" },
  { value: "4", label: "Active client engagements" },
  { value: "2 days", label: "Average response time" },
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
  fontSize: 11,
  fontWeight: 700,
  color: "#52525b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 8,
};

export default function PartnerPage() {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);
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

  const navigateHome = useCallback(() => {
    setExiting(true);
    setTimeout(() => router.push("/"), 360);
  }, [router]);

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
        .form-animate-delay { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        @media (max-width: 768px) {
          .partner-split { flex-direction: column !important; }
          .partner-left { position: relative !important; height: auto !important; min-height: 240px !important; padding: 36px 24px !important; width: 100% !important; }
          .partner-right { padding: 36px 24px !important; }
        }
        select option { background: #111113; }
      `}</style>

      {/* Left column */}
      <div
        className="partner-split partner-left"
        style={{
          width: "40%",
          position: "sticky",
          top: 0,
          height: "100vh",
          background:
            "radial-gradient(ellipse at 15% 85%, rgba(204,0,0,0.14) 0%, transparent 55%), #09090b",
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
              fontSize: "clamp(40px, 5vw, 68px)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              marginBottom: 20,
            }}
          >
            Partner
            <br />
            with TTS.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#71717a",
              lineHeight: 1.7,
              marginBottom: 56,
              maxWidth: 300,
            }}
          >
            USC&apos;s sharpest builders. Real deliverables, not just exposure.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STATS.map(({ value, label }, i) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  padding: "20px 0",
                  borderTop:
                    i === 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(28px, 3vw, 40px)",
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    minWidth: 80,
                  }}
                >
                  {value}
                </span>
                <span
                  style={{ fontSize: 13, color: "#52525b", fontWeight: 500 }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: "#3f3f46", letterSpacing: "0.02em" }}>
          Spring 2026 · hello@usctts.com
        </p>
      </div>

      {/* Right column */}
      <div
        className="partner-right"
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
              We got it.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#71717a",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              We&apos;ll review your inquiry and follow up within 2 business
              days.
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
              Let&apos;s work together.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#52525b",
                lineHeight: 1.6,
                marginBottom: 40,
              }}
            >
              Tell us what you have in mind. We respond fast.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 24 }}
            >
              {/* Org + Contact */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Organization</label>
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

              {/* Inquiry type — compact pills, no orphaned items */}
              <div>
                <label style={labelStyle}>What best describes this?</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PARTNER_TYPES.map(({ id, label }) => {
                    const selected = form.partnerType === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => set("partnerType", id)}
                        style={{
                          padding: "9px 18px",
                          borderRadius: 999,
                          background: selected
                            ? "rgba(204,0,0,0.12)"
                            : "rgba(255,255,255,0.03)",
                          border: selected
                            ? "1px solid rgba(204,0,0,0.45)"
                            : "1px solid rgba(255,255,255,0.1)",
                          color: selected ? "#fff" : "#71717a",
                          fontSize: 13,
                          fontWeight: selected ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          letterSpacing: "-0.01em",
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
                        {label}
                      </button>
                    );
                  })}
                </div>
                {/* Show sub-label for selected type */}
                {form.partnerType && (
                  <p style={{ fontSize: 12, color: "#52525b", marginTop: 10 }}>
                    {PARTNER_TYPES.find((t) => t.id === form.partnerType)?.sub}
                  </p>
                )}
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
                  minLength={10}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="What are you looking to do? The more detail, the faster we can respond."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
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
                <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !form.partnerType}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "16px",
                  borderRadius: 14,
                  background:
                    loading || !form.partnerType
                      ? "rgba(204,0,0,0.35)"
                      : "#CC0000",
                  border: "none",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor:
                    loading || !form.partnerType ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                  letterSpacing: "-0.01em",
                  width: "100%",
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
                  margin: "-8px 0 0",
                }}
              >
                We respond to all inquiries within 2 business days.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
