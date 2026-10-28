import type { SeedPart } from "../types";

// Noctua pages list sockets and height with fan(s) but no TDP rating, so
// tdpRatingW is left out. DeepCool states "up to 220W". Arctic pages list
// sockets under "Compatibility"; the radiator size is in the model name.
// Only sockets this project models (AM4, AM5, LGA1700, LGA1851) are kept.

const NOCTUA = "https://noctua.at/en";
const ARCTIC = "https://www.arctic.de/en";

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
      "https://www.deepcool.com/products/Cooling/cpuaircoolers/AK400-Performance-CPU-Cooler-1851-1700-AM5/2024/15222.shtml",
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
];
