import { describe, expect, it } from "vitest";
import type { ShownOffer } from "@/catalog/offers";
import { emptyBuild } from "@/domain/build/build";
import { IssueCode } from "@/domain/compatibility";
import type { Category, Part, PartOf } from "@/domain/parts";
import { parseSeedPart, parts } from "@/seed";
import { candidateBlockers } from "./candidates";
import { priceBuild } from "./pricing";
import { resolveBuild } from "./resolve";
import { decodeBuild, emptySelection } from "./url";

const catalog = new Map<string, Part>(
  parts.map((p) => [p.slug, parseSeedPart(p)]),
);
const lookup = (slug: string) => catalog.get(slug);
const part = (slug: string) => catalog.get(slug)!;
const partOf = <C extends Category>(category: C, slug: string) => {
  const found = part(slug);
  if (found.category !== category)
    throw new Error(`${slug} is not a ${category}`);
  return found as PartOf<C>;
};

describe("resolveBuild", () => {
  it("expands quantities into units for checkBuild", () => {
    const { selection } = decodeBuild(
      new URLSearchParams(
        "cpu=amd-ryzen-5-7600&ram=kingston-fury-beast-ddr5-6000-cl30-2x16gb*2",
      ),
    );
    const { build, unknown } = resolveBuild(selection, lookup);
    expect(build.cpu?.slug).toBe("amd-ryzen-5-7600");
    expect(build.memory).toHaveLength(2);
    expect(unknown).toEqual([]);
  });

  it("drops slugs that do not exist or belong to another category", () => {
    const { selection } = decodeBuild(
      new URLSearchParams(
        "cpu=asus-prime-rtx-5070-12g&gpu=no-such-gpu&disco=kingston-nv3-1tb",
      ),
    );
    const resolved = resolveBuild(selection, lookup);
    expect(resolved.unknown).toEqual([
      { param: "cpu", slug: "asus-prime-rtx-5070-12g" },
      { param: "gpu", slug: "no-such-gpu" },
    ]);
    expect(resolved.selection).toEqual({
      ...emptySelection(),
      STORAGE: [{ slug: "kingston-nv3-1tb", quantity: 1 }],
    });
    expect(resolved.build.cpu).toBeUndefined();
  });
});

describe("candidateBlockers", () => {
  const am5Build = { ...emptyBuild(), cpu: partOf("CPU", "amd-ryzen-5-7600") };

  it("explains why a board does not fit the CPU", () => {
    const blockers = candidateBlockers(am5Build, part("asus-prime-b550m-a"));
    expect(blockers.map((i) => i.code)).toEqual([IssueCode.CpuSocketMismatch]);
  });

  it("finds nothing wrong with a fitting board", () => {
    expect(
      candidateBlockers(am5Build, part("asus-tuf-gaming-b650m-plus-wifi")),
    ).toEqual([]);
  });

  it("ignores warnings and errors about other categories", () => {
    // A tray CPU without a cooler only warns.
    expect(
      candidateBlockers(emptyBuild(), part("amd-ryzen-7-7800x3d")),
    ).toEqual([]);
  });

  it("counts a memory kit on top of the ones already picked", () => {
    const itx = {
      ...emptyBuild(),
      motherboard: partOf("MOTHERBOARD", "asus-rog-strix-b650e-i-gaming-wifi"),
      memory: [partOf("MEMORY", "kingston-fury-beast-ddr5-6000-cl30-2x16gb")],
    };
    const blockers = candidateBlockers(
      itx,
      part("kingston-fury-beast-ddr5-6000-cl30-2x16gb"),
    );
    expect(blockers.map((i) => i.code)).toEqual([
      IssueCode.MemorySlotsExceeded,
    ]);
  });
});

describe("priceBuild", () => {
  const seenAt = new Date("2026-11-10T12:00:00Z");
  const offer = (
    storeSlug: string,
    priceCents: number,
    extra: Partial<ShownOffer> = {},
  ): ShownOffer => ({
    storeSlug,
    storeName: storeSlug.toUpperCase(),
    priceCents,
    url: `https://${storeSlug}.example/x`,
    inStock: true,
    seenAt,
    source: "seed",
    freshness: "fresh",
    ...extra,
  });
  const cpu = part("amd-ryzen-5-7600");
  const ram = part("kingston-fury-beast-ddr5-6000-cl30-2x16gb");
  const ssd = part("kingston-nv3-1tb");

  const result = priceBuild([
    { part: cpu, quantity: 1, offers: [offer("a", 1000), offer("b", 900)] },
    {
      part: ram,
      quantity: 2,
      offers: [offer("a", 300), offer("b", 250, { inStock: false })],
    },
    {
      part: ssd,
      quantity: 1,
      offers: [offer("a", 200, { freshness: "stale" })],
    },
  ]);

  it("totals the cheapest current offer in stock per line, times quantity", () => {
    // cpu at b (900) + 2 x ram at a (600); the ssd has only a stale offer.
    expect(result.totalCents).toBe(1500);
    expect(result.lines.map((l) => l.best?.storeSlug ?? null)).toEqual([
      "b",
      "a",
      null,
    ]);
  });

  it("lists parts without a current price", () => {
    expect(result.unpriced.map((p) => p.slug)).toEqual(["kingston-nv3-1tb"]);
  });

  it("totals each store, best coverage first", () => {
    expect(result.stores).toEqual([
      {
        storeSlug: "a",
        storeName: "A",
        totalCents: 1600,
        missing: 1,
        illustrative: true,
      },
      {
        storeSlug: "b",
        storeName: "B",
        totalCents: 900,
        missing: 2,
        illustrative: true,
      },
    ]);
  });

  it("flags totals that count an illustrative price", () => {
    expect(result.illustrative).toBe(true);
    const real = priceBuild([
      {
        part: cpu,
        quantity: 1,
        offers: [offer("a", 900, { source: "manual" }), offer("b", 950)],
      },
    ]);
    expect(real.illustrative).toBe(false);
    expect(real.stores.map((s) => [s.storeSlug, s.illustrative])).toEqual([
      ["a", false],
      ["b", true],
    ]);
  });

  it("prefers a real price over an illustrative one at the same amount", () => {
    const tie = priceBuild([
      {
        part: cpu,
        quantity: 1,
        offers: [offer("a", 900), offer("b", 900, { source: "manual" })],
      },
    ]);
    expect(tie.lines[0]?.best?.storeSlug).toBe("b");
    expect(tie.illustrative).toBe(false);
  });

  it("prices an empty build at zero", () => {
    expect(priceBuild([])).toEqual({
      lines: [],
      totalCents: 0,
      unpriced: [],
      illustrative: false,
      stores: [],
    });
  });
});
