import Link from "next/link";
import type { FacetOptions } from "@/catalog/facets";
import { SORT_OPTIONS, type ListingParams } from "@/catalog/listing";

const fieldClass =
  "w-full rounded-panel border border-line-strong bg-bg px-3 py-2 text-sm text-text hover:border-muted";

/**
 * A plain GET form: filtering works without JavaScript, and the result is a
 * URL that can be shared. Changing filters always returns to page 1.
 */
export function FilterForm({
  action,
  facets,
  params,
}: {
  action: string;
  facets: FacetOptions[];
  params: ListingParams;
}) {
  const hasFilters = Object.keys(params.filters).length > 0;
  return (
    <form
      action={action}
      method="get"
      className="rounded-panel border border-line bg-surface p-4"
      aria-label="Filtros"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {facets.map(({ facet, options }) => (
          <div key={facet.param} className="flex flex-col gap-1.5">
            <label htmlFor={`filtro-${facet.param}`} className="spec-label">
              {facet.label}
            </label>
            <select
              id={`filtro-${facet.param}`}
              name={facet.param}
              defaultValue={params.filters[facet.param] ?? ""}
              className={fieldClass}
            >
              <option value="">Todos</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filtro-ordem" className="spec-label">
            Ordenar por
          </label>
          <select
            id="filtro-ordem"
            name="ordem"
            defaultValue={params.sort}
            className={fieldClass}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-panel bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:brightness-110"
        >
          Aplicar
        </button>
        {hasFilters && (
          <Link
            href={action}
            className="text-sm text-muted underline decoration-line-strong underline-offset-4 hover:text-text"
          >
            Limpar filtros
          </Link>
        )}
      </div>
    </form>
  );
}
