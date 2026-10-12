"""Crop the cloud renders and measure where each one's body is.

  python3 scripts/cloud-crop.py <render_dir>

Reads blender/clouds.py's cloud-N.png, crops each to its own outline plus a
small margin, writes public/tts/machine/cloud-N.webp, and writes
components/tts/v4/clouds.ts with each cloud's aspect and the insets its
caption's box sits inside it by. The body is where the text goes: across,
the middle 76% of the cloud's width; down, from the first row that spans
85% of the cloud's widest row (below the bumps) to 6% above the flat
bottom. Measured, so six different shapes each carry their text on their
own body.
"""
import os
import sys

import numpy as np
from PIL import Image

SRC = sys.argv[1]
HERE = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(HERE, "public", "tts", "machine")
rows = []
k = 1
while os.path.exists(os.path.join(SRC, f"cloud-{k}.png")):
    im = Image.open(os.path.join(SRC, f"cloud-{k}.png"))
    a = np.asarray(im)[..., 3] > 128
    ys, xs = np.where(a)
    m = 12
    box = (xs.min() - m, ys.min() - m, xs.max() + m + 1, ys.max() + m + 1)
    crop = im.crop(box)
    crop.save(os.path.join(OUT, f"cloud-{k}.webp"), "WEBP", quality=88, method=6, alpha_quality=90)
    al = np.asarray(crop)[..., 3] > 128
    W, H = crop.size
    span = al.sum(axis=1)
    top = int(np.argmax(span >= 0.85 * span.max()))
    bottom = int(np.where(span > 0)[0].max())
    bx0, bx1 = 0.12 * W, 0.88 * W
    by0, by1 = top + 0.04 * H, bottom - 0.06 * H
    bw, bh = bx1 - bx0, by1 - by0
    inset = (bx0 / bw, by0 / bh, (W - bx1) / bw, (H - by1) / bh)
    rows.append((k, W / H, inset))
    k += 1
with open(os.path.join(HERE, "components", "tts", "v4", "clouds.ts"), "w") as f:
    f.write("// Written by scripts/cloud-crop.py from the renders of blender/clouds.py.\n")
    f.write("// Each: the cropped render, its width over height, and the insets the\n")
    f.write("// render is drawn past its caption's box by (left, top, right, bottom,\n")
    f.write("// each a share of the box), so the text sits on the cloud's body.\n")
    f.write("export const CLOUD_DATA: {\n  src: string;\n  aspect: number;\n  inset: [number, number, number, number];\n}[] = [\n")
    for k, asp, ins in rows:
        f.write(f'  {{ src: "/tts/machine/cloud-{k}.webp", aspect: {asp:.4f}, inset: [{", ".join(f"{v:.3f}" for v in ins)}] }},\n')
    f.write("];\n")
for r in rows:
    print(r)
