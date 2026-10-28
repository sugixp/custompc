import { CATEGORY_ROUTES } from "@/catalog/categories";
import { checkBuild } from "@/domain/compatibility";
import type { Part } from "@/domain/parts";
import type { BuilderEntry } from "./entry";
import { priceBuild, type PricedLine } from "./pricing";
import type { ResolvedBuild } from "./resolve";
import { isMultiCategory } from "./url";

/** What a shared build link says about itself: page metadata and its image. */
export interface SharedBuild {
  lines: PricedLine[];
  /** Parts counting quantities. */
  units: number;
  cpu?: Part;
  gpu?: Part;
  /** Cheapest current price per part; unpriced parts left out. */
  totalCents: number;
  errors: number;
  warnings: number;
}

/** null when the link picks no known part. */
export function summarizeSharedBuild(
  { build, selection }: ResolvedBuild,
  bySlug: ReadonlyMap<string, BuilderEntry>,
): SharedBuild | null {
  const lines = CATEGORY_ROUTES.flatMap(({ category }) => {
    const picked = isMultiCategory(category)
      ? selection[category]
      : selection[category]
        ? [{ slug: selection[category], quantity: 1 }]
        : [];
    return picked.flatMap(({ slug, quantity }) => {
      const entry = bySlug.get(slug);
      return entry
        ? [{ part: entry.part, quantity, offers: entry.offers }]
        : [];
    });
  });
  if (lines.length === 0) return null;

  const issues = checkBuild(build);
  return {
    lines,
    units: lines.reduce((sum, line) => sum + line.quantity, 0),
    cpu: build.cpu,
    gpu: build.gpu,
    totalCents: priceBuild(lines).totalCents,
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
  };
}
