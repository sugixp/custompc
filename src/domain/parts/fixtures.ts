import type {
  Case,
  Cooler,
  Cpu,
  Gpu,
  Memory,
  Motherboard,
  Psu,
  Storage,
} from "./types";

// One valid part per category: a mid-range AM5 build that fits together.
// Tests build invalid variants from these with spread overrides.

export const cpu: Cpu = {
  id: "cpu-ryzen-5-7600",
  slug: "amd-ryzen-5-7600",
  category: "CPU",
  brand: "AMD",
  model: "Ryzen 5 7600",
  specs: {
    socket: "AM5",
    cores: 6,
    threads: 12,
    baseClockMhz: 3800,
    boostClockMhz: 5100,
    tdpW: 65,
    maxPowerW: 88,
    integratedGraphics: true,
    includesCooler: true,
    memoryTypes: ["DDR5"],
  },
};

export const motherboard: Motherboard = {
  id: "mb-b650m",
  slug: "example-b650m",
  category: "MOTHERBOARD",
  brand: "Example",
  model: "B650M",
  specs: {
    socket: "AM5",
    chipset: "B650",
    formFactor: "Micro-ATX",
    memoryType: "DDR5",
    memorySlots: 4,
    maxMemoryGb: 192,
    m2Slots: 2,
    sataPorts: 4,
    supportedCpus: [{ cpuSlug: "amd-ryzen-5-7600", requiresBiosUpdate: false }],
  },
};

export const memory: Memory = {
  id: "ram-ddr5-2x16",
  slug: "example-ddr5-6000-2x16gb",
  category: "MEMORY",
  brand: "Example",
  model: "DDR5-6000 2x16GB",
  specs: {
    type: "DDR5",
    moduleCount: 2,
    moduleCapacityGb: 16,
    speedMts: 6000,
    casLatency: 30,
  },
};

export const gpu: Gpu = {
  id: "gpu-rtx-4070",
  slug: "example-rtx-4070",
  category: "GPU",
  brand: "Example",
  model: "GeForce RTX 4070",
  specs: {
    chipset: "GeForce RTX 4070",
    memoryGb: 12,
    lengthMm: 285,
    boardPowerW: 200,
    recommendedPsuW: 650,
    powerConnectors: { pcie8Pin: 0, pcie12v2x6: 1 },
  },
};

export const storage: Storage = {
  id: "ssd-1tb-nvme",
  slug: "example-nvme-1tb",
  category: "STORAGE",
  brand: "Example",
  model: "NVMe 1TB",
  specs: {
    kind: "SSD",
    interface: "NVMe",
    formFactor: "M.2",
    capacityGb: 1000,
  },
};

export const psu: Psu = {
  id: "psu-750-gold",
  slug: "example-750w-gold",
  category: "PSU",
  brand: "Example",
  model: "750W Gold",
  specs: {
    wattageW: 750,
    formFactor: "ATX",
    efficiency: "80 Plus Gold",
    modularity: "full",
    connectors: { pcie8Pin: 2, pcie12v2x6: 1 },
  },
};

export const pcCase: Case = {
  id: "case-mid-tower",
  slug: "example-mid-tower",
  category: "CASE",
  brand: "Example",
  model: "Mid Tower",
  specs: {
    supportedMotherboards: ["ATX", "Micro-ATX", "Mini-ITX"],
    supportedPsuFormFactors: ["ATX"],
    maxGpuLengthMm: 360,
    maxCoolerHeightMm: 165,
    supportedRadiatorsMm: [120, 240, 280, 360],
  },
};

export const airCooler: Cooler = {
  id: "cooler-tower",
  slug: "example-tower-cooler",
  category: "COOLER",
  brand: "Example",
  model: "Tower Cooler",
  specs: {
    type: "air",
    heightMm: 155,
    supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    tdpRatingW: 220,
  },
};

export const aioCooler: Cooler = {
  id: "cooler-aio-240",
  slug: "example-aio-240",
  category: "COOLER",
  brand: "Example",
  model: "AIO 240",
  specs: {
    type: "aio",
    radiatorSizeMm: 240,
    supportedSockets: ["AM5", "LGA1700", "LGA1851"],
  },
};
