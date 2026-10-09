# INTENT-way: every visible thing on /way, and why it is there

/way is the semester's scroll story, behind home's "Understand the TTS way"
card (Tyler, 2026-10-09: home is a basic page first, and the 3D walkthrough
is something you choose). Same rules as INTENT-home.md: S is a USC student,
B is a business owner, anything on screen not listed here is a bug. Story
order and timings are in STORY-tts.md and components/tts/v4/choreo.ts.

## Chrome

- Nav, with "The TTS way" marked current: as on every route. Both.
- Readout strip, bottom left (coordinates, LA time, points lit, one status line that counts the stages, "stage 3 of 5", rather than repeat the captions): the map is real data and says what it is doing. Both.
- Route rail, bottom right (USC, Koreatown, The machine, Your turn): where you are in the story and a way to jump; each stop glides, nothing teleports. Both.
- The LA field: the one set of objects that tells the story. Both.

## 1. The opener (load clock, 2200ms)

- The city assembling around the USC dot, the camera settling, one ring pulsing out: the same event as home's, because this is a page of its own. Both.
- "This is how a TTS project runs.": what the page is, in one line. Both.
- "scroll" cue with its 2.4s hairline loop (pauses with the headline, still under reduced motion). Both.
- Freeways streaming light into USC on the first scroll: students arriving. S.
- "This is you, a few weeks from now.": makes the student the main character (STUDENT-POV, section 2). S.

## 2. The project (one pinned scene, 1000vh)

- "the TTS way" label and "Say your first client is a dental office in Koreatown that answers the same emails all week.": a business brings a problem, the student solves it; labelled as an example. Both.
- The agent light driving from USC to a real dental office node near Wilshire and Western: the USC dot becoming the student's project. Both.
- The glow growing from that point to fill the screen in the film's ground colour (#F4EFE6), about 20% of a screen: the dive, so the film arrives through the city with no cut. Both.
- The rack focus out of the flat field, the film's first 22 frames in about 13% of a screen: the camera finding the machine inside the point. Under half a screen together with the dive, per the 2026-10-09 brief. Both.
- The clay machine film: 375 frames rendered at 2560x1440 (1440x2560 on phones), drawn on a canvas at the screen's own pixels from the one followed scroll, the two nearest frames blended so a slow scroll still moves; a low set loads first so it is never blank, the sharp set stage by stage. It replaced a 1280x720 video seek that Caleb called "blurry asf". Both.
- The film's grain, stepping 12 times a second while the film shows: the grain the render used to bake in, now drawn live at device pixels; it is the ambient loop that keeps a parked reader from seeing a frozen frame. Off under reduced motion, where the film is a still of the whole machine. Both.
- Five captions, each with a mono label naming the skill or tool, varying in place: what you learn at each stage. S.
- Cream halo behind each caption: readable over the moving film without a box. Both.
- "x-ray" button, top right, with a red hairline that sweeps across it every 3.2s while the film fills the screen and the x-ray is closed (still under reduced motion): says there is something to drag. Both.
- X-ray views (the tagged week, the Clay table, the qualifying prompt, the first email and its prompt, the CRM workflow, the lesson plan, the manim clip for each): proof the work is real and teachable. Both.
- The film drawing back into a point of light: the machine returning to the city. B.
- "Then you teach the office to run it without you.": the deliverable is something running. B.

## 3. The doors (cardinal world)

- The cardinal raining in while the film closes (the doors rise under the film's last half screen, so the closing point never sits on an empty cream screen): the ending. Both.
- "I'm at USC. Teach me to build that." with the email field, "applications open soon. Follow us on Instagram": Tyler's student door at the bottom of the story. S.
- "I run a business. Book 30 minutes with Caleb.", Calendly in a new tab: Tyler's business door. B.
- Footer strip, as on home. Both.
