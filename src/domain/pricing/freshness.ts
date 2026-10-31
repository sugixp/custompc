import { MANUAL_SOURCE } from "./sources";

/**
 * How much to trust an offer, by the time since its price was last seen.
 *
 * - fresh: shown normally and counted in build totals.
 * - stale: older than the source's staleAfterDays. Still shown, flagged as
 *   "desatualizado", and left out of build totals.
 * - expired: older than the source's expiredAfterDays. Hidden.
 *
 * Offers age out on their own when a provider stops reporting them, so the
 * sync never has to delete rows.
 */
export interface FreshnessPolicy {
  staleAfterDays: number;
  expiredAfterDays: number;
}

/** Collectors (and the seed) report daily, so a week-old price is stale. */
export const DEFAULT_FRESHNESS: FreshnessPolicy = {
  staleAfterDays: 7,
  expiredAfterDays: 30,
};

/** Sources checked less often than a daily collector get longer windows. */
export const FRESHNESS_BY_SOURCE: Readonly<Record<string, FreshnessPolicy>> = {
  // Reference prices are checked by hand, so a check holds for longer.
  [MANUAL_SOURCE]: { staleAfterDays: 10, expiredAfterDays: 45 },
};

export function freshnessPolicy(source: string): FreshnessPolicy {
  return FRESHNESS_BY_SOURCE[source] ?? DEFAULT_FRESHNESS;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export type OfferFreshness = "fresh" | "stale" | "expired";

export function offerFreshness(
  seenAt: Date,
  now: Date,
  source: string,
): OfferFreshness {
  const { staleAfterDays, expiredAfterDays } = freshnessPolicy(source);
  const ageMs = now.getTime() - seenAt.getTime();
  if (ageMs > expiredAfterDays * DAY_MS) return "expired";
  if (ageMs > staleAfterDays * DAY_MS) return "stale";
  return "fresh";
}

/** The longest any source keeps an offer visible. */
export const MAX_EXPIRED_AFTER_DAYS = Math.max(
  DEFAULT_FRESHNESS.expiredAfterDays,
  ...Object.values(FRESHNESS_BY_SOURCE).map((p) => p.expiredAfterDays),
);

/**
 * Earliest seenAt that any source still shows, for filtering in database
 * queries; offerFreshness then drops what its own source has expired.
 */
export function oldestVisibleSeenAt(now: Date): Date {
  return new Date(now.getTime() - MAX_EXPIRED_AFTER_DAYS * DAY_MS);
}
