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

## What makes Gavin's site incredible, and what we take (studied 2026-10-05)

Read from ~/code/personal/gavin-munroe: reference/STEAL.md, SCOPE.md,
DESIGN.md, XRAY.md, CLAUDE.md and 111 commits.

1. One idea organises everything, navigation included. "A flight between
   the places it happened, drawn in the pixels of a Texas sunset." The
   boarding pass, the split-flap board, the route rail 01 to 05 and "Flight
   GM 20" are all the flight. Nothing on the page is decoration with no job.
   Ours: the internet centred on LA, and work going out from USC on a grid
   of light. The nav rail, the readouts and the transitions all speak it,
   e.g. the rail reads as stops on a route.
2. One rendering signature that makes everything his, 3D included. Every
   scene, even the three.js car and the dunk, prints through the same Bayer
   dither on a 2px grid with one colour ramp. That is why his 3D never looks
   cheap: stylisation hides what realism would expose. Ours: everything
   prints as points of light on paper, the week panel's blocks included.
   They dissolve into the same points the grid is made of. One signature,
   no exceptions.
3. Simulation, not keyframes. The skywriter is a plane flown by a simulated
   pilot (bank, stall, gusts), so the smoke wavers like a real hand-flown
   line. The dunk is physics with joint solvers, and a probe fails any
   overlap over 3cm. Small, honest imperfection reads as alive. Ours: the
   agent light routes along the real street graph by shortest path, turns
   at real corners and slows into them. The replies type with a human
   cadence. Nothing moves on a straight lerp.
4. Fidelity to the specific. His actual dunk clip rebuilt shot for shot,
   the DJ he looks like, the verified crowd of 350, the 76 in chemistry.
   Ours: real LA streets and real business types on the map, and the
   example week holds the emails a Koreatown dental office really gets.
   They're labelled examples, but they're specific, never "Lorem".
5. Each chapter gets its own voice inside the one system. A camera mode per
   place (point of view on the court, over the shoulder at the decks, a
   chase cam on the drive) and its own flat colour. Ours:
   - the opening: high above the basin
   - the stream: low along a freeway at speed
   - finding customers: straight down, the map as a map
   - the week: hovering over one Koreatown block
6. Toys that reward curiosity, with depth behind a gesture. The split-flap
   motto spins when you point at it. The x-ray line: drag across a scene and
   the right side shows the machinery (skeletons, camera rails, the pen path
   against the flown track). Ours, and the best fit of anything here for an
   AI implementation lab: an x-ray line on the week. Drag it and the right
   side shows how each thing is built, the way a member would build it:
   - the lead table with its enrichment columns
   - the prompt behind the drafted reply
   - the workflow graph behind the CRM sync
   A student sees exactly what they'd learn, and an owner sees it's real.
   Keep it quiet, a small "x-ray" word, so someone who never touches it
   loses nothing.
7. One spectacle, not ten. His globe is the trick and everything else stays
   quiet so it lands. Ours: the grid is the spectacle. Panels and type stay
   calm and crisp.
8. The scroll rules practitioners use, all of which he keeps:
   - one step, one visible change
   - everything reversible
   - never scroll-jacked
   - no hard cuts, enforced by a check
   - 60fps or it's capped at "nice"
