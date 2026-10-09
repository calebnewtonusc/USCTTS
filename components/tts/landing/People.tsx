import { ADVISORS, LEADERSHIP, type Person } from "@/data/people";

/*
 * The mentors and the team on home's sheet (Tyler's voice memos,
 * 2026-10-09: "these people actually want to help you", with Duncan and the
 * others' real photos and background, then the team with professional
 * photos only). The alumni wall is Network.tsx. Every face appears once on
 * the page.
 */

function Face({ p, className }: { p: Person; className?: string }) {
  if (!p.photo) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={p.photo}
      alt=""
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}

export function Mentors() {
  return (
    <ul className="pp-cards">
      {ADVISORS.map((p, i) => (
        <li key={p.name} className="pp-card" data-reveal={String(i % 3)}>
          <Face p={p} className="pp-card-face" />
          <span className="pp-card-body">
            <b>{p.name}</b>
            <span>{p.role}</span>
            {p.company && (
              <span className="pp-card-co">
                {p.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt="" loading="lazy" />
                )}
                {p.company}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Team() {
  return (
    <ul className="pp-team-row">
      {LEADERSHIP.map((p, i) => {
        const body = (
          <>
            <Face p={p} className="pp-team-face" />
            <span className="pp-card-body">
              <b>{p.name}</b>
              <span>{p.role}</span>
            </span>
          </>
        );
        return (
          <li key={p.name} className="pp-team-card" data-reveal={String(i)}>
            {p.link ? (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="pp-team-link"
                aria-label={`${p.name}, ${p.role}, on LinkedIn`}
              >
                {body}
                <span className="pp-go" aria-hidden="true">
                  &rarr;
                </span>
              </a>
            ) : (
              <div className="pp-team-link is-static">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
