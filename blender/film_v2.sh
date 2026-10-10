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
# A Metal render the queue pauses (SIGSTOP) and resumes comes back broken:
# on 2026-10-10 every frame after the first pause rendered the lilac parts
# solid black, 210 of the first 375. So each Blender run is short (CHUNK
# frames, fresh GPU state), every frame is checked for pure-black regions
# afterwards, and a bad one is deleted and rendered again.
CHUNK=8
sweep() { # delete frames with pure-black regions; print how many went
  python3 - "$1" <<'PY'
import os, sys
import numpy as np
from PIL import Image
d, n = sys.argv[1], 0
for f in sorted(os.listdir(d)):
    try:
        a = np.asarray(Image.open(f"{d}/{f}").convert("RGB").reduce(8))
        bad = (a.max(axis=2) < 6).mean() > 0.0005
    except Exception:
        bad = True  # a half-written PNG from a killed run
    if bad:
        os.remove(f"{d}/{f}"); n += 1
print(n)
PY
}
missing() { # the missing frames as CHUNK-sized lo-hi ranges for --frames
  python3 - "$1" "$CHUNK" <<'PY'
import os, sys
d, k = sys.argv[1], int(sys.argv[2])
miss = [f for f in range(1, 376) if not os.path.exists(f"{d}/f{f:04d}.png")]
runs, cur = [], []
for f in miss:
    if cur and (f != cur[-1] + 1 or len(cur) == k):
        runs.append(f"{cur[0]}-{cur[-1]}"); cur = []
    cur.append(f)
if cur: runs.append(f"{cur[0]}-{cur[-1]}")
print(" ".join(runs))
PY
}
for attempt in 1 2 3 4 5 6; do
  left=0
  for cut in land port; do
    flags=(--res 2560)
    [[ $cut == port ]] && flags=(--portrait --res 1440)
    echo "attempt $attempt $cut: removed $(sweep $R/$cut) bad frames"
    for run in $(missing $R/$cut); do
      $B -b -P blender/machine.py -- --mode frames --look v2 --no-grain --skip-audit \
        $flags --frames $run --out $R/$cut
      sweep $R/$cut >/dev/null
    done
    left=$((left + $(missing $R/$cut | wc -w)))
  done
  [[ $left -eq 0 ]] && break
done
for cut in land port; do
  [[ -z "$(missing $R/$cut)" ]] || { echo "FILM_V2_INCOMPLETE $cut"; exit 1; }
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
