import type { z } from "zod";
import type { CATEGORIES } from "./constants";
import type {
  caseSchema,
  coolerSchema,
  cpuSchema,
  gpuSchema,
  memorySchema,
  motherboardSchema,
  partSchema,
  pcieConnectorsSchema,
  psuSchema,
  storageSchema,
} from "./schemas";

export type Category = (typeof CATEGORIES)[number];

export type Cpu = z.infer<typeof cpuSchema>;
export type Motherboard = z.infer<typeof motherboardSchema>;
export type Memory = z.infer<typeof memorySchema>;
export type Gpu = z.infer<typeof gpuSchema>;
export type Storage = z.infer<typeof storageSchema>;
export type Psu = z.infer<typeof psuSchema>;
export type Case = z.infer<typeof caseSchema>;
export type Cooler = z.infer<typeof coolerSchema>;
export type Part = z.infer<typeof partSchema>;

export type PcieConnectors = z.infer<typeof pcieConnectorsSchema>;

/** Narrows Part to the variant of one category, e.g. PartOf<"GPU"> = Gpu. */
export type PartOf<C extends Category> = Extract<Part, { category: C }>;
