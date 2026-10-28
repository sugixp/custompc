import { error, IssueCode, type Rule } from "../issue";

export const caseFitsMotherboard: Rule = ({ motherboard, pcCase }) => {
  if (!motherboard || !pcCase) return [];
  if (
    pcCase.specs.supportedMotherboards.includes(motherboard.specs.formFactor)
  ) {
    return [];
  }
  return [
    error(
      IssueCode.MotherboardFormFactorUnsupported,
      ["MOTHERBOARD", "CASE"],
      `A placa-mãe é ${motherboard.specs.formFactor}, mas o gabinete aceita ${pcCase.specs.supportedMotherboards.join(", ")}.`,
    ),
  ];
};

export const caseFitsPsu: Rule = ({ psu, pcCase }) => {
  if (!psu || !pcCase) return [];
  if (pcCase.specs.supportedPsuFormFactors.includes(psu.specs.formFactor)) {
    return [];
  }
  return [
    error(
      IssueCode.PsuFormFactorUnsupported,
      ["PSU", "CASE"],
      `A fonte é ${psu.specs.formFactor}, mas o gabinete aceita fontes ${pcCase.specs.supportedPsuFormFactors.join(", ")}.`,
    ),
  ];
};

export const caseFitsGpu: Rule = ({ gpu, pcCase }) => {
  if (!gpu || !pcCase) return [];
  if (gpu.specs.lengthMm <= pcCase.specs.maxGpuLengthMm) return [];
  return [
    error(
      IssueCode.GpuTooLong,
      ["GPU", "CASE"],
      `A placa de vídeo tem ${gpu.specs.lengthMm} mm, mas o gabinete comporta até ${pcCase.specs.maxGpuLengthMm} mm.`,
    ),
  ];
};

/** Height only limits air coolers; AIOs are checked by radiator size. */
export const caseFitsAirCooler: Rule = ({ cooler, pcCase }) => {
  if (cooler?.specs.type !== "air" || !pcCase) return [];
  if (cooler.specs.heightMm <= pcCase.specs.maxCoolerHeightMm) return [];
  return [
    error(
      IssueCode.CoolerTooTall,
      ["COOLER", "CASE"],
      `O cooler tem ${cooler.specs.heightMm} mm de altura, mas o gabinete comporta até ${pcCase.specs.maxCoolerHeightMm} mm.`,
    ),
  ];
};

export const caseFitsRadiator: Rule = ({ cooler, pcCase }) => {
  if (cooler?.specs.type !== "aio" || !pcCase) return [];
  const { radiatorSizeMm } = cooler.specs;
  if (pcCase.specs.supportedRadiatorsMm.includes(radiatorSizeMm)) return [];
  const supported = pcCase.specs.supportedRadiatorsMm;
  return [
    error(
      IssueCode.RadiatorUnsupported,
      ["COOLER", "CASE"],
      supported.length === 0
        ? `O gabinete não tem suporte a radiador, e o water cooler usa um de ${radiatorSizeMm} mm.`
        : `O radiador do water cooler tem ${radiatorSizeMm} mm, mas o gabinete aceita ${supported.map((size) => `${size} mm`).join(", ")}.`,
    ),
  ];
};
