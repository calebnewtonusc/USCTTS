import type { Metadata } from "next";
import Shell from "@/components/tts/Shell";
import DotFloor from "@/components/tts/landing/DotFloor";
import WorldArcs from "@/components/tts/landing/WorldArcs";
import { mono } from "@/components/tts/v4/mono";
import { INSTAGRAM_URL } from "@/components/tts/links";
import { APPLY_FORM_URL, APPLICATIONS_OPEN } from "@/lib/apply";
import JoinEnd from "./JoinEnd";
import LeadRun from "./LeadRun";
import NotifyForm from "./NotifyForm";
import Path from "./Path";
import "@/components/tts/pages.css";
import "./join.css";

export const metadata: Metadata = {
  title: "Apply | Trojan Tech Solutions",
  description:
    "Join Trojan Tech Solutions, USC's AI implementation and go-to-market lab. Learn to build AI in build sessions, then ship it for real companies and nonprofits anywhere in the world.",
};

/*
 * Join (Caleb, 2026-10-10: "Holy fucking wall of text with each section
 * feeling combined", "NEVER REPEAT THINGS AND NEVER MAKE 3d STILLS"). The
 * student's own story in three screens and a close, each on its own band:
 * the promise with the one action, the path from the first build night to
 * real company work, a member's build running, and the action again. It
 * repeats nothing from home: no client list, no partner line, no logos or
 * faces, no clay still. The visual is built in the page (the dot world with
 * USC's point) until /apply's own loop exists. The signup form and where it
 * submits (NotifyForm, /api/notify) are unchanged. Every section stays
 * under 25 words of body copy; tools/section-check.mjs enforces 40.
 */
function ApplyAction({ id }: { id?: string }) {
  if (APPLICATIONS_OPEN) {
    return (
      <div className="jo-action" id={id}>
        <a
          className="jo-apply"
          href={APPLY_FORM_URL}
          target="_blank"
          rel="noreferrer"
        >
          Apply on Google Forms <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    );
  }
  return (
    <div className="jo-action" id={id}>
      <p className="jo-status">
        <span className="jo-dot" aria-hidden="true" />
        applications open soon
      </p>
      <NotifyForm />
      <a
        className="jo-ig"
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
      >
        Follow us on Instagram
      </a>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Shell>
      <div className={`pgx jo ${mono.variable}`}>
        {/* 1. The promise and the one action. */}
        <section className="jo-hero" aria-labelledby="jo-h">
          <div className="jo-world" aria-hidden="true">
            <WorldArcs places={[]} />
          </div>
          <div className="jo-wrap jo-hero-in">
            <p className="jo-mark is-light">
              <span className="jo-dot" aria-hidden="true" />
              join TTS
            </p>
            <h1 id="jo-h" className="jo-h1">
              Build real AI for <em>clients anywhere in the world.</em>
            </h1>
            <ApplyAction id="apply" />
          </div>
        </section>

        <div className="jo-seam" data-transition aria-hidden="true">
          <DotFloor win={[-5200, -900, 5200, 900]} max={2200} alpha={0.26} />
        </div>

        {/* 2. The path. */}
        <section
          className="jo-sec is-sky"
          aria-labelledby="jo-path-h"
         
        >
          <div className="jo-wrap">
            <p className="jo-mark">
              <span className="jo-n">01</span> how it goes
            </p>
            <h2 id="jo-path-h" className="jo-h2">
              From your first build night <em>to real company work.</em>
            </h2>
            <Path />
          </div>
        </section>

        <div className="jo-seam" data-transition aria-hidden="true">
          <DotFloor win={[-5200, -900, 5200, 900]} max={2200} alpha={0.26} />
        </div>

        {/* 3. A member's build, running. */}
        <section className="jo-sec is-paper" aria-labelledby="jo-build-h">
          <div className="jo-wrap jo-split">
            <div>
              <p className="jo-mark">
                <span className="jo-n">02</span> what you&apos;d build
              </p>
              <h2 id="jo-build-h" className="jo-h2">
                A list of who&apos;s worth reaching,{" "}
                <em>with the first email drafted.</em>
              </h2>
            </div>
            <LeadRun />
          </div>
        </section>

        {/* 4. The action again, on the cardinal the site ends on. */}
        <JoinEnd open={APPLICATIONS_OPEN} formUrl={APPLY_FORM_URL} />
      </div>
    </Shell>
  );
}
