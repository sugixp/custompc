import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Automated WCAG 2.2 A/AA checks with axe. They catch contrast, names,
// landmarks and ARIA misuse; keyboard flows are tested in the other specs.

const scan = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

for (const path of [
  "/",
  "/pecas",
  "/pecas/processadores",
  "/pecas/processadores/amd-ryzen-5-7600",
  "/pecas/coolers/noctua-nh-d15-g2",
  "/montar?cpu=amd-ryzen-5-7600&placa=asus-prime-b550m-a&ram=kingston-fury-beast-ddr4-3200-cl16-2x16gb*2",
  "/pagina-que-nao-existe",
]) {
  test(`has no axe violations on ${path}`, async ({ page }) => {
    // goto waits for the load event, which comes after the streamed content.
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect((await scan(page)).violations).toEqual([]);
  });
}

test("has no axe violations in the open part picker", async ({ page }) => {
  await page.goto("/montar?cpu=amd-ryzen-5-7600");
  await page.getByRole("button", { name: "Escolher (Placa-mãe)" }).click();
  const dialog = page.getByRole("dialog", { name: "Escolher: Placa-mãe" });
  await dialog.getByLabel("Mostrar só compatíveis com a build atual").uncheck();
  await expect(dialog.getByText(/^Incompatível:/).first()).toBeVisible();
  expect((await scan(page)).violations).toEqual([]);
});
