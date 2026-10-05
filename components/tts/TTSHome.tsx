import dataset from "@/public/tts/run/portfolio-board-2026-09-15.json";
import Shell from "./Shell";
import WorldScene, { type Numbers } from "./world/WorldScene";
import Partners from "./home/Partners";
import RunBeats, { type RunBeatsData } from "./home/RunBeats";
import Whiteboard from "./home/Whiteboard";
import { Join, Roster, WhatWeDo } from "./home/Sections";
import { SeamToPartners } from "./home/Seams";
import { audit, runPipeline, type Dataset } from "./run/pipeline";
import "./world/world.css";
import "./home/home.css";

// The JSON's tuples widen to arrays on import; the shape is checked by the
// builder script that wrote it, so this goes via unknown.
const DATA = dataset as unknown as Dataset;

// Computed on the server so the static HTML carries the finished result: an
// animated number always ships its final value.
const RUN = runPipeline(DATA, true);
const RUN_OFF = runPipeline(DATA, false);

// Every number the world and the run beats show comes from the same run, so
// no figure on the page is typed in by hand.
const NUMS: Numbers = {
  companies: RUN.stages[0].count,
  roles: RUN.stages[1].count,
  kept: RUN.stages[2].count,
  setAside: RUN.setAside?.listings ?? 0,
  shortlist: RUN.shortlistTotal,
};

const BEATS: RunBeatsData = (() => {
  const aside = audit(DATA);
  const flags = DATA.roles.map((r) => (aside.has(r[0]) ? 1 : r[4] === 1 ? 2 : 0));
  const label = (r: { sector: string; flagged: boolean }) =>
    r.flagged ? "The feed pointed at the wrong company" : r.sector ? `A company in ${r.sector}` : "A company";
  const top3 = (rank: typeof RUN.ranking) =>
    rank.slice(0, 3).map((r) => ({ label: label(r), open: r.open, bad: r.flagged }));
  const list = DATA.roles
    .filter((r) => !aside.has(r[0]) && r[4] === 1)
    .sort((a, b) => b[1] - a[1])
    .map((r) => ({ title: r[2], sector: DATA.sectors[DATA.companies[r[0]][0]], days: r[1] }));
  return {
    ...NUMS,
    flags,
    rankOn: top3(RUN.ranking),
    rankOff: top3(RUN_OFF.ranking),
    list,
  };
})();

export default function TTSHome() {
  return (
    <Shell>
      <WorldScene nums={NUMS} />
      <SeamToPartners />
      <Partners />
      <RunBeats d={BEATS} />
      <Whiteboard />
        <WhatWeDo />
        <Roster />
      <Join />
    </Shell>
  );
}
