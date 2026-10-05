import dataset from "@/public/tts/run/portfolio-board-2026-09-15.json";
import Shell from "./Shell";
import WorldScene, { type Numbers } from "./world/WorldScene";
import RunPanels from "./home/RunPanels";
import Whiteboard from "./home/Whiteboard";
import {
  Join,
  Roster,
  TurnDown,
  WhatWeDo,
} from "./home/Sections";
import {
  SeamToBoard,
  SeamToJoin,
  SeamToRun,
  SeamToSpine,
  Spine,
} from "./home/Seams";
import type { IntakeRow } from "./run/Intake";
import { audit, runPipeline, verdict, type Dataset } from "./run/pipeline";
import "./world/world.css";
import "./home/home.css";

// The JSON's tuples widen to arrays on import; the shape is checked by the
// builder script that wrote it, so this goes via unknown.
const DATA = dataset as unknown as Dataset;

// Computed on the server so the static HTML carries the finished result: an
// animated number always ships its final value.
const INITIAL_RUN = runPipeline(DATA, true);

// Every number the world shows comes from the same run, so no figure on the
// page is typed in by hand.
const NUMS: Numbers = {
  companies: INITIAL_RUN.stages[0].count,
  roles: INITIAL_RUN.stages[1].count,
  kept: INITIAL_RUN.stages[2].count,
  setAside: INITIAL_RUN.setAside?.listings ?? 0,
  shortlist: INITIAL_RUN.shortlistTotal,
};

// The readout that carries the world into the run panels: the same five
// numbers the world's qualification station shows.
const READOUT: [string, number][] = [
  ["Companies on the board", NUMS.companies],
  ["Open roles pulled", NUMS.roles],
  ["Set aside by the check", NUMS.setAside],
  ["Roles kept", NUMS.kept],
  ["Shortlisted for a student team", NUMS.shortlist],
];

const INITIAL_INTAKE: IntakeRow[] = (() => {
  const aside = audit(DATA);
  const rows: IntakeRow[] = [];
  for (let n = 7; n >= 0; n--) {
    const role = DATA.roles[(n * 61) % DATA.roles.length];
    rows.push({
      n,
      title: role[2],
      sector: aside.has(role[0])
        ? ""
        : DATA.sectors[DATA.companies[role[0]][0]],
      days: role[1],
      verdict: verdict(role, aside),
      live: false,
    });
  }
  return rows;
})();

export default function TTSHome() {
  return (
    <Shell>
      <WorldScene nums={NUMS} />
      <SeamToRun rows={READOUT} />
      <RunPanels
        initialRun={INITIAL_RUN}
        initialIntake={INITIAL_INTAKE}
        total={DATA.roles.length}
      />
      <SeamToBoard />
      <Whiteboard />
      <SeamToSpine />
      <Spine>
        <WhatWeDo />
        <Roster />
        <TurnDown />
      </Spine>
      <SeamToJoin />
      <Join />
    </Shell>
  );
}
