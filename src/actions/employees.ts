'use server';

import { sendInviteEmail } from '@/lib/resend/send-invite-email';
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

    // generateLink creates the auth.users row without sending Supabase's own
    // (unbrandable) mailer email. We build our own /auth/confirm link from the
    // returned hashed_token and deliver it ourselves via Resend.
    const { data: invited, error: inviteError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email,
        options: { data: name ? { full_name: name } : undefined },
      });
    if (inviteError || !invited.user) {
      // Don't surface the raw auth error; the most common cause is an email
      // that has already been invited.
      throw new Error('Could not send the invitation. Please try again.');
    }

    const inviteUrl = new URL(paths.auth.confirm, appConfig.appUrl);
    inviteUrl.searchParams.set('token_hash', invited.properties.hashed_token);
    inviteUrl.searchParams.set('type', 'invite');
    inviteUrl.searchParams.set('next', paths.auth.acceptInvitation);

    try {
      await sendInviteEmail({
        to: email,
        fullName: name,
        inviteUrl: inviteUrl.toString(),
      });
    } catch {
      // The auth user exists but nobody can ever receive the link — roll back.
      await supabaseAdmin.auth.admin.deleteUser(invited.user.id);
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
