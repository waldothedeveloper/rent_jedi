# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bloom Rent** - "Rent. Get Paid." - A rental property management SaaS application.

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + PostgreSQL (Neon) + Drizzle ORM + Better Auth + Tailwind CSS + shadcn/ui

**Development Status:** Week 2 of 8-week roadmap (see README.md for full roadmap)

## **NEVER RUN DATABASE COMMANDS**

**NEVER RUN `npm run db:push`, `npm run db:generate`, `npm run db:migrate`, OR ANY OTHER DATABASE MIGRATION/PUSH COMMANDS. THE USER WILL RUN THESE MANUALLY. ONLY MAKE THE SCHEMA FILE CHANGES AND TELL THE USER WHAT COMMAND TO RUN.**

## Common Commands

```bash
# Development
npm run dev                    # Start development server

# Database (Drizzle ORM)
npm run db:push                # Push schema directly to DB (dev only)
npm run db:generate            # Generate Drizzle migrations
npm run db:migrate             # Run Drizzle migrations
npm run db:studio              # Open Drizzle Studio

# Authentication
npm run auth:generate          # Generate Better Auth schema

# E2E Testing (Playwright)
npm run test:e2e               # Run Playwright tests
npm run test:e2e:ui            # Run Playwright tests with UI
npm run test:e2e:report        # Show Playwright test report
npm run test:cleanup           # Clean up test data

# Production
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
```

## Architecture

### Server-First Pattern

- **Default to Server Components** - Only add "use client" when needed for interactivity
- **Server Actions** for all mutations (in `/src/app/actions/`)
- **API Routes** only for Better Auth handler and email sending

### Next.js Route Files

Every Next.js App Router route should include:

- **error.tsx** - Error boundary for route-level error handling
  - Must be a Client Component (`"use client"`)
  - Should use shared error component when available
  - Provide context-specific error messages

- **loading.tsx** - Loading UI displayed during async operations
  - Should be a Server Component (no "use client")
  - Mirror the actual page layout with skeleton components
  - Use `@/components/ui/skeleton` from shadcn/ui
  - Match dimensions: h-4 for labels, h-9/h-10 for inputs, h-8 for titles

**Example Structure:**

```
/route-name/
  ├── page.tsx       # Route component
  ├── error.tsx      # Error boundary
  ├── loading.tsx    # Loading state
  └── layout.tsx     # Optional layout
```

**Reference Implementation:** `/src/app/(without-navigation)/owners/properties/add-property/`

### Styling Guidelines

**ALWAYS use CSS variables from `globals.css` instead of hardcoded Tailwind colors.**

**Color Mappings:**

```typescript
// ✅ CORRECT - Use CSS variable classes
bg - background; // Instead of bg-gray-50, bg-white
bg - card; // Instead of bg-white for cards
text - foreground; // Instead of text-gray-900, text-black
text - card - foreground; // Instead of text-gray-700, text-gray-900 on cards
text - muted - foreground; // Instead of text-gray-600, text-gray-500
text - primary; // Instead of text-blue-600 for links/primary actions
border - border; // Instead of border-gray-200, border-gray-300

// ❌ WRONG - Hardcoded Tailwind colors
(bg - gray - 50, bg - white, text - gray - 900, text - blue - 600);
```

**Why CSS Variables:**

- Ensures consistent theming across light/dark modes
- Single source of truth defined in `globals.css`
- Automatic support for future theme customization

### Authentication Flow

```
Sign Up (with intent: "owner" | "tenant") → Email Verification → Dashboard Access
             ↓
    2FA Optional (TOTP + backup codes)
```

**Protected Routes:** Use `getSessionOrRedirect()` or from `/src/app/actions/auth.ts`

**Two-Tier RBAC System (Better Auth plugins):**

Global roles (`admin` plugin — platform-wide):

- `user` - Default authenticated user
- `admin` - Full user/session/platform management

Organization roles (`organization` plugin — org-scoped):

- `owner` - Full CRUD on all org resources (property, unit, maintenance, message) + org management
- `tenant` - Read-only (`view`, `list`) on all org resources

**Permissions are defined in `/src/lib/permissions.ts`.** Org resources: `property`, `unit`, `maintenance`, `message`.

### Data Hierarchy

```
Organization (created by Owner)
  └── Property
        └── Unit
              └── Tenant (invited as org member)
                    ├── Payment (with late fees)
                    └── Maintenance Request
```

### Form Pattern

1. Define Zod schema in `/src/lib/shared-auth-schema.ts`, `/src/utils/shared-schemas.ts`, or co-located with component, and make sure you use Zod +v4 API, never OLDER versions.
2. Create Server Action in `/src/app/actions/`
3. Use TanStack Form or React Hook Form for client-side state
4. Show feedback with Sonner toast notifications
5. Use DAL (Data Access Layer) functions in `/src/dal/` for DB operations

### Security: Data Access Layer (DAL) & Data Transfer Objects (DTOs)

**CRITICAL:** All data access must follow these security principles from Next.js best practices.

#### The Three DAL Rules

1. **Server-Only Execution**
   - Every DAL file MUST start with `"server only";`
   - This prevents accidental client-side imports (build will fail)
   - Only Server Actions and API routes can call DAL functions

2. **Authorization Before Data**
   - Every DAL function MUST verify the user's session
   - Check permissions BEFORE querying the database
   - Never trust URL parameters or client-provided IDs alone

3. **Return DTOs, Not Raw Data**
   - Return only the fields the current user is authorized to see
   - Never return full database rows to Server Actions
   - Create explicit return types that exclude sensitive fields

4. **Route Guards Live in `/src/lib/route-guards.ts`, Not in Layouts/Pages**
   - Authorization + redirect logic MUST be self-contained guard functions (e.g. `requireOwnerMembership()`)
   - Guards import from the DAL for data access, then handle the redirect
   - Layouts and pages call the guard function — they NEVER contain inline auth/redirect logic
   - Example: `await requireOwnerMembership()` in a layout — one line, no conditionals
   - DAL functions stay pure: query data, return DTOs — no routing side effects

#### DTO Pattern Example

```typescript
// ❌ WRONG - Returns everything from database
export async function getUserDAL(id: string) {
  const user = await db.select().from(users).where(eq(users.id, id));
  return user; // Exposes passwordHash, internalNotes, etc.
}

// ✅ CORRECT - Returns only authorized fields as DTO
type UserDTO = {
  id: string;
  name: string;
  email: string | null; // null if viewer can't see it
};

export async function getUserDAL(id: string): Promise<UserDTO | null> {
  const session = await verifySessionDAL();
  if (!session) return null;

  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) return null;

  // Authorization: can this viewer see this user's email?
  const canSeeEmail = session.user.id === id || session.user.role === "admin";

  return {
    id: user.id,
    name: user.name,
    email: canSeeEmail ? user.email : null,
  };
}
```

#### Server Action → DAL → DTO Flow

```
Client Request
     ↓
Server Action (validates input, calls DAL)
     ↓
DAL Function (authorizes, queries DB, builds DTO)
     ↓
DTO (minimal safe data returned to action)
     ↓
Server Action (may further filter before returning to client)
```

#### Security Audit Checklist

When reviewing DAL code, verify:

- [ ] File starts with `"server only";`
- [ ] Session is verified before any database query
- [ ] Permissions are checked for the specific resource
- [ ] Return type is an explicit DTO (not `typeof table.$inferSelect`)
- [ ] Sensitive fields are conditionally included based on authorization
- [ ] No raw database objects are passed to client components

#### Client Component Props

**Never pass broad objects to client components:**

```typescript
// ❌ WRONG - Exposes all user fields
<ProfileCard user={user} />

// ✅ CORRECT - Only pass needed fields
<ProfileCard name={user.name} avatarUrl={user.avatarUrl} />
```

### Zod v4 API Guidelines

**IMPORTANT:** This project uses Zod v4. Always use the v4 API, never older patterns.

**UUID validation:**

```typescript
// ✅ CORRECT - Zod v4
z.uuid();

// ❌ WRONG - Old Zod pattern, DO NOT USE
z.string().uuid();
```

**Other Zod v4 patterns:**

- Use `z.email()` instead of `z.string().email()`
- Use `z.url()` instead of `z.string().url()`
- Use `z.cuid()` instead of `z.string().cuid()`

### useEffect Guidelines

**Avoid `useEffect` for form field dependencies and state updates.** The author strongly prefers avoiding `useEffect` unless absolutely necessary.

**Preferred patterns:**

1. **Inline handlers for dependent field updates:**

   ```typescript
   <Select
     value={field.state.value}
     onValueChange={(value) => {
       field.handleChange(value);
       form.setFieldValue("dependentField", ""); // Reset dependent field
     }}
   >
   ```

2. **Extract handler functions for complex logic:**

   ```typescript
   const handleFieldChange = async (value: string) => {
     field.handleChange(value);
     form.setFieldValue("dependentField", "");
     await fetchData(value); // Async operations
   };
   ```

3. **Use refs to track state without causing re-renders:**

   ```typescript
   const lastFetchedId = useRef<string | null>(null);
   ```

**Only acceptable `useEffect` uses:**

- Initial data load from localStorage (runs once on mount with empty deps)
- Cleanup functions for event listeners
- True side effects that can't be expressed inline

**Never use `useEffect` for:**

- Form field dependencies
- Fetching data when a field changes (use inline handlers)
- Resetting fields when another field changes
- Validation triggers (use Zod schema with `onDynamic` validator)

### Database Schema Location

All schemas in `/src/db/schema/`:

- `auth-schema.ts` - User, session, account, verification, twoFactor, organization, member, invitation
- `auth-relations.ts` - Drizzle relations for auth tables
- `properties-schema.ts` - Properties owned by organizations (with propertyType, propertyStatus, usState, unitType enums)
- `units-schema.ts` - Rental units within properties (bedrooms, bathrooms, rent amounts)

**Not yet created:** `tenants-schema.ts`, `payments-schema.ts`, `maintenance-schema.ts` (invitations handled by Better Auth organization plugin)

**Schema Conventions:**

- UUID primary keys (auto-generated)
- Properties/units reference `organizationId` (not userId directly)
- Email validation: `^[^@\s]+@[^@\s]+\.[^@\s]+$`
- Phone validation: `^\+[1-9]\d{1,14}$` (E.164 format)
- Automatic `createdAt`/`updatedAt` timestamps
- Cascading deletes for referential integrity

### Email Pattern

1. Server Action calls `/src/app/api/send/route.ts`
2. API route uses Resend with React Email template from `/src/components/email-templates/`
3. Templates: `email_verification.tsx`, `password_reset.tsx`, `password_reset_confirmation.tsx`

## Key Files

**Auth Configuration:**

- `/src/lib/auth.ts` - Better Auth server config (password rules: 12-128 chars)
- `/src/lib/auth-client.ts` - Client-side auth hooks
- `/src/lib/permissions.ts` - RBAC definitions (global + org access control)
- `/src/lib/route-guards.ts` - Route guard functions (`requireOwnerMembership`)
- `/src/lib/auth-utils.ts` - Server-side role routing (`getRedirectUrlByRole`)
- `/src/lib/auth-utils-client.ts` - Client-side role routing + intent routing (`getRedirectUrlByIntent`)
- `/src/app/actions/auth.ts` - All auth Server Actions
- `/src/types/roles.ts` - Role type definitions (`GlobalRole`, `OrgRole`, `AuthorizedContext`)

**Database:**

- `/drizzle.config.ts` - Drizzle Kit configuration
- `/src/db/drizzle.ts` - Database client initialization
- `/envConfig.ts` - Environment variable loader

**DAL (Data Access Layer):**

- `/src/dal/shared-dal-helpers.ts` - Session verification (`verifySessionDAL`), membership helpers (`getUserMembership`), login redirect (`getLoginRedirectUrl`)
- `/src/dal/properties.ts` - Property data access with `verifySessionDAL()`
- `/src/dal/address-validation.ts` - Google Maps Address Validation integration

**UI Configuration:**

- `/components.json` - shadcn/ui config (New York variant, neutral colors)
- `/src/app/globals.css` - Global styles and CSS variables
- `/src/lib/utils.ts` - `cn()` function and utility regex patterns

**Shared Schemas & Utilities:**

- `/src/lib/shared-auth-schema.ts` - Auth form Zod schemas (login, signup, password reset, TOTP)
- `/src/utils/shared-schemas.ts` - Property/unit/address Zod schemas and form helpers
- `/src/utils/form-helpers.ts` - Phone normalization, property/unit type options, US states
- `/src/types/google-maps.ts` - Google Maps Address Validation API types

**Entry Points:**

- `/src/app/page.tsx` - Landing page
- `/src/app/(without-navigation)/owners/` - Protected owner dashboard
- `/src/app/(with-navigation)/rental-marketplace/` - Tenant-facing marketplace

## Directory Structure

```
/src/app/
  ├── actions/              # Server Actions (auth, properties, address-validation)
  ├── api/                  # API routes (auth handler, email sender)
  ├── (with-navigation)/    # Public routes with navigation bar
  │   ├── login/
  │   ├── signup/
  │   ├── verify-email/
  │   ├── forgot-password/
  │   ├── reset-password/
  │   ├── contact-support/
  │   └── rental-marketplace/
  └── (without-navigation)/ # Protected routes without main nav
      ├── admin/dashboard/
      ├── auth-success/     # OAuth redirect handler
      ├── owners/           # Owner dashboard
      │   ├── dashboard/
      │   ├── properties/   # Includes multi-step add-property wizard
      │   ├── maintenance/
      │   ├── payments/
      │   ├── messages/
      │   ├── account-settings/
      │   ├── billing/
      │   └── notifications/
      └── tenants/dashboard/

/src/components/
  ├── ui/                   # shadcn/ui components
  ├── email-templates/      # React Email templates
  └── [app components]      # app-sidebar, nav-main, error-component, etc.

/src/dal/                   # Data Access Layer (server-only)
/src/db/schema/             # Drizzle schemas
/src/lib/                   # Auth config and utilities
/src/types/                 # TypeScript type definitions (roles, google-maps)
/src/utils/                 # Shared schemas and form helpers
/src/hooks/                 # React hooks
/src/e2e/                   # Playwright E2E tests
```

## Environment Variables

Required variables (see `.env.local`):

```bash
DATABASE_URL=              # Neon PostgreSQL connection string
BETTER_AUTH_SECRET=        # Random secret for auth
BETTER_AUTH_URL=           # Production URL
NEXT_PUBLIC_BASE_URL=      # Base URL for client-side
GOOGLE_CLIENT_ID=          # Google OAuth
GOOGLE_CLIENT_SECRET=      # Google OAuth secret
RESEND_API_KEY=            # Resend for emails
GOOGLE_MAPS_API_KEY=       # Google Maps Address Validation
```

## Path Aliases

- `@/components` → `/src/components`
- `@/lib` → `/src/lib`
- `@/hooks` → `/src/hooks`
- `@/db` → `/src/db`
- `@/utils` → `/src/utils`
- `@/ui` → `/src/components/ui`

## Development Philosophy

From README: "stupidly simple" - Focus on core features without over-engineering. Current priority is completing Week 2 (landlord property/unit management) before moving to tenant invites and payment processing.
