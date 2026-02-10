"server only";

import { member, user } from "@/db/schema/auth-schema";

import { auth } from "@/lib/auth";
import { cache } from "react";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export const verifySessionDAL = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
});

export async function verifyAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return session;
}

type UserMembership = {
  organizationId: string;
  role: string;
};

/**
 * Look up the authenticated user's first org membership.
 * Returns { organizationId, role } or null if no membership or no session.
 */
export async function getUserMembership(): Promise<UserMembership | null> {
  const session = await verifySessionDAL();
  if (!session) return null;

  const [row] = await db
    .select({
      organizationId: member.organizationId,
      role: member.role,
    })
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  return row ?? null;
}

/**
 * Determine the correct post-login redirect URL based on org membership.
 *
 * Pass `userIdOverride` when calling from a server action right after
 * signInEmail — the session cookie isn't in the incoming request headers
 * yet, so verifySessionDAL() would return null.
 *
 * Routing logic:
 * - admin → /admin/dashboard
 * - owner membership → /owners/dashboard
 * - tenant membership → /tenants/dashboard
 * - no membership, intent=tenant → /rental-marketplace
 * - fallback → /select-role
 */
export async function getLoginRedirectUrl(
  userIdOverride?: string,
): Promise<string> {
  const TENANT_DASHBOARD_URL = "/tenants/dashboard";
  const OWNER_DASHBOARD_URL = "/owners/dashboard";
  const ADMIN_DASHBOARD_URL = "/admin/dashboard";
  const RENTAL_MARKETPLACE_URL = "/rental-marketplace";
  const SELECT_ROLE_URL = "/select-role";

  let userId: string;

  if (userIdOverride) {
    userId = userIdOverride;
  } else {
    const session = await verifySessionDAL();
    if (!session) return SELECT_ROLE_URL;
    userId = session.user.id;
  }

  // Fire both queries in parallel — they're independent
  const [userResult, membershipResult] = await Promise.all([
    db
      .select({ role: user.role, intent: user.intent })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1),
    db
      .select({
        organizationId: member.organizationId,
        role: member.role,
      })
      .from(member)
      .where(eq(member.userId, userId))
      .limit(1),
  ]);

  const userRow = userResult[0];

  if (userRow?.role === "admin") return ADMIN_DASHBOARD_URL;

  const membership = membershipResult[0] ?? null;
  if (membership) {
    if (membership.role === "owner") return OWNER_DASHBOARD_URL;
    if (membership.role === "tenant") return TENANT_DASHBOARD_URL;
  }

  if (userRow?.intent === "tenant") return RENTAL_MARKETPLACE_URL;

  return SELECT_ROLE_URL;
}
