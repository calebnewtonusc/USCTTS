# usctts.com home, v4: the week gets lighter

Written 2026-10-05 from Caleb's answers. This replaces the cube hero and the
desk-and-street 3D story, which he called "from 1995". Read
docs/RUBRIC-tts.md too: every rule there still stands.

## His answers
- Main character: the AI work itself
- First feeling: the future, like Lemma
- What only TTS does: GTM engineering and AI implementation. In his words:
  "We are the only university club doing Clay & Perplexity implementations
  on earth. Most people don't even know what GTME is." That's his claim and
  nobody has verified it. On the page it reads "As far as we know, we're the
  only university club building on Clay and Perplexity."
- Impact over mechanics: show a week getting lighter
- Place: "Lives on the internet, but if the internet was centered around
  LA"
- Feel: Lemma's future, Gavin's young and alive, Clay's playground, and
  more creative than all three
- What a student takes away: "This club teaches AI in a way no other club
  will and they're cool asf"

## Why it looked like 1995, and the rule that follows
Hand-modelled meshes (boxes, cylinders, low-poly shops) always read as old.
So nothing on this page is a modelled object. The visual language is light
and data:
- a real LA street grid drawn as points and lines in a shader
- crisp interface panels
- type with real motion
That is the language of Lemma's lattice, and it's what reads as the future.

## The world: the internet, centred on LA
One shader field, the whole page long:
- LA's real street grid, from OpenStreetMap (ODbL, credited in the footer),
  drawn as fine points of light on near-white
- centred on USC at 34.0224 N, 118.2851 W
- the freeways (10, 110, 101, 5) drawn as brighter data lines carrying
  moving light
Mono labels give coordinates and timestamps, like a system readout, and
there are no landmarks or logos. That one field is the stage for every beat
below.

## The page

1. Opening, about 1.5 screens, the gist.
   - On load the grid of light assembles out of scattered points onto LA's
     streets (Lemma's load clock), then pulses once from USC outward, like a
     signal sent.
   - H1 "USC's AI implementation lab." with one plain line under it.
   - First scroll: light streams down the freeways into USC, and back out to
     points across the city. Each point is a business. That is the whole
     club in one move: students at USC, work going out to LA.

2. Clay and Perplexity.
   - The two partner marks rise out of the grid.
   - $7.1B and $20B count up, with their "as of" dates.
   - The line: "We're official Clay and Perplexity partners through Blue
     Modern Advisory. As far as we know, we're the only university club
     building on them." Keep the BMA clause.

3. The deep dive: one business's week, getting lighter.
   - A clean week interface (Mon to Fri, the hours as blocks) floats above
     the grid for a fictional small business, labelled as an example, e.g.
     "a dental office in Koreatown". It's packed solid.
   - The AI work is the character: a point of light that leaves USC on the
     grid, arrives, and moves through the week. Each thing it builds dissolves
     a set of blocks into light that drifts down into the grid. The week gets
     visibly lighter as you scroll.
   - Beats, written as one running story and not as title-plus-subtitle:
     - finding customers (GTM engineering): the grid lights up the
       businesses nearby worth reaching, and a list builds itself. The map
       does the work here.
     - answering the same emails: replies draft themselves in the panel
     - the spreadsheet nobody updates: rows settle into a CRM
     - the staff learn it too: a short lesson, and the last blocks clear
   - It ends on Friday afternoon, empty and light.

4. Join. Two doors:
   - a student door: this is the club where you learn to build that
   - a business door: Book 30 minutes with Caleb, at
     calendly.com/calebnew-usc/30min

## Craft rules
- Type: the existing grotesk, plus mono for the readouts.
- Palette: near-white paper, ink, cardinal for "worth reaching" and the
  agent's light, a little USC gold, and sky blue for data. No orange.
- Motion: everything is driven by one scroll value. Nothing pops, teleports
  or clips, and every transition is a morph of the same light.
- Words: few per screen. Some live inside the interface, some fly past, and
  at least one beat has none.
- Performance: one shader pass for the grid, instanced points, no shadows,
  and p99 under 17ms in a headed test.
