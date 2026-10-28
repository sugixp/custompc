/**
 * How much to trust an offer, by the time since its price was last seen.
 *
 * - fresh: shown normally and counted in build totals.
 * - stale: older than OFFER_STALE_AFTER_DAYS. Still shown, flagged as
 *   "desatualizado", and left out of build totals.
 * - expired: older than OFFER_EXPIRED_AFTER_DAYS. Hidden.
 *
 * Offers age out on their own when a provider stops reporting them, so the
 * sync never has to delete rows.
 */
export const OFFER_STALE_AFTER_DAYS = 7;
export const OFFER_EXPIRED_AFTER_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export type OfferFreshness = "fresh" | "stale" | "expired";

export function offerFreshness(seenAt: Date, now: Date): OfferFreshness {
  const ageMs = now.getTime() - seenAt.getTime();
  if (ageMs > OFFER_EXPIRED_AFTER_DAYS * DAY_MS) return "expired";
  if (ageMs > OFFER_STALE_AFTER_DAYS * DAY_MS) return "stale";
  return "fresh";
}

/** Earliest seenAt that is not expired, for filtering in database queries. */
export function oldestVisibleSeenAt(now: Date): Date {
  return new Date(now.getTime() - OFFER_EXPIRED_AFTER_DAYS * DAY_MS);
}
