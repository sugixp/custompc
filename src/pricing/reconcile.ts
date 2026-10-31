import { offerFreshness } from "@/domain/pricing/freshness";
import { sourceRank } from "@/domain/pricing/sources";
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
  | "superseded"
  /** A stored offer from a higher-ranked source still holds the slot. */
  | "outranked";

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

/** What the database already holds for a part at a store. */
export interface StoredOffer {
  partSlug: string;
  storeSlug: string;
  source: string;
  seenAt: Date;
}

export interface ReconcileInput {
  results: readonly ProviderResult[];
  partSlugs: ReadonlySet<string>;
  storeSlugs: ReadonlySet<string>;
  now: Date;
  /** Offers already stored; absent means an empty database. */
  stored?: readonly StoredOffer[];
}

/** Provider clocks may run slightly ahead; beyond this, seenAt is rejected. */
export const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

/** True when a beats b: higher-ranked source first, then seen later. */
function outranks(
  a: { source: string; seenAt: Date },
  b: { source: string; seenAt: Date },
): boolean {
  const byRank = sourceRank(a.source) - sourceRank(b.source);
  return byRank !== 0 ? byRank > 0 : a.seenAt > b.seenAt;
}

/**
 * Validates every provider offer and keeps one per part and store. A real
 * price (hand-checked or collected) beats an illustrative seed price whatever
 * its seenAt; between equals the most recently seen wins, or the earlier
 * provider's on a tie. A stored offer that has not expired keeps its slot
 * against anything it outranks or that is older, so the daily seed sync
 * never overwrites a reference price, and an old spreadsheet never rolls a
 * newer one back. The database holds one offer per part and store (see
 * "Known limitations" in docs/architecture.md).
 */
export function reconcileOffers({
  results,
  partSlugs,
  storeSlugs,
  now,
  stored = [],
}: ReconcileInput): { accepted: AcceptedOffer[]; rejected: RejectedOffer[] } {
  const best = new Map<string, AcceptedOffer>();
  const rejected: RejectedOffer[] = [];
  const holding = new Map<string, StoredOffer>();
  for (const offer of stored) {
    if (offerFreshness(offer.seenAt, now, offer.source) !== "expired")
      holding.set(`${offer.partSlug}@${offer.storeSlug}`, offer);
  }

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

      const held = holding.get(key);
      if (held && sourceRank(held.source) > sourceRank(source)) {
        rejected.push({ source, reason: "outranked", detail: key });
        continue;
      }
      if (held && !outranks({ ...offer, source }, held)) {
        rejected.push({ source, reason: "superseded", detail: key });
        continue;
      }

      const current = best.get(key);
      if (current && !outranks({ ...offer, source }, current)) {
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
