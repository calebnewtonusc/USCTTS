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
import Gather from "./Gather";
import HeroLoop from "./HeroLoop";
import "./city.css";
import Network from "./Network";
import Partners from "./Partners";
import { Mentors } from "./People";
import ScrollHold from "./ScrollHold";
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
 *   1. who TTS is, set small and centred, no scene under it (Tyler,
 *      2026-10-10: "make the text a little bit smaller... center it")
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
// Tyler, 2026-10-10: "Go-To-Market", capitalised. A word joiner after each
// hyphen keeps it on one line ("Go-To-" was breaking at 1440), and "and"
// rides on the first line so it never sits alone.
const WJ = String.fromCharCode(0x2060);
const GO_TO_MARKET = `Go-${WJ}To-${WJ}Market`;

export default function Landing() {
  // The grid's data starts with the HTML instead of after hydration. The
  // request must match loadGrid's fetch: same origin, CORS mode.
  preload("/tts/grid/la-grid.bin", { as: "fetch", crossOrigin: "anonymous" });
  return (
    <Shell footer="ending">
      <div className={`v4 ${mono.variable}`}>
        <Stage rail={false} />
        <ScrollHold />
        <div className="v4-content">
          <Opening
            short
            lines={["USC's AI implementation and", `${GO_TO_MARKET} lab.`]}
          />
          {/* Tyler, 2026-10-10 voice memo: "a little thing in the top right,
           * now accepting applications for analysts on three different
           * engagements". He named Yemen in that line and also said to take
           * Yemen off, so the third is Kenya, the client he added. */}
          <Link href="/apply" className="ld-now">
            <span className="ld-now-dot" aria-hidden="true" />
            <span>
              Now accepting analyst applications for three international
              engagements: Nigeria, Ghana and Kenya
            </span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
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

          {/* The partners: home's loudest moment, its own full screen. */}
          <section className="ld-sec ld-partners" aria-labelledby="ld-pt-h">
            <Partners />
          </section>

          <div className="ld-seam is-after-dark" aria-hidden="true">
            <DotFloor win={[-5200, -900, 5200, 900]} max={2200} alpha={0.22} />
          </div>

          {/* 02. The work leaves LA. */}
          <section className="ld-sec ld-about" aria-labelledby="ld-about-h">
            {/* The city, back with a job (Caleb, 2026-10-11: "I mess w the
             * city tho it's tuff. It needs to be intentional"). Tyler cut it
             * from under who we are as "too big of a thing to scroll
             * through" and said it could go lower. Here it is a short wide
             * band that sets up the next line: the clay LA, USC's tower and
             * the road out of town, then "And the work doesn't stay in LA." */}
            <div className="ld-wrap is-wide">
              <figure className="ld-city" data-reveal="0">
                <HeroLoop
                  name="/tts/home/world"
                  width={1280}
                  height={640}
                  mobileWidth={720}
                  label="A clay Los Angeles at golden hour: USC's cardinal tower with a red map dot above it, downtown's rounded towers, palm trees, and a road with cars heading out of town"
                />
                <figcaption className="ld-city-cap">
                  It starts here, at USC.
                </figcaption>
              </figure>
            </div>
            <div className="ld-wrap is-wide">
              <div className="ld-card is-blush ld-work">
                <div className="ld-work-copy">
                  <Mark n="02" label="our work" />
                  <p className="ld-lead" data-reveal="0">
                    And the work doesn&apos;t stay in LA.
                  </p>
                  <h2 id="ld-about-h" className="ld-h" data-reveal="0">
                    Real clients,{" "}
                    <em className="ld-accent">from Nigeria to Kenya.</em>
                  </h2>
                  {/* Tyler's voice memo, 2026-10-10: Yemen off ("we don't
                   * have that"), each line in his words, and Kenya added
                   * without naming the client. */}
                  <ul className="ld-manifest" aria-label="Client projects">
                    <li data-reveal="1">
                      <span className="ld-m-code">NG</span>
                      <b>Nigeria</b>
                      <span className="ld-m-what">
                        Student education nonprofit, 10,000+ students
                      </span>
                    </li>
                    <li data-reveal="1">
                      <span className="ld-m-code">GH</span>
                      <b>Ghana</b>
                      <span className="ld-m-what">
                        Mobile healthcare unit, over 9,000 rural patients
                      </span>
                    </li>
                    <li data-reveal="2">
                      <span className="ld-m-code">KE</span>
                      <b>Kenya</b>
                      <span className="ld-m-what">
                        Mosquito treatment and cancer therapeutics
                      </span>
                    </li>
                  </ul>
                  <Link href="/work-with-us" className="ld-btn" data-reveal="3">
                    Learn more about TTS&apos;s clients{" "}
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
                {/* The film fills its half of the card edge to edge, the
                 * card's corners clipping it (Caleb, 2026-10-10, on the
                 * reference cards: "fills the space exactly how it should
                 * without overdoing it"). */}
                <div className="ld-work-pic">
                  <HeroLoop
                    name="/tts/home/mailbox"
                    width={1120}
                    height={840}
                    label="A gold clay mailbox: letters fly in on dotted trails, its red flag pops up, and it hops and sends a sealed letter back out"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="ld-seam" aria-hidden="true">
            <DotFloor win={[-5200, -900, 5200, 900]} max={2200} alpha={0.24} />
          </div>

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

          <div className="ld-seam is-after-dark" aria-hidden="true">
            <DotFloor win={[-5200, -900, 5200, 900]} max={2200} alpha={0.22} />
          </div>

          {/* 04. The people you can call. */}
          <section className="ld-sec ld-mentors" aria-labelledby="ld-men-h">
            <div className="ld-wrap">
              <Mark n="04" label="club advisors" />
              <h2 id="ld-men-h" className="ld-h is-wide" data-reveal="0">
                Club advisors,{" "}
                <em className="ld-accent">actively helping TTS members.</em>
              </h2>
              <Mentors />
            </div>
          </section>

          {/* 05. The door into the walkthrough. */}
          <section className="ld-sec ld-way" aria-labelledby="ld-way-h">
            <div className="ld-wrap">
              <Mark n="05" label="the TTS way" />
            </div>
            <div className="ld-wrap is-wide">
              <Link href="/way" className="ld-way-card" data-reveal="0">
                {/* The typewriter drafting on a campus lawn at golden hour:
                 * palms sway, clouds drift, cars run the road behind (Caleb,
                 * 2026-10-10: "needs a lively background environment"). */}
                <HeroLoop
                  className="ld-way-img"
                  name="/tts/home/writer"
                  width={1280}
                  height={720}
                  mobileWidth={720}
                  label=""
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
          <section
            id="team"
            className="ld-sec ld-team"
            aria-labelledby="ld-team-h"
          >
            <div className="ld-wrap">
              <Mark n="06" label="the team" />
            </div>
            <TeamStory />
            {/* The sign-off: the mark bounces, jumps, spins, lands and
             * wobbles, then holds before the loop (LogoLoop.tsx). */}
            <div className="ld-wrap">
              {/* Never the mark alone on paper (Caleb, 2026-10-10: "the
               * logo should not be on its own"): it signs off beside the
               * closing line and the way in. */}
              <div className="ld-sign">
                <HeroLoop
                  className="ld-sign-mark"
                  name="/tts/home/logo"
                  width={640}
                  height={640}
                  label="The Trojan Tech Solutions mark, a red helmet with two T eye slots and a gold crest, bouncing, jumping into a spin and landing with a wobble"
                />
                <div className="ld-sign-copy">
                  <p className="ld-sign-line">
                    That&apos;s TTS.{" "}
                    <em className="ld-accent">
                      Come build the next one with us.
                    </em>
                  </p>
                  <p className="ld-sign-now">
                    Now accepting analysts for three international engagements,
                    in Nigeria, Ghana and Kenya.
                  </p>
                  <Link href="/apply" className="ld-btn">
                    Apply to TTS <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <Gather />
        </Sheet>

        <div className="v4-content">
          <Join />
        </div>
      </div>
    </Shell>
  );
}
