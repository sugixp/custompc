import { describe, expect, it } from "vitest";
import {
  MAX_CLOCK_SKEW_MS,
  reconcileOffers,
  type ProviderResult,
  type StoredOffer,
} from "./reconcile";

const now = new Date("2026-11-10T12:00:00Z");
const earlier = new Date("2026-11-09T12:00:00Z");

const offer = (overrides: Record<string, unknown> = {}) => ({
  partSlug: "amd-ryzen-5-7600",
  storeSlug: "kabum",
  priceCents: 119_990,
  url: "https://www.kabum.com.br/busca/AMD%20Ryzen%205%207600",
  inStock: true,
  seenAt: now,
  ...overrides,
});

const result = (providerId: string, offers: unknown[]): ProviderResult => ({
  providerId,
  storeSlugs: ["kabum", "pichau"],
  offers,
});

function reconcile(results: ProviderResult[], stored: StoredOffer[] = []) {
  return reconcileOffers({
    results,
    partSlugs: new Set(["amd-ryzen-5-7600", "intel-core-i5-14400f"]),
    storeSlugs: new Set(["kabum", "pichau", "amazon"]),
    now,
    stored,
  });
}

const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000);

const storedOffer = (source: string, seenAt: Date): StoredOffer => ({
  partSlug: "amd-ryzen-5-7600",
  storeSlug: "kabum",
  source,
  seenAt,
});

const KEY = "amd-ryzen-5-7600@kabum";

describe("reconcileOffers", () => {
  it("accepts a valid offer and tags its source", () => {
    const { accepted, rejected } = reconcile([result("seed", [offer()])]);
    expect(accepted).toEqual([{ ...offer(), source: "seed" }]);
    expect(rejected).toEqual([]);
  });

  it.each([
    ["a float price", { priceCents: 1199.9 }],
    ["a zero price", { priceCents: 0 }],
    ["an http link", { url: "http://www.kabum.com.br/busca/x" }],
    ["a missing inStock", { inStock: undefined }],
    ["seenAt as a string", { seenAt: "2026-11-10" }],
    ["a malformed slug", { partSlug: "Ryzen 5" }],
  ])("rejects an offer with %s as invalid", (_, overrides) => {
    const { accepted, rejected } = reconcile([result("p", [offer(overrides)])]);
    expect(accepted).toEqual([]);
    expect(rejected.map((r) => r.reason)).toEqual(["invalid"]);
  });

  it.each([
    ["unknown-part", { partSlug: "not-in-catalog" }],
    ["unknown-store", { storeSlug: "unknown-store" }],
    // amazon exists, but this provider does not claim to cover it.
    ["store-not-covered", { storeSlug: "amazon" }],
    [
      "seen-in-future",
      { seenAt: new Date(now.getTime() + MAX_CLOCK_SKEW_MS + 1) },
    ],
  ])("rejects %s", (reason, overrides) => {
    const { accepted, rejected } = reconcile([result("p", [offer(overrides)])]);
    expect(accepted).toEqual([]);
    expect(rejected.map((r) => r.reason)).toEqual([reason]);
  });

  it("tolerates small clock skew", () => {
    const seenAt = new Date(now.getTime() + MAX_CLOCK_SKEW_MS);
    expect(reconcile([result("p", [offer({ seenAt })])]).accepted).toHaveLength(
      1,
    );
  });

  it("keeps the most recently seen offer for the same part and store", () => {
    const { accepted, rejected } = reconcile([
      result("old", [offer({ seenAt: earlier, priceCents: 100_000 })]),
      result("new", [offer({ priceCents: 110_000 })]),
    ]);
    expect(accepted).toEqual([
      { ...offer({ priceCents: 110_000 }), source: "new" },
    ]);
    expect(rejected).toEqual([
      { source: "old", reason: "superseded", detail: "amd-ryzen-5-7600@kabum" },
    ]);
  });

  it("keeps the earlier provider's offer on a tie", () => {
    const { accepted } = reconcile([
      result("first", [offer({ priceCents: 100_000 })]),
      result("second", [offer({ priceCents: 90_000 })]),
    ]);
    expect(accepted.map((o) => o.source)).toEqual(["first"]);
  });

  it("keeps offers for different stores apart", () => {
    const { accepted } = reconcile([
      result("p", [offer(), offer({ storeSlug: "pichau" })]),
    ]);
    expect(accepted.map((o) => o.storeSlug)).toEqual(["kabum", "pichau"]);
  });

  it("does not let one bad offer sink the rest", () => {
    const { accepted, rejected } = reconcile([
      result("p", [
        offer({ priceCents: -1 }),
        offer({ partSlug: "intel-core-i5-14400f" }),
      ]),
    ]);
    expect(accepted).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  });
});

describe("source priority", () => {
  it("lets a real price beat the seed in the same run, however old", () => {
    const { accepted, rejected } = reconcile([
      result("seed", [offer()]),
      result("manual", [offer({ seenAt: daysAgo(9), priceCents: 99_990 })]),
    ]);
    expect(accepted.map((o) => o.source)).toEqual(["manual"]);
    expect(rejected).toEqual([
      { source: "seed", reason: "superseded", detail: KEY },
    ]);
  });

  it("keeps a stored reference price against the daily seed sync", () => {
    const { accepted, rejected } = reconcile(
      [result("seed", [offer()])],
      [storedOffer("manual", daysAgo(30))],
    );
    expect(accepted).toEqual([]);
    expect(rejected).toEqual([
      { source: "seed", reason: "outranked", detail: KEY },
    ]);
  });

  it("lets the seed fill the slot once the reference price expired", () => {
    const { accepted } = reconcile(
      [result("seed", [offer()])],
      [storedOffer("manual", daysAgo(46))],
    );
    expect(accepted.map((o) => o.source)).toEqual(["seed"]);
  });

  it("replaces a stored seed offer with a real price", () => {
    const { accepted } = reconcile(
      [result("manual", [offer({ seenAt: daysAgo(2) })])],
      [storedOffer("seed", now)],
    );
    expect(accepted.map((o) => o.source)).toEqual(["manual"]);
  });

  it("never rolls a newer reference price back to an older one", () => {
    const { accepted, rejected } = reconcile(
      [result("manual", [offer({ seenAt: daysAgo(5) })])],
      [storedOffer("manual", daysAgo(2))],
    );
    expect(accepted).toEqual([]);
    expect(rejected).toEqual([
      { source: "manual", reason: "superseded", detail: KEY },
    ]);
  });

  it("refreshes a stored offer of the same source with a newer one", () => {
    const { accepted } = reconcile(
      [result("seed", [offer()])],
      [storedOffer("seed", daysAgo(1))],
    );
    expect(accepted.map((o) => o.source)).toEqual(["seed"]);
  });
});
