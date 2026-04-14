"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Brain,
  ChevronLeft,
  ChevronRight,
  Code,
  Compass,
  Cpu,
  Hexagon,
  Layers,
  List,
  Network,
  Rocket,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import type { Meeting, Person, Slide } from "@/lib/meetings";

const SWIPE_THRESHOLD = 50;

type FloatingIconSpec = {
  Icon: React.ComponentType<{ size?: number }>;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: number;
  rot: number;
  color: string;
  dur: string;
  delay: string;
};

const FLOATING_ICONS: FloatingIconSpec[] = [
  {
    Icon: Zap,
    top: "9%",
    left: "4%",
    size: 42,
    rot: -14,
    color: "rgba(255,204,0,0.14)",
    dur: "11s",
    delay: "0s",
  },
  {
    Icon: Code,
    top: "24%",
    right: "5%",
    size: 54,
    rot: 18,
    color: "rgba(204,0,0,0.16)",
    dur: "14s",
    delay: "1s",
  },
  {
    Icon: Cpu,
    bottom: "20%",
    left: "6%",
    size: 64,
    rot: -24,
    color: "rgba(204,0,0,0.12)",
    dur: "12s",
    delay: "2s",
  },
  {
    Icon: Brain,
    top: "55%",
    right: "11%",
    size: 40,
    rot: 10,
    color: "rgba(255,204,0,0.14)",
    dur: "13s",
    delay: "0.5s",
  },
  {
    Icon: Terminal,
    bottom: "10%",
    right: "18%",
    size: 36,
    rot: -30,
    color: "rgba(16,185,129,0.14)",
    dur: "10s",
    delay: "1.5s",
  },
  {
    Icon: Sparkles,
    top: "38%",
    left: "13%",
    size: 32,
    rot: 44,
    color: "rgba(255,204,0,0.18)",
    dur: "12s",
    delay: "2.5s",
  },
  {
    Icon: Rocket,
    top: "72%",
    left: "30%",
    size: 38,
    rot: -18,
    color: "rgba(204,0,0,0.12)",
    dur: "15s",
    delay: "0.8s",
  },
  {
    Icon: Network,
    top: "14%",
    right: "26%",
    size: 42,
    rot: 22,
    color: "rgba(59,130,246,0.14)",
    dur: "11s",
    delay: "1.8s",
  },
  {
    Icon: Layers,
    bottom: "32%",
    right: "4%",
    size: 50,
    rot: -8,
    color: "rgba(139,92,246,0.13)",
    dur: "13s",
    delay: "0.3s",
  },
  {
    Icon: Compass,
    top: "48%",
    left: "3%",
    size: 38,
    rot: 0,
    color: "rgba(16,185,129,0.14)",
    dur: "14s",
    delay: "2.2s",
  },
  {
    Icon: Hexagon,
    bottom: "44%",
    left: "22%",
    size: 30,
    rot: 30,
    color: "rgba(255,204,0,0.12)",
    dur: "10s",
    delay: "1.2s",
  },
  {
    Icon: Atom,
    top: "6%",
    right: "18%",
    size: 28,
    rot: -20,
    color: "rgba(204,0,0,0.14)",
    dur: "12s",
    delay: "0.6s",
  },
];

function FloatingIcons() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {FLOATING_ICONS.map((spec, i) => (
        <div
          key={i}
          className="tts-meeting-float-icon"
          style={
            {
              top: spec.top,
              left: spec.left,
              right: spec.right,
              bottom: spec.bottom,
              color: spec.color,
              "--rot": `${spec.rot}deg`,
              "--dur": spec.dur,
              "--delay": spec.delay,
            } as React.CSSProperties
          }
        >
          <spec.Icon size={spec.size} />
        </div>
      ))}
    </div>
  );
}

export function SlideDeck({ meeting }: { meeting: Meeting }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [showIndex, setShowIndex] = useState(false);
  const total = meeting.slides.length;
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (target: number, dir: "next" | "prev") => {
      if (target < 0 || target >= total) return;
      setDirection(dir);
      setIndex(target);
    },
    [total],
  );

  const next = useCallback(() => go(index + 1, "next"), [go, index]);
  const prev = useCallback(() => go(index - 1, "prev"), [go, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        setShowIndex(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  const slide = meeting.slides[index];
  const progress = ((index + 1) / total) * 100;

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white flex flex-col">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(204,0,0,0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 50% 110%, rgba(255,204,0,0.06), transparent 55%)",
        }}
      />

      <header className="relative z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          <span className="hidden sm:inline">All meetings</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 font-mono">
          <span
            className="font-semibold tracking-wider uppercase"
            style={{ color: meeting.accent }}
          >
            M{String(meeting.number).padStart(2, "0")}
          </span>
          <span className="text-zinc-700">/</span>
          <span>
            {index + 1} <span className="text-zinc-700">·</span> {total}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowIndex((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <List className="w-4 h-4" aria-hidden />
          <span className="hidden sm:inline">Index</span>
        </button>
      </header>

      <div
        className="relative z-10 flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <FloatingIcons />
        <div
          key={index}
          className={`absolute inset-0 ${
            direction === "next"
              ? "tts-slide-enter-next"
              : "tts-slide-enter-prev"
          }`}
        >
          <SlideStage depKey={index}>
            <SlideBody slide={slide} accent={meeting.accent} />
          </SlideStage>
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={prev}
          disabled={index === 0}
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={next}
          disabled={index === total - 1}
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <footer className="relative z-10 px-4 sm:px-6 py-3 sm:py-4 border-t border-white/5">
        <div
          className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden mb-3"
          aria-hidden
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${meeting.accent}, #FFCC00)`,
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="truncate">
            <span className="text-zinc-300">{meeting.title}</span>
            <span className="text-zinc-700 mx-2">·</span>
            <span>{meeting.dateLabel}</span>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              aria-label="Previous"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={index === total - 1}
              aria-label="Next"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="hidden sm:inline text-zinc-600">
            ← → to navigate · Esc
          </span>
        </div>
      </footer>

      {showIndex && (
        <SlideIndex
          meeting={meeting}
          current={index}
          onSelect={(i) => {
            setDirection(i >= index ? "next" : "prev");
            setIndex(i);
            setShowIndex(false);
          }}
          onClose={() => setShowIndex(false)}
        />
      )}
    </div>
  );
}

function SlideStage({
  depKey,
  children,
}: {
  depKey: number | string;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const target = root.firstElementChild as HTMLElement | null;
    if (!target) return;

    const apply = () => {
      target.style.transform = "";
      target.style.transformOrigin = "center center";
      const cw = root.clientWidth;
      const ch = root.clientHeight;
      const sw = target.scrollWidth;
      const sh = target.scrollHeight;
      if (!cw || !ch || !sw || !sh) return;
      const s = Math.min(1, cw / sw, ch / sh);
      if (s < 0.999) {
        target.style.transform = `scale(${s})`;
      }
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(root);
    ro.observe(target);

    // Re-apply after two frames so web fonts and images settle.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(apply);
    });

    // Catch late image loads (headshots).
    const imgs = Array.from(target.querySelectorAll("img"));
    const onImgLoad = () => apply();
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", onImgLoad);
    });

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      imgs.forEach((img) => img.removeEventListener("load", onImgLoad));
    };
  }, [depKey]);

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden">
      {children}
    </div>
  );
}

function SlideBody({ slide, accent }: { slide: Slide; accent: string }) {
  // wrap fills the full slide viewport; SlideStage scales this down if content
  // overflows so the whole slide fits any viewport size without scrolling.
  const wrap =
    "absolute inset-0 overflow-visible px-5 sm:px-10 lg:px-16 py-6 sm:py-10 flex";
  // Centered slides: content is vertically centered in full viewport height.
  const innerCentered =
    "mx-auto w-full min-h-full flex flex-col justify-center";
  // Filling slides: header shrinks, content grows to fill remaining height.
  const innerFill = "mx-auto w-full min-h-full flex flex-col";

  if (slide.kind === "title") {
    return (
      <div className={wrap}>
        <div className={`${innerCentered} max-w-5xl`}>
          {slide.eyebrow && (
            <div
              className="text-xs sm:text-sm uppercase tracking-[0.3em] font-semibold mb-6 sm:mb-10"
              style={{ color: accent }}
            >
              {slide.eyebrow}
            </div>
          )}
          <h1
            className="font-bold tracking-tight leading-[0.92]"
            style={{ fontSize: "clamp(2.5rem, 11vw, 8rem)" }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p
              className="mt-6 sm:mt-10 text-zinc-300 leading-snug max-w-3xl"
              style={{ fontSize: "clamp(1.125rem, 2.6vw, 1.875rem)" }}
            >
              {slide.subtitle}
            </p>
          )}
          {slide.footer && (
            <div className="mt-10 sm:mt-16 text-sm sm:text-base text-zinc-500 font-mono">
              {slide.footer}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (slide.kind === "section") {
    return (
      <div className={wrap}>
        <div className={`${innerCentered} max-w-5xl`}>
          <div
            className="font-black tracking-tighter leading-none opacity-90"
            style={{
              fontSize: "clamp(6rem, 26vw, 18rem)",
              color: accent,
            }}
          >
            {slide.number}
          </div>
          <h2
            className="mt-3 sm:mt-6 font-bold tracking-tight leading-tight"
            style={{ fontSize: "clamp(2rem, 7vw, 5rem)" }}
          >
            {slide.title}
          </h2>
          {slide.blurb && (
            <p
              className="mt-5 sm:mt-8 text-zinc-400 leading-relaxed max-w-3xl"
              style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)" }}
            >
              {slide.blurb}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (slide.kind === "bullets") {
    return (
      <div className={wrap}>
        <div className={`${innerCentered} max-w-5xl`}>
          {slide.eyebrow && (
            <div
              className="text-xs uppercase tracking-[0.25em] font-semibold mb-3"
              style={{ color: accent }}
            >
              {slide.eyebrow}
            </div>
          )}
          <h2
            className="font-semibold tracking-tight leading-tight"
            style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)" }}
          >
            {slide.title}
          </h2>
          {slide.body && (
            <p
              className="mt-4 sm:mt-5 text-zinc-400 leading-relaxed max-w-3xl"
              style={{ fontSize: "clamp(1rem, 1.8vw, 1.375rem)" }}
            >
              {slide.body}
            </p>
          )}
          <ul className="mt-8 sm:mt-12 space-y-5 sm:space-y-6">
            {slide.items.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 sm:gap-6 items-start border-t border-white/5 pt-5 sm:pt-6 first:border-t-0 first:pt-0"
              >
                <div
                  className="shrink-0 font-mono text-xs sm:text-sm mt-1.5"
                  style={{ color: accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="font-semibold text-white leading-snug"
                    style={{ fontSize: "clamp(1.125rem, 2.2vw, 1.625rem)" }}
                  >
                    {item.label}
                  </div>
                  {item.detail && (
                    <div
                      className="mt-1.5 text-zinc-400 leading-relaxed"
                      style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.125rem)" }}
                    >
                      {item.detail}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (slide.kind === "three-up") {
    return (
      <div className={wrap}>
        <div className={`${innerFill} max-w-7xl`}>
          <div className="shrink-0">
            {slide.eyebrow && (
              <div
                className="text-xs uppercase tracking-[0.25em] font-semibold mb-3"
                style={{ color: accent }}
              >
                {slide.eyebrow}
              </div>
            )}
            <h2
              className="font-semibold tracking-tight leading-tight"
              style={{ fontSize: "clamp(1.75rem, 5vw, 3.25rem)" }}
            >
              {slide.title}
            </h2>
          </div>
          <div className="mt-6 sm:mt-10 flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {slide.cards.map((card, i) => (
              <div
                key={i}
                className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col"
              >
                <div
                  className="absolute top-5 right-5 text-xs font-mono"
                  style={{ color: card.accent }}
                >
                  {card.label}
                </div>
                <div
                  className="w-10 h-1 rounded-full mb-5"
                  style={{ background: card.accent }}
                />
                <div
                  className="font-semibold tracking-tight mb-3"
                  style={{ fontSize: "clamp(1.375rem, 2.6vw, 1.875rem)" }}
                >
                  {card.heading}
                </div>
                <p
                  className="text-zinc-400 leading-relaxed"
                  style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.125rem)" }}
                >
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slide.kind === "quote") {
    return (
      <div className={wrap}>
        <div className={`${innerCentered} max-w-5xl`}>
          <div
            aria-hidden
            className="font-serif leading-none mb-2 sm:mb-4 opacity-20"
            style={{ fontSize: "clamp(5rem, 16vw, 12rem)", color: accent }}
          >
            &ldquo;
          </div>
          <blockquote
            className="font-medium tracking-tight leading-[1.12] text-white"
            style={{ fontSize: "clamp(1.75rem, 6vw, 4rem)" }}
          >
            {slide.quote}
          </blockquote>
          {slide.attribution && (
            <div className="mt-8 sm:mt-10 text-xs sm:text-sm text-zinc-500 uppercase tracking-[0.25em]">
              {slide.attribution}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (slide.kind === "stat") {
    return (
      <div className={wrap}>
        <div className={`${innerCentered} max-w-5xl text-center sm:text-left`}>
          {slide.eyebrow && (
            <div
              className="text-xs uppercase tracking-[0.25em] font-semibold mb-4"
              style={{ color: accent }}
            >
              {slide.eyebrow}
            </div>
          )}
          <div
            className="font-black tracking-tighter leading-none"
            style={{
              fontSize: "clamp(7rem, 32vw, 22rem)",
              background: `linear-gradient(180deg, ${accent}, #FFCC00)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {slide.value}
          </div>
          <div
            className="mt-3 sm:mt-5 font-semibold tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 4.5vw, 2.75rem)" }}
          >
            {slide.label}
          </div>
          {slide.context && (
            <p
              className="mt-5 text-zinc-400 leading-relaxed max-w-2xl mx-auto sm:mx-0"
              style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)" }}
            >
              {slide.context}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (slide.kind === "people") {
    const count = slide.people.length;
    const gridCols =
      count === 2
        ? "sm:grid-cols-2"
        : count === 4
          ? "sm:grid-cols-2 lg:grid-cols-4"
          : count === 5
            ? "sm:grid-cols-2 lg:grid-cols-5"
            : count >= 3
              ? "md:grid-cols-3"
              : "";
    return (
      <div className={wrap}>
        <div className={`${innerFill} max-w-7xl`}>
          <div className="shrink-0">
            {slide.eyebrow && (
              <div
                className="text-xs uppercase tracking-[0.25em] font-semibold mb-3"
                style={{ color: accent }}
              >
                {slide.eyebrow}
              </div>
            )}
            <h2
              className="font-semibold tracking-tight leading-tight"
              style={{ fontSize: "clamp(1.75rem, 5vw, 3.25rem)" }}
            >
              {slide.title}
            </h2>
            {slide.body && (
              <p
                className="mt-4 text-zinc-400 leading-relaxed max-w-3xl"
                style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)" }}
              >
                {slide.body}
              </p>
            )}
          </div>
          {count === 1 ? (
            <div className="mt-6 sm:mt-10 flex-1 min-h-0 flex">
              <PersonCard person={slide.people[0]!} spotlight />
            </div>
          ) : (
            <div
              className={`mt-6 sm:mt-10 flex-1 min-h-0 grid grid-cols-1 ${gridCols} gap-4 sm:gap-6`}
            >
              {slide.people.map((p, i) => (
                <PersonCard key={i} person={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (slide.kind === "cabinet") {
    return (
      <div className={wrap}>
        <div className={`${innerFill} max-w-7xl`}>
          <div className="shrink-0">
            {slide.eyebrow && (
              <div
                className="text-xs uppercase tracking-[0.25em] font-semibold mb-3"
                style={{ color: accent }}
              >
                {slide.eyebrow}
              </div>
            )}
            <h2
              className="font-semibold tracking-tight leading-tight"
              style={{ fontSize: "clamp(1.75rem, 5vw, 3.25rem)" }}
            >
              {slide.title}
            </h2>
            {slide.body && (
              <p
                className="mt-4 text-zinc-400 leading-relaxed max-w-3xl"
                style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)" }}
              >
                {slide.body}
              </p>
            )}
          </div>
          <div className="mt-6 sm:mt-10 flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 auto-rows-fr">
            {slide.people.map((p, i) => (
              <CabinetCard key={i} person={p} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slide.kind === "venn") {
    const [a, b, c] = slide.circles;
    return (
      <div className={wrap}>
        <div className={`${innerFill} max-w-7xl`}>
          <div className="shrink-0">
            {slide.eyebrow && (
              <div
                className="text-xs uppercase tracking-[0.25em] font-semibold mb-3"
                style={{ color: accent }}
              >
                {slide.eyebrow}
              </div>
            )}
            <h2
              className="font-semibold tracking-tight leading-tight"
              style={{ fontSize: "clamp(1.75rem, 5vw, 3.25rem)" }}
            >
              {slide.title}
            </h2>
            {slide.body && (
              <p
                className="mt-4 text-zinc-400 leading-relaxed max-w-3xl"
                style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)" }}
              >
                {slide.body}
              </p>
            )}
          </div>
          <div className="mt-6 sm:mt-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr,minmax(0,0.9fr)] gap-6 sm:gap-10 items-center">
            <div className="relative aspect-square w-full max-w-[32rem] mx-auto">
              {/* Circle A — top left */}
              <VennCircleSvg
                circle={a}
                style={{
                  top: "0%",
                  left: "0%",
                  width: "62%",
                  height: "62%",
                }}
                labelPos="top-left"
              />
              {/* Circle B — top right */}
              <VennCircleSvg
                circle={b}
                style={{
                  top: "0%",
                  right: "0%",
                  width: "62%",
                  height: "62%",
                }}
                labelPos="top-right"
              />
              {/* Circle C — bottom center */}
              <VennCircleSvg
                circle={c}
                style={{
                  bottom: "0%",
                  left: "19%",
                  width: "62%",
                  height: "62%",
                }}
                labelPos="bottom"
              />
              {/* Center label */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
                style={{ zIndex: 4 }}
              >
                <div
                  className="font-black tracking-tight leading-none"
                  style={{
                    fontSize: "clamp(1rem, 2.2vw, 1.5rem)",
                    color: "#ffffff",
                    textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                  }}
                >
                  {slide.center.label}
                </div>
                {slide.center.sub && (
                  <div
                    className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold"
                    style={{
                      color: accent,
                      textShadow: "0 1px 10px rgba(0,0,0,0.8)",
                    }}
                  >
                    {slide.center.sub}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4 sm:space-y-5">
              {slide.circles.map((circle, i) => (
                <div
                  key={i}
                  className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: circle.accent }}
                      aria-hidden
                    />
                    <span
                      className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold"
                      style={{ color: circle.accent }}
                    >
                      {circle.label}
                    </span>
                  </div>
                  <div
                    className="font-semibold tracking-tight text-white leading-snug"
                    style={{ fontSize: "clamp(1.0625rem, 1.7vw, 1.25rem)" }}
                  >
                    {circle.heading}
                  </div>
                  {circle.body && (
                    <p
                      className="mt-2 text-zinc-400 leading-relaxed"
                      style={{ fontSize: "clamp(0.875rem, 1.3vw, 1rem)" }}
                    >
                      {circle.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // cta
  return (
    <div className={wrap}>
      <div className={`${innerCentered} max-w-4xl`}>
        {slide.eyebrow && (
          <div
            className="text-xs uppercase tracking-[0.3em] font-semibold mb-5 sm:mb-7"
            style={{ color: accent }}
          >
            {slide.eyebrow}
          </div>
        )}
        <h2
          className="font-bold tracking-tight leading-tight"
          style={{ fontSize: "clamp(2.25rem, 8vw, 5.5rem)" }}
        >
          {slide.title}
        </h2>
        {slide.body && (
          <p
            className="mt-5 sm:mt-7 text-zinc-300 leading-relaxed"
            style={{ fontSize: "clamp(1.125rem, 2.2vw, 1.5rem)" }}
          >
            {slide.body}
          </p>
        )}
        <ul className="mt-8 sm:mt-12 space-y-4">
          {slide.actions.map((a, i) => (
            <li
              key={i}
              className="flex items-center gap-3 sm:gap-4 text-white"
              style={{ fontSize: "clamp(1.125rem, 2vw, 1.5rem)" }}
            >
              <ArrowRight
                className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
                style={{ color: accent }}
              />
              <span className="font-medium">{a.label}</span>
              {a.detail && (
                <span className="text-zinc-500 text-sm sm:text-base">
                  {a.detail}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SlideIndex({
  meeting,
  current,
  onSelect,
  onClose,
}: {
  meeting: Meeting;
  current: number;
  onSelect: (i: number) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 bg-zinc-950/90 backdrop-blur-xl flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
        <div className="text-sm text-zinc-400">
          <span className="text-zinc-500">Jump to slide</span>
          <span className="text-zinc-700 mx-2">·</span>
          <span className="text-white">{meeting.title}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto grid grid-cols-1 gap-2">
          {meeting.slides.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className={`text-left flex items-baseline gap-4 p-3 sm:p-4 rounded-xl border transition cursor-pointer ${
                i === current
                  ? "bg-white/10 border-white/20"
                  : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15"
              }`}
            >
              <span
                className="font-mono text-xs shrink-0 w-8"
                style={{ color: meeting.accent }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-white font-medium text-sm sm:text-base leading-snug truncate">
                  {slideLabel(s)}
                </span>
                <span className="block text-xs text-zinc-500 uppercase tracking-wider mt-0.5">
                  {s.kind}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function slideLabel(s: Slide): string {
  switch (s.kind) {
    case "title":
      return s.title;
    case "section":
      return `${s.number} · ${s.title}`;
    case "bullets":
    case "three-up":
    case "people":
    case "cabinet":
    case "venn":
      return s.title;
    case "quote":
      return s.quote.length > 80 ? `${s.quote.slice(0, 80)}…` : s.quote;
    case "stat":
      return `${s.value} · ${s.label}`;
    case "cta":
      return s.title;
  }
}

function PersonPhoto({
  person,
  className,
  sizes,
  initialsFontSize,
}: {
  person: Person;
  className: string;
  sizes: string;
  initialsFontSize: string;
}) {
  const pos = person.position ?? "center top";
  return (
    <div
      className={`relative ${className} bg-zinc-900`}
      style={{
        backgroundImage: person.photo
          ? undefined
          : `linear-gradient(135deg, ${person.accent}33, transparent 60%)`,
      }}
    >
      {person.photo ? (
        <Image
          src={person.photo}
          alt={person.name}
          fill
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition: pos }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold tracking-tight"
            style={{ fontSize: initialsFontSize, color: person.accent }}
          >
            {person.initials}
          </span>
        </div>
      )}
    </div>
  );
}

function PersonMeta({
  person,
  spotlight = false,
}: {
  person: Person;
  spotlight?: boolean;
}) {
  const nameSize = spotlight
    ? "clamp(1.75rem, 3.4vw, 2.75rem)"
    : "clamp(1.125rem, 2vw, 1.625rem)";
  const bulletSize = spotlight
    ? "clamp(1rem, 1.6vw, 1.25rem)"
    : "clamp(0.9rem, 1.3vw, 1.0625rem)";
  return (
    <>
      <div
        className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] mb-2"
        style={{ color: person.accent }}
      >
        {person.role}
      </div>
      <div
        className="font-semibold tracking-tight mb-3 leading-tight"
        style={{ fontSize: nameSize }}
      >
        {person.name}
      </div>
      {person.affiliation && (
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium tracking-wide"
            style={{
              background: `${person.accent}1a`,
              color: person.accent,
              border: `1px solid ${person.accent}33`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: person.accent }}
              aria-hidden
            />
            {person.affiliation}
          </span>
        </div>
      )}
      {person.bullets && person.bullets.length > 0 && (
        <ul className="space-y-2.5 sm:space-y-3">
          {person.bullets.map((b, i) => (
            <li
              key={i}
              className="text-zinc-300 leading-relaxed flex gap-3"
              style={{ fontSize: bulletSize }}
            >
              <span
                className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full"
                style={{ background: person.accent }}
                aria-hidden
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function VennCircleSvg({
  circle,
  style,
  labelPos,
}: {
  circle: { label: string; accent: string };
  style: React.CSSProperties;
  labelPos: "top-left" | "top-right" | "bottom";
}) {
  const labelClasses =
    labelPos === "top-left"
      ? "absolute top-3 left-3 sm:top-4 sm:left-4"
      : labelPos === "top-right"
        ? "absolute top-3 right-3 sm:top-4 sm:right-4 text-right"
        : "absolute bottom-3 left-1/2 -translate-x-1/2 sm:bottom-4 text-center";
  return (
    <div
      className="absolute rounded-full"
      style={{
        ...style,
        background: `radial-gradient(circle at 30% 30%, ${circle.accent}40, ${circle.accent}14 60%, transparent 75%)`,
        border: `1.5px solid ${circle.accent}66`,
        mixBlendMode: "screen",
      }}
    >
      <span
        className={`${labelClasses} text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] pointer-events-none`}
        style={{
          color: circle.accent,
          textShadow: "0 1px 10px rgba(0,0,0,0.9)",
        }}
      >
        {circle.label}
      </span>
    </div>
  );
}

function PersonCard({
  person,
  spotlight = false,
}: {
  person: Person;
  spotlight?: boolean;
}) {
  if (spotlight) {
    // 1 person: fills full slide area. Photo left, content right on desktop.
    return (
      <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row">
        <PersonPhoto
          person={person}
          className="w-full aspect-[4/5] md:w-[42%] md:max-w-[36rem] md:aspect-auto md:h-auto md:self-stretch md:shrink-0"
          sizes="(max-width: 768px) 100vw, 42vw"
          initialsFontSize="clamp(4rem, 12vw, 8rem)"
        />
        <div className="p-6 sm:p-10 flex-1 min-w-0 flex flex-col justify-center">
          <PersonMeta person={person} spotlight />
        </div>
      </div>
    );
  }
  // 2 or 3 people: card stretches to grid cell height. Photo top, content below.
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
      <PersonPhoto
        person={person}
        className="w-full aspect-[4/5] shrink-0"
        sizes="(max-width: 768px) 100vw, 33vw"
        initialsFontSize="clamp(3rem, 7vw, 5rem)"
      />
      <div className="p-5 sm:p-6 flex-1 min-h-0">
        <PersonMeta person={person} />
      </div>
    </div>
  );
}

function CabinetCard({ person }: { person: Person }) {
  const pos = person.position ?? "center top";
  return (
    <div className="h-full bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
      <div
        className="relative w-full aspect-[4/5] bg-zinc-900"
        style={{
          backgroundImage: person.photo
            ? undefined
            : `linear-gradient(135deg, ${person.accent}33, transparent 70%)`,
        }}
      >
        {person.photo ? (
          <Image
            src={person.photo}
            alt={person.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover"
            style={{ objectPosition: pos }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-bold"
              style={{
                color: person.accent,
                fontSize: "clamp(2rem, 6vw, 4rem)",
              }}
            >
              {person.initials}
            </span>
          </div>
        )}
        {/* subtle gradient so text overlay is legible if we add one later */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.6))",
          }}
        />
      </div>
      <div className="p-4 sm:p-5 flex flex-col gap-1">
        <div
          className="font-semibold text-white leading-tight tracking-tight"
          style={{ fontSize: "clamp(1.0625rem, 1.55vw, 1.375rem)" }}
        >
          {person.name}
        </div>
        <div
          className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-semibold leading-snug"
          style={{ color: person.accent }}
        >
          {person.role}
        </div>
      </div>
    </div>
  );
}
