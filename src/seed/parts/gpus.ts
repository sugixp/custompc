import type { SeedPart } from "../types";

// Length, recommended PSU and power connectors come from each ASUS card's tech
// spec page; a "16-pin" connector is 12V-2x6/12VHPWR. ASUS does not list
// board power, so boardPowerW is the chip vendor's reference figure (NVIDIA
// "Total Graphics Power", AMD "Typical Board Power"); factory-overclocked
// cards may draw somewhat more. Older generations: NVIDIA "Graphics Card Power",
// AMD "Typical Board Power (Desktop)". ASUS lists dimensions without labels;
// the first figure is the length. ASRock's page labels them "Dimensions"
// and states the recommended PSU and connector the same way. The Arc B580 is Intel's own Limited Edition,
// whose dimensions, TBP, PSU and connector are on Intel's spec page.

const ASUS_GPU = "https://www.asus.com/motherboards-components/graphics-cards";
const NVIDIA_GPU = "https://www.nvidia.com/en-us/geforce/graphics-cards";
const NVIDIA = `${NVIDIA_GPU}/50-series`;
const AMD_GPU = "https://www.amd.com/en/products/graphics/desktops/radeon";
const AMD = `${AMD_GPU}/9000-series`;

export const gpus: SeedPart[] = [
  {
    slug: "asus-dual-rtx-5060-8g",
    category: "GPU",
    brand: "ASUS",
    model: "Dual GeForce RTX 5060 8GB",
    specs: {
      chipset: "GeForce RTX 5060",
      memoryGb: 8,
      lengthMm: 228,
      boardPowerW: 145,
      recommendedPsuW: 550,
      powerConnectors: { pcie8Pin: 1, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/dual/dual-rtx5060-8g/techspec/`,
      `${NVIDIA}/rtx-5060-family/`,
    ],
    referencePriceCents: 219_990,
  },
  {
    slug: "asus-prime-rtx-5070-12g",
    category: "GPU",
    brand: "ASUS",
    model: "Prime GeForce RTX 5070 12GB",
    specs: {
      chipset: "GeForce RTX 5070",
      memoryGb: 12,
      lengthMm: 304,
      boardPowerW: 250,
      recommendedPsuW: 750,
      powerConnectors: { pcie8Pin: 0, pcie12v2x6: 1 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/prime/prime-rtx5070-12g/techspec/`,
      `${NVIDIA}/rtx-5070-family/`,
    ],
    referencePriceCents: 419_990,
  },
  {
    slug: "asus-tuf-rtx-5080-16g-gaming",
    category: "GPU",
    brand: "ASUS",
    model: "TUF Gaming GeForce RTX 5080 16GB",
    specs: {
      chipset: "GeForce RTX 5080",
      memoryGb: 16,
      lengthMm: 348,
      boardPowerW: 360,
      recommendedPsuW: 850,
      powerConnectors: { pcie8Pin: 0, pcie12v2x6: 1 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/tuf-gaming/tuf-rtx5080-16g-gaming/techspec/`,
      `${NVIDIA}/rtx-5080/`,
    ],
    referencePriceCents: 849_990,
  },
  {
    slug: "asus-dual-rx-9060-xt-16g",
    category: "GPU",
    brand: "ASUS",
    model: "Dual Radeon RX 9060 XT 16GB",
    specs: {
      chipset: "Radeon RX 9060 XT",
      memoryGb: 16,
      lengthMm: 202,
      boardPowerW: 160,
      recommendedPsuW: 550,
      powerConnectors: { pcie8Pin: 1, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/dual/dual-rx9060xt-16g/techspec/`,
      `${AMD}/amd-radeon-rx-9060xt.html`,
    ],
    referencePriceCents: 269_990,
  },
  {
    slug: "asus-prime-rx-9070-xt-o16g",
    category: "GPU",
    brand: "ASUS",
    model: "Prime Radeon RX 9070 XT OC 16GB",
    specs: {
      chipset: "Radeon RX 9070 XT",
      memoryGb: 16,
      lengthMm: 312,
      boardPowerW: 304,
      recommendedPsuW: 750,
      powerConnectors: { pcie8Pin: 3, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/prime/prime-rx9070xt-o16g/techspec/`,
      `${AMD}/amd-radeon-rx-9070xt.html`,
    ],
    referencePriceCents: 529_990,
  },
  {
    slug: "asus-dual-rtx-3050-6g",
    category: "GPU",
    brand: "ASUS",
    model: "Dual GeForce RTX 3050 6GB",
    specs: {
      chipset: "GeForce RTX 3050",
      memoryGb: 6,
      lengthMm: 201,
      boardPowerW: 70, // the 6 GB variant
      recommendedPsuW: 450,
      powerConnectors: { pcie8Pin: 0, pcie12v2x6: 0 }, // "Power Connectors: No"
    },
    specSourceUrls: [
      `${ASUS_GPU}/dual/dual-rtx3050-6g/techspec/`,
      `${NVIDIA_GPU}/30-series/rtx-3050/`,
    ],
    referencePriceCents: 119_990,
  },
  {
    slug: "asus-dual-rx-6600-8g",
    category: "GPU",
    brand: "ASUS",
    model: "Dual Radeon RX 6600 8GB",
    specs: {
      chipset: "Radeon RX 6600",
      memoryGb: 8,
      lengthMm: 243,
      boardPowerW: 132,
      recommendedPsuW: 500,
      powerConnectors: { pcie8Pin: 1, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/dual/dual-rx6600-8g/techspec/`,
      `${AMD_GPU}/6000-series/amd-radeon-rx-6600.html`,
    ],
    referencePriceCents: 129_990,
  },
  {
    slug: "asus-dual-rtx-3060-o12g-v2",
    category: "GPU",
    brand: "ASUS",
    model: "Dual GeForce RTX 3060 V2 OC 12GB",
    specs: {
      chipset: "GeForce RTX 3060",
      memoryGb: 12,
      lengthMm: 200, // "20 x 12.3 x 3.8 Centimeter"
      boardPowerW: 170,
      recommendedPsuW: 650,
      powerConnectors: { pcie8Pin: 1, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/dual/dual-rtx3060-o12g-v2/techspec/`,
      `${NVIDIA_GPU}/30-series/rtx-3060-3060ti/`,
    ],
    referencePriceCents: 179_990,
  },
  {
    slug: "asus-dual-rtx-4060-o8g",
    category: "GPU",
    brand: "ASUS",
    model: "Dual GeForce RTX 4060 OC 8GB",
    specs: {
      chipset: "GeForce RTX 4060",
      memoryGb: 8,
      lengthMm: 227,
      boardPowerW: 115,
      recommendedPsuW: 550,
      powerConnectors: { pcie8Pin: 1, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/dual/dual-rtx4060-o8g/techspec/`,
      `${NVIDIA_GPU}/40-series/rtx-4060-4060ti/`,
    ],
    referencePriceCents: 189_990,
  },
  {
    slug: "asus-dual-rx-7600-o8g",
    category: "GPU",
    brand: "ASUS",
    model: "Dual Radeon RX 7600 OC 8GB",
    specs: {
      chipset: "Radeon RX 7600",
      memoryGb: 8,
      lengthMm: 245,
      boardPowerW: 165,
      recommendedPsuW: 550,
      powerConnectors: { pcie8Pin: 1, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/dual/dual-rx7600-o8g/techspec/`,
      `${AMD_GPU}/7000-series/amd-radeon-rx-7600.html`,
    ],
    referencePriceCents: 169_990,
  },
  {
    slug: "intel-arc-b580-limited-edition",
    category: "GPU",
    brand: "Intel",
    model: "Arc B580 Limited Edition 12GB",
    specs: {
      chipset: "Arc B580",
      memoryGb: 12,
      lengthMm: 272,
      boardPowerW: 190,
      recommendedPsuW: 600, // "Minimum Power Supply Unit"
      powerConnectors: { pcie8Pin: 1, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      "https://www.intel.com/content/www/us/en/products/sku/241598/intel-arc-b580-graphics/specifications.html",
    ],
    referencePriceCents: 189_990,
  },
  {
    slug: "asus-prime-rtx-5060-ti-16g",
    category: "GPU",
    brand: "ASUS",
    model: "Prime GeForce RTX 5060 Ti 16GB",
    specs: {
      chipset: "GeForce RTX 5060 Ti",
      memoryGb: 16,
      lengthMm: 304,
      boardPowerW: 180,
      recommendedPsuW: 550,
      powerConnectors: { pcie8Pin: 1, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/prime/prime-rtx5060ti-16g/techspec/`,
      `${NVIDIA}/rtx-5060-family/`,
    ],
    referencePriceCents: 309_990,
  },
  {
    slug: "asus-prime-rx-9070-o16g",
    category: "GPU",
    brand: "ASUS",
    model: "Prime Radeon RX 9070 OC 16GB",
    specs: {
      chipset: "Radeon RX 9070",
      memoryGb: 16,
      lengthMm: 312,
      boardPowerW: 220,
      recommendedPsuW: 650,
      powerConnectors: { pcie8Pin: 2, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/prime/prime-rx9070-o16g/techspec/`,
      `${AMD}/amd-radeon-rx-9070.html`,
    ],
    referencePriceCents: 459_990,
  },
  {
    slug: "asus-prime-rtx-5070-ti-16g",
    category: "GPU",
    brand: "ASUS",
    model: "Prime GeForce RTX 5070 Ti 16GB",
    specs: {
      chipset: "GeForce RTX 5070 Ti",
      memoryGb: 16,
      lengthMm: 304,
      boardPowerW: 300,
      recommendedPsuW: 750,
      powerConnectors: { pcie8Pin: 0, pcie12v2x6: 1 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/prime/prime-rtx5070ti-16g/techspec/`,
      `${NVIDIA}/rtx-5070-family/`,
    ],
    referencePriceCents: 649_990,
  },
  {
    slug: "asus-tuf-rtx-5090-32g-gaming",
    category: "GPU",
    brand: "ASUS",
    model: "TUF Gaming GeForce RTX 5090 32GB",
    specs: {
      chipset: "GeForce RTX 5090",
      memoryGb: 32,
      lengthMm: 348,
      boardPowerW: 575,
      recommendedPsuW: 1000,
      powerConnectors: { pcie8Pin: 0, pcie12v2x6: 1 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/tuf-gaming/tuf-rtx5090-32g-gaming/techspec/`,
      `${NVIDIA}/rtx-5090/`,
    ],
    referencePriceCents: 1_699_990,
  },
  // Variants the stores sell (checked 2026-10-31): the plain TUF 5080 and
  // Prime 5060 Ti were not on sale, their OC editions were.
  {
    slug: "asus-tuf-rtx-5080-o16g-gaming",
    category: "GPU",
    brand: "ASUS",
    model: "TUF Gaming GeForce RTX 5080 16GB OC",
    specs: {
      chipset: "GeForce RTX 5080",
      memoryGb: 16,
      lengthMm: 348,
      boardPowerW: 360,
      recommendedPsuW: 850,
      powerConnectors: { pcie8Pin: 0, pcie12v2x6: 1 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/tuf-gaming/tuf-rtx5080-o16g-gaming/techspec/`,
      `${NVIDIA}/rtx-5080/`,
    ],
    referencePriceCents: 869_990,
  },
  {
    slug: "asus-prime-rtx-5060-ti-o16g",
    category: "GPU",
    brand: "ASUS",
    model: "Prime GeForce RTX 5060 Ti 16GB OC",
    specs: {
      chipset: "GeForce RTX 5060 Ti",
      memoryGb: 16,
      lengthMm: 304,
      boardPowerW: 180,
      recommendedPsuW: 550,
      powerConnectors: { pcie8Pin: 1, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      `${ASUS_GPU}/prime/prime-rtx5060ti-o16g/techspec/`,
      `${NVIDIA}/rtx-5060-family/`,
    ],
    referencePriceCents: 319_990,
  },
  {
    slug: "asrock-rx-7600-challenger-8g-oc",
    category: "GPU",
    brand: "ASRock",
    model: "Radeon RX 7600 Challenger 8GB OC",
    specs: {
      chipset: "Radeon RX 7600",
      memoryGb: 8,
      lengthMm: 270, // "269.2 x 131.8 x 40.3 mm", rounded up
      boardPowerW: 165,
      recommendedPsuW: 550,
      powerConnectors: { pcie8Pin: 1, pcie12v2x6: 0 },
    },
    specSourceUrls: [
      "https://www.asrock.com/Graphics-Card/AMD/Radeon%20RX%207600%20Challenger%208GB%20OC/index.asp#Specification",
      `${AMD_GPU}/7000-series/amd-radeon-rx-7600.html`,
    ],
    referencePriceCents: 179_990,
  },
];
