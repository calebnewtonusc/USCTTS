"use client";

import { useEffect, useRef } from "react";

/* The format argument, drawn instead of listed.
 *
 * The page's one scroll-linked layer. One progress value is computed per frame
 * from the exhibit's position and both lines read it, mapped to the same time
 * axis, so at any scroll position both formats are at the same week. The deck
 * line stops at the end of the semester and ours keeps going, which is the
 * whole argument. Under reduced motion both render complete.
 */

type Mark = { at: number; label: string; small?: string };

// Positions are fractions of the time axis. The semester ends at 0.72; the
// rest of the axis is the time after it, when the client is on their own.
const SEMESTER_END = 0.72;
const DECK: Mark[] = [
  { at: 0, label: "Kickoff" },
  { at: 0.3, label: "Research and interviews" },
  { at: 0.66, label: "Final deck presented", small: "Then everyone graduates" },
];
const OURS: Mark[] = [
  { at: 0, label: "Scope one problem" },
  { at: 0.3, label: "Built in their stack" },
  { at: 0.55, label: "Handed over", small: "Owner named, SOP written" },
  { at: 1, label: "Still running", small: "Measured before and after" },
];

// The ease is shared by both lines, so neither leads the other.
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function Wide() {
  const x = (f: number) => 40 + f * 900;
  return (
    <svg
      className="tl-wide"
      viewBox="0 0 1000 300"
      role="img"
      aria-labelledby="tl-title-w"
    >
      <title id="tl-title-w">
        Two engagements on the same semester timeline
      </title>
      <line className="tl-axis" x1={x(0)} x2={x(1)} y1="272" y2="272" />
      <line
        className="tl-end"
        x1={x(SEMESTER_END)}
        x2={x(SEMESTER_END)}
        y1="22"
        y2="280"
      />
      <text x={x(SEMESTER_END) + 8} y="292" fontSize="13">
        End of semester
      </text>
      <text x={x(0)} y="292" fontSize="13">
        Week one
      </text>

      <text x={x(0)} y="44" fontSize="15" fontWeight="600">
        The deck format
      </text>
      <path
        className="tl-line is-deck"
        data-line="deck"
        pathLength={1}
        d={`M${x(0)} 90 H${x(DECK[2].at)}`}
      />
      {DECK.map((m) => (
        <g key={m.label} className="tl-mark" data-at={m.at}>
          <circle className="tl-dot" cx={x(m.at)} cy="90" r="6" />
          <text x={x(m.at)} y="118" fontSize="14">
            {m.label}
          </text>
          {m.small && (
            <text className="tl-small" x={x(m.at)} y="136">
              {m.small}
            </text>
          )}
        </g>
      ))}

      <text x={x(0)} y="168" fontSize="15" fontWeight="600">
        How TTS works
      </text>
      <path
        className="tl-line"
        data-line="ours"
        pathLength={1}
        d={`M${x(0)} 212 H${x(1)}`}
      />
      {OURS.map((m) => (
        <g key={m.label} className="tl-mark" data-at={m.at}>
          <circle className="tl-dot" cx={x(m.at)} cy="212" r="6" />
          <text
            x={x(m.at)}
            y="240"
            fontSize="14"
            textAnchor={m.at === 1 ? "end" : "start"}
          >
            {m.label}
          </text>
          {m.small && (
            <text
              className="tl-small"
              x={x(m.at)}
              y="258"
              textAnchor={m.at === 1 ? "end" : "start"}
            >
              {m.small}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function Tall() {
  const y = (f: number) => 70 + f * 560;
  return (
    <svg
      className="tl-tall"
      viewBox="0 0 360 680"
      role="img"
      aria-labelledby="tl-title-t"
    >
      <title id="tl-title-t">
        Two engagements on the same semester timeline
      </title>
      <line
        className="tl-end"
        x1="0"
        x2="360"
        y1={y(SEMESTER_END)}
        y2={y(SEMESTER_END)}
      />
      <text x="358" y={y(SEMESTER_END) - 8} fontSize="12" textAnchor="end">
        End of semester
      </text>

      <text x="14" y="30" fontSize="14" fontWeight="600">
        The deck format
      </text>
      <path
        className="tl-line is-deck"
        data-line="deck"
        pathLength={1}
        d={`M20 ${y(0)} V${y(DECK[2].at)}`}
      />
      {DECK.map((m) => (
        <g key={m.label} className="tl-mark" data-at={m.at}>
          <circle className="tl-dot" cx="20" cy={y(m.at)} r="6" />
          <text x="34" y={y(m.at) + 5} fontSize="13">
            {m.label.replace(" and interviews", "")}
          </text>
        </g>
      ))}

      <text x="190" y="30" fontSize="14" fontWeight="600">
        How TTS works
      </text>
      <path
        className="tl-line"
        data-line="ours"
        pathLength={1}
        d={`M196 ${y(0)} V${y(1)}`}
      />
      {OURS.map((m) => (
        <g key={m.label} className="tl-mark" data-at={m.at}>
          <circle className="tl-dot" cx="196" cy={y(m.at)} r="6" />
          <text x="210" y={y(m.at) + 5} fontSize="13">
            {m.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Timeline() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const lines = Array.from(
      root.querySelectorAll<SVGPathElement>("[data-line]"),
    );
    const marks = Array.from(root.querySelectorAll<SVGGElement>("[data-at]"));

    const paint = (p: number) => {
      const t = ease(p);
      for (const line of lines) {
        // Both lines share one time axis. The deck line's path ends at its
        // last mark, so its own drawn fraction is time over that length.
        const end = line.dataset.line === "deck" ? DECK[2].at : 1;
        const drawn = Math.min(1, t / end);
        line.style.strokeDasharray = "1 1";
        line.style.strokeDashoffset = String(1 - drawn);
      }
      for (const m of marks) {
        const at = Number(m.dataset.at);
        m.style.opacity = t + 0.001 >= at ? "1" : "0.18";
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint(1);
      return;
    }

    let frame = 0;
    let inView = false;
    const loop = () => {
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the exhibit's top reaches 85% of the viewport, 1 when its
      // bottom reaches 65%: the drawing finishes while the whole figure is
      // still on screen.
      const start = vh * 0.85 - rect.top;
      const span = rect.height + vh * 0.2;
      paint(Math.min(1, Math.max(0, start / span)));
      if (inView) frame = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (inView) frame = requestAnimationFrame(loop);
      else loop();
    });
    io.observe(root);
    loop();
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <figure className="exhibit timeline" ref={ref}>
      <div className="mt-m">
        <Wide />
        <Tall />
      </div>
      <figcaption className="exhibit-caption label">
        <span>
          Exhibit 2. The same semester, two formats. A deck engagement ends at
          the presentation; ours ends with something the company keeps running
          after we leave.
        </span>
      </figcaption>
    </figure>
  );
}
