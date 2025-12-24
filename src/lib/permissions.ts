import { defaultStatements as adminDefaultStatements } from "better-auth/plugins/admin/access";
import { createAccessControl } from "better-auth/plugins/access";

// RBAC glossary for this file:
// - Resources: user, session (from admin defaults), property, tenant, maintenance, message, payment, invite.
// - Actions: the verb arrays under each resource (e.g., "create", "update", "delete", "list", "view").
// - Permissions: a resource + action pairing (e.g., property:create, maintenance:resolve).
// - Roles: groupings of permissions; see admin, owner, tenant below.

const statement = {
  ...adminDefaultStatements,
  property: ["create", "update", "delete", "list", "view"],
  tenant: ["create", "update", "delete", "list", "view"],
  maintenance: ["create", "update", "resolve", "view", "list"],
  message: ["send", "receive", "view", "update", "delete", "list"],
  payment: ["create", "update", "list", "delete", "pay", "view"],
  invite: ["create", "view", "delete", "list", "accept"],
} as const;

export const accessControl = createAccessControl(statement);

export const roleNames = [
  "admin",
  "owner",
  "tenant",
  "manager",
  "unverifiedUser",
] as const;

export type RoleName = (typeof roleNames)[number];

export const isRoleName = (
  value: string | null | undefined
): value is RoleName =>
  typeof value === "string" && roleNames.includes(value as RoleName);

export const admin = accessControl.newRole({
  user: [...statement.user],
  session: [...statement.session],
  property: [...statement.property],
  tenant: [...statement.tenant],
  maintenance: [...statement.maintenance],
  message: [...statement.message],
  payment: [...statement.payment],
  invite: [...statement.invite],
});

export const owner = accessControl.newRole({
  property: [...statement.property],
  tenant: [...statement.tenant],
  maintenance: [...statement.maintenance],
  message: [...statement.message],
  payment: [...statement.payment],
  invite: [...statement.invite],
});

// Managers/realtors managing a owner's properties. Same permissions as owner; scope enforcement should happen in business logic.
export const manager = accessControl.newRole({
  property: [...statement.property],
  tenant: [...statement.tenant],
  maintenance: [...statement.maintenance],
  message: [...statement.message],
  payment: [...statement.payment],
  invite: [...statement.invite],
});

export const tenant = accessControl.newRole({
  property: ["view"],
  maintenance: [...statement.maintenance],
  message: ["send", "receive", "view", "update", "list"],
  payment: ["pay", "view"],
  invite: ["view", "accept"],
});

// Unverified users have no permissions; used pre-onboarding before assigning owner/tenant.
export const unverifiedUser = accessControl.newRole({
  user: [],
  session: [],
  property: [],
  tenant: [],
  maintenance: [],
  message: [],
  payment: [],
  invite: [],
});
