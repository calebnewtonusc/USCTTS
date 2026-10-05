# Rebuild prompt v2: spectacle, with the honesty kept

v1 (`REBUILD-PROMPT.md`) shipped two honest, well-sourced essays. Caleb, on
2026-10-04: "infinitely more ugly and boring than the lemma site and way too
text heavy", then "The lemma site had the coolest animations, parallax, and
storytelling on earth. We need both of these sites to be even cooler."

He's right, and the cause is in v1: it demanded restraint, refusals, one
signature and a removal pass, and never demanded spectacle. Measured with
`site-gate story`:

    uselemma.ai     figure share 0.52   motion on 19 of 19 screens
    TTS v1          figure share 0.04   motion on  8 of  8 screens (one ticker)
    T Combinator v1 figure share 0.00   motion on  0 of  6 screens

Every hard line from v1 still holds (sourced claims only, no logo wall, the
Y Combinator disclaimer, attack the format and never a named club, Caleb's
words only where they exist, no em dashes, no emojis). **Restraint now applies to claims and colour only, and the craft
is held to the numbers below.**

## The bar, and what "even cooler" means

Study uselemma.ai until you can describe it frame by frame. Launch Chromium
with `--use-angle=metal --enable-gpu --ignore-gpu-blocklist`, scroll it slowly
and read `~/code/chewbacca/crafts/website.md` and
`~/code/chewbacca/skills/clone-site/SKILL.md`. Its shipped bundle is already
prettified at `/private/tmp/claude-501/-Users-joelnewton/bdf89203-2fef-4e88-b8bc-ad9621f58ff7/scratchpad/ref/`
(`p-768-*.js` is the hero and the scroll story, `p-598-*.js` its constants).
Read how it works. Then do NOT copy it: no instrument plates with mono
labels, no brick wall, no voxel mark, no purple. Beat it with your own
objects.

What it does, which you must match in kind and exceed:

1. **An intro that is an event.** Six generative figures in frames around the
   headline. A 2200ms load clock wipes each one open in turn and lifts the copy
   in lines. On the first scroll each figure leaves at its own speed (420 to
   200px over the same curve), so the hero comes apart in depth. Caleb:
   "This is the coolest intro ever bruh."
2. **A scroll story told by ONE set of objects.** A 1200vh pinned scene: a wall
   of runs, nine light up as failures with their quotes, the wall goes quiet,
   the bricks break into diamonds, the diamonds land on a lattice, a timed
   sweep crosses it, and the lattice becomes the product's mark. Every beat is
   a state change of the same objects, so the page argues without paragraphs.
3. **Ambience at rest**: something alive on most screens.
4. **Pinned product panels** that crossfade as copy scrolls past.
5. **Every control** responds, and every link goes somewhere.

## Your site's concept (a starting point; a better one is welcome)

**TTS** (`~/code/work/TTS-Dev`, routes at `/`). The claim is "every engagement
ends with something running", against a format whose deliverable is a deck.

- **The story's objects:** slides. A deck of slide cards fans out, gets
  presented, and gathers dust. Then the same cards are torn into components
  that click together into a machine whose stages light up and keep running.
  The Praxis-style run (keep the existing `components/tts/run`) is the machine
  running: data flowing through five stages, numbers counting.
- **The hero:** frames around the headline, each holding a small working
  thing a student team builds (a pipeline graph pulsing, a scheduler grid
  filling, an enrichment table resolving, a terminal typing). Each wipes in on
  a load clock and leaves in depth on scroll.

**T Combinator** (`~/code/work/tcombinator-site`, its own repo and deployment,
routes at `/` and `/for/<slug>`; the `/tc` prefix is gone). The page is about
the founder's own company.

- **The figure is the YC directory itself:** all 6,245 companies as a living
  field of points (canvas or WebGL), clustered by batch or industry.
- **The scroll story narrows the field:** all of YC, then their batch, then
  their industry, then teams their size, until one point is left. It's theirs,
  and it blooms into the brief.
- **The three cohort slots** are physical objects that fill as you scroll.
- **On `/`:** the lookup flies the camera to the company you type.
- **The highlighter meaning stays:** it marks what came from their listing.

## Numbers that must pass, measured by code

    site-gate check <every route>              exit 0
    site-gate story <every main route>         exit 0  (figure share >= 0.35,
                                                        motion on >= 60% of screens)
    site-gate idle <home>                      the ambient layer moving
    npm run lint && npx tsc --noEmit && npx next build    clean

Aim for under about 90 words per screen on the home page. The point is that
the figures carry the argument and the copy captions it.

Check every transition at three points between its ends. Reduced motion must
show the finished state of each beat. Pause anything offscreen. Hold 60fps on
an M-series Mac; measure it, do not assume it.

## Method

1. Study the bar for an hour: frames, then the bundle.
2. Write `docs/STORY-<site>.md`: the beat sheet, one line per beat, with the
   scroll range, what the objects do and the caption.
3. Build the hero and the story first, before anything else. Screenshot them
   and look at them. Iterate until a stranger would screen-record them.
4. Then everything else, then the gates.

## Ownership

- **TTS builder:** `~/code/work/TTS-Dev`, dev server on port 3210. Remove the
  `/tc` routes and `components/tc` there. Make the site toggle a plain link
  to T Combinator, pointing at `https://tcombinator.io` with a `// [NEED:
domain]` comment.
- **T Combinator builder:** `~/code/work/tcombinator-site`, dev server on port 3220. Finish re-rooting: merge `app/tc-layout.tsx` into `app/layout.tsx`,
  change every `/tc/...` link to `/...`, and update the metadata.

Commit locally in small steps by path. Do not push or deploy; the lead does
that after an independent review.

## Your report

- the beat sheet
- screenshots of the intro at 0, 400 and 1200ms and at 3 scroll points
- story screenshots at each beat
- all gate output
- a list of what is still `[NEED:]`
