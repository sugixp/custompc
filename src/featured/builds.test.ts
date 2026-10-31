import { describe, expect, it } from "vitest";
import type { Build } from "@/domain/build/build";
import { checkBuild } from "@/domain/compatibility/check";
import type { Part, PartOf } from "@/domain/parts";
import { parseSeedPart, parts } from "@/seed";
import { featuredBuilds } from "./builds";

const bySlug = new Map<string, Part>(
  parts.map((part) => [part.slug, parseSeedPart(part)]),
);

function pick<C extends Part["category"]>(
  category: C,
  slug: string,
): PartOf<C> {
  const part = bySlug.get(slug);
  if (!part) throw new Error(`Unknown part slug "${slug}"`);
  if (part.category !== category)
    throw new Error(`"${slug}" is a ${part.category}, not a ${category}`);
  return part as PartOf<C>;
}

describe("featured builds", () => {
  it.each(featuredBuilds.map((build) => [build.slug, build] as const))(
    "%s raises no issue at all, not even a warning",
    (_, featured) => {
      const { parts: slugs } = featured;
      const build: Build = {
        cpu: pick("CPU", slugs.cpu),
        motherboard: pick("MOTHERBOARD", slugs.motherboard),
        memory: slugs.memory.map((slug) => pick("MEMORY", slug)),
        gpu: pick("GPU", slugs.gpu),
        storage: slugs.storage.map((slug) => pick("STORAGE", slug)),
        psu: pick("PSU", slugs.psu),
        pcCase: pick("CASE", slugs.pcCase),
        cooler: slugs.cooler ? pick("COOLER", slugs.cooler) : undefined,
      };
      expect(checkBuild(build)).toEqual([]);
    },
  );

  it("explains every part it picks", () => {
    for (const build of featuredBuilds)
      for (const slot of Object.keys(build.parts))
        expect(build.why, `${build.slug}.${slot}`).toHaveProperty(slot);
  });
});
