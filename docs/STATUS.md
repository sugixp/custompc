# Status

Where the project stands, why it is built this way, and what comes next.
Last updated 2026-10-28, at the end of Phase 1 (stage 10).

## Where it stands

Phase 1 (MVP) is done: all 10 stages are on `main`, CI green:

| Stage | What                                                                 |
| ----- | -------------------------------------------------------------------- |
| 1     | Next.js 16 + strict TypeScript + Tailwind 4, ESLint/Prettier, Vitest |
| 2     | GitHub Actions CI                                                    |
| 3     | Domain: Zod schemas per category, money in integer cents             |
| 4     | Compatibility engine (20 issue codes) and power estimate             |
| 5     | Postgres 18 + Prisma 7, seed of 43 real parts with sourced specs     |
| 6     | `PriceProvider` boundary, `prices:sync`, offer freshness             |
| 7     | Catalog UI (listing with URL filters, part pages), Playwright        |
| 8     | Builder at `/montar`: URL state, live checks, totals, shareable link |
| 9     | E2E on its own database: keyboard, axe, offer age, errors, paging    |
| 10    | Deploy (Vercel + Neon), final README (PT/EN) with the builder GIF    |

Deployed at https://custompc-six.vercel.app (Vercel + Neon, São Paulo),
with example prices refreshed daily.

CI runs three jobs on every push: lint/format/typecheck/unit tests/build
(no database), migrate + seed + sync + idempotency on a fresh Postgres, and
Playwright E2E (desktop and Pixel 7) against a production build over its
own `custompc_test` database, plus a second server whose database is
unreachable.

## Decisions and why

- **Domain is pure TypeScript** (`src/domain`), with no Next, React or Prisma
  imports (ESLint enforces it). The compatibility rules are tested with
  plain objects, and the builder runs the very same `checkBuild` in the
  browser, so rules exist once.
- **Specs in one JSON column validated by Zod**, not a table per category:
  a small schema with strict types at the boundary. Rows are parsed on
  read, so bad data fails loudly.
- **Never invent specs.** Seed values come from manufacturer pages, with
  URLs in `specSourceUrls`. Unverifiable fields are optional and left out:
  board CPU support lists (vendors load them dynamically), PSU modularity,
  most cooler TDP ratings, AMD PPT. The i7-14700K was swapped for the
  i7-14700 because Intel only documents the box cooler of the latter.
- **Prices are illustrative** in this public repo. Real collectors and
  affiliate ids belong to a private package implementing `PriceProvider`,
  loaded only when listed in `PRICE_PROVIDERS`. Providers run in
  `npm run prices:sync`, never during a request.
- **Offer freshness:** fresh up to 7 days, stale (shown, flagged, out of
  totals) up to 30, then hidden. The sync never deletes offers.
- **One offer per part per store** (`@@unique([partId, storeId])`), a known
  limitation for marketplaces with many sellers.
- **Cache Components rendering:** anything reading the database,
  `searchParams` or the clock streams inside `<Suspense>`, so the build
  needs no database. Consequence: a `notFound()` inside a streamed page
  keeps status 200 (with `noindex`). Unknown categories get a real 404 from
  `src/proxy.ts`; unknown part slugs keep the 200. Making part pages
  blocking was tried and does not help: the layout shell still goes first.
- **Builder URL:** `?cpu=…&placa=…&ram=slug*2&disco=…`, quantities after
  `*` because slugs can contain `x` (`2x16gb`). Fixed parameter order, so a
  build has exactly one link. Bad items are dropped with a notice.
- **Prisma pinned to 7.10.1:** npm's `latest` tag points at a Prisma 8
  release candidate. npm 11 blocks install scripts; `allowScripts` in
  package.json allows Prisma's, pinned to that version.
- **E2E has its own database.** `e2e/global-setup.ts` drops and recreates
  `custompc_test` on the `DATABASE_URL` server (it refuses any name not
  ending in `_test`), then migrates, seeds and ages offers, so
  `npm run test:e2e` works alone and never touches development data. Web
  servers are never reused, so a dev server on 3100 cannot be tested by
  mistake. Playwright starts the servers before the global setup; that is
  fine because they connect on the first page request.
- **E2E data comes through the real paths.** Stale and expired offers come
  from a test-only `PriceProvider` (`e2e/fixtures/aged-offers.ts`) run by
  `prices:sync`, not from rows written by the tests; it ages only coolers,
  which no other spec prices. The error page is tested on a second
  `next start` of the same build with an unreachable `DATABASE_URL`.
- **Page size from `CATALOG_PAGE_SIZE`** (default 12, read at request
  time). The E2E server uses 5, so the 6 seed CPUs span two pages without
  inventing parts.
- **Picker focus:** it opens on the search box, and after the first pick
  of a single-part slot focus goes to that slot's "Trocar" (the opener is
  gone). Found by the keyboard E2E.
- **Deploy flow:** Vercel (`gru1`) + Neon (`sa-east-1`), both São Paulo.
  Deploys only run migrations, never seed; seeding is a manual command or
  workflow, prices sync daily from GitHub Actions with the direct URL in
  the `PRODUCTION_DATABASE_URL` secret (workflows run only on schedule or
  by hand, never on pull requests). Each preview gets its own Neon branch
  `preview/<git-branch>` from the Vercel integration and migrates it; a
  host check in `vercel-build` keeps previews off the production branch.
  The first Vercel build failed with P2028: 172 single-row upserts to Neon
  ran past the 5 s transaction timeout, hence batched upserts. Details in
  docs/architecture.md, "Deployment".
- **Visual direction** (chosen by the owner): dark "night panel" with
  datasheet typography: IBM Plex Sans/Mono, tabular figures, one lime
  accent `#b6f23a`, spec rows with dotted leaders. All text colors clear
  WCAG AA (lowest pair 6.4:1).

## Next steps

1. **BIOS-update scenario on real parts** is still missing. ASUS, MSI and
   Gigabyte block automated access to CPU support lists; it needs a list
   checked by hand (or a PDF) before `supportedCpus` can be filled.
2. **Check the store search links by hand** in a browser. Only KaBuM!
   answered `curl`; Amazon, Mercado Livre, Pichau and Terabyte block bots.
3. **Phase 2**: sign-up/login (Auth.js: email + hashed password, Google,
   GitHub), saved builds and favorite parts, privacy policy page (LGPD,
   minimal user data).
