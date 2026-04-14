"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  List,
  X,
} from "lucide-react";
import type { Meeting, Person, Slide } from "@/lib/meetings";

const SWIPE_THRESHOLD = 50;

export function SlideDeck({ meeting }: { meeting: Meeting }) {
  const [index, setIndex] = useState(0);
  const [showIndex, setShowIndex] = useState(false);
  const total = meeting.slides.length;
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= total) return;
      setIndex(next);
    },
    [total],
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

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
        <SlideBody slide={slide} accent={meeting.accent} />

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
            setIndex(i);
            setShowIndex(false);
          }}
          onClose={() => setShowIndex(false)}
        />
      )}
    </div>
  );
}

function SlideBody({ slide, accent }: { slide: Slide; accent: string }) {
  const wrap =
    "absolute inset-0 overflow-y-auto px-5 sm:px-10 lg:px-16 py-8 sm:py-12 flex";

  if (slide.kind === "title") {
    return (
      <div className={`${wrap} items-center`}>
        <div className="mx-auto max-w-4xl w-full">
          {slide.eyebrow && (
            <div
              className="text-xs sm:text-sm uppercase tracking-[0.3em] font-semibold mb-6 sm:mb-8"
              style={{ color: accent }}
            >
              {slide.eyebrow}
            </div>
          )}
          <h1
            className="font-bold tracking-tight leading-[0.95]"
            style={{ fontSize: "clamp(2.25rem, 9vw, 6rem)" }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-6 sm:mt-8 text-lg sm:text-2xl text-zinc-300 leading-snug max-w-3xl">
              {slide.subtitle}
            </p>
          )}
          {slide.footer && (
            <div className="mt-10 sm:mt-14 text-sm sm:text-base text-zinc-500 font-mono">
              {slide.footer}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (slide.kind === "section") {
    return (
      <div className={`${wrap} items-center`}>
        <div className="mx-auto max-w-4xl w-full">
          <div
            className="font-black tracking-tighter leading-none opacity-90"
            style={{
              fontSize: "clamp(5rem, 22vw, 14rem)",
              color: accent,
            }}
          >
            {slide.number}
          </div>
          <h2
            className="mt-2 sm:mt-4 font-bold tracking-tight leading-tight"
            style={{ fontSize: "clamp(1.75rem, 6vw, 4rem)" }}
          >
            {slide.title}
          </h2>
          {slide.blurb && (
            <p className="mt-5 sm:mt-6 text-base sm:text-xl text-zinc-400 leading-relaxed max-w-2xl">
              {slide.blurb}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (slide.kind === "bullets") {
    return (
      <div className={`${wrap} items-start sm:items-center`}>
        <div className="mx-auto max-w-4xl w-full">
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
            style={{ fontSize: "clamp(1.75rem, 5.5vw, 3.25rem)" }}
          >
            {slide.title}
          </h2>
          {slide.body && (
            <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-3xl">
              {slide.body}
            </p>
          )}
          <ul className="mt-7 sm:mt-10 space-y-4 sm:space-y-5">
            {slide.items.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 sm:gap-5 items-start border-t border-white/5 pt-4 sm:pt-5 first:border-t-0 first:pt-0"
              >
                <div
                  className="shrink-0 font-mono text-xs sm:text-sm mt-1"
                  style={{ color: accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-xl font-semibold text-white leading-snug">
                    {item.label}
                  </div>
                  {item.detail && (
                    <div className="mt-1 text-sm sm:text-base text-zinc-400 leading-relaxed">
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
      <div className={`${wrap} items-start sm:items-center`}>
        <div className="mx-auto max-w-6xl w-full">
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
            style={{ fontSize: "clamp(1.5rem, 4.5vw, 2.75rem)" }}
          >
            {slide.title}
          </h2>
          <div className="mt-7 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {slide.cards.map((card, i) => (
              <div
                key={i}
                className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6"
              >
                <div
                  className="absolute top-5 right-5 text-xs font-mono"
                  style={{ color: card.accent }}
                >
                  {card.label}
                </div>
                <div
                  className="w-8 h-1 rounded-full mb-4"
                  style={{ background: card.accent }}
                />
                <div className="text-xl sm:text-2xl font-semibold tracking-tight mb-2">
                  {card.heading}
                </div>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
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
      <div className={`${wrap} items-center`}>
        <div className="mx-auto max-w-4xl w-full">
          <div
            aria-hidden
            className="font-serif leading-none mb-2 sm:mb-4 opacity-20"
            style={{ fontSize: "clamp(4rem, 14vw, 10rem)", color: accent }}
          >
            &ldquo;
          </div>
          <blockquote
            className="font-medium tracking-tight leading-[1.15] text-white"
            style={{ fontSize: "clamp(1.5rem, 5vw, 3rem)" }}
          >
            {slide.quote}
          </blockquote>
          {slide.attribution && (
            <div className="mt-6 sm:mt-8 text-sm sm:text-base text-zinc-500 uppercase tracking-widest">
              {slide.attribution}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (slide.kind === "stat") {
    return (
      <div className={`${wrap} items-center`}>
        <div className="mx-auto max-w-4xl w-full text-center sm:text-left">
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
              fontSize: "clamp(6rem, 28vw, 18rem)",
              background: `linear-gradient(180deg, ${accent}, #FFCC00)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {slide.value}
          </div>
          <div
            className="mt-2 sm:mt-4 font-semibold tracking-tight"
            style={{ fontSize: "clamp(1.25rem, 4vw, 2.25rem)" }}
          >
            {slide.label}
          </div>
          {slide.context && (
            <p className="mt-4 text-sm sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto sm:mx-0">
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
      count === 2 ? "sm:grid-cols-2" : count >= 3 ? "md:grid-cols-3" : "";
    return (
      <div className={`${wrap} items-start sm:items-center`}>
        <div className="mx-auto max-w-6xl w-full">
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
            style={{ fontSize: "clamp(1.5rem, 4.5vw, 2.75rem)" }}
          >
            {slide.title}
          </h2>
          {slide.body && (
            <p className="mt-3 text-sm sm:text-lg text-zinc-400 leading-relaxed max-w-3xl">
              {slide.body}
            </p>
          )}
          {count === 1 ? (
            <div className="mt-6 sm:mt-10 max-w-3xl">
              <PersonCard person={slide.people[0]!} spotlight />
            </div>
          ) : (
            <div
              className={`mt-6 sm:mt-10 grid grid-cols-1 ${gridCols} gap-4 sm:gap-6`}
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
      <div className={`${wrap} items-start sm:items-center`}>
        <div className="mx-auto max-w-6xl w-full">
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
            style={{ fontSize: "clamp(1.5rem, 4.5vw, 2.75rem)" }}
          >
            {slide.title}
          </h2>
          {slide.body && (
            <p className="mt-3 text-sm sm:text-lg text-zinc-400 leading-relaxed max-w-3xl">
              {slide.body}
            </p>
          )}
          <div className="mt-6 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
            {slide.people.map((p, i) => (
              <CabinetCard key={i} person={p} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // cta
  return (
    <div className={`${wrap} items-center`}>
      <div className="mx-auto max-w-3xl w-full">
        {slide.eyebrow && (
          <div
            className="text-xs uppercase tracking-[0.3em] font-semibold mb-5"
            style={{ color: accent }}
          >
            {slide.eyebrow}
          </div>
        )}
        <h2
          className="font-bold tracking-tight leading-tight"
          style={{ fontSize: "clamp(2rem, 7vw, 4.5rem)" }}
        >
          {slide.title}
        </h2>
        {slide.body && (
          <p className="mt-5 text-base sm:text-xl text-zinc-300 leading-relaxed">
            {slide.body}
          </p>
        )}
        <ul className="mt-8 space-y-3">
          {slide.actions.map((a, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-base sm:text-xl text-white"
            >
              <ArrowRight
                className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
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

function PersonMeta({ person }: { person: Person }) {
  return (
    <>
      <div
        className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-1.5"
        style={{ color: person.accent }}
      >
        {person.role}
      </div>
      <div className="text-lg sm:text-2xl font-semibold tracking-tight mb-3">
        {person.name}
      </div>
      {person.bullets && person.bullets.length > 0 && (
        <ul className="space-y-2">
          {person.bullets.map((b, i) => (
            <li
              key={i}
              className="text-sm sm:text-base text-zinc-300 leading-relaxed flex gap-2.5"
            >
              <span
                className="shrink-0 mt-1.5 w-1 h-1 rounded-full"
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

function PersonCard({
  person,
  spotlight = false,
}: {
  person: Person;
  spotlight?: boolean;
}) {
  if (spotlight) {
    // 1 person: image on left (fixed width on desktop), content on right.
    return (
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row">
        <PersonPhoto
          person={person}
          className="w-full aspect-[4/5] md:w-64 md:aspect-auto md:self-stretch md:shrink-0"
          sizes="(max-width: 768px) 100vw, 256px"
          initialsFontSize="clamp(3.5rem, 10vw, 6rem)"
        />
        <div className="p-5 sm:p-6 flex-1 min-w-0">
          <PersonMeta person={person} />
        </div>
      </div>
    );
  }
  // 2 or 3 people: card with photo on top in portrait ratio.
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
      <PersonPhoto
        person={person}
        className="w-full aspect-[4/5]"
        sizes="(max-width: 768px) 100vw, 33vw"
        initialsFontSize="clamp(3rem, 7vw, 5rem)"
      />
      <div className="p-4 sm:p-5 flex-1">
        <PersonMeta person={person} />
      </div>
    </div>
  );
}

function CabinetCard({ person }: { person: Person }) {
  const pos = person.position ?? "center top";
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden flex items-center gap-3 p-3">
      <div
        className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-zinc-900"
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
            sizes="64px"
            className="object-cover"
            style={{ objectPosition: pos }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-base font-bold"
              style={{ color: person.accent }}
            >
              {person.initials}
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm sm:text-base font-semibold text-white leading-tight">
          {person.name}
        </div>
        <div
          className="text-[10px] sm:text-xs uppercase tracking-wider font-medium mt-0.5 leading-snug"
          style={{ color: person.accent }}
        >
          {person.role}
        </div>
      </div>
    </div>
  );
}
