# E2E Testing Guide

## Overview

This directory contains end-to-end tests for the Bloom Rent application using Playwright.

## Test Structure

```
src/e2e/
├── helpers/
│   ├── auth-helpers.ts      # Authentication utilities
│   └── db-cleanup.ts        # Database cleanup utilities
├── properties/              # Property management tests (22 files)
├── global-setup.ts          # Runs before all tests
├── global-teardown.ts       # Runs after all tests
├── tenants.spec.ts          # Tenant management tests
├── login-*.spec.ts          # Authentication tests
└── seed.spec.ts             # Seed data setup
```

## Running Tests

### Run all tests

```bash
npm run test:e2e
```

### Run specific test suite

```bash
npx playwright test src/e2e/properties
npx playwright test src/e2e/tenants.spec.ts
```

### Run with UI mode (interactive)

```bash
npm run test:e2e:ui
```

### Run specific test file

```bash
npx playwright test src/e2e/properties/properties-create-single-unit.spec.ts
```

### Run only on Chromium (faster)

```bash
npx playwright test --project=chromium
```

### View test report

```bash
npm run test:e2e:report
```

## Database Cleanup

### Automatic Cleanup

The test suite includes automatic database cleanup:

- **Before tests**: `global-setup.ts` removes incomplete properties from previous test runs
- **After tests**: `global-teardown.ts` cleans up any incomplete properties created during tests

### Manual Cleanup

If you need to manually clean up test data:

```bash
npm run test:cleanup
```

This will:

- Remove properties with no units (incomplete creation flow)
- Remove test properties (names starting with "E2E" or "Test")

### What Gets Cleaned Up

The cleanup utilities remove:

1. **Incomplete Properties**: Properties created but not finished through the multi-step creation flow
2. **Test Properties**: Properties with names matching test patterns:
   - Starts with "E2E"
   - Starts with "Test"
   - Contains "Test Property"

### Database Utilities

Located in `src/e2e/helpers/db-cleanup.ts`:

```typescript
// Clean up incomplete properties
await cleanupIncompleteProperties();

// Clean up all test data for a specific user
await cleanupUserTestData(userId);

// Get count of incomplete properties
const count = await getIncompletePropertyCount();
```

## Test Credentials

All tests use credentials from `src/e2e/helpers/auth-helpers.ts`:

```typescript
TEST_CREDENTIALS = {
  owner: {
    email: "e2e-owner@example.com",
    password: "...", // Set in auth-helpers.ts
  },
};
```

## Writing Tests

### Follow Existing Patterns

1. **Authentication**: Use `clearAuth()` and `login()` from auth-helpers
2. **Empty State Handling**: Check for empty states and skip tests if needed
3. **Mobile & Desktop**: Handle both viewports using `isMobile` parameter
4. **Wait States**: Use proper `waitFor` and `expect` with timeouts
5. **Selectors**: Prefer role-based selectors over CSS selectors

### Example Test Structure

```typescript
import { TEST_CREDENTIALS, clearAuth, login } from "../helpers/auth-helpers";
import { expect, test } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await login(
      page,
      TEST_CREDENTIALS.owner.email,
      TEST_CREDENTIALS.owner.password,
    );
    await expect(page).toHaveURL(/\/owners\/dashboard/, { timeout: 10000 });
  });

  test("should do something", async ({ page, isMobile }) => {
    // Check for empty state
    const emptyState = page.getByText(/no items/i);
    if (await emptyState.isVisible().catch(() => false)) {
      test.skip(true, "No items available to test");
      return;
    }

    // Test implementation...
  });
});
```

## Troubleshooting

### Tests failing due to incomplete properties

Run the cleanup script:

```bash
npm run test:cleanup
```

### Tests failing on navigation

Check that:

- URL patterns use correct parameter names (`id=` not `propertyId=`)
- Wait for page load states: `await page.waitForLoadState("domcontentloaded")`
- URLs match actual routes in the application

Ensure:

- `clearAuth()` is called before login
- Dashboard redirect wait: `await expect(page).toHaveURL(/\/owners\/dashboard/)`
- Credentials are correct in `auth-helpers.ts`
- URL patterns use correct parameter names (`id=` not `propertyId=`)
- Wait for page load states: `await page.waitForLoadState("domcontentloaded")`
- URLs match actual routes in the application

### Selector not found

- Use `await element.waitFor({ timeout: 5000 })`
- Check if element is in mobile menu vs. desktop
- Verify element exists in the current app state

## CI/CD

The test suite is configured for CI environments:

- Retries: 2 retries on failure (CI only)
- Workers: Sequential execution on CI (`workers: 1`)
- Parallel: Full parallelization locally
- Traces: Captured on retry for debugging

## Best Practices

1. ✅ **Clean up after yourself**: Use global teardown or test-specific cleanup
2. ✅ **Handle empty states**: Skip tests when required data doesn't exist
3. ✅ **Use unique names**: Generate unique test data names (timestamps)
4. ✅ **Mobile responsive**: Test both desktop and mobile viewports
5. ✅ **Proper waits**: Use explicit waits, avoid `page.waitForTimeout()`
6. ✅ **Role-based selectors**: Prefer accessibility selectors
7. ✅ **Verify state**: Check for success toasts and redirects

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Project README](../../README.md)
- [Test Plan](properties/properties-test-plan.md)
