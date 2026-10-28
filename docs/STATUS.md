# Status

Where the project stands, why it is built this way, and what comes next.
Last updated 2026-10-28, at the end of Phase 1 stage 8.

## Where it stands

Phase 1 (MVP), stages 1–8 of 10 are done and on `main`, CI green:

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

CI runs three jobs on every push: lint/format/typecheck/unit tests/build
(no database), migrate + seed + sync + idempotency on a fresh Postgres, and
Playwright E2E (desktop and Pixel 7) against a seeded production build.

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
- **Visual direction** (chosen by the owner): dark "night panel" with
  datasheet typography: IBM Plex Sans/Mono, tabular figures, one lime
  accent `#b6f23a`, spec rows with dotted leaders. All text colors clear
  WCAG AA (lowest pair 6.4:1).

## Next steps

1. **Stage 9 — E2E in CI, complete.** Broaden Playwright beyond the current
   specs (keyboard navigation through the picker, error boundary, stale and
   expired offers via a test provider, pagination), maybe axe checks.
2. **Stage 10 — final README** (PT/EN) for recruiters: GIF of the builder,
   architecture summary, how to run and test, roadmap and status.
3. **BIOS-update scenario on real parts** is still missing. ASUS, MSI and
   Gigabyte block automated access to CPU support lists; it needs a list
   checked by hand (or a PDF) before `supportedCpus` can be filled.
4. **Check the store search links by hand** in a browser. Only KaBuM!
   answered `curl`; Amazon, Mercado Livre, Pichau and Terabyte block bots.
5. **Deploy**: Vercel + Neon. Needs the owner's accounts; set
   `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, run `db:deploy`, `db:seed`.
6. **Phase 2**: sign-up/login (Auth.js: email + hashed password, Google,
   GitHub), saved builds and favorite parts, privacy policy page (LGPD,
   minimal user data).
