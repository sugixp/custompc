import { stores } from "./stores";
import type { SeedPart } from "./types";

/**
 * Example offers, derived deterministically from each part's illustrative
 * reference price so re-running the seed writes the same rows. These are not
 * real prices.
 */
export const SEED_SOURCE = "seed";
export const SEED_SEEN_AT = new Date("2026-10-27T12:00:00-03:00");

// Per-store spread around the reference price, in basis points.
const STORE_SPREAD_BP = [0, -300, 400, -100, 600] as const;

export interface SeedOffer {
  partSlug: string;
  storeSlug: string;
  priceCents: number;
  url: string;
  inStock: boolean;
  seenAt: Date;
  source: string;
}

/** Rounds to a price ending in ,90, the usual retail format in Brazil. */
function retailPrice(cents: number): number {
  return Math.max(990, Math.round(cents / 1000) * 1000 - 10);
}

export function buildOffers(parts: readonly SeedPart[]): SeedOffer[] {
  return parts.flatMap((part, partIndex) =>
    stores.flatMap((store, storeIndex) => {
      // Each part skips one store, so not every store carries everything.
      if ((partIndex + storeIndex) % stores.length === 0) return [];
      const spreadBp = STORE_SPREAD_BP[storeIndex] ?? 0;
      return [
        {
          partSlug: part.slug,
          storeSlug: store.slug,
          priceCents: retailPrice(
            part.referencePriceCents +
              (part.referencePriceCents * spreadBp) / 10_000,
          ),
          url: store.searchUrl(`${part.brand} ${part.model}`),
          inStock: (partIndex + storeIndex) % 7 !== 3,
          seenAt: SEED_SEEN_AT,
          source: SEED_SOURCE,
        },
      ];
    }),
  );
}
