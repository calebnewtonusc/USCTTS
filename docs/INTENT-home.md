# INTENT-home: every visible thing on /, and why it is there

Caleb, 2026-10-09: "Nothing on either the sites should be unintentional."
Each line names the element, why it exists, and the reader it serves: S is a
USC student deciding whether to join, B is a business owner who wants AI
help, and both means both. Anything on screen that is not on this list is a
bug. The semester's scroll story is /way, listed in INTENT-way.md.

The order is Tyler's, from his voice memos on 2026-10-09: "a more
professional kind of first page that people see rather than an animation
you have to scroll through", "the dot in LA is good", then a separating tab
and "it goes into being a real website", and "it's just gotta start off with
like a basic page". Caleb, 2026-10-10: "Make sure you're listening to what
tyler said."

## Chrome, on every screen

- Nav mark (red square, "Trojan Tech Solutions", "USC"): whose site this is, and that it belongs to USC. Both.
- Nav links, "The TTS way" (to /way), "People" (to /members), "For companies": the three places a visitor looks for. Both.
- Nav "Join" button, cardinal: the one persistent way in for a student who has already decided, on every route. Site chrome, the one deliberate exception to nothing twice. S.
- Nav background: transparent with light type over the dark opener, paper with a hairline once scrolled. Both.
- The LA field (WebGL, drawn at the screen's pixel ratio up to 2): the opener's city and, at the end, the cardinal ground under the doors. Both.

## The opener (load clock, 2200ms; 130svh)

- Dark navy screen before the first frame: the canvas colour while the shaders link; the clock waits for it, so the city never arrives half built. Both.
- Points flying onto their streets, the camera settling from high and steep onto USC: the event that opens the page and puts the club in LA. Both.
- The red USC dot and its breathing glow, and one cardinal ring pulsing out from it: where TTS is, and the club reaching into the city ("the dot in LA is good"). Both.
- Headline "USC's AI implementation and go-to-market lab.", two lines sliding out of their masks: who TTS is in Tyler's words, the statement he asked to lead. No "first" or "premier", neither has a source. Both.
- "scroll" with a hairline whose light runs down it (2.4s loop, pauses once the headline is gone, still under reduced motion): the one ambient loop on home, saying there is a page below. Both.
- Readout strip, bottom left (coordinates where the camera looks, LA time, points lit, one status line): proves the map is real data (OpenStreetMap streets, a live LA clock, 74,741 points counted from the file). It leaves as the sheet comes up. Both.
- Freeways streaming light into USC on the first scroll, the headline leaving in depth: the city moving under the reader while the sheet rises. Both.

## The sheet

- The paper sheet, its top edge peeking 12% of a screen up from the bottom at load, inset and rounded, growing to full width as it covers the city: Tyler's separating tab, and nothing arrives from nowhere (clay.com's sheet). Both.
- "who we are" on the lip, under a short grip line: names the first section so the edge reads as the start of the page. Both.
- Mono label over each section (about us, our network, join the network, the TTS way, the team): where you are on a long page. Both.
- Rises on arrival (data-reveal, once, 70ms stagger; still under reduced motion): sections come up as you reach them. Both.

### 1. Who we are

- "We do everything AI for LA businesses: automations, CRMs, outbound, teaching their people, whatever a company needs. Students build all of it.": Caleb's own description, the big statement under the headline. Both.
- Clay wordmark and Perplexity mark, $7.1B and $20B counting up once when the row shows, each with "valued as of" and its date, never summed: the partners, sized and sourced. Both.
- "You build on Clay and Perplexity, the tools real companies pay for to find their customers, through our partner Blue Modern Advisory.": what a member gets, and who holds the partnership. S.

### 2. About us

- "A dormant club, rebuilt in three months.": the club's real history in one line (docs/COPY-tts.md, sourced facts). Both.
- "When Matthew Kim graduated, he handed TTS to Caleb Newton and Tyler Larsen, and there was nobody left in it. ...": where the team came from and what the club is for. Both.
- "Learn more about TTS" button, to /members: Tyler's button; /members tells the comeback story with the advisors. Both.
- The figure, frame 352 of the machine film at 2560px (whole machine pulled back), with its caption: a picture of what a client project is. It is a render, not a photo; no real photo of members at work is on disk yet. Both.

### 3. Our network

- "See where 15 people who started at TTS went.": Tyler's "see our network"; 15 is ALUMNI.length. S.
- "Tap a company to meet them.": says the wall is interactive. S.
- The logo wall, one tile per company, marks large in one ink at rest and full colour on hover, the faces and first names under each: "the logos would add a lot of credibility", with real faces. S.
- The dialog a tile opens (the company's people, bigger, with roles; Escape, the close button or the backdrop closes it): Tyler's click into an interactive alumni view. S.

### 4. Join the network

- "These people actually want to help you.": Tyler's line for the mentors. S.
- Six mentor cards (real photo, name, role, company and its mark): Duncan and the others, with their background. Both.

### 5. The TTS way

- The card to /way, frame 200 of the film at 2560px (the typewriter drafting), "Understand the TTS way.", one line on what it is, "Start the walkthrough": Tyler's card into the 3D scroll story. The image eases in 3% on hover. Both.

### 6. Meet the team

- "Meet the team." and three cards, Caleb, Tyler and Emily, professional photos only, each at most 279px wide so no headshot is upscaled at dpr 2; two link to LinkedIn with an arrow that slides on hover, Emily's has no link because none is on record. Both.

## 7. The doors (cardinal world)

- The cardinal raining in across the city as the sheet ends: the field returns for the ending. Both.
- "I'm at USC. Teach me to build that." with the email field and "Tell me when it opens", "applications open soon. Follow us on Instagram": something a student can do today. S.
- "I run a business. Book 30 minutes with Caleb.", Calendly in a new tab: the business door. B.
- Footer strip (People, Work with us, Sponsor, speak or recruit, T Combinator when its host is live, LinkedIn, the student-org and OpenStreetMap line). Both.

## Removed in this pass, because Tyler's brief replaced them

- The semester story on home (partners pinned on the sky, the dental office, the film, the alumni rising over the city): moved whole to /way, behind the card.
- The route rail: it pointed at stops of a story home no longer tells; it lives on /way.
- "This is you, a few weeks from now.": the story's line, now on /way.
- "When Matthew Kim graduated..." as the team heading: the about section carries it, so the team section is just "Meet the team."
- WayHash and the /way to /#way redirect.
