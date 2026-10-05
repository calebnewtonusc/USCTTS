# STORY-tts: the beat sheet

The home page's scroll story, per `docs/DIRECTION-tts-v3.md`: one world (the
GTM and AI machine at golden hour), one continuous camera move, each station a
beat. The scene is one 1200vh block with a sticky pin and one progress value
`N` (0 to 1), followed at 0.2 a frame, the chassis ported from our
lemma-replica (`src/sections/hero-scene.js`). Windows below are on `N`; at
1440x900 one unit of `N` is about 9,960px of scroll.

| Beat     | N              | Clock                         | What the objects do                                                                                                                                                                                                         | Caption                                          |
| -------- | -------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Intro    | load           | timed, 2200ms                 | Stations drop into place one after another (each over 0.35 of the clock); the copy rises 12px in lines                                                                                                                      | Build the systems that do the work.              |
| Exit     | 0 to 0.055     | scroll                        | Copy leaves upward 380px on one cubic curve, opacity on the band and again on the copy; the camera pulls back and up                                                                                                        | (none)                                           |
| Accounts | 0.10 to 0.205  | scroll                        | Camera settles on the funnel; raw accounts, neutral blocks, pour into it on a loop                                                                                                                                          | It starts with raw accounts.                     |
| Enrich   | 0.235 to 0.335 | scroll                        | Camera swings over the two enrichment pipes; gold beads (data being worked) run through them                                                                                                                                | Enrich first. Then decide.                       |
| Qualify  | 0.37 to 0.53   | scroll                        | The magnifier over the belt: each record turns gold (kept) or grey and drops into the set-aside bin. The panel counts the real 2026-09-15 numbers up: 180, 388, 102 set aside, 286 kept, 30 shortlisted                     | Qualify on criteria, not vibes.                  |
| Agents   | 0.56 to 0.66   | scroll                        | Five agents at their desks, visors breathing, documents lifting as they read                                                                                                                                                | Agents do the research.                          |
| Send     | 0.69 to 0.785  | scroll                        | The mailbox flag rises on arrival; envelopes leave in arcs to the horizon                                                                                                                                                   | Then it reaches the right person.                |
| Compound | 0.815 to 0.905 | scroll                        | The pipeline chart's bars climb as you arrive; a gold ball climbs the steps                                                                                                                                                 | And it compounds.                                |
| Sink     | 0.90 to 0.925  | scroll                        | The camera flies up and side-on; the whole machine sinks into the ground, a hairline lattice appears, and lattice cells light ahead of where the front will pass                                                            | (none)                                           |
| Build    | from 0.93      | timed, 1800ms, once per entry | A gold wavefront crosses the ground from funnel to chart. Each part rises out of the ground as the front passes it, over its own 560ms; the pipes connect behind the front; each station starts running once its parts land | This is the machine. We teach every piece of it. |

Reduced motion: no flight and no sweep. The block becomes the hero and seven
station stills (`public/tts/world/station-*.jpg`, rendered from the same world
at each caption's hold, the last one with the build finished), each with its
caption and, for Qualify, the real counts.

After the block, the page continues on the same chassis:

| Section                                        | Mechanism                                                                                                        | What carries it                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Run it yourself                                | pinned crossfade, the replica's W3 panels: layers switched by class, 500ms ease-out, IntersectionObserver at 0.5 | the in-browser run on the real dataset, with the verify switch |
| What you learn                                 | pinned 330vh; each of five stations draws itself from one scroll progress                                        | a hand-drawn board in the page's hairline family               |
| What we build, What we turn down, People, Join | static, with the join band on the replica's mesh shader in page ink                                              | type, the roster's photographs                                 |
