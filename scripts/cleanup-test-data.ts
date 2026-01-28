#!/usr/bin/env tsx

/**
 * Standalone script to clean up test data from the database
 *
 * Usage:
 *   npm run test:cleanup
 *   or
 *   npx tsx scripts/cleanup-test-data.ts
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

import { cleanupIncompleteProperties, getIncompletePropertyCount } from "../src/e2e/helpers/db-cleanup";

async function main() {
  console.log("🧹 Starting test data cleanup...\n");

  try {
    // Show count before cleanup
    const countBefore = await getIncompletePropertyCount();
    console.log(`📊 Found ${countBefore} incomplete properties\n`);

    if (countBefore === 0) {
      console.log("✨ No incomplete properties to clean up!");
      return;
    }

    // Run cleanup
    await cleanupIncompleteProperties();

    // Show count after cleanup
    const countAfter = await getIncompletePropertyCount();
    console.log(`\n📊 ${countAfter} incomplete properties remaining`);

    console.log("\n✅ Cleanup completed successfully!");
  } catch (error) {
    console.error("\n❌ Cleanup failed:", error);
    process.exit(1);
  }
}

main();
