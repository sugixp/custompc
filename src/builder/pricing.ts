import type { ShownOffer } from "@/catalog/offers";
import type { Part } from "@/domain/parts";
import { isIllustrative } from "@/domain/pricing/sources";

/** One picked part and how many units of it. */
export interface PricedLine {
  part: Part;
  quantity: number;
  offers: readonly ShownOffer[];
}

export interface LinePrice {
  part: Part;
  quantity: number;
  /** The cheapest current offer in stock, or null when there is none. */
  best: ShownOffer | null;
}

export interface StoreTotal {
  storeSlug: string;
  storeName: string;
  /** Sum over the lines this store has in stock with a current price. */
  totalCents: number;
  /** Lines this store cannot supply right now. */
  missing: number;
  /** The total counts at least one illustrative seed price. */
  illustrative: boolean;
}

export interface BuildPrice {
  lines: LinePrice[];
  /** Cheapest current price per line, times quantity; unpriced lines excluded. */
  totalCents: number;
  /** Lines without a current offer in stock anywhere. */
  unpriced: Part[];
  /** The total counts at least one illustrative seed price. */
  illustrative: boolean;
  /** Buying everything at one store, best coverage first, then cheapest. */
  stores: StoreTotal[];
}

const buyable = (offer: ShownOffer) =>
  offer.freshness === "fresh" && offer.inStock;

/**
 * Prices a build two ways: cheapest store per part (the total), and all at
 * one store, since one order usually means one shipping fee.
 */
export function priceBuild(lines: readonly PricedLine[]): BuildPrice {
  const priced: LinePrice[] = lines.map(({ part, quantity, offers }) => {
    const current = offers.filter(buyable);
    // On a tie, a real price beats an illustrative one.
    const best = current.reduce<ShownOffer | null>(
      (cheapest, offer) =>
        cheapest === null ||
        offer.priceCents < cheapest.priceCents ||
        (offer.priceCents === cheapest.priceCents &&
          isIllustrative(cheapest.source) &&
          !isIllustrative(offer.source))
          ? offer
          : cheapest,
      null,
    );
    return { part, quantity, best };
  });

  const totalCents = priced.reduce(
    (sum, line) => sum + (line.best ? line.best.priceCents * line.quantity : 0),
    0,
  );

  const storeNames = new Map<string, string>();
  for (const { offers } of lines) {
    for (const offer of offers)
      storeNames.set(offer.storeSlug, offer.storeName);
  }
  const stores: StoreTotal[] = [...storeNames].map(([storeSlug, storeName]) => {
    let total = 0;
    let missing = 0;
    let illustrative = false;
    for (const { offers, quantity } of lines) {
      const offer = offers.find((o) => o.storeSlug === storeSlug && buyable(o));
      if (offer) {
        total += offer.priceCents * quantity;
        illustrative ||= isIllustrative(offer.source);
      } else missing += 1;
    }
    return { storeSlug, storeName, totalCents: total, missing, illustrative };
  });
  stores.sort(
    (a, b) =>
      a.missing - b.missing ||
      a.totalCents - b.totalCents ||
      a.storeName.localeCompare(b.storeName, "pt-BR"),
  );

  return {
    lines: priced,
    totalCents,
    unpriced: priced.filter((line) => !line.best).map((line) => line.part),
    illustrative: priced.some(
      (line) => line.best !== null && isIllustrative(line.best.source),
    ),
    stores,
  };
}
