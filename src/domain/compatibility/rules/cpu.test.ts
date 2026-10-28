import { describe, expect, it } from "vitest";
import * as fx from "@/domain/parts/fixtures";
import { IssueCode } from "../issue";
import {
  expectIssues,
  fullBuild,
  withSpecs,
  type ExpectedIssue,
} from "../test-helpers";
import {
  cpuInMotherboardSupportList,
  cpuSocketMatchesMotherboard,
} from "./cpu";

const intelCpu = withSpecs(
  { ...fx.cpu, slug: "intel-core-i5-14600k", model: "Core i5-14600K" },
  { socket: "LGA1700" },
);
const CPU_MB = ["CPU", "MOTHERBOARD"] as const;

describe("cpuSocketMatchesMotherboard", () => {
  it.each<[string, Parameters<typeof fullBuild>[0], ExpectedIssue[]]>([
    ["same socket", {}, []],
    [
      "different sockets",
      { cpu: intelCpu },
      [{ code: IssueCode.CpuSocketMismatch, categories: CPU_MB }],
    ],
    ["no CPU yet", { cpu: undefined }, []],
    ["no motherboard yet", { motherboard: undefined }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(cpuSocketMatchesMotherboard, fullBuild(overrides), expected);
  });

  it("names both sockets", () => {
    const [issue] = cpuSocketMatchesMotherboard(fullBuild({ cpu: intelCpu }));
    expect(issue?.message).toContain("LGA1700");
    expect(issue?.message).toContain("AM5");
  });
});

describe("cpuInMotherboardSupportList", () => {
  const boardSupporting = (requiresBiosUpdate: boolean) =>
    withSpecs(fx.motherboard, {
      supportedCpus: [{ cpuSlug: fx.cpu.slug, requiresBiosUpdate }],
    });

  it.each<[string, Parameters<typeof fullBuild>[0], ExpectedIssue[]]>([
    ["listed, no BIOS update", { motherboard: boardSupporting(false) }, []],
    [
      "listed, needs a BIOS update",
      { motherboard: boardSupporting(true) },
      [{ code: IssueCode.CpuRequiresBiosUpdate, categories: CPU_MB }],
    ],
    [
      "not listed",
      { motherboard: withSpecs(fx.motherboard, { supportedCpus: [] }) },
      [{ code: IssueCode.CpuNotInSupportList, categories: CPU_MB }],
    ],
    [
      "support list unknown",
      { motherboard: withSpecs(fx.motherboard, { supportedCpus: undefined }) },
      [],
    ],
    // The socket error already covers it; no second issue.
    ["different socket", { cpu: intelCpu }, []],
    ["no CPU yet", { cpu: undefined }, []],
    ["no motherboard yet", { motherboard: undefined }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(cpuInMotherboardSupportList, fullBuild(overrides), expected);
  });

  it("only warns", () => {
    const issues = cpuInMotherboardSupportList(
      fullBuild({ motherboard: boardSupporting(true) }),
    );
    expect(issues.map((issue) => issue.severity)).toEqual(["warning"]);
  });
});
