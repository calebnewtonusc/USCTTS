"use client";

import { useEffect, useState } from "react";

/* An example front-desk inbox, the same dental office in Koreatown the home
 * page follows, so an owner sees their week before reading a word. The
 * messages are the kind that office really gets, labelled as an example.
 * The unread count climbs once on load; reduced motion shows the end. */
const MAILS = [
  { who: "Grace L.", subj: "Can I move my cleaning to Thursday?", t: "9:14" },
  { who: "Daniel P.", subj: "Do you take Delta Dental?", t: "9:09" },
  { who: "Min-ji K.", subj: "Are you open Saturdays?", t: "8:57" },
  { who: "Ana V.", subj: "Could you resend my last invoice?", t: "8:30" },
];
const START = 6;
const END = 41;

export default function Inbox() {
  const [n, setN] = useState(START);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setN(END));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const t0 = performance.now() + 300;
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0) / 2600));
      const eased = 1 - Math.pow(1 - k, 3);
      setN(Math.round(START + (END - START) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <figure className="ix-panel" aria-label={`An example front desk inbox with ${END} unread emails`}>
      <div className="ix-bar">
        <span>A dental office&apos;s inbox, for example</span>
        <span className="ix-count">{n} unread</span>
      </div>
      <ul className="ix-mail">
        {MAILS.map((m, i) => (
          <li key={m.who} className={i < 3 ? "is-new" : undefined} style={{ ["--i" as string]: i }}>
            <span className="who">{m.who}</span>
            <span className="subj">{m.subj}</span>
            <span className="t">{m.t}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
