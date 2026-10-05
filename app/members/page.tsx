import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";
import MembersStory from "./MembersStory";
import "@/components/tts/pages.css";
import "./members.css";

export const metadata: Metadata = {
  title: "People | Trojan Tech Solutions",
  description:
    "How Trojan Tech Solutions went from a dormant club with nobody in it to a full roster in about three months, and the advisor and mentors behind it.",
};

export default function MembersPage() {
  return (
    <Shell>
      <div className="pgx">
        <MembersStory />
        <section className="ms-close" aria-labelledby="close-title">
          <div>
            <h2 id="close-title">So the next seat on that roster could be yours.</h2>
            <Link href="/apply" className="btn btn-primary">
              Join TTS{" "}
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
          <svg viewBox="0 0 500 120" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={i * 84}
                y="10"
                width="72"
                height="88"
                className={i % 2 ? "ms-fillc-gold" : "ms-fillc-sky"}
              />
            ))}
            <rect
              className="ms-open-seat"
              x="420"
              y="10"
              width="72"
              height="88"
            />
            <text className="ms-you" x="456" y="60" textAnchor="middle">
              you
            </text>
          </svg>
        </section>
      </div>
    </Shell>
  );
}
