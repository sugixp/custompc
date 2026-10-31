import type { SeedPart } from "../types";

// AMD pages state Default TDP but not PPT, so maxPowerW is left out and the
// power estimate falls back to TDP. Intel pages state Maximum Turbo Power.
// Box coolers: AMD's "Thermal Solution (PIB)" field (the 8000G pages leave it
// out, so AMD's bundled-cooler table is the source); for Intel, the support
// article listing the boxed CPUs that ship with the Laminar RM1. Some AMD
// product pages have moved; the driver pages carry the same spec table.

const AMD_DRIVERS =
  "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen";
const AMD_COOLERS =
  "https://www.amd.com/en/products/processors/ecosystem/cpu-cooler-solutions.html";
const INTEL_SKU = "https://www.intel.com/content/www/us/en/products/sku";
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
  {
    slug: "amd-ryzen-5-5500",
    category: "CPU",
    brand: "AMD",
    model: "Ryzen 5 5500",
    specs: {
      socket: "AM4",
      cores: 6,
      threads: 12,
      baseClockMhz: 3600,
      boostClockMhz: 4200,
      tdpW: 65,
      integratedGraphics: false, // "Discrete Graphics Card Required"
      includesCooler: true, // AMD Wraith Stealth
      memoryTypes: ["DDR4"],
    },
    specSourceUrls: [`${AMD_DRIVERS}/ryzen-5000-series/amd-ryzen-5-5500.html`],
    referencePriceCents: 54_990,
  },
  {
    slug: "amd-ryzen-5-5600",
    category: "CPU",
    brand: "AMD",
    model: "Ryzen 5 5600",
    specs: {
      socket: "AM4",
      cores: 6,
      threads: 12,
      baseClockMhz: 3500,
      boostClockMhz: 4400,
      tdpW: 65,
      integratedGraphics: false, // "Discrete Graphics Card Required"
      includesCooler: true, // AMD Wraith Stealth
      memoryTypes: ["DDR4"],
    },
    specSourceUrls: [`${AMD_DRIVERS}/ryzen-5000-series/amd-ryzen-5-5600.html`],
    referencePriceCents: 74_990,
  },
  {
    slug: "amd-ryzen-7-5700x3d",
    category: "CPU",
    brand: "AMD",
    model: "Ryzen 7 5700X3D",
    specs: {
      socket: "AM4",
      cores: 8,
      threads: 16,
      baseClockMhz: 3000,
      boostClockMhz: 4100,
      tdpW: 105,
      integratedGraphics: false, // "Discrete Graphics Card Required"
      includesCooler: false,
      memoryTypes: ["DDR4"],
    },
    specSourceUrls: [
      `${AMD_DRIVERS}/ryzen-5000-series/amd-ryzen-7-5700x3d.html`,
    ],
    referencePriceCents: 129_990,
  },
  {
    slug: "amd-ryzen-5-8600g",
    category: "CPU",
    brand: "AMD",
    model: "Ryzen 5 8600G",
    specs: {
      socket: "AM5",
      cores: 6,
      threads: 12,
      baseClockMhz: 4300,
      boostClockMhz: 5000,
      tdpW: 65,
      integratedGraphics: true, // AMD Radeon 760M
      includesCooler: true, // AMD Wraith Stealth, per the bundled-cooler table
      memoryTypes: ["DDR5"],
    },
    specSourceUrls: [
      `${AMD_DRIVERS}/ryzen-8000-series/amd-ryzen-5-8600g.html`,
      AMD_COOLERS,
    ],
    referencePriceCents: 119_990,
  },
  {
    slug: "amd-ryzen-7-9800x3d",
    category: "CPU",
    brand: "AMD",
    model: "Ryzen 7 9800X3D",
    specs: {
      socket: "AM5",
      cores: 8,
      threads: 16,
      baseClockMhz: 4700,
      boostClockMhz: 5200,
      tdpW: 120,
      integratedGraphics: true,
      includesCooler: false,
      memoryTypes: ["DDR5"],
    },
    specSourceUrls: [
      `${AMD_DRIVERS}/ryzen-9000-series/amd-ryzen-7-9800x3d.html`,
    ],
    referencePriceCents: 329_990,
  },
  {
    slug: "amd-ryzen-9-9950x",
    category: "CPU",
    brand: "AMD",
    model: "Ryzen 9 9950X",
    specs: {
      socket: "AM5",
      cores: 16,
      threads: 32,
      baseClockMhz: 4300,
      boostClockMhz: 5700,
      tdpW: 170,
      integratedGraphics: true,
      includesCooler: false,
      memoryTypes: ["DDR5"],
    },
    specSourceUrls: [`${AMD_DRIVERS}/ryzen-9000-series/amd-ryzen-9-9950x.html`],
    referencePriceCents: 429_990,
  },
  {
    slug: "intel-core-i3-12100f",
    category: "CPU",
    brand: "Intel",
    model: "Core i3-12100F",
    specs: {
      socket: "LGA1700",
      cores: 4,
      threads: 8,
      baseClockMhz: 3300, // performance-core base
      boostClockMhz: 4300,
      tdpW: 58,
      maxPowerW: 89,
      integratedGraphics: false,
      includesCooler: true, // Intel Laminar RM1
      memoryTypes: ["DDR4", "DDR5"],
    },
    specSourceUrls: [
      `${INTEL_SKU}/132223/intel-core-i312100f-processor-12m-cache-up-to-4-30-ghz/specifications.html`,
      INTEL_RM1_LIST,
    ],
    referencePriceCents: 49_990,
  },
  {
    slug: "intel-core-i5-12400f",
    category: "CPU",
    brand: "Intel",
    model: "Core i5-12400F",
    specs: {
      socket: "LGA1700",
      cores: 6,
      threads: 12,
      baseClockMhz: 2500, // performance-core base
      boostClockMhz: 4400,
      tdpW: 65,
      maxPowerW: 117,
      integratedGraphics: false,
      includesCooler: true, // Intel Laminar RM1
      memoryTypes: ["DDR4", "DDR5"],
    },
    specSourceUrls: [
      `${INTEL_SKU}/134587/intel-core-i512400f-processor-18m-cache-up-to-4-40-ghz/specifications.html`,
      INTEL_RM1_LIST,
    ],
    referencePriceCents: 69_990,
  },
  {
    slug: "intel-core-ultra-7-265k",
    category: "CPU",
    brand: "Intel",
    model: "Core Ultra 7 265K",
    specs: {
      socket: "LGA1851",
      cores: 20,
      threads: 20,
      baseClockMhz: 3900, // performance-core base
      boostClockMhz: 5500,
      tdpW: 125,
      maxPowerW: 250,
      integratedGraphics: true, // Intel Graphics
      includesCooler: false, // not on the Laminar RM1 list
      memoryTypes: ["DDR5"],
    },
    specSourceUrls: [
      `${INTEL_SKU}/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/specifications.html`,
    ],
    referencePriceCents: 249_990,
  },
];
