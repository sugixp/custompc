import { describe, expect, it } from "vitest";
import { centsSchema, formatBRL, sumCents } from "./money";

// Intl puts a no-break space (U+00A0) between "R$" and the amount.
const NBSP = " ";

describe("formatBRL", () => {
  it.each([
    [0, `R$${NBSP}0,00`],
    [5, `R$${NBSP}0,05`],
    [123456, `R$${NBSP}1.234,56`],
    [1_299_990, `R$${NBSP}12.999,90`],
    [100_000_000, `R$${NBSP}1.000.000,00`],
  ])("formats %i cents as %s", (cents, expected) => {
    expect(formatBRL(cents)).toBe(expected);
  });

  it.each([-1, 1.5, Number.NaN])("rejects %s", (cents) => {
    expect(() => formatBRL(cents)).toThrow(RangeError);
  });
});

describe("sumCents", () => {
  it("adds integer cents without float drift", () => {
    expect(sumCents([10, 20])).toBe(30);
    expect(sumCents([])).toBe(0);
  });

  it("rejects non-integer values", () => {
    expect(() => sumCents([100, 0.5])).toThrow(RangeError);
  });
});

describe("centsSchema", () => {
  it("accepts non-negative integers only", () => {
    expect(centsSchema.safeParse(1999).success).toBe(true);
    expect(centsSchema.safeParse(19.99).success).toBe(false);
    expect(centsSchema.safeParse(-1).success).toBe(false);
  });
});
