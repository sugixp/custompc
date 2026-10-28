import { z } from "zod";
import {
  MEMORY_TYPES,
  MOTHERBOARD_FORM_FACTORS,
  PSU_EFFICIENCY_RATINGS,
  PSU_FORM_FACTORS,
  PSU_MODULARITY,
  RADIATOR_SIZES_MM,
  SOCKETS,
  STORAGE_FORM_FACTORS,
  STORAGE_INTERFACES,
  STORAGE_KINDS,
} from "./constants";

// Every numeric field carries its unit in the name (Mm, W, Gb, Mts, Mhz...).

const positiveInt = z.number().int().positive();
const nonNegativeInt = z.number().int().nonnegative();

export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, digits and dashes",
  );

export const socketSchema = z.enum(SOCKETS);
export const memoryTypeSchema = z.enum(MEMORY_TYPES);
export const motherboardFormFactorSchema = z.enum(MOTHERBOARD_FORM_FACTORS);
export const psuFormFactorSchema = z.enum(PSU_FORM_FACTORS);
export const radiatorSizeMmSchema = z.union(
  RADIATOR_SIZES_MM.map((size) => z.literal(size)),
);

/**
 * PCIe power connectors, used both for what a GPU needs and what a PSU offers.
 * 12VHPWR and its revision 12V-2x6 share the same plug, so they count as one.
 */
export const pcieConnectorsSchema = z.object({
  pcie8Pin: nonNegativeInt,
  pcie12v2x6: nonNegativeInt,
});

export const cpuSpecsSchema = z
  .object({
    socket: socketSchema,
    cores: positiveInt,
    threads: positiveInt,
    baseClockMhz: positiveInt,
    boostClockMhz: positiveInt,
    tdpW: positiveInt,
    integratedGraphics: z.boolean(),
    memoryTypes: z.array(memoryTypeSchema).min(1),
  })
  .refine((cpu) => cpu.threads >= cpu.cores, {
    message: "threads must be >= cores",
    path: ["threads"],
  })
  .refine((cpu) => cpu.boostClockMhz >= cpu.baseClockMhz, {
    message: "boostClockMhz must be >= baseClockMhz",
    path: ["boostClockMhz"],
  });

/**
 * A CPU the board officially supports. Boards often only run newer CPUs after
 * a BIOS update, which is a warning for the buyer, not an incompatibility.
 */
export const supportedCpuSchema = z.object({
  cpuSlug: slugSchema,
  requiresBiosUpdate: z.boolean().default(false),
});

export const motherboardSpecsSchema = z.object({
  socket: socketSchema,
  chipset: z.string().min(1),
  formFactor: motherboardFormFactorSchema,
  memoryType: memoryTypeSchema,
  memorySlots: positiveInt,
  maxMemoryGb: positiveInt,
  m2Slots: nonNegativeInt,
  sataPorts: nonNegativeInt,
  supportedCpus: z.array(supportedCpuSchema),
});

/** Memory is sold as kits: moduleCount sticks of moduleCapacityGb each. */
export const memorySpecsSchema = z.object({
  type: memoryTypeSchema,
  moduleCount: z.number().int().min(1).max(8),
  moduleCapacityGb: positiveInt,
  speedMts: positiveInt,
  casLatency: positiveInt,
});

export const gpuSpecsSchema = z.object({
  chipset: z.string().min(1),
  memoryGb: positiveInt,
  lengthMm: positiveInt,
  boardPowerW: positiveInt,
  /** The PSU wattage the manufacturer recommends for a full system. */
  recommendedPsuW: positiveInt,
  powerConnectors: pcieConnectorsSchema,
});

export const storageSpecsSchema = z
  .object({
    kind: z.enum(STORAGE_KINDS),
    interface: z.enum(STORAGE_INTERFACES),
    formFactor: z.enum(STORAGE_FORM_FACTORS),
    capacityGb: positiveInt,
  })
  .refine((drive) => drive.interface !== "NVMe" || drive.formFactor === "M.2", {
    message: "NVMe drives must be M.2",
    path: ["formFactor"],
  })
  .refine((drive) => drive.kind !== "HDD" || drive.formFactor !== "M.2", {
    message: "HDDs cannot be M.2",
    path: ["formFactor"],
  });

export const psuSpecsSchema = z.object({
  wattageW: positiveInt,
  formFactor: psuFormFactorSchema,
  efficiency: z.enum(PSU_EFFICIENCY_RATINGS),
  modularity: z.enum(PSU_MODULARITY),
  connectors: pcieConnectorsSchema,
});

export const caseSpecsSchema = z.object({
  supportedMotherboards: z.array(motherboardFormFactorSchema).min(1),
  supportedPsuFormFactors: z.array(psuFormFactorSchema).min(1),
  maxGpuLengthMm: positiveInt,
  maxCoolerHeightMm: positiveInt,
  supportedRadiatorsMm: z.array(radiatorSizeMmSchema),
});

const coolerBase = {
  supportedSockets: z.array(socketSchema).min(1),
  /** Heat the cooler is rated to dissipate; many vendors don't publish it. */
  tdpRatingW: positiveInt.optional(),
};

/** Air coolers are limited by height; AIOs by where the radiator fits. */
export const coolerSpecsSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("air"), heightMm: positiveInt, ...coolerBase }),
  z.object({
    type: z.literal("aio"),
    radiatorSizeMm: radiatorSizeMmSchema,
    ...coolerBase,
  }),
]);

const partBase = {
  id: z.string().min(1),
  slug: slugSchema,
  brand: z.string().min(1),
  model: z.string().min(1),
};

export const cpuSchema = z.object({
  ...partBase,
  category: z.literal("CPU"),
  specs: cpuSpecsSchema,
});
export const motherboardSchema = z.object({
  ...partBase,
  category: z.literal("MOTHERBOARD"),
  specs: motherboardSpecsSchema,
});
export const memorySchema = z.object({
  ...partBase,
  category: z.literal("MEMORY"),
  specs: memorySpecsSchema,
});
export const gpuSchema = z.object({
  ...partBase,
  category: z.literal("GPU"),
  specs: gpuSpecsSchema,
});
export const storageSchema = z.object({
  ...partBase,
  category: z.literal("STORAGE"),
  specs: storageSpecsSchema,
});
export const psuSchema = z.object({
  ...partBase,
  category: z.literal("PSU"),
  specs: psuSpecsSchema,
});
export const caseSchema = z.object({
  ...partBase,
  category: z.literal("CASE"),
  specs: caseSpecsSchema,
});
export const coolerSchema = z.object({
  ...partBase,
  category: z.literal("COOLER"),
  specs: coolerSpecsSchema,
});

export const partSchema = z.discriminatedUnion("category", [
  cpuSchema,
  motherboardSchema,
  memorySchema,
  gpuSchema,
  storageSchema,
  psuSchema,
  caseSchema,
  coolerSchema,
]);
