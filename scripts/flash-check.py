"""Find every flash on a scroll page: a frame-to-frame jump in brightness or hue.

  python3 scripts/flash-check.py http://localhost:3000/way [--steps 300] [--out DIR]

Caleb, 2026-10-10, on /way: "so many flashbangs of sudden color changes that
are unintentional on the map", and "The ending is a white flash bang that
turns into red". A deliberate change eases over at least about 400ms of
scroll; a flash happens between two neighbouring scroll positions. So this
scrubs the page's whole scroll in small steps in headless Chromium (Metal, so
WebGL runs at speed), lets each position settle, and records the mean
luminance and the dominant hue of the frame. It flags:

  luminance  a change of more than 8% of full scale between neighbours
  hue        a jump of more than 40 degrees between neighbours, counted only
             when both frames are saturated enough to have a hue (s > 0.18)
  blowout    a frame that is mostly white (over 70% of pixels above 0.92)
  flat red   a frame that is mostly one flat cardinal (over 70% of pixels)

Exit 1 when anything is flagged. Each step's thumbnail is written to --out
so a flagged pair can be looked at, which is the point: the numbers find the
frames, the eyes judge them.

The 8% and 40 degree thresholds come from the coordinator's brief
(2026-10-10), not from a measurement; the settle time is guessed. Tune them
against a page you have looked at frame by frame.
"""
import argparse
import colorsys
import json
import os
import sys
import time

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ARGS = ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"]
LUM_JUMP = 0.08
HUE_JUMP = 40.0
SAT_MIN = 0.18
# A hue jump also needs the saturated pixels' hue histogram to move: L1
# distance over 0.6 of a possible 2. The peak alone flips between two
# near-equal hues on a still scene. Measured 2026-10-11 on /way's green
# film world: grass against the cream table flipped the peak 45 <-> 95 on
# eight neighbour pairs with L1 0.04 to 0.19, while the iris from the blue
# map into the film measured 1.29 and 1.75.
HIST_JUMP = 0.6


def stats(path):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.float32) / 255.0
    lum = float((0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]).mean())
    white = float(((a.min(axis=2)) > 0.92).mean())
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    red = float(((r > 0.45) & (g < 0.2) & (b < 0.25)).mean())
    # dominant hue: the hue histogram's peak over saturated pixels
    hsv = np.asarray(im.convert("HSV")).astype(np.float32) / 255.0
    sat = hsv[..., 1] > SAT_MIN
    share = float(sat.mean())
    hue = None
    if share > 0.15:
        h = (hsv[..., 0][sat] * 360.0).astype(np.int32) // 10
        counts = np.bincount(h, minlength=36).astype(np.float64)
        hue = float(counts.argmax() * 10 + 5)
        hist = [round(float(v), 4) for v in counts / counts.sum()]
    else:
        hist = None
    return {"lum": round(lum, 4), "white": round(white, 3), "red": round(red, 3), "hue": hue,
            "hist": hist, "sat_share": round(share, 3)}


def hue_dist(a, b):
    d = abs(a - b) % 360
    return min(d, 360 - d)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--steps", type=int, default=300)
    ap.add_argument("--settle", type=float, default=0.45, help="seconds to wait at each step")
    ap.add_argument("--from", dest="lo", type=float, default=0.0, help="start, as a share of the scroll")
    ap.add_argument("--to", dest="hi", type=float, default=1.0)
    ap.add_argument("--out", default="/tmp/flash-check")
    ap.add_argument("--width", type=int, default=1440)
    ap.add_argument("--height", type=int, default=900)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    rows = []
    with sync_playwright() as p:
        b = p.chromium.launch(args=ARGS)
        pg = b.new_page(viewport={"width": a.width, "height": a.height}, device_scale_factor=1)
        pg.goto(a.url, wait_until="networkidle")
        time.sleep(3)
        total = pg.evaluate("document.documentElement.scrollHeight - innerHeight")
        y_prev = 0
        for i in range(a.steps + 1):
            share = a.lo + (a.hi - a.lo) * i / a.steps
            y = int(total * share)
            # walk there, so the page's followed scroll moves the way a hand does
            for k in range(y_prev, y, 200):
                pg.evaluate(f"scrollTo(0,{k})")
                time.sleep(0.016)
            pg.evaluate(f"scrollTo(0,{y})")
            y_prev = y
            time.sleep(a.settle)
            path = os.path.join(a.out, f"{i:04d}.png")
            pg.screenshot(path=path, scale="css")
            Image.open(path).resize((360, 225)).save(path)
            s = stats(path)
            s.update(step=i, y=y, share=round(share, 4))
            rows.append(s)
        b.close()
    flags = []
    for prev, cur in zip(rows, rows[1:]):
        why = []
        if abs(cur["lum"] - prev["lum"]) > LUM_JUMP:
            why.append(f"luminance {prev['lum']:.3f} -> {cur['lum']:.3f}")
        if prev["hue"] is not None and cur["hue"] is not None and hue_dist(prev["hue"], cur["hue"]) > HUE_JUMP:
            moved = sum(abs(x - y) for x, y in zip(prev["hist"], cur["hist"]))
            if moved > HIST_JUMP:
                why.append(f"hue {prev['hue']:.0f} -> {cur['hue']:.0f} (histogram moved {moved:.2f})")
        if why:
            flags.append({"steps": [prev["step"], cur["step"]], "y": [prev["y"], cur["y"]], "why": why})
    for r in rows:
        if r["white"] > 0.7:
            flags.append({"steps": [r["step"]], "y": [r["y"]], "why": [f"mostly white ({r['white']:.0%})"]})
        if r["red"] > 0.7:
            flags.append({"steps": [r["step"]], "y": [r["y"]], "why": [f"mostly flat red ({r['red']:.0%})"]})
    json.dump({"url": a.url, "rows": rows, "flags": flags}, open(os.path.join(a.out, "report.json"), "w"), indent=1)
    for f in flags:
        print("FLAG", f["steps"], "y", f["y"], "; ".join(f["why"]))
    print(f"flash-check: {len(flags)} flag(s) over {len(rows)} frames, thumbnails in {a.out}")
    sys.exit(1 if flags else 0)


if __name__ == "__main__":
    main()
