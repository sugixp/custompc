import { z } from "zod";

/**
 * Money is always an integer number of centavos. Floats never hold prices,
 * so sums such as 0.1 + 0.2 cannot drift.
 */
export const centsSchema = z.number().int().nonnegative();

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function assertCents(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(
      `Expected a non-negative integer of cents, got ${value}`,
    );
  }
}

/** Formats centavos as Brazilian reais, e.g. 123456 -> "R$ 1.234,56". */
export function formatBRL(cents: number): string {
  assertCents(cents);
  return brl.format(cents / 100);
}

export function sumCents(values: readonly number[]): number {
  return values.reduce((total, value) => {
    assertCents(value);
    return total + value;
  }, 0);
}
