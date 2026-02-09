# Roles & Permissions

Technical reference for Bloom Rent's two-tier RBAC system as currently implemented.

## Overview

Bloom Rent uses two separate role systems provided by Better Auth plugins:

1. **Global roles** (`admin` plugin) — platform-wide, stored on the `user.role` column
2. **Organization roles** (`organization` plugin) — scoped to an org, stored on `member.role`

Every authenticated user has exactly one global role. When a user belongs to an organization, they also have one org role within that org.
Authenticated users without an org have `null` for their org role and cannot access org-scoped resources. They are 'user' role by default, which only grants access to global resources (e.g. account settings).

## Global Roles (admin plugin)

| Role    | Description                          | Dashboard route     |
| ------- | ------------------------------------ | ------------------- |
| `user`  | Default for every authenticated user | `/owners/dashboard` |
| `admin` | Full platform management             | `/admin/dashboard`  |

**Source:** `src/lib/auth-utils.ts` (server), `src/lib/auth-utils-client.ts` (client)

The `admin` plugin ships with Better Auth and provides `user` as the default role. The `admin` role grants full user/session/platform management through the admin API endpoints.

## Organization Roles (organization plugin)

| Role     | Description                                       | Dashboard route       |
| -------- | ------------------------------------------------- | --------------------- |
| `owner`  | Landlord — manages their org's properties & units | `/owners/dashboard`   |
| `tenant` | Renter — read-only access to org resources        | `/rental-marketplace` |

**Source:** `src/lib/permissions.ts` lines 16-33, `src/lib/auth.ts` lines 47-54

The organization plugin is configured with `creatorRole: "owner"`, meaning the user who creates an organization is automatically assigned the `owner` role.

## Org Permission Matrix

The access control merges Better Auth's default org statements with custom `property` and `unit` resources.

### Default org statements (from Better Auth)

| Resource       | Available actions                    |
| -------------- | ------------------------------------ |
| `organization` | `update`, `delete`                   |
| `member`       | `create`, `update`, `delete`         |
| `invitation`   | `create`, `cancel`                   |
| `ac`           | `create`, `read`, `update`, `delete` |

### Custom resource statements (added by Bloom Rent)

| Resource   | Available actions                             |
| ---------- | --------------------------------------------- |
| `property` | `create`, `update`, `archive`, `list`, `view` |
| `unit`     | `create`, `update`, `archive`, `list`, `view` |

### Role permissions

| Resource       | Owner                                         | Tenant   |
| -------------- | --------------------------------------------- | -------- |
| `organization` | `update`                                      | _(none)_ |
| `member`       | `create`, `update`, `delete`                  | _(none)_ |
| `invitation`   | `create`, `cancel`                            | _(none)_ |
| `ac`           | `create`, `read`, `update`, `delete`          | _(none)_ |
| `property`     | `create`, `update`, `view`, `archive`         | `view`   |
| `unit`         | `create`, `update`, `archive`, `list`, `view` | `view`   |

Note: Owners intentionally lack `list` on `property` — they can only view/manage properties they own, not browse all org properties.

## Admin-Only Operations

Operations restricted to the global `admin` role (checked via `session.user.role === "admin"`):

- **Organization deletion** — Deletes an org and all its units, properties, members, and invitations in a single transaction. Located in `src/dal/organizations.ts` (`deleteOrganizationDAL`).

## Signup Intent Routing

New users sign up with an `intent` field (`"owner"` or `"tenant"`) that determines their initial redirect after email verification. This is separate from role assignment.

| Intent   | Redirect destination  |
| -------- | --------------------- |
| `owner`  | `/owners/properties`  |
| `tenant` | `/rental-marketplace` |

**Source:** `src/lib/auth-utils-client.ts` (`getRedirectUrlByIntent`)

## Type Definitions

```typescript
type GlobalRole = "user" | "admin";
type OrgRole = "owner" | "tenant";

// Combined type for DAL functions that need full context
type AuthorizedContext = {
  userId: string;
  globalRole: GlobalRole;
  orgRole: OrgRole | null;
  organizationId: string | null;
};

// Temporary combined type during migration
type Roles = "admin" | OrgRole; // "user" excluded — not permission-bearing
```

**Source:** `src/types/roles.ts`

## Key Source Files

| File                           | Purpose                                                           |
| ------------------------------ | ----------------------------------------------------------------- |
| `src/lib/permissions.ts`       | Org access control definitions, role constructors, type guards    |
| `src/types/roles.ts`           | TypeScript type definitions for all roles                         |
| `src/lib/auth.ts`              | Better Auth server config — wires plugins, roles, `creatorRole`   |
| `src/lib/auth-utils.ts`        | Server-side `getRedirectUrlByRole()`                              |
| `src/lib/auth-utils-client.ts` | Client-side `getRedirectUrlByRole()` + `getRedirectUrlByIntent()` |
| `src/dal/organizations.ts`     | Admin-only org deletion DAL                                       |
