import { checkBuild } from "@/domain/compatibility";
import type { Build } from "@/domain/build/build";
import { CATEGORY_LABELS, type Part, type PartOf } from "@/domain/parts";
import { parseSeedPart, parts, scenarios } from "@/seed";
import { CategoryIcon } from "./category-icon";

const SCENARIO = "long-gpu-in-compact-case";

function pick<C extends Part["category"]>(category: C, slug?: string) {
  if (!slug) return undefined;
  const seedPart = parts.find((part) => part.slug === slug);
  if (!seedPart || seedPart.category !== category) {
    throw new Error(`Scenario part ${slug} is not a ${category}`);
  }
  return parseSeedPart(seedPart) as PartOf<C>;
}

/**
 * A real check on real parts, run by the same rules as the builder: one of
 * the seed demo scenarios. Pure and database-free, so it prerenders.
 */
export function CompatibilityExample() {
  const scenario = scenarios.find((candidate) => candidate.name === SCENARIO);
  if (!scenario) return null;
  const slugs = scenario.parts;
  const build: Build = {
    cpu: pick("CPU", slugs.cpu),
    motherboard: pick("MOTHERBOARD", slugs.motherboard),
    memory: (slugs.memory ?? []).map((slug) => pick("MEMORY", slug)!),
    gpu: pick("GPU", slugs.gpu),
    storage: (slugs.storage ?? []).map((slug) => pick("STORAGE", slug)!),
    psu: pick("PSU", slugs.psu),
    pcCase: pick("CASE", slugs.pcCase),
    cooler: pick("COOLER", slugs.cooler),
  };
  const shown = [
    build.cpu,
    build.motherboard,
    build.gpu,
    build.psu,
    build.pcCase,
  ];
  const issues = checkBuild(build);
  const flagged = new Set(issues.flatMap((issue) => issue.categories));

  return (
    <figure className="min-w-0 rounded-panel border border-line bg-surface">
      <figcaption className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="spec-label">Verificação de compatibilidade</span>
        <span className="spec-label">Exemplo real</span>
      </figcaption>
      <ul className="divide-y divide-line/60 px-4">
        {shown.map(
          (part) =>
            part && (
              <li key={part.slug} className="flex items-center gap-3 py-2.5">
                <CategoryIcon
                  category={part.category}
                  className={`size-5 shrink-0 ${flagged.has(part.category) ? "text-error" : "text-muted"}`}
                />
                <span className="spec-label w-28 shrink-0 whitespace-nowrap">
                  {CATEGORY_LABELS[part.category]}
                </span>
                <span className="min-w-0 truncate text-sm">
                  {part.brand} {part.model}
                </span>
              </li>
            ),
        )}
      </ul>
      <div className="space-y-2 border-t border-line p-4">
        {issues.map((issue) => (
          <p key={issue.code} className="flex gap-2 text-sm">
            <span
              className={`h-fit shrink-0 rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase ${
                issue.severity === "error"
                  ? "border-error/50 text-error"
                  : "border-warn/50 text-warn"
              }`}
            >
              {issue.severity === "error" ? "Erro" : "Aviso"}
            </span>
            <span>{issue.message}</span>
          </p>
        ))}
      </div>
    </figure>
  );
}
