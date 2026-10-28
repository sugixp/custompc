import { describe, expect, it } from "vitest";
import * as fx from "@/domain/parts/fixtures";
import type { Part } from "@/domain/parts";
import { parseSeedPart, parts } from "@/seed";
import { CATEGORY_ROUTES, categoryRouteBySlug, partPath } from "./categories";
import { formatCapacity, formatGhz, formatSeenAt } from "./format";
import { keySpecs, NOT_STATED, specRows } from "./specs";

describe("format", () => {
  it.each([
    [3800, "3,8 GHz"],
    [5100, "5,1 GHz"],
    [4000, "4 GHz"],
  ])("formats %i MHz as %s", (mhz, expected) => {
    expect(formatGhz(mhz)).toBe(expected);
  });

  it.each([
    [480, "480 GB"],
    [1000, "1 TB"],
    [2000, "2 TB"],
    [32, "32 GB"],
  ])("formats %i GB as %s", (gb, expected) => {
    expect(formatCapacity(gb)).toBe(expected);
  });

  it("shows when an offer was seen in Brasília time", () => {
    expect(formatSeenAt(new Date("2026-10-27T15:00:00Z"))).toBe(
      "27/10/2026, 12:00",
    );
  });
});

describe("specRows", () => {
  it("formats a CPU sheet in pt-BR", () => {
    expect(specRows(fx.cpu as Part)).toContainEqual({
      label: "Clock base",
      value: "3,8 GHz",
    });
    expect(specRows(fx.cpu as Part)).toContainEqual({
      label: "Cooler na caixa",
      value: "Sim",
    });
  });

  it("says 'não informado' for values the manufacturer does not state", () => {
    const rows = specRows(fx.aioCooler as Part);
    expect(rows).toContainEqual({ label: "TDP suportado", value: NOT_STATED });
    expect(rows).toContainEqual({ label: "Radiador", value: "240 mm" });
  });

  it("describes GPU power connectors", () => {
    expect(specRows(fx.gpu as Part)).toContainEqual({
      label: "Conectores de energia",
      value: "1× 12V-2x6",
    });
  });

  it.each(parts.map((part) => [part.slug, parseSeedPart(part)] as const))(
    "renders every row and three key specs for %s",
    (_, part) => {
      for (const row of specRows(part)) {
        expect(row.label).not.toBe("");
        expect(row.value).not.toBe("");
      }
      expect(keySpecs(part)).toHaveLength(3);
    },
  );
});

describe("categories", () => {
  it("has a route for every category with unique slugs", () => {
    expect(new Set(CATEGORY_ROUTES.map((r) => r.category)).size).toBe(8);
    expect(new Set(CATEGORY_ROUTES.map((r) => r.slug)).size).toBe(8);
  });

  it("builds part paths", () => {
    expect(partPath("MOTHERBOARD", "asus-prime-b550m-a")).toBe(
      "/pecas/placas-mae/asus-prime-b550m-a",
    );
    expect(categoryRouteBySlug("placas-mae")?.category).toBe("MOTHERBOARD");
    expect(categoryRouteBySlug("monitores")).toBeUndefined();
  });
});
