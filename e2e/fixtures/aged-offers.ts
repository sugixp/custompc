import type { PriceProvider } from "@/pricing/price-provider";
import { exampleOffers } from "@/seed";

/**
 * A test-only price provider that re-reports some seed offers as seen long
 * ago, so the E2E tests can check how stale and expired prices are shown.
 * e2e/global-setup.ts runs it on the E2E database after the seed. Only
 * coolers are aged, since no other spec reads their prices.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const STALE_AGE_MS = 10 * DAY_MS;
const EXPIRED_AGE_MS = 40 * DAY_MS;

const offersOf = (partSlug: string) =>
  exampleOffers.filter((offer) => offer.partSlug === partSlug);

/**
 * Mixed: one store stale and one expired, both cheaper than every fresh
 * offer, so a headline price taken from either would be visibly wrong.
 */
export const MIXED = {
  partSlug: "noctua-nh-d15-g2",
  path: "/pecas/coolers/noctua-nh-d15-g2",
  staleStore: "kabum",
  expiredStore: "pichau",
} as const;

/** Every offer stale: listed and flagged, but no current price. */
export const ALL_STALE = {
  partSlug: "noctua-nh-u12s-redux",
  path: "/pecas/coolers/noctua-nh-u12s-redux",
} as const;

/** Every offer expired: no store is shown at all. */
export const ALL_EXPIRED = {
  partSlug: "arctic-liquid-freezer-iii-360",
  path: "/pecas/coolers/arctic-liquid-freezer-iii-360",
} as const;

const agedOffersProvider: PriceProvider = {
  id: "e2e-aged",
  storeSlugs: [...new Set(exampleOffers.map((offer) => offer.storeSlug))],
  async fetchOffers({ now }) {
    const ago = (ms: number) => new Date(now.getTime() - ms);

    const mixed = offersOf(MIXED.partSlug);
    const cheapest = Math.min(...mixed.map((offer) => offer.priceCents));
    const mixedAged = mixed.flatMap((offer) =>
      offer.storeSlug === MIXED.staleStore
        ? [
            {
              ...offer,
              priceCents: cheapest - 5_000,
              seenAt: ago(STALE_AGE_MS),
            },
          ]
        : offer.storeSlug === MIXED.expiredStore
          ? [
              {
                ...offer,
                priceCents: cheapest - 10_000,
                seenAt: ago(EXPIRED_AGE_MS),
              },
            ]
          : [],
    );

    return [
      ...mixedAged,
      ...offersOf(ALL_STALE.partSlug).map((offer) => ({
        ...offer,
        seenAt: ago(STALE_AGE_MS),
      })),
      ...offersOf(ALL_EXPIRED.partSlug).map((offer) => ({
        ...offer,
        seenAt: ago(EXPIRED_AGE_MS),
      })),
    ];
  },
};

export default agedOffersProvider;
