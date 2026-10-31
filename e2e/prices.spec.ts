import { expect, test, type Page } from "@playwright/test";
import { formatBRL } from "@/domain/money/money";
import { REFERENCE } from "./fixtures/reference-prices";

// The global setup imports REFERENCE through `npm run prices:import`; every
// other price comes from the illustrative seed.

const offerRows = (page: Page) =>
  page.getByRole("table", { name: "Ofertas por loja" }).locator("tbody tr");

const today = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo",
}).format(new Date());

test("a reference price is labeled with its check day and sets the headline", async ({
  page,
}) => {
  await page.goto(REFERENCE.path);
  const reference = offerRows(page).filter({
    hasText: "preço de referência",
  });
  await expect(reference).toHaveCount(REFERENCE.stores.length);
  await expect(reference.first()).toContainText(
    `preço de referência, conferido em ${today}`,
  );
  await expect(reference.first()).toContainText(
    formatBRL(REFERENCE.priceCents),
  );
  // The seed still fills the stores the spreadsheet left out.
  await expect(
    offerRows(page).filter({ hasText: "ilustrativo" }),
  ).not.toHaveCount(0);

  const headline = page
    .getByRole("main")
    .locator("p")
    .filter({ hasText: /^A partir de/ });
  await expect(headline).toContainText(formatBRL(REFERENCE.priceCents));
  await expect(headline).not.toContainText("ilustrativo");
});

test("a total says when it counts an illustrative price", async ({ page }) => {
  await page.goto(`/montar?fonte=${REFERENCE.partSlug}`);
  await expect(page.getByTestId("build-total")).toHaveText(
    formatBRL(REFERENCE.priceCents),
  );
  await expect(page.getByTestId("illustrative-note")).toHaveCount(0);

  await page.goto(`/montar?cpu=amd-ryzen-5-7600&fonte=${REFERENCE.partSlug}`);
  await expect(page.getByTestId("illustrative-note")).toHaveText(
    "inclui preços ilustrativos",
  );
});
