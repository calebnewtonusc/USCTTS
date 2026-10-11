"use client";

import { useEffect, useRef } from "react";

/*
 * One home hero as a looping clay film (blender/loops.py, encoded by
 * blender/encode_loops.py). Caleb, 2026-10-10: "Make these fire looping fun
 * animation videos like the clay site!"
 *
 * The poster is frame 0 of the loop, so the still and the film are one
 * picture and nothing jumps when playback starts. The film loads only once
 * the frame is within a screen of the viewport (preload none until then),
 * plays only while any of it is on screen and the tab is visible, and never
 * plays under prefers-reduced-motion, which leaves the poster in place
 * (INTENT-home.md, "One world" rule 6: ambient loops pause offscreen and in
 * a hidden tab). Phones get the half-width files through <source media>.
 */

export interface HeroLoopProps {
  /** public path prefix, e.g. "/tts/home/mailbox" */
  name: string;
  /** desktop width in px (the 2x render) and, if any, the phone width */
  width: number;
  height: number;
  mobileWidth?: number;
  /** empty for a decorative film */
  label: string;
  className?: string;
}

export default function HeroLoop({
  name,
  width,
  height,
  mobileWidth,
  label,
  className,
}: HeroLoopProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;

    const sync = () => {
      if (
        onScreen &&
        !reduce.matches &&
        document.visibilityState === "visible"
      ) {
        // A refused autoplay (iOS Low Power Mode, data saver) is expected:
        // the poster stays, which is the reduced-motion picture anyway.
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };

    const near = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          video.preload === "none" &&
          !reduce.matches
        ) {
          video.preload = "auto";
          video.load();
        }
      },
      { rootMargin: "100% 0px" },
    );
    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    near.observe(video);
    seen.observe(video);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    return () => {
      near.disconnect();
      seen.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={`${name}-poster-${width}.webp`}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    >
      {mobileWidth ? (
        <>
          <source
            media="(max-width: 899px)"
            src={`${name}-loop-${mobileWidth}.webm`}
            type="video/webm"
          />
          <source
            media="(max-width: 899px)"
            src={`${name}-loop-${mobileWidth}.mp4`}
            type="video/mp4"
          />
        </>
      ) : null}
      <source src={`${name}-loop-${width}.webm`} type="video/webm" />
      <source src={`${name}-loop-${width}.mp4`} type="video/mp4" />
    </video>
  );
}
