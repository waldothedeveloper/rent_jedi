"server only";

import { getUserMembership } from "@/dal/shared-dal-helpers";
import { redirect } from "next/navigation";

/**
 * Route guard: requires the authenticated user to be an owner member.
 * Redirects to "/" if not authenticated or not an owner.
 * Returns the ownerMembership on success.
 */
export async function requireOwnerMembership() {
  const ownerMembership = await getUserMembership();
  if (!ownerMembership || ownerMembership.role !== "owner") {
    redirect("/");
  }
  return ownerMembership;
}
