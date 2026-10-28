/**
 * Stores in the example data. Offer links point to each store's public search
 * page for the part, never to a product listing, and carry no affiliate ids.
 */
export interface SeedStore {
  slug: string;
  name: string;
  siteUrl: string;
  /** Search URL for a free-text term; the term is always URI-encoded. */
  searchUrl: (term: string) => string;
}

export const stores: SeedStore[] = [
  {
    slug: "amazon",
    name: "Amazon",
    siteUrl: "https://www.amazon.com.br",
    searchUrl: (term) =>
      `https://www.amazon.com.br/s?k=${encodeURIComponent(term)}`,
  },
  {
    slug: "mercado-livre",
    name: "Mercado Livre",
    siteUrl: "https://www.mercadolivre.com.br",
    searchUrl: (term) =>
      `https://lista.mercadolivre.com.br/${encodeURIComponent(term)}`,
  },
  {
    slug: "kabum",
    name: "KaBuM!",
    siteUrl: "https://www.kabum.com.br",
    searchUrl: (term) =>
      `https://www.kabum.com.br/busca/${encodeURIComponent(term)}`,
  },
  {
    slug: "pichau",
    name: "Pichau",
    siteUrl: "https://www.pichau.com.br",
    searchUrl: (term) =>
      `https://www.pichau.com.br/search?q=${encodeURIComponent(term)}`,
  },
  {
    slug: "terabyte",
    name: "Terabyte",
    siteUrl: "https://www.terabyteshop.com.br",
    searchUrl: (term) =>
      `https://www.terabyteshop.com.br/busca?str=${encodeURIComponent(term)}`,
  },
];
