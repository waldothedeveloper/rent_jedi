"server-only";

import type { RoleName } from "@/lib/permissions";
import { isRoleName } from "@/lib/permissions";
import { redirect } from "next/navigation";

/**
 * Returns the dashboard URL for a given user role.
 * Redirects to root page with error if role is invalid or missing.
 */
export function getRedirectUrlByRole(role: string | null | undefined): string {
  console.log("role: ", role);
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
