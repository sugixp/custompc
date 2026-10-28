import type { Part } from "@/domain/parts";
import type { Facet } from "./facets";
import type { PriceSummary } from "./offers";

export const SORT_OPTIONS = [
  { value: "preco", label: "Menor preço" },
  { value: "preco-desc", label: "Maior preço" },
  { value: "nome", label: "Nome (A–Z)" },
] as const;

export type SortOrder = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortOrder = "preco";
export const PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;

/**
 * Parts per listing page, from CATALOG_PAGE_SIZE. Production leaves it unset;
 * the E2E server uses a small size so the seed catalog spans several pages.
 */
export function pageSizeFrom(value: string | undefined): number {
  const size = Number(value);
  return Number.isSafeInteger(size) && size >= 1 && size <= MAX_PAGE_SIZE
    ? size
    : PAGE_SIZE;
}

export interface ListingParams {
  sort: SortOrder;
  page: number;
  /** facet param -> selected value; unknown params are ignored. */
  filters: Record<string, string>;
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * Reads listing state from the URL. Anything malformed falls back to the
 * default instead of erroring, since links get edited and truncated.
 */
export function parseListingParams(
  searchParams: SearchParams,
  facets: readonly Facet[],
): ListingParams {
  const sortParam = first(searchParams.ordem);
  const sort =
    SORT_OPTIONS.find((option) => option.value === sortParam)?.value ??
    DEFAULT_SORT;

  const pageParam = Number(first(searchParams.pagina));
  const page =
    Number.isSafeInteger(pageParam) && pageParam >= 1 ? pageParam : 1;

  const filters: Record<string, string> = {};
  for (const facet of facets) {
    const value = first(searchParams[facet.param])?.trim();
    if (value) filters[facet.param] = value;
  }
  return { sort, page, filters };
}

/** Builds the query string for a listing link; defaults are left out. */
export function listingQuery(params: ListingParams): string {
  const query = new URLSearchParams();
  for (const [param, value] of Object.entries(params.filters))
    query.set(param, value);
  if (params.sort !== DEFAULT_SORT) query.set("ordem", params.sort);
  if (params.page > 1) query.set("pagina", String(params.page));
  const text = query.toString();
  return text ? `?${text}` : "";
}

const collator = new Intl.Collator("pt-BR", { numeric: true });

const priceOf = (price: PriceSummary) =>
  price.kind === "price" ? price.fromCents : null;

/** Sorts by price (parts without a current price always last) or by name. */
export function sortListing<T extends { part: Part; price: PriceSummary }>(
  items: readonly T[],
  sort: SortOrder,
): T[] {
  const byName = (a: T, b: T) =>
    collator.compare(
      `${a.part.brand} ${a.part.model}`,
      `${b.part.brand} ${b.part.model}`,
    );
  return [...items].sort((a, b) => {
    if (sort === "nome") return byName(a, b);
    const pa = priceOf(a.price);
    const pb = priceOf(b.price);
    if (pa === null || pb === null)
      return Number(pa === null) - Number(pb === null) || byName(a, b);
    return (sort === "preco" ? pa - pb : pb - pa) || byName(a, b);
  });
}

export interface Page<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
}

/** A page past the end clamps to the last page. */
export function paginate<T>(
  items: readonly T[],
  page: number,
  size = PAGE_SIZE,
): Page<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pageCount);
  return {
    items: items.slice((current - 1) * size, current * size),
    page: current,
    pageCount,
    total: items.length,
  };
}
