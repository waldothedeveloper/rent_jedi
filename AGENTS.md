# Repository Guidelines

## Project Structure & Module Organization

- `src/app/` — App Router pages, layouts, and **server actions** (mutations live in `src/app/actions/`).
- `src/components/` — UI components (shadcn/Radix).
- `src/lib/` — Auth setup, utilities, shared schemas.
- `src/dal/` — Data access layer (Drizzle queries).
- `src/db/` — DB client + schema definitions.
- `src/e2e/` — Playwright tests and helpers.
- `public/` — Static assets.

## Architecture & Patterns

- **Server-first:** default to Server Components; add `"use client"` only when needed.
- **Mutations:** use Server Actions; **API routes** only for Better Auth handler + email sending.
- **Route files:** each route should include `error.tsx` (client) and `loading.tsx` (server) with skeletons. See `src/app/(without-navigation)/owners/properties/add-property/`.

## Build, Test, and Development Commands

- `npm run dev` — Start dev server.
- `npm run build` / `npm run start` — Production build + serve.
- `npm run lint` — ESLint (Next core-web-vitals + TS).
- `npm run test:e2e` / `test:e2e:ui` / `test:e2e:report` — Playwright runs.

## Coding Style & Naming Conventions

- TypeScript + React. Use semicolons and 2-space indentation.
- Components: `PascalCase`; hooks: `use*`; variables/functions: `camelCase`.
- Route folders under `src/app/` are kebab-case.
- **Styling:** use CSS variables from `globals.css` (e.g., `bg-background`, `text-foreground`, `border-border`). Avoid hardcoded Tailwind colors.

## Forms, Validation, and Effects

- Pattern: Zod schema → Server Action → TanStack Form or React Hook Form → Sonner toasts → DAL in `src/dal/`.
- **Zod v4 only:** use `z.email()`, `z.url()`, `z.uuid()` (never `z.string().email()`/`.uuid()`).
- **Avoid `useEffect`** for form dependencies; prefer inline handlers. Only use for one-time localStorage load or cleanup.

## Testing Guidelines

- Playwright E2E tests in `src/e2e` (`*.spec.ts`). Focus on critical flows; use semantic selectors (`getByRole`, `getByLabel`).

## Commit & Pull Request Guidelines

- Commits are short, descriptive sentences (no enforced Conventional Commits).
- PRs: clear summary, linked issues when relevant, and screenshots for UI changes.

## Security & Configuration Tips

- Env vars live in `.env.local` (e.g., `DATABASE_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`). Never commit secrets.
- Path aliases: `@/components`, `@/lib`, `@/hooks`, `@/db`.
