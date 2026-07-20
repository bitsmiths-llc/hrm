'use server';

import {
  sendOvertimeDecisionEmail,
  sendOvertimeSubmittedEmail,
} from '@/lib/resend/send-overtime-emails';
import { authActionClient } from '@/lib/server/safe-action';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Logger from '@/utils/logger';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';
import { overtimeLogSchema, reviewOvertimeSchema } from '@/schema/overtime';

/** Admin gate for the review action. The role check is server-side even though
 *  RLS also enforces it (mirrors `actions/leave.ts`). */
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

/** One-line human summary reused across the admin/employee emails. */
const overtimeSummary = (hours: number, projectName: string) =>
  `${hours} hr(s) · ${projectName}`;

/**
 * Best-effort fan-out: email every active admin that an overtime log is waiting.
 * Runs service-role (`supabaseAdmin`) because the submitting employee can't read
 * the admin roster under RLS. Callers swallow its errors — a bounced
 * notification must never undo the already-committed insert.
 */
async function notifyAdminsOfOvertime(input: {
  employeeId: string;
  projectId: string;
  hours: number;
  task: string;
}) {
  const [{ data: employee }, { data: admins }, { data: project }] =
    await Promise.all([
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
      supabaseAdmin
        .from('projects')
        .select('name')
        .eq('id', input.projectId)
        .maybeSingle(),
    ]);

  if (!employee || !admins?.length) return;

  const employeeName = employee.full_name || employee.email;
  const summary = overtimeSummary(input.hours, project?.name ?? 'a project');
  const reviewUrl = new URL(paths.admin.approvals, appConfig.appUrl).toString();

  await Promise.all(
    admins.map((admin) =>
      sendOvertimeSubmittedEmail({
        to: admin.email,
        adminName: admin.full_name,
        employeeName,
        summary,
        task: input.task,
        reviewUrl,
      }),
    ),
  );
}

/**
 * Employee-submitted overtime log. Runs as the caller (RLS `overtime_insert_own`
 * pins `status = 'pending'` and `employee_id = auth.uid()`), so an employee can
 * neither self-approve nor log for someone else. No rate/pay is captured — pay
 * is resolved at the payroll run against only approved, unswept logs.
 */
export const createOvertimeLog = authActionClient
  .schema(overtimeLogSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const userId = authUser.user?.id;
    if (!userId) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('overtime_logs')
      .insert({
        employee_id: userId, // RLS: employee_id = auth.uid()
        work_date: parsedInput.date,
        hours: parsedInput.hours,
        project_id: parsedInput.projectId,
        task: parsedInput.task,
        status: 'pending', // RLS with check forces 'pending'
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);

    // Notify admins out-of-band. The insert has already committed, so any
    // failure here is logged, not thrown — the employee's submit still succeeds.
    try {
      await notifyAdminsOfOvertime({
        employeeId: userId,
        projectId: parsedInput.projectId,
        hours: parsedInput.hours,
        task: parsedInput.task,
      });
    } catch (notifyError) {
      Logger.error('Failed to notify admins of overtime log', notifyError);
    }

    return data;
  });

/**
 * Admin-only decision on a pending log. Stamps status/reviewer and, on a
 * rejection, the reason (cleared to null on approve). The `.eq('status','pending')`
 * guard makes it idempotent: a row that already moved on matches nothing, so a
 * re-fire is a silent no-op rather than an out-of-order transition. The employee
 * is emailed the outcome (best-effort).
 */
export const reviewOvertimeLog = authActionClient
  .schema(reviewOvertimeSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const adminId = authUser.user?.id;
    if (!adminId) throw new Error('Unauthorized');

    const rejectionReason =
      parsedInput.decision === 'rejected'
        ? (parsedInput.rejectionReason ?? null)
        : null;

    const { data, error } = await supabase
      .from('overtime_logs')
      .update({
        status: parsedInput.decision,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      })
      .eq('id', parsedInput.id)
      .eq('status', 'pending')
      .select('id, employee_id, hours, projects(name)');
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
          await sendOvertimeDecisionEmail({
            to: employee.email,
            fullName: employee.full_name,
            decision: parsedInput.decision,
            summary: overtimeSummary(
              Number(reviewed.hours),
              reviewed.projects?.name ?? 'a project',
            ),
            rejectionReason,
            overtimeUrl: new URL(
              paths.employee.overtime,
              appConfig.appUrl,
            ).toString(),
          });
        }
      } catch (emailError) {
        Logger.error('Failed to send overtime decision email', emailError);
      }
    }

    return { id: parsedInput.id };
  });
