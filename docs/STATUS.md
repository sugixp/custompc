# Status

Where the project stands, why it is built this way, and what comes next.
Last updated 2026-10-28, at the close of Phase 1 (paused here).

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

Live at https://custompc-builder.vercel.app (Vercel + Neon, São Paulo;
custompc-six.vercel.app also works), with example prices refreshed daily.
After stage 10 came the home page demo video, the processor icon and site
mark, and share images (Open Graph) for every page and shared build.

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
  WCAG AA (lowest pair 6.4:1). The mark is an original processor glyph
  (`ChipMark`), also the favicon (`app/icon.svg`, on a dark tile) and the
  Apple touch icon.
- **Demo address:** `custompc-builder.vercel.app`, chosen by the owner
  (`custompc.vercel.app` belongs to someone else); `custompc-six` still
  works. `SITE_URL` fixes it on every Vercel deploy, because
  `VERCEL_PROJECT_PRODUCTION_URL` would keep the older, shorter domain.
- **Share images (Open Graph):** generated with `ImageResponse` in the
  site's look, IBM Plex embedded from `assets/fonts` (WOFF from IBM's npm
  packages under the OFL; `ImageResponse` cannot read the WOFF2 that
  `next/font` serves). A default image (also the X image), one per category
  and part with the current "a partir de" price, and one per shared build
  at `/montar/imagem?<query>` with CPU, GPU, total and compatibility: a
  route handler, because `opengraph-image` files never see the query
  string. Links without known parts keep the default. Price-bearing images
  are CDN-cached for an hour. Pages that set their own `openGraph` name the
  default image explicitly, since that object replaces the inherited one.
- **Home page demo video:** the README GIF, MP4, WebM and poster all come
  from one recording (`npm run demo:media`). It plays muted and inline
  from script, not the `autoplay` attribute, so with
  `prefers-reduced-motion` only the poster shows and the video is never
  downloaded; a button pauses it (WCAG 2.2.2) and the caption describes
  it, so the video is `aria-hidden`.

## Next steps

Phase 1 is closed; work is paused. In this order:

1. **Check the store search links by hand** (owner). Only KaBuM! answered
   `curl`; Amazon, Mercado Livre, Pichau and Terabyte block bots, so each
   link needs a look in a browser.
2. **BIOS-update scenario on real parts.** ASUS, MSI and Gigabyte block
   automated access to CPU support lists. It waits for the owner to copy
   one MSI or Gigabyte board's list by hand; then fill `supportedCpus` and
   flag the CPUs that need an update.
3. **Phase 2:** sign-up and login with Auth.js (email + hashed password,
   Google, GitHub), saved builds, favorite parts, a privacy policy page
   (LGPD, minimal user data).
4. **Monetization through affiliate links**, as an idea: real price
   collectors and affiliate ids live in a separate private repo that
   implements `PriceProvider`; nothing of it enters this one.
