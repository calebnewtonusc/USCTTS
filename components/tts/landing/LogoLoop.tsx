"use client";

import { useEffect, useRef } from "react";

/*
 * The clay TTS mark doing its sign-off bit at the bottom of home
 * (blender/logo_loop.py): two small bounces, a jump with one full turn, a
 * landing wobble, then a two second hold before the loop. Caleb,
 * 2026-10-10: "a lil silly bit where the logo bounces a lil bit, then jumps
 * and spins around and lands and wobbles a lil bit then comes back to being
 * still".
 *
 * It is transparent, so the file depends on the browser: Safari drops the
 * alpha plane of a VP9 WebM and gets the HEVC-with-alpha MP4; everyone else
 * gets the WebM (Chrome on a Mac decodes HEVC but not its alpha). The file
 * is chosen once on mount; until then, and always under reduced motion, the
 * poster (frame 0, the mark at rest) is what shows. It plays only while on
 * screen and the tab is visible.
 */

const BASE = "/tts/home/logo";
// 640 since 2026-10-10: the mark shows at 260 css px at most, and the
// smaller render is what let every loop land the night it was asked for.
const SIZE = 640;

function isSafari() {
  const ua = navigator.userAgent;
  return (
    /safari/i.test(ua) && !/chrome|chromium|crios|fxios|android|edg/i.test(ua)
  );
}

export default function LogoLoop({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let loaded = false;
    let onScreen = false;

    const sync = () => {
      if (
        onScreen &&
        !reduce.matches &&
        document.visibilityState === "visible"
      ) {
        if (!loaded) {
          video.src = isSafari()
            ? `${BASE}-loop-${SIZE}.mp4`
            : `${BASE}-loop-${SIZE}.webm`;
          loaded = true;
        }
        // A refused autoplay leaves the poster, the mark at rest.
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };

    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    seen.observe(video);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    return () => {
      seen.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={`${BASE}-poster-${SIZE}.webp`}
      width={SIZE}
      height={SIZE}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      role="img"
      aria-label="The Trojan Tech Solutions mark, a clay arch in cardinal, gold and cream with a T rising from the USC dot, bouncing, spinning and landing"
    />
  );
}
