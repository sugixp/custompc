import { summarizeOffers } from "@/catalog/offers";
import { renderOgImage } from "@/og/card";
import { defaultCard, partCard } from "@/og/cards";
import { OG_SIZE } from "@/og/size";
import { getCatalogPart } from "@/server/catalog";

export const alt = "A peça, suas especificações principais e o preço atual";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}) {
  const { found, now } = await getCatalogPart((await params).slug);
  if (!found) return renderOgImage(defaultCard());
  const { price } = summarizeOffers(found.offers, now);
  return renderOgImage(partCard(found.part, price), { cacheSeconds: 3600 });
}
