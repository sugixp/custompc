import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import type { CatalogOffer } from "@/catalog/offers";
import { oldestVisibleSeenAt } from "@/domain/pricing/freshness";
import { partSchema, type Category, type Part } from "@/domain/parts";
import { getDb } from "./db";

export interface CatalogPart {
  part: Part;
  specSourceUrls: string[];
  /** Offers not yet expired, unsorted; see summarizeOffers. */
  offers: CatalogOffer[];
}

const offerInclude = (now: Date) =>
  ({
    offers: {
      // Expired offers are never shown, so they never leave the database.
      where: { seenAt: { gte: oldestVisibleSeenAt(now) } },
      include: { store: { select: { slug: true, name: true } } },
    },
  }) as const;

type PartRow = {
  id: string;
  slug: string;
  category: Category;
  brand: string;
  model: string;
  specs: unknown;
  specSourceUrls: string[];
  offers: {
    priceCents: number;
    url: string;
    inStock: boolean;
    seenAt: Date;
    source: string;
    store: { slug: string; name: string };
  }[];
};

/**
 * Specs are JSON in the database; they are parsed with the domain schema on
 * the way out, so a bad row fails loudly instead of rendering wrong numbers.
 */
function toCatalogPart(row: PartRow): CatalogPart {
  const { id, slug, category, brand, model, specs } = row;
  return {
    part: partSchema.parse({ id, slug, category, brand, model, specs }),
    specSourceUrls: row.specSourceUrls,
    offers: row.offers.map((offer) => ({
      storeSlug: offer.store.slug,
      storeName: offer.store.name,
      priceCents: offer.priceCents,
      url: offer.url,
      inStock: offer.inStock,
      seenAt: offer.seenAt,
      source: offer.source,
    })),
  };
}

/**
 * Every part of a category with its visible offers. Filtering, sorting and
 * pagination happen in memory (src/catalog/listing.ts): the catalog has tens
 * of parts per category, and the facets read JSON specs.
 */
export async function listCategoryParts(
  category: Category,
  now: Date,
): Promise<CatalogPart[]> {
  const rows = await getDb().part.findMany({
    where: { category },
    include: offerInclude(now),
    orderBy: { slug: "asc" },
  });
  return rows.map(toCatalogPart);
}

/**
 * One part by slug, plus the time its offers were judged against. Wrapped in
 * React's cache keyed by slug only, so generateMetadata and the page share
 * one query and one clock reading per request.
 */
export const getCatalogPart = cache(
  async (slug: string): Promise<{ found: CatalogPart | null; now: Date }> => {
    // Reading the clock is request-time work under Cache Components.
    await connection();
    const now = new Date();
    const row = await getDb().part.findUnique({
      where: { slug },
      include: offerInclude(now),
    });
    return { found: row ? toCatalogPart(row) : null, now };
  },
);
