# DESIGN-tts: the lab report

The system for every TTS route (`/`, `/about`, `/members`, `/apply`,
`/work-with-us`, `/work-with-us/form`, `/partner`, `/build`, `/meetings`).
Written as a deny list first, because the refusals are what make it
recognizable. `DESIGN.md` at the root holds the USC landscape research; where
this file disagrees, this file wins for TTS. Every rule lives under `.tts` in
`components/tts/tts.css`, so nothing here can reach `/tc`. Sizes are in px
because `globals.css` sets the root font size that `/tc` also inherits.

## Denied, checkable

| Denied                                                                                         | Check                                                                                   |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Monospace, anywhere                                                                            | `grep -rn "monospace\|font-mono" components/tts` finds nothing                          |
| Highlighter fills behind text                                                                  | that is T Combinator's device; no `background` on inline text in `tts.css`              |
| The accent on anything the browser did not compute                                             | `var(--red)` appears only in `.live` and `.stamp` rules                                 |
| Italic in headings, uppercase tracked kickers                                                  | no `font-style: italic` on h1 to h3, no `text-transform: uppercase` in `tts.css`        |
| Radius, shadows, blur, gradients, glass                                                        | no `border-radius` above 0, no `box-shadow`, `backdrop-filter`, `gradient` in `tts.css` |
| Cards and card grids                                                                           | content sits in the column or in a ruled exhibit, never in a boxed tile                 |
| Margin-label rows                                                                              | T Combinator's grammar; TTS sections are centred prose plus exhibits                    |
| Fade-and-rise scroll reveals, springs, bounce                                                  | no `whileInView`; easing is `linear`, `steps()` or `--ease`                             |
| `transition: all`                                                                              | grep                                                                                    |
| `href="#"`, or a link to a page that does not exist                                            | `site-gate check`                                                                       |
| A number the page did not compute, or that `POSITIONING.md` and `data/people.ts` do not source | read the copy; anything else is a `[NEED:]` code comment                                |
| Client names or logos                                                                          | none are on record                                                                      |
| Naming another USC organization                                                                | attack the format only                                                                  |

## Type

Two families, and never a third.

- **Source Serif 4**, variable with optical size, for everything a person
  reads. Display and headings at weight 600 (never above), optical size 60,
  roman only. Body at weight 400, optical size 18.
- **Schibsted Grotesk** is the instrument face: nav, buttons, labels,
  captions, table headers and every figure, with `tabular-nums`.

| Step    | Size                  | Line height | Tracking | Face                       |
| ------- | --------------------- | ----------- | -------- | -------------------------- |
| Display | clamp(46, 7.4vw, 112) | 0.98        | -0.022em | Serif 600, opsz 60         |
| H2      | clamp(32, 4.4vw, 60)  | 1.04        | -0.016em | Serif 600, opsz 60         |
| H3      | 24                    | 1.2         | -0.006em | Serif 600, opsz 32         |
| Lead    | 21                    | 1.5         | 0        | Serif 400                  |
| Body    | 18 (17 under 600)     | 1.62        | 0        | Serif 400                  |
| Figure  | 15                    | 1.35        | 0        | Grotesk 500, tabular       |
| Label   | 13.5                  | 1.35        | 0.005em  | Grotesk 500, sentence case |

Adjacent steps differ by at least 1.15x (figure to label) and mostly 1.25x or
more. Prose measure is 62ch, centred.

## Space

4, 8, 12, 16, 24, 32, 48, 64, 96, 160. Tight inside a group, 96 to 160
between sections on desktop, 64 to 96 on mobile. Gutter 16 at 390, 32 at 768,
48 from 1024.

## Layout grammar: essay plus exhibits

- **The column.** Headings and prose sit in one centred 62ch column.
- **The exhibit.** A wide block, up to 1200px, that breaks out of the column.
  It opens with a 2px ink rule and closes with a caption line in the grotesk
  stating what it is and where its data came from. Exhibits hold things that
  run or that are data: the pipeline, the timeline, the bench table, a form.
- No section changes background. Variety comes from what the exhibit is.

## Colour

OKLCH, warm, with five neutrals and one accent.

| Token       | Value                      | Job                                                                                                                                        |
| ----------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `--paper`   | oklch(0.971 0.009 85)      | page                                                                                                                                       |
| `--paper-2` | oklch(0.94 0.013 85)       | exhibit working surface, table stripes, inputs                                                                                             |
| `--ink`     | oklch(0.2 0.013 55)        | text, strong rules, primary button                                                                                                         |
| `--ink-2`   | oklch(0.42 0.013 55)       | secondary text, about 8:1 on paper                                                                                                         |
| `--rule`    | oklch(0.2 0.013 55 / 0.17) | hairlines                                                                                                                                  |
| `--red`     | oklch(0.53 0.19 33)        | **the accent. One meaning: the code on this page computed this, in your browser, just now.** Numerals and stamps only. About 5:1 on paper. |

There is no error red. Errors are ink, bold, beside a 2px ink rule, with a
sentence that says what to do next.

## Edges

Paper, then paper-2 inside exhibits and inputs. 1px hairlines; 2px ink rules
open each exhibit and mark the active stage. Radius 0. Buttons are rectangles:
primary is ink fill with paper text, secondary is a 1px ink outline.

## Response

- Hover, gated to fine pointers: text links draw a 2px underline from the
  left over 140ms; buttons swap ink and paper over 120ms; table rows with a
  destination take paper-2.
- Focus-visible: 2px ink outline, 3px offset, on every control. Never red.
- Pressed: `scale(0.97)` for 100ms.

## Motion budget

Three clocks, each motion on exactly one.

- **Load clock (timed):** hero lines print in at 0, 80 and 160ms, 240ms each,
  `steps(6)` on `clip-path`. The intake stream starts at 600ms. Settled by
  1.2s.
- **Run clock (timed, triggered):** starts when the exhibit is half in view or
  on Run. Five stages, at least 340ms each so a reader can follow, counters
  step at 24 updates a second, done in about 2s. Real compute time per stage is
  measured with `performance.now()` and printed.
- **Scroll clock (progress):** one layer, the format timeline. One progress
  value per frame from the exhibit's position, both lines drawn from it on the
  same curve so they finish together.
- **Ambient:** one loop, the intake stream in the hero, which steps through the
  real dataset one role every 1.1s and stamps each one with the verify rule's
  result. It is there because the headline says something is running and this
  is that thing. It pauses offscreen and on a hidden tab, and under reduced
  motion it shows a still, finished frame.
- Interaction transitions 100 to 160ms. Transform, opacity, colour and
  clip-path only.
- Reduced motion lands every sequence on its finished state.
