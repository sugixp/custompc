import { expect, test } from "@playwright/test";

const video = "#demonstracao ~ figure video";

test("the demo video plays muted and can be paused", async ({ page }) => {
  await page.goto("/");
  const demo = page.locator(video);
  await expect(demo).toHaveJSProperty("muted", true);
  await expect
    .poll(() => demo.evaluate((v: HTMLVideoElement) => v.paused))
    .toBe(false);

  await page.getByRole("button", { name: "Pausar demonstração" }).click();
  await expect
    .poll(() => demo.evaluate((v: HTMLVideoElement) => v.paused))
    .toBe(true);
  await expect(
    page.getByRole("button", { name: "Reproduzir demonstração" }),
  ).toBeVisible();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the demo shows only its poster", async ({ page }) => {
    const videoRequests: string[] = [];
    page.on("request", (request) => {
      if (/\/demo\/builder\.(mp4|webm)$/.test(request.url())) {
        videoRequests.push(request.url());
      }
    });
    await page.goto("/");
    const demo = page.locator(video);
    await expect(demo).toHaveAttribute("poster", "/demo/builder-poster.webp");
    await expect(
      page.getByRole("button", { name: /demonstração/ }),
    ).toHaveCount(0);
    // Give a misbehaving autoplay time to show itself.
    await page.waitForTimeout(500);
    expect(await demo.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    expect(videoRequests).toEqual([]);
  });
});
