import { NextResponse, type NextRequest } from "next/server";
import { categoryRouteBySlug } from "@/catalog/categories";

/**
 * Category pages stream (Partial Prerendering), so a notFound() inside them
 * arrives after the 200 status is sent. Unknown categories are a fixed list
 * check, cheap enough to run here, before rendering, for a real 404. Unknown
 * part slugs need the database and keep the streamed not-found (200 +
 * noindex).
 */
export function proxy(request: NextRequest) {
  const [, , categorySlug] = request.nextUrl.pathname.split("/");
  if (categorySlug && !categoryRouteBySlug(categorySlug)) {
    // A path no route matches renders app/not-found.tsx with status 404.
    return NextResponse.rewrite(
      new URL("/_categoria-inexistente", request.url),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/pecas/:path+",
};
