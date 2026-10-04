# DESIGN-tc: the deny list for T Combinator

Direction A from DIRECTIONS-tc.md, the scoping sheet. Everything here is
scoped under `.tc-root` in `app/tc/tc.css`. Where this file disagrees with the
repo-wide `DESIGN.md`, this file wins for `/tc`.

## Denied, and grep-able

| Denied                                      | Why                                                                                    | Check                                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Any serif face                              | TTS owns the serif; two sites must not share type                                      | `grep -n "serif" app/tc components/tc` finds only the fallback stack `sans-serif` |
| Any monospace, any uppercase tracked kicker | the USC terminal default, and Lemma's mono plates                                      | `grep -n "mono\|uppercase" app/tc components/tc` returns nothing                  |
| Cards, card grids, drop shadows             | the sheet is rows on hairlines                                                         | `grep -n "box-shadow" app/tc/tc.css` returns nothing                              |
| Inline `style=`                             | everything lives in tc.css under `.tc-root`                                            | `grep -n "style={" app/tc components/tc` returns nothing                          |
| Orange                                      | reads as Y Combinator's brand; the RSO office said not to imply affiliation            | no `#f6`/`#ff6` oranges in tc.css                                                 |
| Purple, gradients, glass, blobs             | median generated page; hard line 5                                                     | none in tc.css                                                                    |
| Logos other than the founder's own          | no signed clients                                                                      | only `company.logo` renders an `<img>`                                            |
| A number not in POSITIONING.md or people.ts | hard line 1                                                                            | read the copy                                                                     |
| `rem` units                                 | globals.css sets `html { font-size: 120% }`, which would resize this site from outside | `grep -n "rem" app/tc/tc.css` returns nothing                                     |

## Type

One family: **Archivo**, variable, `wdth` 62 to 125 and `wght` 100 to 900.
Width carries the hierarchy, so display never goes heavy.

| Token      | Size (px, fluid) | Width | Weight | Line height | Use                                         |
| ---------- | ---------------- | ----- | ------ | ----------- | ------------------------------------------- |
| `--t-hero` | 44 to 96         | 125   | 560    | 0.98        | one h1 per page                             |
| `--t-h2`   | 32 to 52         | 118   | 540    | 1.04        | section heads                               |
| `--t-h3`   | 22 to 27         | 100   | 600    | 1.2         | row heads                                   |
| `--t-lead` | 19 to 23         | 100   | 400    | 1.45        | the first paragraph of a section            |
| `--t-body` | 17 to 18         | 100   | 400    | 1.6         | prose, never below 16                       |
| `--t-note` | 14 to 15         | 100   | 450    | 1.45        | margin labels, the source of a filled value |

Ratios between adjacent steps are 1.2 or more. Margin labels are sentence
case at normal tracking. Prose stops at 62ch.

## Colour, by role

| Role                               | Value                           | Contrast on ground                    |
| ---------------------------------- | ------------------------------- | ------------------------------------- |
| ground                             | `#121413`                       |                                       |
| band (alternate rows of the sheet) | `#181b19`                       |                                       |
| field (inputs)                     | `#1f2320`                       |                                       |
| hairline / strong hairline | `#2b302c` / `#3d433e` | decorative only, 1.8:1 |
| control edge (inputs, secondary button) | `#6b726b` | 3.2:1 on the field, WCAG 1.4.11 |
| ink | `#eef0ea` | 16.1:1 |
| ink-2 | `#b3b8af` | 9.2:1 |
| ink-3                              | `#8b9188`                       | 5.7:1                                 |
| **fill** | `#d6f25e`, text on it `#121413` | 14.7:1 for the text |
| error | `#ff8f80` | 8.4:1 |

**The accent has one meaning: this value was read from your company's
listing.** It appears as a highlighter stroke behind a value (`.tc-fill`) and
nowhere else: not on buttons, not on links, not on the focus ring, not in the
brand mark. Enforced by `grep -c "var(--fill)" app/tc/tc.css`, which should
only hit the `.tc-fill` rules and the lookup's preview of a company.

The CTA is paper (`--ink` ground, `--ground` text). The focus ring is ink.

## Space

4, 8, 12, 16, 24, 32, 48, 64, 96, 144: 8 to 16 inside a row, 24 to 32
between rows, 96 to 144 between sections, and a `clamp(16px, 5vw, 48px)` gutter.

## Shape

Radius 2px on controls and the field, 0 on everything else. No pills.

## Layout grammar

A two-column sheet: a 208px margin column (168px under 1024) holds the row label in
`--t-note`, the content column holds the value. Rows are separated by one
hairline. Below 760px the margin label stacks above its value, and no section
is centred at any width.

## Motion budget

- **Load clock (timed):** fills sweep in from 280ms after mount, each
  highlight a `scaleX` 0 to 1 over 420ms on `cubic-bezier(0.2, 0.7, 0.2, 1)`,
  staggered 70ms, capped at 2,200ms total. Text under a fill is in the HTML
  from the first byte; only the highlight animates.
- **Scroll clock:** one value, page progress 0 to 1, computed once per frame,
  drives the margin progress rule's `scaleY`. Nothing else is scroll-linked.
- **Ambient:** one loop, on `/tc` only: the lookup cycles a real company from
  the index every 3.2s to show what the brief would read. Pauses offscreen,
  on a hidden tab, while the visitor types, and does not run at all under
  reduced motion.
- **Response:** hover 120ms colour, press `scale(0.98)` 100ms, focus ring 2px
  ink offset 3px. Hovers gated behind `(hover: hover) and (pointer: fine)`.
- Transform and opacity only, with one exception: the highlighter sweep
  animates `background-size`, because a highlight that wraps across lines
  cannot be one transformed box. No `transition: all`.
- Reduced motion lands on the filled, finished state.
