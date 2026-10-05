# The bar for usctts.com, from Caleb's own words on 2026-10-04

Every agent working on this site, and the verifier, judges against this
list. Each line is something he said or flagged in a screenshot that night.

## The bar
- "the TTS site should be cooler than the clay site and gavin's site", and
  as tasteful as the Lemma replica (~/code/work/lemma-replica)
- the site is for USC kids to see and think "HOLY SHIT I NEEDA JOIN THIS".
  It is not a GTM course
- TTS is USC's AI implementation lab: "We do everything AI. Automations,
  teaching, crm, blah blah blah, wtv a company needs!"
- order: a Lemma-style load-in that makes you say woah, then Clay and
  Perplexity right away ("official partners through Blue Modern
  Advisory", logos, $7.1B and $20B), then the walkthrough
- "brighten it up while keeping it profesional, like clay"
- "Make sure everything you're doing is for a purpose in the eyes of the
  types of viewers"

## Things he called out (never again)
- objects teleporting, passing through each other, or spawning in and out
- a "slop" animation concept: the loop ring, gadgets that mean nothing
- an HTML card laid over the 3D scene
- "TS so confusing": a scene a student can't read in one look
- "No one would look at this and think it is as cool or cohesive as the
  lemma and clay sites": many unrelated objects
- "Transitions all outta wack": a line crossing a button, a hard canvas
  edge, empty bands
- "What's the point of full screening a grid if ur not gonna use it"
- "This red line so wonky"
- "Wtf does this transition add?": the red dot growing into a band
- "This spawns in outta nowhere"
- a header with one line of text, repeated in a grid: "SO AI"
- short punchy fragments and slogans: "SO AI". Write it like Caleb talks
- way too text heavy
- scroll jank: no frame over 16ms in a headed trace
- the visual hierarchy is cooked
- anything orange
- the old meeting slides, the Build tab, an About page that repeats home

## Facts
- Use only claims in docs/POSITIONING.md, data/people.ts or the run
  dataset. Never name Palantir
- Apple stays off the page until Susan Nyirenda is verified
- No em dashes, no emojis

## Gates
- `site-gate check` and `site-gate story` exit 0 on every route
- `slop-check` under 10 on the rendered text
- tsc and eslint are clean
- screenshots at 1440, 2360 and 390, looked at by a model that didn't
  build it
