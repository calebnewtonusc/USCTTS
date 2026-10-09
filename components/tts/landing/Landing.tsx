import Link from "next/link";
import Shell from "../Shell";
import Stage from "../v4/Stage";
import Opening from "../v4/Opening";
import { mono } from "../v4/mono";
import NotifyForm from "@/app/apply/NotifyForm";
import { CALENDLY_URL } from "@/lib/contact";
import { ADVISORS, ALUMNI, LEADERSHIP } from "@/data/people";
import Network from "./Network";
import "../v4/v4.css";
import "./landing.css";

/*
 * Home, rebuilt from Tyler's voice memos on 2026-10-09. He kept the LA
 * opener ("the dot in LA is good, I really like that") and asked for
 * everything after it to be a plain, structured site, like the Trojan
 * Investing Society page or Clay's: a sheet slides up over the field, and
 * on it are who we are, where our people have gone, the mentors, the team,
 * and the doors. The scroll story that used to be home lives at /way,
 * behind its own button.
 *
 * Nothing here claims a client count, a "first" or a "premier": none of
 * those has a source yet. Every number on the page is a length of a list
 * in data/people.ts.
 */
export default function Landing() {
  return (
    <Shell>
      <div className={`v4 ${mono.variable}`}>
        <Stage />
        <div className="v4-content">
          <Opening />
        </div>
      </div>

      <div className={`ld ${mono.variable}`}>
        <span className="ld-tab" aria-hidden="true">
          Trojan Tech Solutions
        </span>

        <section className="ld-intro" aria-labelledby="ld-intro-h">
          <div className="ld-wrap">
            <h2 id="ld-intro-h" className="ld-big">
              We build AI for real businesses and nonprofits, and our members
              learn it by shipping it.
            </h2>
            <div className="ld-intro-cols">
              <p>
                Trojan Tech Solutions is USC&apos;s AI implementation and
                go-to-market lab. Automations, CRMs, outbound, AI curricula:
                whatever a client needs, a small team of students scopes it,
                builds it, and hands it over by the end of the semester.
              </p>
              <div className="ld-partners">
                <span className="ld-label">Official partners</span>
                <div className="ld-partner-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/tts/partners/clay.png"
                    alt="Clay"
                    className="ld-clay"
                  />
                  <span className="ld-pplx">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/tts/partners/perplexity.svg" alt="" />
                    Perplexity
                  </span>
                </div>
                <span className="ld-note">through Blue Modern Advisory</span>
              </div>
            </div>
          </div>
        </section>

        <section className="ld-about" aria-labelledby="ld-about-h">
          <div className="ld-wrap ld-split">
            <div>
              <h2 id="ld-about-h" className="ld-h">
                About us
              </h2>
              <p>
                TTS started out building IT for companies. When Matthew Kim
                graduated, he handed it to Caleb Newton and Tyler Larsen, and
                now it builds AI. Members work on one real client project a
                semester, with the tools those companies already pay for.
              </p>
              <Link href="/way" className="ld-btn">
                See how a project runs <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <Link
              href="/way"
              className="ld-figure"
              aria-label="The TTS way: how a project runs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tts/landing/typewriter.jpg" alt="" />
              <span className="ld-figure-cap">the TTS way, in 3D</span>
            </Link>
          </div>
        </section>

        <section className="ld-network" aria-labelledby="ld-net-h">
          <div className="ld-wrap">
            <h2 id="ld-net-h" className="ld-h">
              Where our people have gone
            </h2>
            <p className="ld-lede">
              {ALUMNI.length} alumni started here. Tap a company to see who.
            </p>
            <Network />
            <Link href="/members" className="ld-btn">
              See the whole network <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>

        <section className="ld-mentors" aria-labelledby="ld-men-h">
          <div className="ld-wrap">
            <h2 id="ld-men-h" className="ld-h">
              These people want to help you
            </h2>
            <p className="ld-lede">
              {ADVISORS.length} mentors back the club, from our faculty advisor to
              people at Google, McKinsey and Reddit.
            </p>
            <ul className="ld-people">
              {ADVISORS.map((p) => (
                <li key={p.name} className="ld-person">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.photo && <img src={p.photo} alt="" loading="lazy" />}
                  <b>{p.name}</b>
                  <span>{p.role}</span>
                  {p.company && <span className="ld-co">{p.company}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ld-way" aria-labelledby="ld-way-h">
          <Link href="/way" className="ld-way-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tts/landing/slide.jpg" alt="" loading="lazy" className="ld-way-still" />
            <video
              className="ld-way-film"
              src="/tts/machine/machine.mp4"
              poster="/tts/landing/slide.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
            <span className="ld-way-copy">
              <span id="ld-way-h" className="ld-way-h">
                Understand the TTS way
              </span>
              <span className="ld-way-sub">
                Follow one student&apos;s first client, from a list of names in
                Koreatown to a booked meeting.
              </span>
              <span className="ld-btn is-light">
                Start the walkthrough <span aria-hidden="true">&rarr;</span>
              </span>
            </span>
          </Link>
        </section>

        <section className="ld-team" aria-labelledby="ld-team-h">
          <div className="ld-wrap">
            <h2 id="ld-team-h" className="ld-h">
              Meet the team
            </h2>
            <ul className="ld-people is-team">
              {LEADERSHIP.map((p) => (
                <li key={p.name} className="ld-person">
                  {p.link ? (
                    <a href={p.link} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.photo && <img src={p.photo} alt="" loading="lazy" />}
                      <b>{p.name}</b>
                    </a>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.photo && <img src={p.photo} alt="" loading="lazy" />}
                      <b>{p.name}</b>
                    </>
                  )}
                  <span>{p.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ld-doors" aria-label="Two ways in">
          <div className="ld-wrap">
          <div className="ld-doors-row">
            <div className="ld-door">
              <p className="ld-door-say">
                I&apos;m at USC. Teach me to build that.
              </p>
              <NotifyForm />
              <p className="ld-note">applications open soon</p>
            </div>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ld-door is-biz"
            >
              <span className="ld-door-say">
                I run a business. Book 30 minutes with Caleb.
              </span>
              <span className="ld-note">
                calendly, opens in a new tab{" "}
                <span aria-hidden="true">&rarr;</span>
              </span>
            </a>
          </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
