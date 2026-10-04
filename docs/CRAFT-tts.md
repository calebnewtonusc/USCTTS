# Craft rules for the TTS site

Researched 2026-10-03. The genre is studios, labs and student orgs that recruit
on their work rather than on their vibe. The reader is a USC student with four
club tabs open, deciding which one gets their semester. Rules, each with the
source it came from. Read `~/code/chewbacca/crafts/web-ux.md` and
`~/code/chewbacca/crafts/website.md` alongside this; they are not repeated here.

## Sources read

- **Hack Club**, hackclub.com. A student org that recruits teenagers almost
  entirely on things members built.
- **Ink & Switch**, inkandswitch.com. A research lab that recruits
  collaborators on its essays and tools.
- **Dynamicland**, dynamicland.org. A lab whose site is a dated archive of
  the thing running.
- **Recurse Center**, recurse.com. Recruits programmers by saying exactly who
  it is for and what it is not (`/not-a-bootcamp`).
- **The teardown:** Bryan Cantrill, "Compensation as a reflection of values"
  (bcantrill.dtrace.org, 2021), plus the Oxide careers page it explains. It is
  written by the person who built the recruiting page, explaining each
  decision on it, which is why it is the teardown and not a fifth example.
- Rejected as a source: a Studio Mesa listicle on agency portfolios. Its
  numbers ("75% of clients judge credibility on design") are uncited, and the
  author sells templates. One rule survived because it agrees with the others.

## The rules

1. **Lead with the work, then the aspiration.** Hack Club's first content
   block is projects, captioned "Imagine a world where you made this", and the
   community pitch comes after. A student believes "you will build things"
   only after seeing a thing. (Hack Club)
2. **Every artifact gets a way to check it.** Hack Club puts "Try it out" and
   "View source code" under every project. On our page the artifact runs in the
   visitor's browser and says where its data came from. (Hack Club)
3. **Date everything.** Dynamicland stamps every item with a year and
   publishes yearly progress reports, so a reader can see the work moving.
   Undated proof reads as old proof. (Dynamicland; also `DESIGN.md` rule 15)
4. **Separate what runs from what is an experiment.** Ink & Switch gives
   production software its own section, apart from essays and lab notebooks.
   Status is a label, not an impression. (Ink & Switch)
5. **Publish what other orgs hide.** Oxide publishes the salary, the stages,
   the timeline (3 to 6 weeks for review) and blunt FAQ answers about
   rejection feedback. For a club that means: how joining works, step by step,
   and what we turn down. (Oxide, Cantrill)
6. **Candidates compete on materials.** Oxide removed negotiation so that the
   only thing a candidate competes on is what they wrote. Our apply form asks
   for something you made or want to make, not a list of interests. (Cantrill)
7. **Say who it is not for, in a testable sentence.** Recurse: "We don't care
   how long you've been programming, so long as you've done it enough to know
   you like it, can write short programs from scratch..." A sentence a reader
   can check themselves against beats "everyone is welcome". (Recurse Center)
8. **No stat strip.** Ink & Switch publishes no downloads, citations or user
   counts, and loses nothing by it. A stat nobody can check reads as filler,
   and ours were unsourced anyway. (Ink & Switch; `POSITIONING.md`)
9. **One deep piece beats a wall of shallow ones.** Six to twelve deep case
   studies outperform dozens of thin ones. We have one artifact on record, so
   the page shows one, completely. (Studio Mesa, kept because rules 1 and 4
   say the same thing)
10. **The reader knows what this is within one screen.** Hero states what the
    club does and for whom, then shows it. (Studio Mesa; Recurse's opener does
    the same in one line)
11. **Plain beats polished when the content is real.** Dynamicland's site is
    austere and text-forward, and the handwritten letter is a feature.
    Polish is a substitute for proof; when you have the proof, spend less on
    polish and more on legibility. (Dynamicland)

## What this changes on the page

- The hero shows the machine running before it asks for anything.
- The proof is one pipeline, run live on its real dataset, dated, with its
  source and its one embarrassing near-miss shown on purpose.
- There is a published "how joining works" and a published "what we turn
  down", and no numbers anywhere that the page did not compute itself or
  that `POSITIONING.md` does not source.
