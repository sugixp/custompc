import "server-only";
import { resolveBuild } from "@/builder/resolve";
import { decodeBuild } from "@/builder/url";
import { getBuilderCatalog } from "./catalog";

/**
 * A build link's query matched against the catalog, for the builder page,
 * its metadata and its Open Graph image (/montar/imagem).
 */
export async function loadBuild(params: URLSearchParams) {
  const { selection, problems } = decodeBuild(params);
  const entries = await getBuilderCatalog();
  const bySlug = new Map(entries.map((entry) => [entry.part.slug, entry]));
  const resolved = resolveBuild(selection, (slug) => bySlug.get(slug)?.part);
  return {
    entries,
    bySlug,
    resolved,
    ignored: problems.length + resolved.unknown.length,
  };
}
