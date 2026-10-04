"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ArrowRight } from "lucide-react";

/* The signature on /tc: name your company and the page becomes a brief for
 * it. Search runs on the server (/api/yc/search, the index is 550KB) and each
 * hit is a real link to /tc/for/<slug>.
 *
 * While nobody is using it, it demonstrates itself: it types a real recent
 * company from the index, shows the first line of that company's brief, and
 * moves on. That loop is the page's one ambient motion, and its reason is the
 * instruction it teaches. It pauses offscreen, on a hidden tab, and the moment
 * the visitor focuses or types, banks its elapsed time so it resumes where it
 * stopped, and under reduced motion it never starts: the first company sits
 * there fully typed. */

export interface DemoCompany {
  slug: string;
  name: string;
  batch: string;
  oneLiner: string;
}

interface Hit {
  slug: string;
  name: string;
  oneLiner: string;
  batch: string;
}

type SearchState = "idle" | "loading" | "done" | "error";

// Timings for the typing demo. 70ms a character reads as a fast typist rather
// than a ticker; the hold is long enough to read a one-liner of about 60
// characters at a skim. Both tuned by eye on 2026-10-03, never measured.
const TYPE_MS = 70;
const ERASE_MS = 28;
const HOLD_MS = 2400;
const GAP_MS = 320;
// Below this a search returns half the index and nothing useful.
const MIN_QUERY = 2;
// Requests are debounced so typing "stripe" sends one request, not six.
const DEBOUNCE_MS = 140;

function batchLabel(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

export default function Lookup({
  demo,
  initialQuery = "",
  label,
}: {
  demo: DemoCompany[];
  initialQuery?: string;
  label: string;
}) {
  const id = useId();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [hits, setHits] = useState<Hit[]>([]);
  const [state, setState] = useState<SearchState>("idle");
  const [active, setActive] = useState(-1);
  const [focused, setFocused] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [suggested, setSuggested] = useState(false);

  // Demo state. `typed` is how many characters of the current name show.
  const [demoIndex, setDemoIndex] = useState(0);
  const [typed, setTyped] = useState(() => demo[0]?.name.length ?? 0);
  const [demoOn, setDemoOn] = useState(false);

  /* ---------- search ---------- */
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY) {
      setHits([]);
      setState("idle");
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setState("loading");
      try {
        const res = await fetch(`/api/yc/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data: unknown = await res.json();
        const list =
          data &&
          typeof data === "object" &&
          Array.isArray((data as { hits?: unknown }).hits)
            ? (data as { hits: Hit[] }).hits
            : [];
        let found = list;
        let fuzzy = false;
        // Substring search found nothing: ask for typo-distance matches
        // before telling a founder their company is not there.
        if (found.length === 0) {
          const near = await fetch(`/tc/suggest?q=${encodeURIComponent(q)}`, { signal: controller.signal });
          if (near.ok) {
            const nearData: unknown = await near.json();
            if (nearData && typeof nearData === "object" && Array.isArray((nearData as { hits?: unknown }).hits)) {
              found = (nearData as { hits: Hit[] }).hits;
              fuzzy = found.length > 0;
            }
          }
        }
        setHits(found);
        setSuggested(fuzzy);
        setActive(found.length ? 0 : -1);
        setState("done");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState("error");
      }
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, attempt]);

  /* ---------- the idle demo ---------- */
  const reduced = useRef(false);
  const visible = useRef(true);
  const onScreen = useRef(false);

  const shouldRun = useCallback(
    () =>
      demo.length > 0 &&
      !reduced.current &&
      visible.current &&
      onScreen.current &&
      !focused &&
      query === "",
    [demo.length, focused, query],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    visible.current = document.visibilityState === "visible";
    const el = rootRef.current;
    const io = new IntersectionObserver(([entry]) => {
      onScreen.current = entry.isIntersecting;
      setDemoOn(shouldRun());
    });
    if (el) io.observe(el);
    const onVis = () => {
      visible.current = document.visibilityState === "visible";
      setDemoOn(shouldRun());
    };
    const onMq = () => {
      reduced.current = mq.matches;
      setDemoOn(shouldRun());
    };
    document.addEventListener("visibilitychange", onVis);
    mq.addEventListener("change", onMq);
    setDemoOn(shouldRun());
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      mq.removeEventListener("change", onMq);
    };
  }, [shouldRun]);

  // One rAF loop, advancing a banked clock only while the demo is on. Phases
  // are derived from elapsed time within the current company's cycle, so a
  // pause anywhere resumes at the same character.
  const elapsed = useRef(0);
  const demoIndexRef = useRef(0);
  useEffect(() => {
    if (!demoOn || demo.length === 0) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Clamp, so a dropped frame or a long task cannot skip a whole phase.
      elapsed.current += Math.min(now - last, 64);
      last = now;
      const name = demo[demoIndexRef.current].name;
      const typeEnd = name.length * TYPE_MS;
      const holdEnd = typeEnd + HOLD_MS;
      const eraseEnd = holdEnd + name.length * ERASE_MS;
      const cycle = eraseEnd + GAP_MS;
      const t = elapsed.current;
      if (t >= cycle) {
        elapsed.current = 0;
        const next = (demoIndexRef.current + 1) % demo.length;
        demoIndexRef.current = next;
        setDemoIndex(next);
        setTyped(0);
      } else if (t < typeEnd) {
        setTyped(Math.floor(t / TYPE_MS) + 1);
      } else if (t < holdEnd) {
        setTyped(name.length);
      } else if (t < eraseEnd) {
        setTyped(
          Math.max(0, name.length - Math.floor((t - holdEnd) / ERASE_MS) - 1),
        );
      } else {
        setTyped(0);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [demoOn, demo]);
  /* ---------- keyboard ---------- */
  function go(slug: string) {
    router.push(`/tc/for/${slug}`);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!hits.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + hits.length) % hits.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(hits[active].slug);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  }

  const showResults = query.trim().length >= MIN_QUERY;
  const current = demo[demoIndex];
  const fullyTyped = current ? typed >= current.name.length : false;
  const listId = `${id}-list`;

  return (
    <div className="tc-lookup" ref={rootRef}>
      <label htmlFor={`${id}-q`} className="tc-lookup-label">
        {label}
      </label>
      <div className={`tc-lookup-field${focused ? " is-focused" : ""}`}>
        <input
          ref={inputRef}
          id={`${id}-q`}
          className="tc-lookup-input"
          type="text"
          role="combobox"
          aria-expanded={showResults && hits.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showResults && active >= 0 ? `${id}-opt-${active}` : undefined
          }
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {/* The typed demo is painted over the empty field, never written into
         * it, so assistive tech and autofill only ever see the real value. */}
        {!focused && query === "" && current ? (
          <span className="tc-lookup-ghost" aria-hidden="true">
            {current.name.slice(0, typed)}
            <span className={`tc-caret${demoOn ? "" : " is-still"}`} />
          </span>
        ) : null}
      </div>

      <div className="tc-lookup-out" aria-live="polite">
        {showResults ? (
          <>
            {state === "loading" && hits.length === 0 ? (
              <p className="tc-note-line">Looking through the directory.</p>
            ) : null}
            {state === "error" ? (
              <p className="tc-err">
                The directory didn&apos;t answer.{" "}
                <button
                  type="button"
                  className="tc-textbtn"
                  onClick={() => setAttempt((n) => n + 1)}
                >
                  Try again
                </button>
              </p>
            ) : null}
            {state === "done" && hits.length === 0 ? (
              <p className="tc-note-line">
                No YC company called &ldquo;{query.trim()}&rdquo; in the
                directory. Try the name without Inc, or the name it had at Demo
                Day.
              </p>
            ) : null}
            {state === "done" && suggested ? (
              <p className="tc-note-line">Nothing spelled exactly like that. The closest names in the directory:</p>
            ) : null}
            <ul
              id={listId}
              role="listbox"
              aria-label="Companies"
              className="tc-hits"
            >
              {hits.map((h, i) => (
                <li
                  key={h.slug}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`tc-hit${i === active ? " is-active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                >
                  <Link
                    href={`/tc/for/${h.slug}`}
                    className="tc-hit-link"
                    tabIndex={-1}
                  >
                    <span className="tc-hit-name">{h.name}</span>
                    <span className="tc-hit-meta">
                      {batchLabel(h.batch)}
                      {h.oneLiner ? `, ${h.oneLiner}` : ""}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="tc-icon tc-hit-go"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : current ? (
          <div className={`tc-preview${fullyTyped ? " is-shown" : ""}`}>
            <p className="tc-preview-line">
              <mark className="tc-fill tc-fill--live">{current.batch}</mark>{" "}
              <span className="tc-preview-one">{current.oneLiner}</span>
            </p>
            <Link href={`/tc/for/${current.slug}`} className="tc-link">
              See the brief for {current.name}
              <ArrowRight aria-hidden="true" className="tc-icon" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
