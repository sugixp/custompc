import type { SeedPart } from "../types";

// AMD pages state Default TDP but not PPT, so maxPowerW is left out and the
// power estimate falls back to TDP. Intel pages state Maximum Turbo Power.
// Box coolers: AMD's "Thermal Solution (PIB)" field; for Intel, the support
// article listing the boxed CPUs that ship with the Laminar RM1.

const INTEL_RM1_LIST =
  "https://www.intel.com/content/www/us/en/support/articles/000089190/processors/intel-core-processors.html";

export const cpus: SeedPart[] = [
  {
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
      integratedGraphics: true,
      includesCooler: true, // AMD Wraith Stealth
      memoryTypes: ["DDR5"],
    },
    specSourceUrls: [
      "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600.html",
    ],
    referencePriceCents: 119_990,
  },
  {
    slug: "amd-ryzen-7-7800x3d",
    category: "CPU",
    brand: "AMD",
    model: "Ryzen 7 7800X3D",
    specs: {
      socket: "AM5",
      cores: 8,
      threads: 16,
      baseClockMhz: 4200,
      boostClockMhz: 5000,
      tdpW: 120,
      integratedGraphics: true,
      includesCooler: false,
      memoryTypes: ["DDR5"],
    },
    specSourceUrls: [
      "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html",
    ],
    referencePriceCents: 259_990,
  },
  {
    slug: "amd-ryzen-7-9700x",
    category: "CPU",
    brand: "AMD",
    model: "Ryzen 7 9700X",
    specs: {
      socket: "AM5",
      cores: 8,
      threads: 16,
      baseClockMhz: 3800,
      boostClockMhz: 5500,
      tdpW: 65,
      integratedGraphics: true,
      includesCooler: false,
      memoryTypes: ["DDR5"],
    },
    specSourceUrls: [
      "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9700x.html",
    ],
    referencePriceCents: 209_990,
  },
  {
    slug: "amd-ryzen-5-5600x",
    category: "CPU",
    brand: "AMD",
    model: "Ryzen 5 5600X",
    specs: {
      socket: "AM4",
      cores: 6,
      threads: 12,
      baseClockMhz: 3700,
      boostClockMhz: 4600,
      tdpW: 65,
      integratedGraphics: false, // "Discrete Graphics Card Required"
      includesCooler: true, // AMD Wraith Stealth
      memoryTypes: ["DDR4"],
    },
    specSourceUrls: [
      "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-5-5600x.html",
    ],
    referencePriceCents: 84_990,
  },
  {
    slug: "intel-core-i5-14400f",
    category: "CPU",
    brand: "Intel",
    model: "Core i5-14400F",
    specs: {
      socket: "LGA1700",
      cores: 10,
      threads: 16,
      baseClockMhz: 2500, // performance-core base
      boostClockMhz: 4700,
      tdpW: 65,
      maxPowerW: 148,
      integratedGraphics: false,
      includesCooler: true, // Intel Laminar RM1
      memoryTypes: ["DDR4", "DDR5"],
    },
    specSourceUrls: [
      "https://www.intel.com/content/www/us/en/products/sku/236777/intel-core-i5-processor-14400f-20m-cache-up-to-4-70-ghz/specifications.html",
      INTEL_RM1_LIST,
    ],
    referencePriceCents: 104_990,
  },
  {
    slug: "intel-core-i7-14700",
    category: "CPU",
    brand: "Intel",
    model: "Core i7-14700",
    specs: {
      socket: "LGA1700",
      cores: 20,
      threads: 28,
      baseClockMhz: 2100, // performance-core base
      boostClockMhz: 5400,
      tdpW: 65,
      maxPowerW: 219,
      integratedGraphics: true, // Intel UHD Graphics 770
      includesCooler: true, // Intel Laminar RM1
      memoryTypes: ["DDR4", "DDR5"],
    },
    specSourceUrls: [
      "https://www.intel.com/content/www/us/en/products/sku/236781/intel-core-i7-processor-14700-33m-cache-up-to-5-40-ghz/specifications.html",
      INTEL_RM1_LIST,
    ],
    referencePriceCents: 229_990,
  },
];
