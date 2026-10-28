import { afterEach, describe, expect, it, vi } from "vitest";

// SITE_URL is read once at import, so each case imports a fresh module.
async function siteUrl(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  return (await import("./site")).SITE_URL.href;
}

afterEach(() => vi.unstubAllEnvs());

describe("SITE_URL", () => {
  it("is the demo's address on Vercel, never the older domain", async () => {
    expect(
      await siteUrl({
        VERCEL: "1",
        VERCEL_PROJECT_PRODUCTION_URL: "custompc-six.vercel.app",
        NEXT_PUBLIC_SITE_URL: undefined,
      }),
    ).toBe("https://custompc-builder.vercel.app/");
  });

  it("can be set explicitly", async () => {
    expect(
      await siteUrl({
        VERCEL: "1",
        NEXT_PUBLIC_SITE_URL: "https://example.com",
      }),
    ).toBe("https://example.com/");
  });

  it("is localhost outside Vercel", async () => {
    expect(
      await siteUrl({ VERCEL: undefined, NEXT_PUBLIC_SITE_URL: undefined }),
    ).toBe("http://localhost:3000/");
  });
});
