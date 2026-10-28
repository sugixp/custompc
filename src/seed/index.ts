import { partSchema, type Part } from "@/domain/parts";
import { buildOffers } from "./offers";
import { cases } from "./parts/cases";
import { coolers } from "./parts/coolers";
import { cpus } from "./parts/cpus";
import { gpus } from "./parts/gpus";
import { memory } from "./parts/memory";
import { motherboards } from "./parts/motherboards";
import { psus } from "./parts/psus";
import { storage } from "./parts/storage";
import type { SeedPart } from "./types";

export { scenarios } from "./scenarios";
export { stores } from "./stores";
export type { SeedPart } from "./types";

export const parts: SeedPart[] = [
  ...cpus,
  ...motherboards,
  ...memory,
  ...gpus,
  ...storage,
  ...psus,
  ...cases,
  ...coolers,
];

export const offers = buildOffers(parts);

/**
 * Validates a seed part with the domain schema. The slug stands in for the id,
 * which only the database assigns.
 */
export function parseSeedPart(seedPart: SeedPart): Part {
  const { slug, category, brand, model, specs } = seedPart;
  return partSchema.parse({ id: slug, slug, category, brand, model, specs });
}
