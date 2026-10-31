/**
 * Where an offer's price came from: the id of the PriceProvider that wrote it.
 *
 * - "seed": ILLUSTRATIVE example prices from this public repository.
 * - "manual": reference prices checked by hand at the store and imported
 *   from a spreadsheet (`npm run prices:import`).
 * - anything else: a real price collector from the private package.
 */
export const SEED_SOURCE = "seed";
export const MANUAL_SOURCE = "manual";

export function isIllustrative(source: string): boolean {
  return source === SEED_SOURCE;
}

/**
 * Which source wins when two report the same part at the same store. Any
 * real price, checked by hand or collected, beats an illustrative one,
 * however old (as long as it has not expired); the seed only fills gaps.
 */
export function sourceRank(source: string): number {
  return isIllustrative(source) ? 0 : 1;
}
