import type { SeedPart } from "../types";

// ASUS/ROG tech spec pages. "Intel Form Factor: ATX12V" is an ATX PSU.
// Corsair lists "PSU Form Factor" and "PCIe 8-pin (6+2)" connector totals.
// Connector counts are the "Cable Connectors" lines ("PCI-E 6+2-pin" counts as
// 8-pin, a "16-pin" is 12V-2x6). The pages do not state modularity, so it is
// left out. The ROG Thor 1000P2 page states no form factor, so it is not here.

const ASUS_PSU =
  "https://www.asus.com/motherboards-components/power-supply-units";
const ROG_PSU = "https://rog.asus.com/power-supply-units";

export const psus: SeedPart[] = [
  {
    slug: "asus-tuf-gaming-550w-bronze",
    category: "PSU",
    brand: "ASUS",
    model: "TUF Gaming 550W Bronze",
    specs: {
      wattageW: 550,
      formFactor: "ATX",
      efficiency: "80 Plus Bronze",
      connectors: { pcie8Pin: 2, pcie12v2x6: 0 },
    },
    specSourceUrls: [`${ASUS_PSU}/tuf-gaming/tuf-gaming-550b/techspec/`],
    referencePriceCents: 34_990,
  },
  {
    slug: "asus-tuf-gaming-750w-gold",
    category: "PSU",
    brand: "ASUS",
    model: "TUF Gaming 750W Gold",
    specs: {
      wattageW: 750,
      formFactor: "ATX",
      efficiency: "80 Plus Gold",
      connectors: { pcie8Pin: 3, pcie12v2x6: 1 },
    },
    specSourceUrls: [`${ASUS_PSU}/tuf-gaming/tuf-gaming-750g/techspec/`],
    referencePriceCents: 69_990,
  },
  {
    slug: "asus-prime-750w-gold",
    category: "PSU",
    brand: "ASUS",
    model: "Prime 750W Gold",
    specs: {
      wattageW: 750,
      formFactor: "ATX",
      efficiency: "80 Plus Gold",
      connectors: { pcie8Pin: 2, pcie12v2x6: 1 },
    },
    specSourceUrls: [`${ASUS_PSU}/prime/prime-750g/techspec/`],
    referencePriceCents: 64_990,
  },
  {
    slug: "asus-rog-strix-1000w-gold-aura",
    category: "PSU",
    brand: "ASUS",
    model: "ROG Strix 1000W Gold Aura Edition",
    specs: {
      wattageW: 1000,
      formFactor: "ATX",
      efficiency: "80 Plus Gold",
      connectors: { pcie8Pin: 4, pcie12v2x6: 1 },
    },
    specSourceUrls: [
      `${ROG_PSU}/rog-strix/rog-strix-1000g-aura-gaming-model/spec/`,
    ],
    referencePriceCents: 119_990,
  },
  {
    slug: "asus-rog-loki-sfx-l-850w-platinum",
    category: "PSU",
    brand: "ASUS",
    model: "ROG Loki SFX-L 850W Platinum",
    specs: {
      wattageW: 850,
      formFactor: "SFX-L",
      efficiency: "80 Plus Platinum",
      connectors: { pcie8Pin: 3, pcie12v2x6: 1 },
    },
    specSourceUrls: [
      `${ROG_PSU}/rog-loki/rog-loki-850p-sfx-l-gaming-model/spec/`,
    ],
    referencePriceCents: 129_990,
  },
  {
    slug: "asus-tuf-gaming-650w-bronze",
    category: "PSU",
    brand: "ASUS",
    model: "TUF Gaming 650W Bronze",
    specs: {
      wattageW: 650,
      formFactor: "ATX",
      efficiency: "80 Plus Bronze",
      connectors: { pcie8Pin: 2, pcie12v2x6: 0 },
    },
    specSourceUrls: [`${ASUS_PSU}/tuf-gaming/tuf-gaming-650b/techspec/`],
    referencePriceCents: 39_990,
  },
  {
    slug: "asus-tuf-gaming-750w-bronze",
    category: "PSU",
    brand: "ASUS",
    model: "TUF Gaming 750W Bronze",
    specs: {
      wattageW: 750,
      formFactor: "ATX",
      efficiency: "80 Plus Bronze",
      connectors: { pcie8Pin: 4, pcie12v2x6: 0 },
    },
    specSourceUrls: [`${ASUS_PSU}/tuf-gaming/tuf-gaming-750b/techspec/`],
    referencePriceCents: 49_990,
  },
  {
    slug: "asus-tuf-gaming-850w-gold",
    category: "PSU",
    brand: "ASUS",
    model: "TUF Gaming 850W Gold",
    specs: {
      wattageW: 850,
      formFactor: "ATX",
      efficiency: "80 Plus Gold",
      connectors: { pcie8Pin: 3, pcie12v2x6: 1 },
    },
    specSourceUrls: [`${ASUS_PSU}/tuf-gaming/tuf-gaming-850g/techspec/`],
    referencePriceCents: 79_990,
  },
  {
    slug: "asus-tuf-gaming-1000w-gold",
    category: "PSU",
    brand: "ASUS",
    model: "TUF Gaming 1000W Gold",
    specs: {
      wattageW: 1000,
      formFactor: "ATX",
      efficiency: "80 Plus Gold",
      connectors: { pcie8Pin: 4, pcie12v2x6: 1 },
    },
    specSourceUrls: [`${ASUS_PSU}/tuf-gaming/tuf-gaming-1000g/techspec/`],
    referencePriceCents: 99_990,
  },
  {
    slug: "asus-tuf-gaming-1200w-gold",
    category: "PSU",
    brand: "ASUS",
    model: "TUF Gaming 1200W Gold",
    specs: {
      wattageW: 1200,
      formFactor: "ATX",
      efficiency: "80 Plus Gold",
      connectors: { pcie8Pin: 3, pcie12v2x6: 2 },
    },
    specSourceUrls: [`${ASUS_PSU}/tuf-gaming/tuf-gaming-1200g/techspec/`],
    referencePriceCents: 129_990,
  },
  {
    slug: "asus-prime-850w-gold",
    category: "PSU",
    brand: "ASUS",
    model: "Prime 850W Gold",
    specs: {
      wattageW: 850,
      formFactor: "ATX",
      efficiency: "80 Plus Gold",
      connectors: { pcie8Pin: 3, pcie12v2x6: 1 },
    },
    specSourceUrls: [`${ASUS_PSU}/prime/prime-850g/techspec/`],
    referencePriceCents: 74_990,
  },
  {
    slug: "asus-rog-strix-750w-gold-aura",
    category: "PSU",
    brand: "ASUS",
    model: "ROG Strix 750W Gold Aura Edition",
    specs: {
      wattageW: 750,
      formFactor: "ATX",
      efficiency: "80 Plus Gold",
      connectors: { pcie8Pin: 3, pcie12v2x6: 1 },
    },
    specSourceUrls: [
      `${ROG_PSU}/rog-strix/rog-strix-750g-aura-gaming-model/spec/`,
    ],
    referencePriceCents: 84_990,
  },
  {
    slug: "asus-rog-strix-850w-gold-aura",
    category: "PSU",
    brand: "ASUS",
    model: "ROG Strix 850W Gold Aura Edition",
    specs: {
      wattageW: 850,
      formFactor: "ATX",
      efficiency: "80 Plus Gold",
      connectors: { pcie8Pin: 3, pcie12v2x6: 1 },
    },
    specSourceUrls: [
      `${ROG_PSU}/rog-strix/rog-strix-850g-aura-gaming-model/spec/`,
    ],
    referencePriceCents: 94_990,
  },
  {
    slug: "asus-rog-loki-sfx-l-1000w-platinum",
    category: "PSU",
    brand: "ASUS",
    model: "ROG Loki SFX-L 1000W Platinum",
    specs: {
      wattageW: 1000,
      formFactor: "SFX-L",
      efficiency: "80 Plus Platinum",
      connectors: { pcie8Pin: 3, pcie12v2x6: 1 },
    },
    specSourceUrls: [
      `${ROG_PSU}/rog-loki/rog-loki-1000p-sfx-l-gaming-model/spec/`,
    ],
    referencePriceCents: 159_990,
  },
  {
    slug: "asus-rog-loki-sfx-l-1200w-titanium",
    category: "PSU",
    brand: "ASUS",
    model: "ROG Loki SFX-L 1200W Titanium",
    specs: {
      wattageW: 1200,
      formFactor: "SFX-L",
      efficiency: "80 Plus Titanium",
      connectors: { pcie8Pin: 4, pcie12v2x6: 2 },
    },
    specSourceUrls: [
      `${ROG_PSU}/rog-loki/rog-loki-1200t-sfx-l-gaming-model/spec/`,
    ],
    referencePriceCents: 219_990,
  },
  {
    // Corsair's page is the US SKU (CP-9020278-NA); Brazilian stores sell the
    // same CX650 as CP-9020278-BR.
    slug: "corsair-cx650",
    category: "PSU",
    brand: "Corsair",
    model: "CX650 650W Bronze",
    specs: {
      wattageW: 650,
      formFactor: "ATX",
      efficiency: "80 Plus Bronze",
      connectors: { pcie8Pin: 2, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      "https://www.corsair.com/us/en/p/psu/cp-9020278-na/cx-series-cx650-650-watt-80-plus-bronze-atx-power-supply-cp-9020278-na",
    ],
    referencePriceCents: 37_990,
  },
];
