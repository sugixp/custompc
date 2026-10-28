import { describe, expect, it } from "vitest";
import {
  OFFER_EXPIRED_AFTER_DAYS,
  OFFER_STALE_AFTER_DAYS,
  offerFreshness,
  oldestVisibleSeenAt,
} from "./freshness";

const now = new Date("2026-11-10T12:00:00Z");
const daysAgo = (days: number, extraMs = 0) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000 - extraMs);

describe("offerFreshness", () => {
  it.each([
    ["seen just now", daysAgo(0), "fresh"],
    ["seen 6 days ago", daysAgo(6), "fresh"],
    ["exactly 7 days ago", daysAgo(OFFER_STALE_AFTER_DAYS), "fresh"],
    ["7 days and 1 ms ago", daysAgo(OFFER_STALE_AFTER_DAYS, 1), "stale"],
    ["29 days ago", daysAgo(29), "stale"],
    ["exactly 30 days ago", daysAgo(OFFER_EXPIRED_AFTER_DAYS), "stale"],
    ["30 days and 1 ms ago", daysAgo(OFFER_EXPIRED_AFTER_DAYS, 1), "expired"],
    // A clock slightly ahead at the provider must not break anything.
    ["seen in the future", daysAgo(-1), "fresh"],
  ] as const)("%s is %s", (_, seenAt, expected) => {
    expect(offerFreshness(seenAt, now)).toBe(expected);
  });
});

describe("oldestVisibleSeenAt", () => {
  it("is the expiry boundary", () => {
    const boundary = oldestVisibleSeenAt(now);
    expect(boundary).toEqual(daysAgo(OFFER_EXPIRED_AFTER_DAYS));
    expect(offerFreshness(boundary, now)).not.toBe("expired");
    expect(offerFreshness(new Date(boundary.getTime() - 1), now)).toBe(
      "expired",
    );
  });
});
