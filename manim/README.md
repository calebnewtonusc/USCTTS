# Manim clips for the home page

Four short 3Blue1Brown-style explainers, one per thing the TTS team builds in
the home page's dental-office week (docs/DIRECTION-tts-v4.md, section 3). Each
clip carries one idea, and the picture makes the argument.

| Clip                    | Shows                                                                                                                                        | Length |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `gtm_score`             | 40 businesses on "nearby" and "growing". A decision line rotates to fit, the ones above it turn cardinal and lift, and a counter ticks to 15 | 8.9s   |
| `gtm_score_on_cardinal` | The same clip for the page's full-cardinal "finding customers" world: paper ink, and the picks flare gold                                    | 8.9s   |
| `email_draft`           | A patient asks to move a cleaning. The reply builds word by word from candidates with probability bars, then "a person checks it"            | 10.2s  |
| `crm_merge`             | Three messy rows for Dan Ortiz. Matching fields light up and link, then the table folds into one clean card                                  | 7.2s   |
| `teach_curve`           | Confidence climbs one step per lesson, forgets less after each one, and clears "runs it without us"                                          | 8.7s   |

Finished files are in `public/tts/manim/`: `<name>.webm` (VP9 with alpha),
`<name>.mov` (HEVC with alpha, for Safari) and `<name>.png` (the final frame
with alpha, for a poster). Each video is under 1.4MB.

## Using them on the page

The clips are drawn for light grounds: paper `#FBFAF7` and the week's cream.
Their ink text disappears on the navy opening and on the cardinal field, so
use `gtm_score_on_cardinal` on cardinal, and keep the others on paper or cream.

```html
<video autoplay muted playsinline loop poster="/tts/manim/crm_merge.png">
  <source src="/tts/manim/crm_merge.mov" type='video/mp4; codecs="hvc1"' />
  <source src="/tts/manim/crm_merge.webm" type="video/webm" />
</video>
```

Safari takes the HEVC source and other browsers skip to the WebM. Put the
`.mov` first: Safari can also play WebM, and VP9 alpha there is not
something to rely on.

## Rebuilding

```bash
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python manim
./render.sh                      # all five, 1080p30, serial, under nice
./render.sh CrmMerge             # one scene
SKIP_RENDER=1 ./render.sh        # re-encode only
.venv/bin/manim -ql scenes.py TeachCurve   # quick draft on paper
```

There is no LaTeX on this machine, so every label is `Text`. The fonts are the
site's own, Instrument Sans and Geist Mono, from Google Fonts under the OFL
(`fonts/`). `scenes.py` registers them at render time.

manim's transparent frames come out pre-blended over the background colour.
So scenes render over black when `--transparent` is set, and `render.sh`
unpremultiplies before encoding. Without that step, every soft edge shows a
pale halo on a dark ground.
