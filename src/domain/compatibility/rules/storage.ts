import { error, IssueCode, type Rule } from "../issue";

// Shared lanes (an M.2 slot disabling SATA ports) are not modelled yet.

export const storageFitsM2Slots: Rule = ({ storage, motherboard }) => {
  if (!motherboard) return [];
  const m2Drives = storage.filter(
    (drive) => drive.specs.formFactor === "M.2",
  ).length;
  if (m2Drives <= motherboard.specs.m2Slots) return [];
  return [
    error(
      IssueCode.M2SlotsExceeded,
      ["STORAGE", "MOTHERBOARD"],
      `Foram escolhidos ${m2Drives} SSDs M.2, mas a placa-mãe tem ${motherboard.specs.m2Slots} slots M.2.`,
    ),
  ];
};

export const storageFitsSataPorts: Rule = ({ storage, motherboard }) => {
  if (!motherboard) return [];
  const sataDrives = storage.filter(
    (drive) => drive.specs.formFactor !== "M.2",
  ).length;
  if (sataDrives <= motherboard.specs.sataPorts) return [];
  return [
    error(
      IssueCode.SataPortsExceeded,
      ["STORAGE", "MOTHERBOARD"],
      `Foram escolhidos ${sataDrives} discos SATA, mas a placa-mãe tem ${motherboard.specs.sataPorts} portas SATA.`,
    ),
  ];
};
