"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import {
  Eye,
  Hand,
  Settings,
  Bug,
  Plus,
  X,
  Zap,
  BookOpen,
  LayoutGrid,
} from "lucide-react";
import { SpatialPanel } from "./SpatialPanel";
import { PinchDetector } from "@/hooks/usePinch";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
interface GazePoint {
  x: number;
  y: number;
}
interface PanelDef {
  id: string;
  title: string;
  x: number;
  y: number;
  content: "welcome" | "gestures" | "focus" | "about";
}

// ── Focus engine (module-level) ────────────────────────────────────────────
const STABILITY_MS = 180;
const SWITCH_DIST = 60;
let _feCurrent: Element | null = null;
let _feCandidate: Element | null = null;
let _feCandidateStart = 0;
let _feDwellStart = 0;
let _feDwellMs = 1200;

function feUpdate(x: number, y: number, now: number) {
  const targets = Array.from(
    document.querySelectorAll("[data-gaze-target]"),
  ).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });

  let best: Element | null = null;
  let bestDist = Infinity;
  for (const el of targets) {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const d = Math.hypot(x - cx, y - cy);
    const reach = Math.max(r.width, r.height) * 0.7 + 40;
    if (d < reach && d < bestDist) {
      bestDist = d;
      best = el;
    }
  }

  if (_feCurrent && best !== _feCurrent) {
    const r = _feCurrent.getBoundingClientRect();
    if (
      Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) <
      SWITCH_DIST
    )
      best = _feCurrent;
  }

  if (best !== _feCandidate) {
    _feCandidate = best;
    _feCandidateStart = now;
  }
  if (best && now - _feCandidateStart >= STABILITY_MS && best !== _feCurrent) {
    _feCurrent?.classList.remove("gaze-focus");
    _feCurrent = best;
    _feDwellStart = now;
    _feCurrent?.classList.add("gaze-focus");
  }

  return {
    target: _feCurrent,
    dwellProgress: _feCurrent
      ? Math.min((now - _feDwellStart) / _feDwellMs, 1)
      : 0,
  };
}

// ── Scroll helper — find nearest scrollable ancestor ──────────────────────
function getScrollTarget(el: Element | null): Element | Window {
  let cur = el;
  while (cur && cur !== document.documentElement) {
    const s = window.getComputedStyle(cur);
    if (
      (s.overflowY === "scroll" || s.overflowY === "auto") &&
      cur.scrollHeight > cur.clientHeight
    )
      return cur;
    cur = cur.parentElement;
  }
  return window;
}

// ── Panel content components ───────────────────────────────────────────────
function WelcomeContent() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-400 leading-relaxed">
        VisionWeb is a spatial interface controlled by your eyes and hands. Look
        at things to focus them. Pinch to select. Pinch and drag to scroll.
      </p>
      <div className="space-y-2">
        {[
          ["Look", "Gaze cursor follows your eyes"],
          ["Pinch", "Thumb + index finger = click"],
          ["Pinch + drag", "Move hand up/down to scroll"],
          ["Dwell", "Stare 1.2s at any target to click"],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-3 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-semibold text-zinc-200">{k}</span>
              <span className="text-xs text-zinc-500"> — {v}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GestureContent() {
  const rows: [string, string, string][] = [
    ["Pinch", "Index + thumb close", "Click / select"],
    ["Pinch + drag up", "Pinch, move hand up", "Scroll down"],
    ["Pinch + drag down", "Pinch, move hand down", "Scroll up"],
    ["Hold pinch", "Hold 220ms", "Long press"],
    ["Two-hand pinch", "Both hands", "Zoom + rotate"],
  ];
  return (
    <div className="space-y-2">
      {rows.map(([name, trigger, action]) => (
        <div
          key={name}
          className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0"
        >
          <div>
            <div className="text-xs font-semibold text-zinc-200">{name}</div>
            <div className="text-xs text-zinc-500">{trigger}</div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {action}
          </span>
        </div>
      ))}
    </div>
  );
}

function FocusContent({
  fps,
  gazeActive,
  handsActive,
}: {
  fps: number;
  gazeActive: boolean;
  handsActive: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["Gaze", gazeActive ? "Active" : "Off", gazeActive],
            ["Hands", handsActive ? "Active" : "Off", handsActive],
            ["FPS", String(fps), fps > 20],
            ["Dwell", "1200ms", true],
          ] as [string, string, boolean][]
        ).map(([label, val, ok]) => (
          <div
            key={label}
            className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.06]"
          >
            <div className="text-[10px] text-zinc-500 mb-1">{label}</div>
            <div
              className={`text-sm font-semibold ${ok ? "text-emerald-400" : "text-zinc-500"}`}
            >
              {val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutContent() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-400 leading-relaxed">
        VisionWeb is a Vision Pro-inspired spatial interface running entirely in
        your browser. No native app, no headset required.
      </p>
      <div className="rounded-xl p-3 bg-indigo-500/[0.08] border border-indigo-500/20">
        <div className="text-xs text-indigo-300 leading-relaxed">
          Everything runs locally on-device. Your camera feed never leaves your
          browser.
        </div>
      </div>
      <div className="text-[10px] text-zinc-600">
        Powered by WebGazer.js (Brown University) and MediaPipe Tasks Vision
        (Google).
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function VisionWeb() {
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [gazePos, setGazePos] = useState<GazePoint>({ x: -100, y: -100 });
  const [dwellProgress, setDwellProgress] = useState(0);
  const [gazeActive, setGazeActive] = useState(false);
  const [handsActive, setHandsActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [debugOpen, setDebugOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panels, setPanels] = useState<PanelDef[]>([]);
  const [dwellMs, setDwellMs] = useState(1200);
  const [cameraError, setCameraError] = useState(false);
  const [cameraErrorDetail, setCameraErrorDetail] = useState("");
  const dwellFiredRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const pinchLeft = useRef(new PinchDetector());
  const pinchRight = useRef(new PinchDetector());
  const fpsFrames = useRef(0);
  const fpsLast = useRef(performance.now());
  const gestureRecRef = useRef<unknown>(null);
  const animIdRef = useRef<number>(0);
  const lastVideoTime = useRef(-1);
  const webgazerReadyRef = useRef(false);
  const gazeStartedRef = useRef(false);
  const handsStartedRef = useRef(false);

  useEffect(() => {
    _feDwellMs = dwellMs;
  }, [dwellMs]);

  // ── WebGazer init ──────────────────────────────────────────────────────
  const startGaze = useCallback(async () => {
    if (gazeStartedRef.current) return;

    let waited = 0;
    while (!webgazerReadyRef.current && waited < 8000) {
      await new Promise((r) => setTimeout(r, 100));
      waited += 100;
      if ((window as unknown as Record<string, unknown>).webgazer)
        webgazerReadyRef.current = true;
    }

    const wg = (window as unknown as { webgazer?: unknown }).webgazer as
      | {
          setGazeListener: (
            fn: (d: { x: number; y: number } | null) => void,
          ) => { begin: () => Promise<void> };
          showVideo: (v: boolean) => void;
          showFaceOverlay: (v: boolean) => void;
          showFaceFeedbackBox: (v: boolean) => void;
          showPredictionPoints: (v: boolean) => void;
        }
      | undefined;

    if (!wg) return;

    try {
      gazeStartedRef.current = true;
      await wg
        .setGazeListener((data) => {
          if (!data) return;
          const now = performance.now();
          setGazePos({ x: data.x, y: data.y });
          const r = feUpdate(data.x, data.y, now);
          setDwellProgress(r.dwellProgress);
          if (r.dwellProgress >= 1 && r.target && !dwellFiredRef.current) {
            dwellFiredRef.current = true;
            (r.target as HTMLElement).click();
            _feDwellStart = now;
            setTimeout(() => {
              dwellFiredRef.current = false;
            }, 800);
          } else if (r.dwellProgress < 0.9) {
            dwellFiredRef.current = false;
          }
        })
        .begin();
      wg.showVideo(false);
      wg.showFaceOverlay(false);
      wg.showFaceFeedbackBox(false);
      wg.showPredictionPoints(false);
      setGazeActive(true);
      toast.success("Eye tracking active");
    } catch {
      gazeStartedRef.current = false;
    }
  }, []);

  // ── MediaPipe hands init ───────────────────────────────────────────────
  const startHands = useCallback(async () => {
    if (handsStartedRef.current || !videoRef.current) return;
    handsStartedRef.current = true;

    try {
      const { GestureRecognizer, FilesetResolver } = await import(
        // @ts-expect-error CDN dynamic import
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs"
      );
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
      );
      const rec = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      gestureRecRef.current = rec;
      setHandsActive(true);
      toast.success("Hand tracking active");

      const video = videoRef.current;

      function loop() {
        animIdRef.current = requestAnimationFrame(loop);
        if (!video || video.readyState < 2) return;
        if (video.currentTime === lastVideoTime.current) return;
        lastVideoTime.current = video.currentTime;

        const now = performance.now();
        fpsFrames.current++;
        if (now - fpsLast.current >= 1000) {
          setFps(fpsFrames.current);
          fpsFrames.current = 0;
          fpsLast.current = now;
        }

        try {
          const results = (
            gestureRecRef.current as {
              recognizeForVideo: (
                v: HTMLVideoElement,
                t: number,
              ) => {
                landmarks?: { x: number; y: number; z?: number }[][];
                handednesses?: { categoryName: string }[][];
              };
            }
          ).recognizeForVideo(video, now);

          if (results.landmarks) {
            results.landmarks.forEach((lm, i) => {
              const side =
                results.handednesses?.[i]?.[0]?.categoryName?.toLowerCase() ??
                "right";
              const detector =
                side === "left" ? pinchLeft.current : pinchRight.current;
              const result = detector.update(lm, now);

              // SCROLL: pinch + drag — Vision Pro style
              if (result.state === "dragging" && result.center) {
                // x is mirrored (selfie cam), y is not
                const sx = (1 - result.center.x) * window.innerWidth;
                const sy = result.center.y * window.innerHeight;
                const el = document.elementFromPoint(sx, sy);
                // delta.y < 0 = hand moved up = scroll content down
                const scrollAmount = -result.delta.y * 700;
                const target = getScrollTarget(el);
                if (target === window) {
                  window.scrollBy({ top: scrollAmount, behavior: "instant" });
                } else {
                  (target as Element).scrollBy({
                    top: scrollAmount,
                    behavior: "instant",
                  });
                }
              }

              // CLICK: pinch release
              if (
                result.changed &&
                result.state === "released" &&
                result.center
              ) {
                const sx = (1 - result.center.x) * window.innerWidth;
                const sy = result.center.y * window.innerHeight;
                const el = document.elementFromPoint(sx, sy);
                if (el) (el as HTMLElement).click();
              }
            });
          } else {
            pinchLeft.current.update(null, now);
            pinchRight.current.update(null, now);
          }
        } catch {
          /* ignore per-frame errors */
        }
      }

      loop();
    } catch {
      handsStartedRef.current = false;
      toast.error("Hand tracking failed to initialize.");
    }
  }, []);

  // ── Camera init — getUserMedia MUST be the first call (no state/toast before it) ──
  const handleStart = useCallback(async () => {
    // getUserMedia is FIRST — nothing before it that could break the user-gesture chain
    if (!navigator?.mediaDevices?.getUserMedia) {
      setStarted(true);
      setCameraError(true);
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
    } catch (err) {
      const errName = err instanceof Error ? err.name : "UnknownError";
      const errMsg = err instanceof Error ? err.message : String(err);
      // Show the raw error so we know exactly what browser said
      setStarted(true);
      setCameraError(true);
      // Store error detail for display
      setCameraErrorDetail(`${errName}: ${errMsg}`);
      return;
    }

    // Stream acquired — now safe to update state
    setStarted(true);

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }

    toast.success("Camera ready", { id: "vw-init" });
    setReady(true);
    setPanels([
      {
        id: "welcome",
        title: "Welcome to VisionWeb",
        x: 60,
        y: 100,
        content: "welcome",
      },
      {
        id: "gestures",
        title: "Gesture Reference",
        x: 440,
        y: 100,
        content: "gestures",
      },
      {
        id: "focus",
        title: "System Status",
        x: 820,
        y: 100,
        content: "focus",
      },
    ]);
    startGaze();
    startHands();
  }, [startGaze, startHands]);

  // ── Cleanup only on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  const closePanel = useCallback((id: string) => {
    setPanels((p) => p.filter((panel) => panel.id !== id));
  }, []);

  const addPanel = useCallback(
    (content: PanelDef["content"], title: string) => {
      const id = `${content}-${Date.now()}`;
      setPanels((p) => [
        ...p,
        {
          id,
          title,
          x: 100 + Math.random() * 200,
          y: 80 + Math.random() * 100,
          content,
        },
      ]);
    },
    [],
  );

  const renderPanelContent = (def: PanelDef) => {
    switch (def.content) {
      case "welcome":
        return <WelcomeContent />;
      case "gestures":
        return <GestureContent />;
      case "focus":
        return (
          <FocusContent
            fps={fps}
            gazeActive={gazeActive}
            handsActive={handsActive}
          />
        );
      case "about":
        return <AboutContent />;
    }
  };

  type ToolbarItem = [
    React.ComponentType<{ size: number; className?: string }>,
    string,
    boolean,
    (() => void) | null,
  ];
  const toolbarItems: ToolbarItem[] = [
    [Eye, "Gaze", gazeActive, null],
    [Hand, "Hands", handsActive, null],
    [Plus, "New Panel", true, () => addPanel("about", "About VisionWeb")],
    [
      LayoutGrid,
      "Gestures",
      true,
      () => addPanel("gestures", "Gesture Reference"),
    ],
    [BookOpen, "Status", true, () => addPanel("focus", "System Status")],
    [Settings, "Settings", true, () => setSettingsOpen((s) => !s)],
    [Bug, "Debug", true, () => setDebugOpen((s) => !s)],
  ];

  return (
    <>
      <Script
        src="https://webgazer.cs.brown.edu/webgazer.js"
        strategy="afterInteractive"
        onReady={() => {
          webgazerReadyRef.current = true;
        }}
      />

      {/* Hidden camera video */}
      <video
        ref={videoRef}
        id="camera-video"
        autoPlay
        playsInline
        muted
        className="absolute -top-[9999px] -left-[9999px] w-px h-px"
      />

      {/* Vision Pro-style splash — shown before user clicks Start */}
      {!started && (
        <div
          className="fixed inset-0 z-[9500] flex flex-col items-center justify-center bg-zinc-950"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.18), transparent 65%), #09090b",
          }}
        >
          {/* Dot grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-8"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))",
                border: "1px solid rgba(99,102,241,0.3)",
                boxShadow:
                  "0 0 40px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <Eye size={36} className="text-indigo-400" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              VisionWeb
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-10">
              Spatial computing in your browser. Controlled by your eyes and
              hands. No headset required.
            </p>

            {/* Capability pills */}
            <div className="flex gap-2 mb-10 flex-wrap justify-center">
              {[
                { icon: Eye, label: "Eye tracking" },
                { icon: Hand, label: "Gesture control" },
                { icon: Zap, label: "Pinch to click" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <Icon size={11} />
                  {label}
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow:
                  "0 4px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              Start VisionWeb
            </button>

            <p className="mt-4 text-[11px] text-zinc-600">
              Camera access required. Your feed never leaves your browser.
            </p>
          </div>
        </div>
      )}

      {/* Camera error state */}
      {cameraError && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-zinc-950">
          <div className="text-center max-w-sm px-6">
            <div className="w-14 h-14 rounded-[18px] bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Eye size={28} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Camera blocked
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-3">
              VisionWeb needs webcam access. Allow camera in your browser
              settings and reload.
            </p>
            {cameraErrorDetail && (
              <p className="text-red-400/70 text-xs font-mono mb-5 px-3 py-2 bg-red-500/5 rounded-lg border border-red-500/10 break-all">
                {cameraErrorDetail}
              </p>
            )}
            <p className="text-zinc-500 text-xs mb-5 leading-relaxed">
              If you previously denied access: click the camera icon in your
              browser address bar and allow, then reload.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Reload
            </button>
          </div>
        </div>
      )}

      {/* Loading state — while camera is starting */}
      {!ready && !cameraError && (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-zinc-950">
          <div className="text-center">
            <div className="w-14 h-14 rounded-[18px] bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Eye size={28} className="text-indigo-400" />
            </div>
            <p className="text-zinc-400 text-sm">Requesting camera access…</p>
          </div>
        </div>
      )}

      {/* Main app */}
      {ready && (
        <>
          {/* Nav */}
          <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50 px-6 py-3 flex items-center justify-between">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              <Eye size={16} className="text-indigo-400" /> VisionWeb
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${gazeActive ? "bg-emerald-400" : "bg-zinc-600"}`}
                />
                {gazeActive ? "Eyes active" : "Calibrating…"}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${handsActive ? "bg-violet-400" : "bg-zinc-600"}`}
                />
                {handsActive ? "Hands active" : "Loading…"}
              </div>
              <button
                onClick={() => setSettingsOpen((s) => !s)}
                className="p-2 rounded-lg hover:bg-white/[0.07] text-zinc-400 hover:text-white transition-all duration-150 cursor-pointer"
              >
                <Settings size={15} />
              </button>
              <button
                onClick={() => setDebugOpen((s) => !s)}
                className="p-2 rounded-lg hover:bg-white/[0.07] text-zinc-400 hover:text-white transition-all duration-150 cursor-pointer"
              >
                <Bug size={15} />
              </button>
            </div>
          </nav>

          {/* Background */}
          <div
            className="fixed inset-0 -z-10"
            style={{
              background: "#09090b",
              backgroundImage:
                "radial-gradient(ellipse at top, rgba(99,102,241,0.12), transparent 60%), radial-gradient(ellipse at bottom right, rgba(139,92,246,0.08), transparent 60%), radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "100% 100%, 100% 100%, 32px 32px",
            }}
          />

          {/* Toolbar */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 glass rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {toolbarItems.map(([Icon, label, active, action]) => (
              <button
                key={label}
                onClick={action ?? undefined}
                title={label}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 ${action ? "hover:bg-white/[0.1] active:scale-95 cursor-pointer" : "cursor-default"}`}
              >
                <Icon
                  size={16}
                  className={active ? "text-indigo-400" : "text-zinc-600"}
                />
                <span
                  className={`text-[9px] font-medium ${active ? "text-zinc-400" : "text-zinc-600"}`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Gaze cursor */}
          <div
            className="fixed pointer-events-none z-[9000]"
            style={{
              left: gazePos.x - 12,
              top: gazePos.y - 12,
              width: 24,
              height: 24,
              opacity: gazeActive ? 1 : 0,
              transition: "opacity 0.2s",
            }}
          >
            <div className="w-6 h-6 rounded-full border-2 border-indigo-400/70 bg-indigo-400/10" />
            {dwellProgress > 0.02 && (
              <svg
                className="absolute inset-0 -rotate-90"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="rgba(99,102,241,0.8)"
                  strokeWidth="2"
                  strokeDasharray={`${dwellProgress * 62.8} 62.8`}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          {/* Spatial panels */}
          {panels.map((def) => (
            <SpatialPanel
              key={def.id}
              id={def.id}
              title={def.title}
              initialX={def.x}
              initialY={def.y}
              onClose={() => closePanel(def.id)}
            >
              {renderPanelContent(def)}
            </SpatialPanel>
          ))}

          {/* Debug overlay */}
          {debugOpen && (
            <div className="fixed top-16 right-4 z-[9001] w-64 glass rounded-2xl p-4 text-xs font-mono space-y-1.5">
              <div className="text-zinc-400 font-semibold text-[11px] mb-2 flex items-center gap-2">
                <Bug size={12} /> Debug
              </div>
              {(
                [
                  ["Gaze X", gazePos.x.toFixed(0), true],
                  ["Gaze Y", gazePos.y.toFixed(0), true],
                  ["FPS", String(fps), fps > 20],
                  ["Eye tracking", gazeActive ? "ON" : "OFF", gazeActive],
                  ["Hands", handsActive ? "ON" : "OFF", handsActive],
                  ["Dwell", `${(dwellProgress * 100).toFixed(0)}%`, true],
                  ["Panels", String(panels.length), true],
                ] as [string, string, boolean][]
              ).map(([label, val, ok]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-zinc-500">{label}</span>
                  <span className={ok ? "text-zinc-200" : "text-zinc-600"}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Settings overlay */}
          {settingsOpen && (
            <div className="fixed top-1/2 right-6 -translate-y-1/2 z-[9001] w-72 glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-sm">Settings</span>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/[0.07] hover:bg-white/[0.15] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="space-y-4 text-xs text-zinc-400">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Dwell time</span>
                    <span className="text-zinc-300">{dwellMs}ms</span>
                  </div>
                  <input
                    type="range"
                    min={400}
                    max={3000}
                    step={100}
                    value={dwellMs}
                    onChange={(e) => setDwellMs(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Debug overlay</span>
                  <button
                    onClick={() => setDebugOpen((s) => !s)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${debugOpen ? "bg-indigo-600" : "bg-zinc-700"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${debugOpen ? "left-5" : "left-0.5"}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hint — calibrate by clicking around */}
          {gazeActive && (
            <div
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full glass text-xs text-zinc-500 pointer-events-none"
              style={{ animation: "fadeOut 1s ease 4s forwards" }}
            >
              Click around the screen to improve gaze accuracy
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes fadeOut {
          to { opacity: 0; }
        }
        /* Force-hide all WebGazer DOM elements */
        #webgazerVideoContainer,
        #webgazerFaceOverlay,
        #webgazerFaceFeedbackBox,
        #webgazer-loading-screen,
        #gazeDot,
        video[id^="webgazer"] {
          display: none !important;
        }
      `}</style>
    </>
  );
}
