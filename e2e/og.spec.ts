import { expect, test, type Page } from "@playwright/test";

const BUILD =
  "/montar?cpu=amd-ryzen-5-7600&placa=asus-prime-b550m-a&gpu=asus-prime-rtx-5070-12g";

/** The og:image of a page, as a path: metadataBase is not the test server. */
async function ogImagePath(page: Page, path: string) {
  await page.goto(path);
  const content = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(content, `${path} has no og:image`).toBeTruthy();
  const url = new URL(content!);
  return url.pathname + url.search;
}

for (const path of [
  "/",
  "/pecas",
  "/pecas/processadores",
  "/pecas/processadores/amd-ryzen-5-7600",
  "/montar",
  BUILD,
]) {
  test(`${path} has an og:image that loads`, async ({ page }) => {
    const image = await ogImagePath(page, path);
    const response = await page.request.get(image);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^image\//);
    expect((await response.body()).length).toBeGreaterThan(1000);
  });
}

test("a build link gets its own image, a bad one the default", async ({
  page,
}) => {
  expect(await ogImagePath(page, BUILD)).toMatch(/^\/montar\/imagem\?cpu=/);
  expect(await ogImagePath(page, "/montar?cpu=nao-existe")).toBe(
    "/opengraph-image",
  );
});
