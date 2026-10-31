import { expect, test, type Page } from "@playwright/test";
import { E2E_PAGE_SIZE } from "./servers";

// Runs against the seed catalog: 15 CPUs, one of them (Core Ultra 7 265K) on
// LGA1851 and none from Intel on AM4. The E2E server shows E2E_PAGE_SIZE (5)
// parts per page, so CPUs take three.
const CPU_COUNT = 15;
const CPU_PAGES = Math.ceil(CPU_COUNT / E2E_PAGE_SIZE);

const resultCount = (page: Page) =>
  page.getByRole("heading", { level: 2, name: /^\d+ peças?$/ });

test.describe("category listing", () => {
  test("filters by socket and keeps the filter in a shareable URL", async ({
    page,
  }) => {
    await page.goto("/pecas/processadores");
    await expect(
      page.getByRole("heading", { level: 1, name: "Processadores" }),
    ).toBeVisible();
    const cards = page.getByRole("article");
    await expect(resultCount(page)).toHaveText(`${CPU_COUNT} peças`);

    await page.getByLabel("Soquete").selectOption("LGA1851");
    await page.getByRole("button", { name: "Aplicar" }).click();

    await expect(page).toHaveURL(/[?&]soquete=LGA1851\b/);
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("Core Ultra 7 265K");
    await expect(cards.first()).toContainText("A partir de");

    // Opening the same URL directly shows the same result.
    await page.goto(page.url());
    await expect(page.getByLabel("Soquete")).toHaveValue("LGA1851");
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
    await expect(resultCount(page)).toHaveText(`${CPU_COUNT} peças`);
  });

  test("pages through the results and keeps the sort order", async ({
    page,
  }) => {
    await page.goto("/pecas/processadores?ordem=nome");
    const cards = page.getByRole("article");
    const pager = page.getByRole("navigation", { name: "Paginação" });
    await expect(cards).toHaveCount(E2E_PAGE_SIZE);
    await expect(pager).toContainText(`Página 1 de ${CPU_PAGES}`);
    await expect(pager.getByRole("link", { name: /Anterior/ })).toHaveCount(0);
    const firstPage = await cards.allTextContents();

    await pager.getByRole("link", { name: /Próxima/ }).click();
    await expect(page).toHaveURL(/\?ordem=nome&pagina=2$/);
    await expect(pager).toContainText(`Página 2 de ${CPU_PAGES}`);
    await expect(cards).toHaveCount(E2E_PAGE_SIZE);
    expect(firstPage).not.toContain(await cards.first().textContent());

    await pager.getByRole("link", { name: /Anterior/ }).click();
    await expect(page).toHaveURL(/\/pecas\/processadores\?ordem=nome$/);
    await expect(cards).toHaveCount(E2E_PAGE_SIZE);
    expect(await cards.allTextContents()).toEqual(firstPage);
  });

  test("clamps a bad page number to the first or last page", async ({
    page,
  }) => {
    const pager = page.getByRole("navigation", { name: "Paginação" });
    for (const [pagina, shown] of [
      ["99", `Página ${CPU_PAGES} de ${CPU_PAGES}`],
      ["0", `Página 1 de ${CPU_PAGES}`],
      ["abc", `Página 1 de ${CPU_PAGES}`],
    ] as const) {
      await page.goto(`/pecas/processadores?pagina=${pagina}`);
      await expect(pager).toContainText(shown);
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
    await page.goto("/pecas/processadores?soquete=AM5&ordem=nome");
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
