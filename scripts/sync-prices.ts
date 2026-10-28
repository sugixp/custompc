// Fetches offers from the configured price providers (PRICE_PROVIDERS, see
// src/pricing/registry.ts) and writes them to the database. Pages never call
// providers; they read what this script stored. Run with `npm run prices:sync`.
import "dotenv/config";
import { loadPriceProviders } from "@/pricing/registry";
import { formatSyncReport } from "@/pricing/report";
import { syncPrices } from "@/pricing/sync";
import { prismaOfferRepository } from "@/server/offer-repository";
import { createPrismaClient } from "@/server/prisma";

async function main() {
  const providers = await loadPriceProviders();
  const prisma = createPrismaClient();
  try {
    const report = await syncPrices({
      providers,
      repository: prismaOfferRepository(prisma),
    });
    console.log(
      formatSyncReport(
        providers.map((provider) => provider.id),
        report,
      ),
    );
    // A provider that failed must not look like a successful run to a cron job.
    if (report.failedProviders.length > 0) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
