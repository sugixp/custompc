import { describe, expect, it } from "vitest";
import type { Build } from "@/domain/build/build";
import { checkBuild } from "@/domain/compatibility";
import { CATEGORIES, type Part, type PartOf } from "@/domain/parts";
import { offers, parseSeedPart, parts, scenarios, stores } from ".";

// Validates the seed files without a database.

const bySlug = new Map<string, Part>(
  parts.map((part) => [part.slug, parseSeedPart(part)]),
);

function pick<C extends Part["category"]>(
  category: C,
  slug: string,
): PartOf<C> {
  const part = bySlug.get(slug);
  if (!part) throw new Error(`Unknown part slug "${slug}"`);
  if (part.category !== category)
    throw new Error(`"${slug}" is a ${part.category}, not a ${category}`);
  return part as PartOf<C>;
}

describe("seed parts", () => {
  it.each(parts.map((part) => [part.slug, part] as const))(
    "%s matches its schema",
    (_, part) => {
      expect(() => parseSeedPart(part)).not.toThrow();
    },
  );

  it("has unique slugs", () => {
    expect(bySlug.size).toBe(parts.length);
  });

  it("covers every category", () => {
    const present = new Set(parts.map((part) => part.category));
    expect([...present].sort()).toEqual([...CATEGORIES].sort());
  });

  it("cites at least one https manufacturer page per part", () => {
    for (const part of parts) {
      expect(part.specSourceUrls.length).toBeGreaterThan(0);
      for (const url of part.specSourceUrls)
        expect(new URL(url).protocol).toBe("https:");
    }
  });

  it("uses whole-centavo reference prices", () => {
    for (const part of parts)
      expect(Number.isSafeInteger(part.referencePriceCents)).toBe(true);
  });
});

describe("seed offers", () => {
  it("only references known parts and stores", () => {
    const storeSlugs = new Set(stores.map((store) => store.slug));
    for (const offer of offers) {
      expect(bySlug.has(offer.partSlug)).toBe(true);
      expect(storeSlugs.has(offer.storeSlug)).toBe(true);
    }
  });

  it("has at most one offer per part and store", () => {
    const keys = offers.map((offer) => `${offer.partSlug}@${offer.storeSlug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("gives every part at least one offer", () => {
    const offered = new Set(offers.map((offer) => offer.partSlug));
    expect(offered.size).toBe(parts.length);
  });

  it("prices in whole centavos ending in ,90", () => {
    for (const offer of offers) {
      expect(Number.isSafeInteger(offer.priceCents)).toBe(true);
      expect(offer.priceCents % 100).toBe(90);
    }
  });

  it("is deterministic", async () => {
    const { buildOffers } = await import("./offers");
    expect(buildOffers(parts)).toEqual(offers);
  });
});

describe("store search links", () => {
  it.each(stores.map((store) => [store.slug, store] as const))(
    "%s encodes the search term",
    (_, store) => {
      const url = new URL(
        store.searchUrl('Core i5-14400F 2x16GB "box" & more/less'),
      );
      expect(url.origin).toMatch(/^https:\/\//);
      // Raw spaces, quotes, ampersands and slashes would break the query or path.
      expect(url.href).not.toMatch(/[ "]/);
      expect(url.href).toContain("i5-14400F");
      expect(url.href).toContain("%26");
      expect(url.href).toContain("%2F");
    },
  );

  it("never carries affiliate or tracking parameters", () => {
    for (const offer of offers) {
      const params = [...new URL(offer.url).searchParams.keys()];
      expect(
        params.filter((key) => /tag|aff|ref|utm|matt_/i.test(key)),
      ).toEqual([]);
    }
  });
});

describe("demo scenarios", () => {
  it.each(scenarios.map((scenario) => [scenario.name, scenario] as const))(
    "%s raises exactly the expected issues",
    (_, scenario) => {
      const { parts: slugs } = scenario;
      const build: Build = {
        cpu: slugs.cpu ? pick("CPU", slugs.cpu) : undefined,
        motherboard: slugs.motherboard
          ? pick("MOTHERBOARD", slugs.motherboard)
          : undefined,
        memory: (slugs.memory ?? []).map((slug) => pick("MEMORY", slug)),
        gpu: slugs.gpu ? pick("GPU", slugs.gpu) : undefined,
        storage: (slugs.storage ?? []).map((slug) => pick("STORAGE", slug)),
        psu: slugs.psu ? pick("PSU", slugs.psu) : undefined,
        pcCase: slugs.pcCase ? pick("CASE", slugs.pcCase) : undefined,
        cooler: slugs.cooler ? pick("COOLER", slugs.cooler) : undefined,
      };
      expect(checkBuild(build).map((issue) => issue.code)).toEqual(
        scenario.expected,
      );
    },
  );

  it("have unique names", () => {
    const names = scenarios.map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
