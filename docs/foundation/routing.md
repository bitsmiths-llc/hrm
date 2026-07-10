## Centralized routing with `paths`

All navigable routes in the application are defined in a single object inside `src/constants/paths.ts`.

```ts
// src/constants/paths.ts
export const paths = {
  home: '/',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  dashboard: '/dashboard',
  settings: '/settings',
  // add new routes here as the app grows
} as const;
```

### Why this exists

1. **Single source of truth** — every route string lives in one place. If a page URL changes (e.g., `/settings` moves to `/account/settings`), you update one line instead of hunting through dozens of files.
2. **Trackability** — you can "Find usages" on any `paths.*` key to see every place that links to or redirects to that route. Hard-coded strings are invisible to this workflow.
3. **Refactor safety** — renaming or removing a key causes a TypeScript compile error everywhere it was used, so broken links surface at build time rather than in production.
4. **Readability** — `paths.auth.login` communicates intent far better than a raw `'/auth/login'` string.

### Rules

- **Always** use `paths.*` for every route reference — `router.push`, `<Link href>`, `redirect()`, `window.location`, `<a href>`, and any other navigation API.
- **Never** hard-code a route string outside of `paths.ts`.
- When adding a new page, add its route to `paths` **first**, then reference that key.
- Group related routes under nested objects (e.g., `paths.auth.login`, `paths.auth.register`).

### Usage examples

**`<Link>` navigation**

```tsx
import Link from 'next/link';
import { paths } from '@/constants/paths';

<Link href={paths.auth.login}>Sign in</Link>;
```

**Programmatic navigation with `useRouter`**

```tsx
import { useRouter } from 'next/navigation';
import { paths } from '@/constants/paths';

const router = useRouter();

function handleSuccess() {
  router.push(paths.dashboard);
}
```

**Server-side redirect**

```ts
import { redirect } from 'next/navigation';
import { paths } from '@/constants/paths';

export default async function ProtectedPage() {
  const user = await getUser();
  if (!user) redirect(paths.auth.login);
  // ...
}
```

**Dynamic routes**

For routes that include a dynamic segment, define them as functions:

```ts
export const paths = {
  // ...
  listings: {
    list: '/listings',
    detail: (id: string) => `/listings/${id}`,
    edit: (id: string) => `/listings/${id}/edit`,
  },
} as const;
```

Then use them the same way:

```tsx
<Link href={paths.listings.detail(listing.id)}>View listing</Link>;

router.push(paths.listings.edit(listing.id));
```

### Common mistakes

| Mistake                                     | Fix                                                    |
| ------------------------------------------- | ------------------------------------------------------ |
| `router.push('/dashboard')`                 | `router.push(paths.dashboard)`                         |
| `<Link href="/auth/login">`                 | `<Link href={paths.auth.login}>`                       |
| `window.location.href = '/settings'`        | `window.location.href = paths.settings`                |
| Forgetting to add a new route to `paths.ts` | Add the route to `paths` first, then reference the key |

### Extending `paths`

When you create a new page or feature:

1. Add the route(s) to `src/constants/paths.ts`.
2. Use the key in your page, layout, links, and redirects.
3. If the route needs a dynamic segment, define it as a function that returns the full path string.
