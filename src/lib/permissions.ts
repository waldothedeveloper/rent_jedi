import { defaultStatements as orgDefaultStatements } from "better-auth/plugins/organization/access";
import { defaultStatements as adminDefaultStatements } from "better-auth/plugins/admin/access";
import { createAccessControl } from "better-auth/plugins/access";

// ============================================================================
// GLOBAL ACCESS CONTROL (Platform Admin Only)
// ============================================================================

const globalStatements = {
  ...adminDefaultStatements, // Includes: user, session
  platform: ["manage", "configure"],
  // TEMPORARY: Keep these resources in global AC for backwards compatibility
  // during DAL migration. Will be removed once DAL uses organization-scoped permissions.
  property: ["create", "update", "delete", "list", "view"],
  unit: ["create", "update", "delete", "list", "view"],
  message: ["send", "receive", "view", "update", "delete", "list"],
} as const;

export const globalAC = createAccessControl(globalStatements);

export const platformAdmin = globalAC.newRole({
  user: [...globalStatements.user],
  session: [...globalStatements.session],
  platform: [...globalStatements.platform],
  property: [...globalStatements.property],
  unit: [...globalStatements.unit],
  message: [...globalStatements.message],
});

// ============================================================================
// ORGANIZATION ACCESS CONTROL (Org-Scoped Roles)
// ============================================================================

const orgStatements = {
  ...orgDefaultStatements, // Includes: organization, member, invitation, team, ac
  property: ["create", "update", "delete", "list", "view"],
  unit: ["create", "update", "delete", "list", "view"],
  message: ["send", "receive", "view", "update", "delete", "list"],
} as const;

export const organizationAC = createAccessControl(orgStatements);

// Organization Owner - full control
export const orgOwner = organizationAC.newRole({
  organization: [...orgStatements.organization],
  member: [...orgStatements.member],
  invitation: [...orgStatements.invitation],
  team: [...orgStatements.team],
  ac: [...orgStatements.ac],
  property: [...orgStatements.property],
  unit: [...orgStatements.unit],
  message: [...orgStatements.message],
});

// Organization Manager - can't modify org settings/members
export const orgManager = organizationAC.newRole({
  organization: [],
  member: [],
  invitation: [...orgStatements.invitation],
  team: [],
  ac: [],
  property: [...orgStatements.property],
  unit: [...orgStatements.unit],
  message: [...orgStatements.message],
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export const orgRoleNames = ["owner", "manager"] as const;
export type OrgRole = (typeof orgRoleNames)[number];

export const globalRoleNames = ["user", "admin"] as const;
export type GlobalRole = (typeof globalRoleNames)[number];

export const isOrgRole = (
  value: string | null | undefined
): value is OrgRole =>
  typeof value === "string" && orgRoleNames.includes(value as OrgRole);

export const isGlobalRole = (
  value: string | null | undefined
): value is GlobalRole =>
  typeof value === "string" && globalRoleNames.includes(value as GlobalRole);
