# DESIGN-tts: one world, one ink, one accent

The system for every TTS route. Rebuilt 2026-10-04 (rebuild v2 and direction
v3) on what the Lemma replica measured in its design-system wave
(`lemma-replica/docs/waves/W2-design-system.md`) and the deny-list research in
`chewbacca/crafts/web-ux.md`. Implemented only in `components/tts/tts.css`,
`components/tts/home/home.css` and `components/tts/world/world.css`, all
scoped under `.tts`.

## Denied, checkable

| Denied                                    | Check                                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Black, anywhere                           | the darkest value is `--ink` #2a1b1e                                                                                           |
| A second accent                           | `--live` appears only on `.live`, `.stamp` and the world's gold parts                                                          |
| Headings above weight 400                 | `font-weight` in `h1` to `h3` rules is 400                                                                                     |
| A second family                           | one face, Instrument Sans; the terminal-free page needs no mono                                                                |
| Radius on controls, wells or photos       | `border-radius: 0` on `.btn`, `.switch`, wells; the only exception is none                                                     |
| Glass, blur, shadows for depth            | no `backdrop-filter`, no `box-shadow` except focus rings                                                                       |
| Pulsing status dots, bouncing, springs    | no infinite animation outside the world canvas                                                                                 |
| Giant ordinals, uppercase tracked kickers | none                                                                                                                           |
| A centred reading column                  | `.col` sits on the shared left edge                                                                                            |
| An unsourced number                       | every figure is computed from the dataset or sourced in `POSITIONING.md` and `data/people.ts`; the rest are `[NEED:]` comments |
| Client names or logos                     | none on record                                                                                                                 |
| Naming another USC organization           | the format is attacked, never a club                                                                                           |
| `href="#"`, a link to an unowned host     | `site-gate check`; T Combinator is reached through `/tc` only                                                                  |

## Type

Instrument Sans, chosen by measurement (100px canvas metrics, 2026-10-04):
cap height 0.72em, x-height 0.708 of the caps. Archivo, the previous face,
ran 0.767 and read heavier at the same size. Self-hosted by `next/font`.

| Step               | Size                                    | Line height | Tracking |
| ------------------ | --------------------------------------- | ----------- | -------- |
| Hero               | clamp(40, 5.6vw, 84)                    | 1.04        | -0.025em |
| Display (subpages) | clamp(40, 5.6vw, 80)                    | 1.08        | -0.02em  |
| Station caption    | clamp(30, 3.6vw, 52)                    | 1.1         | -0.02em  |
| H2                 | clamp(28, 3vw, 40)                      | 1.2         | -0.01em  |
| H3                 | 21                                      | 1.3         | -0.005em |
| Lead               | 18, in `--ink-2`, 8px under its heading | 1.56        | 0        |
| Body               | 16.5                                    | 1.6         | 0        |
| Label              | 15 or 14, `--ink-2`                     | 1.35        | 0        |

## Colour

| Token                    | Value            | Job                                                    |
| ------------------------ | ---------------- | ------------------------------------------------------ |
| `--paper`                | #f4f0e9          | the warm ground                                        |
| `--paper-2`, `--paper-3` | #ebe6dd, #e1dbd0 | secondary control at rest and on hover                 |
| `--well`                 | #faf8f4          | inside every figure frame                              |
| `--ink`                  | #2a1b1e          | text and primary controls; the darkest end of cardinal |
| `--ink-2`, `--ink-3`     | #6f6264, #a1969a | the muted ink, and the quietest                        |
| `--rule`                 | ink at 14%       | every hairline                                         |
| `--live`                 | #a3162b (USC cardinal)          | the accent: running, or computed in your browser       |

The world uses the same logic, light and airy: a pale stone ground under a soft
dawn sky, objects in bone, stone and graphite with a hairline ink outline, and
cardinal only on what is moving or live (data in the pipes, kept records,
agents' visors, the flag, the climbing ball, the build's wavefront).

## Space and layout

Two containers, the replica's: 1280 wide and 880 narrow, padding inside the
container, so every heading on every page starts at one left edge (the nav,
the world's copy column, every section head and every subpage column). Copy beside a
figure uses 384 + 64 + the rest. Section rhythm 144px on desktop, 88 on
mobile.

## Figures

The world is full bleed: it owns the viewport behind the pinned block, the nav
floats over it, and the copy sits in one column on a soft wash of the ground.
Every other figure sits in a padded well inside a 1px `--rule` frame: the
run's panels, the whiteboard, the roster's photographs. Strokes are
one ink (the whiteboard at 2.4 with cardinal under each station name, the
world's objects with a one-pixel ink outline).

## Controls

Square and quiet, measured states on 150ms of `cubic-bezier(0, 0, .2, 1)`:

| Control           | Rest            | Hover                        | Focus-visible            | Pressed    |
| ----------------- | --------------- | ---------------------------- | ------------------------ | ---------- |
| Primary           | ink, paper text | #45303a                      | 2px paper + 2px ink ring | scale 0.96 |
| Secondary, switch | `--paper-2`     | `--paper-3`                  | same ring                | scale 0.96 |
| Rail tick         | `--ink-3`       | `--paper-2` behind, ink tick | inset ink outline        | scale 0.96 |
| Nav link          | `--ink-2`       | `--ink`                      | ink outline              | none       |

## Motion

Two clocks, never confused: the 2200ms load clock and the timed build sweep
are timed; everything else in the world reads the one followed progress value.
Ambient motion lives inside the world canvas and the join band's mesh, pauses
offscreen and on a hidden tab, and is replaced by still renders under reduced
motion.
