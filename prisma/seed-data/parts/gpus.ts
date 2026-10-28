import type { SeedPart } from "../types";

// Length, recommended PSU and power connectors come from each ASUS card's tech
// spec page; a "16-pin" connector is 12V-2x6/12VHPWR. ASUS does not list
// board power, so boardPowerW is the chip vendor's reference figure (NVIDIA
// "Total Graphics Power", AMD "Typical Board Power"); factory-overclocked
// cards may draw somewhat more.

const ASUS_GPU = "https://www.asus.com/motherboards-components/graphics-cards";
const NVIDIA = "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series";
const AMD =
  "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series";

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
];
