import Link from "next/link";
import { listingQuery, type ListingParams } from "@/catalog/listing";

export function Pagination({
  basePath,
  params,
  page,
  pageCount,
}: {
  basePath: string;
  params: ListingParams;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  const href = (target: number) =>
    basePath + listingQuery({ ...params, page: target });
  const linkClass =
    "rounded-panel border border-line px-3 py-2 text-sm hover:border-line-strong hover:bg-raised";
  return (
    <nav
      aria-label="Paginação"
      className="mt-8 flex items-center justify-center gap-2"
    >
      {page > 1 && (
        <Link href={href(page - 1)} className={linkClass} rel="prev">
          ← Anterior
        </Link>
      )}
      <p className="tabular px-2 text-sm text-muted">
        Página {page} de {pageCount}
      </p>
      {page < pageCount && (
        <Link href={href(page + 1)} className={linkClass} rel="next">
          Próxima →
        </Link>
      )}
    </nav>
  );
}
