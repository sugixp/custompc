import { expect, test, type Page } from "@playwright/test";
import { formatBRL } from "@/domain/money/money";
import { exampleOffers, stores } from "@/seed";
import { ALL_EXPIRED, ALL_STALE, MIXED } from "./fixtures/aged-offers";
import { E2E_PAGE_SIZE } from "./servers";

// The global setup ages some offers on top of the seed; see
// e2e/fixtures/aged-offers.ts.

const storeName = (slug: string) =>
  stores.find((store) => store.slug === slug)!.name;

const headline = (page: Page) =>
  page
    .getByRole("main")
    .locator("p")
    .filter({ hasText: /^A partir de/ });

const offerRows = (page: Page) =>
  page.getByRole("table", { name: "Ofertas por loja" }).locator("tbody tr");

test("a stale offer is flagged and an expired one hidden", async ({ page }) => {
  await page.goto(MIXED.path);
  const rows = offerRows(page);
  const stale = rows.filter({ hasText: storeName(MIXED.staleStore) });
  await expect(
    stale,
    "aged offers missing: did e2e/global-setup.ts run?",
  ).toContainText("Desatualizado");

  // The headline comes from fresh offers only, though the stale and the
  // expired offer are both cheaper.
  const fresh = exampleOffers.filter(
    (offer) =>
      offer.partSlug === MIXED.partSlug &&
      offer.storeSlug !== MIXED.staleStore &&
      offer.storeSlug !== MIXED.expiredStore,
  );
  const best = fresh
    .filter((offer) => offer.inStock)
    .reduce((a, b) => (b.priceCents < a.priceCents ? b : a));
  await expect(headline(page)).toContainText(formatBRL(best.priceCents));
  await expect(
    rows.filter({ hasText: "Menor preço" }).getByRole("rowheader"),
  ).toContainText(storeName(best.storeSlug));
  await expect(stale).not.toContainText("Menor preço");

  // Fresh rows first, the stale one last, the expired one not at all.
  await expect(rows).toHaveCount(fresh.length + 1);
  await expect(rows.last()).toContainText(storeName(MIXED.staleStore));
  await expect(
    rows.filter({ hasText: storeName(MIXED.expiredStore) }),
  ).toHaveCount(0);
});

test("a part with only stale offers has no current price", async ({ page }) => {
  const seeded = exampleOffers.filter(
    (offer) => offer.partSlug === ALL_STALE.partSlug,
  );
  await page.goto(ALL_STALE.path);
  await expect(offerRows(page)).toHaveCount(seeded.length);
  await expect(
    offerRows(page).filter({ hasText: "Desatualizado" }),
  ).toHaveCount(seeded.length);
  await expect(headline(page)).toHaveCount(0);
  await expect(page.getByRole("main")).toContainText("Sem preço recente");

  // In the listing, sorted by price, the two parts without one come last:
  // with 15 coolers and 5 per page, at the end of page 3.
  await page.goto("/pecas/coolers");
  const cards = page.getByRole("article");
  const unpriced = cards.filter({ hasText: "Sem preço recente" });
  await expect(cards).toHaveCount(E2E_PAGE_SIZE);
  await expect(unpriced).toHaveCount(0);
  await page.goto("/pecas/coolers?pagina=3");
  await expect(cards).toHaveCount(E2E_PAGE_SIZE);
  await expect(unpriced).toHaveCount(2);
  await expect(cards.nth(E2E_PAGE_SIZE - 2)).toContainText("Sem preço recente");
  await expect(cards.last()).toContainText("Sem preço recente");
});

test("a part with only expired offers lists no store", async ({ page }) => {
  await page.goto(ALL_EXPIRED.path);
  await expect(
    page.getByText("Nenhuma loja com preço recente para esta peça."),
  ).toBeVisible();
  await expect(headline(page)).toHaveCount(0);
});

test("the builder leaves parts without a current price out of the total", async ({
  page,
}) => {
  await page.goto(`/montar?cpu=amd-ryzen-5-7600&cooler=${ALL_STALE.partSlug}`);
  await expect(page.locator('[data-category="COOLER"]')).toContainText(
    "Sem preço recente",
  );
  await expect(
    page.getByText("Sem preço recente: Noctua NH-U12S redux"),
  ).toBeVisible();

  const cpuBest = Math.min(
    ...exampleOffers
      .filter((offer) => offer.partSlug === "amd-ryzen-5-7600" && offer.inStock)
      .map((offer) => offer.priceCents),
  );
  await expect(page.getByTestId("build-total")).toHaveText(formatBRL(cpuBest));
});
