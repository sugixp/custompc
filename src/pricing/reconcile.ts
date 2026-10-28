import { providerOfferSchema, type ProviderOffer } from "./price-provider";

/** An offer that passed every check, tagged with the provider it came from. */
export interface AcceptedOffer extends ProviderOffer {
  source: string;
}

export type RejectionReason =
  | "invalid"
  | "unknown-part"
  | "unknown-store"
  | "store-not-covered"
  | "seen-in-future"
  | "superseded";

export interface RejectedOffer {
  source: string;
  reason: RejectionReason;
  /** Zod's message for invalid offers, or the part@store key. */
  detail: string;
}

export interface ProviderResult {
  providerId: string;
  storeSlugs: readonly string[];
  /** Raw output, unknown because providers are outside code. */
  offers: readonly unknown[];
}

export interface ReconcileInput {
  results: readonly ProviderResult[];
  partSlugs: ReadonlySet<string>;
  storeSlugs: ReadonlySet<string>;
  now: Date;
}

/** Provider clocks may run slightly ahead; beyond this, seenAt is rejected. */
export const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

/**
 * Validates every provider offer and keeps one per part and store: the most
 * recently seen, or the earlier provider's on a tie. The database holds one
 * offer per part and store (see "Known limitations" in docs/architecture.md).
 */
export function reconcileOffers({
  results,
  partSlugs,
  storeSlugs,
  now,
}: ReconcileInput): { accepted: AcceptedOffer[]; rejected: RejectedOffer[] } {
  const best = new Map<string, AcceptedOffer>();
  const rejected: RejectedOffer[] = [];

  for (const { providerId: source, storeSlugs: covered, offers } of results) {
    for (const raw of offers) {
      const parsed = providerOfferSchema.safeParse(raw);
      if (!parsed.success) {
        rejected.push({
          source,
          reason: "invalid",
          detail: parsed.error.message,
        });
        continue;
      }
      const offer = parsed.data;
      const key = `${offer.partSlug}@${offer.storeSlug}`;

      const reason: RejectionReason | undefined = !partSlugs.has(offer.partSlug)
        ? "unknown-part"
        : !storeSlugs.has(offer.storeSlug)
          ? "unknown-store"
          : !covered.includes(offer.storeSlug)
            ? "store-not-covered"
            : offer.seenAt.getTime() > now.getTime() + MAX_CLOCK_SKEW_MS
              ? "seen-in-future"
              : undefined;
      if (reason) {
        rejected.push({ source, reason, detail: key });
        continue;
      }

      const current = best.get(key);
      if (current && current.seenAt >= offer.seenAt) {
        rejected.push({ source, reason: "superseded", detail: key });
        continue;
      }
      if (current) {
        rejected.push({
          source: current.source,
          reason: "superseded",
          detail: key,
        });
      }
      best.set(key, { ...offer, source });
    }
  }

  return { accepted: [...best.values()], rejected };
}
