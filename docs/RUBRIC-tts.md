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

## Every section must give a real reader something (Caleb, 2026-10-04, late)

"So many things on this site provide value to NOONE looking at the site,
especially a business that doesn't know much abt ai but wants help." He
said this over the "388 open roles" beat.

There are two readers, and each section names which one it serves:
- a USC student deciding whether to join
- a business owner who doesn't know much about AI but wants help

Cut anything that serves neither. Internal pipeline stats, our GTM
curriculum diagrams and run datasets are for us, not for them.

Home becomes:
1. The hero load-in: who we are, in one line
2. Clay and Perplexity, through BMA
3. The walkthrough: plain before-and-after examples a non-technical owner
   recognizes, and a student would want to build, e.g. "your team answers
   the same emails all week, and we set up AI to draft them", "your leads
   live in a spreadsheet, and we set up a CRM that updates itself", "your
   staff don't know how to use AI, and we teach them". Examples only, never
   claimed as past client results unless they are in POSITIONING.md
4. People: leadership, mentors, alumni marks
5. Two doors: "Join TTS" for students, and "Tell us what's eating your
   team's time" for businesses

## Tell a story, not a textbook (Caleb, 2026-10-05)

"Title / subtitle / Title / subtitle. SOOO basic & ai slop, get creative
bruh, tell a story not a textbook."

- No beat may be a heading plus a supporting line. The pattern repeated
  down a page is the tell, however good the words are.
- Text is part of the story. It reads in sequence across the scenes like
  one short narrative with a character, and each line picks up where the
  last left off.
- Let the scene carry it. Some beats have no caption at all. Some text lives
  inside the world: the laptop typing, a shop sign, a note taped to a
  register, a reply drafting itself.
- Vary scale and placement on purpose, e.g. one huge line, then a whisper,
  then text the camera flies past. Never the same block in the same spot
  every screen.
