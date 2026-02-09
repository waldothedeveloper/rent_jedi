export type GlobalRole = "user" | "admin";
export type OrgRole = "owner" | "tenant";

// Temporary: Combined role type for backwards compatibility during migration
// TODO: Remove after DAL layer is migrated to organization-scoped permissions
// NOTE: "user" is not included because it's not a permission-bearing role,
// just a default authentication level
export type Roles = "admin" | OrgRole;

// For DAL functions that need full context
export type AuthorizedContext = {
  userId: string;
  globalRole: GlobalRole;
  orgRole: OrgRole | null;
  organizationId: string | null;
};
