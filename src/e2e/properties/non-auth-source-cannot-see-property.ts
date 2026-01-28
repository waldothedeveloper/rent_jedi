import { clearAuth } from "../helpers/auth-helpers";
import { expect, test } from "@playwright/test";

/**
 * E2E tests for unauthenticated access redirects to login
 *
 * Note: These tests verify authentication guards are working
 */

test.describe("Authentication and Authorization", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test("unauthenticated access redirects to login", async ({ page }) => {
    // Clear all authentication cookies and storage
    await clearAuth(page);

    // Navigate to /owners/properties
    await page.goto("/owners/properties");

    // Verify redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Navigate to add property page
    await page.goto("/owners/properties/add-property");

    // Verify redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Navigate to property details with any ID
    await page.goto("/owners/properties/details?id=123");

    // Verify redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Navigate to edit property with any ID
    await page.goto("/owners/properties/details/edit?id=123");

    // Verify redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Login page is displayed for all attempts
    await expect(page.getByText("Login to your Account")).toBeVisible({ timeout: 5000 });
  });
});
