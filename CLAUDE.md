# custompc

PC builder for the Brazilian market: prices in R$, Brazilian stores,
compatibility checks. Portfolio project, public repo `sugixp/custompc` (MIT).

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
  `npm run typecheck`, `npm test`; for UI changes also `npm run build` and
  the E2E suite.
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

E2E and screenshots run against a production build on port 3100. The
offer specs also need some offers aged by a test provider (a later
`db:seed` makes them fresh again); Playwright starts a second server on
3101 with an unreachable database for the error-page spec:

```bash
PRICE_PROVIDERS=./e2e/fixtures/aged-offers.ts npm run prices:sync
npm run build && npm run start -- -p 3100   # in another terminal
npm run test:e2e
npm run screenshots                          # writes docs/screenshots
```

Next.js 16 with Cache Components: read `node_modules/next/dist/docs/`
before using an API you are unsure of.
