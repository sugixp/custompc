import type { Build } from "@/domain/build/build";
import { checkBuild, type Issue } from "@/domain/compatibility";
import type { Part } from "@/domain/parts";

/** The build as it would be with this part picked (replacing or adding). */
export function withCandidate(build: Build, part: Part): Build {
  switch (part.category) {
    case "CPU":
      return { ...build, cpu: part };
    case "MOTHERBOARD":
      return { ...build, motherboard: part };
    case "MEMORY":
      return { ...build, memory: [...build.memory, part] };
    case "GPU":
      return { ...build, gpu: part };
    case "STORAGE":
      return { ...build, storage: [...build.storage, part] };
    case "PSU":
      return { ...build, psu: part };
    case "CASE":
      return { ...build, pcCase: part };
    case "COOLER":
      return { ...build, cooler: part };
  }
}

/**
 * Why a part would not fit the current build: the errors checkBuild raises
 * with the part in place that involve its category. Warnings never block;
 * the picker shows them on the build once the part is chosen.
 */
export function candidateBlockers(build: Build, part: Part): Issue[] {
  return checkBuild(withCandidate(build, part)).filter(
    (issue) =>
      issue.severity === "error" && issue.categories.includes(part.category),
  );
}
