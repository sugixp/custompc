// Loads the example catalog. Idempotent: every row is upserted by a natural
// key (store slug, part slug, part+store), so it can run any number of times.
// Run with `npm run db:seed`.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { offers, parseSeedPart, parts, stores } from "./seed-data";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  // Validate everything before touching the database.
  const validated = parts.map((seedPart) => ({
    part: parseSeedPart(seedPart),
    specSourceUrls: [...seedPart.specSourceUrls],
  }));

  const storeIds = new Map<string, string>();
  for (const { slug, name, siteUrl } of stores) {
    const row = await prisma.store.upsert({
      where: { slug },
      create: { slug, name, siteUrl },
      update: { name, siteUrl },
    });
    storeIds.set(slug, row.id);
  }

  const partIds = new Map<string, string>();
  for (const { part, specSourceUrls } of validated) {
    const data = {
      category: part.category,
      brand: part.brand,
      model: part.model,
      specs: part.specs,
      specSourceUrls,
    };
    const row = await prisma.part.upsert({
      where: { slug: part.slug },
      create: { slug: part.slug, ...data },
      update: data,
    });
    partIds.set(part.slug, row.id);
  }

  for (const offer of offers) {
    const partId = partIds.get(offer.partSlug);
    const storeId = storeIds.get(offer.storeSlug);
    if (!partId || !storeId)
      throw new Error(
        `Unknown part or store in offer ${offer.partSlug}@${offer.storeSlug}`,
      );
    const data = {
      priceCents: offer.priceCents,
      url: offer.url,
      inStock: offer.inStock,
      seenAt: offer.seenAt,
      source: offer.source,
    };
    await prisma.offer.upsert({
      where: { partId_storeId: { partId, storeId } },
      create: { partId, storeId, ...data },
      update: data,
    });
  }

  console.log(
    `Seeded ${stores.length} stores, ${validated.length} parts, ${offers.length} offers.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
