import type {
  Case,
  Cooler,
  Cpu,
  Gpu,
  Memory,
  Motherboard,
  Psu,
  Storage,
} from "@/domain/parts";

/**
 * The parts picked so far. Single-slot categories are optional; memory kits
 * and drives are lists, with one entry per unit (two identical kits appear
 * twice).
 */
export interface Build {
  cpu?: Cpu;
  motherboard?: Motherboard;
  memory: readonly Memory[];
  gpu?: Gpu;
  storage: readonly Storage[];
  psu?: Psu;
  pcCase?: Case;
  cooler?: Cooler;
}

export function emptyBuild(): Build {
  return { memory: [], storage: [] };
}
