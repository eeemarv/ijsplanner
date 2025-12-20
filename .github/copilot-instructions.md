# Copilot instructions for ijsplanner

Summary
- **Big picture**: A SvelteKit single-page app (frontend) deployed to Cloudflare Workers (adapter-cloudflare) that talks to a Supabase backend (Postgres + Edge Functions). Internationalization uses Paraglide (Inlang) with generated runtime under `src/lib/paraglide`.

Quick-start commands
- Install & dev: `npm install` then `npm run dev` (Vite development server)
- Build / preview: `npm run build` then `npm run preview` (used by Playwright e2e)
- Check / lint: `npm run check` (svelte-check + sync), `npm run lint` (eslint)
- Tests: unit `npm run test:unit` (Vitest), e2e `npm run test:e2e` (Playwright), full `npm test`

Architecture & where to look (fast map)
- Frontend app: `src/` — routes in `src/routes/`, components in `src/lib/components/`.
- Auth & client: `src/lib/supabase.ts` (client creation) and `src/routes/+page.svelte` (simple auth example using `supabase.auth.signInWithPassword`).
- DB schema/types: `src/lib/database.ts` (supabase DB types — useful to understand table/column shapes).
- DB helpers: `src/lib/db/*.ts` (CRUD helpers; e.g. `insertTasks` in `src/lib/db/db-tasks.ts` — they call `supabase.from(...).insert()` and *throw* on error).
- Stores / UI state: `src/lib/stores/*.svelte.ts` — uses a project-specific pattern: `export const foo = $state(...)` and `SvelteSet` for set-like stores.
- i18n: `project.inlang/` is authoritative; Paraglide generates code to `src/lib/paraglide/` (gitignored). Use the Inlang/Paraglide tool to alter translations rather than editing generated files.
- Edge functions: `supabase/functions/*` — Deno-based functions (see `supabase/config.toml`) that send emails (Brevo, MJML templates) and use `Deno.env` for secrets.
- Deployment: SvelteKit uses `@sveltejs/adapter-cloudflare` and `wrangler.jsonc` for Cloudflare; Supabase functions are configured via `supabase/config.toml` (deploy with Supabase CLI / cloud).

Important conventions & patterns (do not assume defaults)
- Generated vs authored files: **Do not edit `src/lib/paraglide/*` by hand** — edit `project.inlang/*` and run the plugin. Those generated files are excluded in `.gitignore`.
- Store naming: Many stores use `.svelte.ts` extension (not `.ts`) and rely on a `$state` reactive macro. Look at existing stores for examples.
- Error handling: DB helper functions typically `throw` on `supabase` errors — UI code expects to catch and show `errorMessage` in `$state` variables.
- Tests are split into two vitest projects: *client* (browser, Playwright provider) and *server* (node). See `vite.config.ts` test configuration and `vitest-setup-client.ts`.

Environment & secrets (what to set locally)
- Frontend runtime: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (used by `src/lib/supabase.ts`)
- Server/Edge: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (used in `supabase/functions/*`); email functions also need Brevo API keys and other secrets — check `supabase/functions/*/index.ts` for exact variable names.
- Tests & e2e: Playwright runs a preview (`npm run build && npm run preview`) — ensure a seeded/test Supabase or mocks available for stable e2e behavior.

Testing tips
- To run e2e locally: `npm run build && npm run preview` then `npm run test:e2e` (Playwright spawns a webServer using the preview command and port 4173 per `playwright.config.ts`).
- If tests fail due to missing env vars, prefer adding a local `.env` or using a test Supabase project; unit tests can mock Supabase interactions.

Files that are especially useful to open when working in the repo
- `package.json` — scripts and dev deps
- `vite.config.ts` — Paraglide plugin + vitest client/server setup
- `svelte.config.js`, `wrangler.jsonc` — Cloudflare deployment
- `src/lib/supabase.ts`, `src/lib/database.ts`, `src/lib/db/*` — DB flow and types
- `supabase/config.toml` and `supabase/functions/*` — server functions, templates, deno.json
- `src/lib/stores/*` — local store patterns and `$state` usage

PR/Code guidance for Copilot agents
- Keep changes minimal, self-contained, and run `npm run lint` & `npm run check` before proposing changes.
- When modifying translations: update `project.inlang` and run the build step to regenerate `src/lib/paraglide` rather than editing generated files.
- When introducing DB column/table changes: update usage sites and the DB types (`src/lib/database.ts`) if applicable, and add/adjust tests.
- For email templates, edit the MJML templates under `supabase/functions/*` and check the respective `index.ts` for rendering details.

If anything above is unclear or you'd like more examples (e.g., sample PR diffs, additional test guidance, or a checklist for deploying functions), tell me which section to expand and I will iterate. ✅