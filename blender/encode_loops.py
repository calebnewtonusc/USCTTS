"""Grade and encode a hero loop (blender/loops.py) for the page.

  python3 blender/encode_loops.py FRAMES_DIR NAME [--mobile W] [--fps 24] [--keep]

Reads FRAMES_DIR/f_0000.png .. f_<6 s of frames>.png and writes to public/tts/home/:

  NAME-loop-<w>.mp4    H.264 High, yuv420p, BT.709 tagged, faststart
  NAME-loop-<w>.webm   VP9, constant quality
  NAME-loop-<m>.mp4/.webm   the same at --mobile width, for phones
  NAME-poster-<w>.webp, NAME-poster-<w/2>.webp   frame 0, graded, for the
                       poster and the reduced-motion still

The grade is encode_heroes.py's, with two changes for video:
  grain     static (one seed for every frame), so it sits in the image like the
            stills' grain instead of boiling, and costs almost no bits; std
            0.022 at 2x, under the stills' 0.03, because H.264 smears grain
            that moves with nothing and the clay bump already carries texture.
            Static grain also dithers the sky and sweep gradients, which band
            in 8-bit 4:2:0 without it.
  vignette  the stills' falloff, corners to 90%.

Quality: CRF 17 (x264, preset slow) and CRF 27 (VP9) were the first settings
whose SSIM against the graded frames stayed above 0.985 on the grainy blush
sweep; the script prints SSIM for both files so a regression shows up here,
not on the page. Colour is converted with the BT.709 matrix and tagged, since
browsers read untagged HD video as 709 and an untagged 601 conversion shifts
cardinal toward orange.

It also prints the loop seam: the mean difference from the last frame to the
first, against the median step between neighbours. A seam ratio near 1 means
the jump from frame 179 to 0 is just another frame.
"""
import glob
import os
import re
import shutil
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "tts", "home")
FPS = 30
CRF_H264, CRF_VP9 = 17, 27
COLOR = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"]


def grade_fields(w, h, seed=7, amp=0.022):
    rng = np.random.default_rng(seed)
    g = rng.normal(0.0, 1.0, (h, w)).astype(np.float32)
    gi = Image.fromarray(((g * 40) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    g = (np.asarray(gi).astype(np.float32) - 128) / 40
    g *= amp / max(g.std(), 1e-6)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    vig = 1.0 - 0.1 * np.clip((r - 0.35) / 0.65, 0, 1) ** 2
    return ((1.0 + g) * vig)[..., None]


def ffmpeg(args):
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y"] + args
    subprocess.run(cmd, check=True)


def encode(src_pattern, out_base, width, height):
    scale = f"scale={width}:{height}:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p"
    mp4, webm = out_base + ".mp4", out_base + ".webm"
    ffmpeg(["-framerate", str(FPS), "-i", src_pattern, "-vf", scale, "-c:v", "libx264", "-preset", "slow",
            "-crf", str(CRF_H264), "-profile:v", "high", "-x264-params", f"keyint={FPS * 2}:min-keyint={FPS * 2}",
            "-movflags", "+faststart", "-an"] + COLOR + [mp4])
    ffmpeg(["-framerate", str(FPS), "-i", src_pattern, "-vf", scale, "-c:v", "libvpx-vp9", "-crf", str(CRF_VP9),
            "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-g", str(FPS * 2), "-an"]
           + COLOR + [webm])
    for f in (mp4, webm):
        kb = os.path.getsize(f) / 1e3
        mbps = os.path.getsize(f) * 8 / (len(glob.glob(src_pattern.replace("%04d", "*"))) / FPS) / 1e6
        ssim = subprocess.run(
            ["ffmpeg", "-hide_banner", "-i", f, "-framerate", str(FPS), "-i", src_pattern, "-lavfi",
             f"[1:v]scale={width}:{height}:flags=lanczos[ref];[0:v][ref]ssim", "-f", "null", "-"],
            capture_output=True, text=True).stderr
        m = re.search(r"All:([0-9.]+)", ssim)
        print(f"{os.path.relpath(f)}  {width}x{height}  {kb:.0f} KB  {mbps:.1f} Mbit/s  SSIM {m.group(1) if m else '?'}")


def seam(frames):
    def small(p):
        im = Image.open(p).convert("L")
        return np.asarray(im.resize((im.width // 4, im.height // 4), Image.BILINEAR)).astype(np.float32)

    arr = [small(p) for p in frames]
    steps = [np.abs(arr[i + 1] - arr[i]).mean() for i in range(len(arr) - 1)]
    wrap = np.abs(arr[0] - arr[-1]).mean()
    med = float(np.median(steps))
    print(f"seam: last->first {wrap:.3f}, median step {med:.3f}, max step {max(steps):.3f}, ratio {wrap / max(med, 1e-6):.2f}")


def encode_alpha(frames, src, name):
    """A transparent loop (the logo): VP9 with alpha for Chrome and Firefox,
    HEVC with alpha for Safari, which drops the alpha plane of a VP9 WebM.
    No grain: it would land on the page as speckle around the mark."""
    w, h = Image.open(frames[0]).size
    pattern = os.path.join(src, "f_%04d.png")
    base = os.path.join(OUT, f"{name}-loop-{w}")
    ffmpeg(["-framerate", str(FPS), "-i", pattern, "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
            "-crf", "24", "-b:v", "0", "-auto-alt-ref", "0", "-row-mt", "1", "-deadline", "good",
            "-cpu-used", "2", "-an", base + ".webm"])
    ffmpeg(["-framerate", str(FPS), "-i", pattern, "-c:v", "hevc_videotoolbox", "-pix_fmt", "bgra",
            "-alpha_quality", "0.9", "-b:v", "6M", "-tag:v", "hvc1", "-movflags", "+faststart", "-an",
            base + ".mp4"])
    poster = Image.open(frames[0]).convert("RGBA")
    for pw in (w, w // 2):
        cut = poster if pw == w else poster.resize((pw, pw * h // w), Image.LANCZOS)
        out = os.path.join(OUT, f"{name}-poster-{pw}.webp")
        cut.save(out, "WEBP", quality=90, method=6)
        print(os.path.relpath(out), f"{os.path.getsize(out) / 1e3:.0f} KB")
    for f in (base + ".webm", base + ".mp4"):
        print(os.path.relpath(f), f"{os.path.getsize(f) / 1e3:.0f} KB")


def main():
    global FPS
    src, name = sys.argv[1], sys.argv[2]
    if "--fps" in sys.argv:  # 24 since 2026-10-10, when the loops moved to EEVEE to land in one night
        FPS = int(sys.argv[sys.argv.index("--fps") + 1])
    mobile = int(sys.argv[sys.argv.index("--mobile") + 1]) if "--mobile" in sys.argv else 0
    frames = sorted(glob.glob(os.path.join(src, "f_*.png")))
    bad = [f for f in frames if os.path.getsize(f) == 0]
    if len(frames) != FPS * 6 or bad:
        sys.exit(f"expected {FPS * 6} finished frames, found {len(frames)} ({len(bad)} empty placeholders)")
    seam(frames)
    if "--alpha" in sys.argv:
        encode_alpha(frames, src, name)
        return
    tmp = os.path.join(src, "graded")
    os.makedirs(tmp, exist_ok=True)
    w, h = Image.open(frames[0]).size
    field = grade_fields(w, h)
    for i, f in enumerate(frames):
        a = np.asarray(Image.open(f).convert("RGB")).astype(np.float32) / 255.0
        g = Image.fromarray((np.clip(a * field, 0, 1) * 255 + 0.5).astype(np.uint8))
        g.save(os.path.join(tmp, f"g_{i:04d}.png"), compress_level=1)
        if i == 0:
            for pw in (w, w // 2):
                cut = g if pw == w else g.resize((pw, round(h * pw / w)), Image.LANCZOS)
                out = os.path.join(OUT, f"{name}-poster-{pw}.webp")
                cut.save(out, "WEBP", quality=88, method=6)
                print(os.path.relpath(out), cut.size, f"{os.path.getsize(out) / 1e3:.0f} KB")
    pattern = os.path.join(tmp, "g_%04d.png")
    encode(pattern, os.path.join(OUT, f"{name}-loop-{w}"), w, h)
    if mobile:
        mh = int(round(h * mobile / w / 2) * 2)
        encode(pattern, os.path.join(OUT, f"{name}-loop-{mobile}"), mobile, mh)
    if "--keep" not in sys.argv:
        shutil.rmtree(tmp)


if __name__ == "__main__":
    main()
