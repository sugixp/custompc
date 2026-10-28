import { describe, expect, it } from "vitest";
import * as fx from "@/domain/parts/fixtures";
import type { Part } from "@/domain/parts";
import { applyFacetFilters, FACETS, facetOptions } from "./facets";
import {
  listingQuery,
  paginate,
  parseListingParams,
  sortListing,
} from "./listing";
import type { PriceSummary } from "./offers";

const cpuFacets = FACETS.CPU;

describe("parseListingParams", () => {
  it("reads sort, page and known facet filters", () => {
    expect(
      parseListingParams(
        { ordem: "nome", pagina: "2", soquete: "AM5", desconhecido: "x" },
        cpuFacets,
      ),
    ).toEqual({ sort: "nome", page: 2, filters: { soquete: "AM5" } });
  });

  it.each([
    ["an unknown sort", { ordem: "aleatorio" }],
    ["page 0", { pagina: "0" }],
    ["a non-numeric page", { pagina: "abc" }],
    ["a fractional page", { pagina: "1.5" }],
  ])("falls back to defaults on %s", (_, params) => {
    expect(parseListingParams(params, cpuFacets)).toEqual({
      sort: "preco",
      page: 1,
      filters: {},
    });
  });

  it("takes the first of repeated params and ignores blanks", () => {
    expect(
      parseListingParams({ soquete: ["AM4", "AM5"], marca: "  " }, cpuFacets)
        .filters,
    ).toEqual({ soquete: "AM4" });
  });
});

describe("listingQuery", () => {
  it("round-trips through parseListingParams", () => {
    const params = {
      sort: "preco-desc" as const,
      page: 3,
      filters: { marca: "AMD" },
    };
    const query = listingQuery(params);
    expect(query).toBe("?marca=AMD&ordem=preco-desc&pagina=3");
    const parsed = parseListingParams(
      Object.fromEntries(new URLSearchParams(query)),
      cpuFacets,
    );
    expect(parsed).toEqual(params);
  });

  it("leaves defaults out", () => {
    expect(listingQuery({ sort: "preco", page: 1, filters: {} })).toBe("");
  });

  it("encodes values", () => {
    expect(
      listingQuery({
        sort: "preco",
        page: 1,
        filters: { "placa-mae": "Micro-ATX & co" },
      }),
    ).toBe("?placa-mae=Micro-ATX+%26+co");
  });
});

const item = (part: Part, price: PriceSummary) => ({ part, price });
const intel = { ...fx.cpu, brand: "Intel", model: "Core i5" } as Part;
const amd = fx.cpu as Part;
const zen = { ...fx.cpu, model: "Ryzen 9" } as Part;

describe("sortListing", () => {
  const items = [
    item(intel, { kind: "price", fromCents: 200 }),
    item(amd, { kind: "no-recent-price" }),
    item(zen, { kind: "price", fromCents: 100 }),
  ];

  it("sorts by price, parts without a current price last", () => {
    expect(sortListing(items, "preco").map((i) => i.part.model)).toEqual([
      "Ryzen 9",
      "Core i5",
      "Ryzen 5 7600",
    ]);
    expect(sortListing(items, "preco-desc").map((i) => i.part.model)).toEqual([
      "Core i5",
      "Ryzen 9",
      "Ryzen 5 7600",
    ]);
  });

  it("sorts by brand and model", () => {
    expect(sortListing(items, "nome").map((i) => i.part.model)).toEqual([
      "Ryzen 5 7600",
      "Ryzen 9",
      "Core i5",
    ]);
  });
});

describe("paginate", () => {
  const numbers = Array.from({ length: 25 }, (_, i) => i);

  it("slices pages and counts them", () => {
    expect(paginate(numbers, 3, 10)).toEqual({
      items: [20, 21, 22, 23, 24],
      page: 3,
      pageCount: 3,
      total: 25,
    });
  });

  it("clamps a page past the end", () => {
    expect(paginate(numbers, 99, 10).page).toBe(3);
  });

  it("has one empty page for no items", () => {
    expect(paginate([], 1)).toEqual({
      items: [],
      page: 1,
      pageCount: 1,
      total: 0,
    });
  });
});

describe("facets", () => {
  const am4 = {
    ...fx.cpu,
    slug: "am4",
    specs: { ...fx.cpu.specs, socket: "AM4" },
  } as Part;
  const items = [{ part: fx.cpu as Part }, { part: am4 }];

  it("lists the distinct values in natural order", () => {
    const [, socket] = facetOptions(
      cpuFacets,
      items.map((i) => i.part),
    );
    expect(socket?.options).toEqual(["AM4", "AM5"]);
  });

  it("filters by every selected facet", () => {
    expect(applyFacetFilters(items, cpuFacets, { soquete: "AM4" })).toEqual([
      { part: am4 },
    ]);
    expect(
      applyFacetFilters(items, cpuFacets, { soquete: "AM4", marca: "Intel" }),
    ).toEqual([]);
    expect(applyFacetFilters(items, cpuFacets, {})).toEqual(items);
  });

  it("matches multi-valued facets on any value", () => {
    const coolerFacets = FACETS.COOLER;
    const items = [{ part: fx.airCooler as Part }];
    expect(
      applyFacetFilters(items, coolerFacets, { soquete: "LGA1700" }),
    ).toHaveLength(1);
  });
});
