import dataset from "@/public/tts/run/portfolio-board-2026-09-15.json";
import Shell from "./Shell";
import { WorldHero, WorldWalk, type Numbers } from "./world/WorldScene";
import Partners from "./home/Partners";
import { Join } from "./home/Sections";
import { runPipeline, type Dataset } from "./run/pipeline";
import "./world/world.css";
import "./home/home.css";

// The JSON's tuples widen to arrays on import; the shape is checked by the
// builder script that wrote it, so this goes via unknown.
const DATA = dataset as unknown as Dataset;

// Computed on the server so the static HTML carries the finished result: an
// animated number always ships its final value.
const RUN = runPipeline(DATA, true);
// Every number the world and the run beats show comes from the same run, so
// no figure on the page is typed in by hand.
const NUMS: Numbers = {
  companies: RUN.stages[0].count,
  roles: RUN.stages[1].count,
  kept: RUN.stages[2].count,
  setAside: RUN.setAside?.listings ?? 0,
  shortlist: RUN.shortlistTotal,
};

/* Home, for two readers (docs/RUBRIC-tts.md): a USC student deciding
 * whether to join, and a business owner who wants AI help. The load-in says
 * who we are, Clay and Perplexity come straight after, the walkthrough shows
 * plain examples of the work, then the people, then a door for each reader.
 * The run beats, the whiteboard and the what-we-do grid served neither, so
 * they are not rendered here (their files stay). */
export default function TTSHome() {
  return (
    <Shell>
      <WorldHero nums={NUMS} />
      <Partners />
      <WorldWalk />
      <Join />
    </Shell>
  );
}
