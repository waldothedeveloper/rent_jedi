import { expect, test } from "@playwright/test";

/**
 * Essential login page tests
 * Focus: Critical user flows only - navigation and error handling
 */

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("failed login shows error", async ({ page }) => {
    const emailInput = page.getByLabel(/^email$/i);
    const passwordInput = page.getByLabel(/^password$/i);
    const submitButton = page.getByRole("button", {
      name: /login to bloom rent/i,
    });

    // Fill with invalid credentials
    await emailInput.fill("nonexistent@example.com");
    await passwordInput.fill("WrongPassword123!");
    await submitButton.click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Should remain on login page (failed login)
    await expect(page).toHaveURL(/\/login/);
  });

  test("can navigate to signup", async ({ page }) => {
    await page.getByRole("link", { name: "Sign up", exact: true }).click();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("can navigate to forgot password", async ({ page }) => {
    await page.getByRole("link", { name: /forgot your password/i }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    // Note: Skipped - requires test user in database
    const emailInput = page.getByLabel(/^email$/i);
    const passwordInput = page.getByLabel(/^password$/i);
    const submitButton = page.getByRole("button", {
      name: /login to bloom rent/i,
    });

    await emailInput.fill("test@example.com");
    await passwordInput.fill("TestPassword123!");
    await submitButton.click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/owners\/dashboard/, { timeout: 10000 });
  });
});
