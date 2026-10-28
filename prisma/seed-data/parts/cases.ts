import type { SeedPart } from "../types";

// Fractal Design product pages ("Compatibility" section). Supported radiator
// sizes are the union of every mounting position the page lists.

const FRACTAL = "https://www.fractal-design.com/products/cases";

export const cases: SeedPart[] = [
  {
    slug: "fractal-pop-air",
    category: "CASE",
    brand: "Fractal Design",
    model: "Pop Air",
    specs: {
      supportedMotherboards: ["ATX", "Micro-ATX", "Mini-ITX"],
      supportedPsuFormFactors: ["ATX"],
      maxGpuLengthMm: 405,
      maxCoolerHeightMm: 170,
      supportedRadiatorsMm: [120, 240, 280],
    },
    specSourceUrls: [`${FRACTAL}/pop/pop-air/`],
    referencePriceCents: 54_990,
  },
  {
    slug: "fractal-pop-mini-air",
    category: "CASE",
    brand: "Fractal Design",
    model: "Pop Mini Air",
    specs: {
      supportedMotherboards: ["Micro-ATX", "Mini-ITX"],
      supportedPsuFormFactors: ["ATX"],
      maxGpuLengthMm: 365,
      maxCoolerHeightMm: 170,
      supportedRadiatorsMm: [120, 240],
    },
    specSourceUrls: [`${FRACTAL}/pop/pop-mini-air/`],
    referencePriceCents: 49_990,
  },
  {
    slug: "fractal-meshify-2-compact",
    category: "CASE",
    brand: "Fractal Design",
    model: "Meshify 2 Compact",
    specs: {
      supportedMotherboards: ["ATX", "Micro-ATX", "Mini-ITX"],
      supportedPsuFormFactors: ["ATX"],
      maxGpuLengthMm: 341,
      maxCoolerHeightMm: 169,
      supportedRadiatorsMm: [120, 140, 240, 280, 360],
    },
    specSourceUrls: [`${FRACTAL}/meshify/meshify-2-compact/`],
    referencePriceCents: 79_990,
  },
  {
    slug: "fractal-north",
    category: "CASE",
    brand: "Fractal Design",
    model: "North",
    specs: {
      supportedMotherboards: ["ATX", "Micro-ATX", "Mini-ITX"],
      supportedPsuFormFactors: ["ATX"],
      // 355 mm, or 300 mm with a 360 mm front radiator (not modelled).
      maxGpuLengthMm: 355,
      maxCoolerHeightMm: 145,
      supportedRadiatorsMm: [120, 140, 240, 280, 360],
    },
    specSourceUrls: [`${FRACTAL}/north/north/`],
    referencePriceCents: 109_990,
  },
  {
    slug: "fractal-terra",
    category: "CASE",
    brand: "Fractal Design",
    model: "Terra",
    specs: {
      supportedMotherboards: ["Mini-ITX"],
      supportedPsuFormFactors: ["SFX", "SFX-L"],
      maxGpuLengthMm: 322,
      // The page's figure; the sliding wall trades GPU width for cooler height.
      maxCoolerHeightMm: 48,
      supportedRadiatorsMm: [120],
    },
    specSourceUrls: [`${FRACTAL}/terra/terra/`],
    referencePriceCents: 129_990,
  },
];
