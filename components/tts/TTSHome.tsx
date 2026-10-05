import Shell from "./Shell";
import { WorldIntro, WorldStory } from "./world/WorldScene";
import Partners from "./home/Partners";
import { Join } from "./home/Sections";
import "./world/world.css";
import "./home/home.css";

/* Home, for two readers (docs/RUBRIC-tts.md): a USC student deciding
 * whether to join, and a business owner who wants AI help. The intro is the
 * student at a desk at night; through the laptop is a street of small
 * businesses. Clay and Perplexity come straight after, then the story walks
 * that street one storefront at a time, then a door for each reader. */
export default function TTSHome() {
  return (
    <Shell>
      <WorldIntro />
      <Partners />
      <WorldStory />
      <Join />
    </Shell>
  );
}
