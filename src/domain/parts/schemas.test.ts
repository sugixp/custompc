import { describe, expect, it } from "vitest";
import * as fx from "./fixtures";
import { memoryKitCapacityGb } from "./memory";
import {
  caseSchema,
  coolerSchema,
  cpuSchema,
  gpuSchema,
  memorySchema,
  motherboardSchema,
  partSchema,
  psuSchema,
  slugSchema,
  storageSchema,
} from "./schemas";

/** Collects the dotted paths of the issues a failed parse reports. */
function issuePaths(result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[] }[] };
}): string[] {
  expect(result.success).toBe(false);
  return (result.error?.issues ?? []).map((issue) => issue.path.join("."));
}

describe("valid fixtures", () => {
  it.each([
    ["CPU", cpuSchema, fx.cpu],
    ["MOTHERBOARD", motherboardSchema, fx.motherboard],
    ["MEMORY", memorySchema, fx.memory],
    ["GPU", gpuSchema, fx.gpu],
    ["STORAGE", storageSchema, fx.storage],
    ["PSU", psuSchema, fx.psu],
    ["CASE", caseSchema, fx.pcCase],
    ["COOLER (air)", coolerSchema, fx.airCooler],
    ["COOLER (aio)", coolerSchema, fx.aioCooler],
  ] as const)(
    "%s parses with its own schema and partSchema",
    (_, schema, part) => {
      expect(schema.parse(part)).toEqual(part);
      expect(partSchema.parse(part)).toEqual(part);
    },
  );
});

describe("partSchema", () => {
  it("validates specs against the schema of the declared category", () => {
    // CPU specs under a GPU category must not slip through.
    const result = partSchema.safeParse({ ...fx.cpu, category: "GPU" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown categories", () => {
    const result = partSchema.safeParse({ ...fx.cpu, category: "MONITOR" });
    expect(result.success).toBe(false);
  });
});

describe("slugSchema", () => {
  it.each(["amd-ryzen-5-7600", "rtx4070"])("accepts %s", (slug) => {
    expect(slugSchema.safeParse(slug).success).toBe(true);
  });

  it.each(["Ryzen 5", "-leading", "trailing-", "double--dash", ""])(
    "rejects %j",
    (slug) => {
      expect(slugSchema.safeParse(slug).success).toBe(false);
    },
  );
});

describe("CPU", () => {
  it("rejects fewer threads than cores", () => {
    const result = cpuSchema.safeParse({
      ...fx.cpu,
      specs: { ...fx.cpu.specs, threads: 4 },
    });
    expect(issuePaths(result)).toContain("specs.threads");
  });

  it("rejects a boost clock below the base clock", () => {
    const result = cpuSchema.safeParse({
      ...fx.cpu,
      specs: { ...fx.cpu.specs, boostClockMhz: 3000 },
    });
    expect(issuePaths(result)).toContain("specs.boostClockMhz");
  });

  it("treats maxPowerW as optional but never below tdpW", () => {
    const withoutMax: Partial<typeof fx.cpu.specs> = { ...fx.cpu.specs };
    delete withoutMax.maxPowerW;
    expect(cpuSchema.safeParse({ ...fx.cpu, specs: withoutMax }).success).toBe(
      true,
    );
    const result = cpuSchema.safeParse({
      ...fx.cpu,
      specs: { ...fx.cpu.specs, maxPowerW: 50 },
    });
    expect(issuePaths(result)).toContain("specs.maxPowerW");
  });

  it("rejects unknown sockets", () => {
    const result = cpuSchema.safeParse({
      ...fx.cpu,
      specs: { ...fx.cpu.specs, socket: "LGA9999" },
    });
    expect(issuePaths(result)).toContain("specs.socket");
  });
});

describe("MOTHERBOARD", () => {
  it("defaults requiresBiosUpdate to false", () => {
    const parsed = motherboardSchema.parse({
      ...fx.motherboard,
      specs: {
        ...fx.motherboard.specs,
        supportedCpus: [{ cpuSlug: "amd-ryzen-5-7600" }],
      },
    });
    expect(parsed.specs.supportedCpus[0]?.requiresBiosUpdate).toBe(false);
  });

  it("rejects negative M.2 slot counts", () => {
    const result = motherboardSchema.safeParse({
      ...fx.motherboard,
      specs: { ...fx.motherboard.specs, m2Slots: -1 },
    });
    expect(issuePaths(result)).toContain("specs.m2Slots");
  });
});

describe("MEMORY", () => {
  it("computes kit capacity as modules x capacity per module", () => {
    expect(memoryKitCapacityGb(fx.memory)).toBe(32);
  });

  it("rejects a kit with zero modules", () => {
    const result = memorySchema.safeParse({
      ...fx.memory,
      specs: { ...fx.memory.specs, moduleCount: 0 },
    });
    expect(issuePaths(result)).toContain("specs.moduleCount");
  });

  it("rejects unknown memory types", () => {
    const result = memorySchema.safeParse({
      ...fx.memory,
      specs: { ...fx.memory.specs, type: "DDR3" },
    });
    expect(issuePaths(result)).toContain("specs.type");
  });
});

describe("GPU", () => {
  it("rejects a non-integer length", () => {
    const result = gpuSchema.safeParse({
      ...fx.gpu,
      specs: { ...fx.gpu.specs, lengthMm: 285.5 },
    });
    expect(issuePaths(result)).toContain("specs.lengthMm");
  });

  it("requires the recommended PSU wattage", () => {
    const specs: Partial<typeof fx.gpu.specs> = { ...fx.gpu.specs };
    delete specs.recommendedPsuW;
    const result = gpuSchema.safeParse({ ...fx.gpu, specs });
    expect(issuePaths(result)).toContain("specs.recommendedPsuW");
  });
});

describe("STORAGE", () => {
  it("accepts a 2.5in SATA SSD and an M.2 SATA SSD", () => {
    for (const formFactor of ["2.5in", "M.2"] as const) {
      const result = storageSchema.safeParse({
        ...fx.storage,
        specs: { ...fx.storage.specs, interface: "SATA", formFactor },
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an NVMe drive that is not M.2", () => {
    const result = storageSchema.safeParse({
      ...fx.storage,
      specs: { ...fx.storage.specs, formFactor: "2.5in" },
    });
    expect(issuePaths(result)).toContain("specs.formFactor");
  });

  it("rejects an M.2 hard drive", () => {
    const result = storageSchema.safeParse({
      ...fx.storage,
      specs: {
        kind: "HDD",
        interface: "SATA",
        formFactor: "M.2",
        capacityGb: 2000,
      },
    });
    expect(issuePaths(result)).toContain("specs.formFactor");
  });
});

describe("PSU", () => {
  it("rejects unknown form factors", () => {
    const result = psuSchema.safeParse({
      ...fx.psu,
      specs: { ...fx.psu.specs, formFactor: "TFX" },
    });
    expect(issuePaths(result)).toContain("specs.formFactor");
  });

  it("rejects a negative connector count", () => {
    const result = psuSchema.safeParse({
      ...fx.psu,
      specs: { ...fx.psu.specs, connectors: { pcie8Pin: -1, pcie12v2x6: 0 } },
    });
    expect(issuePaths(result)).toContain("specs.connectors.pcie8Pin");
  });
});

describe("CASE", () => {
  it("rejects radiator sizes that do not exist", () => {
    const result = caseSchema.safeParse({
      ...fx.pcCase,
      specs: { ...fx.pcCase.specs, supportedRadiatorsMm: [250] },
    });
    expect(issuePaths(result)).toContain("specs.supportedRadiatorsMm.0");
  });

  it("requires at least one supported motherboard form factor", () => {
    const result = caseSchema.safeParse({
      ...fx.pcCase,
      specs: { ...fx.pcCase.specs, supportedMotherboards: [] },
    });
    expect(issuePaths(result)).toContain("specs.supportedMotherboards");
  });
});

describe("COOLER", () => {
  it("requires heightMm on air coolers", () => {
    const result = coolerSchema.safeParse({
      ...fx.airCooler,
      specs: { type: "air", supportedSockets: ["AM5"] },
    });
    expect(issuePaths(result)).toContain("specs.heightMm");
  });

  it("requires radiatorSizeMm on AIOs", () => {
    const result = coolerSchema.safeParse({
      ...fx.aioCooler,
      specs: { type: "aio", heightMm: 50, supportedSockets: ["AM5"] },
    });
    expect(issuePaths(result)).toContain("specs.radiatorSizeMm");
  });

  it("rejects unknown cooler types", () => {
    const result = coolerSchema.safeParse({
      ...fx.airCooler,
      specs: { ...fx.airCooler.specs, type: "passive" },
    });
    expect(result.success).toBe(false);
  });
});
