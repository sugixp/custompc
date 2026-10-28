/** The demo's address. custompc-six.vercel.app still serves the same app. */
export const PRODUCTION_URL = "https://custompc-builder.vercel.app";

/**
 * Public URL of the site, for canonical links and Open Graph (metadataBase).
 * Every Vercel deploy uses the demo's address; Vercel's own
 * VERCEL_PROJECT_PRODUCTION_URL would pick the older, shorter domain.
 */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL ? PRODUCTION_URL : "http://localhost:3000"),
);

export const SITE_NAME = "custompc";

/** The home page headline, also on the default Open Graph image. */
export const SITE_TAGLINE =
  "Monte seu PC com preço em real e peças que se encaixam.";

export const SITE_DESCRIPTION =
  "Monte seu PC com preços em reais, lojas brasileiras e verificação de compatibilidade entre as peças.";

export const REPOSITORY_URL = "https://github.com/sugixp/custompc";
