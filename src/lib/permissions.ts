import { defaultStatements as adminDefaultStatements } from "better-auth/plugins/admin/access";
import { createAccessControl } from "better-auth/plugins/access";

// RBAC glossary for this file:
// - Resources: user, session (from admin defaults), property, tenant, maintenance, message, payment, invite.
// - Actions: the verb arrays under each resource (e.g., "create", "update", "delete", "list", "view").
// - Permissions: a resource + action pairing (e.g., property:create, maintenance:resolve).
// - Roles: groupings of permissions; see admin, landlord, tenant below.

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

export const landlord = accessControl.newRole({
  property: ["create", "update", "delete", "list", "view"],
  tenant: ["create", "update", "delete", "list", "view"],
  maintenance: ["update", "resolve", "view", "create", "list"],
  message: ["send", "receive", "view", "update", "list"],
  payment: ["create", "update", "list", "delete"],
  invite: ["create", "view", "list", "delete", "accept"],
});

// Managers/realtors managing a landlord's properties. Same permissions as landlord; scope enforcement should happen in business logic.
export const manager = accessControl.newRole({
  property: ["create", "update", "list", "view"],
  tenant: ["create", "update", "list", "view"],
  maintenance: ["update", "resolve", "view", "create", "list"],
  message: ["send", "receive", "view", "update", "list"],
  payment: ["create", "update", "list", "view"],
  invite: ["create", "view", "list", "accept"],
});

export const tenant = accessControl.newRole({
  property: ["view"],
  maintenance: ["create", "view", "update"],
  message: ["send", "receive", "view", "update", "list"],
  payment: ["pay", "view"],
  invite: ["view", "accept"],
});

// Unverified users have no permissions; used pre-onboarding before assigning landlord/tenant.
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
