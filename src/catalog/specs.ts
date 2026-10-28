import {
  memoryKitCapacityGb,
  type Part,
  type PcieConnectors,
} from "@/domain/parts";
import {
  formatCapacity,
  formatGhz,
  formatList,
  formatMm,
  formatNumber,
  formatWatts,
  formatYesNo,
} from "./format";

export interface SpecRow {
  label: string;
  value: string;
}

/** Shown when a manufacturer page does not state a value. */
export const NOT_STATED = "Não informado";

const STORAGE_FORM_FACTOR_LABELS = {
  "M.2": "M.2",
  "2.5in": '2,5"',
  "3.5in": '3,5"',
};
const MODULARITY_LABELS = { full: "Total", semi: "Semi", none: "Não" };

function formatConnectors({ pcie8Pin, pcie12v2x6 }: PcieConnectors): string {
  const parts = [
    pcie12v2x6 > 0 ? `${pcie12v2x6}× 12V-2x6` : undefined,
    pcie8Pin > 0 ? `${pcie8Pin}× PCIe 8 pinos` : undefined,
  ].filter((part): part is string => part !== undefined);
  return parts.length > 0 ? parts.join(" + ") : "Nenhum";
}

/** The full spec sheet of a part, in display order. */
export function specRows(part: Part): SpecRow[] {
  switch (part.category) {
    case "CPU": {
      const s = part.specs;
      return [
        { label: "Soquete", value: s.socket },
        { label: "Núcleos / threads", value: `${s.cores} / ${s.threads}` },
        { label: "Clock base", value: formatGhz(s.baseClockMhz) },
        { label: "Clock boost", value: formatGhz(s.boostClockMhz) },
        { label: "TDP", value: formatWatts(s.tdpW) },
        {
          label: "Potência máxima (PL2/PPT)",
          value: s.maxPowerW ? formatWatts(s.maxPowerW) : NOT_STATED,
        },
        { label: "Vídeo integrado", value: formatYesNo(s.integratedGraphics) },
        { label: "Cooler na caixa", value: formatYesNo(s.includesCooler) },
        { label: "Memória", value: s.memoryTypes.join(" / ") },
      ];
    }
    case "MOTHERBOARD": {
      const s = part.specs;
      return [
        { label: "Soquete", value: s.socket },
        { label: "Chipset", value: s.chipset },
        { label: "Formato", value: s.formFactor },
        { label: "Tipo de memória", value: s.memoryType },
        { label: "Slots de memória", value: String(s.memorySlots) },
        { label: "Memória máxima", value: formatCapacity(s.maxMemoryGb) },
        { label: "Slots M.2", value: String(s.m2Slots) },
        { label: "Portas SATA", value: String(s.sataPorts) },
        {
          label: "Lista de CPUs suportadas",
          value: s.supportedCpus
            ? `${s.supportedCpus.length} processadores`
            : "Não verificada",
        },
      ];
    }
    case "MEMORY": {
      const s = part.specs;
      return [
        { label: "Tipo", value: s.type },
        {
          label: "Kit",
          value: `${s.moduleCount} × ${formatCapacity(s.moduleCapacityGb)}`,
        },
        {
          label: "Capacidade total",
          value: formatCapacity(memoryKitCapacityGb(part)),
        },
        { label: "Velocidade", value: `${formatNumber(s.speedMts)} MT/s` },
        { label: "Latência", value: `CL${s.casLatency}` },
      ];
    }
    case "GPU": {
      const s = part.specs;
      return [
        { label: "Chip", value: s.chipset },
        { label: "Memória", value: formatCapacity(s.memoryGb) },
        { label: "Comprimento", value: formatMm(s.lengthMm) },
        { label: "Consumo (referência)", value: formatWatts(s.boardPowerW) },
        { label: "Fonte recomendada", value: formatWatts(s.recommendedPsuW) },
        {
          label: "Conectores de energia",
          value: formatConnectors(s.powerConnectors),
        },
      ];
    }
    case "STORAGE": {
      const s = part.specs;
      return [
        { label: "Tipo", value: s.kind },
        { label: "Interface", value: s.interface },
        { label: "Formato", value: STORAGE_FORM_FACTOR_LABELS[s.formFactor] },
        { label: "Capacidade", value: formatCapacity(s.capacityGb) },
      ];
    }
    case "PSU": {
      const s = part.specs;
      return [
        { label: "Potência", value: formatWatts(s.wattageW) },
        { label: "Formato", value: s.formFactor },
        { label: "Certificação", value: s.efficiency },
        {
          label: "Modular",
          value: s.modularity ? MODULARITY_LABELS[s.modularity] : NOT_STATED,
        },
        { label: "Conectores PCIe", value: formatConnectors(s.connectors) },
      ];
    }
    case "CASE": {
      const s = part.specs;
      return [
        { label: "Placas-mãe", value: formatList(s.supportedMotherboards) },
        { label: "Fontes", value: formatList(s.supportedPsuFormFactors) },
        { label: "Placa de vídeo até", value: formatMm(s.maxGpuLengthMm) },
        { label: "Cooler até", value: formatMm(s.maxCoolerHeightMm) },
        {
          label: "Radiadores",
          value:
            s.supportedRadiatorsMm.length > 0
              ? `${s.supportedRadiatorsMm.join(", ")} mm`
              : "Nenhum",
        },
      ];
    }
    case "COOLER": {
      const s = part.specs;
      return [
        {
          label: "Tipo",
          value: s.type === "air" ? "Ar" : "Water cooler (AIO)",
        },
        s.type === "air"
          ? { label: "Altura", value: formatMm(s.heightMm) }
          : { label: "Radiador", value: formatMm(s.radiatorSizeMm) },
        { label: "Soquetes", value: s.supportedSockets.join(", ") },
        {
          label: "TDP suportado",
          value: s.tdpRatingW ? formatWatts(s.tdpRatingW) : NOT_STATED,
        },
      ];
    }
  }
}

/** Three short facts for a part card. */
export function keySpecs(part: Part): string[] {
  switch (part.category) {
    case "CPU": {
      const s = part.specs;
      return [
        s.socket,
        `${s.cores}C/${s.threads}T`,
        formatGhz(s.boostClockMhz),
      ];
    }
    case "MOTHERBOARD": {
      const s = part.specs;
      return [s.socket, s.formFactor, s.memoryType];
    }
    case "MEMORY": {
      const s = part.specs;
      return [
        s.type,
        formatCapacity(memoryKitCapacityGb(part)),
        `${s.speedMts} MT/s`,
      ];
    }
    case "GPU": {
      const s = part.specs;
      return [
        formatCapacity(s.memoryGb),
        formatMm(s.lengthMm),
        formatWatts(s.boardPowerW),
      ];
    }
    case "STORAGE": {
      const s = part.specs;
      return [s.kind, s.interface, formatCapacity(s.capacityGb)];
    }
    case "PSU": {
      const s = part.specs;
      return [
        formatWatts(s.wattageW),
        s.formFactor,
        s.efficiency.replace("80 Plus ", ""),
      ];
    }
    case "CASE": {
      const s = part.specs;
      return [
        s.supportedMotherboards[0] ?? "",
        `GPU ${formatMm(s.maxGpuLengthMm)}`,
        `Cooler ${formatMm(s.maxCoolerHeightMm)}`,
      ];
    }
    case "COOLER": {
      const s = part.specs;
      return s.type === "air"
        ? ["Ar", formatMm(s.heightMm), s.supportedSockets.join("/")]
        : [
            "Water cooler",
            `${s.radiatorSizeMm} mm`,
            s.supportedSockets.join("/"),
          ];
    }
  }
}
