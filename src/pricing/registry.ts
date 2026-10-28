import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { PriceProvider } from "./price-provider";
import { seedPriceProvider } from "./providers/seed-provider";

/**
 * Which providers the sync runs, from the PRICE_PROVIDERS environment
 * variable: a comma-separated list of "seed" (the built-in example provider)
 * and/or module specifiers of separately installed provider packages.
 *
 *   PRICE_PROVIDERS unset                          -> seed
 *   PRICE_PROVIDERS="@sugixp/custompc-prices"       -> only the private one
 *   PRICE_PROVIDERS="seed,@sugixp/custompc-prices"  -> both
 *   PRICE_PROVIDERS="./e2e/fixtures/aged-offers.ts" -> a local file
 *
 * Provider packages are loaded with a dynamic import only when listed, so
 * build, tests and CI never need them. A package default-exports a
 * PriceProvider, an array of them, or a (sync or async) factory of either.
 */
export const BUILT_IN_PROVIDERS: Record<string, PriceProvider> = {
  seed: seedPriceProvider,
};

export const DEFAULT_PROVIDERS = "seed";

type ModuleImporter = (specifier: string) => Promise<{ default?: unknown }>;

export async function loadPriceProviders(
  config: string | undefined = process.env.PRICE_PROVIDERS,
  importModule: ModuleImporter = (specifier) => import(specifier),
): Promise<PriceProvider[]> {
  const entries = (config?.trim() ? config : DEFAULT_PROVIDERS)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const providers: PriceProvider[] = [];
  for (const entry of entries) {
    const builtIn = BUILT_IN_PROVIDERS[entry];
    if (builtIn) {
      providers.push(builtIn);
      continue;
    }
    let loaded: { default?: unknown };
    try {
      loaded = await importModule(toSpecifier(entry));
    } catch (error) {
      throw new Error(
        `PRICE_PROVIDERS lists "${entry}", but it could not be loaded. Is the package installed?`,
        { cause: error },
      );
    }
    providers.push(...(await toProviders(entry, loaded.default)));
  }

  const ids = providers.map((provider) => provider.id);
  const duplicate = ids.find((id, index) => ids.indexOf(id) !== index);
  if (duplicate)
    throw new Error(`Two price providers share the id "${duplicate}"`);
  return providers;
}

/**
 * A relative path is read from the working directory, where the command runs,
 * not from this file, as import() would; anything else is a package name.
 */
function toSpecifier(entry: string): string {
  return entry.startsWith("./") || entry.startsWith("../")
    ? pathToFileURL(resolve(entry)).href
    : entry;
}

async function toProviders(
  entry: string,
  exported: unknown,
): Promise<PriceProvider[]> {
  const value = typeof exported === "function" ? await exported() : exported;
  const list: unknown[] = Array.isArray(value) ? value : [value];
  return list.map((candidate) => {
    if (!isPriceProvider(candidate)) {
      throw new Error(`"${entry}" does not export a valid PriceProvider`);
    }
    return candidate;
  });
}

function isPriceProvider(value: unknown): value is PriceProvider {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<PriceProvider>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    Array.isArray(candidate.storeSlugs) &&
    typeof candidate.fetchOffers === "function"
  );
}
