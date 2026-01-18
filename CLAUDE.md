# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bloom Rent** - "Rent. Get Paid." - A rental property management SaaS application.

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + PostgreSQL (Neon) + Drizzle ORM + Better Auth + Tailwind CSS + shadcn/ui

**Development Status:** Week 2 of 8-week roadmap (see README.md for full roadmap)

## Common Commands

```bash
# Development
npm run dev                    # Start development server with Turbopack

# Database (Drizzle ORM)
npm run db:generate            # Generate migrations from schema changes
npm run db:migrate             # Run pending migrations
npm run db:push                # Push schema directly to DB (dev only)
npm run db:studio              # Open Drizzle Studio GUI

# Authentication
npm run auth:generate          # Generate Better Auth schema

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

### Authentication Flow

```
Sign Up → Email Verification → Role Assignment → Dashboard Access
             ↓
    2FA Optional (TOTP + backup codes)
```

**Protected Routes:** Use `getSessionOrRedirect()` from `/src/app/actions/auth.ts`

**Roles (RBAC):**

- `admin` - Full access
- `owner` - Manage properties, units, tenants, payments, maintenance, invites
- `manager` - Same as owner (scope enforced in business logic)
- `tenant` - View property, create maintenance requests, pay rent

### Data Hierarchy

```
User (Owner)
  └── Property
        └── Unit
              └── Tenant
                    ├── Payment (with late fees)
                    └── Maintenance Request
```

### Form Pattern

1. Define Zod schema in `/src/lib/shared-auth-schema.ts` or co-located with component, and make sure you use Zod +v4 API, never OLDER versions.
2. Create Server Action in `/src/app/actions/`
3. Use TanStack Form or React Hook Form for client-side state
4. Show feedback with Sonner toast notifications
5. Use DAL (Data Access Layer) functions in `/src/dal/` for DB operations

### Zod v4 API Guidelines

**IMPORTANT:** This project uses Zod v4. Always use the v4 API, never older patterns.

**UUID validation:**
```typescript
// ✅ CORRECT - Zod v4
z.uuid()

// ❌ WRONG - Old Zod pattern, DO NOT USE
z.string().uuid()
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

- `auth-schema.ts` - User, session, account, verification, two_factor
- `properties-schema.ts` - Properties owned by users
- `units-schema.ts` - Rental units within properties
- `tenants-schema.ts` - Tenant information
- `payments-schema.ts` - Payment records with late fee config
- `maintenance-schema.ts` - Maintenance requests
- `invites-schema.ts` - Invitation system for tenants/managers

**Schema Conventions:**

- UUID primary keys (auto-generated)
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
- `/src/lib/permissions.ts` - RBAC definitions
- `/src/app/actions/auth.ts` - All auth Server Actions

**Database:**

- `/drizzle.config.ts` - Drizzle Kit configuration
- `/src/db/drizzle.ts` - Database client initialization
- `/envConfig.ts` - Environment variable loader

**UI Configuration:**

- `/components.json` - shadcn/ui config (New York variant, neutral colors)
- `/src/app/globals.css` - Global styles and CSS variables
- `/src/lib/utils.ts` - `cn()` function and utility regex patterns

**Entry Points:**

- `/src/app/page.tsx` - Landing page
- `/src/app/owners/layout.tsx` - Protected sidebar layout
- `/src/app/owners/dashboard/page.tsx` - Owner dashboard

## Directory Structure

```
/src/app/
  ├── actions/              # Server Actions (auth, properties, etc.)
  ├── api/                  # API routes (auth handler, email sender)
  ├── owners/               # Protected owner dashboard
  │   ├── dashboard/
  │   ├── properties/
  │   ├── maintenance/
  │   ├── payments/
  │   ├── messages/
  │   ├── account-settings/
  │   ├── billing/
  │   └── notifications/
  ├── login/
  ├── signup/
  ├── verify-email/
  ├── forgot-password/
  ├── reset-password/
  └── admin/

/src/components/
  ├── ui/                   # shadcn/ui components
  ├── email-templates/      # React Email templates
  └── [app components]      # app-sidebar, nav-main, etc.

/src/db/schema/             # Drizzle schemas
/src/lib/                   # Utilities and config
/src/hooks/                 # React hooks
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
```

## Path Aliases

- `@/components` → `/src/components`
- `@/lib` → `/src/lib`
- `@/hooks` → `/src/hooks`
- `@/db` → `/src/db`

## Development Philosophy

From README: "stupidly simple" - Focus on core features without over-engineering. Current priority is completing Week 2 (landlord property/unit management) before moving to tenant invites and payment processing.
