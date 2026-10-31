import type { SeedPart } from "../types";

// Noctua pages list sockets and height with fan(s) but no TDP rating, so
// tdpRatingW is left out. DeepCool states the heat dissipation ("up to 220W")
// and height (the H of "Product Dimensions"). Arctic pages list sockets under
// "Compatibility" and give no TDP rating; the radiator size is in the model
// name, and the Freezer 36 height is the H of its dimensions.
// Only sockets this project models (AM4, AM5, LGA1700, LGA1851) are kept.

const NOCTUA = "https://noctua.at/en";
const ARCTIC = "https://www.arctic.de/en";
const DEEPCOOL = "https://www.deepcool.com/products/Cooling/cpuaircoolers";

export const coolers: SeedPart[] = [
  {
    slug: "deepcool-ak400",
    category: "COOLER",
    brand: "DeepCool",
    model: "AK400",
    specs: {
      type: "air",
      heightMm: 155,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
      tdpRatingW: 220,
    },
    specSourceUrls: [
      `${DEEPCOOL}/AK400-Performance-CPU-Cooler-1851-1700-AM5/2024/15222.shtml`,
    ],
    referencePriceCents: 22_990,
  },
  {
    slug: "noctua-nh-u12s-redux",
    category: "COOLER",
    brand: "Noctua",
    model: "NH-U12S redux",
    specs: {
      type: "air",
      heightMm: 158,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    },
    specSourceUrls: [`${NOCTUA}/nh-u12s-redux/specification`],
    referencePriceCents: 44_990,
  },
  {
    slug: "noctua-nh-d15-g2",
    category: "COOLER",
    brand: "Noctua",
    model: "NH-D15 G2",
    specs: {
      type: "air",
      heightMm: 168,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    },
    specSourceUrls: [`${NOCTUA}/nh-d15-g2/specification`],
    referencePriceCents: 99_990,
  },
  {
    slug: "noctua-nh-l9a-am5",
    category: "COOLER",
    brand: "Noctua",
    model: "NH-L9a-AM5",
    specs: {
      type: "air",
      heightMm: 37,
      supportedSockets: ["AM5"],
    },
    specSourceUrls: [`${NOCTUA}/nh-l9a-am5/specification`],
    referencePriceCents: 34_990,
  },
  {
    slug: "arctic-liquid-freezer-iii-240",
    category: "COOLER",
    brand: "Arctic",
    model: "Liquid Freezer III 240",
    specs: {
      type: "aio",
      radiatorSizeMm: 240,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    },
    specSourceUrls: [`${ARCTIC}/Liquid-Freezer-III-240/ACFRE00134A`],
    referencePriceCents: 54_990,
  },
  {
    slug: "arctic-liquid-freezer-iii-360",
    category: "COOLER",
    brand: "Arctic",
    model: "Liquid Freezer III 360",
    specs: {
      type: "aio",
      radiatorSizeMm: 360,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    },
    specSourceUrls: [`${ARCTIC}/Liquid-Freezer-III-360/ACFRE00136A`],
    referencePriceCents: 69_990,
  },
  {
    slug: "deepcool-ag400",
    category: "COOLER",
    brand: "DeepCool",
    model: "AG400",
    specs: {
      type: "air",
      heightMm: 150,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
      tdpRatingW: 220,
    },
    specSourceUrls: [
      `${DEEPCOOL}/AG400-ARGB-120mm-CPU-Cooler-1851-1700-AM5/2022/16084.shtml`,
    ],
    referencePriceCents: 19_990,
  },
  {
    slug: "deepcool-ak500",
    category: "COOLER",
    brand: "DeepCool",
    model: "AK500",
    specs: {
      type: "air",
      heightMm: 158,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
      tdpRatingW: 240,
    },
    specSourceUrls: [
      `${DEEPCOOL}/AK500-High-Performance-CPU-Cooler-1851-1700-AM5/2022/16040.shtml`,
    ],
    referencePriceCents: 32_990,
  },
  {
    slug: "deepcool-ak620",
    category: "COOLER",
    brand: "DeepCool",
    model: "AK620",
    specs: {
      type: "air",
      heightMm: 160,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
      tdpRatingW: 260,
    },
    specSourceUrls: [
      `${DEEPCOOL}/AK620-High-Performance-CPU-Cooler-1851-1700-AM5/2024/13067.shtml`,
    ],
    referencePriceCents: 39_990,
  },
  {
    slug: "arctic-freezer-36",
    category: "COOLER",
    brand: "Arctic",
    model: "Freezer 36",
    specs: {
      type: "air",
      heightMm: 159,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    },
    specSourceUrls: [`${ARCTIC}/Freezer-36/ACFRE00121A`],
    referencePriceCents: 17_990,
  },
  {
    slug: "noctua-nh-u9s",
    category: "COOLER",
    brand: "Noctua",
    model: "NH-U9S",
    specs: {
      type: "air",
      heightMm: 125,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    },
    specSourceUrls: [`${NOCTUA}/nh-u9s/specification`],
    referencePriceCents: 54_990,
  },
  {
    slug: "noctua-nh-l12s",
    category: "COOLER",
    brand: "Noctua",
    model: "NH-L12S",
    specs: {
      type: "air",
      heightMm: 86,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    },
    specSourceUrls: [`${NOCTUA}/nh-l12s/specification`],
    referencePriceCents: 49_990,
  },
  {
    slug: "noctua-nh-u12a",
    category: "COOLER",
    brand: "Noctua",
    model: "NH-U12A",
    specs: {
      type: "air",
      heightMm: 158,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    },
    specSourceUrls: [`${NOCTUA}/nh-u12a/specification`],
    referencePriceCents: 84_990,
  },
  {
    slug: "arctic-liquid-freezer-iii-280",
    category: "COOLER",
    brand: "Arctic",
    model: "Liquid Freezer III 280",
    specs: {
      type: "aio",
      radiatorSizeMm: 280,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    },
    specSourceUrls: [`${ARCTIC}/Liquid-Freezer-III-280/ACFRE00135A`],
    referencePriceCents: 64_990,
  },
  {
    slug: "arctic-liquid-freezer-iii-420",
    category: "COOLER",
    brand: "Arctic",
    model: "Liquid Freezer III 420",
    specs: {
      type: "aio",
      radiatorSizeMm: 420,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    },
    specSourceUrls: [`${ARCTIC}/Liquid-Freezer-III-420/ACFRE00137A`],
    referencePriceCents: 84_990,
  },
  {
    slug: "arctic-liquid-freezer-iii-pro-360",
    category: "COOLER",
    brand: "Arctic",
    model: "Liquid Freezer III Pro 360",
    specs: {
      type: "aio",
      radiatorSizeMm: 360,
      supportedSockets: ["AM4", "AM5", "LGA1700", "LGA1851"],
    },
    specSourceUrls: [`${ARCTIC}/Liquid-Freezer-III-Pro-360/ACFRE00180A`],
    referencePriceCents: 74_990,
  },
];
