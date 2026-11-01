# Agent Workshop

An independent React reconstruction with fictional content. Uses the shared demo-kit and runs without external services, fonts, images, or AI calls.

## Scenarios

- `#/catalog`: combine search and category filters, change sorting, open an agent detail page.
- `#/request/meeting`: validate a demo request, save it, then view it at `#/editor/requests`.
- `#/editor`: edit an agent, an article, or page SEO; save a draft, preview it, and publish. Unsaved changes disable preview and publishing.
- `#/materials`: open the published articles.

Drafts and published content use separate snapshots in `kit.store`. Publishing updates the current tab through a local event and other tabs through the browser storage event. A rebuild is not required. Page titles and descriptions follow the published snapshot; SEO fields have a search snippet preview. All routes keep `noindex`.

Requests, drafts, and publications survive reloads. The shared demo panel resets this case. Failed mutations keep the current input and offer retry. The request form accepts fictional email addresses in the `example.invalid` domain.

## Checks

Run from the repository root:

```sh
npm run typecheck -w apps/ai-agents-marketplace
node scripts/build.mjs ai-agents-marketplace
```

The application has responsive layouts for narrow and desktop viewports, labeled controls, visible focus, live status messages, and native dialogs with Escape support. A browser session is needed to verify the rendered layout and native keyboard behavior.
