import {
  memoryKitCapacityGb,
  type Category,
  type Part,
  type PartOf,
} from "@/domain/parts";
import { formatCapacity } from "./format";

/**
 * A filter on the catalog listing. `param` is the URL search parameter, so a
 * filtered listing is a shareable link (/pecas/processadores?soquete=AM5).
 * A part can match several values (a cooler supports many sockets).
 */
export interface Facet {
  param: string;
  label: string;
  values(part: Part): string[];
}

function facet<C extends Category>(
  param: string,
  label: string,
  read: (part: PartOf<C>) => string | readonly string[],
): Facet {
  return {
    param,
    label,
    values: (part) => {
      const value = read(part as PartOf<C>);
      return typeof value === "string" ? [value] : [...value];
    },
  };
}

const brand = facet("marca", "Marca", (part) => part.brand);

export const FACETS: Record<Category, readonly Facet[]> = {
  CPU: [
    brand,
    facet<"CPU">("soquete", "Soquete", (p) => p.specs.socket),
    facet<"CPU">("video-integrado", "Vídeo integrado", (p) =>
      p.specs.integratedGraphics ? "Sim" : "Não",
    ),
  ],
  MOTHERBOARD: [
    brand,
    facet<"MOTHERBOARD">("soquete", "Soquete", (p) => p.specs.socket),
    facet<"MOTHERBOARD">("formato", "Formato", (p) => p.specs.formFactor),
    facet<"MOTHERBOARD">("memoria", "Memória", (p) => p.specs.memoryType),
  ],
  MEMORY: [
    brand,
    facet<"MEMORY">("tipo", "Tipo", (p) => p.specs.type),
    facet<"MEMORY">("capacidade", "Capacidade", (p) =>
      formatCapacity(memoryKitCapacityGb(p)),
    ),
  ],
  GPU: [
    brand,
    facet<"GPU">("memoria", "Memória", (p) => formatCapacity(p.specs.memoryGb)),
  ],
  STORAGE: [
    brand,
    facet<"STORAGE">("tipo", "Tipo", (p) =>
      p.specs.kind === "HDD" ? "HDD" : `SSD ${p.specs.interface}`,
    ),
    facet<"STORAGE">("capacidade", "Capacidade", (p) =>
      formatCapacity(p.specs.capacityGb),
    ),
  ],
  PSU: [
    brand,
    facet<"PSU">("formato", "Formato", (p) => p.specs.formFactor),
    facet<"PSU">("certificacao", "Certificação", (p) => p.specs.efficiency),
  ],
  CASE: [
    brand,
    facet<"CASE">(
      "placa-mae",
      "Placa-mãe",
      (p) => p.specs.supportedMotherboards,
    ),
    facet<"CASE">("fonte", "Fonte", (p) => p.specs.supportedPsuFormFactors),
  ],
  COOLER: [
    brand,
    facet<"COOLER">("tipo", "Tipo", (p) =>
      p.specs.type === "air" ? "Ar" : "Water cooler",
    ),
    facet<"COOLER">("soquete", "Soquete", (p) => p.specs.supportedSockets),
  ],
};

export interface FacetOptions {
  facet: Facet;
  options: string[];
}

const collator = new Intl.Collator("pt-BR", { numeric: true });

/** The values each facet can take across the given parts, sorted naturally. */
export function facetOptions(
  facets: readonly Facet[],
  parts: readonly Part[],
): FacetOptions[] {
  return facets.map((facet) => ({
    facet,
    options: [...new Set(parts.flatMap((part) => facet.values(part)))].sort(
      collator.compare,
    ),
  }));
}

/** Keeps the parts matching every selected facet value. */
export function applyFacetFilters<T extends { part: Part }>(
  items: readonly T[],
  facets: readonly Facet[],
  selected: Readonly<Record<string, string>>,
): T[] {
  const active = facets.filter((facet) => selected[facet.param] !== undefined);
  return items.filter(({ part }) =>
    active.every((facet) =>
      facet.values(part).includes(selected[facet.param]!),
    ),
  );
}
