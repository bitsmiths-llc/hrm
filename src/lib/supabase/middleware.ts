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

/** Employee-app routes live in the (employee) route group, which adds no URL
 *  prefix, so they're enumerated from the paths config. */
const employeeRoutes = Object.values(paths.employee);

function isEmployeeRoute(pathname: string) {
  return employeeRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/** Every admin-app route is namespaced under /admin. */
function isAdminRoute(pathname: string) {
  return pathname === paths.admin.dashboard || pathname.startsWith('/admin/');
}

/** Redirect that carries over any auth cookies refreshed on this request. */
function redirectWithCookies(
  request: NextRequest,
  from: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
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

  const { pathname } = request.nextUrl;

  // Session guard: no session on a protected route → send to login.
  if (!user && !isPublicRoute(pathname)) {
    return redirectWithCookies(request, supabaseResponse, paths.auth.login);
  }

  // Role funnel: each role stays inside its own app. The role comes from the
  // JWT app_metadata (mirrored from employees.role). Anything not explicitly
  // 'admin' is treated as an employee, so admin access fails closed.
  if (user) {
    const isAdmin = user.app_metadata?.role === 'admin';
    const roleHome = isAdmin
      ? paths.admin.dashboard
      : paths.employee.dashboard;

    // Signed-in users skip the public landing and go straight to their app.
    if (pathname === paths.home) {
      return redirectWithCookies(request, supabaseResponse, roleHome);
    }
    // Employees can never enter the admin app.
    if (!isAdmin && isAdminRoute(pathname)) {
      return redirectWithCookies(
        request,
        supabaseResponse,
        paths.employee.dashboard,
      );
    }
    // Admins are bounced out of the employee app back to theirs.
    if (isAdmin && isEmployeeRoute(pathname)) {
      return redirectWithCookies(
        request,
        supabaseResponse,
        paths.admin.dashboard,
      );
    }
  }

  return supabaseResponse;
}
