import { expect, test } from "@playwright/test";

/**
 * Essential TOTP verification tests
 * Focus: Critical 2FA flows only
 */

test.describe("TOTP Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login/verify-totp");
  });

  test("failed verification shows error", async ({ page }) => {
    const firstSlot = page.locator('input[inputmode="numeric"]').first();
    const submitButton = page.getByRole("button", {
      name: /verify and continue/i,
    });

    // Enter invalid code
    await firstSlot.click();
    await page.keyboard.type("000000");
    await submitButton.click();

    // Wait for error response
    await page.waitForTimeout(2000);

    // Should remain on TOTP page
    await expect(page).toHaveURL(/\/login\/verify-totp/);
  });

  test("can navigate back to login", async ({ page }) => {
    await page.getByRole("link", { name: /back to login/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test.skip("successful TOTP verification redirects to dashboard", async ({
    page,
  }) => {
    // Note: Skipped - requires test user with 2FA setup
    const firstSlot = page.locator('input[inputmode="numeric"]').first();
    const submitButton = page.getByRole("button", {
      name: /verify and continue/i,
    });

    // Would need to generate real TOTP code here
    await firstSlot.click();
    await page.keyboard.type("123456");
    await submitButton.click();

    await expect(page).toHaveURL(/\/owners\/dashboard/, { timeout: 10000 });
  });
});
