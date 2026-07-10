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

### What's implemented

Email/password only, matching the invite-only model (no public sign-up). Google
OAuth is **deferred** — see below.

- Actions in `src/actions/auth.ts`, Zod schemas in `src/schema/auth.ts`:
  `signInWithPassword`, `requestPasswordReset`, `updatePassword`, `signOut`.
- Password reset round-trips through `src/app/auth/callback/route.ts`:
  `resetPasswordForEmail` sends the link to `/auth/callback?next=/auth/reset-password`;
  the route exchanges the PKCE code (establishing the recovery session), then forwards
  to the reset form. Recovery/reset responses are uniform to avoid email enumeration.
- The session guard lives in `src/lib/supabase/middleware.ts`: no session on a
  protected route → `/auth/login`. Public routes: `/` and everything under `/auth`.

### Google OAuth — deferred

Left out for now (invite-only app; may be added later). The wiring point is
`src/app/auth/callback/route.ts`: on an OAuth sign-in, exchange the code, then run an
**invite gate** — look up `employees` by email with the service-role client
(`src/lib/supabase/admin.ts`, needed because a freshly linked Google `auth.uid()`
won't match the invited row under RLS) and, if no row exists, `signOut()` + bounce to
`/auth/login?error=not_invited`. That gate is the whole point of OAuth in an
invite-only app. Enabling it also needs the Google provider configured in the
Supabase dashboard (Authentication → Providers → Google) and
`${NEXT_PUBLIC_APP_URL}/auth/callback` added under Authentication → URL Configuration.

### `accept_onboarding()` and the column guard

Migration `20260706134229` adds `accept_onboarding()` — the invited → onboarding
self-transition an accepting user needs. `guard_employee_columns()` (BIT-3) blocks
every non-admin from changing `account_status`, and a `SECURITY DEFINER` function
still trips it because `is_admin()` reads the caller's JWT. So the RPC sets a
**transaction-local GUC** (`app.bypass_employee_guard`) that the guard honours; plain
PostgREST updates can't set it, so the guard stays fully closed to direct client
writes. The RPC only ever advances the caller's own `invited` row (matched on the JWT
email). It currently has **no app caller** — it's the transition mechanism for
invite-acceptance (M1.3) and the deferred OAuth gate above.

### First-admin bootstrap (chicken-and-egg)

`inviteEmployee` (M1.3) needs an admin to exist, but no admin exists to invite the
first one. Seed the first admin by hand, **once**, in the Supabase SQL editor after
the operator exists in `auth.users` (add them via Dashboard → Authentication → Add
user):

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
