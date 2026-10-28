import { SITE_TAGLINE } from "@/site";

/** Open Graph images: the 1.91:1 size Facebook, WhatsApp and X expect. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/**
 * The default image (app/opengraph-image.tsx), for pages that set their own
 * openGraph metadata: that replaces the inherited object, image included.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  ...OG_SIZE,
  alt: SITE_TAGLINE,
};
