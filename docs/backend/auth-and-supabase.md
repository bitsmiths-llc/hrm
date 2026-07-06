## Supabase clients and auth patterns

This project uses Supabase on both the browser and server with session persistence handled by middleware. Row Level Security (RLS) is enabled by default; only use the service role key to bypass complex RLS cases, and never in the browser.

### Middleware and route protection

`src/lib/supabase/middleware.ts` refreshes the session on each navigation. Document wiring it in `src/middleware.ts` with `updateSession(request)`.

Guidelines:

- Avoid calling `supabase.from(table)` in middleware; it adds a DB call on every route change and slows the app.
- Prefer using `user_metadata` to store lightweight flags you need in middleware (e.g., role) rather than fetching from DB.
- Middleware can be used for lightweight route protection checks (e.g., deny access if no session) without redirects per app policy.

### Auth patterns

- Queries: use `authQuery()` to ensure the user is authenticated (and optionally has the right role) before executing the query handler. This keeps UI hooks clean.

```ts
// src/hooks/queries/sample.ts
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-keys';
import { authQuery } from '@/lib/client/auth-query';

export const useSample = () =>
  useQuery({
    queryKey: [QueryKeys.SAMPLE],
    queryFn: authQuery(async ({ supabase }) => {
      const { data, error } = await supabase.from('sample').select('*');
      if (error) throw new Error(error.message);
      return data;
    }),
  });
```

- Server actions: use `authActionClient` when an action must only run for logged‑in users.

```ts
// src/lib/server/safe-action.ts (concept)
export const safeActionClient = createSafeActionClient({
  defaultValidationErrorsShape: 'flattened',
  handleServerError: (error) => error.message,
});

export const authActionClient = safeActionClient.use(async ({ next }) => {
  const supabase = await createSupabaseServerClient();
  const { data: authUser, error } = await supabase.auth.getUser();
  if (error || !authUser) throw new Error('Unauthorized');
  return next({ ctx: { supabase, authUser } });
});
```

Use `authActionClient` for authenticated operations; for public server actions use `safeActionClient` directly.

### RLS and service role

- Keep RLS enabled by default.
- Only use the service role key on the server to bypass complex RLS cases where absolutely necessary.
- Never expose the service role key to the client.

## Auth baseline (BIT-7)

### Two entry points, one allowlist

Sign-in has two paths — email/password (`signInWithPassword`) and Google OAuth
(`signInWithOAuth({ provider: 'google' })`) — but a single authorization rule:
**an `employees` row must already exist for the authenticated email.** There is no
public sign-up; rows are created by an admin invite (M1.3) or the bootstrap SQL below.

- Actions live in `src/actions/auth.ts`; Zod schemas in `src/schema/auth.ts`.
- `src/app/auth/callback/route.ts` is the single OAuth/recovery code-exchange point.
  For Google it runs the **invite gate**: it looks up `employees` by email with the
  **service-role client** (`src/lib/supabase/admin.ts`) — required because a freshly
  linked Google `auth.uid()` won't match the invited row under RLS
  (`employees_select_self` keys on `id = auth.uid()`, the gate matches on `email`).
  No row ⇒ `signOut()` + redirect to `/auth/login?error=not_invited`. An `invited`
  row is advanced to `onboarding` via the `accept_onboarding()` RPC.
- The session guard lives in `src/lib/supabase/middleware.ts`: no session on a
  protected route → `/auth/login`. Public routes: `/` and everything under `/auth`.

### `accept_onboarding()` and the column guard

`guard_employee_columns()` (BIT-3) blocks every non-admin from changing
`account_status`, and a `SECURITY DEFINER` function still trips it because
`is_admin()` reads the caller's JWT. So `accept_onboarding()` (migration
`20260706134229`) sets a **transaction-local GUC** (`app.bypass_employee_guard`)
that the guard honours; plain PostgREST updates can't set it, so the guard stays
fully closed to direct client writes. The RPC only ever advances the caller's own
`invited` row (matched on the JWT email) to `onboarding`.

### Google provider setup (Supabase dashboard)

Configured once per environment in **Authentication → Providers → Google**:

1. Create an OAuth client in Google Cloud Console (Web application).
2. Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Paste the Client ID / Client Secret into the Supabase Google provider and enable it.
4. Add the app's own callback to **Authentication → URL Configuration → Redirect URLs**:
   `${NEXT_PUBLIC_APP_URL}/auth/callback` (and the localhost equivalent for dev).

### First-admin bootstrap (chicken-and-egg)

`inviteEmployee` (M1.3) needs an admin to exist, but no admin exists to invite the
first one. Seed the first admin by hand, **once**, in the Supabase SQL editor after
the operator exists in `auth.users` (added via Dashboard → Authentication → Add user,
or by signing in once with the intended admin's Google email):

```sql
insert into employees (id, email, role, account_status, activated_at)
select id, email, 'admin', 'active', now()
from auth.users
where email = 'admin@bitsmiths.studio'      -- the bootstrap admin's email
on conflict (id) do update
  set role = 'admin', account_status = 'active';
```

The `mirror_role_to_jwt` trigger (BIT-3) copies `role` into `app_metadata` on the
next token refresh — the admin must sign out and back in once so their JWT carries
`app_metadata.role = 'admin'` and `public.is_admin()` returns true.
