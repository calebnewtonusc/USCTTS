#!/bin/zsh
# Re-render the /way machine film in the v2 clay look and encode it beside
# the live one. One heavy job, start to finish, through the machine queue:
#   chewbacca jobs submit --heavy --title "tts film v2" -- zsh blender/film_v2.sh
# Writes public/tts/machine/seq-v2/<set>/ and still-{land,port}-v2.webp; the
# swap into seq/ is a separate, checked step. Raw PNGs are deleted after the
# encode, since the disk is tight. Re-running resumes: it asks Blender only
# for the frames whose PNG is still missing.
set -euo pipefail
cd "${0:A:h}/.."
B=/Applications/Blender.app/Contents/MacOS/Blender
R=blender/renders-v2
mkdir -p $R/land $R/port
missing() { # frames 1..375 with no PNG yet, as lo-hi ranges for --frames
  python3 - "$1" <<'PY'
import os, sys
d = sys.argv[1]
miss = [f for f in range(1, 376) if not os.path.exists(f"{d}/f{f:04d}.png")]
runs, start = [], None
for i, f in enumerate(miss):
    if start is None: start = f
    if i + 1 == len(miss) or miss[i + 1] != f + 1:
        runs.append(f"{start}-{f}"); start = None
print(" ".join(runs))
PY
}
for cut in land port; do
  flags=(--res 2560)
  [[ $cut == port ]] && flags=(--portrait --res 1440)
  for run in $(missing $R/$cut); do
    $B -b -P blender/machine.py -- --mode frames --look v2 --no-grain --skip-audit \
      $flags --frames $run --out $R/$cut
  done
done
FILM_SRC=$R FILM_OUT=public/tts/machine/seq-v2 python3 blender/encode_seq.py
python3 - <<'PY'
from PIL import Image
for cut, size in (("land", (2560, 1440)), ("port", (1440, 2560))):
    im = Image.open(f"blender/renders-v2/{cut}/f0360.png").convert("RGB")
    im.resize(size, Image.LANCZOS).save(f"public/tts/machine/still-{cut}-v2.webp", "WEBP", quality=82, method=6)
PY
rm -rf $R
echo FILM_V2_DONE
