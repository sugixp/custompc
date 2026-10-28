import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import type { AcceptedOffer } from "@/pricing/reconcile";
import { prismaOfferRepository, UPSERT_BATCH_SIZE } from "./offer-repository";

/**
 * Records the statements a sync sends, standing in for Prisma. Each
 * $executeRaw reports every row of its batch as written, unless told to
 * drop some (a part deleted mid-sync).
 */
function fakePrisma({ dropRows = 0 } = {}) {
  const statements: unknown[][] = [];
  const transactions: { timeout?: number }[] = [];
  const tx = {
    $executeRaw: async (_sql: TemplateStringsArray, ...values: unknown[]) => {
      statements.push(values);
      return (values[0] as unknown[]).length - dropRows;
    },
  };
  const prisma = {
    $transaction: async (
      run: (client: typeof tx) => Promise<void>,
      options: { timeout?: number },
    ) => {
      transactions.push(options);
      await run(tx);
    },
  } as unknown as PrismaClient;
  return { prisma, statements, transactions };
}

const offers = (count: number): AcceptedOffer[] =>
  Array.from({ length: count }, (_, i) => ({
    partSlug: `part-${i}`,
    storeSlug: "kabum",
    priceCents: 10_000 + i,
    url: `https://www.kabum.com.br/busca/part-${i}`,
    inStock: i % 2 === 0,
    seenAt: new Date("2026-11-10T12:00:00Z"),
    source: "seed",
  }));

describe("prismaOfferRepository.upsertOffers", () => {
  it("writes many offers in a few statements inside one transaction", async () => {
    const { prisma, statements, transactions } = fakePrisma();
    await prismaOfferRepository(prisma).upsertOffers(
      offers(2 * UPSERT_BATCH_SIZE + 1),
    );
    expect(transactions).toHaveLength(1);
    expect(transactions[0]?.timeout).toBeGreaterThan(5_000);
    expect(statements.map((values) => (values[0] as unknown[]).length)).toEqual(
      [UPSERT_BATCH_SIZE, UPSERT_BATCH_SIZE, 1],
    );
  });

  it("sends one array per column, with seenAt as an ISO timestamp", async () => {
    const { prisma, statements } = fakePrisma();
    await prismaOfferRepository(prisma).upsertOffers(offers(2));
    expect(statements).toEqual([
      [
        ["part-0", "part-1"],
        ["kabum", "kabum"],
        [10_000, 10_001],
        [
          "https://www.kabum.com.br/busca/part-0",
          "https://www.kabum.com.br/busca/part-1",
        ],
        [true, false],
        ["2026-11-10T12:00:00.000Z", "2026-11-10T12:00:00.000Z"],
        ["seed", "seed"],
      ],
    ]);
  });

  it("fails the transaction when an offer's part or store is gone", async () => {
    const { prisma } = fakePrisma({ dropRows: 1 });
    await expect(
      prismaOfferRepository(prisma).upsertOffers(offers(3)),
    ).rejects.toThrow("Wrote 2 of 3 offers");
  });

  it("does nothing for no offers", async () => {
    const { prisma, transactions } = fakePrisma();
    await prismaOfferRepository(prisma).upsertOffers([]);
    expect(transactions).toEqual([]);
  });
});
