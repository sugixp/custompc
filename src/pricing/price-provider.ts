import { z } from "zod";
import { centsSchema } from "@/domain/money/money";
import { slugSchema, type Category } from "@/domain/parts";

/**
 * The boundary between this public repository and private price sources.
 *
 * A PriceProvider turns a list of catalog parts into offers. Providers never
 * run during a user request: `npm run prices:sync` calls every configured
 * provider and writes the offers to the database, and pages only read the
 * database. Real collectors, store integrations and affiliate ids live in a
 * private package that implements this interface (docs/architecture.md).
 */
export interface PriceProvider {
  /** Stable id, stored on every offer as its source (e.g. "seed"). */
  readonly id: string;
  /** Slugs of the stores this provider reports prices for. */
  readonly storeSlugs: readonly string[];
  fetchOffers(request: PriceRequest): Promise<readonly ProviderOffer[]>;
}

/** What a provider needs to find a part at a store. */
export interface PartRef {
  slug: string;
  category: Category;
  brand: string;
  model: string;
}

export interface PriceRequest {
  parts: readonly PartRef[];
  /** The time of this sync run; providers may use it as seenAt. */
  now: Date;
}

/**
 * A normalized offer. Providers are outside code, so every offer is checked
 * against this schema before it reaches the database.
 */
export const providerOfferSchema = z.object({
  partSlug: slugSchema,
  storeSlug: slugSchema,
  priceCents: centsSchema.positive(),
  url: z.url({ protocol: /^https$/ }),
  inStock: z.boolean(),
  seenAt: z.date(),
});

export type ProviderOffer = z.infer<typeof providerOfferSchema>;
