'use server';

import { authActionClient } from '@/lib/server/safe-action';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

    // The invite email's link must point at /auth/confirm (see the "Invite
    // user" email template), which verifies the token server-side and forwards
    // to the set-password page. The template owns routing, so no redirectTo.
    const { data: invited, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: name ? { full_name: name } : undefined,
      });
    if (inviteError || !invited.user) {
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
