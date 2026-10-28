import type { NextRequest } from "next/server";
import { summarizeSharedBuild } from "@/builder/share";
import { renderOgImage } from "@/og/card";
import { buildCard, defaultCard } from "@/og/cards";
import { loadBuild } from "@/server/shared-build";

/**
 * The Open Graph image of a shared build, /montar/imagem?<build query>:
 * CPU and GPU, total and compatibility. A route handler because
 * opengraph-image files never see the query string. A link without known
 * parts gets the default image (its page points at that one anyway).
 */
export async function GET(request: NextRequest) {
  const { bySlug, resolved } = await loadBuild(request.nextUrl.searchParams);
  const shared = summarizeSharedBuild(resolved, bySlug);
  return renderOgImage(shared ? buildCard(shared) : defaultCard(), {
    cacheSeconds: 3600,
  });
}
