import { expect, test } from "@playwright/test";
import { brokenDbURL } from "./servers";

// Runs against the second server, whose database cannot be reached.

test("shows the error page when the catalog is down", async ({ page }) => {
  test.skip(!brokenDbURL, "no broken-database server for a remote target");
  for (const path of ["/pecas/processadores", "/montar"]) {
    await page.goto(brokenDbURL + path);
    // Next.js adds an empty route announcer with the same role.
    const alert = page
      .getByRole("alert")
      .filter({ has: page.getByRole("heading") });
    await expect(alert).toContainText("Não foi possível carregar esta página");
    // The header still renders, so the visitor can go elsewhere.
    await expect(page.getByRole("link", { name: "Peças" })).toBeVisible();

    // Retrying while the database is still down shows the error again.
    await alert.getByRole("button", { name: "Tentar de novo" }).click();
    await expect(alert).toContainText("Não foi possível carregar esta página");
  }
});
