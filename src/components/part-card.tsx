import Link from "next/link";
import { partPath } from "@/catalog/categories";
import type { PriceSummary } from "@/catalog/offers";
import { keySpecs } from "@/catalog/specs";
import type { Part } from "@/domain/parts";
import { CategoryIcon } from "./category-icon";
import { PriceTag } from "./price-tag";

export function PartCard({
  part,
  price,
  storeCount,
}: {
  part: Part;
  price: PriceSummary;
  storeCount: number;
}) {
  return (
    <article className="group relative flex h-full flex-col rounded-panel border border-line bg-surface transition-colors hover:border-line-strong hover:bg-raised">
      <div className="flex items-start gap-3 p-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-panel border border-line bg-bg text-muted group-hover:text-accent">
          <CategoryIcon category={part.category} className="size-7" />
        </div>
        <div className="min-w-0">
          <p className="spec-label">{part.brand}</p>
          <h3 className="mt-0.5 leading-snug font-medium">
            {/* The stretched link makes the whole card clickable with one tab stop. */}
            <Link
              href={partPath(part.category, part.slug)}
              className="after:absolute after:inset-0 after:rounded-panel focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
            >
              {part.model}
            </Link>
          </h3>
        </div>
      </div>
      <ul
        className="flex flex-wrap gap-1.5 px-4"
        aria-label="Especificações principais"
      >
        {keySpecs(part).map((spec) => (
          <li
            key={spec}
            className="tabular rounded-[4px] border border-line bg-bg px-1.5 py-0.5 text-xs text-muted"
          >
            {spec}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-end justify-between gap-3 p-4 pt-5">
        <PriceTag price={price} />
        {storeCount > 0 && (
          <p className="text-xs text-muted">
            {storeCount} {storeCount === 1 ? "loja" : "lojas"}
          </p>
        )}
      </div>
    </article>
  );
}
