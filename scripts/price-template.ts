// Writes a blank reference-price spreadsheet for `npm run prices:import`:
// one row per part and store, with links already recorded (Listing) filled
// in. Only price_brl, checked_on (and any missing url) are left to type.
//
//   npm run prices:template -- --parts amd-ryzen-5-7600,kingston-nv3-1tb
//   npm run prices:template -- --parts … --stores kabum,terabyte --out private/x.csv
//
// The default file is private/precos-YYYY-MM-DD.csv (gitignored); an existing
// file is never overwritten. Links come from DATABASE_URL, or from
// PRODUCTION_DATABASE_URL with --production; without either, rows have none.
import "dotenv/config";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { priceTemplateCsv } from "@/pricing/providers/manual-csv";
import { parts, stores } from "@/seed";
import { prismaOfferRepository } from "@/server/offer-repository";
import { createPrismaClient } from "@/server/prisma";

function option(args: string[], name: string): string | undefined {
  const at = args.indexOf(`--${name}`);
  return at < 0 ? undefined : args[at + 1];
}

const list = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

async function recordedLinks(production: boolean) {
  const url = production
    ? process.env.PRODUCTION_DATABASE_URL
    : process.env.DATABASE_URL;
  if (!url) {
    console.warn("No database URL set; rows come without links.");
    return new Map<string, string>();
  }
  const prisma = createPrismaClient(url);
  try {
    const listings = await prismaOfferRepository(prisma).listListings();
    return new Map(
      listings.map((l) => [`${l.partSlug}@${l.storeSlug}`, l.url]),
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const partSlugs = list(option(args, "parts"));
  const storeSlugs = list(option(args, "stores"));
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
  const out = option(args, "out") ?? `private/precos-${today}.csv`;

  const unknownParts = partSlugs.filter(
    (slug) => !parts.some((part) => part.slug === slug),
  );
  const chosenStores =
    storeSlugs.length > 0
      ? storeSlugs.map((slug) => stores.find((store) => store.slug === slug))
      : stores;
  if (partSlugs.length === 0 || unknownParts.length > 0) {
    console.error(
      partSlugs.length === 0
        ? "Usage: npm run prices:template -- --parts slug,slug [--stores kabum,terabyte] [--out file.csv] [--production]"
        : `Unknown parts: ${unknownParts.join(", ")}`,
    );
    process.exitCode = 1;
    return;
  }
  if (chosenStores.some((store) => store === undefined)) {
    console.error(`Unknown store in: ${storeSlugs.join(", ")}`);
    process.exitCode = 1;
    return;
  }
  if (existsSync(out)) {
    console.error(`${out} already exists; pick another --out.`);
    process.exitCode = 1;
    return;
  }

  const links = await recordedLinks(args.includes("--production"));
  const rows = partSlugs.flatMap((slug) => {
    const part = parts.find((candidate) => candidate.slug === slug)!;
    const partName = `${part.brand} ${part.model}`;
    return chosenStores.map((store) => ({
      partSlug: slug,
      storeSlug: store!.slug,
      url: links.get(`${slug}@${store!.slug}`),
      partName,
      searchUrl: store!.searchUrl(partName),
    }));
  });

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, priceTemplateCsv(rows));
  const linked = rows.filter((row) => row.url).length;
  console.log(`${out}: ${rows.length} rows, ${linked} with a recorded link.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
