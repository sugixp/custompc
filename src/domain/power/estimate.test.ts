import { describe, expect, it } from "vitest";
import * as fx from "@/domain/parts/fixtures";
import { estimatePower, PLATFORM_POWER_W, recommendPsu } from "./estimate";

const cpuWithoutMax = {
  ...fx.cpu,
  specs: { ...fx.cpu.specs, maxPowerW: undefined },
};

describe("estimatePower", () => {
  it.each([
    [
      "CPU maxPowerW + GPU board power + platform",
      { cpu: fx.cpu, gpu: fx.gpu },
      88 + 200 + PLATFORM_POWER_W,
    ],
    [
      "CPU TDP when maxPowerW is unknown",
      { cpu: cpuWithoutMax, gpu: fx.gpu },
      65 + 200 + PLATFORM_POWER_W,
    ],
    ["no GPU (integrated graphics)", { cpu: fx.cpu }, 88 + PLATFORM_POWER_W],
    ["no parts: platform only", {}, PLATFORM_POWER_W],
  ])("%s", (_, build, totalW) => {
    expect(estimatePower(build).totalW).toBe(totalW);
  });

  it("reports the breakdown", () => {
    expect(estimatePower({ cpu: fx.cpu, gpu: fx.gpu })).toEqual({
      cpuW: 88,
      gpuW: 200,
      platformW: PLATFORM_POWER_W,
      totalW: 363,
    });
  });
});

describe("recommendPsu", () => {
  const bigGpu = {
    ...fx.gpu,
    specs: { ...fx.gpu.specs, boardPowerW: 450, recommendedPsuW: 850 },
  };
  const gpuWithLowVendorFigure = {
    ...fx.gpu,
    specs: { ...fx.gpu.specs, recommendedPsuW: 400 },
  };

  it.each([
    // 363 W x 1.3 = 471.9 -> 472 W, but the vendor asks for 650 W.
    [
      "vendor figure when it is higher",
      { cpu: fx.cpu, gpu: fx.gpu },
      650,
      "gpu-vendor",
    ],
    // 88 + 450 + 75 = 613 W x 1.3 = 796.9 -> 797 W < 850 W.
    [
      "vendor figure, not multiplied again",
      { cpu: fx.cpu, gpu: bigGpu },
      850,
      "gpu-vendor",
    ],
    [
      "headroom when it is higher",
      { cpu: fx.cpu, gpu: gpuWithLowVendorFigure },
      472,
      "headroom",
    ],
    // 88 + 75 = 163 W x 1.3 = 211.9 -> 212 W.
    ["headroom without a GPU", { cpu: fx.cpu }, 212, "headroom"],
  ] as const)("uses the %s", (_, build, wattageW, basis) => {
    expect(recommendPsu(build)).toEqual({ wattageW, basis });
  });
});
