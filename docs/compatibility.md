# Compatibility checks

`checkBuild(build)` in `src/domain/compatibility` runs every rule against a
build and returns a list of issues. Rules are pure functions with no
framework or database imports (ESLint enforces this for `src/domain`).

Each issue has:

- `code`: a stable identifier (`IssueCode`). The UI and tests key on it, so
  existing codes never change meaning.
- `severity`: `error` (the parts do not work together) or `warning` (they
  may, with a caveat the buyer should know).
- `categories`: the part categories involved, so the UI can highlight them.
- `message`: the explanation shown to the user, in Portuguese.

Errors always come before warnings. Within a severity, issues follow the
order of `RULES` in `check.ts`, so the output is deterministic.

## Partial builds

A rule only runs when every part it needs is picked; otherwise it reports
nothing. A build without a PSU gets no power issues, for example. The one
exception is `MISSING_REQUIRED_PARTS`, a single warning listing the required
categories still missing: CPU, motherboard, memory, storage, PSU and case.
The GPU is optional (integrated graphics) and so is the cooler (many CPUs
ship with one).

## Rules

| Code                                  | Severity | Categories             | When                                                                   |
| ------------------------------------- | -------- | ---------------------- | ---------------------------------------------------------------------- |
| `CPU_SOCKET_MISMATCH`                 | error    | CPU, motherboard       | CPU and board sockets differ                                           |
| `CPU_NOT_IN_SUPPORT_LIST`             | warning  | CPU, motherboard       | Same socket, but the CPU is missing from the board's support list      |
| `CPU_REQUIRES_BIOS_UPDATE`            | warning  | CPU, motherboard       | Listed as supported, flagged `requiresBiosUpdate`                      |
| `MEMORY_TYPE_MISMATCH`                | error    | memory, motherboard    | A kit's DDR generation differs from the board's                        |
| `MEMORY_SLOTS_EXCEEDED`               | error    | memory, motherboard    | Total modules across kits > memory slots                               |
| `MEMORY_CAPACITY_EXCEEDED`            | error    | memory, motherboard    | Total GB across kits > board maximum                                   |
| `MOTHERBOARD_FORM_FACTOR_UNSUPPORTED` | error    | motherboard, case      | Case does not list the board's form factor                             |
| `PSU_FORM_FACTOR_UNSUPPORTED`         | error    | PSU, case              | Case does not list the PSU's form factor (ATX, SFX, SFX-L)             |
| `GPU_TOO_LONG`                        | error    | GPU, case              | GPU length > case GPU clearance                                        |
| `COOLER_TOO_TALL`                     | error    | cooler, case           | Air cooler height > case cooler clearance (not checked for AIOs)       |
| `RADIATOR_UNSUPPORTED`                | error    | cooler, case           | AIO radiator size not among the case's supported sizes                 |
| `COOLER_SOCKET_UNSUPPORTED`           | error    | cooler, CPU or board   | Cooler lacks the CPU's socket (or the board's, before a CPU is picked) |
| `COOLER_UNDERRATED`                   | warning  | cooler, CPU            | Cooler's published rating < CPU TDP                                    |
| `M2_SLOTS_EXCEEDED`                   | error    | storage, motherboard   | M.2 drives (NVMe or SATA) > M.2 slots                                  |
| `SATA_PORTS_EXCEEDED`                 | error    | storage, motherboard   | 2.5in/3.5in drives > SATA ports                                        |
| `PSU_INSUFFICIENT`                    | error    | PSU, CPU (, GPU)       | PSU wattage < estimated draw                                           |
| `PSU_LOW_HEADROOM`                    | warning  | PSU, CPU (, GPU)       | PSU wattage < recommended wattage (below)                              |
| `GPU_POWER_CONNECTORS_MISSING`        | warning  | GPU, PSU               | PSU has fewer 12V-2x6/12VHPWR or 8-pin PCIe connectors than the GPU    |
| `NO_GRAPHICS_OUTPUT`                  | warning  | CPU, GPU               | CPU has no integrated graphics and no GPU is picked                    |
| `MISSING_REQUIRED_PARTS`              | warning  | the missing categories | A required category has no part yet                                    |

Some checks are warnings on purpose. Support lists and BIOS versions vary by
board revision and stock, adapters exist for GPU power connectors, and
vendors rate coolers inconsistently.

## Power estimate

`src/domain/power/estimate.ts`:

```
estimated draw = CPU + GPU + platform
  CPU      = maxPowerW (Intel PL2 / AMD PPT) when known, else tdpW
  GPU      = boardPowerW (total board power), 0 without a GPU
  platform = 75 W fixed
```

The 75 W platform allowance is a deliberately generous figure for a typical
desktop:

| Component                            | Allowance |
| ------------------------------------ | --------- |
| Motherboard (chipset, VRM, onboard)  | ~40 W     |
| Memory (2–4 DDR4/DDR5 modules)       | ~10 W     |
| Drives (a couple of SSDs or one HDD) | ~15 W     |
| Fans and AIO pump                    | ~10 W     |

```
recommended PSU = max(ceil(estimated draw × 1.3), gpu.recommendedPsuW)
```

The 1.3 factor (30% headroom) keeps the PSU in its efficient, quiet range and
absorbs transient spikes. The GPU vendor's `recommendedPsuW` is already a
whole-system PSU figure with its own margin, so it is compared as is and
never multiplied.

- PSU < estimated draw → `PSU_INSUFFICIENT` (error)
- PSU < recommended → `PSU_LOW_HEADROOM` (warning)

Power rules need a PSU and a CPU. Without a CPU the estimate would be far too
low to mean anything.

## Known limitations

- The platform allowance is fixed: builds with many hard drives or fans can
  draw more than 75 W outside the CPU and GPU.
- Shared lanes are not modelled. On many boards, using an M.2 slot disables
  SATA ports or a PCIe slot.
- GPU thickness (slots) and case expansion slots are not checked yet.
- The cooler rating is compared with TDP, not with the CPU's short-term peak.
