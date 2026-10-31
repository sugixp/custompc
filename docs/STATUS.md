# Status

Where the project stands, why it is built this way, and what comes next.
Last updated 2026-10-31: Phase 1 closed on 2026-10-28; Phase 2 in progress,
paused after stage 2 (see "Paused on 2026-10-31" below).

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

## Phase 2 — in progress

Plan approved by the owner on 2026-10-30. Phase 2 is now compatibility,
recommendation and featured builds; sign-up, login, saved builds and
favorites move to Phase 3.

- [x] **Stage 1, catalog:** 15 parts per category covering entry, mid and
      high end; specs only from manufacturer pages, nothing invented; one
      demo scenario with the wrong memory generation (DDR4/DDR5) for the
      board. Done 2026-10-31: 120 parts, scenario `ddr5-on-d4-board`.
      Later that day, 5 more that the stores actually sell (OC/Pro
      variants and substitutes, see "Featured build swaps"): 125 parts.
- [x] **Stage 2, reference prices:** `offerFreshness` per source (manual:
      fresh up to 10 days, stale up to 45); `prices:import` from CSV
      (`part_slug, store_slug, price_brl, url, checked_on, in_stock?`)
      through a `"manual"` `PriceProvider` in the same sync; a fictitious
      example in `data/prices.example.csv`; label "preço de referência,
      conferido em DD/MM".
      The production seed stays. Priority by source: manual (and future
      real providers) always beats the seed for the same part/store pair,
      whatever the `seenAt`; the seed only fills gaps and is labeled
      illustrative. Any total that includes an illustrative price says
      "inclui preços ilustrativos". The CSV product URL is kept as a
      reusable part → listing mapping (where it lives to be proposed
      first if it needs a migration).
      Done 2026-10-31: the owner chose a `Listing` table (migration); also
      `prices:template` for the blank sheet. The first sheet (KaBuM! and
      Terabyte, featured-build parts) was filled from the owner's Chrome and
      imported into the development database: 12 prices. The price is the
      cash price by PIX, and the label says so: "à vista no PIX · preço de
      referência, conferido em DD/MM".
- [ ] **Stage 3, Mercado Livre — adiada: aguardando app do Mercado Livre.**
      The probe script is ready in `private/ml-test.ts` (gitignored, with
      `private/.env.example`); it prints the HTTP status and raw JSON of each
      call. The API docs portal answered 403 to automated reads, so what the
      API allows a new app is still unverified. Owner's steps: 1. At developers.mercadolivre.com.br, signed in with your account,
      create an application: any name and description, a https Redirect
      URI (e.g. `https://custompc-builder.vercel.app/`), read-only scope
      (`read`; add `offline_access` only if needed for a refresh token);
      no `write`, no notification topics. 2. Copy `private/.env.example` to `private/.env` and fill
      `ML_CLIENT_ID`, `ML_CLIENT_SECRET`, `ML_REDIRECT_URI`. Never paste
      the secret in chat or in a repo file. 3. Run `npx tsx private/ml-test.ts app-token`. If the API refuses the
      app-only token, run `auth-url`, open the link, authorize, copy the
      `?code=` from the redirect and run `token <code>`. Tokens go to
      `private/.ml-tokens.json` and are never printed. 4. Then the agent runs `search`, `products`, `product-items` and `item`
      and reports exactly what comes back (a 403 on `/sites/MLB/search`
      would point to catalog search, `/products/search`, instead).
      The agent never uses the owner's Chrome or logged-in session on the
      Mercado Livre site to collect data.
- [ ] **Stage 4, performance:** GPU/CPU tiers (scale 1–6) as data with
      published sources, never FPS; a pure
      `usageProfiles(cpu, gpu, memory)`; `docs/performance.md`.
- [ ] **Stage 5, featured builds:** Entrada/Intermediária/Alta in
      `src/featured/builds.ts`, zero `checkBuild` errors (tested); home page
      cards with the total (or "sem preço recente"), profiles, "por que"
      and a Personalizar button; E2E. Started 2026-10-31: the selection is
      in `src/featured/builds.ts` with a one-line "por que" per part, and a
      test requires zero issues (warnings included). Cards and E2E remain.
- [ ] **Stage 6, plan only:** `docs/recommendations.md` (bottleneck hints,
      oversized PSU, cheaper alternative; "Monte por mim" as a pruned
      search).

## Paused on 2026-10-31

**Done today:** Phase 2 stages 1 and 2; the first reference-price sheet
filled from the owner's Chrome (KaBuM! and Terabyte, one product page at a
time, no login, no captcha met) and imported into development (12 prices);
the PIX label; 5 catalog parts the stores sell; the featured-build
selection in code. Stage 3 is postponed (above).

### Featured build swaps (for the owner to review)

Neither store sold these parts itself on 2026-10-31 (marketplace sellers do
not count), so each was swapped for one that keeps its role, at a similar
price, with `checkBuild` returning no issue at all:

| Build         | Was                         | Now                              | Why                                                                                                               |
| ------------- | --------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Entrada       | Ryzen 5 5600                | Ryzen 5 5500                     | Same role (6-core AM4 with Wraith Stealth); both stores sell it, around R$ 620 at KaBuM!; slower, PCIe 3.0 only.  |
| Entrada       | ASUS Dual RX 6600 8GB       | ASRock RX 7600 Challenger 8GB OC | The RX 6600 was out of stock or absent; the RX 7600 is its successor, sold by KaBuM! (~R$ 1.920). Asks for 550 W. |
| Entrada       | ASUS TUF Gaming 550W Bronze | Corsair CX650 (CP-9020278-BR)    | No TUF Bronze at either store; the CX650 is sold by both (~R$ 370–380) and covers the RX 7600's 550 W.            |
| Intermediária | ASUS TUF Gaming 650W Bronze | Corsair CX650 (CP-9020278-BR)    | Same reason; 650 W for the 5060 Ti's 550 W.                                                                       |
| Intermediária | Prime RTX 5060 Ti 16GB      | Prime RTX 5060 Ti 16GB OC        | Only the OC edition was sold (Terabyte); same size, PSU and connector.                                            |
| Alta          | TUF RTX 5080 16GB           | TUF RTX 5080 16GB OC             | Only the OC edition was sold (KaBuM!); same 348 mm, 850 W and 16-pin.                                             |
| Alta          | Liquid Freezer III 360      | Liquid Freezer III Pro 360       | Terabyte sells only the Pro; same 360 mm radiator and sockets.                                                    |

The replaced parts stay in the catalog. Other build parts were also not
sold by either store that day (DDR4-3200 2x8GB kit, Focus 2, Pop Air,
Meshify 2, B650M-PLUS WIFI, DDR5-6000 2x32GB); they were not swapped,
pending the owner's call.

### Waiting on the owner

1. **Mercado Livre app** (stage 3 steps above).
2. **Review the swaps** in the table above.
3. **Fill `private/precos-2026-10-31-trocas.csv`** (new and swapped parts,
   12 rows, the known links already in; KaBuM! links came from the "Vendido
   por: KaBuM!" filter, so check the seller on the page).
4. **Authorize the production import.** Nothing was seeded or imported in
   production today. When authorized, in this order:
   1. Check the latest production deploy is Ready (it applies migrations).
   2. Seed production so the 5 new parts exist: the "Seed production"
      workflow (`gh workflow run "Seed production"`) or
      `npm run db:seed:prod`.
   3. `npm run prices:import -- private/precos-2026-10-31.csv --production --dry-run`,
      then the same without `--dry-run` (needs `PRODUCTION_DATABASE_URL`
      in the local `.env`).
   4. Once filled, the same two commands for
      `private/precos-2026-10-31-trocas.csv`.
   5. Expect the next "Price sync" run to report the manual pairs as
      `outranked`: the seed keeping off reference prices, as designed.

**Next:** stage 4, performance tiers.

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
  Phase 2 stage 1 grew the seed to 15 parts per category on the same rule.
  Kingston and AMD block `curl`, so their pages were read in the owner's
  Chrome (AMD's spec table is in hidden markup, found with `textContent`);
  WD's SSD pages moved to sandisk.com, where only the `sku` link pins the
  capacity. Parts whose page lacks a required field are left out (the ROG
  Thor 1000P2 states no form factor).
- **Prices are illustrative** in this public repo. Real collectors and
  affiliate ids belong to a private package implementing `PriceProvider`,
  loaded only when listed in `PRICE_PROVIDERS`. Providers run in
  `npm run prices:sync`, never during a request.
- **Offer freshness:** fresh up to 7 days, stale (shown, flagged, out of
  totals) up to 30, then hidden; hand-checked (`manual`) prices 10 and 45,
  since nobody checks a store by hand every day. The sync never deletes
  offers.
- **Source priority, not recency:** the daily sync runs only the seed and
  the upsert overwrites, so a reference price would have lost to an
  illustrative one the next morning. Any real price outranks the seed for
  the same part and store, in the run and against what is stored, until its
  own source expires it; the seed only fills gaps. The production seed stays,
  so the demo is never empty. Every total that counts a seed price says
  "inclui preços ilustrativos".
- **Reference prices come from a spreadsheet** (`prices:import`), built for
  what Excel in Portuguese saves, because the owner checks prices by hand in
  a browser; stores block bots. Any bad row stops the whole import, so a
  half-wrong sheet never lands. Each row's link is kept in `Listing` (chosen
  over a local file so production has it too), which pre-fills the next
  sheet and lets seed offers link to the product instead of a search.
- **The reference price is the cash price by PIX**, the one stores show in
  large type; card and installment totals are higher. A row is filled only
  when the store itself sells the part (not a marketplace seller) and brand,
  exact model and capacity match. An OC or Pro edition is a different part
  with its own manufacturer page, so it gets its own catalog entry.
- **Featured builds use only parts a store sells itself**, checked on the
  store's page; parts nobody sold were swapped (table above).
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
  time). The E2E server uses 5, so the 15 seed CPUs span three pages without
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

Phase 2 (above) is the current work. Besides it, in order:

1. **Check the store search links by hand** (owner). Only KaBuM! answered
   `curl`; Amazon, Mercado Livre, Pichau and Terabyte block bots, so each
   link needs a look in a browser.
2. **BIOS-update scenario on real parts.** ASUS, MSI and Gigabyte block
   automated access to CPU support lists. It waits for the owner to copy
   one MSI or Gigabyte board's list by hand; then fill `supportedCpus` and
   flag the CPUs that need an update.
3. **Phase 3:** sign-up and login with Auth.js (email + hashed password,
   Google, GitHub), saved builds, favorite parts, a privacy policy page
   (LGPD, minimal user data).
4. **Monetization through affiliate links**, as an idea: real price
   collectors and affiliate ids live in a separate private repo that
   implements `PriceProvider`; nothing of it enters this one.
