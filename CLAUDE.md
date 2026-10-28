# custompc

PC builder for the Brazilian market: prices in R$, Brazilian stores,
compatibility checks. Portfolio project, public repo `sugixp/custompc` (MIT).

**State:** Phase 1 (MVP) closed on 2026-10-28 and paused. Demo at
https://custompc-builder.vercel.app (custompc-six.vercel.app also works).
Next steps, in order, are in STATUS.md: owner checks store links, BIOS
scenario (waits for a hand-copied board list), Phase 2, affiliate idea.

**Read [docs/STATUS.md](docs/STATUS.md) first**: current stage, decisions and
their reasons, next steps. Architecture: [docs/architecture.md](docs/architecture.md).
Compatibility rules: [docs/compatibility.md](docs/compatibility.md).

@AGENTS.md

## Conventions

- UI text in pt-BR; code, identifiers, comments and commits in English.
- Conventional Commits with a scope (`feat(builder): …`, `fix(ui): …`,
  `docs: …`, `test(e2e): …`, `ci: …`), small commits, a body explaining why
  when it is not obvious. Author `sugixp <sugisadao@gmail.com>`. Push to
  `main` after each finished step.
- Before every commit: `npm run lint`, `npm run format:check`,
  `npm run typecheck`, `npm test`; for UI changes also `npm run test:e2e`
  (it builds).
- Numbers carry their unit in the name (`lengthMm`, `tdpW`, `speedMts`);
  money is integer cents (`priceCents`), formatted with `formatBRL`.
- Never invent part specs. Take them from the manufacturer page, keep the
  URL in `specSourceUrls`, leave optional fields out when unstated.
- Nothing business-sensitive in this repo: no real price collectors, store
  integrations, affiliate ids or keys. Those implement `PriceProvider` in a
  separate private package.

## Import rules (ESLint enforces them)

- `src/domain` imports nothing from Next, React, Prisma or other `src/` layers.
- `src/pricing` reaches storage only through `OfferRepository`; no Prisma or
  `src/server` imports.
- `src/server/db.ts` is `server-only`; command-line scripts use
  `createPrismaClient()` from `src/server/prisma.ts`.

## Running it

```bash
npm install                 # also runs prisma generate
cp .env.example .env        # set POSTGRES_PORT/DATABASE_URL if 5432 is taken
npm run db:up               # Postgres 18 in Docker on POSTGRES_PORT
npm run db:deploy           # migrations
npm run db:seed             # example catalog + offers (idempotent)
npm run dev                 # http://localhost:3000
```

On the owner's machine a native Postgres holds 5432, so `.env` uses 5433.

`npm run test:e2e` needs only the Postgres from `db:up`. It builds, resets
a `custompc_test` database on the same server (migrations, seed, aged
offers), and starts its own servers: 3100 on that database with 5 parts
per listing page, 3101 with an unreachable database for the error page.
The development database is never touched; ports 3100 and 3101 must be
free. `E2E_SKIP_BUILD=1` reuses the last build.

Screenshots read the development database through a server you start:

```bash
npm run test:e2e
npm run build && npm run start -- -p 3100   # in another terminal
npm run screenshots                          # writes docs/screenshots
```

The README GIF and the home page video (`public/demo`) come from
`npm run demo:media` (needs `ffmpeg` on PATH), against the same server
or, with `SCREENSHOT_BASE_URL`, production.

Deploy (details in docs/architecture.md, "Deployment"): Vercel builds with
`vercel-build`, which migrates production and each preview's own Neon
branch (never production from a preview) and never seeds. Production data
comes from `npm run db:seed:prod` (reads `PRODUCTION_DATABASE_URL`) or the
"Seed production" workflow; prices from
the daily "Price sync" workflow. Both workflows use the
`PRODUCTION_DATABASE_URL` repository secret.

## Deploy and infrastructure

The agent runs the deploy through the Vercel CLI (`vercel`) and the Neon
CLI (`neonctl`, project `floral-field-87906490`, org
`org-misty-moon-54808836`) or the Neon MCP server when it fits better. The
demo answers at `custompc-builder.vercel.app` (a project domain) and
`custompc-six.vercel.app`.

- **Without asking:** read logs and status, preview deploys, create or
  change Preview and Development environment variables, create Neon
  branches for previews.
- **Ask first:** manual production deploys, changing Production variables
  (including the `PRODUCTION_DATABASE_URL` secret), running seed or sync
  against production, creating, recreating or deleting Neon projects or
  databases, changing regions, anything that costs money or leaves the
  free plan.
- **Never:** write tokens, passwords or connection strings into repo
  files, committed logs or commit messages. Pass them from
  `neonctl connection-string` straight to `vercel env add` or
  `gh secret set`.

Next.js 16 with Cache Components: read `node_modules/next/dist/docs/`
before using an API you are unsure of.
