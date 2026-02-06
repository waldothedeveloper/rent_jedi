/**
 * Client-safe authentication utilities.
 * These functions can be imported and used in client components.
 */

/**
 * Returns the dashboard URL for a given user role (client-side version).
 * Returns "/" if role is invalid or missing.
 */
export function getRedirectUrlByRole(role: string | null | undefined): string {
  if (!role) return "/";

  const roleRouteMap: Record<string, string> = {
    admin: "/admin/dashboard",
    user: "/owners/dashboard",
    owner: "/owners/dashboard",
    manager: "/owners/dashboard",
  };

  return roleRouteMap[role] || "/";
}

/**
 * Returns the redirect URL based on user's signup intent.
 * Used for new user onboarding to route based on their stated goal
 * rather than their assigned role.
 *
 * @param intent - The signup intent ("owner" or "tenant")
 * @returns The URL to redirect to based on intent
 */
export function getRedirectUrlByIntent(intent: string | null | undefined): string {
  if (intent === "tenant") return "/rental-marketplace";
  if (intent === "owner") return "/owners/properties";
  return "/"; // Fallback to landing page
}
