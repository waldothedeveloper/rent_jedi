"server-only";

import type { RoleName } from "@/lib/permissions";
import { isRoleName } from "@/lib/permissions";
import { redirect } from "next/navigation";

/**
 * Returns the dashboard URL for a given user role.
 * Redirects to root page with error if role is invalid or missing.
 */
export function getRedirectUrlByRole(role: string | null | undefined): string {
  if (!isRoleName(role)) {
    console.error(`Invalid or missing role: "${role}".`);
    redirect("/");
  }

  const roleRouteMap: Record<RoleName, string> = {
    admin: "/admin/dashboard",
    owner: "/owners/dashboard",
    manager: "/owners/dashboard",
    tenant: "/tenants/dashboard",
  };

  return roleRouteMap[role];
}

/**
 * Returns redirect URL considering invite flow.
 * Invite token takes precedence over role-based routing.
 */
export function getPostAuthRedirect(
  role: string | null | undefined,
  token?: string | null,
): string {
  if (token) {
    return "/invite/welcome";
  }
  return getRedirectUrlByRole(role);
}
