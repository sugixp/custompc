import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import type { PriceProvider } from "./price-provider";
import { seedPriceProvider } from "./providers/seed-provider";
import { loadPriceProviders } from "./registry";

const privateProvider: PriceProvider = {
  id: "private-stores",
  storeSlugs: ["kabum"],
  fetchOffers: async () => [],
};

/** Stands in for dynamic import(); no real package is installed. */
function fakeImporter(modules: Record<string, unknown>) {
  const requested: string[] = [];
  const importModule = async (specifier: string) => {
    requested.push(specifier);
    if (!(specifier in modules))
      throw new Error(`Cannot find module '${specifier}'`);
    return { default: modules[specifier] };
  };
  return { importModule, requested };
}

describe("loadPriceProviders", () => {
  it.each([undefined, "", "  "])(
    "defaults to the seed provider for %j",
    async (config) => {
      const { importModule, requested } = fakeImporter({});
      expect(await loadPriceProviders(config, importModule)).toEqual([
        seedPriceProvider,
      ]);
      expect(requested).toEqual([]);
    },
  );

  it("loads a provider package only when it is listed", async () => {
    const { importModule, requested } = fakeImporter({
      "@acme/prices": privateProvider,
    });
    const providers = await loadPriceProviders("@acme/prices", importModule);
    expect(providers).toEqual([privateProvider]);
    expect(requested).toEqual(["@acme/prices"]);
  });

  it("reads a relative path from the working directory", async () => {
    const url = pathToFileURL(resolve("e2e/fixtures/provider.ts")).href;
    const { importModule, requested } = fakeImporter({
      [url]: privateProvider,
    });
    const providers = await loadPriceProviders(
      "./e2e/fixtures/provider.ts",
      importModule,
    );
    expect(providers).toEqual([privateProvider]);
    expect(requested).toEqual([url]);
  });

  it("keeps the configured order and can mix built-in and packages", async () => {
    const { importModule } = fakeImporter({ "@acme/prices": privateProvider });
    const providers = await loadPriceProviders(
      " seed , @acme/prices ",
      importModule,
    );
    expect(providers.map((p) => p.id)).toEqual(["seed", "private-stores"]);
  });

  it.each([
    ["a provider", privateProvider],
    ["an array", [privateProvider]],
    ["a factory", () => privateProvider],
    ["an async factory", async () => [privateProvider]],
  ])("accepts a package exporting %s", async (_, exported) => {
    const { importModule } = fakeImporter({ "@acme/prices": exported });
    expect(await loadPriceProviders("@acme/prices", importModule)).toEqual([
      privateProvider,
    ]);
  });

  it("explains a missing package", async () => {
    const { importModule } = fakeImporter({});
    await expect(
      loadPriceProviders("@acme/prices", importModule),
    ).rejects.toThrow(/could not be loaded/);
  });

  it.each([
    ["nothing", undefined],
    ["an object without fetchOffers", { id: "x", storeSlugs: [] }],
    ["an empty id", { ...privateProvider, id: "" }],
  ])("rejects a package exporting %s", async (_, exported) => {
    const { importModule } = fakeImporter({ "@acme/prices": exported });
    await expect(
      loadPriceProviders("@acme/prices", importModule),
    ).rejects.toThrow(/valid PriceProvider/);
  });

  it("rejects two providers with the same id", async () => {
    const { importModule } = fakeImporter({
      "@acme/prices": { ...privateProvider, id: "seed" },
    });
    await expect(
      loadPriceProviders("seed,@acme/prices", importModule),
    ).rejects.toThrow(/share the id "seed"/);
  });
});
