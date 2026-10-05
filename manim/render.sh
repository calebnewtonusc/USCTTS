#!/bin/zsh
# Render the four clips at 1080p30 with alpha and encode them for the web.
# Usage: ./render.sh [SceneName ...]   (default: all five)
#        SKIP_RENDER=1 ./render.sh       re-encode existing renders only
# Runs serially under nice: one manim render or ffmpeg encode at a time.
set -euo pipefail
cd "${0:A:h}"
out=../public/tts/manim
mkdir -p "$out"

typeset -A names=(GtmScore gtm_score GtmScoreOnCardinal gtm_score_on_cardinal EmailDraft email_draft
  CrmMerge crm_merge TeachCurve teach_curve)
scenes=(GtmScore GtmScoreOnCardinal EmailDraft CrmMerge TeachCurve)
[[ $# -gt 0 ]] && scenes=($@)

for scene in $scenes; do
  name=${names[$scene]}
  [[ -n ${SKIP_RENDER:-} ]] || nice -n 19 .venv/bin/manim -qh --fps 30 --transparent --disable_caching scenes.py "$scene"
  raw=media/videos/scenes/1080p30/$scene.mov
  # scenes.py renders transparent frames over black, which leaves them
  # premultiplied; undo that once into a lossless intermediate.
  src=media/videos/scenes/1080p30/$scene.straight.mov
  nice -n 19 ffmpeg -v error -y -i "$raw" -vf "format=gbrap,unpremultiply=inplace=1,format=argb" \
    -c:v qtrle "$src"
  # WebM VP9 with alpha: Chrome, Firefox, Edge.
  nice -n 19 ffmpeg -v error -y -i "$src" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 32 \
    -row-mt 1 -an "$out/$name.webm"
  # HEVC with alpha in .mov for Safari, which cannot play VP9 alpha. The alpha
  # layer dominates the size: at alpha_quality 0.75 gtm_score was 1.68MB at
  # 900k and still 1.60MB at 600k; 0.5 brought it to 1.23MB. email_draft, the
  # busiest, was 1.58MB at 0.5/700k and 1.13MB at 0.5/400k, hence 500k.
  nice -n 19 ffmpeg -v error -y -i "$src" -c:v hevc_videotoolbox -allow_sw 1 -alpha_quality 0.5 \
    -b:v 500k -tag:v hvc1 -pix_fmt bgra -an "$out/$name.mov"
  # Poster: the final frame, with alpha.
  nice -n 19 ffmpeg -v error -y -sseof -0.1 -i "$src" -frames:v 1 -update 1 "$out/$name.png"
  ls -l "$out/$name".{webm,mov,png}
done
