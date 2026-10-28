import type { Category } from "@/domain/parts";
import { error, IssueCode, warning, type Rule } from "../issue";

/** Uses the CPU's socket, or the motherboard's while no CPU is picked. */
export const coolerSupportsSocket: Rule = ({ cooler, cpu, motherboard }) => {
  const socket = cpu?.specs.socket ?? motherboard?.specs.socket;
  if (!cooler || !socket) return [];
  if (cooler.specs.supportedSockets.includes(socket)) return [];
  const other: Category = cpu ? "CPU" : "MOTHERBOARD";
  return [
    error(
      IssueCode.CoolerSocketUnsupported,
      ["COOLER", other],
      `O cooler não tem suporte ao soquete ${socket}. Soquetes suportados: ${cooler.specs.supportedSockets.join(", ")}.`,
    ),
  ];
};

/**
 * Compares the cooler rating with the CPU's TDP, not its short-term peak.
 * A warning, because vendors rate coolers inconsistently.
 */
export const coolerHandlesCpuHeat: Rule = ({ cooler, cpu }) => {
  const ratingW = cooler?.specs.tdpRatingW;
  if (!cooler || !cpu || ratingW === undefined) return [];
  if (ratingW >= cpu.specs.tdpW) return [];
  return [
    warning(
      IssueCode.CoolerUnderrated,
      ["COOLER", "CPU"],
      `O cooler é indicado para até ${ratingW} W, abaixo do TDP de ${cpu.specs.tdpW} W do processador. Ele pode esquentar e perder desempenho.`,
    ),
  ];
};
