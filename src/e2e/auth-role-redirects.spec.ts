import { expect, test, type Page } from "@playwright/test";

import {
  TEST_CREDENTIALS,
  clearAuth,
  verifyEmailAndRedirect,
} from "./helpers/auth-helpers";

function uniqueEmail(prefix: "owner" | "tenant") {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `e2e-${prefix}-${nonce}@example.com`;
}

async function completeSignup(
  page: Page,
  {
    role,
    name,
    email,
    password,
  }: { role: "owner" | "tenant"; name: string; email: string; password: string }
) {
  const submitLabel =
    role === "tenant" ? /create tenant account/i : /join bloom rent/i;

  await page.goto(`/signup?role=${role}`);
  await page.getByLabel(/full name/i).fill(name);
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  await page.getByRole("button", { name: submitLabel }).click();
}

test.describe("Role-based auth redirects", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test("tenant login redirects to tenant dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/^email$/i).fill(TEST_CREDENTIALS.tenant.email);
    await page.getByLabel(/^password$/i).fill(TEST_CREDENTIALS.tenant.password);
    await page.getByRole("button", { name: /login to bloom rent/i }).click();

    await expect(page).toHaveURL(/\/tenants\/dashboard/, { timeout: 10000 });
  });

  test("owner signup redirects to owner dashboard after verification", async ({
    page,
  }) => {
    const email = uniqueEmail("owner");
    const password = TEST_CREDENTIALS.owner.password;

    await completeSignup(page, {
      role: "owner",
      name: "E2E Owner",
      email,
      password,
    });

    await expect(page).toHaveURL(/\/verify-email/);
    await verifyEmailAndRedirect(page, email, "/owners/dashboard");
    await expect(page).toHaveURL(/\/owners\/dashboard/, { timeout: 10000 });
  });

  test("tenant signup redirects to tenant dashboard after verification", async ({
    page,
  }) => {
    const email = uniqueEmail("tenant");
    const password = TEST_CREDENTIALS.tenant.password;

    await completeSignup(page, {
      role: "tenant",
      name: "E2E Tenant",
      email,
      password,
    });

    await expect(page).toHaveURL(/\/verify-email/);
    await verifyEmailAndRedirect(page, email, "/tenants/dashboard");
    await expect(page).toHaveURL(/\/tenants\/dashboard/, { timeout: 10000 });
  });
});
