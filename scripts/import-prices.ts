// Imports reference prices checked by hand from a CSV spreadsheet (format in
// src/pricing/providers/manual-csv.ts; example in data/prices.example.csv)
// through the same sync as `npm run prices:sync`, as source "manual":
//
//   npm run prices:import -- private/precos-2026-10-31.csv
//   npm run prices:import -- private/precos-2026-10-31.csv --dry-run
//   npm run prices:import -- private/precos-2026-10-31.csv --production
//
// Any bad row stops the import before the database is touched, listing every
// problem by line. Each row's url is recorded as the part's product page at
// that store (Listing), for the next spreadsheet and the seed's links.
// --production writes to PRODUCTION_DATABASE_URL instead of DATABASE_URL,
// as db:seed:prod does.
import "dotenv/config";
import { readFileSync } from "node:fs";
import { MANUAL_SOURCE } from "@/domain/pricing/sources";
import {
  manualPriceProvider,
  parsePriceCsv,
} from "@/pricing/providers/manual-csv";
import { formatSyncReport } from "@/pricing/report";
import { syncPrices } from "@/pricing/sync";
import { parts, stores } from "@/seed";
import { prismaOfferRepository } from "@/server/offer-repository";
import { createPrismaClient } from "@/server/prisma";

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith("--"));
  const dryRun = args.includes("--dry-run");
  const production = args.includes("--production");
  if (!file) {
    console.error(
      "Usage: npm run prices:import -- <file.csv> [--dry-run] [--production]",
    );
    process.exitCode = 1;
    return;
  }

  const now = new Date();
  const { offers, skipped, errors } = parsePriceCsv(
    readFileSync(file, "utf8"),
    { stores, partSlugs: new Set(parts.map((part) => part.slug)), now },
  );
  for (const { line, message } of errors)
    console.error(`${file}:${line}: ${message}`);
  console.log(
    `${offers.length} prices read, ${skipped.length} blank rows skipped, ${errors.length} errors.`,
  );
  if (errors.length > 0) {
    console.error("Nothing imported; fix the rows above and run again.");
    process.exitCode = 1;
    return;
  }
  if (dryRun || offers.length === 0) return;

  const url = production
    ? process.env.PRODUCTION_DATABASE_URL
    : process.env.DATABASE_URL;
  if (!url) {
    console.error(
      `${production ? "PRODUCTION_DATABASE_URL" : "DATABASE_URL"} is not set.`,
    );
    process.exitCode = 1;
    return;
  }

  const provider = manualPriceProvider(
    offers,
    stores.map((store) => store.slug),
  );
  const prisma = createPrismaClient(url);
  try {
    const repository = prismaOfferRepository(prisma);
    const report = await syncPrices({
      providers: [provider],
      repository,
      now,
    });
    console.log(formatSyncReport([provider.id], report));
    // Every row's link is kept for the next spreadsheet and the seed's links,
    // even when its price lost to a newer one.
    await repository.upsertListings(
      offers.map(({ partSlug, storeSlug, url, seenAt }) => ({
        partSlug,
        storeSlug,
        url,
        seenAt: seenAt > now ? now : seenAt,
        source: MANUAL_SOURCE,
      })),
    );
    console.log(`Product links recorded: ${offers.length}`);
    // A newer price already stored is expected when a sheet is re-imported.
    for (const { reason, detail } of report.rejected)
      console.log(`Not written (${reason}): ${detail}`);
    if (report.rejected.some((r) => r.reason !== "superseded"))
      process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
