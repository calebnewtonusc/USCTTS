import Link from "next/link";
import { preload } from "react-dom";
import Shell from "../Shell";
import Stage from "../v4/Stage";
import Opening from "../v4/Opening";
import { Join } from "../home/Sections";
import { mono } from "../v4/mono";
import { NETWORK_PEOPLE } from "@/data/people";
import Depth from "./Depth";
import DotFloor from "./DotFloor";
import Network from "./Network";
import { Mentors } from "./People";
import Sheet from "./Sheet";
import Statement from "./Statement";
import TeamStory from "./TeamStory";
import Thread, { Mark } from "./Thread";
import "../v4/v4.css";
import "./landing.css";
import "./story.css";

/*
 * Home, in the order Tyler asked for in his voice memos on 2026-10-09
 * ("a more professional kind of first page that people see rather than an
 * animation you have to scroll through", and "it's just gotta start off
 * with like a basic page"):
 *
 *   the LA map and the USC dot, short ("the dot in LA is good")
 *   a separating tab, then "it goes into being a real website":
 *   1. who TTS is, big, on its clay city
 *   2. the work, which leaves LA
 *   3. the network, where the night field comes back as lines of light
 *   4. the club advisors
 *   5. understand the TTS way: the door into the 3D walkthrough at /way
 *   6. meet the team, told as the club's comeback
 *   7. the two doors
 *
 * Since 2026-10-10 it is one world, not two sites in one (Caleb: "I wanna
 * tastefully marry the 2, it seems like 2 sites in 1 rn"): the opener's
 * points are the floor under the clay scenes and the seams between
 * sections, USC's cardinal point travels down a thread that marks each
 * section, and the network is drawn in the field's own light. Every dot is
 * a street or a person. docs/INTENT-home.md lists every visible element
 * and the shared rules.
 */
export default function Landing() {
  // The grid's data starts with the HTML instead of after hydration. The
  // request must match loadGrid's fetch: same origin, CORS mode.
  preload("/tts/grid/la-grid.bin", { as: "fetch", crossOrigin: "anonymous" });
  return (
    <Shell footer="ending">
      <div className={`v4 ${mono.variable}`}>
        <Stage rail={false} />
        <div className="v4-content">
          <Opening
            short
            lines={["USC's AI implementation", "and go-to-market lab."]}
          />
        </div>

        <Sheet>
          <Depth />
          <Thread />
          {/* The lip carries only its grip: the first section names itself
           * in its marker, and a label here said the same words twice. */}
          <span className="ld-tab" aria-hidden="true" />

          {/* 01. Who TTS is, standing on its own city. */}
          <section className="ld-sec ld-who" aria-labelledby="ld-who-h">
            <div className="ld-wrap">
              <Mark n="01" label="who we are" />
              <Statement />
            </div>
          </section>

          {/* The seam: the city's points assemble out of the page and leave
           * the same way, so the next section arrives through the map. */}
          <div className="ld-seam" aria-hidden="true">
            <DotFloor
              win={[-5200, -900, 5200, 900]}
              usc
              max={2600}
              alpha={0.26}
            />
          </div>

          {/* 02. The work leaves LA. */}
          <section className="ld-sec ld-about" aria-labelledby="ld-about-h">
            <div className="ld-wrap">
              <div className="ld-card is-blush ld-work">
                <div className="ld-work-pic" data-reveal="1">
                  <DotFloor
                    win={[-2400, -1800, 2400, 1800]}
                    color="#7a1f1f"
                    alpha={0.34}
                    max={2400}
                    hold
                    className="ld-work-floor"
                  />
                  <div className="ld-frame is-blush">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/tts/home/mailbox-720.webp"
                      srcSet="/tts/home/mailbox-720.webp 720w, /tts/home/mailbox-1440.webp 1440w"
                      sizes="(min-width: 900px) 560px, 100vw"
                      alt="A gold clay mailbox with its red flag up and a sealed letter going out on its open door"
                      width={1440}
                      height={1080}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
                <div className="ld-work-copy">
                  <Mark n="02" label="our work" />
                  <p className="ld-lead" data-reveal="0">
                    And the work doesn&apos;t stay in LA.
                  </p>
                  <h2 id="ld-about-h" className="ld-h" data-reveal="0">
                    Real clients,{" "}
                    <em className="ld-accent">from Nigeria to Yemen.</em>
                  </h2>
                  {/* Tyler's voice memo, 2026-10-09: show what is special,
                   * the international work. Only the place and the field he
                   * named; nothing else is known yet. Nigeria's line matches
                   * second-brain/core/now.md (stemmets.com). NEED: Yemen's
                   * field, and where the cancer therapeutics client is. */}
                  <ul className="ld-manifest" aria-label="Client projects">
                    <li data-reveal="1">
                      <span className="ld-m-code">NG</span>
                      <b>Nigeria</b>
                      <span className="ld-m-what">
                        an AI curriculum for an education nonprofit
                      </span>
                    </li>
                    <li data-reveal="1">
                      <span className="ld-m-code">GH</span>
                      <b>Ghana</b>
                      <span className="ld-m-what">healthcare</span>
                    </li>
                    <li data-reveal="2">
                      <span className="ld-m-code">YE</span>
                      <b>Yemen</b>
                    </li>
                    <li data-reveal="2">
                      <span className="ld-m-code is-field" aria-hidden="true" />
                      <b>Cancer therapeutics</b>
                    </li>
                  </ul>
                  <Link href="/members" className="ld-btn" data-reveal="3">
                    Learn more about TTS <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 03. Where the two worlds meet: the night field comes back and
           * each person who started here is a line of light out of USC. */}
          <section className="ld-sec ld-net" aria-labelledby="ld-net-h">
            <div className="ld-net-band">
              <div className="ld-wrap">
                <div className="ld-net-head">
                  <Mark n="03" label="our network" tone="light" />
                  <h2 id="ld-net-h" className="ld-h" data-reveal="0">
                    See where TTS <em className="ld-accent">can get you.</em>
                  </h2>
                  <p className="ld-lede" data-reveal="1">
                    {NETWORK_PEOPLE.length} people started at TTS, and each line
                    of light is one of them. Tap a face to find them on
                    LinkedIn.
                  </p>
                </div>
                <Network />
              </div>
            </div>
          </section>

          {/* 04. The people you can call. */}
          <section className="ld-sec ld-mentors" aria-labelledby="ld-men-h">
            <div className="ld-wrap">
              <Mark n="04" label="club advisors" />
              <h2 id="ld-men-h" className="ld-h is-wide" data-reveal="0">
                Club advisors,{" "}
                <em className="ld-accent">open to a coffee chat anytime.</em>
              </h2>
              <Mentors />
            </div>
          </section>

          {/* 05. The door into the walkthrough. */}
          <section className="ld-sec ld-way" aria-labelledby="ld-way-h">
            <div className="ld-wrap">
              <Mark n="05" label="the TTS way" />
              <Link href="/way" className="ld-way-card" data-reveal="0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="ld-way-img"
                  src="/tts/home/writer-1200.webp"
                  srcSet="/tts/home/writer-1200.webp 1200w, /tts/home/writer-2400.webp 2400w"
                  sizes="(min-width: 1280px) 1184px, 100vw"
                  alt=""
                  width={2400}
                  height={1350}
                  loading="lazy"
                  decoding="async"
                />
                <span className="ld-way-copy">
                  <span id="ld-way-h" className="ld-way-h">
                    Understand <em className="ld-accent">the TTS way.</em>
                  </span>
                  <span className="ld-way-sub">
                    Follow one client project from the first lead to the
                    handover, in 3D.
                  </span>
                  <span className="ld-btn is-light">
                    Start the walkthrough <span aria-hidden="true">&rarr;</span>
                  </span>
                </span>
              </Link>
            </div>
          </section>

          {/* 06. The team, told as the comeback. */}
          <section className="ld-sec ld-team" aria-labelledby="ld-team-h">
            <div className="ld-wrap">
              <Mark n="06" label="the team" />
            </div>
            <TeamStory />
          </section>
        </Sheet>

        <div className="v4-content">
          <Join />
        </div>
      </div>
    </Shell>
  );
}
