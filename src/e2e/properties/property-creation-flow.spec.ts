import { TEST_CREDENTIALS, clearAuth, login } from "../helpers/auth-helpers";
import { expect, test } from "@playwright/test";

test.describe("Property Creation Flow", () => {
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

  test("Property Name, and Type are mandatory", async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole("button", { name: "Toggle Sidebar" }).click();
      await page.getByRole("link", { name: "Properties" }).click();

      await page.getByRole("button", { name: "Create Property" }).click();
    } else {
      // Navigate to property creation
      await page.getByRole("link", { name: "Properties" }).click();
      // navigate to create property page
      await page.getByRole("button", { name: "Create Property" }).click();
    }

    // Attempt to continue without filling any fields
    await page.getByRole("button", { name: "Continue to Address" }).click();

    // Verify validation messages
    await expect(page.getByText("Property Name is required")).toBeVisible();
    await expect(
      page.getByText("Please select a property type."),
    ).toBeVisible();
  });

  test("Duplicate property address is not allowed", async ({ page }) => {
    await page.getByRole("link", { name: "Properties" }).click();
    await page.getByRole("button", { name: "Create Property" }).click();

    await page
      .getByRole("textbox", { name: "Property Name" })
      .fill("Test Property");

    await page
      .getByRole("combobox", { name: "Property Type (optional)" })
      .click();
    await page
      .getByLabel("Single Family Home")
      .getByText("Single Family Home")
      .click();

    await page
      .getByRole("textbox", { name: "Property Description" })
      .fill("Test Property Description");
    await page.getByRole("button", { name: "Continue to Address" }).click();
    await page.getByRole("textbox", { name: "Street address" }).click();
    await page
      .getByRole("textbox", { name: "Street address" })
      .fill(TEST_CREDENTIALS.existingProperty.addressLine1);
    await page
      .getByRole("textbox", { name: "City" })
      .fill(TEST_CREDENTIALS.existingProperty.city);

    await page
      .getByLabel("State / Territory")
      .selectOption(TEST_CREDENTIALS.existingProperty.state);
    await page.getByLabel("State / Territory").press("Tab");
    await page
      .getByRole("textbox", { name: "ZIP / Postal code" })
      .fill(TEST_CREDENTIALS.existingProperty.zipCode);
    await page
      .getByRole("button", { name: "Continue to Property Type" })
      .click();
    await page.getByRole("button", { name: "Confirm and Continue" }).click();

    await expect(page.getByText("Unable to save address")).toBeVisible();
  });
});
