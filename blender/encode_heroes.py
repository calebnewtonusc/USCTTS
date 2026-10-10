"""Grade and encode home's hero stills (blender/heroes.py) for the page.

  python3 blender/encode_heroes.py RENDER.png NAME [--keep]

Writes public/tts/home/NAME-<w>.webp at the render's width and at half of it,
then deletes the PNG (the disk is tight; only the shipped WebP stays) unless
--keep. The grade is film grain and a soft vignette, added here in sRGB:
  grain     luminance-only, multiplied in, std 0.03 at 2x, blurred by 0.6px
            so it clumps like film rather than sitting as per-pixel noise.
            0.026 is what the replica study measured on Clay's ground
            (machine.py, setup_render); 0.03 at 2x reads as 0.026 once the
            browser halves it.
  vignette  corners down to 90%, the same falloff as the film's (machine.py).
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "tts", "home")


def grade(im, seed=7):
    a = np.asarray(im.convert("RGB")).astype(np.float32) / 255.0
    h, w = a.shape[:2]
    rng = np.random.default_rng(seed)
    g = rng.normal(0.0, 1.0, (h, w)).astype(np.float32)
    gi = Image.fromarray(((g * 40) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    g = (np.asarray(gi).astype(np.float32) - 128) / 40
    g *= 0.03 / max(g.std(), 1e-6)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    vig = 1.0 - 0.1 * np.clip((r - 0.35) / 0.65, 0, 1) ** 2
    a = a * (1.0 + g)[..., None] * vig[..., None]
    return Image.fromarray((a.clip(0, 1) * 255 + 0.5).astype(np.uint8))


def main():
    src, name = sys.argv[1], sys.argv[2]
    keep = "--keep" in sys.argv
    os.makedirs(OUT, exist_ok=True)
    im = grade(Image.open(src))
    w, h = im.size
    for width in (w, w // 2):
        out = os.path.join(OUT, f"{name}-{width}.webp")
        cut = im if width == w else im.resize((width, round(h * width / w)), Image.LANCZOS)
        cut.save(out, "WEBP", quality=84, method=6)
        print(out, cut.size, f"{os.path.getsize(out) / 1e3:.0f} KB")
    if not keep:
        os.remove(src)


if __name__ == "__main__":
    main()
