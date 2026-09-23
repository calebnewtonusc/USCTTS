# Why the 2026-09-22 site is not close to uselemma.ai

Caleb, same day it shipped: *"where tf are the animations and cool ux
components and scroll effects... This is such a boring site with no page flow
or unique aspects."*

He is right. This is the list, measured rather than argued. Numbers come from
`ux-crawl` runs stored at `ux-engine/lenses/uselemma` and `ux-engine/lenses/usctts`.

## The measurements

| | uselemma.ai | usctts.com |
|---|---|---|
| Animations resolved on load | **214** | **3** |
| DOM elements | 900 | 143 |
| Page height at 1440 wide | 17,852px | 4,594px |
| Canvas elements | 4 | 0 |
| Inline SVG | 54 | 0 |
| Smooth scroll | Lenis | none |
| Sticky or pinned sections | 2 | 0 |
| Animation count change on hover | tracked per element | **0, identical at every state** |

That last row is the whole problem stated as a number. The animation count
never moves between load, six hover targets, and three focus targets. Nothing
on the page responds to a person being there.

## The self-inflicted part

`ux-lint`, from this machine's own `ux-engine`, returns **"clean, 7 files, no
generated-UI tells"** on the site as shipped. The linter was built on
2026-09-20 to catch the generated look and it passes this page.

So the page was built to the linter instead of to the bar. Not-looking-AI is a
floor, and a floor was mistaken for a finish. The gap belongs in ux-engine
too: it scores the absence of tells and has nothing that scores ambition,
motion budget, or whether a page has a signature at all.

`ux-crawl` existed for two days and was not run on the target or on the build
before shipping. That is `feedback_built_but_never_fires` happening again.

---

## 1. There is no signature motif

Lemma's hero is six framed plates of generative wireframe art, each catalog
numbered in mono: `LEM. 1.1`, `LEM. 1.2`, `LEM. 2.1`. Asymmetric, scattered
around centered type, animated on canvas. A person could see one plate on a
slide with no logo and name the company.

TTS has type on paper. Nothing on the page is ownable, and nothing survives
being cropped. If you screenshotted any 400px square of usctts.com, it could
belong to any site with a serif and a cream background.

## 2. The hero does nothing

The TTS hero is a line of mono, a headline, a paragraph, two buttons. It is
the default arrangement of those four elements. There is no visual, no motion,
no product, no proof, and no reason to scroll past it other than obedience.

Lemma's hero carries the YC badge, two CTAs, and six animated artifacts, and it
resolves 214 animations before you touch anything.

## 3. Zero scroll choreography

There is no scroll-triggered anything. No reveal, no pin, no parallax, no
progress, no counter, no sticky column, no horizontal section, no section that
changes as you move through it. The page is a document that happens to be long.

Lemma pins sections and drives content off scroll position, which is why a
full-page screenshot of it is mostly blank: the content is bound to scroll, not
to layout.

## 4. Proof is rendered as a list instead of as a picture

The single best thing on Lemma's page is the failure grid: rows of ghosted
trace IDs (`TRC-02F`, `TRC-1D6`, `TRC-524`) with a handful lit red carrying
real failure text, "Leaked another user's email", "We offer 24/7 customer
support", "Looked up the same order 6 times". It draws the product's value
proposition using the shape of the product's own data. You understand what
Lemma is before reading a word of body copy.

TTS renders its equivalent, the consulting-club attack, as two columns of
bullet points. The strongest argument on the site is set as a `<ul>`.

## 5. The one genuinely novel thing is buried on another page

`/tc/for/<company>` reading a founder's batch, headcount and hiring status is
the only thing on either site nobody else at USC can do. It is on a page nobody
reaches by browsing, and the TTS homepage does not demonstrate it, mention it,
or let anyone try it. There is no input box on the homepage where a visitor
types a company and watches it resolve.

## 6. No product is ever shown

Every reference site leads sections with real product UI. TTS claims to be an
AI implementation lab and shows no tool, no table, no Clay screenshot, no
terminal, no diagram, no artifact. It describes work it never displays.

## 7. Partners are text when they should be the flex

Clay at $7.1B and Perplexity at $20B were set as a line of small mono inside a
bordered box. No marks, no motion, no scale. Caleb asked to "flex that like
crazy" and it reads like a footnote.

Logos were not even on disk until asked for twice.

## 8. No navigation

There is no nav bar and no footer on the TTS homepage. A visitor cannot get to
About, Team, Apply, or Work With Us except by knowing the URLs. Lemma has Docs,
Blog, Weekly, Changelog, Careers, Login and Book a Demo in a persistent header.

## 9. No announcement bar, no urgency, no live state

Lemma runs a purple bar reading "We're hiring!". TTS has no recruiting
deadline, no cohort countdown, no application status, no "3 spots left", no
next meeting date. The research already found that nobody at USC publishes a
recruiting calendar with real dates, which made it the cheapest available win,
and it was not built.

## 10. Typography is correct and timid

Instrument Serif at weight 400 follows every extracted rule and takes no risk.
There is no scale contrast beyond one step, no oversized numeral, no type that
breaks a grid, no mixed-case play, no word set at 200px, nothing that reads as
a decision rather than a default. Lemma runs a custom face (`brittiSans`);
matching that is not required, but having a voice is.

## 11. Hover states are near-invisible

Two transitions exist: a 1px button lift and a partner card going 0.55 to 1.0
opacity. Nothing else on 143 elements responds to a cursor. No link underline
animation, no card lift, no image reveal, no cursor treatment, no magnetic
button, no row highlight.

## 12. No transitions between pages

Navigating from TTS to `/tc` is a hard document swap. Two sites that share a
team and a data layer should feel like one system moving, not two tabs.

## 13. Sections are stacked, not composed

Every section is the same shape: mono eyebrow, serif h2, prose, then a grid.
Four times in a row. The house rules in this repo explicitly ban exactly this
("Does every section look identical to the last?") and it shipped anyway,
because the ban was read as "vary the grid" rather than "give each section its
own identity".

## 14. The dark T Combinator block is the only compositional idea

One inverted panel near the bottom is the page's sole moment of contrast, and
it arrives after the reader has already decided.

## 15. Nothing is interactive

No toggle, no filter, no tab, no accordion that matters, no calculator, no
search, no live counter, no playable element. Lemma's peer set on the USC
survey includes LavaLab's playable tile grid and ProductSC's animated node
graph with a live iteration counter, both student-built.

## 16. The page has no pacing

4,594px of uniform rhythm at a constant 96px section gap. No compression, no
expansion, no held beat, no full-bleed moment, no moment of silence before a
claim. Lemma uses 17,852px and varies density throughout.

## 17. Mobile is correct and unconsidered

Zero overflow and a 17.3px body size means it passes. It was never designed
for: no mobile-specific composition, no thumb-reachable CTA, no sticky mobile
action bar, no touch-appropriate replacement for the hover reveals.

## 18. No texture anywhere

Flat fills, hairlines, one accent. No grain, no noise, no gradient mesh, no
blur, no layered depth, no light source. The research said not to use gradient
blobs, and the response was to use nothing, which is a different failure.

## 19. Favicon, OG image and share card are stale

The OG image is still `/img/tts-logo.png` from the old brand. Every link pasted
into a DM previews with the old identity against new copy.

## 20. It does not look like it was made by an AI implementation lab

This is the one that matters. The site claims the team does things no other
club can do, and the artifact demonstrating that claim is a page with three
animations that any Squarespace template beats on motion. The medium contradicts
the message, and a founder or a freshman reads the medium first.

---

## What the rebuild has to clear

1. A signature motif that is recognizable cropped, at 400px, with no logo.
2. Scroll as a composition device: pinned sections, bound reveals, varied pacing.
3. The `/for/<company>` lookup on the homepage, playable by a visitor.
4. The consulting-club argument drawn as a picture, not a bullet list.
5. Clay and Perplexity as marks at scale with motion, not a mono footnote.
6. Persistent nav, a live recruiting date, and a real OG card.
7. A motion budget with a number in it, and `ux-crawl` run against the build
   before it ships, comparing against `lenses/uselemma`.
