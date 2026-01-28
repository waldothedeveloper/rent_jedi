// spec: Property Creation - Single Unit Flow - cancel property creation flow
// seed: src/e2e/seed.spec.ts

import { TEST_CREDENTIALS, clearAuth, login } from "../helpers/auth-helpers";
import { expect, test } from "@playwright/test";

test.describe("Property Creation - Single Unit Flow", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await login(
      page,
      TEST_CREDENTIALS.owner.email,
      TEST_CREDENTIALS.owner.password,
    );

    await expect(page).toHaveURL(/\/owners\/dashboard/, { timeout: 10000 });
  });

  test("cancel property creation flow redirects back to properties list", async ({
    page,
  }) => {
    await page.goto("/owners/properties");
    await page.getByRole("button", { name: "Create Property" }).click();

    await page
      .getByRole("textbox", {
        name: "Property Name",
      })
      .fill("Test Cancel Property");

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page).toHaveURL("/owners/properties");
  });
});
