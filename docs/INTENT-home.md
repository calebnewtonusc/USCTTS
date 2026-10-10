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
section has a two-tone headline, a tinted ground
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

## One world: the rules every section follows

Caleb, 2026-10-10: "Is there a way to weave aspects of the dope dot stuff
into the rest of the site with it seeming fire lemma future type shi
without it seeming gimmicky? I wanna tastefully marry the 2, it seems like
2 sites in 1 rn." Before this the LA opener and the paper sections read as
two websites. These rules make them one, and any new section on home, /way
or /members follows them.

1. **Every dot is a place or a person.** Dots are the opener's points: real
   OpenStreetMap street samples from la-grid.bin (landing/dots.ts), a
   coordinate on the world graticule (/way), or one person. It is never a
   decorative pattern and never a random field.
2. **Same spacing and colour as the field.** Street dots at the opener's
   size (1.4px, arterials 1.25x and stronger), lines as dots every 7px.
   Ink at low alpha on paper; street gold and cream on navy; flow blue for
   light that travels.
3. **USC's cardinal point is the one recurring mark** (#d0102e with a soft
   halo): the travelling head of the thread down home's sheet, each lit
   section node, the network's origin, the mark on a card under the
   pointer, and the cursor over the doors (white there, the way the field
   draws it on cardinal).
4. **Dots assemble and dissolve, never cut.** A dot floor assembles the way
   the opener's city does, each point flying in from a small scatter in
   order of its distance from USC, as its band comes up the screen, and
   dissolves the same way as it leaves (DotFloor.tsx). One pure function of
   the followed scroll, so scrolling back plays it back.
5. **Mono is for small data only**: section numbers, places, country codes,
   roles, coordinates, counts. Headlines and sentences stay in the grotesk.
6. **Restraint.** No glow except the USC point's halo and travelling light.
   No effect that does not carry a place, a person or a handoff. 60fps:
   canvases redraw only while visible and only when their value changes;
   ambient loops pause offscreen and in a hidden tab. Reduced motion draws
   every floor finished, every line drawn, no travelling light.

## The sheet

- The paper sheet, its top edge peeking 12% of a screen up from the bottom at load, inset and rounded, growing to full width as it covers the city: Tyler's separating tab, and nothing arrives from nowhere. Both.
- A grip line on the lip, no words: says the edge is a sheet you pull up. Both.
- The thread (Thread.tsx), from 1200px up: a dotted line in the left margin at the field's spacing, with USC's cardinal point travelling down it at 45% of the screen as you read. Each section's marker is a node on it that lights cardinal when the point reaches it. It is the section indicator, the handoff between sections and the recurring USC mark in one object. Narrower, each marker shows its own point inline. Both.
- Section markers, mono: "01 who we are" through "06 the team", the number in cardinal (gold on navy). They replaced the coloured pills, which repeated one template on every section. Both.
- Two-tone headlines, the phrase that carries the claim in cardinal (gold on navy). Both.
- Rounded buttons: ink at rest, cardinal and lifted 1px on hover, scaled to 0.97 when pressed, a 2px ring on keyboard focus. Both.
- Rises on arrival (data-reveal, once, 70ms stagger; still under reduced motion). Both.

### 1. Who we are (marker 01)

- "We build whatever AI a company or nonprofit needs, anywhere in the world: automations, CRMs, outbound, training their teams. Students build all of it.", the last sentence in cardinal: Caleb's description, global (2026-10-10). Both.
- The clay LA world (world-1200/2400.webp), a 2:1 rounded frame, 4:3 crop on phones, standing on a dot floor: the real streets around USC as points, running out past the frame's edges and fading at a soft oval. The clay city on the real one. Both.
- Clay wordmark and Perplexity mark, $7.1B and $20B counting up once, each with "valued as of" and its date, never summed. Both.
- "You build on Clay and Perplexity, the tools real companies pay for to find their customers, through our partner Blue Modern Advisory.". S.

### The seam

- A band of the city's points (10 km of streets across, USC's point at its centre) that assembles out of the paper as it comes up and dissolves as it leaves the top: the handoff from the city to the work leaving it. Both.

### 2. Our work (marker 02, blush card)

- The gold clay mailbox (mailbox-720/1440.webp), 4:3, on its own dot floor in the card's red: work shipped out of the city. Left on desktop, first on phones. Both.
- "And the work doesn't stay in LA.", a lead line in muted ink, then the headline "Real clients, from Nigeria to Yemen.": the handoff from the LA scene above. Both.
- The manifest, four hairline rows: NG Nigeria, "an AI curriculum for an education nonprofit"; GH Ghana, "healthcare"; YE Yemen; and Cancer therapeutics with the cardinal point in place of a country code, since its place is not known. Country codes and fields in mono. Only what Tyler named (voice memo 2026-10-09; Nigeria also in second-brain/core/now.md, stemmets.com). [NEED: Yemen's field, and where the cancer therapeutics client is.] Both.
- "Learn more about TTS", to /members. Both.

### 3. Our network (marker 03, the night field returns)

Caleb, 2026-10-10: "Add color brotha", "Ts pointless, make it all link to their linkedins" and "The boring alumni layout lame af get creative". The logo wall and its dialog are gone; the network is drawn in the field's own light.

- A navy band, inset and rounded, in the opener's night colours. Its floor is the real LA streets around USC as points, in street gold and cream (Network.tsx). S.
- "See where TTS can get you." (Tyler's retitle), gold accent; "17 people started at TTS, and each line of light is one of them. Tap a face to find them on LinkedIn." The count is NETWORK_PEOPLE.length in data/people.ts: the fifteen alumni plus Matthew Kim and Kevin Sangmuah, who co-founded TTS. S.
- USC's cardinal point on the left with a mono tag (USC, 34.0224 N, 118.2851 W, 17 started here). One line of gold dots per person runs out of it to their face, drawn out from USC as the section arrives, with a short run of flow-blue light travelling each line on its own loop. Elizabeth's and Senai's lines pass through Microsoft first, where both worked before (people.ts), and Microsoft's node says "Elizabeth and Senai, before". S.
- Each company is a white chip with its real mark in its own colours, ringed in a clay tint, with the faces of its people under it and their first names in mono. Marks from the companies' files on disk and Wikimedia Commons (public/tts/marks/: McKinsey trimmed from the old PNG, NBCUniversal and USC Gould from Commons). Epic and Roxborough Group are set in type: "Epic" alone does not say which Epic, and roxboroughgroup.com served no logo (checked 2026-10-10). S.
- Albert Chung has no company node, by design (Caleb, 2026-10-04: "We shouldn't flex palantir"): his line ends at his face with his role under it, in the person's slot, never in a company's. S.
- Matthew and Kevin appear as their initials on a cardinal disc: their faces are in the advisors section, and a face appears once on home. S.
- Every face links to that person's LinkedIn in a new tab. All 17 URLs are the ones the site carried before (git history, April to May 2026); none is constructed. Hover or focus on a company lights its lines in cream with cardinal light and dims the rest; a face shows the person's role in a cream tag. S.
- Under 900px the map stacks: USC on top, companies in two columns, one trunk of dots down the gap between them, each person's line turning off it at their face, drawn as the reader reaches it. S.

### 4. Club advisors (marker 04)

Caleb, 2026-10-10: "TS so ugly and doesn't make em go WOAHHHHH".

- "Club advisors, open to a coffee chat anytime.", the second half in cardinal: Tyler's retitle. S.
- Six portrait cards, each on its own saturated colour (leaf, sky, coral, gold, violet, cardinal), the photo filling a rounded square, the mark of where they are at its real size on a white chip over the photo, the name, every background line from data/people.ts, and a mono "LinkedIn" (Chris Swain's is his IYA faculty page, the only link on disk for him). The middle column sits 48px lower on desktop. Hover lifts the card, eases the photo in 5% and shows USC's cardinal point in its corner. On phones the cards are a swipe rail. Sources as before: Chris Swain from his IYA faculty page; Matthew Kim (Analyst at McKinsey, co-founded TTS); Kevin Sangmuah (Reddit, founder and CFO of Retax 360, co-founded TTS); Duncan Inganji (Google, mentors through the ACTS2 Fellowship); Sagar Tiwari (Stanford GSB, formerly McKinsey, past president of 180 Degrees Consulting at USC; [NEED: the company Tyler called "Hydroc"]); Andrew Laffoon (founder and CEO of Mixbook). Both.

### 5. The TTS way (marker 05, navy card)

- The card to /way: the cardinal clay typewriter on the opener's navy (writer-1200/2400.webp). "Understand the TTS way." with "the TTS way." in gold, "Follow one client project from the first lead to the handover, in 3D.", "Start the walkthrough". The image eases in 3% on hover. Both.

### 6. Meet the team (marker 06, the comeback story)

Caleb, 2026-10-10: "Should we move the people page into the main page? The ppl page animation/story is tufff". It replaced the flat three-card team section; /members is now the full roster, so the two never share the animation (TeamStory.tsx).

- One pinned stage, 560vh. The roster is 30 points, one a seat, empty rings while "For over a year, Trojan Tech Solutions sat dormant, with nobody in it."; Matthew Kim's cardinal point (his initials, "Matthew Kim handed it on") with red threads to Caleb's and Tyler's seats, their faces landing there, under the handoff line; Emily joining and the rest of the seats filling outward from the three in clay colours along thin lines, each pulled in by a neighbour, under "So they started over, with Emily Zhao on design...". Lines never share the screen (the /members version overlapped at 0.3). The seats are a picture of dormant and full, not a member count. Both.
- "About three months later, it had a real roster." alone, big, as the roster sits back. Both.
- The three faces travel out of their seats into the team cards, the same three photographs, so a face is on the page once and the story's last move is the content: "Meet the team.", three tinted cards (gold, sky, blush) with name, role in mono, the background line from data/people.ts, and a link (Caleb's site, Tyler's LinkedIn; Emily has none on record). Professional photos only, never an AI-generated team image. Amber stays off: it is in stealth. Both.
## 7. The doors (cardinal world)

- The cardinal raining in across the city as the sheet ends: the field returns for the ending. Both.
- "I'm at USC. Teach me to build that." with the email field and "Tell me when it opens", "applications open soon. Follow us on Instagram": something a student can do today. S.
- "I run a business. Book 30 minutes with Caleb.", Calendly in a new tab: the business door. B.
- The cursor over the doors is USC's point, white with a soft halo, the way the field draws it on cardinal (story.css; pointer devices only, text cursor in the field). Both.
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
| home, network          | public/tts/grid/la-grid.bin (the floor), public/tts/alumni/(name).svg, public/tts/marks/{mckinsey.png,nbcuniversal.svg,uscgould.png}, public/img/alumni/(name).jpeg | OpenStreetMap; company marks (Commons: NBCUniversal 2026 Logo (flat).svg and USC Gould logo.png, both public domain); alumni photos from data/people.ts |
| home, advisors         | public/img/{chris_swain,matthew,kevin,duncan,sagar,andrew}\_shot.\*, public/tts/marks/{mckinsey,reddit,google,stanford,mixbook}.png (trimmed from public/img/logos) | data/people.ts                                              |
| home, TTS way card     | public/tts/home/writer-1200.webp, writer-2400.webp                                                                                  | blender/heroes.py --hero writer                             |
| home, team story       | public/img/{caleb,tyler,emily}\_shot.\*                                                                                             | data/people.ts                                              |
| /way, opener           | none: a canvas graticule and great circle (WayOpen.tsx); the field under it is la-grid.bin |
| /way, doors            | public/tts/grid/la-grid.bin                                                                                                         | OpenStreetMap                                               |
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

- 2026-10-10: the coloured section pills, the network's logo wall and its dialog, the six small advisor cards, and the flat three-card team section, on Caleb's verdicts the same day. /members' scroll story moved to home; /members is the full roster.

- 2026-10-10: the about story ("A dormant club, rebuilt in three months." and the Matthew Kim handoff line). The statement says who TTS is; the work tiles show what is special. The comeback story is home's team section now (TeamStory.tsx).
- 2026-10-10: the film frames on home (machine-1280/2560.webp, frame 352, as the about image; typewriter-1280/2560.webp, frame 200, on the TTS way card) and the grey caption strip under the about image. Deleted from public/tts/landing/.
- 2026-10-10: "these people actually want to help you" and "15 people started at TTS. See where they went.", retitled by Tyler.
- 2026-10-09: the semester story on home, the route rail, "This is you, a few weeks from now.", WayHash and the /way to /#way redirect.
