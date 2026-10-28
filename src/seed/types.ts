import type { z } from "zod";
import type { partSchema } from "@/domain/parts";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/**
 * A real part as written in the seed. Specs come from the manufacturer pages
 * in specSourceUrls; fields a page does not state are left out, never guessed.
 * The database assigns the id.
 */
export type SeedPart = DistributiveOmit<z.input<typeof partSchema>, "id"> & {
  specSourceUrls: readonly [string, ...string[]];
  /**
   * ILLUSTRATIVE price in centavos, a rough ballpark used to derive example
   * offers. Not a real quote from any store.
   */
  referencePriceCents: number;
};
