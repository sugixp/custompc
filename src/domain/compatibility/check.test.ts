import { describe, expect, it } from "vitest";
import { emptyBuild, type Build } from "@/domain/build/build";
import * as fx from "@/domain/parts/fixtures";
import { checkBuild, hasErrors, RULES } from "./check";
import { IssueCode } from "./issue";
import { fullBuild, withSpecs } from "./test-helpers";

const codes = (build: Build) => checkBuild(build).map((issue) => issue.code);

describe("checkBuild", () => {
  it("finds nothing wrong with the compatible fixture build", () => {
    expect(checkBuild(fullBuild())).toEqual([]);
  });

  it("only reports missing parts for an empty build", () => {
    expect(codes(emptyBuild())).toEqual([IssueCode.MissingRequiredParts]);
  });

  it("does not throw on any partial build", () => {
    const keys = [
      "cpu",
      "motherboard",
      "gpu",
      "psu",
      "pcCase",
      "cooler",
    ] as const;
    // Every subset of the single-slot parts, with and without lists.
    for (let mask = 0; mask < 1 << keys.length; mask++) {
      const build: Build = { ...emptyBuild() };
      const full = fullBuild();
      keys.forEach((key, bit) => {
        if (mask & (1 << bit)) Object.assign(build, { [key]: full[key] });
      });
      expect(() => checkBuild(build)).not.toThrow();
      expect(() =>
        checkBuild({ ...build, memory: full.memory, storage: full.storage }),
      ).not.toThrow();
    }
  });

  it("lists errors before warnings, in rule order within each severity", () => {
    // Warnings come from rules that run before some of the error rules, so a
    // plain concatenation in rule order would interleave them.
    const build = fullBuild({
      cpu: withSpecs(fx.cpu, { socket: "LGA1700", integratedGraphics: false }),
      motherboard: withSpecs(fx.motherboard, {
        socket: "LGA1700",
        supportedCpus: [],
      }),
      gpu: undefined,
      psu: undefined,
      pcCase: withSpecs(fx.pcCase, { maxCoolerHeightMm: 100 }),
    });
    expect(codes(build)).toEqual([
      IssueCode.CoolerTooTall,
      IssueCode.CpuNotInSupportList,
      IssueCode.NoGraphicsOutput,
      IssueCode.MissingRequiredParts,
    ]);
  });

  it("returns the same issues in the same order on every run", () => {
    const build = fullBuild({
      memory: [withSpecs(fx.memory, { type: "DDR4" })],
      psu: withSpecs(fx.psu, { wattageW: 300 }),
    });
    expect(checkBuild(build)).toEqual(checkBuild(build));
  });
});

describe("hasErrors", () => {
  it("is true only when an error is present", () => {
    expect(hasErrors(checkBuild(fullBuild()))).toBe(false);
    expect(hasErrors(checkBuild(emptyBuild()))).toBe(false);
    expect(
      hasErrors(
        checkBuild(
          fullBuild({ pcCase: withSpecs(fx.pcCase, { maxGpuLengthMm: 200 }) }),
        ),
      ),
    ).toBe(true);
  });
});

describe("RULES", () => {
  it("has every rule exactly once", () => {
    expect(new Set(RULES).size).toBe(RULES.length);
  });

  it("can raise every issue code", () => {
    // Guards against a code that was added but never wired to a rule.
    const raised = new Set<string>();
    const scenarios: Build[] = [
      emptyBuild(),
      fullBuild({
        cpu: withSpecs(fx.cpu, {
          socket: "LGA1700",
          integratedGraphics: false,
          tdpW: 250,
          maxPowerW: 253,
        }),
        gpu: undefined,
      }),
      fullBuild({
        motherboard: withSpecs(fx.motherboard, { supportedCpus: [] }),
      }),
      fullBuild({
        motherboard: withSpecs(fx.motherboard, {
          supportedCpus: [{ cpuSlug: fx.cpu.slug, requiresBiosUpdate: true }],
        }),
      }),
      fullBuild({
        memory: [
          withSpecs(fx.memory, {
            type: "DDR4",
            moduleCount: 8,
            moduleCapacityGb: 48,
          }),
        ],
        storage: [
          fx.storage,
          fx.storage,
          fx.storage,
          ...Array(5).fill(
            withSpecs(fx.storage, { interface: "SATA", formFactor: "2.5in" }),
          ),
        ],
        pcCase: withSpecs(fx.pcCase, {
          supportedMotherboards: ["ATX"],
          supportedPsuFormFactors: ["SFX"],
          maxGpuLengthMm: 200,
          maxCoolerHeightMm: 100,
        }),
        cooler: withSpecs(fx.airCooler, {
          supportedSockets: ["AM4"],
          tdpRatingW: 50,
        }),
        psu: withSpecs(fx.psu, {
          wattageW: 300,
          connectors: { pcie8Pin: 0, pcie12v2x6: 0 },
        }),
      }),
      fullBuild({
        psu: withSpecs(fx.psu, { wattageW: 600 }),
        cooler: {
          ...fx.aioCooler,
          specs: {
            type: "aio",
            radiatorSizeMm: 420,
            supportedSockets: ["AM5"],
          },
        },
      }),
    ];
    for (const build of scenarios)
      for (const issue of checkBuild(build)) raised.add(issue.code);
    expect([...raised].sort()).toEqual(Object.values(IssueCode).sort());
  });
});
