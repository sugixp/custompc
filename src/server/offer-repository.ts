import type { PrismaClient } from "@/generated/prisma/client";
import type { OfferRepository } from "@/pricing/sync";

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
      const [parts, stores] = await Promise.all([
        prisma.part.findMany({ select: { id: true, slug: true } }),
        prisma.store.findMany({ select: { id: true, slug: true } }),
      ]);
      const partIds = new Map(parts.map((part) => [part.slug, part.id]));
      const storeIds = new Map(stores.map((store) => [store.slug, store.id]));

      // One transaction: a sync either lands completely or not at all.
      await prisma.$transaction(
        offers.map((offer) => {
          const partId = partIds.get(offer.partSlug);
          const storeId = storeIds.get(offer.storeSlug);
          // reconcileOffers already dropped offers for unknown slugs.
          if (!partId || !storeId) {
            throw new Error(`Unknown ${offer.partSlug}@${offer.storeSlug}`);
          }
          const data = {
            priceCents: offer.priceCents,
            url: offer.url,
            inStock: offer.inStock,
            seenAt: offer.seenAt,
            source: offer.source,
          };
          return prisma.offer.upsert({
            where: { partId_storeId: { partId, storeId } },
            create: { partId, storeId, ...data },
            update: data,
          });
        }),
      );
    },
  };
}
