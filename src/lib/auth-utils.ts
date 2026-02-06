"server-only";

import type { GlobalRole, OrgRole } from "@/types/roles";
import { isGlobalRole, isOrgRole } from "@/lib/permissions";
import { redirect } from "next/navigation";

// Combined role type for routing decisions
type RoutableRole = GlobalRole | OrgRole;

/**
 * Returns the dashboard URL for a given user role.
 * Redirects to root page with error if role is invalid or missing.
 *
 * NOTE: This function is used during authentication flow before organization
 * context is established. It accepts both global and org roles for backwards
 * compatibility during the migration period.
 */
export function getRedirectUrlByRole(role: string | null | undefined): string {
  console.log("role: ", role);

  // Check if it's a valid global or org role
  if (!isGlobalRole(role) && !isOrgRole(role)) {
    console.error(`Invalid or missing role: "${role}".`);
    redirect("/");
  }

  const roleRouteMap: Record<RoutableRole, string> = {
    // Global roles
    admin: "/admin/dashboard",
    user: "/owners/dashboard", // Default for authenticated users
    // Org roles
    owner: "/owners/dashboard",
    manager: "/owners/dashboard",
  };

  return roleRouteMap[role as RoutableRole];
}
