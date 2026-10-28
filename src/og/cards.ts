import type { SharedBuild } from "@/builder/share";
import type { CategoryRoute } from "@/catalog/categories";
import type { PriceSummary } from "@/catalog/offers";
import { keySpecs } from "@/catalog/specs";
import { CATEGORY_LABELS } from "@/domain/parts/labels";
import type { Part } from "@/domain/parts";
import { formatBRL } from "@/domain/money/money";
import { SITE_TAGLINE } from "@/site";
import type { OgCard } from "./card";

// What each Open Graph image says; card.tsx draws it.

export function defaultCard(): OgCard {
  return {
    eyebrow: "Montador de PC · Brasil",
    title: SITE_TAGLINE,
    subtitle:
      "Compare ofertas de lojas brasileiras e veja na hora se as peças funcionam juntas.",
  };
}

function priceStat(price: PriceSummary): OgCard["stat"] {
  switch (price.kind) {
    case "price":
      return { label: "A partir de", value: formatBRL(price.fromCents) };
    case "out-of-stock":
      return { label: "Preço", value: "Fora de estoque", muted: true };
    case "no-recent-price":
      return { label: "Preço", value: "Sem preço recente", muted: true };
  }
}

/** Lowest current price across the parts of a category. */
export function categoryCard(
  route: CategoryRoute,
  prices: readonly PriceSummary[],
): OgCard {
  const cents = prices.flatMap((price) =>
    price.kind === "price" ? [price.fromCents] : [],
  );
  return {
    eyebrow: `Peças · ${prices.length} ${prices.length === 1 ? "modelo" : "modelos"}`,
    title: route.label,
    subtitle: route.description,
    stat: priceStat(
      cents.length > 0
        ? { kind: "price", fromCents: Math.min(...cents) }
        : { kind: "no-recent-price" },
    ),
  };
}

export function partCard(part: Part, price: PriceSummary): OgCard {
  return {
    eyebrow: CATEGORY_LABELS[part.category],
    title: `${part.brand} ${part.model}`,
    subtitle: keySpecs(part).join(" · "),
    stat: priceStat(price),
  };
}

const count = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export function buildCard(shared: SharedBuild): OgCard {
  const { lines, cpu, gpu, units, totalCents, errors, warnings } = shared;
  const row = (part: Part) => ({
    label: CATEGORY_LABELS[part.category],
    value: `${part.brand} ${part.model}`,
  });
  // CPU and GPU say most about a build; without them, its first parts.
  const main = [cpu, gpu].filter((part) => part !== undefined);
  const shown = main.length > 0 ? main : lines.slice(0, 2).map((l) => l.part);
  return {
    eyebrow: `Build compartilhada · ${count(units, "peça", "peças")}`,
    title: "Build de PC",
    rows: shown.map(row),
    stat:
      totalCents > 0
        ? { label: "Total", value: formatBRL(totalCents) }
        : { label: "Total", value: "Sem preço recente", muted: true },
    badge:
      errors > 0
        ? { text: count(errors, "problema", "problemas"), tone: "error" }
        : warnings > 0
          ? {
              text: `Compatível · ${count(warnings, "aviso", "avisos")}`,
              tone: "warn",
            }
          : { text: "Compatível", tone: "ok" },
  };
}
