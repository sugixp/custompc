import type { Category } from "@/domain/parts";
import {
  estimatePower,
  PSU_HEADROOM_FACTOR,
  recommendPsu,
} from "@/domain/power/estimate";
import { error, IssueCode, warning, type Rule } from "../issue";

/**
 * Needs the PSU and the CPU. The GPU is optional, since a build without one
 * is valid with integrated graphics.
 */
export const psuCoversPower: Rule = (build) => {
  const { psu, cpu, gpu } = build;
  if (!psu || !cpu) return [];

  const categories: Category[] = gpu ? ["PSU", "CPU", "GPU"] : ["PSU", "CPU"];
  const estimate = estimatePower(build);
  const psuW = psu.specs.wattageW;

  if (psuW < estimate.totalW) {
    return [
      error(
        IssueCode.PsuInsufficient,
        categories,
        `A fonte de ${psuW} W não cobre o consumo estimado de ${estimate.totalW} W.`,
      ),
    ];
  }

  const recommendation = recommendPsu(build, estimate);
  if (psuW >= recommendation.wattageW) return [];
  const reason =
    recommendation.basis === "gpu-vendor"
      ? "a recomendação do fabricante da placa de vídeo"
      : `o consumo estimado de ${estimate.totalW} W com ${Math.round((PSU_HEADROOM_FACTOR - 1) * 100)}% de margem`;
  return [
    warning(
      IssueCode.PsuLowHeadroom,
      categories,
      `A fonte de ${psuW} W tem pouca folga. Recomendamos pelo menos ${recommendation.wattageW} W, segundo ${reason}.`,
    ),
  ];
};

/**
 * A warning, not an error: adapters exist (e.g. 2x 8-pin to 12V-2x6), though
 * a PSU with native connectors is the safer choice.
 */
export const psuHasGpuConnectors: Rule = ({ psu, gpu }) => {
  if (!psu || !gpu) return [];
  const needed = gpu.specs.powerConnectors;
  const offered = psu.specs.connectors;

  const missing: string[] = [];
  if (offered.pcie12v2x6 < needed.pcie12v2x6) {
    missing.push(
      `${needed.pcie12v2x6}x 12V-2x6/12VHPWR (a fonte tem ${offered.pcie12v2x6})`,
    );
  }
  if (offered.pcie8Pin < needed.pcie8Pin) {
    missing.push(
      `${needed.pcie8Pin}x PCIe 8 pinos (a fonte tem ${offered.pcie8Pin})`,
    );
  }
  if (missing.length === 0) return [];
  return [
    warning(
      IssueCode.GpuPowerConnectorsMissing,
      ["GPU", "PSU"],
      `A placa de vídeo precisa de ${missing.join(" e ")}. Prefira uma fonte com os conectores nativos em vez de adaptadores.`,
    ),
  ];
};
