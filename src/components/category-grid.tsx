import Link from "next/link";
import { CATEGORY_ROUTES } from "@/catalog/categories";
import { CategoryIcon } from "./category-icon";

export function CategoryGrid({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const;
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {CATEGORY_ROUTES.map((route) => (
        <li key={route.slug}>
          <Link
            href={`/pecas/${route.slug}`}
            className="group flex h-full flex-col gap-3 rounded-panel border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-raised"
          >
            <CategoryIcon
              category={route.category}
              className="size-8 text-muted transition-colors group-hover:text-accent"
            />
            <Heading className="font-medium">{route.label}</Heading>
            <p className="hidden text-sm leading-snug text-muted sm:block">
              {route.description}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
