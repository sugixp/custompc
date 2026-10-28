import { describe, expect, it } from "vitest";
import { storeLinkRel, summarizeOffers, type CatalogOffer } from "./offers";

const now = new Date("2026-11-10T12:00:00Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000);

const offer = (overrides: Partial<CatalogOffer>): CatalogOffer => ({
  storeSlug: "kabum",
  storeName: "KaBuM!",
  priceCents: 100_000,
  url: "https://www.kabum.com.br/busca/x",
  inStock: true,
  seenAt: daysAgo(1),
  source: "seed",
  ...overrides,
});

describe("summarizeOffers", () => {
  it("prices 'a partir de' from the cheapest fresh offer in stock", () => {
    const { price } = summarizeOffers(
      [
        offer({ storeName: "A", priceCents: 120_000 }),
        offer({ storeName: "B", priceCents: 99_990 }),
        offer({ storeName: "C", priceCents: 80_000, inStock: false }),
        offer({ storeName: "D", priceCents: 70_000, seenAt: daysAgo(10) }),
      ],
      now,
    );
    expect(price).toEqual({ kind: "price", fromCents: 99_990 });
  });

  it("says 'sem preço recente' when only stale offers remain", () => {
    const summary = summarizeOffers([offer({ seenAt: daysAgo(8) })], now);
    expect(summary.price).toEqual({ kind: "no-recent-price" });
    expect(summary.offers.map((o) => o.freshness)).toEqual(["stale"]);
  });

  it("says out of stock when fresh offers exist but none in stock", () => {
    const { price } = summarizeOffers([offer({ inStock: false })], now);
    expect(price).toEqual({ kind: "out-of-stock" });
  });

  it("drops expired offers entirely", () => {
    const summary = summarizeOffers([offer({ seenAt: daysAgo(31) })], now);
    expect(summary.offers).toEqual([]);
    expect(summary.price).toEqual({ kind: "no-recent-price" });
  });

  it("has no price without offers", () => {
    expect(summarizeOffers([], now)).toEqual({
      price: { kind: "no-recent-price" },
      offers: [],
    });
  });

  it("lists fresh before stale, in stock before out of stock, then cheapest", () => {
    const { offers } = summarizeOffers(
      [
        offer({ storeName: "stale", priceCents: 1_000, seenAt: daysAgo(9) }),
        offer({ storeName: "out", priceCents: 2_000, inStock: false }),
        offer({ storeName: "pricey", priceCents: 5_000 }),
        offer({ storeName: "cheap", priceCents: 3_000 }),
      ],
      now,
    );
    expect(offers.map((o) => o.storeName)).toEqual([
      "cheap",
      "pricey",
      "out",
      "stale",
    ]);
  });
});

describe("storeLinkRel", () => {
  it("never leaks the opener or the referrer", () => {
    expect(storeLinkRel()).toBe("noopener noreferrer");
  });

  it("marks affiliate links as sponsored", () => {
    expect(storeLinkRel({ sponsored: true })).toBe(
      "noopener noreferrer sponsored",
    );
  });
});
