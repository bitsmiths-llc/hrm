import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

import { paths } from '@/constants/paths';
import { env } from '@/env';

import type { Database } from '@/types/supabase';

/** Reachable without a session: the public landing and every auth screen
 *  (login, forgot/reset password, accept invitation, OAuth callback). */
function isPublicRoute(pathname: string) {
  return pathname === paths.home || pathname.startsWith('/auth');
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() both refreshes the token and tells us whether there is
  // a session. Do not run other logic between createServerClient and here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Session guard: no session on a protected route → send to login. The
  // status/role funnel (M1.5) layers on top of this.
  if (!user && !isPublicRoute(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = paths.auth.login;
    const redirectResponse = NextResponse.redirect(url);
    // Carry over any auth cookies the client refreshed above.
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return supabaseResponse;
}
