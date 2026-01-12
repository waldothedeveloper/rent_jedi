# E2E Tests Documentation

This directory contains end-to-end tests for the Bloom Rent application using Playwright.

## Testing Philosophy

**We only test essential functionality:**
- ✅ Critical user flows (login, logout, navigation)
- ✅ Error states (failed login, invalid inputs)
- ✅ Protected route redirects
- ✅ Session persistence

**We DON'T test:**
- ❌ Form validation details (use unit tests)
- ❌ Button states and loading indicators
- ❌ UI element attributes (type, autocomplete, etc.)
- ❌ Responsive design (use visual regression tools)
- ❌ Accessibility (use axe/lighthouse)
- ❌ Every link href (unless critical)

## Test Structure

```
src/e2e/
├── README.md                    # This file
├── helpers/
│   └── auth-helpers.ts         # Authentication test utilities
├── home-navigation.spec.ts     # Home page navigation tests
├── login.spec.ts               # Essential login tests (4 tests)
├── login-totp.spec.ts          # Essential 2FA tests (3 tests)
└── login-integration.spec.ts   # Auth integration tests (4 tests, mostly skipped)
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run specific test file
```bash
npx playwright test login.spec.ts
```

### View test report
```bash
npm run test:e2e:report
```

## Test Files

### `login.spec.ts`
Essential login page tests:
- Failed login shows error
- Navigation to signup/forgot password
- Successful login redirects to dashboard (skipped - needs test user)

### `login-totp.spec.ts`
Essential TOTP verification tests:
- Failed verification shows error
- Navigation back to login
- Successful verification (skipped - needs test user with 2FA)

### `login-integration.spec.ts`
Essential authentication integration tests:
- Protected route redirects to login
- Complete login flow (skipped - needs test user)
- 2FA flow (skipped - needs test user with 2FA)
- Session persistence (skipped - needs test user)

### `home-navigation.spec.ts`
Home page navigation tests:
- Navigation to login/signup pages

## Test Helpers

### Authentication Helpers (`helpers/auth-helpers.ts`)

Reusable functions for authentication flows:

```typescript
// Login helpers
await login(page, email, password);
await fillLoginForm(page, email, password);
await submitLoginForm(page);

// TOTP helpers
await verifyTotp(page, code, trustDevice);
await fillTotpForm(page, code);

// Utility helpers
await clearAuth(page);
const loggedIn = await isLoggedIn(page);

// Test credentials
TEST_CREDENTIALS.valid
TEST_CREDENTIALS.invalid
TEST_CREDENTIALS.withTwoFactor
```

## Writing New Tests

### Basic Test Structure

```typescript
import { expect, test } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/route");
  });

  test("should test critical flow", async ({ page }) => {
    // Test only essential functionality
    await page.getByRole("button", { name: /submit/i }).click();
    await expect(page).toHaveURL(/\/success/);
  });
});
```

### What to Test

**DO test:**
- Happy path user flows
- Error states and error messages
- Navigation between pages
- Protected route access control
- Session/auth persistence

**DON'T test:**
- Form validation messages (test the schema with unit tests)
- Every UI element's presence
- Button disabled/enabled states
- Loading indicators
- Attribute values (href, type, autocomplete)
- Responsive breakpoints
- Keyboard navigation (unless critical to the flow)

### Best Practices

1. **Keep tests minimal** - Only test what matters
2. **Use semantic selectors** - `getByRole`, `getByLabel`, `getByText`
3. **Skip tests that need real data** - Use `test.skip()` with clear notes
4. **Avoid brittleness** - Don't test implementation details
5. **Focus on user impact** - Test what users actually do

## Test Configuration

Configuration is defined in `playwright.config.ts`:

- **Timeout**: 30 seconds per test
- **Browsers**: Chromium, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:3000`
- **Test Directory**: `src/e2e`
- **Reports**: HTML reporter
- **Traces**: Enabled on retry

## Debugging Tests

```bash
# Run with debug mode
npx playwright test --debug

# Run with trace viewer
npx playwright test --trace on

# Show test report with traces
npm run test:e2e:report
```

## Common Issues

### Test Timeouts
- Most timeouts indicate a real bug or missing test data
- Only increase timeout if you're waiting for slow external services

### Elements Not Found
- Check if you're testing the right thing
- Use `getByRole` with accessible names
- Verify the page actually loaded (`page.goto()` succeeded)

### Skipped Tests Failing
- Skipped tests need test database setup
- Create test users matching `TEST_CREDENTIALS`
- Ensure Better Auth is configured correctly

## CI/CD Integration

Tests run in CI with:
- 2 retries on failure
- Single worker (sequential execution)
- Build fails if `test.only` is found

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Locator API](https://playwright.dev/docs/api/class-locator)
