/**
 * Client-safe authentication utilities.
 * These functions can be imported and used in client components.
 */

import {
  type GlobalRole,
  isGlobalRole,
  isOrgRole,
  type OrgRole,
} from "@/lib/permissions";

/** New signups land on onboarding-oriented pages. */
const intentRouteMap: Record<OrgRole, string> = {
  owner: "/owners/properties",
  tenant: "/rental-marketplace",
};

/** Returning users with an org role go to their dashboard. */
const orgRoleRouteMap: Record<OrgRole, string> = {
  owner: "/owners/dashboard",
  tenant: "/rental-marketplace",
};

/** Global-only roles (admin, default user). */
const globalRoleRouteMap: Record<GlobalRole, string> = {
  admin: "/admin/dashboard",
  user: "/select-role",
};

/**
 * Returns the redirect URL based on intent (new signups) or role (returning users).
 * Intent takes precedence when present.
 *
 * Routing priority: intent → org role → global role → fallback.
 */
export function getRedirectUrl({
  role,
  intent,
}: {
  role: string | null | undefined;
  intent?: string | null;
}): string {
  // New signups: intent takes precedence
  if (isOrgRole(intent)) return intentRouteMap[intent];

  // Returning users: org role covers 99% of cases
  if (isOrgRole(role)) return orgRoleRouteMap[role];

  // Global admin or default user
  if (isGlobalRole(role)) return globalRoleRouteMap[role];

  return "/select-role"; // fallback for users without a role (e.g. Google OAuth users without org role)
}
