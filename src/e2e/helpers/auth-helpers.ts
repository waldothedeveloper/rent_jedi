import type { Page } from "@playwright/test";
import { SignJWT } from "jose";

/**
 * Test credentials for use in authentication tests
 * Note: These should be test accounts created in your test database
 */
export const TEST_CREDENTIALS = {
  owner: {
    email: "e2e-owner@example.com",
    password: "TestPassword123!",
  },
  tenant: {
    email: "e2e-tenant@example.com",
    password: "TestPassword123!",
  },
  invalid: {
    email: "nonexistent@example.com",
    password: "WrongPassword123!",
  },
  // Add test user with 2FA enabled
  withTwoFactor: {
    email: "e2e-owner-2fa@example.com",
    password: "TestPassword123!",
    totpSecret: "JBSWY3DPEHPK3PXP", // Base32 encoded secret for testing
  },
};

/**
 * Performs a complete login flow
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  const emailInput = page.getByLabel(/^email$/i);
  const passwordInput = page.getByLabel(/^password$/i);
  const submitButton = page.getByRole("button", {
    name: /login to bloom rent/i,
  });

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submitButton.click();
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
 * Creates a Better Auth email verification token
 * (Uses BETTER_AUTH_SECRET to match server-side signing)
 */
async function createEmailVerificationToken(email: string) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is required to generate email verification tokens."
    );
  }

  return await new SignJWT({ email: email.toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + 60 * 60)
    .sign(new TextEncoder().encode(secret));
}

/**
 * Verifies email using Better Auth endpoint and redirects to callback URL
 */
export async function verifyEmailAndRedirect(
  page: Page,
  email: string,
  callbackPath: string
) {
  const token = await createEmailVerificationToken(email);
  const callbackURL = encodeURIComponent(callbackPath);
  await page.goto(
    `/api/auth/verify-email?token=${token}&callbackURL=${callbackURL}`
  );
}
