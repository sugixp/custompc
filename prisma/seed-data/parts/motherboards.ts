import type { SeedPart } from "../types";

// ASUS tech spec pages. CPU support lists load dynamically on ASUS's site and
// were not verified, so supportedCpus is left out (the support-list rule then
// stays silent). Memory slots and max capacity come from the "x DIMM, Max."
// line; M.2 and SATA from "Total supports ...".

const ASUS_MB = "https://www.asus.com/motherboards-components/motherboards";

export const motherboards: SeedPart[] = [
  {
    slug: "asus-tuf-gaming-b650m-plus-wifi",
    category: "MOTHERBOARD",
    brand: "ASUS",
    model: "TUF GAMING B650M-PLUS WIFI",
    specs: {
      socket: "AM5",
      chipset: "B650",
      formFactor: "Micro-ATX",
      memoryType: "DDR5",
      memorySlots: 4,
      maxMemoryGb: 256,
      m2Slots: 2,
      sataPorts: 4,
    },
    specSourceUrls: [
      `${ASUS_MB}/tuf-gaming/tuf-gaming-b650m-plus-wifi/techspec/`,
    ],
    referencePriceCents: 139_990,
  },
  {
    slug: "asus-tuf-gaming-x870-plus-wifi",
    category: "MOTHERBOARD",
    brand: "ASUS",
    model: "TUF GAMING X870-PLUS WIFI",
    specs: {
      socket: "AM5",
      chipset: "X870",
      formFactor: "ATX",
      memoryType: "DDR5",
      memorySlots: 4,
      maxMemoryGb: 256,
      m2Slots: 4,
      sataPorts: 2,
    },
    specSourceUrls: [
      `${ASUS_MB}/tuf-gaming/tuf-gaming-x870-plus-wifi/techspec/`,
    ],
    referencePriceCents: 209_990,
  },
  {
    slug: "asus-rog-strix-b650e-i-gaming-wifi",
    category: "MOTHERBOARD",
    brand: "ASUS",
    model: "ROG STRIX B650E-I GAMING WIFI",
    specs: {
      socket: "AM5",
      chipset: "B650", // as listed under "Chipset" on the spec page
      formFactor: "Mini-ITX",
      memoryType: "DDR5",
      memorySlots: 2,
      maxMemoryGb: 96,
      m2Slots: 2,
      sataPorts: 2,
    },
    specSourceUrls: [
      "https://rog.asus.com/motherboards/rog-strix/rog-strix-b650e-i-gaming-wifi-model/spec/",
    ],
    referencePriceCents: 219_990,
  },
  {
    slug: "asus-prime-b550m-a",
    category: "MOTHERBOARD",
    brand: "ASUS",
    model: "PRIME B550M-A",
    specs: {
      socket: "AM4",
      chipset: "B550",
      formFactor: "Micro-ATX",
      memoryType: "DDR4",
      memorySlots: 4,
      maxMemoryGb: 128,
      m2Slots: 2,
      sataPorts: 4,
    },
    specSourceUrls: [`${ASUS_MB}/prime/prime-b550m-a/techspec/`],
    referencePriceCents: 69_990,
  },
  {
    slug: "asus-prime-b760m-a-d4",
    category: "MOTHERBOARD",
    brand: "ASUS",
    model: "PRIME B760M-A D4",
    specs: {
      socket: "LGA1700",
      chipset: "B760",
      formFactor: "Micro-ATX",
      memoryType: "DDR4",
      memorySlots: 4,
      maxMemoryGb: 128,
      m2Slots: 2,
      sataPorts: 4,
    },
    specSourceUrls: [`${ASUS_MB}/prime/prime-b760m-a-d4/techspec/`],
    referencePriceCents: 79_990,
  },
  {
    slug: "asus-prime-b760m-a-wifi",
    category: "MOTHERBOARD",
    brand: "ASUS",
    model: "PRIME B760M-A WIFI",
    specs: {
      socket: "LGA1700",
      chipset: "B760",
      formFactor: "Micro-ATX",
      memoryType: "DDR5",
      memorySlots: 4,
      maxMemoryGb: 192,
      m2Slots: 2,
      sataPorts: 4,
    },
    specSourceUrls: [`${ASUS_MB}/prime/prime-b760m-a-wifi/techspec/`],
    referencePriceCents: 99_990,
  },
];
