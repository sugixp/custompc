import { expect, test, type Page } from "@playwright/test";

const slot = (page: Page, category: string) =>
  page.locator(`[data-category="${category}"]`);

/** Opens the picker of a category, searches and picks a part by name. */
async function pick(
  page: Page,
  category: string,
  label: string,
  search: string,
  name: string,
) {
  await page.getByRole("button", { name: `Escolher (${label})` }).click();
  const dialog = page.getByRole("dialog", { name: `Escolher: ${label}` });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Buscar").fill(search);
  await dialog.getByRole("button", { name: `Escolher ${name}` }).click();
  await expect(dialog).toBeHidden();
  await expect(slot(page, category)).toContainText(name);
}

test("builds a compatible PC from scratch", async ({ page }) => {
  await page.goto("/montar");
  const status = page
    .getByRole("region", { name: "Compatibilidade" })
    .locator("[aria-live]");
  await expect(status).toHaveText("Escolha as peças para começar");

  await pick(page, "CPU", "Processador", "7600", "AMD Ryzen 5 7600");

  // With an AM5 CPU, the AM4 board is hidden until the filter is turned off,
  // and then it says why it does not fit.
  await page.getByRole("button", { name: "Escolher (Placa-mãe)" }).click();
  const dialog = page.getByRole("dialog", { name: "Escolher: Placa-mãe" });
  await expect(dialog.getByText("PRIME B550M-A")).toHaveCount(0);
  await dialog.getByLabel("Mostrar só compatíveis com a build atual").uncheck();
  const am4Board = dialog
    .getByRole("listitem")
    .filter({ hasText: "PRIME B550M-A" });
  await expect(am4Board).toContainText(
    "Incompatível: O processador usa o soquete AM5",
  );
  await dialog.getByRole("button", { name: "Fechar" }).click();

  await pick(
    page,
    "MOTHERBOARD",
    "Placa-mãe",
    "b650m",
    "ASUS TUF GAMING B650M-PLUS WIFI",
  );
  await pick(
    page,
    "MEMORY",
    "Memória RAM",
    "6000 2x16",
    "Kingston FURY Beast DDR5-6000 CL30 2x16GB (KF560C30BBEK2-32)",
  );
  await pick(
    page,
    "STORAGE",
    "Armazenamento",
    "nv3 1tb",
    "Kingston NV3 1TB (SNV3S/1000G)",
  );
  await pick(page, "PSU", "Fonte", "750w gold", "ASUS TUF Gaming 750W Gold");
  await pick(
    page,
    "CASE",
    "Gabinete",
    "meshify",
    "Fractal Design Meshify 2 Compact",
  );

  await expect(status).toHaveText("Nenhum problema de compatibilidade");
  await expect(page.getByTestId("build-total")).toHaveText(/R\$\s?\d/);
  await expect(page).toHaveURL(/cpu=amd-ryzen-5-7600/);
  await expect(page).toHaveURL(/gabinete=fractal-meshify-2-compact/);
});

test("picks a part with the keyboard alone", async ({ page, isMobile }) => {
  test.skip(isMobile, "no physical keyboard on the mobile profile");
  await page.goto("/montar");
  await page.getByRole("button", { name: "Escolher (Processador)" }).focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "Escolher: Processador" });
  await expect(dialog.getByLabel("Buscar")).toBeFocused();
  await page.keyboard.type("7600");
  // Search, then the "compatible only" checkbox, then the only result.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Escolher AMD Ryzen 5 7600" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");

  // The "+ Escolher" button is gone, so focus lands on its replacement.
  await expect(dialog).toBeHidden();
  await expect(slot(page, "CPU")).toContainText("AMD Ryzen 5 7600");
  const swap = page.getByRole("button", { name: "Trocar Processador" });
  await expect(swap).toBeFocused();

  // Escape closes without changing anything and returns to the opener.
  await page.keyboard.press("Enter");
  await expect(dialog.getByLabel("Buscar")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(swap).toBeFocused();
  await expect(slot(page, "CPU")).toContainText("AMD Ryzen 5 7600");
});

test("shows the issues of a seed scenario and highlights the parts", async ({
  page,
}) => {
  await page.goto("/montar");
  await page.locator('[data-scenario="am5-cpu-on-am4-board"]').click();

  const compat = page.getByRole("region", { name: "Compatibilidade" });
  await expect(compat.locator("[aria-live]")).toHaveText("1 erro");
  await expect(
    compat.locator('[data-code="CPU_SOCKET_MISMATCH"]'),
  ).toContainText("O processador usa o soquete AM5, mas a placa-mãe é AM4.");
  await expect(slot(page, "CPU")).toHaveAttribute("data-severity", "error");
  await expect(slot(page, "MOTHERBOARD")).toHaveAttribute(
    "data-severity",
    "error",
  );
  await expect(slot(page, "GPU")).toHaveAttribute("data-severity", "ok");
});

test("restores a build from its copied link", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "clipboard permissions are Chromium-only",
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto(
    "/montar?cpu=intel-core-i5-14400f&placa=asus-prime-b760m-a-wifi&ram=kingston-fury-beast-ddr5-5600-cl40-2x16gb*2",
  );
  await expect(slot(page, "MEMORY")).toContainText("2×");
  await page.getByRole("button", { name: "Copiar link da build" }).click();
  await expect(page.getByText("Link copiado.")).toBeVisible();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("/montar?cpu=intel-core-i5-14400f");

  const fresh = await context.newPage();
  await fresh.goto(copied);
  await expect(slot(fresh, "CPU")).toContainText("Intel Core i5-14400F");
  await expect(slot(fresh, "MOTHERBOARD")).toContainText(
    "ASUS PRIME B760M-A WIFI",
  );
  await expect(slot(fresh, "MEMORY")).toContainText("2×");
  // The 14400F has no integrated graphics and no GPU was picked.
  await expect(
    fresh
      .getByRole("region", { name: "Compatibilidade" })
      .locator('[data-code="NO_GRAPHICS_OUTPUT"]'),
  ).toBeVisible();
});

test("ignores unknown parts in a link without breaking", async ({ page }) => {
  await page.goto("/montar?cpu=amd-ryzen-5-7600&gpu=nao-existe&ram=Kit Ruim");
  await expect(
    page.getByText("2 itens do link não foram reconhecidos e foram ignorados."),
  ).toBeVisible();
  await expect(slot(page, "CPU")).toContainText("AMD Ryzen 5 7600");
  await expect(page).toHaveURL(/\/montar\?cpu=amd-ryzen-5-7600$/);
});

test("has Open Graph metadata with the build summary", async ({ page }) => {
  await page.goto("/montar?cpu=amd-ryzen-5-7600&gpu=asus-prime-rtx-5070-12g");
  await expect(page).toHaveTitle(
    "Build: Ryzen 5 7600 + Prime GeForce RTX 5070 12GB · custompc",
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    /2 peças, a partir de R\$/,
  );
});

test("keeps the total and problem count in view on phones", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "the fixed summary bar is for small screens");
  await page.goto("/montar?cpu=amd-ryzen-5-7600&placa=asus-prime-b550m-a");
  const bar = page.locator(".fixed.bottom-0");
  await expect(bar).toBeVisible();
  await expect(bar).toContainText("R$");
  await page.mouse.wheel(0, 2000);
  await expect(bar).toBeInViewport();
});
