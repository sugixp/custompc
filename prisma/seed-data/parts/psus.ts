import type { SeedPart } from "../types";

// ASUS/ROG tech spec pages. "Intel Form Factor: ATX12V" is an ATX PSU.
// Connector counts are the "Cable Connectors" lines ("PCI-E 6+2-pin" counts as
// 8-pin). The pages do not state modularity, so it is left out.

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
];
