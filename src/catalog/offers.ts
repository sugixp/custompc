import {
  offerFreshness,
  type OfferFreshness,
} from "@/domain/pricing/freshness";

export interface CatalogOffer {
  storeSlug: string;
  storeName: string;
  priceCents: number;
  url: string;
  inStock: boolean;
  seenAt: Date;
  /** Price provider id; see src/domain/pricing/sources.ts. */
  source: string;
  /** True when the link carries an affiliate id (none do yet). */
  sponsored?: boolean;
}

export interface ShownOffer extends CatalogOffer {
  freshness: Exclude<OfferFreshness, "expired">;
}

export type PriceSummary =
  | { kind: "price"; fromCents: number }
  /** Fresh offers exist, but no store has the part in stock. */
  | { kind: "out-of-stock" }
  /** No fresh offer: none seen within its source's stale window. */
  | { kind: "no-recent-price" };

export interface OfferSummary {
  price: PriceSummary;
  /** Fresh and stale offers; expired ones are dropped. */
  offers: ShownOffer[];
}

/**
 * Splits a part's offers by freshness. "A partir de" uses only fresh offers in
 * stock; stale offers are listed, flagged, and never set the headline price.
 * Order: fresh before stale, in stock before out of stock, then cheapest.
 */
export function summarizeOffers(
  offers: readonly CatalogOffer[],
  now: Date,
): OfferSummary {
  const shown: ShownOffer[] = [];
  for (const offer of offers) {
    const freshness = offerFreshness(offer.seenAt, now, offer.source);
    if (freshness !== "expired") shown.push({ ...offer, freshness });
  }
  shown.sort(
    (a, b) =>
      Number(a.freshness === "stale") - Number(b.freshness === "stale") ||
      Number(!a.inStock) - Number(!b.inStock) ||
      a.priceCents - b.priceCents ||
      a.storeName.localeCompare(b.storeName, "pt-BR"),
  );

  const fresh = shown.filter((offer) => offer.freshness === "fresh");
  const buyable = fresh.filter((offer) => offer.inStock);
  const price: PriceSummary =
    buyable.length > 0
      ? {
          kind: "price",
          fromCents: Math.min(...buyable.map((o) => o.priceCents)),
        }
      : fresh.length > 0
        ? { kind: "out-of-stock" }
        : { kind: "no-recent-price" };

  return { price, offers: shown };
}

/**
 * rel for links to stores: never pass window.opener or the referrer, and
 * mark affiliate links as sponsored, as search engines ask.
 */
export function storeLinkRel({
  sponsored = false,
}: { sponsored?: boolean } = {}): string {
  return sponsored ? "noopener noreferrer sponsored" : "noopener noreferrer";
}
