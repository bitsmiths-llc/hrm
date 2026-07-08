'use server';

import { authActionClient } from '@/lib/server/safe-action';
import { supabaseAdmin } from '@/lib/supabase/admin';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';
import { inviteEmployeeSchema } from '@/schema/employee';

/**
 * Admin-only. Bring a person into the system by email invite — there is no
 * self-signup.
 *
 * This is a two-system write with no cross-system transaction: `auth.users`
 * and `public.employees` live behind different APIs, so atomicity is emulated.
 * Create the auth user first (service-role admin API), then insert the paired
 * employees row; if the row insert fails, delete the just-created auth user so
 * no orphaned account remains. Order matters — inserting the row first would
 * orphan it if the auth invite failed.
 */
export const inviteEmployee = authActionClient
  .schema(inviteEmployeeSchema)
  .action(async ({ parsedInput: { email, fullName }, ctx: { authUser } }) => {
    // Role check is server-side. app_metadata.role is the routing contract
    // mirrored from employees.role by mirror_role_to_jwt() (BIT-3).
    if (authUser.user?.app_metadata.role !== 'admin') {
      throw new Error('Forbidden');
    }

    // Collapse a blank/whitespace name to null so the row stores null, not ''.
    const name = fullName?.trim() || null;

    // The default invite email (built-in SMTP) can't be pointed at /auth/confirm
    // — template editing requires custom SMTP — so it returns via the implicit
    // hash flow. redirectTo sends that landing to /auth/invite-callback, a client
    // route that reads the session from the URL hash and forwards to set-password.
    // (With custom SMTP + a token_hash template, /auth/confirm handles it instead.)
    const redirectTo = `${appConfig.appUrl}${paths.auth.inviteCallback}`;
    const { data: invited, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: name ? { full_name: name } : undefined,
      });
    if (inviteError || !invited.user) {
      // The invite can fail *after* creating the auth user (e.g. the email send
      // fails). If a user came back, delete it so no orphan is left behind.
      if (invited?.user?.id) {
        await supabaseAdmin.auth.admin.deleteUser(invited.user.id);
      }
      // Don't surface the raw auth error; the most common cause is an email
      // that has already been invited.
      throw new Error('Could not send the invitation. Please try again.');
    }

    const { error: rowError } = await supabaseAdmin.from('employees').insert({
      id: invited.user.id,
      email,
      full_name: name,
      role: 'employee',
      account_status: 'invited',
      invited_at: new Date().toISOString(),
    });
    if (rowError) {
      // Compensating rollback: undo the auth user so no orphan is left behind.
      await supabaseAdmin.auth.admin.deleteUser(invited.user.id);
      throw new Error('Could not create the employee record. Please try again.');
    }

    return { id: invited.user.id };
  });
