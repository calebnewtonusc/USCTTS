# INTENT-home: every visible thing on /, and why it is there

Caleb, 2026-10-09: "Nothing on either the sites should be unintentional."
Each line names the element, why it exists, and the reader it serves: S is a
USC student deciding whether to join, B is a business owner who wants AI
help, and both means both. Anything on screen that is not on this list is a
bug. The project walkthrough is /way, listed in INTENT-way.md.

The order is Tyler's, from his voice memos on 2026-10-09: "a more
professional kind of first page that people see rather than an animation
you have to scroll through", "the dot in LA is good", then a separating tab
and "it goes into being a real website", and "it's just gotta start off with
like a basic page". Caleb, 2026-10-10: "Make sure you're listening to what
tyler said." Tyler's second memo on the live site (relayed 2026-10-10) cut
the about story for the international work, retitled the network and the
advisors, and asked for more logos and more background; each change below
names it.

The look is from the same night. Caleb set the about section beside
clay.com: "Ours is so lame the clay one is YAYYYYYY", and then, of one
render used three times, "Why are we repeating the same thing 3x???" So each
section is a tinted rounded card with a coloured pill, a two-tone headline
and, where it shows a picture, its own clay scene built for it
(blender/heroes.py). The full machine is only in the /way film.

## Chrome, on every screen

- Nav mark (red square, "Trojan Tech Solutions", "USC"): whose site this is, and that it belongs to USC. Both.
- Nav links, "The TTS way" (to /way), "People" (to /members), "For companies": the three places a visitor looks for. Both.
- Nav "Join" button, cardinal: the one persistent way in for a student who has already decided, on every route. Site chrome, the one deliberate exception to nothing twice. S.
- Nav background: transparent with light type over the dark opener, paper with a hairline once scrolled. Both.
- The LA field (WebGL, drawn at the screen's pixel ratio up to 2): the opener's city and, at the end, the cardinal ground under the doors. Both.

## The opener (load clock, 2200ms; 130svh)

Kept as is: Tyler's second memo, "keep the LA opener with the glowing dot".

- Dark navy screen before the first frame: the canvas colour while the shaders link; the clock waits for it, so the city never arrives half built. Both.
- Points flying onto their streets, the camera settling from high and steep onto USC: the event that opens the page and puts the club in LA. Both.
- The red USC dot and its breathing glow, and one cardinal ring pulsing out from it: where TTS is, and the club reaching into the city ("the dot in LA is good"). Both.
- Headline "USC's AI implementation and go-to-market lab.", two lines sliding out of their masks: who TTS is in Tyler's words. No "first" or "premier", neither has a source. Both.
- "scroll" with a hairline whose light runs down it (2.4s loop, pauses once the headline is gone, still under reduced motion): the one ambient loop on home, saying there is a page below. Both.
- Readout strip, bottom left (coordinates where the camera looks, LA time, points lit, one status line): proves the map is real data (OpenStreetMap streets, a live LA clock, 74,741 points counted from the file). It leaves as the sheet comes up. Both.
- Freeways streaming light into USC on the first scroll, the headline leaving in depth: the city moving under the reader while the sheet rises. Both.

## The sheet

- The paper sheet, its top edge peeking 12% of a screen up from the bottom at load, inset and rounded, growing to full width as it covers the city: Tyler's separating tab, and nothing arrives from nowhere. Both.
- A grip line on the lip, no words: says the edge is a sheet you pull up. The label that used to sit there repeated the first pill. Both.
- One coloured pill per section, mono, uppercase, rounded (gold, cardinal, sky, leaf, gold on navy, coral): where you are on a long page, and the clay world's colours carried into the page. Both.
- Two-tone headlines, the phrase that carries the claim in cardinal (gold on the navy card): the one line to read if you read nothing else. Both.
- Tinted rounded cards (blush, sky, leaf, gold; 28px corners, flat colour, no shadow): each section reads as one object, the way clay.com's feature cards do, in TTS's palette. Both.
- Rounded buttons: ink at rest, cardinal and lifted 1px on hover, scaled to 0.97 when pressed, a 2px ring on keyboard focus. Both.
- Rises on arrival (data-reveal, once, 70ms stagger; still under reduced motion): sections come up as you reach them. Both.

### 1. Who we are (pill "who we are", gold)

- "We build whatever AI a company or nonprofit needs, anywhere in the world: automations, CRMs, outbound, training their teams. Students build all of it.", the last sentence in cardinal: Caleb's description, global (2026-10-10), and the line Tyler's second memo keeps ("pretty direct"). Both.
- The clay LA world (world-1200/2400.webp), a 2:1 rounded frame, 4:3 crop on phones: the one big joyful scene on home. USC's cardinal tower with the red dot above it, a downtown of rounded towers, palms, a freeway between them, hills and sky at golden hour. It sits under the line it illustrates: students, from USC, building for the city and past it. Both.
- Clay wordmark and Perplexity mark, $7.1B and $20B counting up once when the row shows, each with "valued as of" and its date, never summed: the partners, sized and sourced. Both.
- "You build on Clay and Perplexity, the tools real companies pay for to find their customers, through our partner Blue Modern Advisory.": what a member gets, and who holds the partnership. S.

### 2. Our work (pill "our work", cardinal, blush card)

Replaced the about story on Tyler's second memo: the statement already says who TTS is, so show what is special, the international work.

- "Real clients, from Nigeria to Yemen.", the place names in cardinal: the reach, in two places Tyler named. Both.
- One sentence, "TTS has client projects in Nigeria, an AI curriculum for an education nonprofit; in Ghana, in healthcare; in Yemen; and in cancer therapeutics.", the four names in ink: only the place or field Tyler named (source: Tyler voice memo 2026-10-09, relayed 2026-10-10; Nigeria also in second-brain/core/now.md, stemmets.com). A sentence, since site-gate refuses a heading-plus-line card grid. [NEED: Yemen's field, and where the cancer therapeutics client is.] Both.
- "Learn more about TTS" button, to /members: Tyler's first-memo button; /members tells the comeback story with the advisors. Both.
- The gold clay mailbox (mailbox-720/1440.webp), its flag up and a sealed letter going out on its open door, on blush, filling a 4:3 rounded frame: work shipped to a client, wherever they are. Both.

### 3. Our network (pill "our network", sky card)

- "See where TTS can get you.", the last three words in cardinal: Tyler's retitle. S.
- "17 people started at TTS. Tap a company to meet them.": the fifteen alumni plus Matthew Kim and Kevin Sangmuah, who co-founded TTS ("OG Co-Founder" on the site at 37795eb); the count is NETWORK_PEOPLE.length in data/people.ts. The other advisors were never members, so they stay off this wall. S.
- The logo wall, rounded white tiles, one per company, marks in one ink at rest and full colour on hover, faces and first names under each. Since Tyler's "the more the better", it also has McKinsey (Matthew) and Microsoft (Elizabeth and Senai, both ex-Microsoft per data/people.ts), with "then at Microsoft" in the dialog, never "now". Git history (every logo file and alumni list since April) held no other sourced company. Palantir stays off (Caleb, 2026-10-04, "We shouldn't flex palantir"), even though Tyler mentioned it. S.
- The dialog a tile opens (the company's people, bigger, with roles; Escape, the close button or the backdrop closes it): Tyler's click into an interactive alumni view. S.

### 4. Club advisors (pill "club advisors", leaf card)

- "Club advisors, open to a coffee chat anytime.", the second half in cardinal: Tyler's retitle. S.
- Six advisor rows, a 96px face beside the name and a list of background lines, each with the company's mark where one is on disk and a leaf dot where not. Sources in data/people.ts: Chris Swain from his IYA faculty page (three venture-backed companies, 50+ products for Disney, Intel, Sony, IBM and others, co-founded the EA Game Innovation Lab at USC, founding member of R/GA); Matthew Kim (Analyst at McKinsey, co-founded TTS); Kevin Sangmuah (Reddit, founder and CFO of Retax 360, co-founded TTS); Duncan Inganji (Google, mentors through the ACTS2 Fellowship); Sagar Tiwari (Stanford GSB, formerly McKinsey, past president of 180 Degrees Consulting at USC; [NEED: the company Tyler called "Hydroc"]); Andrew Laffoon (founder and CEO of Mixbook). Both.

### 5. The TTS way (navy card)

- The card to /way: the cardinal clay typewriter drafting one letter, the lead waiting at its foot, on the opener's navy, lit by one warm key and a cool rim (writer-1200/2400.webp, its own scene, not a film frame). The typewriter sits at 67% across so the copy owns the left. Pill "the TTS way" in gold, "Understand the TTS way." with "the TTS way." in gold, "Follow one client project from the first lead to the handover, in 3D.", "Start the walkthrough". The image eases in 3% on hover. Both.

### 6. Meet the team (pill "the team", coral, gold card)

- "Meet the team." and three cards, Caleb, Tyler and Emily, professional photos only, each at most 279px wide so no headshot is upscaled at dpr 2; two link to LinkedIn with an arrow that slides on hover, Emily's has no link because none is on record. Both.
- One or two lines of background each (Tyler's second memo), sourced in data/people.ts: Caleb from second-brain/core/identity.md and now.md (IYA sophomore; with Tyler took TTS from an empty club to 30+ members in three months); Tyler from now.md and people.md (Global Business sophomore, recruited the ten-person cabinet, runs the student-org registration); Emily from her people.ts note (designed the logo and the previous site, also in 180 Degrees Consulting). Amber stays off: it is in stealth. Both.

## 7. The doors (cardinal world)

- The cardinal raining in across the city as the sheet ends: the field returns for the ending. Both.
- "I'm at USC. Teach me to build that." with the email field and "Tell me when it opens", "applications open soon. Follow us on Instagram": something a student can do today. S.
- "I run a business. Book 30 minutes with Caleb.", Calendly in a new tab: the business door. B.
- Footer strip (People, Work with us, Sponsor, speak or recruit, T Combinator when its host is live, LinkedIn, the student-org and OpenStreetMap line). Both.

## Every image and video on home and /way, and where it comes from

No file appears twice and no scene appears twice. The machine scene is in
exactly one place, the /way film.

| Where                  | File                                                                                                                                | Source                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| home, opener and doors | public/tts/grid/la-grid.bin (poster.jpg until WebGL draws)                                                                          | OpenStreetMap, public/tts/grid/README.md                    |
| home, who we are       | public/tts/home/world-1200.webp, world-2400.webp                                                                                    | blender/heroes.py --hero world                              |
| home, partners         | public/tts/partners/clay.png, perplexity.svg                                                                                        | the partners' official marks                                |
| home, our work         | public/tts/home/mailbox-720.webp, mailbox-1440.webp                                                                                 | blender/heroes.py --hero mailbox                            |
| home, network          | public/tts/alumni/(name).svg, public/img/logos/mckinsey.png, public/img/alumni/(name).jpeg                | company marks; alumni photos from data/people.ts            |
| home, advisors         | public/img/{chris_swain,matthew,kevin,duncan,sagar,andrew}\_shot.\*, public/img/logos/{mckinsey,reddit,google,stanford,mixbook}.png | data/people.ts                                              |
| home, TTS way card     | public/tts/home/writer-1200.webp, writer-2400.webp                                                                                  | blender/heroes.py --hero writer                             |
| home, team             | public/img/{caleb,tyler,emily}\_shot.\*                                                                                             | data/people.ts                                              |
| /way, opener and doors | public/tts/grid/la-grid.bin                                                                                                         | OpenStreetMap                                               |
| /way, the film         | public/tts/machine/seq/{land-2560,land-1280,port-1440,port-720}/\*.webp, still-land.webp and still-port.webp under reduced motion   | blender/machine.py, the only place the full machine appears |
| /way, x-ray            | public/tts/manim/{gtm_score,gtm_score_on_cardinal,email_draft,crm_merge,teach_curve}.{mov,webm,png}                                 | manim/scenes.py                                             |

Every face appears once on home. Matthew Kim and Kevin Sangmuah are both
on the network wall (they co-founded TTS) and in the advisors section, so
their tiles on the wall show only the company mark and their first names,
with no photo in the tile or its dialog; their faces are in the advisors
section only (coordinator, 2026-10-10).

## The clay look (blender/machine.py LOOK, heroes.py)

machine.py has a "v2" look behind `--look v2`: subsurface 0.22 at 2cm, a
velvet sheen, finer and stronger grain plus Voronoi thumb dimples, saturation
up 25%, terracotta occlusion in place of grey, and a 6 degree key over a
world at half the old strength. Measured on the old about render: mean
saturation 0.089, 1.7% of pixels above 0.3. The before/after crop of film
frame 200 is docs/ref/clay-look-v1-v2.webp. The shipped /way film is still
the v1 look: re-rendering 750 frames at 2560 is a separate heavy job, and
`--look v1` reproduces what is live. The heroes are always v2, with grain
and a soft vignette added in blender/encode_heroes.py.

## Removed, because Tyler's brief replaced them

- 2026-10-10: the about story ("A dormant club, rebuilt in three months." and the Matthew Kim handoff line). The statement says who TTS is; the work tiles show what is special. The story still lives on /members.
- 2026-10-10: the film frames on home (machine-1280/2560.webp, frame 352, as the about image; typewriter-1280/2560.webp, frame 200, on the TTS way card) and the grey caption strip under the about image. Deleted from public/tts/landing/.
- 2026-10-10: "these people actually want to help you" and "15 people started at TTS. See where they went.", retitled by Tyler.
- 2026-10-09: the semester story on home, the route rail, "This is you, a few weeks from now.", WayHash and the /way to /#way redirect.
