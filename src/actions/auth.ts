'use server';

import { authActionClient, safeActionClient } from '@/lib/server/safe-action';
import { createSupabaseServerClient } from '@/lib/supabase/server';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from '@/schema/auth';

/** Email + password sign-in. The Supabase server client writes the session
 *  cookies; the caller refreshes to pick them up and routes into the app. */
export const signInWithPassword = safeActionClient
  .schema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // Uniform message — never reveal whether it was the email or the password.
    if (error) throw new Error('Invalid email or password');
    // Role decides which app the caller lands in (mirrored into app_metadata
    // from employees.role). The middleware enforces the same split on every
    // subsequent request.
    const isAdmin = data.user?.app_metadata?.role === 'admin';
    return { role: isAdmin ? ('admin' as const) : ('employee' as const) };
  });

/** Sends a recovery email. Always resolves ok so the response never reveals
 *  which addresses have accounts. The link is routed through /auth/callback so
 *  the PKCE code is exchanged server-side before the reset form loads. */
export const requestPasswordReset = safeActionClient
  .schema(forgotPasswordSchema)
  .action(async ({ parsedInput: { email } }) => {
    const supabase = await createSupabaseServerClient();
    const redirectTo = `${appConfig.appUrl}${paths.auth.callback}?next=${encodeURIComponent(
      paths.auth.resetPassword,
    )}`;
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  });

/** Sets a new password for the user in the current (recovery) session. */
export const updatePassword = authActionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { password }, ctx: { supabase } }) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw new Error(
        'Could not update your password. The reset link may have expired — request a new one.',
      );
    }
  });

/** Clears the session cookies. The caller routes back to /auth/login. */
export const signOut = authActionClient.action(
  async ({ ctx: { supabase } }) => {
    await supabase.auth.signOut();
  },
);
