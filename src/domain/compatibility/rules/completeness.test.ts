import { describe, expect, it } from "vitest";
import { emptyBuild } from "@/domain/build/build";
import * as fx from "@/domain/parts/fixtures";
import { IssueCode } from "../issue";
import {
  expectIssues,
  fullBuild,
  withSpecs,
  type ExpectedIssue,
} from "../test-helpers";
import {
  noGraphicsOutput,
  REQUIRED_CATEGORIES,
  requiredPartsPicked,
} from "./completeness";

type Row = [string, Parameters<typeof fullBuild>[0], ExpectedIssue[]];

describe("requiredPartsPicked", () => {
  it.each<Row>([
    ["everything picked", {}, []],
    ["GPU and cooler are optional", { gpu: undefined, cooler: undefined }, []],
    [
      "no PSU and no case",
      { psu: undefined, pcCase: undefined },
      [{ code: IssueCode.MissingRequiredParts, categories: ["PSU", "CASE"] }],
    ],
    [
      "empty memory and storage lists",
      { memory: [], storage: [] },
      [
        {
          code: IssueCode.MissingRequiredParts,
          categories: ["MEMORY", "STORAGE"],
        },
      ],
    ],
  ])("%s", (_, overrides, expected) => {
    expectIssues(requiredPartsPicked, fullBuild(overrides), expected);
  });

  it("lists every required category for an empty build", () => {
    const [issue] = requiredPartsPicked(emptyBuild());
    expect(issue?.categories).toEqual(REQUIRED_CATEGORIES);
  });

  it("names the missing parts in Portuguese", () => {
    const [issue] = requiredPartsPicked(
      fullBuild({ psu: undefined, pcCase: undefined }),
    );
    expect(issue?.message).toBe("Ainda falta escolher: Fonte e Gabinete.");
  });
});

describe("noGraphicsOutput", () => {
  const noIgpu = withSpecs(fx.cpu, { integratedGraphics: false });
  it.each<Row>([
    ["CPU with integrated graphics, no GPU", { gpu: undefined }, []],
    ["CPU without integrated graphics, with GPU", { cpu: noIgpu }, []],
    [
      "CPU without integrated graphics, no GPU",
      { cpu: noIgpu, gpu: undefined },
      [{ code: IssueCode.NoGraphicsOutput, categories: ["CPU", "GPU"] }],
    ],
    ["no CPU yet", { cpu: undefined, gpu: undefined }, []],
  ])("%s", (_, overrides, expected) => {
    expectIssues(noGraphicsOutput, fullBuild(overrides), expected);
  });
});
