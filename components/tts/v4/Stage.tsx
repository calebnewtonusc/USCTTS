"use client";

import { useEffect } from "react";
import { onFrame, startLoadClock, startRegions, store } from "./choreo";
import LAGrid from "../grid/LAGrid";
import Readouts from "./Readouts";

/*
 * Everything fixed behind and over the home page: the LA field, the readout
 * strip, and the veil same-page moves dissolve under. It also starts the
 * page's two clocks, the scroll loop and the load clock, once.
 */
export default function Stage() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const offRegions = startRegions();
    const offLoad = startLoadClock(reduced);
    // Which colour world is on screen. The page writes grid.world from
    // scroll (choreo.ts); the engine eases toward it and writes isDark from
    // the colour it is actually drawing, which keeps settling after the
    // scroll stops, so this checks it on a short timer as well as on scroll.
    const root = document.querySelector<HTMLElement>(".tts .v4");
    let was = "";
    const sync = () => {
      if (!root) return;
      const dark = store.isDark;
      const world = dark ? (store.world < 1 ? "navy" : "cardinal") : "light";
      if (world === was) return;
      was = world;
      root.classList.toggle("is-dark", dark);
      root.dataset.world = world;
    };
    const offWorld = onFrame(sync, 2);
    const timer = window.setInterval(() => {
      if (!document.hidden) sync();
    }, 120);
    return () => {
      offRegions();
      offLoad();
      offWorld();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <>
      <div className="v4-field" aria-hidden="true">
        <LAGrid className="v4-grid-canvas" />
      </div>
      <Readouts />
      <div className="v4-veil" aria-hidden="true" />
    </>
  );
}
