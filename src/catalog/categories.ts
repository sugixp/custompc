import type { Category } from "@/domain/parts";

/** How each category appears in URLs and headings (pt-BR). */
export interface CategoryRoute {
  category: Category;
  /** URL segment under /pecas. */
  slug: string;
  /** Plural, for headings and navigation. */
  label: string;
  description: string;
}

export const CATEGORY_ROUTES: readonly CategoryRoute[] = [
  {
    category: "CPU",
    slug: "processadores",
    label: "Processadores",
    description:
      "Processadores AMD e Intel com soquete, núcleos, clocks e TDP.",
  },
  {
    category: "MOTHERBOARD",
    slug: "placas-mae",
    label: "Placas-mãe",
    description:
      "Placas-mãe por soquete, chipset, formato, memória, slots M.2 e portas SATA.",
  },
  {
    category: "MEMORY",
    slug: "memorias",
    label: "Memórias RAM",
    description:
      "Kits de memória DDR4 e DDR5 por capacidade, velocidade e latência.",
  },
  {
    category: "GPU",
    slug: "placas-de-video",
    label: "Placas de vídeo",
    description:
      "Placas de vídeo com comprimento, consumo, fonte recomendada e conectores de energia.",
  },
  {
    category: "STORAGE",
    slug: "armazenamento",
    label: "Armazenamento",
    description: "SSDs NVMe e SATA e HDDs por capacidade e formato.",
  },
  {
    category: "PSU",
    slug: "fontes",
    label: "Fontes",
    description:
      "Fontes ATX e SFX por potência, certificação e conectores PCIe.",
  },
  {
    category: "CASE",
    slug: "gabinetes",
    label: "Gabinetes",
    description:
      "Gabinetes com formatos de placa e fonte, espaço para GPU e cooler e suporte a radiador.",
  },
  {
    category: "COOLER",
    slug: "coolers",
    label: "Coolers",
    description:
      "Coolers a ar e water coolers com altura, radiador e soquetes suportados.",
  },
];

export function categoryRouteBySlug(slug: string): CategoryRoute | undefined {
  return CATEGORY_ROUTES.find((route) => route.slug === slug);
}

export function categoryRoute(category: Category): CategoryRoute {
  const route = CATEGORY_ROUTES.find(
    (candidate) => candidate.category === category,
  );
  if (!route) throw new Error(`No route for category ${category}`);
  return route;
}

export function partPath(category: Category, partSlug: string): string {
  return `/pecas/${categoryRoute(category).slug}/${partSlug}`;
}
