import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

import { cleanupIncompleteProperties } from "./helpers/db-cleanup";

/**
 * Global teardown for Playwright tests
 *
 * Runs once after all tests to clean up the test environment
 */
async function globalTeardown() {
  console.log("\n🧹 Running global test teardown...\n");

  try {
    // Clean up any incomplete properties created during tests
    await cleanupIncompleteProperties();

    console.log("\n✅ Global teardown completed successfully\n");
  } catch (error) {
    console.error("\n❌ Global teardown failed:", error);
    // Don't throw - cleanup failures shouldn't fail the test run
  }
}

export default globalTeardown;
