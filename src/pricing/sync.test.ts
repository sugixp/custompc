import { describe, expect, it } from "vitest";
import type { PartRef, PriceProvider } from "./price-provider";
import type { AcceptedOffer, StoredOffer } from "./reconcile";
import { syncPrices, type OfferRepository } from "./sync";

const now = new Date("2026-11-10T12:00:00Z");

function memoryRepository(
  parts: PartRef[],
  storeSlugs: string[],
  stored: StoredOffer[] = [],
) {
  const written: AcceptedOffer[][] = [];
  const repository: OfferRepository = {
    listParts: async () => parts,
    listStoreSlugs: async () => storeSlugs,
    listOffers: async () => stored,
    upsertOffers: async (offers) => {
      written.push([...offers]);
    },
  };
  return { repository, written };
}

const part: PartRef = {
  slug: "amd-ryzen-5-7600",
  category: "CPU",
  brand: "AMD",
  model: "Ryzen 5 7600",
};

const provider = (
  id: string,
  fetchOffers: PriceProvider["fetchOffers"],
): PriceProvider => ({
  id,
  storeSlugs: ["kabum"],
  fetchOffers,
});

const kabumOffer = {
  partSlug: part.slug,
  storeSlug: "kabum",
  priceCents: 119_990,
  url: "https://www.kabum.com.br/busca/AMD%20Ryzen%205%207600",
  inStock: true,
  seenAt: now,
};

describe("syncPrices", () => {
  it("passes the catalog and the run time to each provider", async () => {
    const { repository } = memoryRepository([part], ["kabum"]);
    const calls: unknown[] = [];
    await syncPrices({
      providers: [
        provider("p", async (request) => {
          calls.push(request);
          return [];
        }),
      ],
      repository,
      now,
    });
    expect(calls).toEqual([{ parts: [part], now }]);
  });

  it("writes the accepted offers in one call", async () => {
    const { repository, written } = memoryRepository([part], ["kabum"]);
    const report = await syncPrices({
      providers: [provider("p", async () => [kabumOffer])],
      repository,
      now,
    });
    expect(report).toEqual({ written: 1, rejected: [], failedProviders: [] });
    expect(written).toEqual([[{ ...kabumOffer, source: "p" }]]);
  });

  it("keeps syncing the other providers when one throws", async () => {
    const { repository, written } = memoryRepository([part], ["kabum"]);
    const report = await syncPrices({
      providers: [
        provider("broken", async () => {
          throw new Error("store blocked the request");
        }),
        provider("ok", async () => [kabumOffer]),
      ],
      repository,
      now,
    });
    expect(report.failedProviders).toEqual([
      { providerId: "broken", error: "store blocked the request" },
    ]);
    expect(written[0]?.map((o) => o.source)).toEqual(["ok"]);
  });

  it("reports rejected offers without writing them", async () => {
    const { repository, written } = memoryRepository([part], ["kabum"]);
    const report = await syncPrices({
      providers: [
        provider("p", async () => [{ ...kabumOffer, priceCents: 0 }]),
      ],
      repository,
      now,
    });
    expect(report.written).toBe(0);
    expect(report.rejected.map((r) => r.reason)).toEqual(["invalid"]);
    expect(written).toEqual([[]]);
  });

  it("keeps a stored reference price when the seed reports the same pair", async () => {
    const stored: StoredOffer = {
      partSlug: part.slug,
      storeSlug: "kabum",
      source: "manual",
      seenAt: new Date("2026-11-05T12:00:00Z"),
    };
    const { repository, written } = memoryRepository(
      [part],
      ["kabum"],
      [stored],
    );
    const report = await syncPrices({
      providers: [provider("seed", async () => [kabumOffer])],
      repository,
      now,
    });
    expect(report.rejected.map((r) => r.reason)).toEqual(["outranked"]);
    expect(written).toEqual([[]]);
  });
});
