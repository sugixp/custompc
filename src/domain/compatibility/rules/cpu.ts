import { error, IssueCode, warning, type Rule } from "../issue";

export const cpuSocketMatchesMotherboard: Rule = ({ cpu, motherboard }) => {
  if (!cpu || !motherboard) return [];
  if (cpu.specs.socket === motherboard.specs.socket) return [];
  return [
    error(
      IssueCode.CpuSocketMismatch,
      ["CPU", "MOTHERBOARD"],
      `O processador usa o soquete ${cpu.specs.socket}, mas a placa-mãe é ${motherboard.specs.socket}.`,
    ),
  ];
};

/**
 * Only runs when the sockets match: a socket mismatch is already an error, and
 * a missing support entry would just repeat it.
 */
export const cpuInMotherboardSupportList: Rule = ({ cpu, motherboard }) => {
  if (!cpu || !motherboard) return [];
  if (cpu.specs.socket !== motherboard.specs.socket) return [];

  const entry = motherboard.specs.supportedCpus.find(
    (supported) => supported.cpuSlug === cpu.slug,
  );
  if (!entry) {
    return [
      warning(
        IssueCode.CpuNotInSupportList,
        ["CPU", "MOTHERBOARD"],
        `O ${cpu.model} não aparece na lista de processadores suportados da placa-mãe. Confira no site do fabricante antes de comprar.`,
      ),
    ];
  }
  if (entry.requiresBiosUpdate) {
    return [
      warning(
        IssueCode.CpuRequiresBiosUpdate,
        ["CPU", "MOTHERBOARD"],
        `A placa-mãe suporta o ${cpu.model}, mas pode precisar de atualização de BIOS. Confirme a versão com a loja ou veja se a placa atualiza sem processador.`,
      ),
    ];
  }
  return [];
};
