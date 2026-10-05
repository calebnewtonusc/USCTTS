# STEAL-tts: what we took, and what we left

Caleb's formula (`docs/DIRECTION-tts-v3.md`): "TTS site should be lemma X clay
X bma X wtv else is tuff X manim or wtv". One steal pass, 2026-10-04: three
sources read, two techniques applied.

## Stolen

### 1. Stepped toon shading under an ink outline

- **From:** three.js cel-shading practice, the forum thread "How to create
  this smooth cartoon style with outlines in Three.js?"
  (discourse.threejs.org/t/60862). Its consensus is to pair
  `MeshToonMaterial` with outlines on the geometry, not with a post-process
  pass.
- **What:** every station material is `MeshToonMaterial` with a four-band
  gradient map (values 118, 176, 222, 255, nearest-filtered). Light falls on
  each object in flat planes, like a printed illustration. The world already
  had a one-pixel inverted-hull ink outline.
- **Why it's TTS's:** it is the step from "a render" to "a drawing". The world
  now shares a hand with the subpages' line diagrams and the whiteboard: one
  ink, one hairline, flat fills. That is the review's finding 6, solved at the
  material rather than by adding more effects. The bands are warm values, not
  black, so shadows stay on the light ground.
- **Where:** `components/tts/world/world.ts`, `ramp()` and `mat()`.

### 2. Anchors that land below the sticky nav

- **From:** Vercel's Web Interface Guidelines (vercel.com/design/guidelines):
  "Set `scroll-margin-top` for headers when linking to sections."
- **What:** `#run` and `#learn` carry `scroll-margin-top: 80px`, which is the
  nav's 64px plus air. The hero's "What you learn" and the panel's "Run it
  yourself" now land with their headings visible.
- **Why it's TTS's:** the nav became opaque in this pass, so without the
  margin both in-page links would bury their own headings.
- **Where:** `components/tts/home/home.css`.

## Considered, kept for later

- **Clay's paired stills** (clay.com): every narrative section pairs its copy
  with one illustrated still of a single machine, served as AVIF. We already
  render a still per station for reduced motion. Serving those as AVIF, and
  using them as the phone experience, is the next step if the 3D has to go on
  weak devices.
- **Clay's stepped tabs** ("GTM engineers build on Clay": TAM sourcing,
  inbound, scoring, each tab revealing a screenshot). This would fit "What we
  build" well once real project screenshots exist. There are none on record,
  so it waits.

## Not stolen, on purpose

- **Clay's static hero.** Clay's world is a still image. Ours runs live,
  because the claim is "something running", and the qualification station
  shows real counts.
- **Clay's saturated toy palette.** TroyLabs reads as a toy for the same
  reason (direction v3). The world stays on the page's ground, with cardinal
  as the one accent.
- **Post-process outlines** (`OutlineEffect`, edge detection). The same thread
  reports distortion at stretched aspect ratios, and our full-bleed canvas is
  2:1 on desktop and 1:2 on a phone. The inverted hull has no such failure.
- **Bloom, film grain passes and glitch.** These are the stock "3D website"
  look, and the craft notes call them out as imported style.
- **Manim.** No single moment on the home page is better as a rendered clip
  than as the live world or the self-drawing board, so there is no clip.
