'use server';

import {
  sendLeaveDecisionEmail,
  sendLeaveSubmittedEmail,
} from '@/lib/resend/send-leave-emails';
import { authActionClient } from '@/lib/server/safe-action';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatDate } from '@/utils/date-functions';
import Logger from '@/utils/logger';

import { appConfig } from '@/config/app';
import { hrmConfig } from '@/constants/hrm-config';
import { leaveTypeLabels } from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';
import { createLeaveRequestSchema, reviewLeaveSchema } from '@/schema/leave';

import { LeaveType } from '@/types/hrm';

/** Admin gate for the review action. The role check is server-side even though
 *  RLS also enforces it (mirrors the pattern in `actions/employees.ts`). */
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

/** One-line human summary reused across the admin/employee emails. */
const leaveSummary = (type: LeaveType, days: number, startDate: string) =>
  `${leaveTypeLabels[type]} · ${days} day(s) from ${formatDate(startDate)}`;

/**
 * Best-effort fan-out: email every active admin that a leave request is waiting.
 * Runs service-role (`supabaseAdmin`) because the submitting employee can't read
 * the admin roster under RLS. Callers swallow its errors — a bounced
 * notification must never undo the already-committed insert.
 */
async function notifyAdminsOfLeave(input: {
  employeeId: string;
  summary: string;
  reason: string;
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
      sendLeaveSubmittedEmail({
        to: admin.email,
        adminName: admin.full_name,
        employeeName,
        summary: input.summary,
        reason: input.reason,
        reviewUrl,
      }),
    ),
  );
}

/**
 * Employee-submitted leave request. Runs as the caller (RLS `leave_insert_own`),
 * which pins `status = 'pending'` — an employee cannot self-approve. Half Day is
 * re-derived to 0.5 server-side regardless of what the client posts.
 */
export const createLeaveRequest = authActionClient
  .schema(createLeaveRequestSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const userId = authUser.user?.id;
    if (!userId) throw new Error('Unauthorized');

    const num_days =
      parsedInput.type === 'half_day'
        ? hrmConfig.halfDayValue
        : parsedInput.days;

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: userId, // RLS: employee_id = auth.uid()
        leave_type: parsedInput.type,
        reason: parsedInput.reason,
        start_date: parsedInput.startDate,
        num_days,
        status: 'pending', // RLS with check forces 'pending'
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);

    // Notify admins out-of-band. The insert has already committed, so any
    // failure here is logged, not thrown — the employee's submit still succeeds.
    try {
      await notifyAdminsOfLeave({
        employeeId: userId,
        summary: leaveSummary(
          parsedInput.type,
          num_days,
          parsedInput.startDate,
        ),
        reason: parsedInput.reason,
      });
    } catch (notifyError) {
      Logger.error('Failed to notify admins of leave request', notifyError);
    }

    return data;
  });

/**
 * Admin-only decision on a pending request. Stamps status/reviewer and, on a
 * rejection, the reason. The `.eq('status','pending')` guard makes it
 * idempotent: a row that already moved on matches nothing, so a re-fire is a
 * silent no-op rather than an out-of-order transition. The employee is emailed
 * the outcome (best-effort).
 */
export const reviewLeaveRequest = authActionClient
  .schema(reviewLeaveSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const adminId = authUser.user?.id;
    if (!adminId) throw new Error('Unauthorized');

    const rejectionReason =
      parsedInput.decision === 'rejected'
        ? (parsedInput.rejectionReason ?? null)
        : null;

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: parsedInput.decision,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      })
      .eq('id', parsedInput.id)
      .eq('status', 'pending')
      .select('id, employee_id, leave_type, num_days, start_date');
    if (error) throw new Error(error.message);

    // No matched row (already reviewed / not found) → nothing to email.
    const reviewed = data?.[0];
    if (reviewed) {
      try {
        const { data: employee } = await supabaseAdmin
          .from('employees')
          .select('email, full_name')
          .eq('id', reviewed.employee_id)
          .maybeSingle();
        if (employee) {
          await sendLeaveDecisionEmail({
            to: employee.email,
            fullName: employee.full_name,
            decision: parsedInput.decision,
            summary: leaveSummary(
              reviewed.leave_type,
              reviewed.num_days,
              reviewed.start_date,
            ),
            rejectionReason,
            leaveUrl: new URL(
              paths.employee.leave,
              appConfig.appUrl,
            ).toString(),
          });
        }
      } catch (emailError) {
        Logger.error('Failed to send leave decision email', emailError);
      }
    }

    return { id: parsedInput.id };
  });
