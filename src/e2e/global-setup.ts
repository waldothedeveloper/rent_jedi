import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

import { cleanupIncompleteProperties } from "./helpers/db-cleanup";

/**
 * Global setup for Playwright tests
 *
 * Runs once before all tests to prepare the test environment
 */
async function globalSetup() {
  console.log("\n🚀 Running global test setup...\n");

  try {
    // Clean up incomplete properties from previous test runs
    await cleanupIncompleteProperties();

    console.log("\n✅ Global setup completed successfully\n");
  } catch (error) {
    console.error("\n❌ Global setup failed:", error);
    // Don't throw - allow tests to run even if cleanup fails
    // This prevents setup issues from blocking all tests
  }
}

export default globalSetup;
