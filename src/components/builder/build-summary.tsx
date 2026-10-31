"use client";

import { useEffect, useRef, useState } from "react";
import type { BuildPrice } from "@/builder/pricing";
import type { Build } from "@/domain/build/build";
import type { Issue } from "@/domain/compatibility";
import { formatBRL } from "@/domain/money/money";
import { CATEGORY_LABELS } from "@/domain/parts";
import {
  estimatePower,
  PSU_HEADROOM_FACTOR,
  recommendPsu,
} from "@/domain/power/estimate";

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

/** Shown under every total that counts a seed example price. */
const ILLUSTRATIVE_NOTE = "inclui preços ilustrativos";

function issueSummary(errors: number, warnings: number): string {
  if (errors === 0 && warnings === 0)
    return "Nenhum problema de compatibilidade";
  return [
    errors > 0 && plural(errors, "erro", "erros"),
    warnings > 0 && plural(warnings, "aviso", "avisos"),
  ]
    .filter(Boolean)
    .join(" e ");
}

/**
 * Compatibility, price, power and sharing for the current build. On phones a
 * fixed bar keeps the total and the problem count in view.
 */
export function BuildSummary({
  build,
  issues,
  price,
  partCount,
}: {
  build: Build;
  issues: Issue[];
  price: BuildPrice;
  partCount: number;
}) {
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const summary = issueSummary(errors.length, warnings.length);

  return (
    <>
      <aside
        id="resumo"
        aria-label="Resumo da build"
        className="space-y-4 lg:sticky lg:top-4"
      >
        <section
          aria-labelledby="compatibilidade"
          className="rounded-panel border border-line bg-surface p-4"
        >
          <h2 id="compatibilidade" className="spec-label">
            Compatibilidade
          </h2>
          {/* Screen readers hear the new count whenever the build changes. */}
          <p
            aria-live="polite"
            className={`mt-2 font-medium ${errors.length > 0 ? "text-error" : warnings.length > 0 ? "text-warn" : "text-ok"}`}
          >
            {partCount === 0 ? "Escolha as peças para começar" : summary}
          </p>
          {issues.length > 0 && (
            <div className="mt-3 space-y-3">
              {[
                { title: "Erros", list: errors, tone: "error" as const },
                { title: "Avisos", list: warnings, tone: "warn" as const },
              ].map(
                ({ title, list, tone }) =>
                  list.length > 0 && (
                    <div key={title}>
                      <h3 className="sr-only">{title}</h3>
                      <ul className="space-y-2">
                        {list.map((issue) => (
                          <li
                            key={issue.code}
                            data-code={issue.code}
                            className="flex gap-2 text-sm"
                          >
                            <span
                              className={`h-fit shrink-0 rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase ${
                                tone === "error"
                                  ? "border-error/50 text-error"
                                  : "border-warn/50 text-warn"
                              }`}
                            >
                              {tone === "error" ? "Erro" : "Aviso"}
                            </span>
                            <span>
                              {issue.message}
                              <span className="mt-0.5 block text-xs text-muted">
                                {issue.categories
                                  .map((category) => CATEGORY_LABELS[category])
                                  .join(" · ")}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
              )}
            </div>
          )}
        </section>

        <PriceSection price={price} partCount={partCount} />
        <PowerSection build={build} />
        <CopyLink disabled={partCount === 0} />
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <p className="spec-label">Total</p>
            <p className="tabular text-lg text-accent">
              {formatBRL(price.totalCents)}
            </p>
            {price.illustrative && (
              <p className="text-xs text-muted">{ILLUSTRATIVE_NOTE}</p>
            )}
          </div>
          <a
            href="#resumo"
            className={`rounded-panel border px-3 py-2 text-sm ${
              errors.length > 0
                ? "border-error/60 text-error"
                : warnings.length > 0
                  ? "border-warn/50 text-warn"
                  : "border-line-strong text-muted"
            }`}
          >
            {errors.length + warnings.length === 0
              ? "Sem problemas"
              : plural(
                  errors.length + warnings.length,
                  "problema",
                  "problemas",
                )}
          </a>
        </div>
      </div>
    </>
  );
}

function PriceSection({
  price,
  partCount,
}: {
  price: BuildPrice;
  partCount: number;
}) {
  const topStores = price.stores.slice(0, 3);
  return (
    <section
      aria-labelledby="preco"
      className="rounded-panel border border-line bg-surface p-4"
    >
      <h2 id="preco" className="spec-label">
        Preço
      </h2>
      <p
        className="tabular mt-1 text-3xl text-accent"
        data-testid="build-total"
      >
        {formatBRL(price.totalCents)}
      </p>
      {price.illustrative && (
        <p className="text-sm text-warn" data-testid="illustrative-note">
          {ILLUSTRATIVE_NOTE}
        </p>
      )}
      <p className="mt-1 text-xs text-muted">
        Menor preço atual de cada peça, em lojas diferentes. Frete não incluído.
      </p>
      {price.unpriced.length > 0 && (
        <p className="mt-2 text-sm text-warn">
          Sem preço recente:{" "}
          {price.unpriced
            .map((part) => `${part.brand} ${part.model}`)
            .join(", ")}
        </p>
      )}
      {partCount > 0 && topStores.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <h3 className="spec-label">Tudo numa loja só</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {topStores.map((store) => (
              <li
                key={store.storeSlug}
                className="flex items-baseline justify-between gap-3"
              >
                <span>
                  {store.storeName}
                  <span className="block text-xs text-muted">
                    {store.missing === 0
                      ? "tem todas as peças"
                      : `faltam ${plural(store.missing, "peça", "peças")}`}
                  </span>
                </span>
                <span className="tabular text-right">
                  {formatBRL(store.totalCents)}
                  {store.illustrative && (
                    <span className="block font-sans text-xs text-muted">
                      {ILLUSTRATIVE_NOTE}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function PowerSection({ build }: { build: Build }) {
  if (!build.cpu && !build.gpu) return null;
  const estimate = estimatePower(build);
  const recommendation = recommendPsu(build, estimate);
  const psuW = build.psu?.specs.wattageW;
  return (
    <section
      aria-labelledby="energia"
      className="rounded-panel border border-line bg-surface p-4"
    >
      <h2 id="energia" className="spec-label">
        Energia
      </h2>
      <dl className="mt-2 space-y-3 text-sm">
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt className="text-muted">Consumo estimado</dt>
          <dd className="tabular">{estimate.totalW} W</dd>
          <dd className="tabular w-full text-xs text-muted">
            CPU {estimate.cpuW} W + GPU {estimate.gpuW} W + placa, memória e
            discos {estimate.platformW} W
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt className="text-muted">Fonte recomendada</dt>
          <dd className="tabular">{recommendation.wattageW} W</dd>
          <dd className="w-full text-xs text-muted">
            {recommendation.basis === "gpu-vendor"
              ? "Recomendação do fabricante da placa de vídeo, maior que o consumo com margem."
              : `Consumo estimado com ${Math.round((PSU_HEADROOM_FACTOR - 1) * 100)}% de margem.`}
          </dd>
        </div>
        {psuW !== undefined && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Sua fonte</dt>
            <dd
              className={`tabular ${psuW >= recommendation.wattageW ? "text-ok" : psuW >= estimate.totalW ? "text-warn" : "text-error"}`}
            >
              {psuW} W
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

function CopyLink({ disabled }: { disabled: boolean }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
    } catch {
      setState("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 3000);
  }

  return (
    <div>
      <button
        type="button"
        onClick={copy}
        disabled={disabled}
        className="w-full rounded-panel bg-accent px-4 py-2.5 font-medium text-accent-ink hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Copiar link da build
      </button>
      <p
        aria-live="polite"
        className="mt-1.5 min-h-5 text-center text-xs text-muted"
      >
        {state === "copied" && "Link copiado."}
        {state === "failed" &&
          "Não deu para copiar; copie o endereço da barra do navegador."}
      </p>
    </div>
  );
}
