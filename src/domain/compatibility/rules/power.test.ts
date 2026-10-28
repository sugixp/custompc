import { describe, expect, it } from "vitest";
import * as fx from "@/domain/parts/fixtures";
import { IssueCode } from "../issue";
import {
  expectIssues,
  fullBuild,
  withSpecs,
  type ExpectedIssue,
} from "../test-helpers";
import { psuCoversPower, psuHasGpuConnectors } from "./power";

type Row = [string, Parameters<typeof fullBuild>[0], ExpectedIssue[]];

const psuOf = (wattageW: number) => withSpecs(fx.psu, { wattageW });
// The fixture build draws 88 (CPU) + 200 (GPU) + 75 (platform) = 363 W.
// Headroom gives 472 W; the GPU vendor recommends 650 W, so 650 W wins.
const lowVendorGpu = withSpecs(fx.gpu, { recommendedPsuW: 400 });
const WITH_GPU = ["PSU", "CPU", "GPU"] as const;

describe("psuCoversPower", () => {
  it.each<Row>([
    ["750 W PSU", {}, []],
    ["exactly the vendor recommendation (650 W)", { psu: psuOf(650) }, []],
    [
      "below the vendor recommendation",
      { psu: psuOf(600) },
      [{ code: IssueCode.PsuLowHeadroom, categories: WITH_GPU }],
    ],
    [
      "exactly the 30% headroom (472 W)",
      { psu: psuOf(472), gpu: lowVendorGpu },
      [],
    ],
    [
      "below the 30% headroom",
      { psu: psuOf(450), gpu: lowVendorGpu },
      [{ code: IssueCode.PsuLowHeadroom, categories: WITH_GPU }],
    ],
    [
      "exactly the estimate (363 W) still warns",
      { psu: psuOf(363), gpu: lowVendorGpu },
      [{ code: IssueCode.PsuLowHeadroom, categories: WITH_GPU }],
    ],
    [
      "below the estimate",
      { psu: psuOf(350) },
      [{ code: IssueCode.PsuInsufficient, categories: WITH_GPU }],
    ],
    // Without a GPU: 88 + 75 = 163 W, 212 W with headroom.
    ["no GPU, 300 W PSU", { gpu: undefined, psu: psuOf(300) }, []],
    [
      "no GPU, 200 W PSU",
      { gpu: undefined, psu: psuOf(200) },
      [{ code: IssueCode.PsuLowHeadroom, categories: ["PSU", "CPU"] }],
    ],
    ["no CPU yet", { cpu: undefined, psu: psuOf(100) }, []],
    ["no PSU yet", { psu: undefined }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(psuCoversPower, fullBuild(overrides), expected);
  });

  it("is an error below the estimate and a warning below the recommendation", () => {
    expect(psuCoversPower(fullBuild({ psu: psuOf(350) }))[0]?.severity).toBe(
      "error",
    );
    expect(psuCoversPower(fullBuild({ psu: psuOf(600) }))[0]?.severity).toBe(
      "warning",
    );
  });

  it("explains where the recommendation comes from", () => {
    const [vendor] = psuCoversPower(fullBuild({ psu: psuOf(600) }));
    expect(vendor?.message).toContain("650 W");
    expect(vendor?.message).toContain("fabricante da placa de vídeo");

    const [headroom] = psuCoversPower(
      fullBuild({ psu: psuOf(450), gpu: lowVendorGpu }),
    );
    expect(headroom?.message).toContain("472 W");
    expect(headroom?.message).toContain("30% de margem");
  });
});

describe("psuHasGpuConnectors", () => {
  const eightPinGpu = withSpecs(fx.gpu, {
    powerConnectors: { pcie8Pin: 3, pcie12v2x6: 0 },
  });
  const legacyPsu = withSpecs(fx.psu, {
    connectors: { pcie8Pin: 4, pcie12v2x6: 0 },
  });

  it.each<Row>([
    ["PSU has a native 12V-2x6", {}, []],
    [
      "GPU needs 12V-2x6, PSU has only 8-pin",
      { psu: legacyPsu },
      [
        {
          code: IssueCode.GpuPowerConnectorsMissing,
          categories: ["GPU", "PSU"],
        },
      ],
    ],
    ["GPU needs 3x 8-pin, PSU has 4", { gpu: eightPinGpu, psu: legacyPsu }, []],
    [
      "GPU needs 3x 8-pin, PSU has 2",
      { gpu: eightPinGpu },
      [
        {
          code: IssueCode.GpuPowerConnectorsMissing,
          categories: ["GPU", "PSU"],
        },
      ],
    ],
    ["no GPU", { gpu: undefined, psu: legacyPsu }, []],
    ["no PSU yet", { psu: undefined }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(psuHasGpuConnectors, fullBuild(overrides), expected);
  });

  it("only warns, since adapters exist", () => {
    expect(
      psuHasGpuConnectors(fullBuild({ psu: legacyPsu }))[0]?.severity,
    ).toBe("warning");
  });
});
