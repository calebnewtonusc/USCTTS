"""Encode the rendered machine film into the WebP sequences the page draws.

  python3 blender/encode_seq.py   (renders in blender/renders/{land,port})

Sets, in public/tts/machine/seq/<set>/NNNN.webp:
  land-2880  2880x1620, desktop at dpr 2: the canvas's own pixels at 1440
             css (the 1280x720 film was stretched across 1440 to 2880px
             screens, "Both of them blurry asf", and 2560 was still upscaled)
  land-1280  1280x720, loaded first everywhere so the film is never blank
  port-1440  1440x2560, phones once the low set is in
  port-720   720x1280, phones first
Skips a frame already encoded, so a paused or stopped run resumes.
"""
import os
import sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
# FILM_SRC and FILM_OUT redirect it, so a re-render can encode beside the
# live sequence and be swapped in whole (blender/film_v2.sh).
SRC = os.environ.get("FILM_SRC", os.path.join(HERE, "renders"))
OUT = os.environ.get("FILM_OUT", os.path.join(HERE, "..", "public", "tts", "machine", "seq"))
# Qualities raised 2026-10-10 (Caleb on the handoff frame: "blurry af"). At
# 80 the 2560 frames weighed 56 to 70 KB each, which smeared the surface
# grain and every edge. The desktop cut is 2880x1620 now, the canvas's own
# width at 1440 css and dpr 2, so it is never upscaled there.
SETS = [
    ("land-2880", "land", (2880, 1620), 92),
    ("land-1280", "land", (1280, 720), 88),
    ("port-1440", "port", (1440, 2560), 90),
    ("port-720", "port", (720, 1280), 86),
]
N = 375
for name, cut, size, q in SETS:
    d = os.path.join(OUT, name)
    os.makedirs(d, exist_ok=True)
    total = 0
    for f in range(1, N + 1):
        out = os.path.join(d, f"{f:04d}.webp")
        if not os.path.exists(out):
            im = Image.open(os.path.join(SRC, cut, f"f{f:04d}.png")).convert("RGB")
            if im.size != size:
                im = im.resize(size, Image.LANCZOS)
            im.save(out + ".tmp", "WEBP", quality=q, method=4)
            os.replace(out + ".tmp", out)
        total += os.path.getsize(out)
    print(name, f"{total / 1e6:.1f} MB", f"{total / N / 1e3:.0f} KB/frame", flush=True)
sys.exit(0)
