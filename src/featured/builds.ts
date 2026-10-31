/**
 * Featured builds for the home page (cards come in Phase 2 stage 5). Only
 * parts that KaBuM! or Terabyte sold themselves when checked (2026-10-31);
 * the test checks that each build raises no compatibility issue at all.
 * `why` is pt-BR, one line per part, for the cards.
 */
export interface FeaturedBuild {
  slug: string;
  /** pt-BR */
  name: string;
  /** pt-BR */
  description: string;
  parts: {
    cpu: string;
    motherboard: string;
    memory: string[];
    gpu: string;
    storage: string[];
    psu: string;
    pcCase: string;
    cooler?: string;
  };
  why: Partial<Record<keyof FeaturedBuild["parts"], string>>;
}

export const featuredBuilds: FeaturedBuild[] = [
  {
    slug: "entrada",
    name: "Entrada",
    description: "Jogos em 1080p gastando pouco, na plataforma AM4.",
    parts: {
      cpu: "amd-ryzen-5-5500",
      motherboard: "asus-prime-b550m-a",
      memory: ["kingston-fury-beast-ddr4-3200-cl16-2x8gb"],
      gpu: "asrock-rx-7600-challenger-8g-oc",
      storage: ["kingston-nv3-1tb"],
      psu: "corsair-cx650",
      pcCase: "fractal-focus-2",
    },
    why: {
      cpu: "6 núcleos baratos com cooler na caixa; dá para trocar por um X3D depois.",
      motherboard:
        "B550 com 2 M.2 e 4 slots de memória, mais folga que uma A520.",
      memory: "16 GB em dual channel, o mínimo para jogar hoje.",
      gpu: "Placa de 1080p com melhor custo entre as vendidas pelas lojas.",
      storage: "NVMe barato com espaço para jogos.",
      psu: "650 W cobre os 550 W recomendados para a placa de vídeo.",
      pcCase: "O gabinete mais barato do catálogo que comporta tudo.",
      cooler: "Sem cooler avulso: o Wraith Stealth da caixa basta para 65 W.",
    },
  },
  {
    slug: "intermediaria",
    name: "Intermediária",
    description: "1440p com folga e caminho de upgrade na plataforma AM5.",
    parts: {
      cpu: "amd-ryzen-5-7600",
      motherboard: "asus-tuf-gaming-b650m-plus-wifi",
      memory: ["kingston-fury-beast-ddr5-6000-cl30-2x16gb"],
      gpu: "asus-prime-rtx-5060-ti-o16g",
      storage: ["wd-blue-sn5000-1tb"],
      psu: "corsair-cx650",
      pcCase: "fractal-pop-air",
      cooler: "deepcool-ak400",
    },
    why: {
      cpu: "Entrada no AM5, com caminho de upgrade até os X3D.",
      motherboard: "B650 com Wi-Fi e suporte a até 256 GB.",
      memory: "DDR5-6000 CL30, a velocidade ideal para Ryzen 7000.",
      gpu: "16 GB de VRAM e boa margem para 1440p.",
      storage: "NVMe PCIe 4.0 de 1 TB.",
      psu: "650 W para os 550 W recomendados, com margem.",
      pcCase: "Cabe placa de vídeo de 405 mm e cooler de 170 mm.",
      cooler: "Opcional: mais silencioso que o cooler da caixa.",
    },
  },
  {
    slug: "alta",
    name: "Alta",
    description: "O melhor do catálogo para jogos em 4K.",
    parts: {
      cpu: "amd-ryzen-7-9800x3d",
      motherboard: "asus-tuf-gaming-x870-plus-wifi",
      memory: ["kingston-fury-beast-ddr5-6000-cl30-2x32gb"],
      gpu: "asus-tuf-rtx-5080-o16g-gaming",
      storage: ["wd-black-sn850x-2tb"],
      psu: "asus-tuf-gaming-850w-gold",
      pcCase: "fractal-meshify-2",
      cooler: "arctic-liquid-freezer-iii-pro-360",
    },
    why: {
      cpu: "O melhor processador para jogos do catálogo.",
      motherboard: "X870 com 4 M.2.",
      memory: "64 GB para jogar e trabalhar.",
      gpu: "Placa de vídeo de topo, 348 mm.",
      storage: "NVMe rápido com 2 TB.",
      psu: "Cumpre os 850 W recomendados e tem o conector 12V-2x6.",
      pcCase: "Comporta placa de vídeo de 470 mm e radiador de 360 mm.",
      cooler: "O 9800X3D vem sem cooler; o radiador cabe na frente ou no topo.",
    },
  },
];
