import { MANUAL_SOURCE } from "@/domain/pricing/sources";
import type { PriceProvider, ProviderOffer } from "../price-provider";

/**
 * Reference prices checked by hand, read from a spreadsheet saved as CSV:
 *
 *   part_slug;store_slug;price_brl;url;checked_on;in_stock
 *   amd-ryzen-5-7600;kabum;1.199,90;https://www.kabum.com.br/produto/…;31/10/2026;sim
 *
 * Built for what Excel in Portuguese writes: ";" or "," between fields
 * (whichever the header uses), a decimal comma or point, dates as
 * DD/MM/YYYY or YYYY-MM-DD, an optional UTF-8 BOM, quoted fields. in_stock
 * may be left blank (in stock). Rows with neither price nor checked_on are
 * skipped (a template may come with links filled in), so a half-filled
 * template imports what is filled.
 */

export const CSV_COLUMNS = [
  "part_slug",
  "store_slug",
  "price_brl",
  "url",
  "checked_on",
  "in_stock",
] as const;

const REQUIRED = CSV_COLUMNS.filter((column) => column !== "in_stock");

export interface CsvStore {
  slug: string;
  siteUrl: string;
}

export interface CsvProblem {
  /** 1-based line in the file, as a spreadsheet shows it. */
  line: number;
  message: string;
}

export interface ParsedPriceCsv {
  offers: ProviderOffer[];
  /** Template rows nobody filled in yet. */
  skipped: number[];
  errors: CsvProblem[];
}

/** Splits CSV text into rows of fields; quotes may hold the delimiter. */
function splitCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * "1.199,90", "1199,9", "R$ 1.199,90", "1199.90" and "1199" to centavos,
 * without floating point. A point followed by exactly three digits is a
 * thousands separator unless a comma follows.
 */
export function parsePriceBrl(raw: string): number | null {
  let value = raw.replace(/R\$/i, "").replace(/\s/g, "");
  if (value.includes(",")) value = value.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(value)) value = value.replace(/\./g, "");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return null;
  const [, reais, centavos = ""] = match;
  return Number(reais) * 100 + Number(centavos.padEnd(2, "0"));
}

/**
 * A check day as an instant: noon in São Paulo (UTC-3, no daylight saving
 * since 2019), so the date reads the same in any time zone.
 */
export function parseCheckedOn(raw: string): Date | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  const [year, month, day] = iso
    ? [iso[1], iso[2], iso[3]].map(Number)
    : br
      ? [br[3], br[2], br[1]].map(Number)
      : [];
  if (year === undefined || month === undefined || day === undefined)
    return null;
  const date = new Date(Date.UTC(year, month - 1, day, 15));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date
    : null;
}

const YES = new Set(["", "sim", "s", "yes", "y", "true", "1"]);
const NO = new Set(["não", "nao", "n", "no", "false", "0"]);

export function parseInStock(raw: string): boolean | null {
  const value = raw.trim().toLowerCase();
  return YES.has(value) ? true : NO.has(value) ? false : null;
}

/** The store's own domain, so www.kabum.com.br and kabum.com.br both match. */
function storeDomain(siteUrl: string): string {
  return new URL(siteUrl).hostname.replace(/^www\./, "");
}

/** A check dated noon today may be up to 12 h ahead of the clock. */
const MAX_DATE_AHEAD_MS = 12 * 60 * 60 * 1000;

export function parsePriceCsv(
  text: string,
  {
    stores,
    partSlugs,
    now,
  }: {
    stores: readonly CsvStore[];
    partSlugs: ReadonlySet<string>;
    now: Date;
  },
): ParsedPriceCsv {
  const offers: ProviderOffer[] = [];
  const skipped: number[] = [];
  const errors: CsvProblem[] = [];

  const body = text.replace(/^﻿/, "");
  const firstLine = body.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = firstLine.includes(";") ? ";" : ",";
  const [header = [], ...rows] = splitCsv(body, delimiter);
  const columns = header.map((name) => name.trim().toLowerCase());
  const missing = REQUIRED.filter((name) => !columns.includes(name));
  if (missing.length > 0) {
    errors.push({
      line: 1,
      message: `faltam as colunas ${missing.join(", ")} no cabeçalho`,
    });
    return { offers, skipped, errors };
  }

  const domains = new Map(stores.map((s) => [s.slug, storeDomain(s.siteUrl)]));
  const seen = new Map<string, number>();

  rows.forEach((fields, index) => {
    const line = index + 2;
    const get = (name: (typeof CSV_COLUMNS)[number]) => {
      const at = columns.indexOf(name);
      return at < 0 ? "" : (fields[at] ?? "").trim();
    };
    if (fields.every((field) => field.trim() === "")) return;
    const fail = (message: string) => errors.push({ line, message });

    const partSlug = get("part_slug");
    const storeSlug = get("store_slug");
    const [price, url, checkedOn] = [
      get("price_brl"),
      get("url"),
      get("checked_on"),
    ];
    if (!price && !checkedOn) {
      skipped.push(line);
      return;
    }

    if (!partSlugs.has(partSlug))
      return fail(`peça desconhecida "${partSlug}"`);
    const domain = domains.get(storeSlug);
    if (!domain) return fail(`loja desconhecida "${storeSlug}"`);

    const priceCents = parsePriceBrl(price);
    if (priceCents === null || priceCents <= 0)
      return fail(`preço inválido "${price}" (use 1.199,90 ou 1199.90)`);

    let host: string;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") throw new Error();
      host = parsed.hostname;
    } catch {
      return fail(`url inválida "${url}" (precisa começar com https://)`);
    }
    if (host !== domain && !host.endsWith(`.${domain}`))
      return fail(`a url não é de ${domain}: "${url}"`);

    const seenAt = parseCheckedOn(checkedOn);
    if (!seenAt)
      return fail(
        `data inválida "${checkedOn}" (use 31/10/2026 ou 2026-10-31)`,
      );
    if (seenAt.getTime() > now.getTime() + MAX_DATE_AHEAD_MS)
      return fail(`data no futuro "${checkedOn}"`);

    const inStock = parseInStock(get("in_stock"));
    if (inStock === null)
      return fail(`in_stock inválido "${get("in_stock")}" (use sim ou não)`);

    const key = `${partSlug}@${storeSlug}`;
    const first = seen.get(key);
    if (first) return fail(`${key} repete a linha ${first}`);
    seen.set(key, line);

    offers.push({ partSlug, storeSlug, priceCents, url, inStock, seenAt });
  });

  return { offers, skipped, errors };
}

/**
 * The "manual" provider: offers parsed from a reference-price spreadsheet.
 * A check made today is dated noon, which may still be ahead of the clock,
 * so seenAt never passes the sync time.
 */
export function manualPriceProvider(
  offers: readonly ProviderOffer[],
  storeSlugs: readonly string[],
): PriceProvider {
  return {
    id: MANUAL_SOURCE,
    storeSlugs,
    async fetchOffers({ parts, now }) {
      const requested = new Set(parts.map((part) => part.slug));
      return offers
        .filter((offer) => requested.has(offer.partSlug))
        .map((offer) => ({
          ...offer,
          seenAt: offer.seenAt > now ? now : offer.seenAt,
        }));
    },
  };
}

export interface TemplateRow {
  partSlug: string;
  storeSlug: string;
  /** The recorded product page, when an earlier import left one. */
  url?: string;
  /** For the person filling it in; the import ignores these columns. */
  partName: string;
  searchUrl: string;
}

/** Quotes a field only when Excel would need it to. */
const csvField = (value: string) =>
  /[";\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

/**
 * A blank spreadsheet for prices:import, as Excel in Portuguese opens it
 * with a double click: ";" separators, CRLF and a UTF-8 BOM, so accents and
 * columns come out right. Two extra columns, peca and busca, name the part
 * and link to the store's search; the import ignores them.
 */
export function priceTemplateCsv(rows: readonly TemplateRow[]): string {
  const lines = [
    [...CSV_COLUMNS, "peca", "busca"].join(";"),
    ...rows.map((row) =>
      [
        row.partSlug,
        row.storeSlug,
        "",
        row.url ?? "",
        "",
        "",
        row.partName,
        row.searchUrl,
      ]
        .map(csvField)
        .join(";"),
    ),
  ];
  return `﻿${lines.join("\r\n")}\r\n`;
}
