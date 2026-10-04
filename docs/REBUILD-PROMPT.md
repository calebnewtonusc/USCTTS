# The rebuild prompt, TTS and T Combinator

Written 2026-10-03 after a week rebuilding uselemma.ai to within pixels. That
replica was never the goal. It was how we learned what a finished site takes,
and this prompt is where that learning gets spent. Two builders run it at
once, one per site, in this one checkout, with the file ownership below.

---

You are rebuilding ONE of two websites in `~/code/work/TTS-Dev`, a Next.js 16
app that serves both from one deployment. Your site is named in the line that
launched you. The other site is being rebuilt at the same time by another
builder. Read this whole file before opening an editor.

## What these sites are, and who reads them

Read `docs/POSITIONING.md` in full first. It is the source of truth for every
claim. In short:

- **TTS (Trojan Tech Solutions)** is USC's applied AI implementation club.
  It does real work for companies across engineering and GTM engineering, and
  every engagement ends with something running. Its reader is **a USC student
  deciding which club gets their semester**, comparing it in a tab against
  TroyLabs, LavaLab, ProductSC and the consulting clubs.
- **T Combinator** is TTS's founder-facing branch: USC builders taking real
  ownership of a role at a YC company, free, three companies a semester. Its
  reader is **a YC founder who just replied "more info" to a cold DM** and is
  60/40 on a twenty-minute call. The page has one job: close that gap.
  `/tc/for/<yc-slug>` already reads the founder's company from the yc-oss
  index, so the page can be about THEIR company the moment they open it. That
  is the one thing no other club can do. Make it the centre of the site,
  not a feature of it.

## The hard lines, written first

These are not style. Breaking any one of them is a failed build.

1. **No unsourced specific, anywhere.** Not "7 YC clients", not "50+
   members", not a dollar figure, not a client name, not an award. The
   sourced facts are in `docs/POSITIONING.md` and `data/people.ts`. If a
   sentence needs a number you cannot point to, write `[NEED: what]` in a
   code comment and leave the number out of the page.
2. **No company logo wall, no client names.** There are no signed clients on
   record.
3. **T Combinator carries the footer line "Not affiliated with, endorsed by,
   or sponsored by Y Combinator."** Never "the only YC club on Earth". The
   defensible line is "the only club at USC doing this".
4. **Attack the format, never a named USC organization.** Decks that never
   ship, members who leave before anything is implemented. Never TroyLabs,
   ProductSC or anyone else by name.
5. **Not a replica of anything.** Nothing from uselemma.ai: no instrument
   plates with mono labels, no brick wall of failures, no trace grid, no
   isometric voxel mark, no purple. The branch `wip/lemma-trace-grid` holds an
   attempt that did exactly that. Do not build on it.
6. **The two sites do not share a style.** Different type, different colour
   logic, different motion personality, different layout grammar. A visitor
   who toggles between them should feel two organizations that know each
   other, not one theme with two palettes.
7. **Caleb's own words where they exist.** Founder-facing copy that speaks
   in first person is his, from POSITIONING.md and the existing pages. Do not
   invent quotes from him or anyone.

## The method, in this order

**1. Research the craft before touching code (about 30 minutes).** Find three
excellent sites in your genre and one teardown by someone who builds them for
a living. For TTS that genre is studios, labs and student orgs that recruit
on their work, not on their vibe. For T Combinator it is pages that convert
a skeptical founder, such as an investor's or an accelerator's own site, or
a great outbound landing page. Extract RULES, not adjectives, and write them
to `docs/CRAFT-<tts|tc>.md` with the source next to each rule. Read
`~/code/chewbacca/crafts/web-ux.md` and `~/code/chewbacca/crafts/website.md`
in full. The second one is what a week on uselemma.ai taught, and most of
it is invisible in a screenshot.

**2. Generate three genuinely different directions, then choose by reader.**
Write each direction as half a page in `docs/DIRECTIONS-<site>.md`: its
stance, what it REFUSES (three to five refusals, because the refusals are
what make a system recognizable), its type pairing, its colour logic, its one
signature moment, and its motion personality. Make the three differ in
kind, not in shade. Then pick one by asking which one this reader, in their
situation, trusts fastest, and say why in two sentences. Taste is not the
reason. A serif display with one italic accent phrase, uppercase tracked
kickers over every heading, and thin outline buttons is the current median
"tasteful" generated page. Caleb called it slop on 2026-09-27. Do not land
there by default.

**3. Write `DESIGN-<site>.md` as a deny list before writing components.**
Include the type scale with numbers, a spacing scale, an accent with exactly
ONE meaning (enforced: grep for it), the surfaces, the radius and the motion
budget. The existing `DESIGN.md` has useful research on the USC landscape.
Keep what still holds and override what the new direction changes.

**4. Build all four layers, planned before any is built.** A screenshot judges
the first layer only.

- **Layout.** It must hold at 1440, 1024, 768 and 390, with no horizontal
  scroll at 390.
- **Choreography.** Choose a load clock (a timed entrance, under 2.5 s total,
  staggered) and scroll behaviour. Say which clock every motion runs on:
  timed or scroll-progress. Drive scroll-linked layers from ONE progress
  value, computed once per frame, and give each layer a fixed distance on one
  shared curve so they finish together. Check every transition at three
  points between start and end, not only the ends.
- **Ambience.** Plan what moves while nobody touches the page, and give each
  piece a reason it is there. It pauses offscreen and on a hidden tab, and
  holds still under reduced motion.
- **Response.** Every control gets hover, focus-visible and pressed, each a
  measurable change. Keyboard reach covers the whole page. Every link goes to
  a real page or a real external URL: no `href="#"`, ever. Forms validate and
  show a real success and a real error state.

**5. One signature per site, and it is the product demonstrated.** For T
Combinator that is the page assembling around the founder's own company. For
TTS it is something actually running: a thing that works, shown working, so
"every engagement ends with something running" is proven on the page rather
than asserted. Build one signature well before adding anything else.

**6. A removal pass.** Removing an element is free and always an allowed
answer. Make one pass whose only permitted move is taking something out.

**7. Verify with code, then with eyes.** These must pass:

    npm run lint && npx tsc --noEmit                    clean
    site-gate check <every route of your site>          exit 0
    site-gate idle http://localhost:3210<your root>     the ambient layer you planned is moving

Then screenshot every route at 1440 and 390 and LOOK at them: overlapping
text, empty sections, a heading colliding with buttons. The live site has
all three of those today. The pixels outrank every number.

## File ownership (hard: two builders share this checkout)

- **TTS builder:** `app/page.tsx`, `app/{about,apply,build,meetings,members,partner,work-with-us}/**`,
  `components/tts/**`, `components/{Navbar,SiteFooter,TTSAsterisk,TTSBreadcrumb}.tsx`,
  `components/meetings/**`, `app/globals.css`, `public/tts/**`, and
  `docs/{CRAFT,DIRECTIONS,DESIGN}-tts.md`.
- **T Combinator builder:** `app/tc/**`, `components/tc/**`, `public/tc/**`,
  and `docs/{CRAFT,DIRECTIONS,DESIGN}-tc.md`. Scope every style under the TC
  layout, so nothing in `globals.css` can change the TC page.
- **The lead owns everything else:** `app/layout.tsx`, `components/SiteToggle.tsx`,
  `components/site-toggle.css`, `data/**`, `lib/**`, `middleware.ts` and
  `package.json`. Need a dependency or a change in those? Put it in your report
  with the exact diff. Do not make it yourself.

The lead runs the one dev server at http://localhost:3210. Do not start
another (Next 16 locks the dev directory) and do not run `next build`. Do not
commit, push or deploy. The lead merges, builds once, reviews with a
separate verifier, and ships.

## Your report

- the direction you chose and why
- every route you built or changed
- `site-gate` output
- screenshot paths for every route at both widths
- the `[NEED:]` list
- any diff the lead must apply
- anything you could not verify
