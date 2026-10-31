import { describe, expect, it } from "vitest";
import {
  DEFAULT_FRESHNESS,
  MAX_EXPIRED_AFTER_DAYS,
  freshnessPolicy,
  offerFreshness,
  oldestVisibleSeenAt,
} from "./freshness";
import { MANUAL_SOURCE, SEED_SOURCE } from "./sources";

const now = new Date("2026-11-10T12:00:00Z");
const daysAgo = (days: number, extraMs = 0) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000 - extraMs);

describe("offerFreshness", () => {
  it.each([
    ["seen just now", daysAgo(0), "fresh"],
    ["seen 6 days ago", daysAgo(6), "fresh"],
    ["exactly 7 days ago", daysAgo(7), "fresh"],
    ["7 days and 1 ms ago", daysAgo(7, 1), "stale"],
    ["29 days ago", daysAgo(29), "stale"],
    ["exactly 30 days ago", daysAgo(30), "stale"],
    ["30 days and 1 ms ago", daysAgo(30, 1), "expired"],
    // A clock slightly ahead at the provider must not break anything.
    ["seen in the future", daysAgo(-1), "fresh"],
  ] as const)("a seed offer %s is %s", (_, seenAt, expected) => {
    expect(offerFreshness(seenAt, now, SEED_SOURCE)).toBe(expected);
  });

  it.each([
    ["exactly 10 days ago", daysAgo(10), "fresh"],
    ["10 days and 1 ms ago", daysAgo(10, 1), "stale"],
    ["exactly 45 days ago", daysAgo(45), "stale"],
    ["45 days and 1 ms ago", daysAgo(45, 1), "expired"],
  ] as const)("a manual offer %s is %s", (_, seenAt, expected) => {
    expect(offerFreshness(seenAt, now, MANUAL_SOURCE)).toBe(expected);
  });

  it("gives unknown sources, like private collectors, the default", () => {
    expect(freshnessPolicy("some-collector")).toEqual(DEFAULT_FRESHNESS);
    expect(offerFreshness(daysAgo(8), now, "some-collector")).toBe("stale");
  });
});

describe("oldestVisibleSeenAt", () => {
  it("is the longest expiry boundary of any source", () => {
    expect(MAX_EXPIRED_AFTER_DAYS).toBe(45);
    const boundary = oldestVisibleSeenAt(now);
    expect(boundary).toEqual(daysAgo(45));
    expect(offerFreshness(boundary, now, MANUAL_SOURCE)).not.toBe("expired");
    expect(
      offerFreshness(new Date(boundary.getTime() - 1), now, MANUAL_SOURCE),
    ).toBe("expired");
  });
});
