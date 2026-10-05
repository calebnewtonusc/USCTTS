# TTS direction v3: GTM and AI, epic

**The formula, Caleb 2026-10-04:** "TTS site should be lemma X clay X bma X
wtv else is tuff X manim or wtv". That means:
- Lemma's restraint and scroll storytelling
- Clay's tactile world of objects
- BMA's sharp operator voice
- anything else that's tough, found online and recorded in
  `docs/STEAL-tts.md`
- manim where a clip is the best way to show something

Caleb, 2026-10-04: "I want TTS site to live laugh love GTM&AI, peep the vibes
of these images" (`docs/ref/clay-hero.png`, `gtm-course-infographic.png`,
`bma-hero.png`). "Take BMA copy and make it way cooler and not just GTME but
all things AI." On TroyLabs (`docs/ref/troylabs-home.txt`): "Copy is solid but
their site is too toy-like, doesn't feel epic."

This overrides the slide-deck concept in REBUILD-PROMPT-v2.md. Everything else
in v2 still holds: the hard lines on claims, the replica's engine as the
chassis, and the `site-gate check`, `story` and `idle` numbers.

## Identity

TTS is USC's GTM and AI club. Members learn to build the systems that replace
headcount: data, enrichment, qualification, prompting, agents and automation.
They then build those systems for real companies, and for anything else AI can
do (internal tools, agents inside products, research workflows). The work is
GTM engineering and AI engineering, taught and shipped.

## The look: an epic world, not a toy

Take Clay's idea, a physical, tactile world made of the objects of the work,
and push it to cinematic scale.

- **The world:** a 3D diorama of the GTM and AI machine. Raw accounts pour
  into a funnel, enrichment pipes twist through the landscape, a magnifier
  qualifies, agents work at stations, messages leave through a mailbox, and a
  pipeline chart climbs. Build it in WebGL (react-three-fiber or three.js)
  with soft matte materials, grain, fog, real lighting and depth of field.
- **The camera:** scroll flies the camera through the world, station by
  station. That's the scroll story: ONE world, one continuous camera move,
  and each station a beat. Pin the copy captions beside it, with figures on
  every screen.
- **Epic, not toy:**

  - huge display type
  - a slow, heavy camera with eased motion
  - dramatic light (dawn or golden hour on cardinal and gold are USC's own
    colours, used with taste)
  - scale cues, such as tiny people beside huge machines
  - no bouncy cartoon easing and no kid pastels
  - sound design is not needed

  TroyLabs reads as a toy because it is flat, cute and evenly lit. Do the
  opposite of each.

- **The intro is an event,** with the replica's load clock and a depth exit.
  On load the world assembles: pieces drop into place on the clock, the
  headline lifts in lines, and on first scroll the camera pulls back through
  the layers.
- **Performance:** hold 60fps on an M-series Mac, measured. Lazy-load the 3D
  and show a still render while it loads. Reduced motion gets the still
  render of each station.

## The learning path, as a whiteboard

`gtm-course-infographic.png` is the curriculum's shape. Use it for "what you
learn at TTS" as five stations, in a hand-drawn, marker-on-whiteboard style
that animates as it draws itself in, which contrasts with the cinematic
world. Write the station contents in your own words:

foundation, qualification, prompting, systems, and compounding (the
infographic's fifth column, renamed)

Do not copy the infographic's text, and do not use its numbers as claims
(10x, $1.2M and so on are someone else's illustration).

## Copy: BMA's register, made cooler and broader

`docs/ref/bma-home.txt` is the voice to start from: confident, operator-grade,
short declaratives ("GTM systems built on trusted data"). Rewrite it for a
club, sharper and broader than GTM:

- data sets
- GTM engineering
- custom agents
- AI inside products
- research workflows
- teaching all of it

**Hard line:** BMA's facts are BMA's, not TTS's. Do not use any of these:

- BMA's case studies, numbers or testimonials
- the "Clay and Perplexity enterprise partner" status
- the partner logo wall

None of those are TTS facts. TTS's sourced facts remain only those in
`docs/POSITIONING.md` and `data/people.ts`.

From TroyLabs, take the structure that works: clear initiatives, divisions
with one-line jobs, and a big roster. Write ours from POSITIONING.md, and
never name TroyLabs or any club.

## Keep

- the in-browser run (`components/tts/run`): it becomes one station in the
  world, the qualification machine running on real data
- the people and the forms
- the honest notes on what TTS refuses

## The point of the site (Caleb, 2026-10-04)

"Remember tts site isn't teaching gtm, it's a site for USC kids to see and
think HOLY SHIT I NEEDA JOIN THIS." And: "WE gotta mog Clay & Perplexity
official partners through Blue Modern Advisory, show their valuation or smth
in a way that isn't arrogant but still makes ppl go DAMNNNNN."

**The reader** is a USC student deciding which club gets their semester.
Every screen should make them want in. Curriculum detail (the whiteboard's
bullets, pipeline mechanics) is secondary: a glimpse, never a lesson.

**What makes them want in:**
- the tools: Clay and Perplexity, through Blue Modern Advisory
- the companies: three YC companies a semester through T Combinator
- the people: alumni at Apple, Bloomberg, Reddit and Capital One, and
  advisors from McKinsey and Google
- the work: you build real AI agents and GTM systems, not decks

**The Clay and Perplexity moment.** This is now approved by Caleb, and it
reverses round one's removal. The sourced wording: Blue Modern Advisory is
an enterprise partner of both Clay and Perplexity (bluemodernadvisory.com,
"The enterprise stack"), and TTS builds on them through BMA. Valuations:
- Clay, $7.1B (Series D, September 2026)
- Perplexity, $20B (September 2025)

Show each with an "as of" note in small type. Make it a moment that lands
quietly: two names, two numbers counting up, and one plain sentence such as
"We build on Clay and Perplexity, through Blue Modern Advisory, an official
partner of both." No "we're the best", no logos implying TTS itself is the
partner, no summing the valuations into one big number.
