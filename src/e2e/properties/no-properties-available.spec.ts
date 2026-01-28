import { TEST_CREDENTIALS, clearAuth, login } from "../helpers/auth-helpers";
import { expect, test } from "@playwright/test";

test.describe("Edge Cases and Responsive Design", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await login(
      page,
      TEST_CREDENTIALS.owner.email,
      TEST_CREDENTIALS.owner.password,
    );
    await expect(page).toHaveURL(/\/owners\/dashboard/, { timeout: 10000 });
  });

  test("display empty state when no properties exist", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) {
      await page.getByRole("button", { name: "Toggle Sidebar" }).click();
      await page.getByRole("link", { name: "Properties" }).click();
    } else {
      await page.goto("/owners/properties");
    }
  });
});
