/**
 * Reference prices that e2e/global-setup.ts imports with
 * `npm run prices:import`, as the owner would from a spreadsheet: a part no
 * other spec prices, checked today at two stores, cheaper than any of its
 * illustrative seed offers so it sets the headline.
 */
export const REFERENCE = {
  partSlug: "asus-tuf-gaming-1200w-gold",
  path: "/pecas/fontes/asus-tuf-gaming-1200w-gold",
  priceCents: 99_990,
  stores: ["kabum", "terabyte"],
} as const;

const STORE_URLS: Record<(typeof REFERENCE.stores)[number], string> = {
  kabum: "https://www.kabum.com.br/produto/e2e",
  terabyte: "https://www.terabyteshop.com.br/produto/e2e",
};

/** The spreadsheet, as Excel in Portuguese saves it, dated today. */
export function referencePriceCsv(now: Date): string {
  const today = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
  }).format(now);
  const price = (REFERENCE.priceCents / 100).toFixed(2).replace(".", ",");
  return [
    "﻿part_slug;store_slug;price_brl;url;checked_on;in_stock",
    ...REFERENCE.stores.map((store) =>
      [REFERENCE.partSlug, store, price, STORE_URLS[store], today, "sim"].join(
        ";",
      ),
    ),
  ].join("\r\n");
}
