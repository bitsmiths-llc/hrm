## React Query and server writes

- Query hooks live in `src/hooks/queries/*`, mutation hooks in
  `src/hooks/mutations/*`, next-safe-action hooks in `src/hooks/actions/*`. Never
  fetch server data inline in a component with an ad-hoc `useEffect`.
- Query keys come from the centralized `QueryKeys` enum in
  `src/constants/query-keys.ts` — never a hardcoded string literal. Add a new entry to
  the enum for a new entity instead of inlining a new string key.
- For parameterized queries, use array keys: `[QueryKeys.ENTITY, id, filters]`.
- Invalidate every query key you fetched with, on every successful write that affects
  it: `queryClient.invalidateQueries({ queryKey: [QueryKeys.ENTITY] })`.
- Two write patterns, pick by what the server code is:
  - **`useAction`** (`next-safe-action/hooks`) for Next.js Server Actions built with
    `safeActionClient` — wire the shared `onError` from `src/lib/show-error-toast.ts`,
    and handle `result.serverError` with `toast.error()`.
  - **`useMutation`** (`@tanstack/react-query`) for plain server functions/endpoints
    that return `{ data, error }` — check `res.error` in `onSuccess` and
    `toast.error(res.error)` if present.
- See `docs/data/react-query.md` and `docs/data/mutations-and-actions.md` for full
  examples of both patterns, and `docs/backend/auth-and-supabase.md` for the
  `authQuery` wrapper used by authenticated query hooks.

```tsx
<Button
  onClick={() => createItemAction.execute({ name: 'New' })}
  isLoading={createItemAction.isPending}
>
  Create
</Button>
```
