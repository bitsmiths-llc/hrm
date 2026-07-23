## Server vs client components

- Default to React Server Components. Add `"use client"` only when the component
  truly needs browser APIs, event handlers, or React state/effects — never "because
  it's easier."
- Page-level data fetching belongs in the RSC page component (`async function
Page()`), not in a client hook triggered on mount.
- Keep client-only logic in leaf components so `"use client"` doesn't pull an entire
  subtree into the client bundle.

```tsx
// ✅ Server component for data-driven page
export default async function EmployeesPage() {
  const supabase = await createSupabaseServerClient();
  const initialData = await getEmployees(supabase);
  return <EmployeesClient initialData={initialData} />;
}

// ✅ Client component only for interactivity
('use client');
export function EmployeesClient({ initialData }: { initialData: Employee[] }) {
  const { data } = useEmployees(initialData);
  return <EmployeeTable data={data} />;
}
```
