import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { MEETINGS } from "@/lib/meetings";
import "@/components/tts/pages.css";

export const metadata: Metadata = {
  title: "Meetings | Trojan Tech Solutions",
  robots: { index: false, follow: false },
};

const fmt = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
const short = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/* Every meeting on one dated line, spaced by real days between them, so the
 * gaps are the gaps. Drawn from lib/meetings; the newest is the one mark in
 * the accent. */
function Calendar({ meetings }: { meetings: typeof MEETINGS }) {
  const days = meetings.map((m) => Date.parse(`${m.date}T12:00:00Z`) / 86400000);
  const lo = Math.min(...days);
  const span = Math.max(1, Math.max(...days) - lo);
  const x = (d: number) => 12 + ((d - lo) / span) * 136;
  const newest = Math.max(...days);
  return (
    <svg className="f" viewBox="0 0 160 22" role="img" aria-label={`${meetings.length} meetings, ${meetings.map((m) => fmt(m.date)).join(", ")}`}>
      <path className="f-ink f-draw" pathLength={1} d="M4 12 L156 12" />
      {meetings.map((m, i) => (
        <g key={m.slug}>
          <path className="f-ink" d={`M${x(days[i])} 9 L${x(days[i])} 15`} />
          <circle className={days[i] === newest ? "f-live-fill" : "f-fill"} cx={x(days[i])} cy="12" r="1" />
          <text className="f-label f-label-ink" x={x(days[i])} y="6" textAnchor="middle">
            {String(m.number).padStart(2, "0")}
          </text>
          <text className="f-label" x={x(days[i])} y="20" textAnchor="middle">
            {short(m.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function MeetingsIndexPage() {
  const meetings = [...MEETINGS].sort((a, b) => b.number - a.number);
  return (
    <Shell>
      <section className="pg-sec pg-view is-top" aria-labelledby="meetings-title">
        <div className="pg-head">
          <p className="pg-kicker">Members only</p>
          <h1 id="meetings-title" className="pg-title">
            Meetings
          </h1>
          <p className="pg-lead">Slides and notes from every general meeting, newest first.</p>
        </div>
        <div className="pg-figure mt-l">
          <Calendar meetings={MEETINGS} />
        </div>
      </section>
      <section className="pg-sec" aria-label="All meetings">
        <div className="pg-table">
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Meeting</th>
                <th scope="col">Date</th>
                <th scope="col" className="num">
                  Slides
                </th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => (
                <tr key={m.slug}>
                  <td>
                    {m.title}
                    <span className="sub">{m.summary}</span>
                  </td>
                  <td>
                    {fmt(m.date)}
                    <span className="sub">{m.location}</span>
                  </td>
                  <td className="num">
                    <Link className="link" href={`/meetings/${m.slug}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
