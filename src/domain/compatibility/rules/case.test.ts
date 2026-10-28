import { describe, expect, it } from "vitest";
import type { Cooler } from "@/domain/parts";
import * as fx from "@/domain/parts/fixtures";
import { IssueCode } from "../issue";
import {
  expectIssues,
  fullBuild,
  withSpecs,
  type ExpectedIssue,
} from "../test-helpers";
import {
  caseFitsAirCooler,
  caseFitsGpu,
  caseFitsMotherboard,
  caseFitsPsu,
  caseFitsRadiator,
} from "./case";

type Row = [string, Parameters<typeof fullBuild>[0], ExpectedIssue[]];

const itxCase = withSpecs(fx.pcCase, {
  supportedMotherboards: ["Mini-ITX"],
  supportedPsuFormFactors: ["SFX", "SFX-L"],
  maxGpuLengthMm: 280,
  maxCoolerHeightMm: 70,
  supportedRadiatorsMm: [120],
});
const aio = (radiatorSizeMm: 240 | 280 | 360): Cooler => ({
  ...fx.aioCooler,
  specs: { type: "aio", radiatorSizeMm, supportedSockets: ["AM5"] },
});

describe("caseFitsMotherboard", () => {
  it.each<Row>([
    ["Micro-ATX board in an ATX case", {}, []],
    [
      "Micro-ATX board in a Mini-ITX case",
      { pcCase: itxCase },
      [
        {
          code: IssueCode.MotherboardFormFactorUnsupported,
          categories: ["MOTHERBOARD", "CASE"],
        },
      ],
    ],
    ["no case yet", { pcCase: undefined }, []],
    ["no motherboard yet", { motherboard: undefined, pcCase: itxCase }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(caseFitsMotherboard, fullBuild(overrides), expected);
  });
});

describe("caseFitsPsu", () => {
  const sfxPsu = withSpecs(fx.psu, { formFactor: "SFX" });
  it.each<Row>([
    ["ATX PSU in an ATX case", {}, []],
    ["SFX PSU in an SFX case", { psu: sfxPsu, pcCase: itxCase }, []],
    [
      "ATX PSU in an SFX-only case",
      { pcCase: itxCase },
      [
        {
          code: IssueCode.PsuFormFactorUnsupported,
          categories: ["PSU", "CASE"],
        },
      ],
    ],
    ["no PSU yet", { psu: undefined, pcCase: itxCase }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(caseFitsPsu, fullBuild(overrides), expected);
  });
});

describe("caseFitsGpu", () => {
  it.each<Row>([
    ["285 mm GPU, 360 mm clearance", {}, []],
    ["exactly at the limit", { gpu: withSpecs(fx.gpu, { lengthMm: 360 }) }, []],
    [
      "285 mm GPU, 280 mm clearance",
      { pcCase: itxCase },
      [{ code: IssueCode.GpuTooLong, categories: ["GPU", "CASE"] }],
    ],
    ["no GPU", { gpu: undefined, pcCase: itxCase }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(caseFitsGpu, fullBuild(overrides), expected);
  });

  it("names both lengths", () => {
    const [issue] = caseFitsGpu(fullBuild({ pcCase: itxCase }));
    expect(issue?.message).toContain("285 mm");
    expect(issue?.message).toContain("280 mm");
  });
});

describe("caseFitsAirCooler", () => {
  it.each<Row>([
    ["155 mm cooler, 165 mm clearance", {}, []],
    [
      "155 mm cooler, 70 mm clearance",
      { pcCase: itxCase },
      [{ code: IssueCode.CoolerTooTall, categories: ["COOLER", "CASE"] }],
    ],
    // Height does not apply to AIOs, whatever the case clearance.
    [
      "AIO in a case with 70 mm clearance",
      {
        cooler: aio(240),
        pcCase: withSpecs(itxCase, { supportedRadiatorsMm: [240] }),
      },
      [],
    ],
    ["no cooler", { cooler: undefined, pcCase: itxCase }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(caseFitsAirCooler, fullBuild(overrides), expected);
  });
});

describe("caseFitsRadiator", () => {
  it.each<Row>([
    ["240 mm radiator, case takes 240", { cooler: aio(240) }, []],
    ["360 mm radiator, case takes 360", { cooler: aio(360) }, []],
    [
      "280 mm radiator, case takes only 120",
      { cooler: aio(280), pcCase: itxCase },
      [{ code: IssueCode.RadiatorUnsupported, categories: ["COOLER", "CASE"] }],
    ],
    [
      "case without radiator support",
      {
        cooler: aio(240),
        pcCase: withSpecs(fx.pcCase, { supportedRadiatorsMm: [] }),
      },
      [{ code: IssueCode.RadiatorUnsupported, categories: ["COOLER", "CASE"] }],
    ],
    // Radiator size does not apply to air coolers.
    [
      "air cooler in a case without radiator support",
      { pcCase: withSpecs(fx.pcCase, { supportedRadiatorsMm: [] }) },
      [],
    ],
    ["no case yet", { cooler: aio(360), pcCase: undefined }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(caseFitsRadiator, fullBuild(overrides), expected);
  });
});
