import type { Build } from "@/domain/build/build";
import type { Category } from "@/domain/parts";

/**
 * Stable identifiers for every issue the checker can raise. The UI, tests and
 * analytics key on these, so existing values must never change meaning.
 */
export const IssueCode = {
  CpuSocketMismatch: "CPU_SOCKET_MISMATCH",
  CpuNotInSupportList: "CPU_NOT_IN_SUPPORT_LIST",
  CpuRequiresBiosUpdate: "CPU_REQUIRES_BIOS_UPDATE",
  MemoryTypeMismatch: "MEMORY_TYPE_MISMATCH",
  MemorySlotsExceeded: "MEMORY_SLOTS_EXCEEDED",
  MemoryCapacityExceeded: "MEMORY_CAPACITY_EXCEEDED",
  MotherboardFormFactorUnsupported: "MOTHERBOARD_FORM_FACTOR_UNSUPPORTED",
  PsuFormFactorUnsupported: "PSU_FORM_FACTOR_UNSUPPORTED",
  GpuTooLong: "GPU_TOO_LONG",
  CoolerTooTall: "COOLER_TOO_TALL",
  RadiatorUnsupported: "RADIATOR_UNSUPPORTED",
  CoolerSocketUnsupported: "COOLER_SOCKET_UNSUPPORTED",
  CoolerUnderrated: "COOLER_UNDERRATED",
  M2SlotsExceeded: "M2_SLOTS_EXCEEDED",
  SataPortsExceeded: "SATA_PORTS_EXCEEDED",
  PsuInsufficient: "PSU_INSUFFICIENT",
  PsuLowHeadroom: "PSU_LOW_HEADROOM",
  GpuPowerConnectorsMissing: "GPU_POWER_CONNECTORS_MISSING",
  NoGraphicsOutput: "NO_GRAPHICS_OUTPUT",
  MissingRequiredParts: "MISSING_REQUIRED_PARTS",
} as const;

export type IssueCode = (typeof IssueCode)[keyof typeof IssueCode];

/** error: the parts do not work together. warning: they may, with caveats. */
export type Severity = "error" | "warning";

export interface Issue {
  code: IssueCode;
  severity: Severity;
  /** The categories involved, so the UI can highlight those parts. */
  categories: readonly Category[];
  /** User-facing explanation in pt-BR. */
  message: string;
}

/**
 * A rule inspects a build and reports what is wrong with it. Rules return no
 * issues when a part they need is missing; completeness has its own rule.
 */
export type Rule = (build: Build) => Issue[];

export function error(
  code: IssueCode,
  categories: readonly Category[],
  message: string,
): Issue {
  return { code, severity: "error", categories, message };
}

export function warning(
  code: IssueCode,
  categories: readonly Category[],
  message: string,
): Issue {
  return { code, severity: "warning", categories, message };
}
