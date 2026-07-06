import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

import { paths } from '@/constants/paths';
import Logger from '@/utils/logger';

/**
 * OAuth + recovery code-exchange endpoint.
 *
 * - Google OAuth (no `next`): exchange the code, then run the invite-only gate.
 *   The authenticated email MUST already have an `employees` row, else the user
 *   is signed out and bounced to /auth/login?error=not_invited. This gate is the
 *   whole point of Google sign-in here — Supabase will create an auth.users row
 *   for any Google account; the `employees` allowlist is what keeps it invite-only.
 * - Password recovery (`?next=/auth/reset-password`): exchange the code to
 *   establish the recovery session, then forward to the reset form. No gate —
 *   recovery is only ever for users who already exist.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  const supabase = await createSupabaseServerClient();
  if (code) await supabase.auth.exchangeCodeForSession(code);

  // Internal next-hop (recovery) flows skip the gate. Reject absolute/
  // protocol-relative values so `next` can't become an open redirect.
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(`${origin}${paths.auth.login}`);
  }

  // Invite-only gate. Uses the service-role client because a freshly-linked
  // Google auth.uid() won't match the invited row under RLS (employees_select_self
  // keys on id = auth.uid(), but the gate matches on email).
  const { data: employee } = await supabaseAdmin
    .from('employees')
    .select('account_status')
    .eq('email', user.email)
    .maybeSingle();

  if (!employee) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}${paths.auth.login}?error=not_invited`,
    );
  }

  // A Google identity signing in against an invited row counts as acceptance.
  // Best-effort: the user is authenticated and gated-in regardless, and the
  // status funnel (M1.5) still routes an 'invited' row correctly on retry.
  if (employee.account_status === 'invited') {
    const { error } = await supabase.rpc('accept_onboarding');
    if (error) Logger.error('accept_onboarding failed in auth callback', error);
  }

  return NextResponse.redirect(`${origin}${paths.employee.dashboard}`);
}
