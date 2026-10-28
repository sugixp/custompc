import { describe, expect, it } from "vitest";
import { exampleOffers, parts, stores } from "@/seed";
import { reconcileOffers } from "../reconcile";
import { seedPriceProvider } from "./seed-provider";

const now = new Date("2026-11-10T12:00:00Z");
const catalog = parts.map(({ slug, category, brand, model }) => ({
  slug,
  category,
  brand,
  model,
}));

describe("seedPriceProvider", () => {
  it("covers every seed store", () => {
    expect(seedPriceProvider.storeSlugs).toEqual(
      stores.map((store) => store.slug),
    );
  });

  it("reports every example offer as seen at the sync time", async () => {
    const offers = await seedPriceProvider.fetchOffers({ parts: catalog, now });
    expect(offers).toHaveLength(exampleOffers.length);
    expect(new Set(offers.map((offer) => offer.seenAt.getTime()))).toEqual(
      new Set([now.getTime()]),
    );
  });

  it("only returns offers for the requested parts", async () => {
    const [first] = catalog;
    const offers = await seedPriceProvider.fetchOffers({
      parts: [first!],
      now,
    });
    expect(offers.length).toBeGreaterThan(0);
    expect(new Set(offers.map((offer) => offer.partSlug))).toEqual(
      new Set([first!.slug]),
    );
  });

  it("produces offers the sync accepts without rejections", async () => {
    const offers = await seedPriceProvider.fetchOffers({ parts: catalog, now });
    const { accepted, rejected } = reconcileOffers({
      results: [
        {
          providerId: seedPriceProvider.id,
          storeSlugs: seedPriceProvider.storeSlugs,
          offers,
        },
      ],
      partSlugs: new Set(catalog.map((part) => part.slug)),
      storeSlugs: new Set(stores.map((store) => store.slug)),
      now,
    });
    expect(rejected).toEqual([]);
    expect(accepted).toHaveLength(exampleOffers.length);
  });
});
