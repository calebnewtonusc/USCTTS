"use client";

import React from "react";
import VisionWeb from "@/components/VisionWeb";

// ── Error boundary — catches any React render error in VisionWeb ───────────
class VisionErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "#09090b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            padding: 32,
          }}
        >
          <div style={{ maxWidth: 600, width: "100%" }}>
            <p
              style={{
                color: "#f87171",
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              React render error — VisionWeb crashed before mounting
            </p>
            <pre
              style={{
                color: "#fca5a5",
                fontSize: 12,
                background: "#1c0a0a",
                padding: 16,
                borderRadius: 8,
                overflow: "auto",
                border: "1px solid rgba(239,68,68,0.3)",
                whiteSpace: "pre-wrap",
              }}
            >
              {this.state.error.name}: {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 16,
                padding: "10px 20px",
                borderRadius: 8,
                background: "#6366f1",
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function VisionPage() {
  return (
    <VisionErrorBoundary>
      <VisionWeb />
    </VisionErrorBoundary>
  );
}
