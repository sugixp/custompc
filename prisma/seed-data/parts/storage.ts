import type { SeedPart } from "../types";

// Kingston lists capacities by part number (SNV3S/1000G = 1000 GB); WD's page
// lists the WD20EZBX as a 2TB, 3.5-inch SATA drive.

const NV3 = "https://www.kingston.com/en/ssd/nv3-nvme-pcie-ssd";

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
    specSourceUrls: ["https://www.kingston.com/en/ssd/a400-solid-state-drive"],
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
    specSourceUrls: [
      "https://www.westerndigital.com/products/internal-drives/wd-blue-desktop-sata-hdd?sku=WD20EZBX",
    ],
    referencePriceCents: 44_990,
  },
];
