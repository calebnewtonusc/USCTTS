# INTENT-way: every visible thing on /way, and why it is there

/way is the semester's scroll story, behind home's "Understand the TTS way"
card (Tyler, 2026-10-09: home is a basic page first, and the 3D walkthrough
is something you choose). Same rules as INTENT-home.md: S is a USC student,
B is a business owner, anything on screen not listed here is a bug. Story
order and timings are in STORY-tts.md and components/tts/v4/choreo.ts.

## Chrome

- Nav, with "The TTS way" marked current: as on every route. Both.
- Readout strip, bottom left (coordinates, LA time, points lit, one status line: "one example project", "the work leaves USC", then "stage 3 of 6" rather than repeating the captions): the map is real data and says what it is doing. No street or distance for the client, who is in Ghana. Both.
- Route rail, bottom right (USC, The client, The machine, Your turn): where you are in the story and a way to jump; each stop glides, nothing teleports. Both.
- The LA field: the one set of objects that tells the story. Both.

## 1. The opener: the client (WayOpen.tsx, 150svh)

Caleb, 2026-10-10: "why tf the top of the tts way page and the main exactly
the same???". Home opens on the LA city; /way opens on the client, in the
same language at the scale of the world (rules: INTENT-home.md, "One
world").

- A night-navy panel, under the nav too, so the city never shows above it. Both.
- A graticule of points, one every 5 degrees and brighter on the 10s, so each dot is a real coordinate. Both.
- USC's cardinal point on Los Angeles and a gold point on Ghana (the country's centre, about 7.9 N, 1.0 W; the example names the country only), each with a mono label ("USC Los Angeles", "Ghana the client"). Both.
- The great circle between them as gold dots every 7px, with a short run of flow-blue light travelling from Ghana to USC on a 3.2s loop: the request arriving. Under reduced motion the light holds still. From 900px up the map owns the right half, so the arc never runs behind the headline. Both.
- "one example of a TTS project" in mono with USC's point, then the headline "Say your client is a nonprofit in Ghana that needs donor outreach." (Tyler's example, relayed 2026-10-10), "that needs donor outreach." in gold, and "Here's how a TTS team takes it from the first lead to the handover." Both.
- "scroll" with its 2.4s hairline loop (still under reduced motion). Both.
- The panel's lower edge fades over a third of a screen into the LA field beneath, which is the same navy, so it lifts off the city with no seam; over the half screen of runway the field turns to dawn (choreo.ts, P.open). Both.

## 2. The project (one pinned scene, 1000vh)

- "the brief" label and "First, the work leaves USC.": the next beat after the opener, which names the client, so the Ghana line appears once. Both.
- The agent light leaving USC across the map: the work going out from the club. It drives to a fixed node on the LA grid only because the map is LA; the page never names that node. Both.
- The glow growing from that point to fill the screen in the film's ground colour (#F4EFE6), about 20% of a screen: the dive, so the film arrives through the city with no cut. Both.
- The rack focus out of the flat field, the film's first 22 frames in about 13% of a screen: the camera finding the machine inside the point. Under half a screen together with the dive, per the 2026-10-09 brief. Both.
- The clay machine film: 375 frames rendered at 2560x1440 (1440x2560 on phones), drawn on a canvas at the screen's own pixels from the one followed scroll, the two nearest frames blended while moving and one frame at rest. Both the low and the sharp set fetch from the frame nearest the playhead outward, from the start (Tyler, relayed 2026-10-10: "still a bit blurry"; the sharp set used to wait for all 375 low frames). This film is the only place the full machine appears on the site. Both.
- The film's grain, stepping 12 times a second while the film shows: the grain the render used to bake in, now drawn live at device pixels; it is the ambient loop that keeps a parked reader from seeing a frozen frame. Off under reduced motion, where the film is a still of the whole machine. Both.
- Six captions, verbatim from Tyler (relayed 2026-10-10), each with a mono label naming the skill, never a tool brand: finding leads, "First you find every foundation that could fund them."; qualifying, "Then decide who's actually worth reaching, and teach the AI why."; prompting, "The team drafts the first email, and it writes well-tailored copy from there."; the CRM, "Every reply lands in the client's CRM and gets answered with AI."; meetings booked, "Meetings start appearing on the client's calendar within a week."; the handoff, "Then we teach the client to run it and hand it off as a full software project.". S.
- Cream halo behind each caption: readable over the moving film without a box. Both.
- "x-ray" button, top right, with a red hairline that sweeps across it every 3.2s while the film fills the screen and the x-ray is closed (still under reduced motion): says there is something to drag. Both.
- X-ray views (the tagged week of a development lead, the funder table, the qualifying prompt, the first email to a funder and its prompt, the reply workflow into the CRM and the calendar, the lesson plan, the manim clip for each, re-rendered 2026-10-10 for the donor example: "Can we see your impact report?", funders on "mission fit" and "giving", one merged CRM card): proof the work is real and teachable. No Perplexity branding. Both.
- The film drawing back into a point of light: the machine returning to the city. B.
- The handoff caption (above) closes it: the deliverable is software the client runs. B.

## 3. The doors (cardinal world)

- The cardinal raining in while the film closes (the doors rise under the film's last half screen, so the closing point never sits on an empty cream screen): the ending. Both.
- "I'm at USC. Teach me to build that." with the email field, "applications open soon. Follow us on Instagram": Tyler's student door at the bottom of the story. S.
- "I run a business. Book 30 minutes with Caleb.", Calendly in a new tab: Tyler's business door. B.
- Footer strip, as on home. Both.
