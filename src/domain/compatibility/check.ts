import type { Build } from "@/domain/build/build";
import type { Issue, Rule, Severity } from "./issue";
import {
  caseFitsAirCooler,
  caseFitsGpu,
  caseFitsMotherboard,
  caseFitsPsu,
  caseFitsRadiator,
} from "./rules/case";
import { noGraphicsOutput, requiredPartsPicked } from "./rules/completeness";
import { coolerHandlesCpuHeat, coolerSupportsSocket } from "./rules/cooler";
import {
  cpuInMotherboardSupportList,
  cpuSocketMatchesMotherboard,
} from "./rules/cpu";
import {
  memoryFitsSlots,
  memoryTypeMatchesMotherboard,
  memoryWithinMaxCapacity,
} from "./rules/memory";
import { psuCoversPower, psuHasGpuConnectors } from "./rules/power";
import { storageFitsM2Slots, storageFitsSataPorts } from "./rules/storage";

/** Order matters: within a severity, issues come out in this order. */
export const RULES: readonly Rule[] = [
  cpuSocketMatchesMotherboard,
  cpuInMotherboardSupportList,
  memoryTypeMatchesMotherboard,
  memoryFitsSlots,
  memoryWithinMaxCapacity,
  caseFitsMotherboard,
  caseFitsPsu,
  caseFitsGpu,
  caseFitsAirCooler,
  caseFitsRadiator,
  coolerSupportsSocket,
  coolerHandlesCpuHeat,
  storageFitsM2Slots,
  storageFitsSataPorts,
  psuCoversPower,
  psuHasGpuConnectors,
  noGraphicsOutput,
  requiredPartsPicked,
];

const SEVERITY_RANK: Record<Severity, number> = { error: 0, warning: 1 };

/**
 * Runs every rule against the build. Errors come before warnings; within a
 * severity, issues keep the order of RULES (Array#sort is stable).
 */
export function checkBuild(build: Build): Issue[] {
  return RULES.flatMap((rule) => rule(build)).sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );
}

export function hasErrors(issues: readonly Issue[]): boolean {
  return issues.some((issue) => issue.severity === "error");
}
