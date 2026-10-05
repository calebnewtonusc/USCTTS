import Shell from "./Shell";
import Stage from "./v4/Stage";
import Opening from "./v4/Opening";
import Partners from "./home/Partners";
import Week from "./v4/Week";
import { Join } from "./home/Sections";
import { mono } from "./v4/mono";
import "./v4/v4.css";

/* Home v4 (docs/DIRECTION-tts-v4.md), for two readers (docs/RUBRIC-tts.md):
 * a USC student deciding whether to join, and a business owner who wants AI
 * help. One field of light, LA's real street grid centred on USC, sits
 * behind the whole page. On it: who we are, Clay and Perplexity, one
 * example week getting lighter as the AI work moves through it, and a door
 * for each reader. One scroll loop drives all of it (v4/choreo.ts). */
export default function TTSHome() {
  return (
    <Shell>
      <div className={`v4 ${mono.variable}`}>
        <Stage />
        <div className="v4-content">
          <Opening />
          <Partners />
          <Week />
          <Join />
        </div>
      </div>
    </Shell>
  );
}
