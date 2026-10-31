# portfolio-cases

Lightweight interactive reconstructions of commercial portfolio cases. The repository is private; the built cases are public on their own host, so everything a visitor sees and every line of code must read as written by a careful senior engineer, not generated. Reply to the owner in Russian; code, comments and commit messages in English.

## NDA: the one rule that cannot bend

Every case is written from scratch. No code of the original commercial projects may enter this repository.

- Allowed references, read-only: `~/projects/portfolio-mocks/<slug>/README.md`, `~/projects/portfolio-mocks/screenshots/<slug>/portfolio-ready/*.png`, `~/projects/maxim-portfolio/src/data/projects.ts`.
- Forbidden: opening, copying or paraphrasing anything under `~/projects/portfolio-mocks/<slug>/src`, `build-mock`, `dist`, `scripts`, `audit`, or any other client source tree. Do not reproduce their component names, file layout, CSS class names or API shapes.
- All data, names, brands, phones and addresses are fictional. Fictional brand names already used in the README of a stand may be reused. Phones only as masked `+0 (***) ***-**-NN`.
- No network at runtime: no CDN fonts, images, analytics, maps or APIs. Fonts are self-hosted through `@fontsource/*` imports (cyrillic and latin subsets only). Visuals are CSS, inline SVG or generated locally.
- `npm run scan` must pass. Its denylist lives outside the repository on purpose; never copy client names into the repository, not even into tests or comments.

## Layout and contract

- `packages/demo-kit`: shared runtime. Use it, do not fork it. `createCase(manifest)` returns `{ store, demo, embedded, boot, reset }`.
- `apps/<slug>/case.json`: `slug` (equals folder name), `device` (`phone` or `desktop`), `title` ru/en, `scenarios` (id, `path` as `#/…`, title ru/en), optional `budgetKb`.
- Entry: `const kit = createCase(manifest); await kit.boot(); mount(...)`. `boot` handles `?reset=1`, mounts the shared «Демо» panel with reset when the case runs standalone, and inside the portfolio frame announces `ready` to the host and answers its `hello`. Do not build another demo panel.
- Routing: hash only (`#/path`). Every scenario `path` must open the right screen directly on a fresh load, without login walls. A fake sign-in may exist as a scenario, never as a gate.
- Persistence: only `kit.store` (keys are auto-prefixed with the slug). Never touch `localStorage`, `sessionStorage` or IndexedDB directly; for IndexedDB use `kit.store.database(name)` as the database name.
- Fake backend: wrap every data call in `kit.demo.request(resolve)`, which answers after a short pause, so screens show a real loading state.
- `index.html` has `<meta name="robots" content="noindex">` and `lang="ru"`.
- Copy `apps/prize-randomizer` as the reference for structure (case.json, package.json, tsconfig.json, vite.config.ts, index.html, src/main.ts).

## Stack and weight

- Allowed runtime deps: `react`, `react-dom`, `wouter` (with `useHashLocation`), `vue`, `@cases/demo-kit`, and the `@fontsource/*` package assigned to the case. Nothing else. Do not run `npm install`; everything is already installed at the root. If a case truly needs another package, stop and report it.
- Framework per case follows the resume stack: React for React and Next.js cases, Vue for Vue cases, plain TypeScript where the original was jQuery.
- Budget: 150 KB gzip JS per case unless `case.json` sets `budgetKb` with a reason in the report.
- TypeScript strict, no `any`. Plain CSS with custom properties for colors, spacing, radii, type; no CSS frameworks.

## Code structure

- Prettier is the formatter (`.prettierrc.json`, width 100). Run `npx prettier --write apps/<slug>` before reporting. No line over 100 characters, no hand-packed one-liners.
- Split by responsibility: `src/main.*` boots, `src/app.*` holds routing and the shell, one folder per screen or feature under `src/features/<name>/`, domain logic and fake API in `src/domain/` (pure, framework-free), shared UI pieces in `src/ui/`, icons in `src/ui/icons.*`. A component file stays under ~200 lines; a function does one thing.
- Names say what things are; no `data2`, `handleClick2`, `misc`, `utils` dumping grounds.
- Comments only where the reason is not obvious from the code. No section banners, no narration of what the next line does.
- No dead code, unused exports or leftover experiments.

## No AI traces

The owner rejects anything that reads as machine-made. These are bans, not preferences:

- No eyebrow or kicker labels above headings (small uppercase or letter-spaced lines like «МАСТЕРСКАЯ / УПРАВЛЕНИЕ КОНТЕНТОМ», «ИГРА КЛУБА / 01»). The heading stands alone.
- No section numbering (01, 02 / 03) unless the order itself is information the user needs, like steps of a checkout.
- No slogan headings on working screens. A screen is titled by what it is, as in a real product: «Вакансии», «Воронка», «Мои чеки», «Каталог». Marketing copy only where the product itself is a storefront, one plain sentence, no two-part contrasts («Меньше рутины. Больше вашей работы.», «Ваш чек. Ваши баллы.»), no colored period after a heading.
- No explanatory or reassuring copy that the interface already shows: no «Как это работает» blocks, no «Прозрачная механика», no descriptions of the demo itself inside the product, no taglines in sidebars («Хорошие команды начинаются с людей»). Delete such text, do not rephrase it. State, error and empty messages stay, short and factual.
- No dot separators « · » in visible text, no em dashes in UI copy, no decorative unicode (✦ ✧ ★ ✨), no emoji as icons.
- No hero-metric template (big number, small label, sparkline), no sparklines or progress rings as decoration, no soft-shadowed rounded rectangles standing in for content, no sketch-style SVG illustrations. Geometric product art (simple package shapes, map geometry) is fine.
- Cards only where an item is a card in the product (a product, a candidate); not as the page skeleton, never nested.
- One elevation per surface: border or shadow, not both. Card radius 12–16 px; pills only for small controls.
- Theme the browser surfaces: `::selection`, caret, focus ring, scrollbar, tabular numerals in tables and money.
- Landing and redesign skills (`landing-page-design`, `redesign-existing-projects`) carry their own design values: fonts, hero text gradients, glass island navigation, scroll reveals, a tagline section, 700 ms transitions. None of them apply here; the case palette, type and motion come from its own brief. Use those skills only for their audit lists, and only where this file does not say otherwise. Text checks live in `.agents/skills/case-copy`.

## Quality bar

A recruiter opens the case inside a portfolio window and must understand it without instructions.

- 2…4 key scenarios from the stand README that show the engineering idea of the project, fully working end to end (create, edit, filter, persist after reload, export where relevant). Depth over breadth.
- Distinct product character per case through the assigned palette, type and density, coherent inside the case: one type scale, one spacing scale, consistent buttons and states.
- States: loading, empty, error with retry, success feedback, disabled while pending. Skeletons follow the shape of the content they replace.
- One primary button per screen or dialog; the rest are secondary or text actions.
- Every screen has a way back: navigation, a back link or a link from the 404 to a real screen.
- Headings use `text-wrap: balance`, running text `text-wrap: pretty`, so no word hangs alone on the last line.
- Layout works at 375 px and 1440 px without horizontal scroll; touch targets at least 44 px on phone.
- Accessibility: semantic landmarks, labels on inputs, visible focus, `aria-live` for async results, keyboard reachable dialogs with Escape.
- Russian UI text, short and plain.

## Checks before reporting

Run from the repository root and include the output tail in the report. Other cases may be in progress in parallel; check only yours:

```
npm run typecheck -w apps/<slug>
npx prettier --check apps/<slug>
node scripts/build.mjs <slug>
npm run scan
```

Work only inside `apps/<slug>`. Do not edit the root, `packages/`, `scripts/` or other apps; if they block you, report it. Do not commit.

## Report

Final message in Russian: scenarios with their `#/` paths, what persists, JS size, check results, and anything left open.
