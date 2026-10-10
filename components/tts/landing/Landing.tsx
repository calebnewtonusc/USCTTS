import Link from "next/link";
import { preload } from "react-dom";
import Shell from "../Shell";
import Stage from "../v4/Stage";
import Opening from "../v4/Opening";
import { Join } from "../home/Sections";
import { mono } from "../v4/mono";
import { NETWORK_PEOPLE } from "@/data/people";
import Depth from "./Depth";
import Network from "./Network";
import { Mentors, Team } from "./People";
import Sheet from "./Sheet";
import Statement from "./Statement";
import "../v4/v4.css";
import "./landing.css";

/*
 * Home, in the order Tyler asked for in his voice memos on 2026-10-09
 * ("a more professional kind of first page that people see rather than an
 * animation you have to scroll through", and "it's just gotta start off
 * with like a basic page"):
 *
 *   the LA map and the USC dot, short ("the dot in LA is good")
 *   a separating tab, then "it goes into being a real website":
 *   1. who TTS is, big
 *   2. about us, with a picture and Learn more about TTS
 *   3. see our network: logos, faces, a tap into each company
 *   4. join the network: the mentors, "these people actually want to help you"
 *   5. understand the TTS way: the door into the 3D walkthrough at /way
 *   6. meet the team
 *   7. the two doors
 *
 * Nothing on this page appears twice, images included: the full clay
 * machine is only in the /way film, and each section here has its own scene
 * from blender/heroes.py (Caleb, 2026-10-10: "Why are we repeating the same
 * thing 3x???"). Every number is the length of a list
 * in data/people.ts or a dated valuation; nothing claims "first" or
 * "premier", since neither has a source. docs/INTENT-home.md lists every
 * visible element and why it is here.
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
          {/* The lip carries only its grip: the first section names itself
           * in its pill, and a label here said the same words twice. */}
          <span className="ld-tab" aria-hidden="true" />

          <section className="ld-sec ld-who" aria-labelledby="ld-who-h">
            <div className="ld-wrap">
              <Statement />
            </div>
          </section>

          <section className="ld-sec ld-about" aria-labelledby="ld-about-h">
            <div className="ld-wrap">
              <div className="ld-card is-blush ld-split">
                <div className="ld-about-copy">
                  <p className="ld-pill is-cardinal" data-reveal="0">
                    our work
                  </p>
                  <h2 id="ld-about-h" className="ld-h" data-reveal="0">
                    Real clients,{" "}
                    <em className="ld-accent">from Nigeria to Yemen.</em>
                  </h2>
                  {/* Tyler's voice memo, 2026-10-09: cut the about story
                   * and show what is special, the international work. Only
                   * the place and the field he named; nothing else is known
                   * yet. Nigeria's line matches second-brain/core/now.md
                   * (stemmets.com). NEED: Yemen's field, and where the
                   * cancer therapeutics client is. A sentence, not a card
                   * grid: site-gate refuses a heading-plus-line grid. */}
                  <p className="ld-body" data-reveal="1">
                    TTS has client projects in <b>Nigeria</b>, an AI
                    curriculum for an education nonprofit; in <b>Ghana</b>,
                    in healthcare; in <b>Yemen</b>; and in{" "}
                    <b>cancer therapeutics</b>.
                  </p>
                  <Link href="/members" className="ld-btn" data-reveal="2">
                    Learn more about TTS <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
                <div className="ld-frame is-blush" data-reveal="1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/tts/home/mailbox-720.webp"
                    srcSet="/tts/home/mailbox-720.webp 720w, /tts/home/mailbox-1440.webp 1440w"
                    sizes="(min-width: 900px) 640px, 100vw"
                    alt="A gold clay mailbox with its red flag up and a sealed letter going out on its open door"
                    width={1440}
                    height={1080}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="ld-sec ld-net" aria-labelledby="ld-net-h">
            <div className="ld-wrap">
              <div className="ld-card is-sky">
                <p className="ld-pill is-sky" data-reveal="0">
                  our network
                </p>
                <h2 id="ld-net-h" className="ld-h" data-reveal="0">
                  See where TTS <em className="ld-accent">can get you.</em>
                </h2>
                <p className="ld-lede" data-reveal="1">
                  {NETWORK_PEOPLE.length} people started at TTS. Tap a company
                  to meet them.
                </p>
                <Network />
              </div>
            </div>
          </section>

          <section className="ld-sec ld-mentors" aria-labelledby="ld-men-h">
            <div className="ld-wrap">
              <div className="ld-card is-leaf">
                <p className="ld-pill is-leaf" data-reveal="0">
                  club advisors
                </p>
                <h2 id="ld-men-h" className="ld-h" data-reveal="0">
                  Club advisors,{" "}
                  <em className="ld-accent">open to a coffee chat anytime.</em>
                </h2>
                <Mentors />
              </div>
            </div>
          </section>

          <section className="ld-sec ld-way" aria-labelledby="ld-way-h">
            <div className="ld-wrap">
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
                  <span className="ld-pill is-gold">the TTS way</span>
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

          <section className="ld-sec ld-team" aria-labelledby="ld-team-h">
            <div className="ld-wrap">
              <div className="ld-card is-gold">
                <p className="ld-pill is-coral" data-reveal="0">
                  the team
                </p>
                <h2 id="ld-team-h" className="ld-h" data-reveal="0">
                  Meet <em className="ld-accent">the team.</em>
                </h2>
                <Team />
              </div>
            </div>
          </section>
        </Sheet>

        <div className="v4-content">
          <Join />
        </div>
      </div>
    </Shell>
  );
}
