"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { candidateBlockers } from "@/builder/candidates";
import { keySpecs } from "@/catalog/specs";
import type { Build } from "@/domain/build/build";
import { CATEGORY_LABELS, type Category } from "@/domain/parts";
import type { BuilderEntry } from "@/builder/entry";
import { CategoryIcon } from "../category-icon";
import { PriceTag } from "../price-tag";

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/**
 * Modal list of the parts of one category, with search and an optional
 * "compatible only" filter. A native <dialog> gives focus trapping, Escape
 * to close and focus return to the opener.
 */
export function PartPicker({
  category,
  entries,
  build,
  selectedSlugs,
  onPick,
  onClose,
}: {
  category: Category | null;
  entries: readonly BuilderEntry[];
  build: Build;
  selectedSlugs: ReadonlySet<string>;
  onPick: (category: Category, slug: string) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [query, setQuery] = useState("");
  const [compatibleOnly, setCompatibleOnly] = useState(true);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (category && !dialog.open) {
      setQuery("");
      dialog.showModal();
      // showModal focuses the first control, "Fechar"; start at the search.
      searchRef.current?.focus();
    } else if (!category && dialog.open) dialog.close();
  }, [category]);

  const label = category ? CATEGORY_LABELS[category] : "";

  const candidates = useMemo(() => {
    if (!category) return [];
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return entries
      .filter((entry) => entry.part.category === category)
      .filter((entry) => {
        const haystack = normalize(
          `${entry.part.brand} ${entry.part.model} ${keySpecs(entry.part).join(" ")}`,
        );
        return words.every((word) => haystack.includes(word));
      })
      .map((entry) => ({
        entry,
        blockers: candidateBlockers(build, entry.part),
      }));
  }, [category, entries, query, build]);

  const visible = compatibleOnly
    ? candidates.filter((candidate) => candidate.blockers.length === 0)
    : candidates;
  const hidden = candidates.length - visible.length;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto max-h-[min(44rem,92dvh)] w-[min(40rem,calc(100vw-1.5rem))] overflow-hidden rounded-panel border border-line-strong bg-surface p-0 text-text backdrop:bg-black/70"
    >
      <div className="flex max-h-[inherit] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 id={titleId} className="font-semibold">
            Escolher: {label}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-panel px-2 py-1 text-muted hover:bg-raised hover:text-text"
          >
            Fechar<span aria-hidden="true"> ✕</span>
          </button>
        </div>

        <div className="space-y-3 border-b border-line px-4 py-3">
          <div>
            <label htmlFor={`${titleId}-busca`} className="spec-label">
              Buscar
            </label>
            <input
              ref={searchRef}
              id={`${titleId}-busca`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Marca, modelo ou especificação"
              autoComplete="off"
              className="mt-1.5 w-full rounded-panel border border-line-strong bg-bg px-3 py-2 text-sm placeholder:text-muted/70"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={compatibleOnly}
              onChange={(event) => setCompatibleOnly(event.target.checked)}
              className="size-4 accent-[var(--color-accent)]"
            />
            Mostrar só compatíveis com a build atual
          </label>
          <p className="tabular text-xs text-muted" aria-live="polite">
            {visible.length === 1 ? "1 peça" : `${visible.length} peças`}
            {hidden > 0 &&
              ` · ${hidden} ${hidden === 1 ? "oculta por incompatibilidade" : "ocultas por incompatibilidade"}`}
          </p>
        </div>

        <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
          {visible.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted">
              Nenhuma peça encontrada.
              {hidden > 0 &&
                " Desmarque o filtro de compatíveis para ver as demais."}
            </li>
          )}
          {visible.map(({ entry, blockers }) => {
            const { part } = entry;
            const name = `${part.brand} ${part.model}`;
            const selected = selectedSlugs.has(part.slug);
            return (
              <li key={part.slug} className="flex items-start gap-3 px-4 py-3">
                <CategoryIcon
                  category={part.category}
                  className={`mt-0.5 size-6 shrink-0 ${blockers.length > 0 ? "text-error" : "text-muted"}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="spec-label">{part.brand}</p>
                  <p className="font-medium">{part.model}</p>
                  <p className="tabular mt-1 text-xs text-muted">
                    {keySpecs(part).join(" · ")}
                  </p>
                  {blockers.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-error">
                      {blockers.map((issue) => (
                        <li key={issue.code}>Incompatível: {issue.message}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <PriceTag price={entry.price} />
                  <button
                    type="button"
                    onClick={() => onPick(part.category, part.slug)}
                    aria-label={`Escolher ${name}`}
                    className={`rounded-panel px-3 py-1.5 text-sm font-medium ${
                      blockers.length > 0
                        ? "border border-line-strong hover:border-error hover:text-error"
                        : "bg-accent text-accent-ink hover:brightness-110"
                    }`}
                  >
                    {selected &&
                    part.category !== "MEMORY" &&
                    part.category !== "STORAGE"
                      ? "Selecionado"
                      : "Escolher"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </dialog>
  );
}
