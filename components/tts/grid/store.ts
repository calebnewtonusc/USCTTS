/*
 * The one shared surface between the page and the LA grid engine.
 * The page writes these fields (scroll handlers, timelines); the engine reads
 * them every frame and eases toward them. Nothing here triggers React renders.
 * All positions are metres on a local plane centred on USC (34.0224, -118.2851),
 * x east, y north.
 */

/**
 * Camera voice per chapter. The engine eases between poses, never cuts.
 *  free     camera.{x,y,zoom,tilt} verbatim (the default)
 *  basin    high above the basin, centred on camera.{x,y}, slow drift
 *  freeway  low along the 110 at speed, northbound into USC; `stream` is the rail position
 *  topdown  straight down on camera.{x,y} at camera.zoom, the map as a map
 *  block    hovering over one block at agent.to, slow orbit
 */
export type GridMode = "free" | "basin" | "freeway" | "topdown" | "block";

/**
 * A screen rectangle (CSS px, viewport coordinates, like getBoundingClientRect)
 * that dissolves into points of light which drift down into the field.
 * t0 is performance.now() at the moment it starts. The engine consumes and
 * empties grid.bursts each frame, so push and forget.
 */
export interface GridBurst {
  x: number;
  y: number;
  w: number;
  h: number;
  t0: number;
  /** optional "#rrggbb" the points start as; defaults to ink */
  color?: string;
}

export const grid = {
  load: 0, // 0..1 load clock: scattered points fly onto their streets
  pulse: 0, // 0..1 one ring pulse outward from USC
  stream: 0, // 0..1 light streams down the freeways into USC, then out to business points
  camera: { x: 0, y: 0, zoom: 1, tilt: 0 }, // target in metres from USC; the engine eases toward it
  mode: "free" as GridMode, // camera voice per chapter, see GridMode
  highlight: 0, // 0..1 the "worth reaching" businesses near the agent light up cardinal, nearest first
  agent: { t: 0, from: [0, 0] as [number, number], to: [0, 0] as [number, number] }, // agent light routes along real streets from -> to as t goes 0..1
  dim: 0, // 0..1 fades the whole field back so DOM panels read cleanly
  exit: 0, // 0..1 the field dissolves into paper at the page end
  bursts: [] as GridBurst[], // push screen rects to dissolve them into the field
  world: 0, // colour world along the chapter ramp, fractional blends: 0 night, 1 dawn sky, 2 cardinal, 3 cream week, 4 deep cardinal join (see palette.ts)
  // How the current world change spreads (wave.ts): from world `from` to
  // `to` (= from + 1), t 0..1 of the way, out from `origin` in metres along
  // the real streets. The page writes it with world = from + t; the engine
  // eases world and spreads each change from the origin given for it.
  wave: { origin: [0, 0] as [number, number], t: 0, from: 0, to: 1 },
  // WRITTEN BY THE ENGINE: where the six businesses nearest the agent sit
  // on screen right now (CSS px, viewport), nearest first, so the page can
  // draw the conduits that carry them up into the lead list. Empty when the
  // agent is off.
  lit: [] as [number, number][],
  isDark: true, // WRITTEN BY THE ENGINE each frame from the eased world: true means put light text over the field
};

export type GridState = typeof grid;

// A real dental office node near Wilshire and Western, from public/tts/grid (see README there).
export const KOREATOWN: [number, number] = [-2004, 4594];
