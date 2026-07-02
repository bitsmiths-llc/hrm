## Loading, empty, and error states

Every async UI surface must handle all three explicitly — never leave one implicit.

### Loading

- Use `<Skeleton />` from `@/components/ui/skeleton`, shaped to approximate the real
  content's dimensions. Never render literal "Loading..." text.
- Buttons use the `isLoading` prop bound to the real pending state (form submission,
  mutation, action) — never swap the button's text for "Loading...".

```tsx
if (isLoading) return <Skeleton className="h-32 w-full rounded-xl" />;
```

### Empty

- Every list or data view renders an explicit empty state — never `return null` or an
  empty container when there's no data.

```tsx
if (!items.length) {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <p>No items yet.</p>
    </div>
  );
}
```

### Error

- `toast.error()` for failures, `<FormMessage />` for field-level form errors, an
  `Alert`-style component for persistent/blocking errors.
- `toast.info()` for informational nudges (expiry warnings, etc.) — this repo doesn't
  use `toast.warning()`; it reads as visually ambiguous.
- Never expose a raw server/database error message to the user — show a user-friendly
  string. Never silently swallow an error without at least logging it
  (`src/utils/logger.ts`).
- Every `useAction` result must be wired to `result.serverError` → `toast.error()` (or
  the shared `onError` from `src/lib/show-error-toast.ts`).

```tsx
useEffect(() => {
  if (result.serverError) toast.error(result.serverError);
}, [result.serverError]);
```
