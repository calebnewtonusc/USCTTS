"""Where the film's machine is, stage by stage, so a caption never covers it.

  python3 scripts/caption-room.py   (writes public/tts/machine/room.json)

Caleb, 2026-10-11, twice in one evening: "Never block important things when
they should be shown!" and "Bro ur literally covering the typewriter lmao
check all placements". Caption corners picked by eye at one window size
still landed on the typewriter at his. So this measures the machine in
every frame each caption is up for, and Week.tsx picks each caption's
corner from it for the reader's own screen.

The machine is every lit, strongly coloured pixel that isn't grass (blue,
purple, yellow, red), while the ground is green, a warm tan or in shadow.
Each cell grows by one neighbour, which takes in the pale parts joined to
them (rollers, chutes, the spiral).
"""
import json
import os

import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "tts", "machine")
STAGES = json.load(open(os.path.join(ROOT, "stages.json")))
SETS = {"land": ("seq/land-1280", 32, 18), "port": ("seq/port-720", 18, 32)}
# The window of a stage a caption is up for (Week.tsx: t 0.02 to 0.9; the
# pull-back's from 0.3).
UP = (0.02, 0.9)
# Frames per chunk of the per-moment map: a fifth of a second of film, and
# about 40px of scroll at 1440x900.
CHUNK = 6


def mask(path):
    im = Image.open(path).convert("RGB")
    hsv = np.asarray(im.convert("HSV")).astype(np.int32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    green = (h >= 50) & (h <= 120)
    # Coloured parts, lit: the sand's shadows run warm and dark, and read
    # as machine at v 90. The pale parts can't be told from the table by
    # colour (spiral saturation 29 of 255, the table's top 32), so they
    # count through the coloured parts they're joined to, one cell out.
    return (s > 120) & (v > 140) & ~green


def grid(m, cols, rows):
    H, W = m.shape
    g = np.zeros((rows, cols))
    for r in range(rows):
        for c in range(cols):
            cell = m[r * H // rows:(r + 1) * H // rows, c * W // cols:(c + 1) * W // cols]
            g[r, c] = cell.mean()
    return g


out = {}
for key, (sub, cols, rows) in SETS.items():
    st = {}
    for name, (a, b) in STAGES.items():
        t0 = 0.3 if name == "out" else UP[0]
        f0, f1 = int(a + (b - a) * t0), int(a + (b - a) * UP[1])
        # Mean over the frames, each frame's machine grown by one cell: the
        # camera moves through a stage, and the union of every frame's
        # machine covered 80 to 90% of the screen, which leaves no answer.
        occ = np.zeros((rows, cols))
        n = 0
        for f in range(f0, f1 + 1):
            p = os.path.join(ROOT, sub, f"{f + 1:04d}.webp")
            if not os.path.exists(p):
                continue
            on = grid(mask(p), cols, rows) > 0.04
            g = on.copy()
            g[1:] |= on[:-1]
            g[:-1] |= on[1:]
            g[:, 1:] |= on[:, :-1]
            g[:, :-1] |= on[:, 1:]
            occ += g
            n += 1
        occ /= max(1, n)
        # One digit a cell, 0 to 9: the share of the frames it's taken in.
        st[name] = "".join(str(min(9, int(round(x * 9)))) for x in occ.flatten())
    # And every CHUNK frames, which cells the machine is in at all, so a
    # caption can step aside as the camera brings the machine to it.
    chunks = []
    n_frames = max(b for _, b in STAGES.values())
    for c0 in range(0, n_frames, CHUNK):
        on = np.zeros((rows, cols), bool)
        for f in range(c0, min(n_frames, c0 + CHUNK)):
            p = os.path.join(ROOT, sub, f"{f + 1:04d}.webp")
            if os.path.exists(p):
                on |= grid(mask(p), cols, rows) > 0.04
        g = on.copy()
        g[1:] |= on[:-1]
        g[:-1] |= on[1:]
        g[:, 1:] |= on[:, :-1]
        g[:, :-1] |= on[:, 1:]
        on = g
        chunks.append("".join("1" if x else "0" for x in on.flatten()))
    out[key] = {"cols": cols, "rows": rows, "stages": st, "chunk": CHUNK, "chunks": chunks}
json.dump(out, open(os.path.join(ROOT, "room.json"), "w"))
for key in out:
    for name, bits in out[key]["stages"].items():
        print(key, name, f"{sum(int(c) for c in bits) / 9 / len(bits):.0%} taken")
