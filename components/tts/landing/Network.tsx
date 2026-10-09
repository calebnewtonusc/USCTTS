"use client";

import { useEffect, useRef, useState } from "react";
import { ALUMNI, type Person } from "@/data/people";

/*
 * "See our network" (Tyler, 2026-10-09): where alumni went, the company
 * logos prominent "that would add a lot of credibility", real faces, and a
 * click into an interactive view. The wall is one tile per company, its
 * mark large and in one ink at rest; the faces of the people there sit
 * under it. Tapping a tile opens that company's people, bigger, in a
 * dialog (Escape or the close button returns focus to the tile).
 *
 * Albert Chung's employer stays off on purpose (people.ts: "We shouldn't
 * flex palantir"), so his tile is his role.
 */

// Marks on disk. A company without one is set as type.
const LOGOS: Record<string, string> = {
  Apple: "/tts/alumni/apple.svg",
  Bloomberg: "/tts/alumni/bloomberg.svg",
  "Capital One": "/tts/alumni/capitalone.svg",
  Citi: "/tts/alumni/citi.svg",
  Fastly: "/tts/alumni/fastly.svg",
  Jefferies: "/tts/alumni/jefferies.svg",
  Nomura: "/tts/alumni/nomura.svg",
  PwC: "/tts/alumni/pwc.svg",
  Reddit: "/tts/alumni/reddit.svg",
};

type Group = { key: string; title: string; people: Person[] };

/* One tile per company, bigger groups first, then the ones with a mark. */
function groups(people: Person[]): Group[] {
  const m = new Map<string, Person[]>();
  for (const p of people) {
    const key = p.company ?? `role:${p.name}`;
    m.set(key, [...(m.get(key) ?? []), p]);
  }
  return [...m.entries()]
    .map(([key, ps]) => ({
      key,
      title: ps[0].company ?? ps[0].role,
      people: ps,
    }))
    .sort(
      (a, b) =>
        b.people.length - a.people.length ||
        Number(Boolean(LOGOS[b.key])) - Number(Boolean(LOGOS[a.key])),
    );
}

const GROUPS = groups(ALUMNI);

export default function Network() {
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Group | null>(null);

  // Opened after React has rendered the panel, so the dialog's own focus
  // step lands on Close and its label exists when it is announced.
  useEffect(() => {
    const d = dlg.current;
    if (open && d && !d.open) d.showModal();
  }, [open]);
  const show = (g: Group) => setOpen(g);

  return (
    <>
      <ul className="nw-wall" aria-label="Companies our alumni work at">
        {GROUPS.map((g, i) => (
          <li
            key={g.key}
            className={`nw-tile${g.people.length > 1 ? " is-wide" : ""}`}
            data-reveal={String(i % 4)}
          >
            <button
              type="button"
              className="nw-btn"
              aria-haspopup="dialog"
              onClick={() => show(g)}
            >
              <span className="nw-mark">
                {LOGOS[g.key] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={LOGOS[g.key]} alt={g.title} loading="lazy" />
                ) : (
                  <span
                    className={`nw-name${g.key.startsWith("role:") ? " is-role" : ""}`}
                  >
                    {g.title}
                  </span>
                )}
              </span>
              <span className="nw-faces">
                {g.people.map((p) =>
                  p.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={p.name}
                      src={p.photo}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null,
                )}
                <span className="nw-who">
                  {g.people.map((p) => p.name.split(" ")[0]).join(" and ")}
                </span>
                <span className="nw-go" aria-hidden="true">
                  &rarr;
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dlg}
        className="nw-dialog"
        aria-labelledby="nw-dialog-h"
        onClose={() => setOpen(null)}
        onClick={(e) => {
          // A click on the backdrop (the dialog element itself) closes it.
          if (e.target === e.currentTarget) dlg.current?.close();
        }}
      >
        {open && (
          <div className="nw-panel">
            <div className="nw-panel-head">
              {LOGOS[open.key] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={LOGOS[open.key]} alt="" className="nw-panel-mark" />
              ) : null}
              <h3 id="nw-dialog-h">
                {open.key.startsWith("role:")
                  ? "Started at TTS"
                  : `Started at TTS, now at ${open.title}`}
              </h3>
              <button
                type="button"
                className="nw-close"
                autoFocus
                onClick={() => dlg.current?.close()}
              >
                Close
              </button>
            </div>
            <ul className="nw-people">
              {open.people.map((p) => (
                <li key={p.name}>
                  {p.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photo} alt="" />
                  )}
                  <b>{p.name}</b>
                  <span>{p.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </dialog>
    </>
  );
}
