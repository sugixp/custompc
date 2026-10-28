import { memoryKitCapacityGb } from "@/domain/parts";
import { error, IssueCode, type Rule } from "../issue";

export const memoryTypeMatchesMotherboard: Rule = ({ memory, motherboard }) => {
  if (!motherboard) return [];
  const wrongTypes = [
    ...new Set(
      memory
        .map((kit) => kit.specs.type)
        .filter((type) => type !== motherboard.specs.memoryType),
    ),
  ];
  if (wrongTypes.length === 0) return [];
  return [
    error(
      IssueCode.MemoryTypeMismatch,
      ["MEMORY", "MOTHERBOARD"],
      `A placa-mãe usa memória ${motherboard.specs.memoryType}, mas a memória escolhida é ${wrongTypes.join("/")}.`,
    ),
  ];
};

export const memoryFitsSlots: Rule = ({ memory, motherboard }) => {
  if (!motherboard) return [];
  const modules = memory.reduce(
    (total, kit) => total + kit.specs.moduleCount,
    0,
  );
  if (modules <= motherboard.specs.memorySlots) return [];
  return [
    error(
      IssueCode.MemorySlotsExceeded,
      ["MEMORY", "MOTHERBOARD"],
      `A memória escolhida tem ${modules} módulos, mas a placa-mãe tem ${motherboard.specs.memorySlots} slots.`,
    ),
  ];
};

export const memoryWithinMaxCapacity: Rule = ({ memory, motherboard }) => {
  if (!motherboard) return [];
  const totalGb = memory.reduce(
    (total, kit) => total + memoryKitCapacityGb(kit),
    0,
  );
  if (totalGb <= motherboard.specs.maxMemoryGb) return [];
  return [
    error(
      IssueCode.MemoryCapacityExceeded,
      ["MEMORY", "MOTHERBOARD"],
      `A memória escolhida soma ${totalGb} GB, mas a placa-mãe aceita até ${motherboard.specs.maxMemoryGb} GB.`,
    ),
  ];
};
