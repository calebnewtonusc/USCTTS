import Link from "next/link";
import { preload } from "react-dom";
import Shell from "../Shell";
import Stage from "../v4/Stage";
import Opening from "../v4/Opening";
import { Join } from "../home/Sections";
import { mono } from "../v4/mono";
import { ALUMNI } from "@/data/people";
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
 * Nothing on this page appears twice. Every number is the length of a list
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
          <span className="ld-tab" aria-hidden="true">
            who we are
          </span>

          <section className="ld-sec ld-who" aria-labelledby="ld-who-h">
            <div className="ld-wrap">
              <Statement />
            </div>
          </section>

          <section className="ld-sec ld-about" aria-labelledby="ld-about-h">
            <div className="ld-wrap ld-split">
              <div className="ld-about-copy">
                <p className="ld-label" data-reveal="0">
                  about us
                </p>
                <h2 id="ld-about-h" className="ld-h" data-reveal="0">
                  A dormant club, rebuilt in three months.
                </h2>
                <p className="ld-body" data-reveal="1">
                  When Matthew Kim graduated, he handed TTS to Caleb Newton and
                  Tyler Larsen, and there was nobody left in it. They rebuilt it
                  around one idea: you learn AI by building it for a real
                  business, with the tools that business already pays for.
                </p>
                <Link href="/members" className="ld-btn" data-reveal="2">
                  Learn more about TTS <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
              <figure className="ld-figure" data-reveal="1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/tts/landing/machine-1280.webp"
                  srcSet="/tts/landing/machine-1280.webp 1280w, /tts/landing/machine-2560.webp 2560w"
                  sizes="(min-width: 900px) 50vw, 100vw"
                  alt="A rendered machine where a lead rolls from a tray through a sorter, a typewriter and a mailbox into a stack of CRM blocks"
                  width={2560}
                  height={1440}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  one client project, every stage, from the TTS way
                </figcaption>
              </figure>
            </div>
          </section>

          <section className="ld-sec ld-net" aria-labelledby="ld-net-h">
            <div className="ld-wrap">
              <p className="ld-label" data-reveal="0">
                our network
              </p>
              <h2 id="ld-net-h" className="ld-h" data-reveal="0">
                See where {ALUMNI.length} people who started at TTS went.
              </h2>
              <p className="ld-lede" data-reveal="1">
                Tap a company to meet them.
              </p>
              <Network />
            </div>
          </section>

          <section className="ld-sec ld-mentors" aria-labelledby="ld-men-h">
            <div className="ld-wrap">
              <p className="ld-label" data-reveal="0">
                join the network
              </p>
              <h2 id="ld-men-h" className="ld-h" data-reveal="0">
                These people actually want to help you.
              </h2>
              <Mentors />
            </div>
          </section>

          <section className="ld-sec ld-way" aria-labelledby="ld-way-h">
            <div className="ld-wrap">
              <Link href="/way" className="ld-way-card" data-reveal="0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="ld-way-img"
                  src="/tts/landing/typewriter-1280.webp"
                  srcSet="/tts/landing/typewriter-1280.webp 1280w, /tts/landing/typewriter-2560.webp 2560w"
                  sizes="(min-width: 1200px) 1200px, 100vw"
                  alt=""
                  width={2560}
                  height={1440}
                  loading="lazy"
                  decoding="async"
                />
                <span className="ld-way-copy">
                  <span className="ld-label is-light">the TTS way</span>
                  <span id="ld-way-h" className="ld-way-h">
                    Understand the TTS way.
                  </span>
                  <span className="ld-way-sub">
                    Follow one client project through a semester, stage by
                    stage, in 3D.
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
              <p className="ld-label" data-reveal="0">
                the team
              </p>
              <h2 id="ld-team-h" className="ld-h" data-reveal="0">
                Meet the team.
              </h2>
              <Team />
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
