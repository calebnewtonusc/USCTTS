import { ADVISORS, ALUMNI, LEADERSHIP, type Person } from "@/data/people";
import Depth from "./Depth";

/*
 * Where the students go, who helps them, and who runs it: the end of the
 * semester's story and the proof under it. Tyler, in his voice memos: a
 * prominent alumni network with logos and faces, then "these people
 * actually want to help you", then the team.
 *
 * Every face appears once on the page. The alumni wall holds the alumni
 * only (the mentors have their own row), and every number is the length of
 * a list in data/people.ts. Albert Chung's employer stays off on purpose
 * (people.ts: "We shouldn't flex palantir"), so he's on a card of his own
 * with his role.
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
  Google: "/img/logos/google.png",
  "McKinsey & Company": "/img/logos/mckinsey.png",
  Mixbook: "/img/logos/mixbook.png",
  "Stanford GSB": "/img/logos/stanford.png",
};

/* One card per company, carrying everyone who is there; people with no
 * company listed get a card each. Bigger groups first. */
function cards(people: Person[]) {
  const m = new Map<string, Person[]>();
  for (const p of people) {
    const key = p.company ?? `role:${p.name}`;
    m.set(key, [...(m.get(key) ?? []), p]);
  }
  return [...m.entries()].sort(
    (a, b) =>
      b[1].length - a[1].length ||
      Number(Boolean(LOGOS[b[0]])) - Number(Boolean(LOGOS[a[0]])),
  );
}

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

export default function People() {
  const wall = cards(ALUMNI);
  return (
    <section id="v4-alumni" className="pp" aria-labelledby="pp-alumni-h">
      <Depth />
      <div className="pp-wrap">
        <h2 id="pp-alumni-h" className="pp-say" data-reveal="0">
          Then you graduate. This is where the {ALUMNI.length} people who
          started at TTS went.
        </h2>
        <ul className="pp-wall">
          {wall.map(([key, people], i) => {
            const company = people[0].company;
            return (
              <li
                key={key}
                className={`pp-co${people.length > 1 ? " is-wide" : ""}`}
                data-reveal={String(i % 4)}
                data-depth={String([0.04, 0.09, 0.06, 0.12][i % 4])}
              >
                {company && (
                  <span className="pp-co-mark">
                    {LOGOS[company] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={LOGOS[company]} alt={company} loading="lazy" />
                    ) : (
                      <span className="pp-co-name">{company}</span>
                    )}
                  </span>
                )}
                <span className="pp-co-people">
                  {people.map((p) => (
                    <span key={p.name} className="pp-person">
                      <Face p={p} />
                      <span className="pp-who">
                        <b>{p.name}</b>
                        <span>{p.role}</span>
                      </span>
                    </span>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pp-wrap pp-mentors">
        <h2 className="pp-big" data-reveal="0">
          These people actually want to help you.
        </h2>
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
      </div>

      <div className="pp-wrap pp-team">
        <h2 className="pp-big" data-reveal="0">
          When Matthew Kim graduated, he handed TTS to Caleb and Tyler.
        </h2>
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
      </div>
    </section>
  );
}
