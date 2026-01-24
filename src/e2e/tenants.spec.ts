import { TEST_CREDENTIALS, clearAuth, login } from "./helpers/auth-helpers";
import { expect, test } from "@playwright/test";

/**
 * E2E tests for tenant management (create, update, archive)
 *
 * Prerequisites:
 * - Test owner user exists with email: e2e-owner@example.com
 * - Owner has at least one property with an available unit
 *
 * Note: These tests modify database state. Run against a test database.
 */

// Generate a unique email for each test run to avoid conflicts
const generateUniqueEmail = () =>
  `e2e-test-tenant-${Date.now()}@example.com`;

test.describe("Tenant Management", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await login(
      page,
      TEST_CREDENTIALS.owner.email,
      TEST_CREDENTIALS.owner.password,
    );
    // Wait for dashboard to load (indicates successful login)
    await expect(page).toHaveURL(/\/owners\/dashboard/, { timeout: 10000 });
  });

  test.describe("Create Tenant", () => {
    test("complete tenant creation flow", async ({ page, isMobile }) => {
      // Navigate to add tenant page
      await page.goto("/owners/tenants");

      // Wait for the page to be ready
      await page.waitForLoadState("domcontentloaded");

      // Handle both empty state and list state
      // On mobile when there's a dropdown, we may need to open it first
      if (isMobile) {
        // Check if we're in empty state (Create Tenant button visible) or need to open menu
        const createTenantButton = page.getByRole("link", { name: /create tenant/i }).first();
        const menuButton = page.getByRole("button", { name: /open menu/i });

        // Wait for either to appear
        await Promise.race([
          createTenantButton.waitFor({ timeout: 10000 }).catch(() => {}),
          menuButton.waitFor({ timeout: 10000 }).catch(() => {}),
        ]);

        if (await createTenantButton.isVisible()) {
          await createTenantButton.click();
        } else if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.getByRole("menuitem", { name: /add tenant/i }).click();
        } else {
          // Fallback - try any add/create tenant link
          await page.getByRole("link", { name: /add tenant/i }).first().click();
        }
      } else {
        // Desktop: look for visible link
        const createTenantLink = page.getByRole("link", { name: /create tenant/i }).first();
        const addTenantLink = page.getByRole("link", { name: /add tenant/i }).first();

        // Wait for either to appear
        await Promise.race([
          createTenantLink.waitFor({ timeout: 10000 }).catch(() => {}),
          addTenantLink.waitFor({ timeout: 10000 }).catch(() => {}),
        ]);

        if (await createTenantLink.isVisible()) {
          await createTenantLink.click();
        } else {
          await addTenantLink.click();
        }
      }

      // Should be on basic info step
      await expect(page).toHaveURL(/\/owners\/tenants\/add-tenant/);

      // Step 1: Fill in basic tenant information
      const firstNameInput = page.locator("#firstName");
      const lastNameInput = page.locator("#lastName");
      const emailInput = page.locator("#email");

      await firstNameInput.fill("E2E Test");
      await lastNameInput.fill("Tenant");
      await emailInput.fill(generateUniqueEmail());

      await page
        .getByRole("button", { name: /continue to lease dates/i })
        .click();

      // Step 2: Lease Dates
      await expect(page).toHaveURL(/\/lease-dates/, { timeout: 10000 });

      // Get tomorrow's date for lease start
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const leaseStartDate = tomorrow.toISOString().split("T")[0];

      const leaseStartInput = page.locator("#leaseStartDate");
      await leaseStartInput.fill(leaseStartDate);

      await page
        .getByRole("button", { name: /continue to unit selection/i })
        .click();

      // Step 3: Unit Selection
      await expect(page).toHaveURL(/\/unit-selection/, { timeout: 10000 });

      // Wait for the page content to load
      await page.waitForLoadState("domcontentloaded");

      // Check if there are no properties or no available units
      // These messages appear when the test environment doesn't have the required data
      const noPropertiesHeading = page.getByRole("heading", { name: /no properties found/i });
      const noAvailableHeading = page.getByRole("heading", { name: /no available properties/i });
      const propertySelect = page.getByRole("combobox");

      // Wait for one of the three possible states
      await Promise.race([
        noPropertiesHeading.waitFor({ timeout: 10000 }).catch(() => {}),
        noAvailableHeading.waitFor({ timeout: 10000 }).catch(() => {}),
        propertySelect.waitFor({ timeout: 10000 }).catch(() => {}),
      ]);

      // Check if we hit a blocker state and skip the test
      if (await noPropertiesHeading.isVisible()) {
        test.skip(true, "No properties available - cannot complete tenant creation flow");
        return;
      }
      if (await noAvailableHeading.isVisible()) {
        test.skip(true, "No available units - all units have active tenants");
        return;
      }

      // Select first available property
      await expect(propertySelect).toBeVisible({ timeout: 5000 });
      await propertySelect.click();
      // Click the first available property option
      await page.getByRole("option").first().click();

      // Wait for units to load and select first unit
      await page.waitForSelector("[data-radix-collection-item]", {
        timeout: 10000,
      });
      await page.locator("[data-radix-collection-item]").first().click();

      await page
        .getByRole("button", { name: /continue to invitation/i })
        .click();

      // Step 4: Invitation
      await expect(page).toHaveURL(/\/invitation/, { timeout: 10000 });

      // Choose "Send Later" option
      await page.getByLabel(/send later/i).click();

      await page.getByRole("button", { name: /create tenant/i }).click();

      // Should redirect to tenants list with success toast
      await expect(page).toHaveURL(/\/owners\/tenants/, { timeout: 10000 });

      // Wait for the success toast specifically containing "Tenant created"
      // Use a more specific selector to handle multiple toasts
      const successToast = page.locator("li[data-sonner-toast][data-type='success']").filter({
        hasText: /tenant created/i,
      });
      await expect(successToast).toBeVisible({ timeout: 5000 });
    });

    test("accessing add-tenant without authentication redirects to login", async ({
      page,
    }) => {
      await clearAuth(page);
      await page.goto("/owners/tenants/add-tenant");
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Update Tenant", () => {
    // Skip on mobile - the edit flow requires desktop view for full functionality
    test("edit tenant information", async ({ page, isMobile }) => {
      test.skip(isMobile === true, "Edit tenant test requires desktop view");

      // Navigate to tenants page
      await page.goto("/owners/tenants");

      // Wait for tenants list to load - check for either tenant list or empty state
      const tenantList = page.locator("ul[role='list'] button");
      const emptyState = page.getByText(/add your first tenant/i);

      // Wait for either to appear
      await Promise.race([
        tenantList.first().waitFor({ timeout: 10000 }).catch(() => {}),
        emptyState.waitFor({ timeout: 10000 }).catch(() => {}),
      ]);

      // If empty state, skip this test as there are no tenants to edit
      if (await emptyState.isVisible()) {
        test.skip(true, "No tenants available to edit");
        return;
      }

      await tenantList.first().click();

      // Click Edit Tenant button (visible on desktop)
      await page
        .getByRole("link", { name: /edit tenant/i })
        .first()
        .click();

      // Should be on edit tenant page
      await expect(page).toHaveURL(/\/owners\/tenants\/edit-tenant/, {
        timeout: 10000,
      });

      // Update first name
      const firstNameInput = page.locator("#firstName");
      await firstNameInput.clear();
      await firstNameInput.fill("Updated Name");

      // Save changes
      await page.getByRole("button", { name: /save changes/i }).click();

      // Should redirect back to tenants with success toast
      await expect(page).toHaveURL(/\/owners\/tenants\?tenantId=/, {
        timeout: 10000,
      });

      // Look for success toast with "Tenant updated" message
      const successToast = page.locator("li[data-sonner-toast][data-type='success']").filter({
        hasText: /tenant updated/i,
      });
      await expect(successToast).toBeVisible({ timeout: 5000 });

      // Verify the name was updated in the detail view
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "Updated Name",
      );
    });

    test("cancel edit returns to tenant details", async ({ page, isMobile }) => {
      test.skip(isMobile === true, "Cancel edit test requires desktop view");

      await page.goto("/owners/tenants");

      // Wait for tenants list to load - check for either tenant list or empty state
      const tenantList = page.locator("ul[role='list'] button");
      const emptyState = page.getByText(/add your first tenant/i);

      // Wait for either to appear
      await Promise.race([
        tenantList.first().waitFor({ timeout: 10000 }).catch(() => {}),
        emptyState.waitFor({ timeout: 10000 }).catch(() => {}),
      ]);

      // If empty state, skip this test
      if (await emptyState.isVisible()) {
        test.skip(true, "No tenants available to test cancel flow");
        return;
      }

      // Select first tenant
      await tenantList.first().click();

      // Get tenant ID from URL
      await expect(page).toHaveURL(/tenantId=/);
      const url = page.url();
      const tenantIdMatch = url.match(/tenantId=([^&]+)/);
      const tenantId = tenantIdMatch?.[1];

      // Go to edit page
      await page
        .getByRole("link", { name: /edit tenant/i })
        .first()
        .click();
      await expect(page).toHaveURL(/\/edit-tenant/, { timeout: 10000 });

      // Click cancel
      await page.getByRole("link", { name: /cancel/i }).click();

      // Should return to tenant details
      await expect(page).toHaveURL(new RegExp(`tenantId=${tenantId}`), {
        timeout: 10000,
      });
    });
  });

  test.describe("Archive Tenant", () => {
    // Test cancel flow FIRST - before any tenants are archived
    test("cancel archive dialog does not archive tenant", async ({ page, isMobile }) => {
      await page.goto("/owners/tenants");

      // Wait for tenants list - check for either tenant list or empty state
      const tenantList = page.locator("ul[role='list'] button");
      const emptyState = page.getByText(/add your first tenant/i);

      // Wait for either to appear
      await Promise.race([
        tenantList.first().waitFor({ timeout: 10000 }).catch(() => {}),
        emptyState.waitFor({ timeout: 10000 }).catch(() => {}),
      ]);

      // If empty state, skip this test
      if (await emptyState.isVisible()) {
        test.skip(true, "No tenants available to test cancel flow");
        return;
      }

      // Select first tenant
      await tenantList.first().click();

      // Click Archive Tenant - handle both mobile and desktop
      if (isMobile) {
        // On mobile: open dropdown menu, then click Archive Tenant
        await page.getByRole("button", { name: /open menu/i }).click();
        await page.getByRole("menuitem", { name: /archive tenant/i }).click();
      } else {
        // On desktop: click Archive Tenant button directly
        await page
          .getByRole("button", { name: /archive tenant/i })
          .first()
          .click();
      }

      // Confirmation dialog should appear
      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toBeVisible();

      // Click cancel
      await dialog.getByRole("button", { name: /cancel/i }).click();

      // Dialog should close
      await expect(dialog).not.toBeVisible();

      // Should still be on the same tenant details (no redirect, no toast)
      await expect(page).toHaveURL(/\/owners\/tenants\?tenantId=/);
    });

    // Test actual archive flow AFTER cancel test
    test("archive tenant with confirmation dialog", async ({ page, isMobile }) => {
      await page.goto("/owners/tenants");

      // Wait for tenants list - check for either tenant list or empty state
      const tenantList = page.locator("ul[role='list'] button");
      const emptyState = page.getByText(/add your first tenant/i);

      // Wait for either to appear
      await Promise.race([
        tenantList.first().waitFor({ timeout: 10000 }).catch(() => {}),
        emptyState.waitFor({ timeout: 10000 }).catch(() => {}),
      ]);

      // If empty state, skip this test
      if (await emptyState.isVisible()) {
        test.skip(true, "No tenants available to archive");
        return;
      }

      await tenantList.first().click();

      // Wait for tenant details to load - wait for the Contact Information section
      // which indicates the details are fully loaded
      await expect(page.getByText(/contact information/i).first()).toBeVisible({ timeout: 10000 });

      // Get tenant name - there are two h1 elements with different visibility at different breakpoints
      // Use getByRole to find the visible heading
      const tenantDetailHeading = page.getByRole("heading", { level: 1 }).first();
      const tenantName = await tenantDetailHeading.textContent();

      // Click Archive Tenant - handle both mobile and desktop
      if (isMobile) {
        // On mobile: open dropdown menu, then click Archive Tenant
        await page.getByRole("button", { name: /open menu/i }).click();
        await page.getByRole("menuitem", { name: /archive tenant/i }).click();
      } else {
        // On desktop: click Archive Tenant button directly
        await page
          .getByRole("button", { name: /archive tenant/i })
          .first()
          .click();
      }

      // Confirmation dialog should appear
      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(/archive tenant/i);
      await expect(dialog).toContainText(tenantName || "");

      // Confirm archive
      await dialog
        .getByRole("button", { name: /yes, archive tenant/i })
        .click();

      // Should show success toast
      const successToast = page.locator("li[data-sonner-toast][data-type='success']").filter({
        hasText: /tenant archived/i,
      });
      await expect(successToast).toBeVisible({ timeout: 5000 });

      // Should redirect to tenants list (without tenantId param after archive)
      await expect(page).toHaveURL(/\/owners\/tenants/, { timeout: 10000 });
    });
  });

  test.describe("Tenant List Navigation", () => {
    test("selecting a tenant shows their details", async ({ page, isMobile }) => {
      await page.goto("/owners/tenants");

      // Wait for tenants list - check for either tenant list or empty state
      const tenantList = page.locator("ul[role='list'] button");
      const emptyState = page.getByText(/add your first tenant/i);

      // Wait for either to appear
      await Promise.race([
        tenantList.first().waitFor({ timeout: 10000 }).catch(() => {}),
        emptyState.waitFor({ timeout: 10000 }).catch(() => {}),
      ]);

      // If empty state, skip this test
      if (await emptyState.isVisible()) {
        test.skip(true, "No tenants available to select");
        return;
      }

      // On desktop, initially no tenant selected - should show empty detail state
      // Note: This text is only visible on desktop when no tenant is selected (side-by-side layout)
      if (!isMobile) {
        const emptyDetailState = page.getByText(/select a tenant to view details/i);
        await expect(emptyDetailState).toBeVisible({ timeout: 5000 });
      }

      // Click first tenant
      await tenantList.first().click();

      // URL should have tenantId
      await expect(page).toHaveURL(/tenantId=/);

      // Detail view should show tenant info sections
      await expect(page.getByText(/contact information/i)).toBeVisible();
      await expect(page.getByText(/property & unit/i)).toBeVisible();
    });

    test("add tenant button navigates to create flow", async ({ page, isMobile }) => {
      await page.goto("/owners/tenants");

      // On mobile, the "Add Tenant" button may be in a dropdown menu
      // On desktop, there's a visible "Add Tenant" link
      if (isMobile) {
        // On mobile, we need to open the dropdown menu first
        const menuButton = page.getByRole("button", { name: /open menu/i });
        if (await menuButton.isVisible()) {
          await menuButton.click();
          // Wait for dropdown to open
          await page.getByRole("menuitem", { name: /add tenant/i }).click();
        } else {
          // Fallback: try clicking the link directly if visible
          await page.getByRole("link", { name: /add tenant/i }).first().click();
        }
      } else {
        // On desktop, look for either "Create Tenant" (empty state) or "Add Tenant" (header)
        const createTenantLink = page.getByRole("link", { name: /create tenant/i }).first();
        const addTenantLink = page.getByRole("link", { name: /add tenant/i }).first();

        // Try create tenant first (empty state), then add tenant (header)
        if (await createTenantLink.isVisible()) {
          await createTenantLink.click();
        } else {
          await addTenantLink.click();
        }
      }

      await expect(page).toHaveURL(/\/owners\/tenants\/add-tenant/);
    });
  });
});
