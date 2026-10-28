# Architecture

## Layers

```
src/domain/      pure TypeScript: part schemas, money, power estimate,
                 compatibility rules. No Next.js, React or Prisma imports
                 (enforced by ESLint).
src/server/      server-only code: the Prisma client (db.ts) and, next,
                 the repositories the pages read from.
src/app/         Next.js App Router pages and components.
prisma/          schema, migrations and the example seed.
```

Dependencies point inward: `app` → `server` → `domain`. The domain never
knows where parts come from, so the compatibility rules are tested with plain
objects and no database.

## Data model

| Model   | Purpose                                                                                                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Part`  | One real product. `category` is a Postgres enum; `specs` is JSON validated by the Zod schema of that category (`src/domain/parts`); `specSourceUrls` lists the manufacturer pages the specs were taken from. |
| `Store` | A Brazilian store (Amazon, Mercado Livre, KaBuM!, Pichau, Terabyte).                                                                                                                                         |
| `Offer` | A price for one part at one store: `priceCents` (integer centavos), `url`, `inStock`, `seenAt` and `source`, the id of the price provider that produced it.                                                  |

Specs live in one JSON column instead of a table per category. The schema
stays small, and Zod gives each category its own strict type at the boundary.
If filtering on a spec gets slow, that field can move to an indexed column.

## Seed data

`prisma/seed-data` holds real parts whose specs were copied from the
manufacturers' pages, with the URLs kept next to each part. A value a page
does not state is left out, never guessed: board CPU support lists and PSU
modularity are absent for that reason, and both fields are optional in the
schema.

Offer prices in the seed are **illustrative**, derived from a rough reference
price per part. Offer links go to each store's public search page for the
part, with the term URI-encoded and no affiliate ids. Store images are not
copied or hotlinked; the UI uses placeholders per category.

`prisma/seed-data/scenarios.ts` lists example builds of real parts that each
trigger one compatibility rule. `seed-data.test.ts` checks them against
`checkBuild`, validates every part with Zod and checks the offers, all without
a database. CI also migrates and seeds a fresh Postgres twice to prove the
seed is idempotent.

## Known limitations

- **One offer per part per store.** `Offer` has `@@unique([partId, storeId])`.
  Marketplaces such as Amazon and Mercado Livre list many sellers for the same
  product, at different prices, conditions and shipping. Phase 1 keeps the
  best-known price per store; supporting sellers means adding a seller (or
  listing) key to the unique constraint and choosing which offer to show.
- **No price history yet.** Upserting an offer overwrites the previous price.
  Price history is planned for phase 3 as a separate append-only table.
- **Specs are a snapshot.** Manufacturers revise pages (for example, a BIOS
  update raising a board's max memory). `specSourceUrls` makes rechecking
  possible but nothing does it automatically.
