import { preload } from "react-dom";
import Shell from "../Shell";
import Stage from "../v4/Stage";
import Opening from "../v4/Opening";
import Partners from "../home/Partners";
import Week from "../v4/Week";
import { Join } from "../home/Sections";
import { mono } from "../v4/mono";
import People from "./People";
import WayHash from "./WayHash";
import "../v4/v4.css";
import "./landing.css";

/*
 * Home: one semester at TTS, told by one set of objects, LA's street grid
 * as points of light around the USC dot (docs/STORY-tts.md).
 *
 *   1. The city assembles on the load clock and the headline slides up
 *      out of it. The first scroll streams light down the freeways into
 *      USC and the headline leaves in depth.
 *   2. Who we are, on the sky, and the two tools members build on.
 *   3. The TTS way: a business brings a problem (a dental office in
 *      Koreatown), the light drives there from USC, the camera dives into
 *      that point and the clay machine is the semester: finding leads,
 *      deciding who's worth reaching, drafting, the CRM, handing it over.
 *      The x-ray shows each stage's real artifact.
 *   4. The film draws back into the point, the camera rises home to USC,
 *      and the people come up over the city: where the alumni went, the
 *      mentors, the team.
 *   5. The cardinal rains in and the two doors are the ending.
 *
 * Nothing appears twice (Caleb, 2026-10-09: "Repeating things is low
 * aura"): one headline, one partners moment, the manim clips only inside
 * the x-ray, each face once, and the only calls to action are the doors.
 */
export default function Landing() {
  // The grid's data starts with the HTML instead of after hydration, so the
  // field is ready sooner and the load clock starts sooner. The request
  // must match loadGrid's fetch: same origin, CORS mode.
  preload("/tts/grid/la-grid.bin", { as: "fetch", crossOrigin: "anonymous" });
  return (
    <Shell footer="ending">
      <div className={`v4 ${mono.variable}`}>
        <Stage />
        <WayHash />
        <div className="v4-content">
          <Opening />
          <Partners />
          <Week />
          <People />
          <Join />
        </div>
      </div>
    </Shell>
  );
}
