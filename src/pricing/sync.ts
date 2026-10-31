import type { KnownListing, PartRef, PriceProvider } from "./price-provider";
import {
  reconcileOffers,
  type AcceptedOffer,
  type ProviderResult,
  type RejectedOffer,
  type StoredOffer,
} from "./reconcile";

/** What the sync needs from storage; src/server implements it with Prisma. */
export interface OfferRepository {
  listParts(): Promise<PartRef[]>;
  listStoreSlugs(): Promise<string[]>;
  /** Every stored offer's key, source and seenAt, for source priority. */
  listOffers(): Promise<StoredOffer[]>;
  listListings(): Promise<KnownListing[]>;
  upsertOffers(offers: readonly AcceptedOffer[]): Promise<void>;
  /**
   * Records product pages; a link replaces a stored one only when it was
   * confirmed on the same day or later.
   */
  upsertListings(listings: readonly RecordedListing[]): Promise<void>;
}

export interface RecordedListing extends KnownListing {
  seenAt: Date;
  source: string;
}

export interface SyncReport {
  written: number;
  rejected: RejectedOffer[];
  /** Providers that threw; their offers are skipped, the others still sync. */
  failedProviders: { providerId: string; error: string }[];
}

/**
 * Asks every provider for offers on the whole catalog, validates them and
 * upserts the survivors. Runs from `npm run prices:sync` (and the seed),
 * never during a page request.
 */
export async function syncPrices({
  providers,
  repository,
  now = new Date(),
}: {
  providers: readonly PriceProvider[];
  repository: OfferRepository;
  now?: Date;
}): Promise<SyncReport> {
  const [parts, storeSlugs, stored, listings] = await Promise.all([
    repository.listParts(),
    repository.listStoreSlugs(),
    repository.listOffers(),
    repository.listListings(),
  ]);

  const results: ProviderResult[] = [];
  const failedProviders: SyncReport["failedProviders"] = [];
  for (const provider of providers) {
    try {
      const offers = await provider.fetchOffers({ parts, now, listings });
      results.push({
        providerId: provider.id,
        storeSlugs: provider.storeSlugs,
        offers,
      });
    } catch (error) {
      failedProviders.push({
        providerId: provider.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const { accepted, rejected } = reconcileOffers({
    results,
    partSlugs: new Set(parts.map((part) => part.slug)),
    storeSlugs: new Set(storeSlugs),
    now,
    stored,
  });
  await repository.upsertOffers(accepted);

  return { written: accepted.length, rejected, failedProviders };
}
