import { describe, it } from "vitest";
import * as fx from "@/domain/parts/fixtures";
import { IssueCode } from "../issue";
import {
  expectIssues,
  fullBuild,
  withSpecs,
  type ExpectedIssue,
} from "../test-helpers";
import { storageFitsM2Slots, storageFitsSataPorts } from "./storage";

type Row = [string, Parameters<typeof fullBuild>[0], ExpectedIssue[]];
const STORAGE_MB = ["STORAGE", "MOTHERBOARD"] as const;

const nvme = fx.storage;
const m2Sata = withSpecs(fx.storage, { interface: "SATA" });
const sataSsd = withSpecs(fx.storage, {
  interface: "SATA",
  formFactor: "2.5in",
});
const hdd = withSpecs(fx.storage, {
  kind: "HDD",
  interface: "SATA",
  formFactor: "3.5in",
  capacityGb: 2000,
});

describe("storageFitsM2Slots", () => {
  it.each<Row>([
    ["1 M.2 drive, 2 slots", {}, []],
    ["2 M.2 drives, 2 slots", { storage: [nvme, nvme] }, []],
    // M.2 SATA drives still take an M.2 slot.
    [
      "2 NVMe + 1 M.2 SATA, 2 slots",
      { storage: [nvme, nvme, m2Sata] },
      [{ code: IssueCode.M2SlotsExceeded, categories: STORAGE_MB }],
    ],
    [
      "SATA drives do not use M.2 slots",
      { storage: [nvme, nvme, sataSsd, hdd] },
      [],
    ],
    [
      "no motherboard yet",
      { motherboard: undefined, storage: [nvme, nvme, nvme] },
      [],
    ],
  ])("%s", (_, overrides, expected) => {
    expectIssues(storageFitsM2Slots, fullBuild(overrides), expected);
  });
});

describe("storageFitsSataPorts", () => {
  const twoPortBoard = withSpecs(fx.motherboard, { sataPorts: 2 });
  it.each<Row>([
    ["no SATA drives", {}, []],
    [
      "2 SATA drives, 2 ports",
      { motherboard: twoPortBoard, storage: [sataSsd, hdd] },
      [],
    ],
    [
      "3 SATA drives, 2 ports",
      { motherboard: twoPortBoard, storage: [sataSsd, hdd, hdd] },
      [{ code: IssueCode.SataPortsExceeded, categories: STORAGE_MB }],
    ],
    [
      "M.2 SATA drives do not use SATA ports",
      { motherboard: twoPortBoard, storage: [sataSsd, hdd, m2Sata] },
      [],
    ],
    [
      "board without SATA ports",
      {
        motherboard: withSpecs(fx.motherboard, { sataPorts: 0 }),
        storage: [hdd],
      },
      [{ code: IssueCode.SataPortsExceeded, categories: STORAGE_MB }],
    ],
    [
      "no motherboard yet",
      { motherboard: undefined, storage: [hdd, hdd, hdd, hdd, hdd] },
      [],
    ],
  ])("%s", (_, overrides, expected) => {
    expectIssues(storageFitsSataPorts, fullBuild(overrides), expected);
  });
});
