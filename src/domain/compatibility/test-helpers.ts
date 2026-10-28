import { expect } from "vitest";
import type { Build } from "@/domain/build/build";
import * as fx from "@/domain/parts/fixtures";
import type { Issue, Rule } from "./issue";

/** The fixture build: every part picked and all of them compatible. */
export function fullBuild(overrides: Partial<Build> = {}): Build {
  return {
    cpu: fx.cpu,
    motherboard: fx.motherboard,
    memory: [fx.memory],
    gpu: fx.gpu,
    storage: [fx.storage],
    psu: fx.psu,
    pcCase: fx.pcCase,
    cooler: fx.airCooler,
    ...overrides,
  };
}

/** Copies a part with some of its specs replaced. */
export function withSpecs<P extends { specs: object }>(
  part: P,
  specs: Partial<P["specs"]>,
): P {
  return { ...part, specs: { ...part.specs, ...specs } };
}

export type ExpectedIssue = Pick<Issue, "code" | "categories">;

/** Asserts the codes and categories a rule reports, in order. */
export function expectIssues(
  rule: Rule,
  build: Build,
  expected: ExpectedIssue[],
) {
  const issues = rule(build);
  expect(issues.map(({ code, categories }) => ({ code, categories }))).toEqual(
    expected,
  );
  for (const issue of issues) expect(issue.message).not.toBe("");
  return issues;
}
