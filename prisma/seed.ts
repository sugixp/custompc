// Loads the example catalog: stores and parts, then offers from the seed price
// provider through the same sync that `npm run prices:sync` runs. Idempotent:
// every row is upserted by a natural key (store slug, part slug, part+store).
// Run with `npm run db:seed`.
import "dotenv/config";
import { seedPriceProvider } from "@/pricing/providers/seed-provider";
import { formatSyncReport } from "@/pricing/report";
import { syncPrices } from "@/pricing/sync";
import { parseSeedPart, parts, stores } from "@/seed";
import { prismaOfferRepository } from "@/server/offer-repository";
import { createPrismaClient } from "@/server/prisma";

const prisma = createPrismaClient();

async function main() {
  // Validate everything before touching the database.
  const validated = parts.map((seedPart) => ({
    part: parseSeedPart(seedPart),
    specSourceUrls: [...seedPart.specSourceUrls],
  }));

  for (const { slug, name, siteUrl } of stores) {
    await prisma.store.upsert({
      where: { slug },
      create: { slug, name, siteUrl },
      update: { name, siteUrl },
    });
  }

  for (const { part, specSourceUrls } of validated) {
    const data = {
      category: part.category,
      brand: part.brand,
      model: part.model,
      specs: part.specs,
      specSourceUrls,
    };
    await prisma.part.upsert({
      where: { slug: part.slug },
      create: { slug: part.slug, ...data },
      update: data,
    });
  }
  console.log(`Seeded ${stores.length} stores and ${validated.length} parts.`);

  const report = await syncPrices({
    providers: [seedPriceProvider],
    repository: prismaOfferRepository(prisma),
  });
  console.log(formatSyncReport([seedPriceProvider.id], report));
  // "outranked" is expected: a reference price holds its slot against the seed.
  const unexpected = report.rejected.filter((r) => r.reason !== "outranked");
  if (unexpected.length > 0 || report.failedProviders.length > 0) {
    throw new Error(
      "The seed price provider produced offers the sync rejected",
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
