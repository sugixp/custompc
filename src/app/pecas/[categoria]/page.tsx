import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  CATEGORY_ROUTES,
  categoryRouteBySlug,
  type CategoryRoute,
} from "@/catalog/categories";
import { applyFacetFilters, FACETS, facetOptions } from "@/catalog/facets";
import { paginate, parseListingParams, sortListing } from "@/catalog/listing";
import { summarizeOffers } from "@/catalog/offers";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FilterForm } from "@/components/filter-form";
import { Pagination } from "@/components/pagination";
import { PartCard } from "@/components/part-card";
import { ListingSkeleton } from "@/components/skeletons";
import { listCategoryParts } from "@/server/catalog";

type Props = PageProps<"/pecas/[categoria]">;

// The eight category pages are prerendered; their listings stream in.
export function generateStaticParams() {
  return CATEGORY_ROUTES.map((route) => ({ categoria: route.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = categoryRouteBySlug((await params).categoria);
  if (!route) return {};
  const url = `/pecas/${route.slug}`;
  return {
    title: route.label,
    description: route.description,
    alternates: { canonical: url },
    openGraph: { title: route.label, description: route.description, url },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  // Checked before anything streams, so an unknown category is a real 404.
  const route = categoryRouteBySlug((await params).categoria);
  if (!route) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Peças", href: "/pecas" },
          { label: route.label },
        ]}
      />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {route.label}
      </h1>
      <p className="mt-2 max-w-2xl text-muted">{route.description}</p>
      <div className="mt-8">
        <Suspense fallback={<ListingSkeleton />}>
          <Listing route={route} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function Listing({
  route,
  searchParams,
}: {
  route: CategoryRoute;
  searchParams: Props["searchParams"];
}) {
  const query = await searchParams;
  await connection();
  const now = new Date();

  const facets = FACETS[route.category];
  const params = parseListingParams(query, facets);
  const parts = await listCategoryParts(route.category, now);

  const items = parts.map(({ part, offers }) => {
    const summary = summarizeOffers(offers, now);
    return { part, price: summary.price, storeCount: summary.offers.length };
  });
  const filtered = applyFacetFilters(items, facets, params.filters);
  const page = paginate(sortListing(filtered, params.sort), params.page);
  const basePath = `/pecas/${route.slug}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr] lg:items-start">
      <aside className="lg:sticky lg:top-4">
        <FilterForm
          action={basePath}
          facets={facetOptions(
            facets,
            parts.map((item) => item.part),
          )}
          params={params}
        />
      </aside>
      <section aria-labelledby="resultados">
        <h2 id="resultados" className="tabular mb-3 text-sm text-muted">
          {page.total === 1 ? "1 peça" : `${page.total} peças`}
        </h2>
        {page.total === 0 ? (
          <div className="rounded-panel border border-dashed border-line-strong p-8 text-center">
            <p className="font-medium">Nenhuma peça com esses filtros.</p>
            <p className="mt-1 text-sm text-muted">
              Tente outra combinação ou{" "}
              <Link
                href={basePath}
                className="text-text underline underline-offset-4"
              >
                veja todas as {route.label.toLowerCase()}
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {page.items.map((item) => (
              <li key={item.part.slug}>
                <PartCard
                  part={item.part}
                  price={item.price}
                  storeCount={item.storeCount}
                />
              </li>
            ))}
          </ul>
        )}
        <Pagination
          basePath={basePath}
          params={params}
          page={page.page}
          pageCount={page.pageCount}
        />
      </section>
    </div>
  );
}
