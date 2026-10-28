import type { Build } from "@/domain/build/build";
import type { Category, Part, PartOf } from "@/domain/parts";
import {
  emptySelection,
  MULTI_PARAMS,
  paramOf,
  SINGLE_PARAMS,
  type BuildSelection,
} from "./url";

export interface UnknownPart {
  param: string;
  slug: string;
}

export interface ResolvedBuild {
  /** The domain build, one entry per unit, ready for checkBuild. */
  build: Build;
  /** The selection minus slugs that are not in the catalog. */
  selection: BuildSelection;
  /** Slugs dropped because no part of that category has them. */
  unknown: UnknownPart[];
}

/**
 * Matches slugs against the catalog. A slug that does not exist, or names a
 * part of another category (cpu=<a GPU slug>), is dropped and reported.
 */
export function resolveBuild(
  selection: BuildSelection,
  lookup: (slug: string) => Part | undefined,
): ResolvedBuild {
  const unknown: UnknownPart[] = [];
  const clean = emptySelection();

  function find<C extends Category>(
    category: C,
    slug: string,
  ): PartOf<C> | undefined {
    const part = lookup(slug);
    if (part?.category === category) return part as PartOf<C>;
    unknown.push({ param: paramOf(category), slug });
    return undefined;
  }

  const single = <C extends (typeof SINGLE_PARAMS)[keyof typeof SINGLE_PARAMS]>(
    category: C,
  ): PartOf<C> | undefined => {
    const slug = selection[category];
    if (!slug) return undefined;
    const part = find(category, slug);
    if (part) clean[category] = slug;
    return part;
  };

  const multi = <C extends (typeof MULTI_PARAMS)[keyof typeof MULTI_PARAMS]>(
    category: C,
  ): PartOf<C>[] =>
    selection[category].flatMap((line) => {
      const part = find(category, line.slug);
      if (!part) return [];
      clean[category].push({ ...line });
      return Array.from({ length: line.quantity }, () => part);
    });

  const build: Build = {
    cpu: single("CPU"),
    motherboard: single("MOTHERBOARD"),
    memory: multi("MEMORY"),
    gpu: single("GPU"),
    storage: multi("STORAGE"),
    psu: single("PSU"),
    pcCase: single("CASE"),
    cooler: single("COOLER"),
  };
  return { build, selection: clean, unknown };
}
