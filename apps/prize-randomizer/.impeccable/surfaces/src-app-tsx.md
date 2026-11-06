---
version: 1
slug: 'src-app-tsx'
primary_target: 'src/App.tsx'
related_targets:
  ['src/styles.css', 'src/features/result/DrawResult.tsx', 'src/features/journal/DrawJournal.tsx']
---

# Prize draw workspace

## Scope

Desktop Operate surface for the raffle host, with mobile support from 320 px. Implement the approved stage sketch in src/App.tsx, src/styles.css and the result/journal components. Keep the existing local draw, persistence, category routing, retry, undo, export, cross-tab exclusion and reveal synchronization.

## Direction contract

THESIS: One complete raffle workspace: the current ticket and winner belong together; the protocol remains visible beside the action.
OWN-WORLD: Onest, dark ground #0c1018, quiet surface #1a202b, paper ink #f3efe4, muted #9aa6b8 and amber #f6b64a for the main action and current result. One common ticket window contains six animated reels; no separate rounded digit tiles or ornamental seams.
STORY: Choose a pool, run the draw, reveal the ticket and winner together with the journal entry, then export or undo. Errors preserve prior results and expose retry.
FIRST VIEWPORT: At 1440x900 the header is 80 px high with a small ticket mark and product title. The content begins 38 px below, with 48 px side gutters. A large left stage and a 416 px right protocol are separated by 48 px. Category navigation sits above the unified ticket window. Winner text is prominent and its space is stable. One compact 240x48 primary action and a quiet undo sit below. History rows are around 72 px with number, name, category and time. Follow /Users/deadins/.codex/visualizations/2026/11/02/01a19cad-520a-7ed1-a9fe-4be6e2f916f4/prize-product/mocks/decision/stage.html and the approved screenshot. On narrow screens use one column, four visible categories, readable serial number and winner, 44 px targets, and vertical scrolling without horizontal overflow.
FORM: Approved surface concept stage, user approval in chat; seed:217f89c1b7cf007f. Code-led, approved HTML sketch /Users/deadins/.codex/visualizations/2026/11/02/01a19cad-520a-7ed1-a9fe-4be6e2f916f4/prize-product/mocks/decision/stage.html. Grounded product data comes from the current tickets.ts; the older PRODUCT.md pool description is stale and must not change runtime values.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints

No new packages, network calls, fictional metrics, slogans, explanatory paragraphs or changes to other cases. Category imagery uses three local generated product cutouts with provenance: lemonade, snacks and a non-alcoholic drink. Reuse these three images in the all-products category; do not add new prizes or product-selection mechanics. Keep visible text limited to product identity, categories, actual data, actions and necessary states. Loading/restored history/undo should not imitate a new draw; reserve reel animation for an actual draw. Respect reduced motion, focus, long names, empty history and failed storage.
