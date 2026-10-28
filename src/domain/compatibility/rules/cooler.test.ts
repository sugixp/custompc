import { describe, it } from "vitest";
import * as fx from "@/domain/parts/fixtures";
import { IssueCode } from "../issue";
import {
  expectIssues,
  fullBuild,
  withSpecs,
  type ExpectedIssue,
} from "../test-helpers";
import { coolerHandlesCpuHeat, coolerSupportsSocket } from "./cooler";

type Row = [string, Parameters<typeof fullBuild>[0], ExpectedIssue[]];

const am4OnlyCooler = withSpecs(fx.airCooler, { supportedSockets: ["AM4"] });

describe("coolerSupportsSocket", () => {
  it.each<Row>([
    ["cooler supports AM5", {}, []],
    [
      "AM4-only cooler, AM5 CPU",
      { cooler: am4OnlyCooler },
      [
        {
          code: IssueCode.CoolerSocketUnsupported,
          categories: ["COOLER", "CPU"],
        },
      ],
    ],
    // Before a CPU is picked, the board's socket is enough to check.
    [
      "AM4-only cooler, AM5 board, no CPU",
      { cooler: am4OnlyCooler, cpu: undefined },
      [
        {
          code: IssueCode.CoolerSocketUnsupported,
          categories: ["COOLER", "MOTHERBOARD"],
        },
      ],
    ],
    [
      "no CPU and no board",
      { cooler: am4OnlyCooler, cpu: undefined, motherboard: undefined },
      [],
    ],
    ["no cooler", { cooler: undefined }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(coolerSupportsSocket, fullBuild(overrides), expected);
  });
});

describe("coolerHandlesCpuHeat", () => {
  it.each<Row>([
    ["220 W cooler, 65 W CPU", {}, []],
    [
      "rating equal to TDP",
      { cooler: withSpecs(fx.airCooler, { tdpRatingW: 65 }) },
      [],
    ],
    [
      "rating below TDP",
      {
        cpu: withSpecs(fx.cpu, { tdpW: 125, maxPowerW: 181 }),
        cooler: withSpecs(fx.airCooler, { tdpRatingW: 95 }),
      },
      [{ code: IssueCode.CoolerUnderrated, categories: ["COOLER", "CPU"] }],
    ],
    // Many vendors do not publish a rating; silence beats guessing.
    ["cooler without a rating", { cooler: fx.aioCooler }, []],
    ["no CPU yet", { cpu: undefined }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(coolerHandlesCpuHeat, fullBuild(overrides), expected);
  });
});
