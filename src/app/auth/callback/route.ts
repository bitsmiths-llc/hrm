import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

/**
 * Code-exchange endpoint for the password-recovery link. `resetPasswordForEmail`
 * routes here with `?next=/auth/reset-password`; we exchange the PKCE code to
 * establish the recovery session, then forward to the reset form.
 *
 * Google OAuth is deferred (invite-only app). When it's added, this is also
 * where the OAuth invite-only gate belongs — exchange the code, then require a
 * matching `employees` row before letting the session stand.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = appConfig.appUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  // No code, or a code that won't exchange (expired/reused/tampered), means no
  // recovery session can be established. Forwarding to the reset form anyway
  // would land the user on a page whose only action fails; send them to sign in
  // instead, where "Forgot password?" can mint a fresh link.
  if (!code) {
    return NextResponse.redirect(`${origin}${paths.auth.login}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}${paths.auth.login}`);
  }

  // Only follow internal relative paths — never an absolute/protocol-relative
  // value that could become an open redirect.
  const destination =
    next && next.startsWith('/') && !next.startsWith('//')
      ? next
      : paths.auth.login;

  return NextResponse.redirect(`${origin}${destination}`);
}
