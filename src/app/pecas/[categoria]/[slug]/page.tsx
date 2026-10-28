import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { categoryRoute, partPath } from "@/catalog/categories";
import { summarizeOffers } from "@/catalog/offers";
import { keySpecs, specRows } from "@/catalog/specs";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CategoryIcon } from "@/components/category-icon";
import { OfferTable } from "@/components/offer-table";
import { PriceTag } from "@/components/price-tag";
import { SpecTable } from "@/components/spec-table";
import { formatBRL } from "@/domain/money/money";
import { getCatalogPart } from "@/server/catalog";

type Props = PageProps<"/pecas/[categoria]/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { found, now } = await getCatalogPart((await params).slug);
  if (!found) return { title: "Peça não encontrada" };

  const { part, offers } = found;
  const name = `${part.brand} ${part.model}`;
  const { price, offers: shown } = summarizeOffers(offers, now);
  const priceText =
    price.kind === "price"
      ? ` A partir de ${formatBRL(price.fromCents)} em ${shown.length} lojas.`
      : "";
  const description = `${name}: ${keySpecs(part).join(", ")}.${priceText} Especificações e preços em lojas brasileiras.`;
  const url = partPath(part.category, part.slug);
  return {
    title: name,
    description,
    alternates: { canonical: url },
    openGraph: { title: name, description, url },
  };
}

// loading.tsx shows the skeleton while this streams. Because streaming has
// started, a missing slug renders not-found.tsx with status 200 and noindex.
export default async function PartPage({ params }: Props) {
  const { categoria, slug } = await params;
  const { found, now } = await getCatalogPart(slug);
  if (!found) notFound();

  const { part, offers, specSourceUrls } = found;
  const route = categoryRoute(part.category);
  if (route.slug !== categoria)
    permanentRedirect(partPath(part.category, part.slug));

  const summary = summarizeOffers(offers, now);
  const illustrative = summary.offers.some((offer) => offer.source === "seed");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Peças", href: "/pecas" },
          { label: route.label, href: `/pecas/${route.slug}` },
          { label: part.model },
        ]}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="min-w-0 space-y-6">
          <header className="flex flex-wrap items-start gap-4 rounded-panel border border-line bg-surface p-5 sm:flex-nowrap sm:items-center sm:gap-5">
            <div className="grid size-14 shrink-0 place-items-center rounded-panel border border-line bg-bg text-accent sm:size-20">
              <CategoryIcon
                category={part.category}
                className="size-8 sm:size-12"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="spec-label">
                {part.brand} · {route.label}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                {part.model}
              </h1>
              <ul
                className="mt-3 flex flex-wrap gap-1.5"
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
            </div>
            <div className="w-full sm:w-auto sm:text-right">
              <PriceTag price={summary.price} size="lg" />
            </div>
          </header>

          <section aria-labelledby="ofertas">
            <h2 id="ofertas" className="text-lg font-semibold">
              Ofertas
            </h2>
            {illustrative && (
              <p className="mt-2 rounded-panel border border-warn/40 bg-warn/5 px-3 py-2 text-sm text-warn">
                Preços ilustrativos: esta versão usa dados de exemplo. Os links
                levam à busca da peça em cada loja.
              </p>
            )}
            <div className="mt-3">
              <OfferTable offers={summary.offers} />
            </div>
          </section>
        </div>

        <aside
          aria-labelledby="ficha"
          className="rounded-panel border border-line bg-surface p-5"
        >
          <h2 id="ficha" className="text-lg font-semibold">
            Ficha técnica
          </h2>
          <div className="mt-3">
            <SpecTable rows={specRows(part)} />
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <h3 className="spec-label">Fonte das especificações</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              {specSourceUrls.map((url) => (
                <li key={url} className="break-all">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted underline decoration-line-strong underline-offset-4 hover:text-text"
                  >
                    {new URL(url).hostname.replace(/^www\./, "")}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
