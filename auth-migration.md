# Migration Plan: Admin Plugin → Organization Plugin

## Why This Migration

1. Role assignment at signup is fragile — `databaseHooks.user.create.before` guesses owner/tenant by checking invites
2. Global `user.role` can't express a person being both a landlord and tenant in different orgs
3. Every DAL function manually checks `ownerId === session.user.id` — tedious and error-prone
4. The invite system is entirely custom when Better Auth has a built-in one

## PR Strategy: 5 Incremental PRs

### PR 1: Schema + Plugin Foundation + Permissions

**Files modified (7):**ß

- `src/lib/auth.ts` — Add `organization()` plugin, keep `adminPlugin` for global admin, remove `databaseHooks.user.create.before`
- `src/lib/auth-client.ts` — Add `organizationClient` alongside `adminClient`
- `src/db/schema/auth-schema.ts` — Add `organization`, `member`, `invitation` tables; add `activeOrganizationId` to `session`
- `src/db/schema/properties-schema.ts` — Add `organizationId` FK column + index, change unique constraint
- `src/db/schema/tenants-schema.ts` — Add `organizationId` FK column + index
- `src/lib/permissions.ts` — Rewrite: import from `better-auth/plugins/organization/access`, merge `defaultStatements` with custom resources, define org roles (owner/manager/tenant)
- `src/types/roles.ts` — Add `OrgRole` type

**Commands:** `npm run auth:generate && npm run db:push`
**DB wipe required** (no prod data)

### PR 2: Signup Simplification + Onboarding

**Delete:**

- `src/app/(with-navigation)/signup/role/` directory

**Modify:**

- `src/app/(with-navigation)/signup/signup-form.tsx` — Remove `role`/`token` props, remove role-conditional UI, remove `acceptTenantInviteWithSignup`
- `src/lib/shared-auth-schema.ts` — Remove `role` from `signUpSchema`, remove `tenantInviteSignupSchema`/`tenantInviteLoginSchema`
- `src/app/app-navigation-menu.tsx` — Change signup URL from `/signup/role` to `/signup`
- `src/app/actions/auth.ts` — Remove role handling from `signUpAction`/`loginAction`, replace `getRedirectUrlByRole()` with org-aware redirect
- `src/lib/auth-utils.ts` — Replace `getRedirectUrlByRole()` with `getPostLoginRedirect()` (checks active org + member role)
- `src/app/(without-navigation)/auth-success/page.tsx` — Use `getPostLoginRedirect()`

**Create:**

- `src/app/(without-navigation)/onboarding/page.tsx` + `loading.tsx` + `error.tsx` — Post-signup flow: "I'm a landlord" (create org) or "I have an invitation"

### PR 3: DAL Migration

All DAL files switch from `ownerId` scoping to `organizationId` scoping:

- `src/dal/properties.ts` — Replace `eq(property.ownerId, session.user.id)` with `eq(property.organizationId, activeOrgId)` (~8 locations). Replace `auth.api.userHasPermission()` with `auth.api.hasPermission()`. `createPropertyDAL` sets `organizationId` from active org.
- `src/dal/tenants.ts` — Same pattern (~6 locations). `verifyUnitOwnershipForTenant` checks `property.organizationId`.
- `src/dal/invites.ts` — Thin wrappers around org plugin APIs. Most custom functions replaced.
- `src/dal/address-validation.ts` — Replace `session.user.role` check with org permission check

### PR 4: Invite System Migration

- `src/lib/auth.ts` — Configure `sendInvitationEmail` and `organizationHooks.afterAcceptInvitation` (links tenant record to user)
- `src/components/email-templates/org_invitation.tsx` — New email template for org invitations
- `src/app/actions/invites.ts` — Simplify: delegate to `auth.api.createInvitation()`, `auth.api.acceptInvitation()`, etc.
- `src/db/schema/invites-schema.ts` — Deprecate/remove custom `invite` table

### PR 5: Navigation + Cleanup

- `src/app/(without-navigation)/owners/layout.tsx` — Add org guard: no active org → onboarding, tenant role → tenant dashboard
- `src/components/app-sidebar.tsx` — Add org switcher dropdown for multi-org users
- Remove dead code: unused role types, old invite functions, commented-out databaseHooks

## Key Decisions

| Decision             | Choice                              | Rationale                                                                 |
| -------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| Keep admin plugin?   | Yes, for global site admin          | Site admin who can manage all orgs is still needed                        |
| Keep `user.role`?    | Yes, but only `"admin"` or `"user"` | Business roles move to `member.role`                                      |
| URL structure        | Session-based (no org in URL)       | Simple; landlords typically have 1 org                                    |
| Keep `tenant` table? | Yes                                 | Business data (lease, unit, contact) doesn't belong in org `member` table |
| Custom invite table? | Remove in PR 4                      | Org plugin handles auth side; business data stays in `tenant` table       |

## Verification Plan

1. Auth config: `npm run auth:generate` + `npm run db:push` succeed
2. Signup: New user → onboarding page (no role selection)
3. Org creation: User creates org → becomes org owner → can add properties
4. Property CRUD: Properties created/listed by org, not by userId
5. Tenant invite: Owner invites via org invitation → tenant signs up → accepts → tenant role in org
6. Permissions: Tenant cannot create properties. Owner/manager can.
7. Multi-org: Same user can be owner in Org A and tenant in Org B
8. Build: `npm run build` passes with no type errors
