import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parts, stores } from "@/seed";
import {
  manualPriceProvider,
  parseCheckedOn,
  parseInStock,
  parsePriceBrl,
  parsePriceCsv,
  priceTemplateCsv,
} from "./manual-csv";

const now = new Date("2026-10-31T18:00:00Z");
const partSlugs = new Set(parts.map((part) => part.slug));
const parse = (text: string, at = now) =>
  parsePriceCsv(text, { stores, partSlugs, now: at });

const HEADER = "part_slug;store_slug;price_brl;url;checked_on;in_stock";
const KABUM = "https://www.kabum.com.br/produto/123/ryzen";
const row = (fields: Partial<Record<string, string>> = {}) =>
  [
    fields.part ?? "amd-ryzen-5-7600",
    fields.store ?? "kabum",
    fields.price ?? "1.199,90",
    fields.url ?? KABUM,
    fields.date ?? "30/10/2026",
    fields.stock ?? "",
  ].join(";");

describe("parsePriceBrl", () => {
  it.each([
    ["1.199,90", 119_990],
    ["1199,9", 119_990],
    ["R$ 1.199,90", 119_990],
    ["R$ 1.199,90", 119_990],
    ["1199.90", 119_990],
    ["1199", 119_900],
    ["1.199", 119_900],
    ["12.345.678,01", 1_234_567_801],
  ])("reads %j as %d centavos", (raw, cents) => {
    expect(parsePriceBrl(raw)).toBe(cents);
  });

  it.each(["", "abc", "1,999", "1.19.9", "-10", "1199,901"])(
    "rejects %j",
    (raw) => {
      expect(parsePriceBrl(raw)).toBeNull();
    },
  );
});

describe("parseCheckedOn", () => {
  it("reads both date formats as noon in São Paulo", () => {
    const expected = new Date("2026-10-31T15:00:00Z");
    expect(parseCheckedOn("31/10/2026")).toEqual(expected);
    expect(parseCheckedOn("2026-10-31")).toEqual(expected);
    expect(parseCheckedOn("1/9/2026")).toEqual(
      new Date("2026-09-01T15:00:00Z"),
    );
  });

  it.each(["31/02/2026", "2026-13-01", "10/31/2026", "ontem", ""])(
    "rejects %j",
    (raw) => {
      expect(parseCheckedOn(raw)).toBeNull();
    },
  );
});

describe("parseInStock", () => {
  it.each([
    ["", true],
    ["Sim", true],
    ["1", true],
    ["não", false],
    ["NAO", false],
    ["false", false],
    ["talvez", null],
  ])("reads %j as %s", (raw, expected) => {
    expect(parseInStock(raw)).toBe(expected);
  });
});

describe("parsePriceCsv", () => {
  it("reads a row as an offer", () => {
    const { offers, errors, skipped } = parse(`${HEADER}\n${row()}\n`);
    expect(errors).toEqual([]);
    expect(skipped).toEqual([]);
    expect(offers).toEqual([
      {
        partSlug: "amd-ryzen-5-7600",
        storeSlug: "kabum",
        priceCents: 119_990,
        url: KABUM,
        inStock: true,
        seenAt: new Date("2026-10-30T15:00:00Z"),
      },
    ]);
  });

  it("handles Excel's BOM, CRLF, quotes and a comma delimiter", () => {
    const text =
      "﻿part_slug,store_slug,price_brl,url,checked_on\r\n" +
      `amd-ryzen-5-7600,kabum,"1.199,90",${KABUM},2026-10-30\r\n`;
    const { offers, errors } = parse(text);
    expect(errors).toEqual([]);
    expect(offers.map((o) => o.priceCents)).toEqual([119_990]);
  });

  it("skips template rows nobody filled in, and blank lines", () => {
    const blank = row({ price: "", url: "", date: "" });
    const { offers, skipped, errors } = parse(
      `${HEADER}\n${blank}\n;;;;;\n\n${row()}\n`,
    );
    expect(errors).toEqual([]);
    expect(skipped).toEqual([2]);
    expect(offers).toHaveLength(1);
  });

  it("reports every bad row with its line number", () => {
    const text = [
      HEADER,
      row({ part: "nao-existe" }),
      row({ store: "loja-x" }),
      row({ price: "" }),
      row({ url: "http://www.kabum.com.br/x" }),
      row({ url: "https://www.pichau.com.br/x" }),
      row({ date: "32/10/2026" }),
      row({ date: "01/11/2027" }),
      row({ stock: "talvez" }),
      row(),
      row({ price: "999,00" }),
    ].join("\n");
    const { offers, errors } = parse(text);
    expect(offers).toHaveLength(1);
    expect(errors.map((e) => e.line)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 11]);
    expect(errors.at(-1)?.message).toBe(
      "amd-ryzen-5-7600@kabum repete a linha 10",
    );
  });

  it("accepts a store subdomain, as Mercado Livre uses", () => {
    const { errors } = parse(
      `${HEADER}\n${row({ store: "mercado-livre", url: "https://produto.mercadolivre.com.br/MLB-1" })}`,
    );
    expect(errors).toEqual([]);
  });

  it("names the missing columns", () => {
    const { errors } = parse("part_slug;price_brl\n");
    expect(errors).toEqual([
      {
        line: 1,
        message: "faltam as colunas store_slug, url, checked_on no cabeçalho",
      },
    ]);
  });

  it("parses the example file without errors", () => {
    const text = readFileSync("data/prices.example.csv", "utf8");
    const { offers, skipped, errors } = parse(text);
    expect(errors).toEqual([]);
    expect(offers).toHaveLength(3);
    expect(skipped).toEqual([5]);
    expect(offers.find((o) => o.inStock === false)?.partSlug).toBe(
      "kingston-nv3-1tb",
    );
  });
});

describe("manualPriceProvider", () => {
  it("reports its offers as source manual, never ahead of the sync", async () => {
    const { offers } = parse(`${HEADER}\n${row({ date: "31/10/2026" })}`);
    const provider = manualPriceProvider(offers, ["kabum"]);
    expect(provider.id).toBe("manual");
    const early = new Date("2026-10-31T11:00:00Z");
    const [offer] = await provider.fetchOffers({
      parts: [{ ...parts[0]!, slug: "amd-ryzen-5-7600" }],
      now: early,
    });
    expect(offer?.seenAt).toEqual(early);
  });
});

describe("priceTemplateCsv", () => {
  const rows = [
    {
      partSlug: "amd-ryzen-5-7600",
      storeSlug: "kabum",
      url: KABUM,
      partName: "AMD Ryzen 5 7600",
      searchUrl: "https://www.kabum.com.br/busca/AMD%20Ryzen%205%207600",
    },
    {
      partSlug: "kingston-nv3-1tb",
      storeSlug: "terabyte",
      partName: 'Kingston NV3; "1TB"',
      searchUrl: "https://www.terabyteshop.com.br/busca?str=x",
    },
  ];

  it("writes what Excel in Portuguese opens: BOM, semicolons, CRLF", () => {
    const text = priceTemplateCsv(rows);
    expect(text.startsWith("﻿part_slug;store_slug;")).toBe(true);
    expect(text.split("\r\n")[2]).toBe(
      'kingston-nv3-1tb;terabyte;;;;;"Kingston NV3; ""1TB""";https://www.terabyteshop.com.br/busca?str=x',
    );
  });

  it("imports as blank rows until filled in", () => {
    const { offers, skipped, errors } = parse(priceTemplateCsv(rows));
    expect(errors).toEqual([]);
    expect(offers).toEqual([]);
    expect(skipped).toEqual([2, 3]);
  });
});
