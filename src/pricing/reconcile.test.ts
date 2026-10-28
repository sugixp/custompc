import { describe, expect, it } from "vitest";
import {
  MAX_CLOCK_SKEW_MS,
  reconcileOffers,
  type ProviderResult,
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

function reconcile(results: ProviderResult[]) {
  return reconcileOffers({
    results,
    partSlugs: new Set(["amd-ryzen-5-7600", "intel-core-i5-14400f"]),
    storeSlugs: new Set(["kabum", "pichau", "amazon"]),
    now,
  });
}

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
