import { describe, expect, it } from "vitest";
import {
  decodeBuild,
  emptySelection,
  encodeBuild,
  MAX_QUANTITY,
  removePart,
  selectPart,
  setQuantity,
  toSearchParams,
  type BuildSelection,
} from "./url";

const decode = (query: string) => decodeBuild(new URLSearchParams(query));

const full: BuildSelection = {
  CPU: "amd-ryzen-5-7600",
  MOTHERBOARD: "asus-tuf-gaming-b650m-plus-wifi",
  MEMORY: [
    { slug: "kingston-fury-beast-ddr5-6000-cl30-2x16gb", quantity: 2 },
    { slug: "kingston-fury-beast-ddr5-5600-cl40-2x16gb", quantity: 1 },
  ],
  GPU: "asus-prime-rtx-5070-12g",
  STORAGE: [{ slug: "kingston-nv3-1tb", quantity: 1 }],
  PSU: "asus-tuf-gaming-750w-gold",
  CASE: "fractal-meshify-2-compact",
  COOLER: "deepcool-ak400",
};

describe("encodeBuild / decodeBuild", () => {
  it("round-trips a full build", () => {
    const query = encodeBuild(full);
    expect(decode(query)).toEqual({ selection: full, problems: [] });
  });

  it("writes a compact, stable query in a fixed order", () => {
    expect(encodeBuild(full)).toBe(
      "cpu=amd-ryzen-5-7600&placa=asus-tuf-gaming-b650m-plus-wifi" +
        "&ram=kingston-fury-beast-ddr5-6000-cl30-2x16gb*2" +
        "&ram=kingston-fury-beast-ddr5-5600-cl40-2x16gb" +
        "&gpu=asus-prime-rtx-5070-12g&disco=kingston-nv3-1tb" +
        "&fonte=asus-tuf-gaming-750w-gold&gabinete=fractal-meshify-2-compact" +
        "&cooler=deepcool-ak400",
    );
  });

  it("gives the same link whatever order the parameters came in", () => {
    const shuffled = "cooler=deepcool-ak400&cpu=amd-ryzen-5-7600";
    expect(encodeBuild(decode(shuffled).selection)).toBe(
      "cpu=amd-ryzen-5-7600&cooler=deepcool-ak400",
    );
  });

  it("encodes nothing for an empty build", () => {
    expect(encodeBuild(emptySelection())).toBe("");
    expect(decode("")).toEqual({ selection: emptySelection(), problems: [] });
  });

  it("reads quantities in slugs that contain an x", () => {
    expect(decode("ram=kit-2x16gb*3").selection.MEMORY).toEqual([
      { slug: "kit-2x16gb", quantity: 3 },
    ]);
  });
});

describe("decodeBuild problems", () => {
  it.each([
    ["an uppercase slug", "cpu=AMD-Ryzen"],
    ["spaces", "cpu=amd ryzen"],
    ["a trailing dash", "gpu=rtx-"],
    ["an empty value", "gpu="],
  ])("drops %s as malformed", (_, query) => {
    const { selection, problems } = decode(query);
    expect(selection).toEqual(emptySelection());
    expect(problems.map((p) => p.kind)).toEqual(["malformed"]);
  });

  it.each([
    ["zero", "ram=kit*0"],
    ["above the cap", `ram=kit*${MAX_QUANTITY + 1}`],
    ["a quantity on a single-part category", "cpu=amd-ryzen-5-7600*2"],
  ])("drops a line with %s as invalid-quantity", (_, query) => {
    const { selection, problems } = decode(query);
    expect(selection).toEqual(emptySelection());
    expect(problems.map((p) => p.kind)).toEqual(["invalid-quantity"]);
  });

  it("keeps the first of a repeated single-part parameter", () => {
    const { selection, problems } = decode("cpu=first&cpu=second");
    expect(selection.CPU).toBe("first");
    expect(problems).toEqual([
      { kind: "duplicate", param: "cpu", value: "second" },
    ]);
  });

  it("adds up a repeated multi-part slug, capped", () => {
    expect(decode("ram=kit&ram=kit*2").selection.MEMORY).toEqual([
      { slug: "kit", quantity: 3 },
    ]);
    expect(decode(`ram=kit*${MAX_QUANTITY}&ram=kit`).selection.MEMORY).toEqual([
      { slug: "kit", quantity: MAX_QUANTITY },
    ]);
  });

  it("ignores unrelated parameters", () => {
    expect(decode("utm_source=x&cpu=amd-ryzen-5-7600")).toEqual({
      selection: { ...emptySelection(), CPU: "amd-ryzen-5-7600" },
      problems: [],
    });
  });

  it("keeps the good parts of a partly broken link", () => {
    const { selection, problems } = decode(
      "cpu=amd-ryzen-5-7600&gpu=Bad Slug&ram=kit*2",
    );
    expect(selection).toEqual({
      ...emptySelection(),
      CPU: "amd-ryzen-5-7600",
      MEMORY: [{ slug: "kit", quantity: 2 }],
    });
    expect(problems).toHaveLength(1);
  });
});

describe("toSearchParams", () => {
  it("flattens Next.js searchParams, keeping repeats", () => {
    expect(
      toSearchParams({ cpu: "a", ram: ["b", "c"], x: undefined }).toString(),
    ).toBe("cpu=a&ram=b&ram=c");
  });
});

describe("selection updates", () => {
  it("replaces single parts and adds multi-part lines", () => {
    let selection = selectPart(emptySelection(), "CPU", "a");
    selection = selectPart(selection, "CPU", "b");
    selection = selectPart(selection, "MEMORY", "kit");
    selection = selectPart(selection, "MEMORY", "kit");
    selection = selectPart(selection, "MEMORY", "other");
    expect(selection).toEqual({
      CPU: "b",
      MEMORY: [
        { slug: "kit", quantity: 2 },
        { slug: "other", quantity: 1 },
      ],
      STORAGE: [],
    });
  });

  it("removes parts", () => {
    const selection = {
      ...emptySelection(),
      CPU: "a",
      MEMORY: [{ slug: "kit", quantity: 1 }],
    };
    expect(removePart(selection, "CPU")).toEqual({
      ...emptySelection(),
      MEMORY: selection.MEMORY,
    });
    expect(removePart(selection, "MEMORY", "kit").MEMORY).toEqual([]);
  });

  it("clamps quantities", () => {
    const selection = {
      ...emptySelection(),
      STORAGE: [{ slug: "ssd", quantity: 1 }],
    };
    expect(
      setQuantity(selection, "STORAGE", "ssd", 0).STORAGE[0]?.quantity,
    ).toBe(1);
    expect(
      setQuantity(selection, "STORAGE", "ssd", 99).STORAGE[0]?.quantity,
    ).toBe(MAX_QUANTITY);
  });
});
