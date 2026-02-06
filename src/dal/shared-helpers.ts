"server only";

import { db } from "@/db/drizzle";
import { member } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";

/**
 * Get user's organization IDs and check if admin
 */
export async function getUserOrganizations(
  userId: string,
  role: string
): Promise<{
  organizationIds: string[];
  isAdmin: boolean;
}> {
  // Platform admin can access all organizations
  if (role === "admin") {
    return { organizationIds: [], isAdmin: true };
  }

  // Get user's organization memberships
  const memberships = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, userId));

  return {
    organizationIds: memberships.map((m) => m.organizationId),
    isAdmin: false,
  };
}
