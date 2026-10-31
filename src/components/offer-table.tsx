import { formatSeenAt, formatSeenAtShort } from "@/catalog/format";
import { storeLinkRel, type ShownOffer } from "@/catalog/offers";
import { formatBRL } from "@/domain/money/money";
import { DEFAULT_FRESHNESS } from "@/domain/pricing/freshness";

function Badge({
  tone,
  children,
}: {
  tone: "warn" | "muted";
  children: React.ReactNode;
}) {
  const color =
    tone === "warn"
      ? "border-warn/50 text-warn"
      : "border-line-strong text-muted";
  return (
    <span
      className={`inline-block rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase ${color}`}
    >
      {children}
    </span>
  );
}

/**
 * Store offers, best first. The cheapest current offer in stock gets the
 * accent bar. On small screens "Visto em" folds under the price, and cells
 * get tighter padding so four columns never squeeze the store name.
 */
export function OfferTable({ offers }: { offers: ShownOffer[] }) {
  if (offers.length === 0) {
    return (
      <p className="rounded-panel border border-dashed border-line-strong p-4 text-sm text-muted">
        Nenhuma loja com preço recente para esta peça.
      </p>
    );
  }
  const [first] = offers;
  const best =
    first?.freshness === "fresh" && first.inStock ? first : undefined;

  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface">
      <table className="w-full text-sm">
        <caption className="sr-only">Ofertas por loja</caption>
        <thead className="border-b border-line">
          <tr className="text-left">
            <th
              scope="col"
              className="spec-label px-3 py-2 font-normal sm:px-4"
            >
              Loja
            </th>
            <th
              scope="col"
              className="spec-label px-3 py-2 font-normal sm:px-4"
            >
              Preço
            </th>
            <th
              scope="col"
              className="spec-label hidden px-3 py-2 font-normal sm:px-4 md:table-cell"
            >
              Visto em
            </th>
            <th scope="col" className="px-3 py-2 sm:px-4">
              <span className="sr-only">Link</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {offers.map((offer) => {
            const isBest = offer === best;
            const stale = offer.freshness === "stale";
            return (
              <tr key={offer.storeSlug}>
                <th
                  scope="row"
                  className={`px-3 py-3 text-left align-top font-medium sm:px-4 ${
                    isBest ? "shadow-[inset_3px_0_0_var(--color-accent)]" : ""
                  }`}
                >
                  <span className="flex flex-wrap items-center gap-1.5">
                    {offer.storeName}
                    {isBest && <Badge tone="muted">Menor preço</Badge>}
                    {stale && <Badge tone="warn">Desatualizado</Badge>}
                    {!offer.inStock && <Badge tone="muted">Esgotado</Badge>}
                  </span>
                </th>
                <td className="px-3 py-3 align-top sm:px-4">
                  <span
                    className={`tabular text-base ${stale ? "text-muted" : isBest ? "text-accent" : "text-text"}`}
                  >
                    {formatBRL(offer.priceCents)}
                  </span>
                  {offer.source === "seed" && (
                    <span className="block text-xs text-muted">
                      ilustrativo
                    </span>
                  )}
                  <span className="block text-xs whitespace-nowrap text-muted md:hidden">
                    visto {formatSeenAtShort(offer.seenAt)}
                  </span>
                </td>
                <td className="tabular hidden px-3 py-3 align-top text-xs text-muted sm:px-4 md:table-cell">
                  {formatSeenAt(offer.seenAt)}
                </td>
                <td className="px-3 py-3 text-right align-top sm:px-4">
                  <a
                    href={offer.url}
                    target="_blank"
                    rel={storeLinkRel({ sponsored: offer.sponsored })}
                    className="inline-flex items-center gap-1 rounded-panel border border-line-strong px-3 py-1.5 whitespace-nowrap hover:border-accent hover:text-accent"
                  >
                    Ver na loja
                    <span aria-hidden="true">↗</span>
                    <span className="sr-only">
                      {" "}
                      (abre {offer.storeName} em nova aba)
                    </span>
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-line px-3 py-2 text-xs text-muted sm:px-4.5">
        Preços vistos há mais de {DEFAULT_FRESHNESS.staleAfterDays} dias
        aparecem como desatualizados e não entram no &quot;a partir de&quot;.
      </p>
    </div>
  );
}
