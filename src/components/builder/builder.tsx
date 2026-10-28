"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BuilderEntry } from "@/builder/entry";
import { priceBuild, type PricedLine } from "@/builder/pricing";
import { resolveBuild } from "@/builder/resolve";
import {
  encodeBuild,
  isMultiCategory,
  removePart,
  selectPart,
  setQuantity,
  MAX_QUANTITY,
  type BuildSelection,
} from "@/builder/url";
import { CATEGORY_ROUTES, partPath } from "@/catalog/categories";
import { keySpecs } from "@/catalog/specs";
import {
  checkBuild,
  REQUIRED_CATEGORIES,
  type Severity,
} from "@/domain/compatibility";
import { formatBRL } from "@/domain/money/money";
import { CATEGORY_LABELS, type Category, type Part } from "@/domain/parts";
import { CategoryIcon } from "../category-icon";
import { BuildSummary } from "./build-summary";
import { PartPicker } from "./part-picker";

const REQUIRED = new Set<Category>(REQUIRED_CATEGORIES);

/**
 * The interactive builder. The server renders it from the URL, so a shared
 * link opens already assembled; from then on every change runs the domain's
 * checkBuild in the browser and rewrites the URL in place.
 */
export function Builder({
  entries,
  initialSelection,
}: {
  entries: readonly BuilderEntry[];
  initialSelection: BuildSelection;
}) {
  const [selection, setSelection] = useState(initialSelection);
  const [picking, setPicking] = useState<Category | null>(null);
  const slotsRef = useRef<HTMLUListElement>(null);
  const focusAfterPick = useRef<Category | null>(null);

  const bySlug = useMemo(
    () => new Map(entries.map((entry) => [entry.part.slug, entry])),
    [entries],
  );

  const { build } = useMemo(
    () => resolveBuild(selection, (slug) => bySlug.get(slug)?.part),
    [selection, bySlug],
  );
  const issues = useMemo(() => checkBuild(build), [build]);

  const lines: PricedLine[] = useMemo(() => {
    const line = (slug: string, quantity: number): PricedLine[] => {
      const entry = bySlug.get(slug);
      return entry
        ? [{ part: entry.part, quantity, offers: entry.offers }]
        : [];
    };
    return CATEGORY_ROUTES.flatMap(({ category }) =>
      isMultiCategory(category)
        ? selection[category].flatMap(({ slug, quantity }) =>
            line(slug, quantity),
          )
        : selection[category]
          ? line(selection[category], 1)
          : [],
    );
  }, [selection, bySlug]);
  const price = useMemo(() => priceBuild(lines), [lines]);

  // Keep the address bar in sync so "copy link" and reloads keep the build.
  useEffect(() => {
    const query = encodeBuild(selection);
    const url = query ? `/montar?${query}` : "/montar";
    if (url !== window.location.pathname + window.location.search) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [selection]);

  // The first pick of a single-part slot unmounts the button that opened the
  // picker, so the dialog has nowhere to return focus; send it to "Trocar".
  // Runs after the picker's own effect has closed the dialog.
  useEffect(() => {
    const category = focusAfterPick.current;
    if (!category) return;
    focusAfterPick.current = null;
    slotsRef.current
      ?.querySelector<HTMLElement>(`[data-category="${category}"] [data-swap]`)
      ?.focus();
  }, [selection]);

  // The worst severity touching each category, to highlight its slot.
  const flagged = new Map<Category, Severity>();
  for (const issue of issues) {
    if (issue.code === "MISSING_REQUIRED_PARTS") continue;
    for (const category of issue.categories) {
      if (flagged.get(category) !== "error")
        flagged.set(category, issue.severity);
    }
  }

  const selectedSlugs = new Set(lines.map((line) => line.part.slug));
  const priceOf = (part: Part) =>
    price.lines.find((line) => line.part.slug === part.slug)?.best ?? null;

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_24rem] lg:items-start lg:pb-0">
      <section aria-labelledby="pecas-da-build">
        <h2 id="pecas-da-build" className="sr-only">
          Peças da build
        </h2>
        <ul ref={slotsRef} className="space-y-3">
          {CATEGORY_ROUTES.map(({ category }) => {
            const severity = flagged.get(category);
            const border =
              severity === "error"
                ? "border-error/60"
                : severity === "warning"
                  ? "border-warn/50"
                  : "border-line";
            const picked = isMultiCategory(category)
              ? selection[category]
              : selection[category]
                ? [{ slug: selection[category], quantity: 1 }]
                : [];
            return (
              <li
                key={category}
                data-category={category}
                data-severity={severity ?? "ok"}
                className={`rounded-panel border bg-surface ${border}`}
              >
                <div className="flex items-center gap-3 px-4 pt-3">
                  <CategoryIcon
                    category={category}
                    className={`size-5 ${
                      severity === "error"
                        ? "text-error"
                        : severity === "warning"
                          ? "text-warn"
                          : "text-muted"
                    }`}
                  />
                  <h3 className="spec-label flex-1">
                    {CATEGORY_LABELS[category]}
                    {!REQUIRED.has(category) && (
                      <span className="ml-2 tracking-normal normal-case">
                        · opcional
                      </span>
                    )}
                  </h3>
                  {severity && (
                    <span
                      className={`text-xs ${severity === "error" ? "text-error" : "text-warn"}`}
                    >
                      {severity === "error" ? "Incompatível" : "Atenção"}
                    </span>
                  )}
                </div>

                {picked.length > 0 && (
                  <ul className="divide-y divide-line/60 px-4">
                    {picked.map(({ slug, quantity }) => {
                      const entry = bySlug.get(slug);
                      if (!entry) return null;
                      const { part } = entry;
                      const best = priceOf(part);
                      const name = `${part.brand} ${part.model}`;
                      return (
                        <li
                          key={slug}
                          className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
                        >
                          <div className="min-w-0 flex-1 basis-56">
                            <Link
                              href={partPath(part.category, part.slug)}
                              className="font-medium hover:underline"
                            >
                              {name}
                            </Link>
                            <p className="tabular mt-0.5 text-xs text-muted">
                              {keySpecs(part).join(" · ")}
                            </p>
                          </div>
                          {isMultiCategory(category) && (
                            <div
                              className="flex items-center gap-1"
                              role="group"
                              aria-label={`Quantidade de ${name}`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setSelection((s) =>
                                    setQuantity(
                                      s,
                                      category,
                                      slug,
                                      quantity - 1,
                                    ),
                                  )
                                }
                                disabled={quantity <= 1}
                                aria-label="Diminuir quantidade"
                                className="grid size-8 place-items-center rounded-panel border border-line-strong disabled:opacity-40"
                              >
                                −
                              </button>
                              <span
                                className="tabular w-8 text-center"
                                aria-live="polite"
                              >
                                {quantity}×
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelection((s) =>
                                    setQuantity(
                                      s,
                                      category,
                                      slug,
                                      quantity + 1,
                                    ),
                                  )
                                }
                                disabled={quantity >= MAX_QUANTITY}
                                aria-label="Aumentar quantidade"
                                className="grid size-8 place-items-center rounded-panel border border-line-strong disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>
                          )}
                          <div className="text-right">
                            {best ? (
                              <>
                                <p className="tabular text-accent">
                                  {formatBRL(best.priceCents * quantity)}
                                </p>
                                <p className="text-xs text-muted">
                                  {best.storeName}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-muted">
                                Sem preço recente
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!isMultiCategory(category) && (
                              <button
                                type="button"
                                onClick={() => setPicking(category)}
                                data-swap
                                aria-label={`Trocar ${CATEGORY_LABELS[category]}`}
                                className="rounded-panel border border-line-strong px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
                              >
                                Trocar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setSelection((s) =>
                                  removePart(s, category, slug),
                                )
                              }
                              aria-label={`Remover ${name}`}
                              className="rounded-panel border border-line-strong px-3 py-1.5 text-sm text-muted hover:border-error hover:text-error"
                            >
                              Remover
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {(picked.length === 0 || isMultiCategory(category)) && (
                  <div className="px-4 pt-2 pb-3">
                    <button
                      type="button"
                      onClick={() => setPicking(category)}
                      className="w-full rounded-panel border border-dashed border-line-strong px-3 py-2.5 text-left text-sm text-muted hover:border-accent hover:text-accent"
                    >
                      <span aria-hidden="true">+ </span>
                      {picked.length === 0 ? "Escolher" : "Adicionar outro"}
                      <span className="sr-only">
                        {" "}
                        ({CATEGORY_LABELS[category]})
                      </span>
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <BuildSummary
        build={build}
        issues={issues}
        price={price}
        partCount={lines.reduce((sum, line) => sum + line.quantity, 0)}
      />

      <PartPicker
        category={picking}
        entries={entries}
        build={build}
        selectedSlugs={selectedSlugs}
        onPick={(category, slug) => {
          if (!isMultiCategory(category)) focusAfterPick.current = category;
          setSelection((s) => selectPart(s, category, slug));
          setPicking(null);
        }}
        onClose={() => setPicking(null)}
      />
    </div>
  );
}
