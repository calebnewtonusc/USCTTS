"use client";

import { useEffect } from "react";
import { glideTo, yAt } from "../v4/choreo";

/*
 * "The TTS way" in the nav points at /#way, the start of the semester's
 * story. No element carries id="way", so the browser never jumps there on
 * its own: arriving from another page lands at the top and then glides,
 * and a click on this page glides (feedback: "NEVER have sudden jumps for
 * any button ever"). The nav fires "tts:way" for the same-page case.
 */
export default function WayHash() {
  useEffect(() => {
    const go = () => glideTo(yAt("week", 0));
    const onWay = () => go();
    window.addEventListener("tts:way", onWay);
    let t = 0;
    if (window.location.hash === "#way") {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      window.scrollTo({ top: 0, behavior: "instant" });
      // Long enough for the first frames of the city to land.
      t = window.setTimeout(go, 900);
    }
    return () => {
      window.removeEventListener("tts:way", onWay);
      window.clearTimeout(t);
    };
  }, []);
  return null;
}
