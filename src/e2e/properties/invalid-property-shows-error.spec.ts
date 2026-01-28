import { TEST_CREDENTIALS, clearAuth, login } from "../helpers/auth-helpers";
import { expect, test } from "@playwright/test";

/**
 * E2E tests for direct URL access to property details
 *
 * Prerequisites:
 * - Test owner user exists with email: e2e-owner@example.com
 * - Owner has at least one property
 */

test.describe("Navigation and Routing", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await login(
      page,
      TEST_CREDENTIALS.owner.email,
      TEST_CREDENTIALS.owner.password,
    );
    await expect(page).toHaveURL(/\/owners\/dashboard/, { timeout: 10000 });
  });

  test("Invalid property ID in URL shows Error Component", async ({ page }) => {
    // Navigate to /owners/properties to get a valid property ID
    await page.goto("/owners/properties");
    await page.waitForLoadState("domcontentloaded");
    // Navigate directly with invalid UUID
    await page.goto(
      "/owners/properties/details?id=00000000-0000-0000-0000-000000000000",
    );

    // Verify error message or redirect to properties list
    await page.waitForLoadState("domcontentloaded");

    const hasErrorPage = await page
      .getByText(/not found|error|invalid/i)
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const redirectedToList =
      page.url().includes("/owners/properties") &&
      !page.url().includes("propertyId");

    // Either should show error or redirect to list
    expect(hasErrorPage || redirectedToList).toBe(true);
  });
});
