import DotFloor from "./DotFloor";

/*
 * Who TTS is, the first thing on home's sheet (Tyler, 2026-10-09: a big
 * statement of who we are). The line is Caleb's own description of the club
 * (RUBRIC: "We do everything AI. Automations, teaching, crm, blah blah
 * blah, wtv a company needs!"), global since 2026-10-10: "TTS is global
 * businesses, not just la". The partners and their valuations moved to
 * their own band, Partners.tsx (Caleb, 2026-10-10: "No sections should read
 * as combined").
 */
export default function Statement() {
  return (
    <>
      <h2 id="ld-who-h" className="ld-say" data-reveal="0">
        We build whatever AI a company or nonprofit needs, anywhere in the
        world: automations, CRMs, outbound, training their teams.{" "}
        <em className="ld-accent">Students build all of it.</em>
      </h2>
      {/* The one big scene on home: a clay LA at golden hour, USC's tower
       * and red dot on the left, downtown on the right, a freeway between
       * (blender/heroes.py, world). It sits under the line it illustrates:
       * students, from USC, building for the city and past it. */}
      {/* The city scene stands on the real one: a floor of the opener's
       * points, the streets around USC, runs out past the frame's edges. */}
      <div className="ld-ground" data-reveal="1">
        <DotFloor
          win={[-4200, -2100, 4200, 2100]}
          alpha={0.36}
          max={4200}
          hold
          className="ld-ground-floor"
        />
        <div className="ld-frame is-world">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tts/home/world-1200.webp"
            srcSet="/tts/home/world-1200.webp 1200w, /tts/home/world-2400.webp 2400w"
            sizes="(min-width: 1280px) 1184px, 100vw"
            alt="A clay Los Angeles at golden hour: green hills, a downtown of rounded towers, palm trees, and USC's cardinal tower with a red map dot above it, joined by a freeway"
            width={2400}
            height={1200}
            decoding="async"
          />
        </div>
      </div>
    </>
  );
}
