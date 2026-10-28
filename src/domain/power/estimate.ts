import type { Build } from "@/domain/build/build";

/**
 * Fixed allowance for everything except the CPU and the GPU. It is a rough,
 * deliberately generous figure for a typical desktop:
 *
 * - motherboard (chipset, VRM losses, onboard devices): ~40 W
 * - memory (2-4 DDR4/DDR5 modules):                     ~10 W
 * - drives (a couple of SSDs or one HDD):               ~15 W
 * - fans and AIO pump:                                  ~10 W
 *
 * Builds with many hard drives or fans can exceed it; see
 * docs/compatibility.md.
 */
export const PLATFORM_POWER_W = 75;

/** PSUs are most efficient and quietest well below their rated wattage. */
export const PSU_HEADROOM_FACTOR = 1.3;

export interface PowerEstimate {
  cpuW: number;
  gpuW: number;
  platformW: number;
  totalW: number;
}

/**
 * Estimated peak draw of the system. The CPU counts its sustained peak
 * (Intel PL2 / AMD PPT) when known, otherwise its TDP; the GPU counts its
 * total board power.
 */
export function estimatePower({
  cpu,
  gpu,
}: Pick<Build, "cpu" | "gpu">): PowerEstimate {
  const cpuW = cpu ? (cpu.specs.maxPowerW ?? cpu.specs.tdpW) : 0;
  const gpuW = gpu ? gpu.specs.boardPowerW : 0;
  return {
    cpuW,
    gpuW,
    platformW: PLATFORM_POWER_W,
    totalW: cpuW + gpuW + PLATFORM_POWER_W,
  };
}

export interface PsuRecommendation {
  wattageW: number;
  /** Which figure set the recommendation, so messages can explain it. */
  basis: "headroom" | "gpu-vendor";
}

/**
 * The larger of estimated draw plus headroom and the GPU vendor's recommended
 * PSU. The vendor figure already includes a margin, so it is not multiplied.
 */
export function recommendPsu(
  build: Pick<Build, "cpu" | "gpu">,
  estimate: PowerEstimate = estimatePower(build),
): PsuRecommendation {
  const withHeadroomW = Math.ceil(estimate.totalW * PSU_HEADROOM_FACTOR);
  const gpuVendorW = build.gpu?.specs.recommendedPsuW ?? 0;
  return gpuVendorW > withHeadroomW
    ? { wattageW: gpuVendorW, basis: "gpu-vendor" }
    : { wattageW: withHeadroomW, basis: "headroom" };
}
