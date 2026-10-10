import { preload } from "react-dom";
import Shell from "../Shell";
import Stage from "../v4/Stage";
import Opening from "../v4/Opening";
import Week from "../v4/Week";
import { Join } from "../home/Sections";
import { mono } from "../v4/mono";
import "../v4/v4.css";
import "./landing.css";

/*
 * /way: one client project at TTS, told by one set of objects, LA's street
 * grid as points of light around the USC dot (docs/STORY-tts.md,
 * docs/INTENT-way.md).
 *
 *   1. The city assembles on the load clock and the line slides up out of
 *      it; the first scroll streams light down the freeways into USC.
 *   2. One example client brings a problem (a nonprofit in Ghana that
 *      needs donor outreach), the light leaves USC, the camera dives into
 *      a point and
 *      the clay machine is the project: finding leads, deciding who's worth
 *      reaching, drafting, the CRM, handing it over. The x-ray shows each
 *      stage's real artifact.
 *   3. The film draws back into the point, the cardinal rains in, and the
 *      two doors end it (Tyler: at the bottom of the story, "I'm a USC
 *      student, teach me to build that" and "book 30 minutes with Caleb").
 */
export default function Way() {
  preload("/tts/grid/la-grid.bin", { as: "fetch", crossOrigin: "anonymous" });
  return (
    <Shell footer="ending">
      <div className={`v4 is-way ${mono.variable}`}>
        <Stage />
        <div className="v4-content">
          {/* Tyler (relayed 2026-10-10) cut "This is you, a few weeks
           * from now." The opener holds only its headline now. */}
          <Opening lines={["This is how a", "TTS project runs."]} />
          <Week />
          <Join />
        </div>
      </div>
    </Shell>
  );
}
