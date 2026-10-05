import dataset from "@/public/tts/run/portfolio-board-2026-09-15.json";
import Shell from "./Shell";
import WorldScene, { type Numbers } from "./world/WorldScene";
import { runPipeline, type Dataset } from "./run/pipeline";
import "./world/world.css";

const DATA = dataset as unknown as Dataset;
const INITIAL_RUN = runPipeline(DATA, true);

// Every number the world shows, computed on the server from the same dataset
// the run section loads, so no figure on the page is typed in by hand.
const NUMS: Numbers = {
  companies: INITIAL_RUN.stages[0].count,
  roles: INITIAL_RUN.stages[1].count,
  kept: INITIAL_RUN.stages[2].count,
  setAside: INITIAL_RUN.setAside?.listings ?? 0,
  shortlist: INITIAL_RUN.shortlistTotal,
};

export default function TTSHome() {
  return (
    <Shell>
      <WorldScene nums={NUMS} />
      <section id="run" style={{ height: "100vh" }} />
      <section id="learn" style={{ height: "100vh" }} />
    </Shell>
  );
}
