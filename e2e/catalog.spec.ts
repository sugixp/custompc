import { expect, test } from "@playwright/test";

// Runs against the seed catalog: 6 CPUs, one of them (Ryzen 5 5600X) on AM4.

test.describe("category listing", () => {
  test("filters by socket and keeps the filter in a shareable URL", async ({
    page,
  }) => {
    await page.goto("/pecas/processadores");
    await expect(
      page.getByRole("heading", { level: 1, name: "Processadores" }),
    ).toBeVisible();
    const cards = page.getByRole("article");
    await expect(cards).toHaveCount(6);

    await page.getByLabel("Soquete").selectOption("AM4");
    await page.getByRole("button", { name: "Aplicar" }).click();

    await expect(page).toHaveURL(/[?&]soquete=AM4\b/);
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("Ryzen 5 5600X");
    await expect(cards.first()).toContainText("A partir de");

    // Opening the same URL directly shows the same result.
    await page.goto(page.url());
    await expect(page.getByLabel("Soquete")).toHaveValue("AM4");
    await expect(cards).toHaveCount(1);
  });

  test("shows an empty state with a way back", async ({ page }) => {
    await page.goto("/pecas/processadores?soquete=AM4&marca=Intel");
    await expect(
      page.getByText("Nenhuma peça com esses filtros."),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "veja todas as processadores" })
      .click();
    await expect(page.getByRole("article")).toHaveCount(6);
  });

  // No seed category fills a page (12 parts), so only the edges are tested
  // here; the page math is unit-tested in src/catalog/listing.test.ts.
  test("falls back to the only page for a bad page number", async ({
    page,
  }) => {
    for (const pagina of ["5", "0", "abc"]) {
      await page.goto(`/pecas/processadores?pagina=${pagina}`);
      await expect(page.getByRole("article")).toHaveCount(6);
      await expect(
        page.getByRole("navigation", { name: "Paginação" }),
      ).toHaveCount(0);
    }
  });

  test("answers 404 for an unknown category", async ({ page }) => {
    const response = await page.goto("/pecas/monitores");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Página não encontrada" }),
    ).toBeVisible();
  });
});

test.describe("part page", () => {
  test("shows specs, sources and store offers", async ({ page }) => {
    await page.goto("/pecas/processadores?ordem=nome");
    await page.getByRole("link", { name: "Ryzen 5 7600", exact: true }).click();

    await expect(page).toHaveURL(/\/pecas\/processadores\/amd-ryzen-5-7600$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Ryzen 5 7600" }),
    ).toBeVisible();
    await expect(page).toHaveTitle("AMD Ryzen 5 7600 · custompc");

    const sheet = page.getByRole("complementary", { name: "Ficha técnica" });
    await expect(sheet.getByText("Soquete")).toBeVisible();
    await expect(sheet.getByText("AM5", { exact: true })).toBeVisible();
    await expect(sheet.getByRole("link", { name: /amd\.com/ })).toHaveAttribute(
      "href",
      /^https:\/\/www\.amd\.com\//,
    );

    const offers = page.getByRole("table", { name: "Ofertas por loja" });
    const storeLinks = offers.getByRole("link", { name: /Ver na loja/ });
    expect(await storeLinks.count()).toBeGreaterThan(0);
    for (const link of await storeLinks.all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    await expect(page.getByText(/Preços ilustrativos/)).toBeVisible();
  });

  test("has Open Graph metadata", async ({ page }) => {
    await page.goto("/pecas/processadores/amd-ryzen-5-7600");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "AMD Ryzen 5 7600",
    );
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute("content", /A partir de R\$/);
  });
});

test("keyboard users can skip to the content", async ({ page, isMobile }) => {
  test.skip(isMobile, "no physical keyboard on the mobile profile");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
});

test("no page scrolls sideways", async ({ page }) => {
  // Compare with the device viewport, not window.innerWidth: mobile browsers
  // zoom out to fit overflowing content, which grows innerWidth with it.
  const viewportWidth = page.viewportSize()!.width;
  for (const path of [
    "/",
    "/pecas",
    "/pecas/processadores",
    "/pecas/placas-de-video/asus-prime-rtx-5070-12g",
    "/montar?cpu=amd-ryzen-5-7600&placa=asus-prime-b550m-a&ram=kingston-fury-beast-ddr4-3200-cl16-2x16gb*2&gpu=asus-tuf-rtx-5080-16g-gaming&disco=wd-blue-2tb-wd20ezbx&fonte=asus-tuf-gaming-750w-gold&gabinete=fractal-meshify-2-compact",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth, `${path} is wider than the screen`).toBeLessThanOrEqual(
      viewportWidth,
    );
  }
});
