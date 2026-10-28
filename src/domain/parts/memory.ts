import type { Memory } from "./types";

export function memoryKitCapacityGb(kit: Memory): number {
  return kit.specs.moduleCount * kit.specs.moduleCapacityGb;
}
