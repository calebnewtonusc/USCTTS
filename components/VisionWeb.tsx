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

// ── Focus engine (module-level, not React state) ───────────────────────────
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

// ── Panel content components ───────────────────────────────────────────────
function WelcomeContent() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-400 leading-relaxed">
        VisionWeb is a spatial browser interface controlled by your eyes and
        hands. Look at things to focus them. Pinch to select.
      </p>
      <div className="space-y-2">
        {[
          ["Eye tracking", "Gaze cursor follows your eyes"],
          ["Pinch to select", "Thumb + index finger pinch"],
          ["Long press", "Hold pinch for 220ms"],
          ["Drag", "Pinch + move to reposition panels"],
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
    ["Pinch", "Index + thumb close", "Select / click"],
    ["Hold pinch", "Hold 220ms", "Long press"],
    ["Drag", "Pinch + move", "Reposition panel"],
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
  const [stage, setStage] = useState<"permission" | "calibration" | "app">(
    "permission",
  );
  const [gazePos, setGazePos] = useState<GazePoint>({ x: -100, y: -100 });
  const [dwellProgress, setDwellProgress] = useState(0);
  const [gazeActive, setGazeActive] = useState(false);
  const [handsActive, setHandsActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [debugOpen, setDebugOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calProgress, setCalProgress] = useState(0);
  const [panels, setPanels] = useState<PanelDef[]>([]);
  const [dwellMs, setDwellMs] = useState(1200);
  const dwellFiredRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const pinchLeft = useRef(new PinchDetector());
  const pinchRight = useRef(new PinchDetector());
  const fpsFrames = useRef(0);
  const fpsLast = useRef(performance.now());
  const gestureRecRef = useRef<unknown>(null);
  const animIdRef = useRef<number>(0);
  const lastVideoTime = useRef(-1);
  // FIX #2: track WebGazer load state as a ref (not state) to avoid re-renders
  const webgazerReadyRef = useRef(false);
  // FIX #5: guard against double-init
  const gazeStartedRef = useRef(false);
  const handsStartedRef = useRef(false);

  // Sync dwell time to focus engine
  useEffect(() => {
    _feDwellMs = dwellMs;
  }, [dwellMs]);

  // (no scroll-aware navbar — this is a fixed full-screen app)

  // Init camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 960 },
          height: { ideal: 540 },
          facingMode: "user",
          frameRate: { ideal: 30 },
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch {
      toast.error("Camera access denied. VisionWeb requires webcam access.");
      return false;
    }
  }, []);

  // Init WebGazer — FIX #2: wait for webgazer to be ready
  const startGaze = useCallback(async () => {
    // FIX #5: guard double-init
    if (gazeStartedRef.current) return;

    // Wait up to 5s for WebGazer script to load
    let waited = 0;
    while (!webgazerReadyRef.current && waited < 5000) {
      await new Promise((r) => setTimeout(r, 100));
      waited += 100;
      // also check if webgazer is actually on window
      if ((window as unknown as Record<string, unknown>).webgazer) {
        webgazerReadyRef.current = true;
      }
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

    if (!wg) {
      toast.error("WebGazer failed to load. Check your connection.");
      return;
    }

    try {
      gazeStartedRef.current = true;
      toast.loading("Starting eye tracking…", {
        id: "gaze-init",
        duration: 8000,
      });
      await wg
        .setGazeListener((data) => {
          if (!data) return;
          const now = performance.now();
          setGazePos({ x: data.x, y: data.y });
          const r = feUpdate(data.x, data.y, now);
          setDwellProgress(r.dwellProgress);
          // Fire dwell click when progress completes
          if (r.dwellProgress >= 1 && r.target && !dwellFiredRef.current) {
            dwellFiredRef.current = true;
            (r.target as HTMLElement).click();
            // Reset dwell start so it doesn't fire again immediately
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
      toast.success("Eye tracking active", { id: "gaze-init" });
    } catch {
      gazeStartedRef.current = false;
      toast.error("Eye tracking failed to start.", { id: "gaze-init" });
    }
  }, []);

  // Init MediaPipe hands
  const startHands = useCallback(async () => {
    // FIX #5: guard double-init
    if (handsStartedRef.current) return;
    if (!videoRef.current) return;

    handsStartedRef.current = true;
    toast.loading("Loading hand tracking…", {
      id: "hands-init",
      duration: 20000,
    });
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
      toast.success("Hand tracking active", { id: "hands-init" });

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
              // Wire pinch "released" state to a click at the pinch center
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
      toast.error("Hand tracking failed to initialize.", { id: "hands-init" });
    }
  }, []);

  const handlePermissionGrant = useCallback(async () => {
    const ok = await startCamera();
    if (!ok) return;
    setStage("calibration");
  }, [startCamera]);

  const handleCalibrationDone = useCallback(() => {
    // Show panels immediately — don't block on tracking startup
    setStage("app");
    setPanels([
      { id: "welcome", title: "Welcome", x: 60, y: 120, content: "welcome" },
      {
        id: "gestures",
        title: "Gesture Reference",
        x: 440,
        y: 120,
        content: "gestures",
      },
      { id: "focus", title: "System Status", x: 820, y: 120, content: "focus" },
    ]);
    // Start tracking in the background — panels don't wait on this
    startGaze();
    startHands();
  }, [startGaze, startHands]);

  // FIX #4: recalibrate goes back to calibration screen properly
  const handleRecalibrate = useCallback(() => {
    setCalProgress(0);
    setSettingsOpen(false);
    setStage("calibration");
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

  const CAL_POINTS: [number, number][] = [
    [10, 10],
    [50, 10],
    [90, 10],
    [10, 50],
    [50, 50],
    [90, 50],
    [10, 90],
    [50, 90],
    [90, 90],
  ];

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

  // ── Toolbar items ──────────────────────────────────────────────────────
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
      {/* FIX #2: mark WebGazer as ready when script loads */}
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

      {/* Nav — always visible during app stage */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50 px-6 py-3 flex items-center justify-between"
        style={{
          transform: stage === "app" ? "translateY(0)" : "translateY(-100%)",
          opacity: stage === "app" ? 1 : 0,
          transition: "transform 0.3s ease, opacity 0.3s ease",
        }}
      >
        <span className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
          <Eye size={16} className="text-indigo-400" /> VisionWeb
        </span>
        <div className="flex items-center gap-2">
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

      {/* ── PERMISSION MODAL ── */}
      {stage === "permission" && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/85 backdrop-blur-xl">
          <div className="glass rounded-3xl p-10 max-w-md w-[calc(100%-48px)] text-center shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
            <div className="w-16 h-16 rounded-[18px] bg-indigo-500/15 flex items-center justify-center mx-auto mb-5">
              <Eye size={32} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Camera Required</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              VisionWeb uses your webcam to track your eyes and hands.
              Everything runs locally on your device.
            </p>
            {/* FIX #1: use explicit static classes, not dynamic template literals */}
            <div className="space-y-2.5 mb-7 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Eye size={15} className="text-indigo-400" />
                </div>
                <span className="text-sm text-zinc-300">
                  Eye tracking via WebGazer.js
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <Hand size={15} className="text-violet-400" />
                </div>
                <span className="text-sm text-zinc-300">
                  Hand gestures via MediaPipe
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Zap size={15} className="text-emerald-400" />
                </div>
                <span className="text-sm text-zinc-300">
                  Zero data leaves your device
                </span>
              </div>
            </div>
            <button
              onClick={handlePermissionGrant}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              Enable Camera Access
            </button>
            <p className="text-zinc-600 text-xs mt-3">
              HTTPS required for webcam access
            </p>
          </div>
        </div>
      )}

      {/* ── CALIBRATION ── */}
      {stage === "calibration" && (
        <div className="fixed inset-0 z-[9990] flex flex-col items-center justify-center bg-zinc-950">
          <div className="text-center mb-8">
            <div className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">
              Eye Tracking Calibration
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Look at each dot and click it
            </h2>
            <p className="text-zinc-500 text-sm">
              Keep your head still. Look directly at the dot before clicking.
            </p>
            <div className="text-indigo-400 text-lg font-semibold mt-3">
              {calProgress} / 9
            </div>
          </div>
          <div className="relative w-[min(700px,88vw)] h-[min(420px,55vh)] bg-white/[0.03] border border-white/[0.07] rounded-2xl">
            {CAL_POINTS.map(([px, py], i) => (
              <button
                key={i}
                className="absolute w-5 h-5 rounded-full bg-indigo-500 border-2 border-white cursor-pointer transition-all duration-150 hover:scale-150 shadow-[0_0_20px_rgba(99,102,241,0.8)]"
                style={{
                  left: `${px}%`,
                  top: `${py}%`,
                  transform: "translate(-50%,-50%)",
                }}
                onClick={(e) => {
                  const btn = e.currentTarget;
                  btn.style.background = "#22c55e";
                  btn.style.boxShadow = "0 0 24px rgba(34,197,94,0.8)";
                  btn.disabled = true;
                  // FIX #3: use functional update to avoid stale closure
                  setCalProgress((prev) => {
                    const next = prev + 1;
                    if (next >= 9) setTimeout(handleCalibrationDone, 500);
                    return next;
                  });
                }}
              />
            ))}
          </div>
          <button
            onClick={handleCalibrationDone}
            className="mt-6 text-zinc-600 text-sm underline cursor-pointer hover:text-zinc-400 transition-colors"
          >
            Skip calibration
          </button>
        </div>
      )}

      {/* ── MAIN APP ── */}
      {stage === "app" && (
        <>
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
                  {/* FIX #6: dwellMs is React state so it updates in UI */}
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
                <div className="pt-2 border-t border-white/[0.06]">
                  {/* FIX #4: recalibrate goes back to calibration screen */}
                  <button
                    onClick={handleRecalibrate}
                    className="w-full text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Recalibrate eye tracking
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
