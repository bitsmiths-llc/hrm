import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { paths } from '@/constants/paths';
import { env } from '@/env';

import type { Database } from '@/types/supabase';

// Email OTP link types we accept. A literal tuple so the values double as a
// runtime allowlist and a compile-time type — no cast needed to satisfy verifyOtp.
const OTP_TYPES = ['invite', 'magiclink', 'recovery', 'email'] as const;
type OtpType = (typeof OTP_TYPES)[number];

function isOtpType(value: string | null): value is OtpType {
  return OTP_TYPES.some((type) => type === value);
}

/**
 * Consumes email OTP links (invite / magic link / recovery) server-side.
 *
 * @supabase/ssr runs the cookie flow, but the default email links deliver their
 * result in a URL hash fragment the server can never read. So our email
 * templates point here with `?token_hash=&type=`: `verifyOtp` exchanges it for
 * a cookie session, then we forward to the (relative, same-origin) `next` path
 * — e.g. the invite lands on /auth/accept-invitation.
 *
 * The session cookies are written straight onto the redirect response (the same
 * way the middleware does) so they survive the redirect from a route handler.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next');

  // Only follow internal relative paths — never an open redirect.
  const destination =
    next && next.startsWith('/') && !next.startsWith('//')
      ? next
      : paths.auth.login;

  const loginRedirect = () =>
    NextResponse.redirect(`${origin}${paths.auth.login}`);

  if (!tokenHash || !isOtpType(type)) return loginRedirect();

  const response = NextResponse.redirect(`${origin}${destination}`);

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });
  // Invalid / expired / already-used token — send them to sign in.
  if (error) return loginRedirect();

  return response;
}
