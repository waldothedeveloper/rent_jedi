import type { Page } from "@playwright/test";

/**
 * Test credentials for use in authentication tests
 * Note: These should be test accounts created in your test database
 */
export const TEST_CREDENTIALS = {
  valid: {
    email: "test@example.com",
    password: "TestPassword123!",
  },
  invalid: {
    email: "nonexistent@example.com",
    password: "WrongPassword123!",
  },
  // Add test user with 2FA enabled
  withTwoFactor: {
    email: "test-2fa@example.com",
    password: "TestPassword123!",
    totpSecret: "JBSWY3DPEHPK3PXP", // Base32 encoded secret for testing
  },
};

/**
 * Fills the login form with provided credentials
 */
export async function fillLoginForm(
  page: Page,
  email: string,
  password: string
) {
  const emailInput = page.getByLabel(/^email$/i);
  const passwordInput = page.getByLabel(/^password$/i);

  await emailInput.fill(email);
  await passwordInput.fill(password);
}

/**
 * Submits the login form
 */
export async function submitLoginForm(page: Page) {
  const submitButton = page.getByRole("button", {
    name: /login to bloom rent/i,
  });
  await submitButton.click();
}

/**
 * Performs a complete login flow
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await fillLoginForm(page, email, password);
  await submitLoginForm(page);
}

/**
 * Fills the TOTP verification form with a 6-digit code
 */
export async function fillTotpForm(page: Page, code: string) {
  if (code.length !== 6 || !/^\d+$/.test(code)) {
    throw new Error("TOTP code must be exactly 6 digits");
  }

  const firstSlot = page.locator('input[inputmode="numeric"]').first();
  await firstSlot.click();
  await page.keyboard.type(code);
}

/**
 * Submits the TOTP verification form
 */
export async function submitTotpForm(page: Page) {
  const submitButton = page.getByRole("button", {
    name: /verify and continue/i,
  });
  await submitButton.click();
}

/**
 * Performs a complete TOTP verification flow
 */
export async function verifyTotp(
  page: Page,
  code: string,
  trustDevice = false
) {
  await fillTotpForm(page, code);

  if (trustDevice) {
    const trustCheckbox = page.getByRole("checkbox", {
      name: /trust this device/i,
    });
    await trustCheckbox.check();
  }

  await submitTotpForm(page);
}

/**
 * Waits for navigation to dashboard after successful login
 */
export async function waitForDashboard(page: Page) {
  await page.waitForURL(/\/owners\/dashboard/, { timeout: 10000 });
}

/**
 * Checks if user is redirected to TOTP verification page
 */
export async function expectTotpPage(page: Page) {
  await page.waitForURL(/\/login\/verify-totp/, { timeout: 5000 });
}

/**
 * Generates a mock TOTP code (for testing purposes only)
 * In production tests, you would use a real TOTP library like `otplib`
 */
export function generateMockTotpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Clears all authentication cookies and storage
 */
export async function clearAuth(page: Page) {
  await page.context().clearCookies();

  // Only clear storage if we have a valid page loaded
  // (can't access localStorage on blank page)
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch {
    // Ignore - page not loaded yet, nothing to clear
  }
}

/**
 * Checks if user is logged in by verifying presence of auth indicators
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.goto("/owners/dashboard", { waitUntil: "networkidle" });
    return page.url().includes("/owners/dashboard");
  } catch {
    return false;
  }
}

/**
 * Opens an auth link, handling mobile navigation if needed
 * (Copied from existing home-navigation.spec.ts pattern)
 */
export async function openAuthLink(page: Page, name: RegExp) {
  const link = page.getByRole("link", { name });

  if (!(await link.isVisible())) {
    // Mobile nav hides auth links behind the sheet menu
    const menuButton = page.locator("button:has(svg.lucide-menu)");
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
  }

  await link.click();
}
