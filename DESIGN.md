# Design system for usctts.com and T Combinator

Extracted 2026-09-22 from a survey of every USC tech, consulting and venture
club site, plus the published design systems of Linear, Warp, Cursor, Resend
and Railway. Rules, not adjectives. Each one is violable and each one says what
breaks if you violate it.

## The finding that sets the direction

Dark, monospace and terminal is now the USC default rather than a way to
stand out. TroyLabs (`#0a0a0a`), LavaLab (`oklch(0 0 0)`), ProductSC (`#08070b`) and
Blockchain@USC are all already there, and Blockchain@USC has specifically taken
the terminal aesthetic: `● 01 / ABOUT`, `README.md`, `TREASURY_LOG`,
`SYS.LOG_v2.4`, `TEAM_ROSTER`. Shipping a dark monospace club site puts TTS
fifth in a queue.

So the two sites split, and neither one is a dark terminal:

- **TTS** is warm and editorial: a near-white canvas, oversized serif display,
  and one mechanical element that actually runs. The only light site in the
  category that does not look like a Squarespace template.
- **T Combinator** is warm dark, closer to Cursor's `#14120b` than to true
  black, and earns its confidence by naming things rather than by moving.

## What nobody at USC does

Across fourteen club sites, not one publishes all five of: a named client, a
dated engagement, a stated deliverable, a measured outcome, and a live
recruiting calendar. Nobody publishes an acceptance rate either. A page
carrying all six is the only one on campus, and that is a content decision, not
a visual one. It is the actual differentiator; the typography is just how it
gets dressed.

## Typography

1. **Two families, three only if the third is mono in a strict lane.**
   Instrument Serif is already in `public/fonts` and is OFL. Display is serif,
   body is a grotesk, mono appears only in data and labels and never in prose.
2. **Display weight stays between 400 and 600. Never 700 or above.** Warp,
   Cursor and Supabase all name heavy display type as the loudest amateur tell.
   The current site sets its H1 in `font-black`, which is 900.
3. **Negative tracking scales with size.** Linear's 80px display runs -3.0px.
   Large text gets tighter tracking and tighter leading; small text gets looser.
4. **Body never below 16px.** Below that iOS zooms the viewport on focus.
5. **Line length around 70 characters.** The current site's prose runs the full
   container width in places.
6. **Hierarchy comes from family or color, never from bumping body weight.**

## Color and depth

7. **Not pure black, not pure white.** The current TTS site is `#ffffff` with
   gradient blobs behind it, which is the AI-default signature.
8. **One accent, in at most four named places:** brand mark, primary CTA, focus
   ring, link emphasis. A second chromatic accent is what makes a page look
   generated.
9. **No drop shadows.** Depth comes from a four-step surface ladder plus 1px
   hairlines. This is the fastest way to make a page read expensive, and it
   removes the reason anyone reaches for a gradient blob.
10. **Buttons are 6 to 8px radius.** Uniform 16px radius and pill CTAs
    everywhere are the generated look.

## Motion

11. Interaction animations run under 200ms and entry animations under 300ms,
    they animate `transform` and `opacity` only, no more than two run
    concurrently on a screen, and every one of them is gated behind
    `prefers-reduced-motion`.
12. **Any animated headline or count-up renders its final value in static
    HTML.** Found empirically, three times in one afternoon: Blockchain@USC's
    H1 ships as "Pioneering the Future of" with nothing after it, Wiz serves
    "0% of customers achieve 0 criticals", and Code the Change's production H1
    is the literal word "UNTITLED". Crawlers, screen readers and link previews
    all see the broken state.

## Proof

13. The proof unit is a named party plus a specific number, never a logo.
14. **A logo you cannot attach an engagement to does not go on the page.** This
    is BTG's and ICC's whole failure: BTG's eight "past clients" are Google
    Images files with empty alt text, filenames and all. Do not inherit it.
15. **Every case study carries a date.** RISE, BTG and 180DC each lost their
    credibility to undated or five-year-old proof more than to bad copy.
16. **Name a real person with a title**, the way Cursor runs "Diana Hu, General
    Partner at Y Combinator" instead of a headshot grid.
17. Every claim has to be checkable by the reader. "50+ Active Members" reads
    as filler because nobody can verify it, ourselves included, whereas "we
    placed 3 USC builders into YC companies this semester" can be verified and
    lands harder for that reason. A sentence that could move to another club's
    site unchanged gets cut on the same principle, and "Technology for
    Everyone" fails that test outright.

## How to attack the consulting clubs

The line is "consultants don't do jack" and it needs aiming, because said
loosely it gets quoted back. The sourceable version:

Across every consulting-shaped org at USC the deliverable vocabulary is
*recommendations*, *strategic plans*, *actionable strategic recommendations*,
*insights into practical solutions*. **Not one uses built, shipped, launched or
deployed.** LACI claims 250+ projects and names one organization. 180DC claims
80+ on its homepage, 40+ on its projects page and 50+ on its services page, and
reports a dollar outcome on one. ICC names fourteen brands and describes its
method as "getting you where you need to be."

So the claim is not that consulting clubs produce nothing. It is that almost
every one of them sells a logo wall instead of an outcome, and the two orgs on
campus that break the pattern are not consulting clubs at all. That is
defensible line by line.

**Attack the format, never a named USC organization.** TTS is mid-push to
become an RSO, and the house rule from `pro-bono-post` already covers this:
punch at the experience, never at the people.

## Performance floor

LCP under 1.5s, CLS under 0.05, INP under 100ms, page weight under 3MB.
