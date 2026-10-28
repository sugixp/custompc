import { describe, expect, it } from "vitest";
import type { BuilderEntry } from "@/builder/entry";
import { resolveBuild } from "@/builder/resolve";
import { summarizeSharedBuild } from "@/builder/share";
import { decodeBuild } from "@/builder/url";
import { categoryRoute } from "@/catalog/categories";
import type { ShownOffer } from "@/catalog/offers";
import type { Part } from "@/domain/parts";
import { parseSeedPart, parts } from "@/seed";
import { buildCard, categoryCard, partCard } from "./cards";
import { truncate } from "./text";

// Intl puts a no-break space (U+00A0) between "R$" and the amount.
const NBSP = " ";

const catalog = new Map<string, Part>(
  parts.map((p) => [p.slug, parseSeedPart(p)]),
);

const offer = (priceCents: number): ShownOffer => ({
  storeSlug: "kabum",
  storeName: "KaBuM!",
  priceCents,
  url: "https://www.kabum.com.br/",
  inStock: true,
  seenAt: new Date("2026-10-28T00:00:00Z"),
  source: "test",
  freshness: "fresh",
});

/** Every seed part priced at R$ 100,00, or the given price. */
function entries(prices: Record<string, number> = {}) {
  return new Map<string, BuilderEntry>(
    [...catalog.values()].map((part) => [
      part.slug,
      {
        part,
        offers: [offer(prices[part.slug] ?? 10_000)],
        price: { kind: "price", fromCents: prices[part.slug] ?? 10_000 },
      },
    ]),
  );
}

function shared(query: string, bySlug = entries()) {
  const { selection } = decodeBuild(new URLSearchParams(query));
  const resolved = resolveBuild(selection, (slug) => catalog.get(slug));
  return summarizeSharedBuild(resolved, bySlug);
}

describe("truncate", () => {
  it("keeps short text", () => {
    expect(truncate("AMD Ryzen 5 7600", 20)).toBe("AMD Ryzen 5 7600");
  });

  it("cuts on a word boundary with an ellipsis", () => {
    const cut = truncate("ASUS ROG Strix GeForce RTX 5090 OC Edition", 24);
    expect(cut).toBe("ASUS ROG Strix GeForce…");
    expect(cut.length).toBeLessThanOrEqual(24);
  });

  it("cuts inside a word when there is no space near the end", () => {
    expect(truncate("KF560C30BBEK2-64KF560C30BBEK2-64", 10)).toBe("KF560C30B…");
  });
});

describe("categoryCard", () => {
  const cpus = categoryRoute("CPU");

  it("shows the lowest current price of the category", () => {
    const card = categoryCard(cpus, [
      { kind: "price", fromCents: 120_000 },
      { kind: "out-of-stock" },
      { kind: "price", fromCents: 81_990 },
    ]);
    expect(card.title).toBe("Processadores");
    expect(card.eyebrow).toBe("Peças · 3 modelos");
    expect(card.stat).toEqual({
      label: "A partir de",
      value: `R$${NBSP}819,90`,
    });
  });

  it("says when no part has a recent price", () => {
    const card = categoryCard(cpus, [{ kind: "no-recent-price" }]);
    expect(card.stat).toMatchObject({
      value: "Sem preço recente",
      muted: true,
    });
  });
});

describe("partCard", () => {
  const cpu = catalog.get("amd-ryzen-5-7600")!;

  it("names the part with its key specs and price", () => {
    const card = partCard(cpu, { kind: "price", fromCents: 115_990 });
    expect(card.eyebrow).toBe("Processador");
    expect(card.title).toBe("AMD Ryzen 5 7600");
    expect(card.subtitle).toContain("AM5");
    expect(card.stat).toEqual({
      label: "A partir de",
      value: `R$${NBSP}1.159,90`,
    });
  });

  it("says when there is no recent price", () => {
    expect(partCard(cpu, { kind: "no-recent-price" }).stat).toMatchObject({
      value: "Sem preço recente",
    });
  });
});

describe("buildCard", () => {
  it("is null for a link without known parts", () => {
    expect(shared("cpu=nao-existe")).toBeNull();
  });

  it("shows CPU and GPU, the total and the problems", () => {
    // An AM5 CPU on an AM4 board: a socket error.
    const card = buildCard(
      shared(
        "cpu=amd-ryzen-5-7600&placa=asus-prime-b550m-a&gpu=asus-prime-rtx-5070-12g",
      )!,
    );
    expect(card.rows).toEqual([
      { label: "Processador", value: "AMD Ryzen 5 7600" },
      { label: "Placa de vídeo", value: "ASUS Prime GeForce RTX 5070 12GB" },
    ]);
    expect(card.eyebrow).toBe("Build compartilhada · 3 peças");
    expect(card.stat).toEqual({ label: "Total", value: `R$${NBSP}300,00` });
    expect(card.badge?.tone).toBe("error");
    expect(card.badge?.text).toMatch(/^\d+ problemas?$/);
  });

  it("counts quantities and says compatible with warnings", () => {
    // Missing parts are warnings, not errors.
    const card = buildCard(
      shared(
        "cpu=amd-ryzen-5-7600&ram=kingston-fury-beast-ddr5-6000-cl30-2x16gb*2",
      )!,
    );
    expect(card.eyebrow).toBe("Build compartilhada · 3 peças");
    expect(card.stat).toEqual({ label: "Total", value: `R$${NBSP}300,00` });
    expect(card.badge).toMatchObject({ tone: "warn" });
    expect(card.badge?.text).toMatch(/^Compatível · \d+ avisos?$/);
  });

  it("falls back to the first parts without CPU or GPU", () => {
    const card = buildCard(shared("disco=kingston-nv3-1tb")!);
    expect(card.rows).toEqual([
      { label: "Armazenamento", value: "Kingston NV3 1TB (SNV3S/1000G)" },
    ]);
  });

  it("says when no part has a recent price", () => {
    const unpriced = entries();
    for (const entry of unpriced.values()) entry.offers = [];
    const card = buildCard(shared("cpu=amd-ryzen-5-7600", unpriced)!);
    expect(card.stat).toMatchObject({
      value: "Sem preço recente",
      muted: true,
    });
  });
});
