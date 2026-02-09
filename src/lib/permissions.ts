import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements as orgDefaultStatements } from "better-auth/plugins/organization/access";

// ============================================================================
// ORGANIZATION ACCESS CONTROL (Org-Scoped Roles)
// ============================================================================

const orgStatements = {
  ...orgDefaultStatements,
  property: ["create", "update", "archive", "list", "view"],
  unit: ["create", "update", "archive", "list", "view"],
} as const;

export const organizationAccessController = createAccessControl(orgStatements);

export const orgOwner = organizationAccessController.newRole({
  organization: ["update"],
  member: [...orgStatements.member],
  invitation: [...orgStatements.invitation],
  ac: [...orgStatements.ac],
  // owners cannot list aka see all properties/units. Only the units where they are the owners
  property: ["create", "update", "view", "archive"],
  unit: [...orgStatements.unit],
});

export const orgTenant = organizationAccessController.newRole({
  organization: [],
  member: [],
  invitation: [],
  ac: [],
  property: ["view"],
  unit: ["view"],
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export const orgRoleNames = ["owner", "tenant"] as const;
export type OrgRole = (typeof orgRoleNames)[number];

export const globalRoleNames = ["user", "admin"] as const;
export type GlobalRole = (typeof globalRoleNames)[number];

export const isOrgRole = (value: string | null | undefined): value is OrgRole =>
  typeof value === "string" && orgRoleNames.includes(value as OrgRole);

export const isGlobalRole = (
  value: string | null | undefined,
): value is GlobalRole =>
  typeof value === "string" && globalRoleNames.includes(value as GlobalRole);
