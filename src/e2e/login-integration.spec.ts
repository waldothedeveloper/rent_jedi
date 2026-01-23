import { TEST_CREDENTIALS, clearAuth, login } from "./helpers/auth-helpers";
import { expect, test } from "@playwright/test";

/**
 * Essential integration tests for authentication flows
 * Note: Most tests are skipped by default - they require test users in the database
 */

test.describe("Authentication Integration", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test("Forgot Password should not send reset instructions for non-existent email", async ({
    page,
  }) => {
    await page.goto("/forgot-password");

    const emailInput = page.getByLabel(/^email$/i);
    await emailInput.fill("non-existent-email@test.com");

    const submitButton = page.getByRole("button", {
      name: /send reset link/i,
    });
    await submitButton.click();

    const toast = page.locator("li[data-sonner-toast]");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveText(
      "If this email exists in our system, check your email for the reset link",
    );
  });

  test("accessing protected route redirects to login when not authenticated", async ({
    page,
  }) => {
    // Try to access dashboard without authentication
    // The redirect happens server-side, so goto will resolve at the redirected URL
    await page.goto("/owners/dashboard");

    // Should have been redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("complete login flow with valid credentials", async ({ page }) => {
    // Note: Requires owner test user setup
    await page.goto("/login");

    const emailInput = page.getByLabel(/^email$/i);
    const passwordInput = page.getByLabel(/^password$/i);

    await emailInput.fill(TEST_CREDENTIALS.owner.email);
    await passwordInput.fill(TEST_CREDENTIALS.owner.password);

    const submitButton = page.getByRole("button", {
      name: /login to bloom rent/i,
    });
    await submitButton.click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/owners\/dashboard/, { timeout: 10000 });
  });

  test("session persists across page reloads", async ({ page }) => {
    // Note: Requires owner test user setup
    await login(
      page,
      TEST_CREDENTIALS.owner.email,
      TEST_CREDENTIALS.owner.password,
    );

    // Wait for dashboard
    await expect(page).toHaveURL(/\/owners\/dashboard/, { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL(/\/owners\/dashboard/);
  });

  test.skip("login with 2FA redirects to TOTP verification", async ({
    page,
  }) => {
    // Note: Skipped - requires test user with 2FA enabled
    await page.goto("/login");

    const emailInput = page.getByLabel(/^email$/i);
    const passwordInput = page.getByLabel(/^password$/i);

    await emailInput.fill(TEST_CREDENTIALS.withTwoFactor.email);
    await passwordInput.fill(TEST_CREDENTIALS.withTwoFactor.password);

    const submitButton = page.getByRole("button", {
      name: /login to bloom rent/i,
    });
    await submitButton.click();

    // Should redirect to TOTP verification
    await expect(page).toHaveURL(/\/login\/verify-totp/, { timeout: 5000 });
  });
});
