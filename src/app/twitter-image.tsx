import { renderOgImage } from "@/og/card";
import { defaultCard } from "@/og/cards";
import { OG_SIZE } from "@/og/size";
import { SITE_TAGLINE } from "@/site";

// Same as opengraph-image; Next reads these exports per file.
export const alt = SITE_TAGLINE;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage(defaultCard());
}
