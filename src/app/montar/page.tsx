import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type { BuilderEntry } from "@/builder/entry";
import { priceBuild } from "@/builder/pricing";
import { resolveBuild } from "@/builder/resolve";
import {
  decodeBuild,
  encodeBuild,
  isMultiCategory,
  toSearchParams,
  type BuildSelection,
} from "@/builder/url";
import { CATEGORY_ROUTES } from "@/catalog/categories";
import { Builder } from "@/components/builder/builder";
import { checkBuild } from "@/domain/compatibility";
import { formatBRL } from "@/domain/money/money";
import { scenarios } from "@/seed";
import { getBuilderCatalog } from "@/server/catalog";

type Props = PageProps<"/montar">;

const DESCRIPTION =
  "Escolha as peças do seu PC, veja a compatibilidade na hora e compare o preço total em lojas brasileiras.";

async function loadBuild(searchParams: Props["searchParams"]) {
  const { selection, problems } = decodeBuild(
    toSearchParams(await searchParams),
  );
  const entries = await getBuilderCatalog();
  const bySlug = new Map(entries.map((entry) => [entry.part.slug, entry]));
  const resolved = resolveBuild(selection, (slug) => bySlug.get(slug)?.part);
  return {
    entries,
    bySlug,
    resolved,
    ignored: problems.length + resolved.unknown.length,
  };
}

function linesOf(selection: BuildSelection, bySlug: Map<string, BuilderEntry>) {
  return CATEGORY_ROUTES.flatMap(({ category }) => {
    const picked = isMultiCategory(category)
      ? selection[category]
      : selection[category]
        ? [{ slug: selection[category], quantity: 1 }]
        : [];
    return picked.flatMap(({ slug, quantity }) => {
      const entry = bySlug.get(slug);
      return entry
        ? [{ part: entry.part, quantity, offers: entry.offers }]
        : [];
    });
  });
}

/** Title with CPU + GPU and a one-line summary, for shared build links. */
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { bySlug, resolved } = await loadBuild(searchParams);
  const { build, selection } = resolved;
  const lines = linesOf(selection, bySlug);
  if (lines.length === 0) {
    return {
      title: "Montar PC",
      description: DESCRIPTION,
      alternates: { canonical: "/montar" },
      openGraph: {
        title: "Montar PC",
        description: DESCRIPTION,
        url: "/montar",
      },
    };
  }

  const headline = [build.cpu, build.gpu]
    .filter((part) => part !== undefined)
    .map((part) => part.model)
    .join(" + ");
  const title = `Build: ${headline || `${lines.length} peças`}`;
  const issues = checkBuild(build);
  const errors = issues.filter((issue) => issue.severity === "error").length;
  const total = priceBuild(lines).totalCents;
  const units = lines.reduce((sum, line) => sum + line.quantity, 0);
  const description = `${units} ${units === 1 ? "peça" : "peças"}, a partir de ${formatBRL(total)}. ${
    errors === 0
      ? "Sem erros de compatibilidade."
      : `${errors} ${errors === 1 ? "erro" : "erros"} de compatibilidade.`
  }`;
  const url = `/montar?${encodeBuild(selection)}`;
  return {
    title,
    description,
    openGraph: { title, description, url },
    // Every build has its own URL; only the empty builder is canonical.
    robots: { index: false },
  };
}

export default function BuilderPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Montar PC</h1>
      <p className="mt-2 max-w-2xl text-muted">{DESCRIPTION}</p>
      <div className="mt-8">
        <Suspense fallback={<BuilderSkeleton />}>
          <LoadedBuilder searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function LoadedBuilder({ searchParams }: Pick<Props, "searchParams">) {
  const { entries, resolved, ignored } = await loadBuild(searchParams);
  const key = encodeBuild(resolved.selection);
  return (
    <>
      {ignored > 0 && (
        <p role="status" className="mb-4 text-sm text-warn">
          {ignored === 1
            ? "1 item do link não foi reconhecido e foi ignorado."
            : `${ignored} itens do link não foram reconhecidos e foram ignorados.`}
        </p>
      )}
      {/* Remount when the URL's build changes (example links, back button). */}
      <Builder
        key={key}
        entries={entries}
        initialSelection={resolved.selection}
      />
      <Examples />
    </>
  );
}

/** Builds of real seed parts that each show one rule, to explore the checks. */
function Examples() {
  return (
    <section
      aria-labelledby="exemplos"
      className="mt-12 border-t border-line pt-8"
    >
      <h2 id="exemplos" className="text-lg font-semibold">
        Exemplos com peças reais
      </h2>
      <p className="mt-1 text-sm text-muted">
        Cada um mostra uma regra de compatibilidade em ação.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const { parts } = scenario;
          const query = encodeBuild({
            CPU: parts.cpu,
            MOTHERBOARD: parts.motherboard,
            GPU: parts.gpu,
            PSU: parts.psu,
            CASE: parts.pcCase,
            COOLER: parts.cooler,
            MEMORY: (parts.memory ?? []).map((slug) => ({ slug, quantity: 1 })),
            STORAGE: (parts.storage ?? []).map((slug) => ({
              slug,
              quantity: 1,
            })),
          });
          return (
            <li key={scenario.name}>
              <Link
                href={`/montar?${query}`}
                data-scenario={scenario.name}
                className="block h-full rounded-panel border border-line bg-surface px-3 py-2.5 text-sm hover:border-line-strong hover:bg-raised"
              >
                <span
                  className={`spec-label ${scenario.expected.length === 0 ? "text-ok" : "text-warn"}`}
                >
                  {scenario.expected.length === 0
                    ? "Compatível"
                    : "Com problema"}
                </span>
                <span className="mt-1 block">{scenario.description}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function BuilderSkeleton() {
  return (
    <div role="status" className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <span className="sr-only">Carregando o montador…</span>
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-panel bg-raised"
          />
        ))}
      </div>
      <div
        className="h-96 animate-pulse rounded-panel bg-raised"
        aria-hidden="true"
      />
    </div>
  );
}
