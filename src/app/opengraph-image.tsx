import { renderOgImage } from "@/og/card";
import { defaultCard } from "@/og/cards";
import { OG_SIZE } from "@/og/size";
import { SITE_TAGLINE } from "@/site";

// The site's default share image; pages without their own inherit it.
export const alt = SITE_TAGLINE;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage(defaultCard());
}
