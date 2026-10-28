import { connection } from "next/server";
import { categoryRouteBySlug } from "@/catalog/categories";
import { summarizeOffers } from "@/catalog/offers";
import { renderOgImage } from "@/og/card";
import { categoryCard, defaultCard } from "@/og/cards";
import { OG_SIZE } from "@/og/size";
import { listCategoryParts } from "@/server/catalog";

export const alt = "Peças da categoria, com o menor preço atual em reais";
export const size = OG_SIZE;
export const contentType = "image/png";

/** The category and its lowest current price, read at request time. */
export default async function Image({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const route = categoryRouteBySlug((await params).categoria);
  if (!route) return renderOgImage(defaultCard());
  // Prices depend on the clock (offer freshness).
  await connection();
  const now = new Date();
  const parts = await listCategoryParts(route.category, now);
  const prices = parts.map(({ offers }) => summarizeOffers(offers, now).price);
  return renderOgImage(categoryCard(route, prices), { cacheSeconds: 3600 });
}
