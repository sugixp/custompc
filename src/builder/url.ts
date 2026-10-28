import type { Category } from "@/domain/parts";

/**
 * A build in the URL: one search parameter per category, valued with part
 * slugs. Memory kits and drives can repeat and carry a quantity after "*",
 * which can never appear in a slug, so parsing is unambiguous:
 *
 *   /montar?cpu=amd-ryzen-5-7600&ram=kingston-fury-beast-ddr5-6000-cl30-2x16gb*2
 *
 * Parameters are written in a fixed order, so the same build always gives the
 * same link.
 */
export const SINGLE_PARAMS = {
  cpu: "CPU",
  placa: "MOTHERBOARD",
  gpu: "GPU",
  fonte: "PSU",
  gabinete: "CASE",
  cooler: "COOLER",
} as const satisfies Record<string, Category>;

export const MULTI_PARAMS = {
  ram: "MEMORY",
  disco: "STORAGE",
} as const satisfies Record<string, Category>;

export const PARAM_ORDER = [
  "cpu",
  "placa",
  "ram",
  "gpu",
  "disco",
  "fonte",
  "gabinete",
  "cooler",
] as const;

export type SingleCategory = (typeof SINGLE_PARAMS)[keyof typeof SINGLE_PARAMS];
export type MultiCategory = (typeof MULTI_PARAMS)[keyof typeof MULTI_PARAMS];

/** Upper bound on units per line, so a link cannot ask for 999 kits. */
export const MAX_QUANTITY = 8;

export interface SelectionLine {
  slug: string;
  quantity: number;
}

/** What the user picked, by category, as slugs (not yet checked against the catalog). */
export type BuildSelection = Partial<Record<SingleCategory, string>> &
  Record<MultiCategory, SelectionLine[]>;

export function emptySelection(): BuildSelection {
  return { MEMORY: [], STORAGE: [] };
}

export type DecodeProblem =
  | { kind: "malformed"; param: string; value: string }
  | { kind: "invalid-quantity"; param: string; value: string }
  | { kind: "duplicate"; param: string; value: string };

const VALUE = /^([a-z0-9]+(?:-[a-z0-9]+)*)(?:\*(\d+))?$/;

export const paramOf = (category: Category): string =>
  Object.entries({ ...SINGLE_PARAMS, ...MULTI_PARAMS }).find(
    ([, value]) => value === category,
  )![0];

/**
 * Reads a selection from search parameters. Never throws: malformed values,
 * bad quantities and repeated single-part parameters are dropped and
 * reported, unknown parameters (utm_*, etc.) are ignored.
 */
export function decodeBuild(params: URLSearchParams): {
  selection: BuildSelection;
  problems: DecodeProblem[];
} {
  const selection = emptySelection();
  const problems: DecodeProblem[] = [];

  for (const [param, category] of Object.entries(SINGLE_PARAMS)) {
    const [first, ...rest] = params.getAll(param);
    for (const value of rest)
      problems.push({ kind: "duplicate", param, value });
    if (first === undefined) continue;
    const match = VALUE.exec(first.trim());
    if (!match) problems.push({ kind: "malformed", param, value: first });
    else if (match[2] !== undefined) {
      problems.push({ kind: "invalid-quantity", param, value: first });
    } else selection[category] = match[1];
  }

  for (const [param, category] of Object.entries(MULTI_PARAMS)) {
    for (const raw of params.getAll(param)) {
      const match = VALUE.exec(raw.trim());
      if (!match) {
        problems.push({ kind: "malformed", param, value: raw });
        continue;
      }
      const quantity = match[2] === undefined ? 1 : Number(match[2]);
      if (
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_QUANTITY
      ) {
        problems.push({ kind: "invalid-quantity", param, value: raw });
        continue;
      }
      const slug = match[1]!;
      const existing = selection[category].find((line) => line.slug === slug);
      // ram=a&ram=a reads as two of a, up to the cap.
      if (existing)
        existing.quantity = Math.min(
          MAX_QUANTITY,
          existing.quantity + quantity,
        );
      else selection[category].push({ slug, quantity });
    }
  }

  return { selection, problems };
}

/** Writes a selection as a query string (no leading "?"), in PARAM_ORDER. */
export function encodeBuild(selection: BuildSelection): string {
  const query = new URLSearchParams();
  for (const param of PARAM_ORDER) {
    if (param in MULTI_PARAMS) {
      const category = MULTI_PARAMS[param as keyof typeof MULTI_PARAMS];
      for (const { slug, quantity } of selection[category]) {
        query.append(param, quantity > 1 ? `${slug}*${quantity}` : slug);
      }
    } else {
      const slug =
        selection[SINGLE_PARAMS[param as keyof typeof SINGLE_PARAMS]];
      if (slug) query.set(param, slug);
    }
  }
  return query.toString();
}

/** Normalizes Next.js searchParams into URLSearchParams. */
export function toSearchParams(
  record: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    for (const item of Array.isArray(value)
      ? value
      : value === undefined
        ? []
        : [value]) {
      params.append(key, item);
    }
  }
  return params;
}

// Selection updates, used by the builder UI.

export function isMultiCategory(category: Category): category is MultiCategory {
  return category === "MEMORY" || category === "STORAGE";
}

/** Picks a part: replaces a single-slot category, adds a line otherwise. */
export function selectPart(
  selection: BuildSelection,
  category: Category,
  slug: string,
): BuildSelection {
  if (!isMultiCategory(category)) return { ...selection, [category]: slug };
  const lines = selection[category];
  if (lines.some((line) => line.slug === slug)) {
    return setQuantity(
      selection,
      category,
      slug,
      (lines.find((l) => l.slug === slug)?.quantity ?? 0) + 1,
    );
  }
  return { ...selection, [category]: [...lines, { slug, quantity: 1 }] };
}

export function removePart(
  selection: BuildSelection,
  category: Category,
  slug?: string,
): BuildSelection {
  if (!isMultiCategory(category)) {
    const next = { ...selection };
    delete next[category];
    return next;
  }
  return {
    ...selection,
    [category]: selection[category].filter((line) => line.slug !== slug),
  };
}

/** Sets a line's quantity, clamped to 1..MAX_QUANTITY. */
export function setQuantity(
  selection: BuildSelection,
  category: MultiCategory,
  slug: string,
  quantity: number,
): BuildSelection {
  const clamped = Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity)));
  return {
    ...selection,
    [category]: selection[category].map((line) =>
      line.slug === slug ? { ...line, quantity: clamped } : line,
    ),
  };
}
