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
  memoryFitsSlots,
  memoryTypeMatchesMotherboard,
  memoryWithinMaxCapacity,
} from "./memory";

type Row = [string, Parameters<typeof fullBuild>[0], ExpectedIssue[]];
const MEM_MB = ["MEMORY", "MOTHERBOARD"] as const;

const ddr4Kit = withSpecs(fx.memory, { type: "DDR4" });
const fourByThirtyTwo = withSpecs(fx.memory, {
  moduleCount: 4,
  moduleCapacityGb: 32,
});

describe("memoryTypeMatchesMotherboard", () => {
  it.each<Row>([
    ["DDR5 kit on a DDR5 board", {}, []],
    [
      "DDR4 kit on a DDR5 board",
      { memory: [ddr4Kit] },
      [{ code: IssueCode.MemoryTypeMismatch, categories: MEM_MB }],
    ],
    // One issue for the build, not one per kit.
    [
      "two DDR4 kits",
      { memory: [ddr4Kit, ddr4Kit] },
      [{ code: IssueCode.MemoryTypeMismatch, categories: MEM_MB }],
    ],
    ["no memory yet", { memory: [] }, []],
    ["no motherboard yet", { motherboard: undefined, memory: [ddr4Kit] }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(memoryTypeMatchesMotherboard, fullBuild(overrides), expected);
  });
});

describe("memoryFitsSlots", () => {
  it.each<Row>([
    ["2 modules in 4 slots", {}, []],
    ["two 2-module kits fill 4 slots", { memory: [fx.memory, fx.memory] }, []],
    [
      "three 2-module kits in 4 slots",
      { memory: [fx.memory, fx.memory, fx.memory] },
      [{ code: IssueCode.MemorySlotsExceeded, categories: MEM_MB }],
    ],
    [
      "a 4-module kit on a 2-slot board",
      {
        memory: [fourByThirtyTwo],
        motherboard: withSpecs(fx.motherboard, { memorySlots: 2 }),
      },
      [{ code: IssueCode.MemorySlotsExceeded, categories: MEM_MB }],
    ],
    [
      "no motherboard yet",
      { motherboard: undefined, memory: [fx.memory, fx.memory, fx.memory] },
      [],
    ],
  ])("%s", (_, overrides, expected) => {
    expectIssues(memoryFitsSlots, fullBuild(overrides), expected);
  });
});

describe("memoryWithinMaxCapacity", () => {
  it.each<Row>([
    ["32 GB on a 192 GB board", {}, []],
    [
      "128 GB exactly at the limit",
      {
        memory: [fourByThirtyTwo],
        motherboard: withSpecs(fx.motherboard, { maxMemoryGb: 128 }),
      },
      [],
    ],
    [
      "128 GB on a 64 GB board",
      {
        memory: [fourByThirtyTwo],
        motherboard: withSpecs(fx.motherboard, { maxMemoryGb: 64 }),
      },
      [{ code: IssueCode.MemoryCapacityExceeded, categories: MEM_MB }],
    ],
    ["no motherboard yet", { motherboard: undefined }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(memoryWithinMaxCapacity, fullBuild(overrides), expected);
  });

  it("reports the total capacity", () => {
    const [issue] = memoryWithinMaxCapacity(
      fullBuild({
        memory: [fourByThirtyTwo],
        motherboard: withSpecs(fx.motherboard, { maxMemoryGb: 64 }),
      }),
    );
    expect(issue?.message).toContain("128 GB");
  });
});
