'use server';

import {
  sendMedicalDecisionEmail,
  sendMedicalSubmittedEmail,
} from '@/lib/resend/send-medical-emails';
import { authActionClient } from '@/lib/server/safe-action';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Logger from '@/utils/logger';
import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';
import {
  medicalClaimForLabels,
  medicalServiceTypeLabels,
} from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';
import {
  medicalClaimFieldsSchema,
  reviewMedicalSchema,
} from '@/schema/medical';

import { MedicalClaimFor, MedicalServiceType } from '@/types/hrm';

/** Admin gate for the review action. The role check is server-side even though
 *  RLS also enforces it (mirrors `actions/leave.ts`). */
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

/** One-line human summary reused across the admin/employee emails. */
const medicalSummary = (
  serviceType: MedicalServiceType,
  amount: number,
  claimFor: MedicalClaimFor,
) =>
  `${medicalServiceTypeLabels[serviceType]} · ${formatCurrency(amount)} · ${medicalClaimForLabels[claimFor]}`;

/**
 * Best-effort fan-out: email every active admin that a medical claim is waiting.
 * Runs service-role (`supabaseAdmin`) because the submitting employee can't read
 * the admin roster under RLS. Callers swallow its errors — a bounced
 * notification must never undo the already-committed insert. (This project has
 * no pg_net/notify-admins Edge Function; admin-notify is done here, mirroring
 * leave/onboarding.)
 */
async function notifyAdminsOfMedical(input: {
  employeeId: string;
  summary: string;
  description: string;
}) {
  const [{ data: employee }, { data: admins }] = await Promise.all([
    supabaseAdmin
      .from('employees')
      .select('full_name, email')
      .eq('id', input.employeeId)
      .maybeSingle(),
    supabaseAdmin
      .from('employees')
      .select('full_name, email')
      .eq('role', 'admin')
      .eq('account_status', 'active'),
  ]);

  if (!employee || !admins?.length) return;

  const employeeName = employee.full_name || employee.email;
  const reviewUrl = new URL(paths.admin.approvals, appConfig.appUrl).toString();

  await Promise.all(
    admins.map((admin) =>
      sendMedicalSubmittedEmail({
        to: admin.email,
        adminName: admin.full_name,
        employeeName,
        summary: input.summary,
        description: input.description,
        reviewUrl,
      }),
    ),
  );
}

/**
 * Employee-submitted medical claim. Runs as the caller (RLS `medical_insert_own`
 * pins `status = 'pending'` and `employee_id = auth.uid()`), so an employee can
 * neither self-approve nor file for someone else. The proof files themselves are
 * uploaded client-side into `medical-proofs/<uid>/<claimId>/…` after this returns
 * the new claim id (see `useCreateMedicalClaim`); the balance bound is applied at
 * approval, not here.
 */
export const createMedicalClaim = authActionClient
  .schema(medicalClaimFieldsSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const userId = authUser.user?.id;
    if (!userId) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('medical_claims')
      .insert({
        employee_id: userId, // RLS: employee_id = auth.uid()
        claim_for: parsedInput.claimFor,
        service_type: parsedInput.serviceType,
        description: parsedInput.description,
        amount: parsedInput.amount,
        expense_date: parsedInput.expenseDate,
        status: 'pending', // RLS with check forces 'pending'
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);

    // Notify admins out-of-band. The insert has already committed, so any
    // failure here is logged, not thrown — the employee's submit still succeeds.
    try {
      await notifyAdminsOfMedical({
        employeeId: userId,
        summary: medicalSummary(
          parsedInput.serviceType,
          parsedInput.amount,
          parsedInput.claimFor,
        ),
        description: parsedInput.description,
      });
    } catch (notifyError) {
      Logger.error('Failed to notify admins of medical claim', notifyError);
    }

    return data; // { id }
  });

/**
 * Admin-only decision on a pending claim. On approval it re-reads
 * `medical_balance()` and rejects the approval if `amount > available` — the
 * bound is server-side, so a stale UI number can't bypass it (RLS lets an admin
 * update any claim). The `.eq('status','pending')` guard makes it idempotent: a
 * row that already moved on matches nothing, so a re-fire is a silent no-op. The
 * employee is emailed the outcome (best-effort).
 */
export const reviewMedicalClaim = authActionClient
  .schema(reviewMedicalSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const adminId = authUser.user?.id;
    if (!adminId) throw new Error('Unauthorized');

    const { data: claim, error: claimError } = await supabase
      .from('medical_claims')
      .select('id, employee_id, amount, status, service_type, claim_for')
      .eq('id', parsedInput.id)
      .single();
    if (claimError) throw new Error(claimError.message);

    // Idempotent: a claim that already left 'pending' is a silent no-op (mirrors
    // the `.eq('status','pending')` update guard). Returning early also skips the
    // balance re-check — re-reviewing an already-approved claim would otherwise
    // throw a misleading "exceeds available balance" error, since its amount is
    // already counted in `spent`.
    if (claim.status !== 'pending') {
      return { id: parsedInput.id };
    }

    if (parsedInput.decision === 'approved') {
      // Server-side balance bound — re-derived at approval time, cannot be
      // bypassed by a bypassed/stale client. A pending claim never moves the
      // balance, so `available` here excludes this claim.
      const { data: balance, error: balanceError } = await supabase
        .rpc('medical_balance', { p_employee: claim.employee_id })
        .single();
      if (balanceError) throw new Error(balanceError.message);
      if (claim.amount > balance.available) {
        throw new Error(
          `Claim of ${formatCurrency(claim.amount)} exceeds the available balance of ${formatCurrency(balance.available)}`,
        );
      }
    }

    const rejectionReason =
      parsedInput.decision === 'rejected'
        ? (parsedInput.rejectionReason ?? null)
        : null;

    const { data: updated, error } = await supabase
      .from('medical_claims')
      .update({
        status: parsedInput.decision,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      })
      .eq('id', parsedInput.id)
      .eq('status', 'pending')
      .select('id, employee_id, amount, service_type, claim_for');
    if (error) throw new Error(error.message);

    // No matched row (already reviewed / not found) → nothing to email.
    const reviewed = updated?.[0];
    if (reviewed) {
      try {
        const { data: employee } = await supabaseAdmin
          .from('employees')
          .select('email, full_name')
          .eq('id', reviewed.employee_id)
          .maybeSingle();
        if (employee) {
          await sendMedicalDecisionEmail({
            to: employee.email,
            fullName: employee.full_name,
            decision: parsedInput.decision,
            summary: medicalSummary(
              reviewed.service_type,
              reviewed.amount,
              reviewed.claim_for,
            ),
            rejectionReason,
            medicalUrl: new URL(
              paths.employee.medical,
              appConfig.appUrl,
            ).toString(),
          });
        }
      } catch (emailError) {
        Logger.error('Failed to send medical decision email', emailError);
      }
    }

    return { id: parsedInput.id };
  });
