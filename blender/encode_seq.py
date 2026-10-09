"""Encode the rendered machine film into the WebP sequences the page draws.

  python3 blender/encode_seq.py   (renders in blender/renders/{land,port})

Sets, in public/tts/machine/seq/<set>/NNNN.webp:
  land-2560  2560x1440, desktop at dpr 2 (the 1280x720 film was stretched
             across 1440 to 2880px screens: "Both of them blurry asf")
  land-1280  1280x720, loaded first everywhere so the film is never blank
  port-1440  1440x2560, phones once the low set is in
  port-720   720x1280, phones first
Skips a frame already encoded, so a paused or stopped run resumes.
"""
import os
import sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "renders")
OUT = os.path.join(HERE, "..", "public", "tts", "machine", "seq")
SETS = [
    ("land-2560", "land", (2560, 1440), 80),
    ("land-1280", "land", (1280, 720), 78),
    ("port-1440", "port", (1440, 2560), 78),
    ("port-720", "port", (720, 1280), 76),
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
