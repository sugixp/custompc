import type { IssueCode } from "@/domain/compatibility";

/**
 * Builds made of seed parts, each meant to show one compatibility rule on
 * real hardware. The seed test checks that every scenario raises exactly the
 * issues listed, so the claims below stay true as the data changes.
 */
export interface DemoScenario {
  name: string;
  /** pt-BR, shown in the UI as an example build. */
  description: string;
  parts: {
    cpu?: string;
    motherboard?: string;
    memory?: string[];
    gpu?: string;
    storage?: string[];
    psu?: string;
    pcCase?: string;
    cooler?: string;
  };
  expected: IssueCode[];
}

/** A compatible AM5 build that the scenarios below vary one part at a time. */
const am5 = {
  cpu: "amd-ryzen-5-7600",
  motherboard: "asus-tuf-gaming-b650m-plus-wifi",
  memory: ["kingston-fury-beast-ddr5-6000-cl30-2x16gb"],
  gpu: "asus-prime-rtx-5070-12g",
  storage: ["kingston-nv3-1tb"],
  psu: "asus-tuf-gaming-750w-gold",
  pcCase: "fractal-meshify-2-compact",
  cooler: "deepcool-ak400",
};

export const scenarios: DemoScenario[] = [
  {
    name: "compatible-am5",
    description: "Build AM5 equilibrada, sem problemas de compatibilidade.",
    parts: am5,
    expected: [],
  },
  {
    name: "compatible-itx",
    description:
      "Build compacta Mini-ITX com fonte SFX-L e cooler low profile.",
    parts: {
      ...am5,
      motherboard: "asus-rog-strix-b650e-i-gaming-wifi",
      psu: "asus-rog-loki-sfx-l-850w-platinum",
      pcCase: "fractal-terra",
      cooler: "noctua-nh-l9a-am5",
    },
    expected: [],
  },
  {
    name: "am5-cpu-on-am4-board",
    description: "Processador AM5 numa placa-mãe AM4.",
    parts: {
      ...am5,
      motherboard: "asus-prime-b550m-a",
      memory: ["kingston-fury-beast-ddr4-3200-cl16-2x16gb"],
    },
    expected: ["CPU_SOCKET_MISMATCH"],
  },
  {
    name: "ddr4-on-ddr5-board",
    description: "Memória DDR4 numa placa-mãe DDR5.",
    parts: { ...am5, memory: ["kingston-fury-beast-ddr4-3200-cl16-2x16gb"] },
    expected: ["MEMORY_TYPE_MISMATCH"],
  },
  {
    name: "ddr5-on-d4-board",
    description:
      "Memória DDR5 na versão D4 (DDR4) de uma placa B760 que também sai em DDR5.",
    parts: {
      ...am5,
      cpu: "intel-core-i5-14400f",
      motherboard: "asus-tuf-gaming-b760m-plus-wifi-d4",
    },
    expected: ["MEMORY_TYPE_MISMATCH"],
  },
  {
    name: "four-modules-on-itx",
    description: "Kit de 4 módulos numa placa Mini-ITX com 2 slots.",
    parts: {
      ...am5,
      motherboard: "asus-rog-strix-b650e-i-gaming-wifi",
      memory: ["kingston-fury-beast-ddr5-5200-cl40-4x16gb"],
    },
    expected: ["MEMORY_SLOTS_EXCEEDED"],
  },
  {
    name: "atx-board-in-matx-case",
    description:
      "Placa-mãe ATX num gabinete que só aceita Micro-ATX e Mini-ITX.",
    parts: {
      ...am5,
      motherboard: "asus-tuf-gaming-x870-plus-wifi",
      pcCase: "fractal-pop-mini-air",
    },
    expected: ["MOTHERBOARD_FORM_FACTOR_UNSUPPORTED"],
  },
  {
    name: "long-gpu-in-compact-case",
    description: "Placa de vídeo de 348 mm num gabinete que comporta 341 mm.",
    parts: {
      ...am5,
      gpu: "asus-tuf-rtx-5080-16g-gaming",
      psu: "asus-rog-strix-1000w-gold-aura",
    },
    expected: ["GPU_TOO_LONG"],
  },
  {
    name: "atx-psu-in-sfx-case",
    description: "Fonte ATX num gabinete que só aceita SFX/SFX-L.",
    parts: {
      ...am5,
      motherboard: "asus-rog-strix-b650e-i-gaming-wifi",
      pcCase: "fractal-terra",
      cooler: "noctua-nh-l9a-am5",
    },
    expected: ["PSU_FORM_FACTOR_UNSUPPORTED"],
  },
  {
    name: "tall-cooler",
    description: "Cooler de 168 mm num gabinete que comporta 145 mm.",
    parts: { ...am5, pcCase: "fractal-north", cooler: "noctua-nh-d15-g2" },
    expected: ["COOLER_TOO_TALL"],
  },
  {
    name: "radiator-too-big",
    description: "Water cooler de 360 mm num gabinete que aceita até 240 mm.",
    parts: {
      ...am5,
      pcCase: "fractal-pop-mini-air",
      cooler: "arctic-liquid-freezer-iii-360",
    },
    expected: ["RADIATOR_UNSUPPORTED"],
  },
  {
    name: "am5-only-cooler-on-intel",
    description: "Cooler exclusivo para AM5 num processador Intel LGA1700.",
    parts: {
      ...am5,
      cpu: "intel-core-i7-14700",
      motherboard: "asus-prime-b760m-a-wifi",
      cooler: "noctua-nh-l9a-am5",
    },
    expected: ["COOLER_SOCKET_UNSUPPORTED"],
  },
  {
    name: "too-many-sata-drives",
    description: "Três discos SATA numa placa-mãe com 2 portas SATA.",
    parts: {
      ...am5,
      motherboard: "asus-tuf-gaming-x870-plus-wifi",
      storage: [
        "kingston-a400-480gb",
        "wd-blue-2tb-wd20ezbx",
        "wd-blue-2tb-wd20ezbx",
      ],
    },
    expected: ["SATA_PORTS_EXCEEDED"],
  },
  {
    name: "psu-below-gpu-recommendation",
    description: "RTX 5080 com fonte de 750 W; o fabricante recomenda 850 W.",
    parts: {
      ...am5,
      gpu: "asus-tuf-rtx-5080-16g-gaming",
      pcCase: "fractal-pop-air",
    },
    expected: ["PSU_LOW_HEADROOM"],
  },
  {
    name: "psu-without-gpu-connectors",
    description: "RX 9070 XT exige 3 conectores de 8 pinos; a fonte tem 2.",
    parts: {
      ...am5,
      gpu: "asus-prime-rx-9070-xt-o16g",
      psu: "asus-prime-750w-gold",
    },
    expected: ["GPU_POWER_CONNECTORS_MISSING"],
  },
  {
    name: "no-boxed-cooler",
    description: "Processador vendido sem cooler e nenhum cooler escolhido.",
    parts: { ...am5, cpu: "amd-ryzen-7-7800x3d", cooler: undefined },
    expected: ["NO_COOLER"],
  },
  {
    name: "no-graphics-output",
    description: "Processador sem vídeo integrado e nenhuma placa de vídeo.",
    parts: {
      ...am5,
      cpu: "intel-core-i5-14400f",
      motherboard: "asus-prime-b760m-a-wifi",
      gpu: undefined,
    },
    expected: ["NO_GRAPHICS_OUTPUT"],
  },
];
