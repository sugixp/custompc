import type { PriceSummary, ShownOffer } from "@/catalog/offers";
import type { Part } from "@/domain/parts";

/** A catalog part as the builder uses it: offers already judged for freshness. */
export interface BuilderEntry {
  part: Part;
  offers: ShownOffer[];
  price: PriceSummary;
}
