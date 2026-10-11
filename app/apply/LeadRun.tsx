"use client";

import { useEffect, useRef, useState } from "react";

/* What a member builds, shown working: the funder list from /way's example
 * project, a nonprofit in Ghana that needs donor outreach, filling itself
 * row by row with a reason and a drafted first email. The rows mount when
 * the table comes into view, so the reader sees them arrive (pages.css
 * times them per row); reduced motion shows them finished. */
const LEADS = [
  { biz: "Family foundation", where: "London", why: "New West Africa education fund" },
  { biz: "Corporate giving arm", where: "Accra", why: "New Accra office" },
  { biz: "Diaspora giving circle", where: "Houston", why: "Members from the region" },
];

export default function LeadRun() {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setOn(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure
      ref={ref}
      className="ix-panel jo-panel"
      aria-label="An example lead list a member builds, filling itself"
    >
      <div className="ix-bar">
        <span>For a nonprofit in Ghana</span>
        <span>{on ? `${LEADS.length} drafts ready` : "searching"}</span>
      </div>
      <ul className="ix-rows">
        <li className="is-head" aria-hidden="true">
          <span>funder</span>
          <span>why it&apos;s worth reaching</span>
          <span>email</span>
        </li>
        {on &&
          LEADS.map((l, i) => (
            <li key={l.biz} style={{ ["--i" as string]: i }}>
              <span className="biz">
                {l.biz}, {l.where}
              </span>
              <span className="why">{l.why}</span>
              <span className="st">drafted</span>
            </li>
          ))}
      </ul>
      <figcaption className="jo-cap">
        an example build, not a past client
      </figcaption>
    </figure>
  );
}
