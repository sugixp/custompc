import { exampleOffers, stores } from "@/seed";
import type { PriceProvider } from "../price-provider";

/**
 * The public, default provider: ILLUSTRATIVE prices derived from the example
 * catalog (src/seed), linking to each store's search page. It reports every
 * offer as seen at the time of the sync, like a real collector would.
 */
export const seedPriceProvider: PriceProvider = {
  id: "seed",
  storeSlugs: stores.map((store) => store.slug),
  async fetchOffers({ parts, now }) {
    const requested = new Set(parts.map((part) => part.slug));
    return exampleOffers
      .filter((offer) => requested.has(offer.partSlug))
      .map(({ partSlug, storeSlug, priceCents, url, inStock }) => ({
        partSlug,
        storeSlug,
        priceCents,
        url,
        inStock,
        seenAt: now,
      }));
  },
};
