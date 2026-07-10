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

  const supabase = await createSupabaseServerClient();
  if (code) await supabase.auth.exchangeCodeForSession(code);

  // Only follow internal relative paths — never an absolute/protocol-relative
  // value that could become an open redirect.
  const destination =
    next && next.startsWith('/') && !next.startsWith('//')
      ? next
      : paths.auth.login;

  return NextResponse.redirect(`${origin}${destination}`);
}
