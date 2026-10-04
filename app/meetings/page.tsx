import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import { MEETINGS } from "@/lib/meetings";

export const metadata: Metadata = {
  title: "Meetings | Trojan Tech Solutions",
  robots: { index: false, follow: false },
};

const fmt = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default function MeetingsIndexPage() {
  const meetings = [...MEETINGS].sort((a, b) => b.number - a.number);
  return (
    <Shell>
      <section className="hero col section-head prose" aria-labelledby="meetings-title">
        <h1 id="meetings-title" className="t-h2">
          Meetings
        </h1>
        <p className="t-lead">Slides and notes from every general meeting, newest first. Members only.</p>
      </section>
      <section className="section" aria-label="All meetings">
        <div className="wide exhibit">
          <table className="ledger mt-s">
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
