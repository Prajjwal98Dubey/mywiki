# MyWiki — client

React 19 + Vite + Tailwind v4 frontend. See `../PROJECT_SPEC.md` and `../FRONTEND_PLAN.md`.

```bash
npm install
npm run dev      # http://localhost:5173 (proxies /api and /uploads to :5000)
npm test         # vitest
npm run lint
npm run build
```

## Backend

By default the dev server proxies `/api` and `/uploads` to the backend at `http://localhost:5000`
(start it with `npm run dev` in `../server`; `npm run seed` there adds a demo user
`demo@mywiki.local` / `demo12345` and demo pages).

### Mock API (no backend)

Set `VITE_USE_FIXTURES=true` in `.env.development` to serve every `/api` call from an in-memory
fake (`src/api/mock.js`, seeded from `src/fixtures/samplePage.json`). Log in with
`demo@mywiki.local` (any password) to own `Jane_Doe`. Data resets on reload.

## Two designs, one app

- **App pages** — home, log in, create account, my pages, wizard, search, 404 — use MyWiki's own design
  (`src/components/app/`, `src/styles/app.css`, fonts Inter + Fraunces). Rendered inside `AppLayout`.
- **Wiki pages** — `/:slug`, `/:slug/history`, `/:slug/revisions/:revId` — are the Wikipedia (Vector 2022) clone
  (`src/components/layout/`, `src/components/article/`, `src/styles/wiki-content.css`). Rendered inside `WikiLayout`.

Page URLs live at the root: `/sam-singh`; a duplicate name gets a random suffix from the server, e.g.
`/sam-singh-1rqdasr3r` (PROJECT_SPEC §6.4). Old `/wiki/...` links redirect. A new top-level route must be added to
`RESERVED_SLUGS` in `src/lib/slug.js` and to the spec (a test enforces the first part).

## Status

| Phase | State |
|---|---|
| F1 Shell (tokens, layout, header, appearance bootstrap) | done |
| F2 Article renderer (WikiLite parser, infobox, TOC + scroll spy, references) | done |
| F3 API + auth (client, AuthContext, login/register, personal tools, RequireAuth, not-found) | done |
| F4 Wizard (`/create`, `/:slug/edit`: 6 steps, live preview, autosave, upload, conflicts, leave guard) | done |
| F5 History & discovery | main page, random, my pages done; history, revision view, search page pending |
| F6 Previews & appearance | appearance done; hover previews pending |
| F7 Polish | sticky header pending |
