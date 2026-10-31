import type { SeedPart } from "../types";

// Kingston lists capacities by part number (SNV3S/1000G = 1000 GB); the NV3s
// here are the M.2 2280 ones, not the 2230 SNV3SM3. WD's page names each
// Blue hard drive's capacity and lists it as a 3.5-inch SATA drive. WD's SSD
// pages now live on sandisk.com; the sku link selects the capacity, and the
// page gives M.2 2280 and PCIe 4.0 x4.

const NV3 = "https://www.kingston.com/en/ssd/nv3-nvme-pcie-ssd";
const A400 = "https://www.kingston.com/en/ssd/a400-solid-state-drive";
const WD_HDD =
  "https://www.westerndigital.com/products/internal-drives/wd-blue-desktop-sata-hdd";
const SANDISK = "https://www.sandisk.com/products/ssd/internal-ssd";

export const storage: SeedPart[] = [
  {
    slug: "kingston-nv3-1tb",
    category: "STORAGE",
    brand: "Kingston",
    model: "NV3 1TB (SNV3S/1000G)",
    specs: {
      kind: "SSD",
      interface: "NVMe",
      formFactor: "M.2",
      capacityGb: 1000,
    },
    specSourceUrls: [NV3],
    referencePriceCents: 44_990,
  },
  {
    slug: "kingston-nv3-2tb",
    category: "STORAGE",
    brand: "Kingston",
    model: "NV3 2TB (SNV3S/2000G)",
    specs: {
      kind: "SSD",
      interface: "NVMe",
      formFactor: "M.2",
      capacityGb: 2000,
    },
    specSourceUrls: [NV3],
    referencePriceCents: 84_990,
  },
  {
    slug: "kingston-a400-480gb",
    category: "STORAGE",
    brand: "Kingston",
    model: "A400 480GB (SA400S37/480G)",
    specs: {
      kind: "SSD",
      interface: "SATA",
      formFactor: "2.5in",
      capacityGb: 480,
    },
    specSourceUrls: [A400],
    referencePriceCents: 21_990,
  },
  {
    slug: "wd-blue-2tb-wd20ezbx",
    category: "STORAGE",
    brand: "WD",
    model: "Blue 2TB (WD20EZBX)",
    specs: {
      kind: "HDD",
      interface: "SATA",
      formFactor: "3.5in",
      capacityGb: 2000,
    },
    specSourceUrls: [`${WD_HDD}?sku=WD20EZBX`],
    referencePriceCents: 44_990,
  },
  {
    slug: "kingston-nv3-500gb",
    category: "STORAGE",
    brand: "Kingston",
    model: "NV3 500GB (SNV3S/500G)",
    specs: {
      kind: "SSD",
      interface: "NVMe",
      formFactor: "M.2",
      capacityGb: 500,
    },
    specSourceUrls: [NV3],
    referencePriceCents: 29_990,
  },
  {
    slug: "kingston-nv3-4tb",
    category: "STORAGE",
    brand: "Kingston",
    model: "NV3 4TB (SNV3S/4000G)",
    specs: {
      kind: "SSD",
      interface: "NVMe",
      formFactor: "M.2",
      capacityGb: 4000,
    },
    specSourceUrls: [NV3],
    referencePriceCents: 169_990,
  },
  {
    slug: "kingston-a400-240gb",
    category: "STORAGE",
    brand: "Kingston",
    model: "A400 240GB (SA400S37/240G)",
    specs: {
      kind: "SSD",
      interface: "SATA",
      formFactor: "2.5in",
      capacityGb: 240,
    },
    specSourceUrls: [A400],
    referencePriceCents: 14_990,
  },
  {
    slug: "kingston-a400-960gb",
    category: "STORAGE",
    brand: "Kingston",
    model: "A400 960GB (SA400S37/960G)",
    specs: {
      kind: "SSD",
      interface: "SATA",
      formFactor: "2.5in",
      capacityGb: 960,
    },
    specSourceUrls: [A400],
    referencePriceCents: 39_990,
  },
  {
    slug: "wd-blue-sn5000-1tb",
    category: "STORAGE",
    brand: "WD",
    model: "Blue SN5000 1TB (WDS100T4B0E)",
    specs: {
      kind: "SSD",
      interface: "NVMe",
      formFactor: "M.2",
      capacityGb: 1000,
    },
    specSourceUrls: [
      `${SANDISK}/wd-blue-sn5000-nvme-ssd?sku=WDS100T4B0E-00CNZ0`,
    ],
    referencePriceCents: 54_990,
  },
  {
    slug: "wd-blue-sn5000-2tb",
    category: "STORAGE",
    brand: "WD",
    model: "Blue SN5000 2TB (WDS200T4B0E)",
    specs: {
      kind: "SSD",
      interface: "NVMe",
      formFactor: "M.2",
      capacityGb: 2000,
    },
    specSourceUrls: [
      `${SANDISK}/wd-blue-sn5000-nvme-ssd?sku=WDS200T4B0E-00CNZ0`,
    ],
    referencePriceCents: 99_990,
  },
  {
    slug: "wd-black-sn850x-1tb",
    category: "STORAGE",
    brand: "WD",
    model: "WD_BLACK SN850X 1TB (WDS100T2X0E)",
    specs: {
      kind: "SSD",
      interface: "NVMe",
      formFactor: "M.2",
      capacityGb: 1000,
    },
    specSourceUrls: [
      `${SANDISK}/wd-black-sn850x-nvme-ssd?sku=WDS100T2X0E-00BCA0`,
    ],
    referencePriceCents: 79_990,
  },
  {
    slug: "wd-black-sn850x-2tb",
    category: "STORAGE",
    brand: "WD",
    model: "WD_BLACK SN850X 2TB (WDS200T2X0E)",
    specs: {
      kind: "SSD",
      interface: "NVMe",
      formFactor: "M.2",
      capacityGb: 2000,
    },
    specSourceUrls: [
      `${SANDISK}/wd-black-sn850x-nvme-ssd?sku=WDS200T2X0E-00BCA0`,
    ],
    referencePriceCents: 139_990,
  },
  {
    slug: "wd-black-sn850x-4tb",
    category: "STORAGE",
    brand: "WD",
    model: "WD_BLACK SN850X 4TB (WDS400T2X0E)",
    specs: {
      kind: "SSD",
      interface: "NVMe",
      formFactor: "M.2",
      capacityGb: 4000,
    },
    specSourceUrls: [
      `${SANDISK}/wd-black-sn850x-nvme-ssd?sku=WDS400T2X0E-00BCA0`,
    ],
    referencePriceCents: 289_990,
  },
  {
    slug: "wd-blue-1tb-wd10ezex",
    category: "STORAGE",
    brand: "WD",
    model: "Blue 1TB (WD10EZEX)",
    specs: {
      kind: "HDD",
      interface: "SATA",
      formFactor: "3.5in",
      capacityGb: 1000,
    },
    specSourceUrls: [`${WD_HDD}?sku=WD10EZEX`],
    referencePriceCents: 32_990,
  },
  {
    slug: "wd-blue-4tb-wd40ezax",
    category: "STORAGE",
    brand: "WD",
    model: "Blue 4TB (WD40EZAX)",
    specs: {
      kind: "HDD",
      interface: "SATA",
      formFactor: "3.5in",
      capacityGb: 4000,
    },
    specSourceUrls: [`${WD_HDD}?sku=WD40EZAX`],
    referencePriceCents: 69_990,
  },
];
