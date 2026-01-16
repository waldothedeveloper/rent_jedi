# React Best Practices Audit - Bloom Rent

**Date:** January 15, 2026
**Overall Grade:** A- (Excellent)
**Files Analyzed:** 102+ components across the codebase

---

## Executive Summary

This codebase demonstrates strong adherence to modern React/Next.js best practices. The issues identified are minor optimizations rather than fundamental problems. The server-first architecture, form patterns, and error handling are exemplary.

---

## Priority 1: Quick Wins

### 1. Index-Based Key in Error List

**File:** `src/components/ui/field.tsx:215`

**Current Code:**

```tsx
{
  uniqueErrors.map(
    (error, index) => error?.message && <li key={index}>{error.message}</li>
  );
}
```

**Recommended Fix:**

```tsx
{
  uniqueErrors.map(
    (error) => error?.message && <li key={error.message}>{error.message}</li>
  );
}
```

**React Best Practice:** [Keys should be stable, predictable, and unique](https://react.dev/learn/rendering-lists#rules-of-keys)

> When you use array indices as keys, React has no way to distinguish between items that have been added, removed, or reordered. This can lead to subtle bugs where component state gets associated with the wrong item.

**Why This Matters:**

- If validation errors change order (e.g., "Email required" → "Password required"), React may not correctly identify which `<li>` changed
- Using `error.message` as the key ensures React correctly tracks each unique error
- Prevents unnecessary DOM operations and potential state bugs

**Effort:** 5 minutes
**Impact:** Prevents subtle re-render bugs in form validation

---

## Priority 2: Performance Optimizations

### 2. Missing Code Splitting for Heavy Modals

**File:** `src/app/(without-navigation)/owners/account-settings/two-factor-dialog.tsx`

**Issue:** The `react-qr-code` library is bundled in the main JavaScript, even for users who never enable 2FA.

**Current Implementation:**

```tsx
import TwoFactorDialog from "./two-factor-dialog";
```

**Recommended Fix:**

```tsx
import dynamic from "next/dynamic";

const TwoFactorDialog = dynamic(() => import("./two-factor-dialog"), {
  loading: () => <Button disabled>Loading security settings...</Button>,
  ssr: false, // QR code generation needs browser APIs
});
```

**React Best Practice:** [Code Splitting](https://react.dev/reference/react/lazy)

> Code-splitting your app can help you "lazy-load" just the things that are currently needed by the user, which can dramatically improve the performance of your app. While you haven't reduced the overall amount of code in your app, you've avoided loading code that the user may never need.

**Why This Matters:**

- The QR code library adds ~15-20KB to the bundle
- Most users access 2FA settings rarely (if ever)
- Lazy loading defers this cost until the feature is actually used
- Improves initial page load time for all users

**Effort:** 15 minutes
**Impact:** Reduced initial bundle size for all users

---

### 3. Missing React.memo on List Item Components

**Files:**

- `src/app/(without-navigation)/owners/properties/list-properties.tsx`
- `src/app/(without-navigation)/owners/tenants/tenants-list.tsx`

**Issue:** List items re-render when parent state changes (sorting, filtering, search input), even if the individual item's props haven't changed.

**Current Pattern:**

```tsx
// Property items render directly in map
{
  properties.map((property) => (
    <div key={property.id}>{/* Property card content */}</div>
  ));
}
```

**Recommended Fix:**

```tsx
// Extract to memoized component
const PropertyCard = React.memo(function PropertyCard({
  property,
}: {
  property: Property;
}) {
  return <div>{/* Property card content */}</div>;
});

// In parent component
{
  properties.map((property) => (
    <PropertyCard key={property.id} property={property} />
  ));
}
```

**React Best Practice:** [Skipping re-rendering when props are unchanged](https://react.dev/reference/react/memo)

> `memo` lets you skip re-rendering a component when its props are unchanged. Wrap a component in `memo` to get a memoized version. This memoized version will usually not be re-rendered when its parent is re-rendered as long as its props have not changed.

**Why This Matters:**

- When a user types in a search field, the parent re-renders
- Without memo, ALL property cards re-render (even unchanged ones)
- With 20+ properties, this creates noticeable UI lag
- React.memo makes rendering cost proportional to actual changes

**Effort:** 30 minutes
**Impact:** Smoother UI with many list items

---

### 4. Missing useCallback for Expensive Event Handlers

**Files:**

- `src/app/(without-navigation)/owners/tenants/add-tenant/unit-selection/form.tsx`
- `src/app/(without-navigation)/owners/properties/details/multi-unit-details.tsx`

**Issue:** Handler functions that trigger async operations are recreated on every render, which can cause unnecessary child component updates.

**Current Pattern:**

```tsx
const handlePropertyChange = async (propertyId: string) => {
  form.setFieldValue("unitId", "");
  setIsLoadingUnits(true);
  const result = await getAvailableUnitsByProperty(propertyId);
  setAvailableUnits(result.units);
  setIsLoadingUnits(false);
};
```

**Recommended Fix:**

```tsx
const handlePropertyChange = useCallback(
  async (propertyId: string) => {
    form.setFieldValue("unitId", "");
    setIsLoadingUnits(true);
    const result = await getAvailableUnitsByProperty(propertyId);
    setAvailableUnits(result.units);
    setIsLoadingUnits(false);
  },
  [form]
); // Include stable dependencies
```

**React Best Practice:** [useCallback](https://react.dev/reference/react/useCallback)

> `useCallback` is a React Hook that lets you cache a function definition between re-renders. On the initial render, useCallback returns the function you passed. On subsequent renders, it will return the already stored function from the last render (if dependencies haven't changed).

**Why This Matters:**

- If `handlePropertyChange` is passed to a child component, a new function reference triggers child re-renders
- Combined with React.memo, useCallback prevents unnecessary updates
- Particularly important for handlers passed to Select/Dropdown components

**Effort:** 20 minutes
**Impact:** Prevents cascading re-renders in forms

---

## Priority 3: Future Considerations

### 5. Virtualization for Large Lists

**When to Implement:** If properties/tenants lists exceed 50+ items

**Current State:** Lists are small enough that virtualization is unnecessary overhead.

**Future Solution:**

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualizedPropertyList({ properties }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: properties.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Approximate card height
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <PropertyCard
            key={properties[virtualItem.index].id}
            property={properties[virtualItem.index]}
            style={{
              position: "absolute",
              top: virtualItem.start,
              height: virtualItem.size,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

**React Best Practice:** [Windowing/Virtualization](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)

> For very long lists (hundreds or thousands of items), rendering all items at once can be slow. "Windowing" or "virtualization" renders only the items visible in the viewport, dramatically improving performance.

**Why This Matters:**

- DOM nodes are expensive to create and maintain
- A list of 500 properties creates 500+ DOM elements
- Virtualization keeps DOM size constant (~10-20 visible items)
- Only implement when you have evidence of performance issues

**Effort:** 2-4 hours
**Impact:** Essential for large datasets, overkill for small ones

---

### 6. Consider useMemo for Derived Data

**Applicable Files:** Components that compute filtered/sorted lists

**Pattern to Watch For:**

```tsx
// This runs on every render
const filteredProperties = properties.filter((p) =>
  p.name.toLowerCase().includes(search.toLowerCase())
);
```

**Optimized Pattern:**

```tsx
const filteredProperties = useMemo(
  () =>
    properties.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    ),
  [properties, search]
);
```

**React Best Practice:** [useMemo](https://react.dev/reference/react/useMemo)

> `useMemo` is a React Hook that lets you cache the result of a calculation between re-renders. This is useful when you have expensive calculations that don't need to run on every render.

**When to Apply:**

- Filtering/sorting lists with 50+ items
- Complex transformations (grouping, aggregating)
- Data that feeds into child components

**Effort:** 10 minutes per instance
**Impact:** Reduces CPU work on re-renders

---

## What's Already Excellent ✓

### Server-First Architecture

**Files:** All route `page.tsx` files

**Best Practice:** [React Server Components](https://react.dev/reference/rsc/server-components)

> Server Components allow components to be rendered on the server, reducing JavaScript sent to the client. This improves initial load time and enables direct database/filesystem access.

**Your Implementation:**

- Page components are Server Components by default
- Data fetching happens on the server in `page.tsx`
- Only interactive parts use "use client"

✅ **Exemplary implementation**

---

### Minimal "use client" Usage

**Files:** ~15 files with "use client" out of 100+

**Best Practice:** [When to use Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)

> Start with Server Components. Only add "use client" when you need interactivity (useState, useEffect, event handlers, browser APIs).

**Your Implementation:**

- "use client" only appears in form components, interactive navigation, and components requiring hooks
- No unnecessary client components

✅ **Correct boundary placement**

---

### No useEffect Anti-Patterns

**Files:** All form components

**Best Practice:** [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

> Effects are an escape hatch from the React paradigm. Don't use Effects to handle user events or transform data for rendering. These should be done in event handlers or during render.

**Anti-patterns NOT found in codebase:**

- ❌ useEffect to fetch data when a field changes (use event handlers instead)
- ❌ useEffect to reset dependent fields (reset inline in onChange)
- ❌ useEffect to derive state from props (compute during render)

**Your Implementation (correct):**

```tsx
// From unit-selection/form.tsx - inline handler, NOT useEffect
<Select
  onValueChange={(value) => {
    field.handleChange(value);
    handlePropertyChange(value); // Triggers fetch inline
  }}
>
```

✅ **Follows CLAUDE.md guidelines perfectly**

---

### Consistent Form Patterns

**Files:** All `*-form.tsx` files

**Best Practice:** [Form validation with Zod](https://zod.dev/) + [TanStack Form](https://tanstack.com/form/latest)

> Define schemas once, validate on client and server. This ensures consistency and reduces duplication.

**Your Pattern:**

1. Schema defined in `shared-schemas.ts` or co-located
2. TanStack Form with `validators: { onSubmit: schema, onDynamic: schema }`
3. Server action re-validates with same schema
4. Sonner toast for feedback

✅ **Production-grade form architecture**

---

### Error Boundaries Throughout

**Files:** Every route has `error.tsx`

**Best Practice:** [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

> Error boundaries catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI.

**Your Implementation:**

- Route-level `error.tsx` files catch all errors in that segment
- Reusable `ErrorComponent` with customizable messages
- Both "Start Over" and "Contact Support" options

✅ **Comprehensive error recovery**

---

### Loading States Match Layouts

**Files:** Every route has `loading.tsx`

**Best Practice:** [Suspense for Data Fetching](https://react.dev/reference/react/Suspense)

> Show a fallback while content is loading. The fallback should match the expected layout to prevent layout shift.

**Your Implementation:**

```tsx
// loading.tsx mirrors actual form layout
<Skeleton className="h-4 w-32" />   // Label
<Skeleton className="h-9 w-full" /> // Input
<Skeleton className="h-10 w-full" /> // Button
```

✅ **Zero layout shift during loading**

---

### Type-Safe Return Types

**Files:** All DAL functions in `src/dal/`

**Best Practice:** [Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

> Use discriminated unions for operations that can succeed or fail. This forces callers to handle both cases.

**Your Implementation:**

```tsx
type CreateProperty =
  | { success: true; data: Property }
  | { success: false; message: string };

// Caller must check success before accessing data
if (result.success) {
  // TypeScript knows result.data exists here
}
```

✅ **Type-safe error handling**

---

### React.cache() for Request Deduplication

**Files:** `src/dal/properties.ts`, `src/dal/tenants.ts`

**Best Practice:** [React cache()](https://react.dev/reference/react/cache)

> `cache` lets you cache the result of a data fetch or computation. If you call the same function with the same arguments during a single request, the cached result is returned.

**Your Implementation:**

```tsx
export const verifySessionDAL = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
});
```

✅ **Prevents duplicate auth checks per request**

---

## Verification Checklist

After implementing the recommended fixes:

- [ ] Run `npm run build` - ensure no type errors
- [ ] Run `npm run lint` - ensure no linting issues
- [ ] Test 2FA flow - verify lazy loading works correctly
- [ ] Profile with React DevTools Profiler - confirm reduced re-renders in lists
- [ ] Check bundle size with `npm run build` output - verify code splitting effect

---

## Summary Table

| Issue                    | Priority | Effort  | Best Practice             |
| ------------------------ | -------- | ------- | ------------------------- |
| Index key in field.tsx   | High     | 5 min   | Stable, unique keys       |
| Lazy load 2FA dialog     | Medium   | 15 min  | Code splitting            |
| React.memo on list items | Medium   | 30 min  | Skip unchanged re-renders |
| useCallback for handlers | Low      | 20 min  | Memoize callbacks         |
| Virtualization           | Future   | 2-4 hrs | Windowing for large lists |
| useMemo for derived data | Future   | 10 min  | Cache calculations        |

---

_Generated by React Best Practices Audit_
