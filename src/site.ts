/**
 * Public URL of the site, for absolute links in metadata (Open Graph).
 * On Vercel it defaults to the production domain, which Vercel provides.
 */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);

export const SITE_NAME = "custompc";

export const SITE_DESCRIPTION =
  "Monte seu PC com preços em reais, lojas brasileiras e verificação de compatibilidade entre as peças.";

export const REPOSITORY_URL = "https://github.com/sugixp/custompc";
