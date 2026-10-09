# INTENT-home: every visible thing on /, and why it is there

Caleb, 2026-10-09: "Nothing on either the sites should be unintentional."
Each line names the element, why it exists, what it proves, and the reader
it serves: S is a USC student deciding whether to join, B is a business
owner who wants AI help, and both means both. Anything on screen that is
not on this list is a bug. Story order and timings are in STORY-tts.md.

## Chrome, on every screen

- Nav mark (red square, "Trojan Tech Solutions", "USC"): says whose site this is and that it belongs to USC. Both.
- Nav links, "The TTS way", "People", "For companies": the three places a visitor looks for; "The TTS way" glides to the story on this page instead of leaving it. Both.
- Nav "Join" button, cardinal: the one persistent way in for a student who has already decided, on every route. It is site chrome, not a page section, so it is the one deliberate exception to nothing twice. S.
- Nav background: transparent with light type over the dark opener, paper with a hairline once scrolled, so the links stay readable over every world. Both.
- Readout strip, bottom left (coordinates where the camera looks, LA time, points lit, one status line): proves the map is real data (OpenStreetMap streets, a live LA clock, 74,741 points counted from the file) and narrates what the field is doing in words the page never prints elsewhere. Both.
- Readout backing gradient: a soft band behind the strip so the mono text reads over any world; it is the only gradient on the chrome. Both.
- Route rail, bottom right (USC, Clay + Perplexity, Koreatown, The machine, Alumni, Your turn): where you are in the semester and a way to jump; each stop glides, nothing teleports. Both.
- The LA field (WebGL): the one set of objects that tells the story. Real streets around the USC dot, its colour worlds (night, sky, cream, cardinal) mark the chapters. Both.

## 1. The intro (load clock, 2200ms)

- Dark navy screen before the first frame: the canvas colour while the shaders link; the clock waits for it, so the city never arrives half built. Both.
- Points flying onto their streets, with the camera settling from high and steep onto USC: the event that opens the page and shows the club lives in LA. Both.
- The red USC dot and its breathing glow: the protagonist of the story; every later beat starts or ends here. S.
- The single cardinal ring pulsing out from USC once: the intro's last beat, the club reaching out into the city. Both.
- Headline "USC's AI implementation lab.", two lines sliding out of their masks: who TTS is in one line, the same words as the site's title. Both.
- "scroll" with a hairline whose light runs down it (2.4s loop, Lemma's cue period, pauses once the headline is gone, still under reduced motion): the only ambient loop outside the field, telling a first-time visitor there is more. Both.
- Headline leaving in depth (420px and 300px on one curve): the hero coming apart as the story starts. Both.
- Freeways streaming light into USC on the first scroll: students arriving, the first state change of the one set of objects. S.
- "This is you, a few weeks from now.": makes the student the main character before the story starts (STUDENT-POV, section 2). S.

## 2. Who we are, and the partners (sky world, pinned)

- "We do everything AI for LA businesses: automations, CRMs, outbound, teaching their people, whatever a company needs. Students build all of it.": Caleb's own description of the club, the Clay-style statement of what TTS does. Both.
- Clay wordmark and Perplexity mark: tools a student already recognises and a business already pays for. Both.
- $7.1B and $20B counting up, each with "valued as of" and its date, never summed: how big the two partners are, sourced. Both.
- "You build on Clay and Perplexity, the tools real companies pay for to find their customers, through our partner Blue Modern Advisory.": what a member gets from the partnership, and who holds it. S.
- Three depths of drift on the line and the two rows: depth without a band or a fade. Both.

## 3. The TTS way (one pinned scene)

- "the TTS way" mono label: Tyler's name for the story, so the nav link and the beat share one name. Both.
- "Say your first client is a dental office in Koreatown that answers the same emails all week.": a business brings a problem, with the student as the one solving it. Both.
- The agent light driving from USC to a real dental office node near Wilshire and Western: the second state change, the USC dot becoming the student's project. Both.
- The glow growing from that point to fill the screen in the film's ground colour: the dive, so the film arrives through the city with no cut. Both.
- The rack focus out of the flat field (the film's first 22 frames): the camera finding the machine inside the point. Both.
- The clay machine film (Blender, scrubbed by scroll): the semester's work as one machine a student builds. Both.
- Five captions, each with a mono label naming the skill or tool: what you learn at each stage, in one line each, varying in place so no two read the same. S.
- Cream halo behind each caption: keeps the line readable over the moving film without a box. Both.
- "x-ray" button, top right: opens the drag line that shows each stage's real artifact; quiet until tapped. Both.
- X-ray views (the tagged week, the Clay table, the qualifying prompt, the first email and its prompt, the CRM workflow, the lesson plan, and the manim clip for each): proof that the work is real and teachable. They are the only place the manim clips appear. Both.
- The film drawing back into a point of light: handing it over, the machine returning to the city. B.
- "Then you teach the office to run it without you.": the deliverable is something running, not a deck. B.

## 4. Where they go (cream world)

- The camera rising off the block and drifting home to USC: the story returns to where it started. S.
- "Then you graduate. This is where the 15 people who started at TTS went.": the end of the semester and the proof; 15 is ALUMNI.length. S.
- The alumni wall, one card per company with its mark and the people there: credibility, faces and real employers, every one from data/people.ts. S.
- Company marks in one grey ink at rest, full colour on hover; faces 15% grey at rest: a dozen brands read as one wall, and hovering a card brings it to life. S.
- Cards rising in once and drifting at four depths above 900px: the wall coming up out of the city in layers. Both.
- "These people actually want to help you.": Tyler's line for the mentors. S.
- Six mentor cards (photo, name, role, company and its mark): who backs the club, each face once on the page. Both.
- "When Matthew Kim graduated, he handed TTS to Caleb and Tyler.": where the current team came from, approved by Caleb on 2026-10-05. Both.
- Three team cards, two linked with an arrow that slides on hover: who runs it and how to reach them; Emily's has no link because none is on record. Both.
- Square corners and one hairline on every card, no shadow: DESIGN-tts's figure family. Both.

## 5. The two doors (cardinal world)

- The cardinal raining in across the city: the last state change, the whole map becoming the ending. Both.
- Hairline above and between the doors: separates the two choices. Both.
- "I'm at USC. Teach me to build that." with the email field and "Tell me when it opens": something a student can do today, since applications are closed. S.
- "applications open soon. Follow us on Instagram": the honest status and a way to follow now. S.
- "I run a business. Book 30 minutes with Caleb." linking to Calendly, "calendly, opens in a new tab": the business door. B.
- Footer strip (People, Work with us, Sponsor, speak or recruit, T Combinator when its host is live, LinkedIn, and the student-org and OpenStreetMap line): the rest of the site and the map's licence. Join and Instagram are left out because the student door carries both. Both.

## Removed in this pass, because nothing justified them

- CSS for the old week panel (w4-head, w4-lane, w4-line, w4-panel, w4-stage, w4-title), the unused caption spots (is-bl, is-br, is-huge, is-small) and the "only university club" line: inherited from earlier homes, never rendered here.
- The superseded 140vh opener height and the old partners grid rule.
- Readout statuses that repeated words already on screen: the club description (said by the who-we-are line), the services list, the BMA line, and the stage labels the captions print.
- Join TTS and Instagram in the ending footer.
