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
  tenant: ["create", "update", "delete", "list", "view"],
  maintenance: ["create", "update", "resolve", "view", "list"],
  message: ["send", "receive", "view", "update", "delete", "list"],
  payment: ["create", "update", "list", "delete", "pay", "view"],
  invite: ["create", "view", "delete", "list", "accept"],
} as const;

export const globalAC = createAccessControl(globalStatements);

export const platformAdmin = globalAC.newRole({
  user: [...globalStatements.user],
  session: [...globalStatements.session],
  platform: [...globalStatements.platform],
  // TEMPORARY: Admin has full access to all resources during migration
  property: [...globalStatements.property],
  unit: [...globalStatements.unit],
  tenant: [...globalStatements.tenant],
  maintenance: [...globalStatements.maintenance],
  message: [...globalStatements.message],
  payment: [...globalStatements.payment],
  invite: [...globalStatements.invite],
});

// TEMPORARY: Keep global versions of org roles for backwards compatibility
// during DAL migration. These will be removed once DAL uses organization plugin.
export const globalOwner = globalAC.newRole({
  property: [...globalStatements.property],
  unit: [...globalStatements.unit],
  tenant: [...globalStatements.tenant],
  maintenance: [...globalStatements.maintenance],
  message: [...globalStatements.message],
  payment: [...globalStatements.payment],
  invite: [...globalStatements.invite],
});

export const globalManager = globalAC.newRole({
  property: [...globalStatements.property],
  unit: [...globalStatements.unit],
  tenant: [...globalStatements.tenant],
  maintenance: [...globalStatements.maintenance],
  message: [...globalStatements.message],
  payment: [...globalStatements.payment],
  invite: [...globalStatements.invite],
});

export const globalTenant = globalAC.newRole({
  property: ["view"],
  unit: ["view"],
  maintenance: [...globalStatements.maintenance],
  message: ["send", "receive", "view", "update", "list"],
  payment: ["pay", "view"],
  invite: ["view", "accept"],
});

// ============================================================================
// ORGANIZATION ACCESS CONTROL (Org-Scoped Roles)
// ============================================================================

const orgStatements = {
  ...orgDefaultStatements, // Includes: organization, member, invitation, team, ac
  property: ["create", "update", "delete", "list", "view"],
  unit: ["create", "update", "delete", "list", "view"],
  tenant: ["create", "update", "delete", "list", "view"],
  maintenance: ["create", "update", "resolve", "view", "list"],
  message: ["send", "receive", "view", "update", "delete", "list"],
  payment: ["create", "update", "list", "delete", "pay", "view"],
  invite: ["create", "view", "delete", "list", "accept"],
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
  tenant: [...orgStatements.tenant],
  maintenance: [...orgStatements.maintenance],
  message: [...orgStatements.message],
  payment: [...orgStatements.payment],
  invite: [...orgStatements.invite],
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
  tenant: [...orgStatements.tenant],
  maintenance: [...orgStatements.maintenance],
  message: [...orgStatements.message],
  payment: [...orgStatements.payment],
  invite: [...orgStatements.invite],
});

// Organization Tenant - limited read/write
export const orgTenant = organizationAC.newRole({
  organization: [],
  member: [],
  invitation: [],
  team: [],
  ac: [],
  property: ["view"],
  unit: ["view"],
  tenant: [],
  maintenance: [...orgStatements.maintenance],
  message: ["send", "receive", "view", "update", "list"],
  payment: ["pay", "view"],
  invite: ["view", "accept"],
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export const orgRoleNames = ["owner", "manager", "tenant"] as const;
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
