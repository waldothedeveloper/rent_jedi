import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, isNull, sql, like, or } from "drizzle-orm";
import { property } from "@/db/schema/properties-schema";
import { unit } from "@/db/schema/units-schema";

/**
 * Database cleanup utilities for e2e tests
 *
 * Removes incomplete properties and test data to ensure clean test state
 */

// Lazy database connection initialization
let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const client = neon(connectionString);
    db = drizzle(client);
  }
  return db;
}

/**
 * Clean up incomplete properties
 *
 * Removes properties that:
 * - Have no units (incomplete multi-step creation)
 * - Are test properties (name starts with "E2E" or "Test")
 */
export async function cleanupIncompleteProperties(ownerId?: string) {
  try {
    console.log("🧹 Cleaning up incomplete properties...");

    // Find properties with no units (incomplete creation flow)
    const propertiesWithNoUnits = await getDb()
      .select({ id: property.id })
      .from(property)
      .leftJoin(unit, eq(property.id, unit.propertyId))
      .where(
        and(
          isNull(unit.id),
          ownerId ? eq(property.ownerId, ownerId) : sql`1=1`
        )
      );

    if (propertiesWithNoUnits.length > 0) {
      const propertyIds = propertiesWithNoUnits.map((p) => p.id);
      console.log(`  Found ${propertyIds.length} properties with no units`);

      // Delete incomplete properties
      await getDb().delete(property).where(
        sql`${property.id} IN ${propertyIds}`
      );

      console.log(`  ✅ Deleted ${propertyIds.length} incomplete properties`);
    }

    // Clean up test properties (names starting with E2E or Test)
    const whereConditions = [
      like(property.name, "E2E%"),
      like(property.name, "Test%"),
      like(property.name, "%Test Property%"),
    ];

    const testPropertiesDeleted = await getDb()
      .delete(property)
      .where(
        and(
          or(...whereConditions),
          ownerId ? eq(property.ownerId, ownerId) : sql`1=1`
        )
      );

    if (testPropertiesDeleted) {
      console.log(`  ✅ Deleted test properties (E2E*, Test*, *Test Property*)`);
    }

    console.log("✅ Database cleanup completed");
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
    throw error;
  }
}

/**
 * Clean up all test data for a specific owner
 */
export async function cleanupOwnerTestData(ownerId: string) {
  try {
    console.log(`🧹 Cleaning up test data for owner: ${ownerId}`);

    // Delete all properties for the test owner
    await getDb().delete(property).where(eq(property.ownerId, ownerId));

    console.log("✅ Owner test data cleanup completed");
  } catch (error) {
    console.error("❌ Error during owner test data cleanup:", error);
    throw error;
  }
}

/**
 * Get count of incomplete properties
 */
export async function getIncompletePropertyCount(ownerId?: string) {
  try {
    const propertiesWithNoUnits = await getDb()
      .select({ id: property.id })
      .from(property)
      .leftJoin(unit, eq(property.id, unit.propertyId))
      .where(
        and(
          isNull(unit.id),
          ownerId ? eq(property.ownerId, ownerId) : sql`1=1`
        )
      );

    return propertiesWithNoUnits.length;
  } catch (error) {
    console.error("❌ Error getting incomplete property count:", error);
    return 0;
  }
}
