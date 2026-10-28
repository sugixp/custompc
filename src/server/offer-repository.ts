import type { PrismaClient } from "@/generated/prisma/client";
import type { AcceptedOffer } from "@/pricing/reconcile";
import type { OfferRepository } from "@/pricing/sync";

/** Offers per INSERT. Each batch is one round trip to the database. */
export const UPSERT_BATCH_SIZE = 500;

/** Generous: a batch takes one round trip, even to a distant database. */
const SYNC_TRANSACTION_TIMEOUT_MS = 30_000;

/** The price sync's storage, backed by Prisma. */
export function prismaOfferRepository(prisma: PrismaClient): OfferRepository {
  return {
    async listParts() {
      return prisma.part.findMany({
        select: { slug: true, category: true, brand: true, model: true },
        orderBy: { slug: "asc" },
      });
    },

    async listStoreSlugs() {
      const stores = await prisma.store.findMany({ select: { slug: true } });
      return stores.map((store) => store.slug);
    },

    async upsertOffers(offers) {
      if (offers.length === 0) return;
      // One transaction: a sync either lands completely or not at all. A
      // query per offer took one round trip each and ran past the default
      // 5 s transaction timeout against a remote database.
      await prisma.$transaction(
        async (tx) => {
          for (let i = 0; i < offers.length; i += UPSERT_BATCH_SIZE) {
            const batch = offers.slice(i, i + UPSERT_BATCH_SIZE);
            const written = await upsertBatch(tx, batch);
            // reconcileOffers already dropped unknown slugs, so a miss means
            // a part or store was deleted during the sync.
            if (written !== batch.length) {
              throw new Error(
                `Wrote ${written} of ${batch.length} offers: a part or store is missing`,
              );
            }
          }
        },
        { timeout: SYNC_TRANSACTION_TIMEOUT_MS },
      );
    },
  };
}

type Transaction = Pick<PrismaClient, "$executeRaw">;

/**
 * Upserts a batch in one statement: the offers travel as one array per
 * column, slugs are resolved to ids by joining Part and Store, and existing
 * part/store pairs are updated in place. id and updatedAt are filled by the
 * Prisma client on normal writes, so they are set here: new ids are UUIDs
 * instead of cuids, which nothing depends on. Timestamps are stored as UTC
 * without a zone, as Prisma does.
 */
function upsertBatch(
  tx: Transaction,
  batch: readonly AcceptedOffer[],
): Promise<number> {
  return tx.$executeRaw`
    INSERT INTO "Offer" ("id", "partId", "storeId", "priceCents", "url",
      "inStock", "seenAt", "source", "updatedAt")
    SELECT gen_random_uuid()::text, p."id", s."id", o."priceCents", o."url",
      o."inStock", o."seenAt"::timestamptz AT TIME ZONE 'UTC', o."source",
      now() AT TIME ZONE 'UTC'
    FROM unnest(
      ${batch.map((o) => o.partSlug)}::text[],
      ${batch.map((o) => o.storeSlug)}::text[],
      ${batch.map((o) => o.priceCents)}::int[],
      ${batch.map((o) => o.url)}::text[],
      ${batch.map((o) => o.inStock)}::boolean[],
      ${batch.map((o) => o.seenAt.toISOString())}::text[],
      ${batch.map((o) => o.source)}::text[]
    ) AS o("partSlug", "storeSlug", "priceCents", "url", "inStock", "seenAt",
      "source")
    JOIN "Part" p ON p."slug" = o."partSlug"
    JOIN "Store" s ON s."slug" = o."storeSlug"
    ON CONFLICT ("partId", "storeId") DO UPDATE SET
      "priceCents" = EXCLUDED."priceCents",
      "url" = EXCLUDED."url",
      "inStock" = EXCLUDED."inStock",
      "seenAt" = EXCLUDED."seenAt",
      "source" = EXCLUDED."source",
      "updatedAt" = EXCLUDED."updatedAt"
  `;
}
