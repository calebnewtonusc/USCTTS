# STORY-tts: the beat sheet

Rewritten 2026-10-09 for the home page that folds the /way story back in
(components/tts/landing/Landing.tsx). One semester at TTS, told by one set of
objects: LA's real street grid as points of light around the USC dot. Every
scroll-linked value reads one followed scroll (v4/choreo.ts, 12/s, Lemma's
0.2 a frame), and the only timed motion is the 2200ms load clock.

| Beat                        | Range                | Clock                                                         | What the objects do                                                                                                                                                                                                                         | Words                                                                                                                                                                             |
| --------------------------- | -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intro                       | load                 | timed 2200ms, starts when the field has drawn its first frame | Points fly onto their streets while the camera settles from high and steep down onto USC; each headline line slides up out of its mask (starts 0.30 and 0.38 of the clock); the readout strip comes in at 0.5; one pulse rings out from USC | USC's AI implementation lab.                                                                                                                                                      |
| Exit                        | 0 to 560px           | scroll                                                        | Line one leaves 420px, line two 300px, on one cubic ease-out; opacity reaches 0 at 520px; the camera streams down the 110 into USC                                                                                                          | This is you, a few weeks from now.                                                                                                                                                |
| Who we are                  | #v4-partners, pinned | scroll                                                        | The camera eases back over the basin into the sky world; the line and the two partner rows drift at three depths; the valuations count up while it holds                                                                                    | We do everything AI for LA businesses... / Clay $7.1B (Sept 2026), Perplexity $20B (Sept 2025), through Blue Modern Advisory                                                      |
| A business brings a problem | #v4-week 0 to 0.03   | scroll                                                        | The agent light drives from USC to a real dental office node in Koreatown                                                                                                                                                                   | the TTS way. Say your first client is a dental office in Koreatown...                                                                                                             |
| Build it                    | 0.03 to 0.95         | scroll                                                        | The camera dives through that point; the clay machine film scrubs stage by stage (tray, sorter, typewriter, mailbox, CRM stack); the x-ray line shows each stage's real artifact and manim clip                                             | one line per stage                                                                                                                                                                |
| Hand it over                | 0.95 to 0.99         | scroll                                                        | The film draws back in to a point of light on the cream map                                                                                                                                                                                 | Then you teach the office to run it without you.                                                                                                                                  |
| Where they go               | #v4-alumni           | scroll, one-shot reveals                                      | The camera rises off the block and drifts home to USC; the alumni wall, the mentors and the team come up over the city in layers                                                                                                            | Then you graduate. This is where the 15 people who started at TTS went. / These people actually want to help you. / When Matthew Kim graduated, he handed TTS to Caleb and Tyler. |
| Two doors                   | #v4-join             | scroll                                                        | The cardinal rains in from Koreatown across the city                                                                                                                                                                                        | I'm at USC. Teach me to build that. / I run a business. Book 30 minutes with Caleb.                                                                                               |

Nothing appears twice. The manim clips live only inside the x-ray, each face
once (the alumni wall carries alumni only), and the doors are the only calls
to action besides the nav. /way redirects to /#way, which glides to the
story (WayHash.tsx).

Reduced motion: every beat lands on its finished state; the film is its
pulled-back poster.

## Measured, Chromium on Metal, 1440x900

Intro frame times over the first 3.2s, and long tasks inside them:

| Page          | Load avg | p95          | max        | long tasks                 |
| ------------- | -------- | ------------ | ---------- | -------------------------- |
| live bba598b  | 120      | 16.8         | 1550       | 3, 1632ms total            |
| live bba598b  | 18       | 16.7 to 16.8 | 50 to 67   | none                       |
| this home     | 18       | 16.7 to 16.8 | 17 to 67   | one 81+54ms run, else none |
| lemma-replica | 18       | 16.8         | 133 to 166 | 1 to 2, 130 to 307ms       |

A trace of the live intro showed the cause the numbers hide: the load clock
started at mount, the grid data parsed about a second later and its first
frame stalled 113ms linking shaders (GetProgramiv), so the city arrived
half built. Now the shaders link through compileAsync, one frame is drawn,
and only then does the clock start; the new trace has no long task after
hydration.
