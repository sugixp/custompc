import type { PartRef, PriceProvider } from "./price-provider";
import {
  reconcileOffers,
  type AcceptedOffer,
  type ProviderResult,
  type RejectedOffer,
} from "./reconcile";

/** What the sync needs from storage; src/server implements it with Prisma. */
export interface OfferRepository {
  listParts(): Promise<PartRef[]>;
  listStoreSlugs(): Promise<string[]>;
  upsertOffers(offers: readonly AcceptedOffer[]): Promise<void>;
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
  const [parts, storeSlugs] = await Promise.all([
    repository.listParts(),
    repository.listStoreSlugs(),
  ]);

  const results: ProviderResult[] = [];
  const failedProviders: SyncReport["failedProviders"] = [];
  for (const provider of providers) {
    try {
      const offers = await provider.fetchOffers({ parts, now });
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
  });
  await repository.upsertOffers(accepted);

  return { written: accepted.length, rejected, failedProviders };
}
