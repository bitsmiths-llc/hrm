'use server';

import { z } from 'zod';

import { sendInviteEmail } from '@/lib/resend/send-invite-email';
import { authActionClient } from '@/lib/server/safe-action';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Logger from '@/utils/logger';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';
import { requiredString } from '@/schema/common';
import {
  contactInfoSchema,
  employmentConfigSchema,
  inviteEmployeeSchema,
} from '@/schema/employee';
import { bankInfoSchema, socialAccountsSchema } from '@/schema/onboarding';

/** Admin gate for every action below. The role check is server-side even though
 *  RLS also enforces it: app_metadata.role is the routing contract mirrored from
 *  employees.role by mirror_role_to_jwt() (BIT-3). */
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

/** UUID identifying the target employee for an admin write. */
const employeeIdField = z.string().uuid();
const employeeIdSchema = z.object({ employeeId: employeeIdField });

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
    requireAdmin(authUser.user?.app_metadata.role);

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
      // TODO(debug): remove once the Resend cutover is confirmed working.
      Logger.error('[inviteEmployee] generateLink failed:', inviteError);
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
    } catch (error) {
      // TODO(debug): remove once the Resend cutover is confirmed working.
      Logger.error('[inviteEmployee] sendInviteEmail failed:', error);
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

// ---------------------------------------------------------------------------
// Onboarding review (BIT-10). Both actions run as the admin (RLS
// employees_update_admin + the is_admin() branch of guard_employee_columns),
// so the account_status write is permitted directly — no RPC. The
// `.eq('account_status','submitted')` guard makes them idempotent: a row that
// isn't in `submitted` matches nothing, so re-firing (or acting on a
// non-submitted row) is a silent no-op rather than an out-of-order transition.
// ---------------------------------------------------------------------------

/** Approve a submission: → active, stamp activation, clear any prior note. */
export const approveEmployee = authActionClient
  .schema(employeeIdSchema)
  .action(async ({ parsedInput: { employeeId }, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase
      .from('employees')
      .update({
        account_status: 'active',
        activated_at: new Date().toISOString(),
        review_note: null,
      })
      .eq('id', employeeId)
      .eq('account_status', 'submitted');
    if (error) throw new Error(error.message);
  });

/** Return a submission to onboarding with a required note (the return channel
 *  the employee sees on their onboarding wizard). */
export const returnOnboarding = authActionClient
  .schema(
    employeeIdSchema.extend({ reviewNote: requiredString('A review note') }),
  )
  .action(
    async ({
      parsedInput: { employeeId, reviewNote },
      ctx: { supabase, authUser },
    }) => {
      requireAdmin(authUser.user?.app_metadata.role);
      const { error } = await supabase
        .from('employees')
        .update({ account_status: 'onboarding', review_note: reviewNote })
        .eq('id', employeeId)
        .eq('account_status', 'submitted');
      if (error) throw new Error(error.message);
    },
  );

// ---------------------------------------------------------------------------
// Admin profile editor (BIT-10). Each write targets one satellite of an
// arbitrary employee and runs as the admin (RLS *_admin policies). None touch
// a protected column, so guard_employee_columns() passes without a bypass.
// bank/socials/employment upsert because the row may not exist yet for an
// employee who is still onboarding.
// ---------------------------------------------------------------------------

/** Contact fields on the employees row. */
export const updateEmployeeContact = authActionClient
  .schema(contactInfoSchema.extend({ employeeId: employeeIdField }))
  .action(
    async ({
      parsedInput: { employeeId, phone, emergencyContact, address },
      ctx: { supabase, authUser },
    }) => {
      requireAdmin(authUser.user?.app_metadata.role);
      const { error } = await supabase
        .from('employees')
        .update({ phone, emergency_contact: emergencyContact, address })
        .eq('id', employeeId);
      if (error) throw new Error(error.message);
    },
  );

/** Bank details satellite. */
export const updateEmployeeBank = authActionClient
  .schema(bankInfoSchema.extend({ employeeId: employeeIdField }))
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase.from('bank_details').upsert({
      employee_id: parsedInput.employeeId,
      bank_name: parsedInput.bankName,
      account_holder: parsedInput.accountHolderName,
      account_number: parsedInput.accountNumber,
      iban: parsedInput.iban,
      bank_branch: parsedInput.branch ?? null,
    });
    if (error) throw new Error(error.message);
  });

/** Socials satellite. */
export const updateEmployeeSocials = authActionClient
  .schema(socialAccountsSchema.extend({ employeeId: employeeIdField }))
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase.from('socials').upsert({
      employee_id: parsedInput.employeeId,
      github_url: parsedInput.github,
      linkedin_url: parsedInput.linkedin,
      twitter_url: parsedInput.twitter || null,
    });
    if (error) throw new Error(error.message);
  });

/** Employment & payroll configuration satellite (PRD 4.1). */
export const updateEmploymentDetails = authActionClient
  .schema(employmentConfigSchema.extend({ employeeId: employeeIdField }))
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase.from('employment_details').upsert({
      employee_id: parsedInput.employeeId,
      employment_type: parsedInput.employmentType,
      base_salary: parsedInput.baseSalary,
      working_hours: parsedInput.workingHours,
      designation: parsedInput.designation,
      department: parsedInput.department || null,
    });
    if (error) throw new Error(error.message);
  });
