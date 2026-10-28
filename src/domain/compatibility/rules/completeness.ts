import type { Build } from "@/domain/build/build";
import { CATEGORY_LABELS, type Category } from "@/domain/parts";
import { IssueCode, warning, type Rule } from "../issue";

/**
 * Parts a PC cannot boot without. The GPU is optional (integrated graphics,
 * see noGraphicsOutput) and so is the cooler, since many CPUs ship with one
 * (see noCooler).
 */
export const REQUIRED_CATEGORIES = [
  "CPU",
  "MOTHERBOARD",
  "MEMORY",
  "STORAGE",
  "PSU",
  "CASE",
] as const satisfies readonly Category[];

const isPicked: Record<
  (typeof REQUIRED_CATEGORIES)[number],
  (build: Build) => boolean
> = {
  CPU: (build) => build.cpu !== undefined,
  MOTHERBOARD: (build) => build.motherboard !== undefined,
  MEMORY: (build) => build.memory.length > 0,
  STORAGE: (build) => build.storage.length > 0,
  PSU: (build) => build.psu !== undefined,
  CASE: (build) => build.pcCase !== undefined,
};

const list = new Intl.ListFormat("pt-BR", { type: "conjunction" });

export const requiredPartsPicked: Rule = (build) => {
  const missing = REQUIRED_CATEGORIES.filter(
    (category) => !isPicked[category](build),
  );
  if (missing.length === 0) return [];
  return [
    warning(
      IssueCode.MissingRequiredParts,
      missing,
      `Ainda falta escolher: ${list.format(missing.map((category) => CATEGORY_LABELS[category]))}.`,
    ),
  ];
};

export const noGraphicsOutput: Rule = ({ cpu, gpu }) => {
  if (!cpu || gpu || cpu.specs.integratedGraphics) return [];
  return [
    warning(
      IssueCode.NoGraphicsOutput,
      ["CPU", "GPU"],
      `O ${cpu.model} não tem vídeo integrado. Sem placa de vídeo, o PC não terá saída de imagem.`,
    ),
  ];
};

export const noCooler: Rule = ({ cpu, cooler }) => {
  if (!cpu || cooler || cpu.specs.includesCooler) return [];
  return [
    warning(
      IssueCode.NoCooler,
      ["CPU", "COOLER"],
      `O ${cpu.model} não vem com cooler na caixa. Escolha um cooler para o processador.`,
    ),
  ];
};
