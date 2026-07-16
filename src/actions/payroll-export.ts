'use server';

import * as XLSX from 'xlsx';

import { authActionClient } from '@/lib/server/safe-action';
import { supabaseAdmin } from '@/lib/supabase/admin';

import { exportPayoneerSchema } from '@/schema/payroll-export';

import type { Tables } from '@/types/supabase';

/** The exact Payoneer bulk-payment template header row (from the `june_salaries`
 *  reference). Order and wording are load-bearing — Payoneer matches columns by
 *  header, so do not reword or reorder. `Amount to Pay` (source-currency amount)
 *  is intentionally left blank; Payoneer derives it from the balance + FX. */
const PAYONEER_HEADER = [
  'Bank Account Holder Name',
  'Bank Account Number/IBAN',
  'Payoneer Balance to Pay From',
  'Amount to Pay',
  'Amount Recipient Gets',
  'Recipient Bank Account Currency',
  'Payment Reference (Optional)',
  'Transaction Description (Optional)',
] as const;

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const EXPORTS_BUCKET = 'payroll-exports';
/** Short TTL — the URL is only used for the immediate post-export download; the
 *  history view mints its own fresh signed URLs on demand. */
const DOWNLOAD_TTL_SECONDS = 60 * 5;

/** One run payslip with the employee name joined (via the `payslips → employees`
 *  FK). Cast locally to mirror the query-hook idiom in `hooks/queries/payroll`. */
type ExportPayslipRow = Pick<Tables<'payslips'>, 'employee_id' | 'total_pay'> & {
  employees: Pick<Tables<'employees'>, 'full_name'> | null;
};

/**
 * Build and persist the Payoneer bulk-payment file for a *locked* run.
 *
 * Locked-only at two layers: the employee payslip view relies on the RLS
 * `payslip_own_locked` gate; this action adds its own explicit `status` refuse
 * because it reads via the service-role client (which bypasses RLS entirely).
 *
 * Bank details are read cross-employee through `supabaseAdmin` — the action's
 * own `role === 'admin'` guard is the access control here, not RLS. Amounts are
 * the frozen `payslips.total_pay` snapshot (recipient PKR); the engine is never
 * re-run. A missing IBAN is a hard, per-employee error: we validate every row
 * before writing anything, so a bad row records no currency, no file, no row.
 */
export const exportPayoneer = authActionClient
  .schema(exportPayoneerSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    if (authUser.user?.app_metadata.role !== 'admin')
      throw new Error('Forbidden');

    const { run_id, currencyByEmployee } = parsedInput;

    // Locked-only gate (via the caller's RLS-scoped client).
    const { data: run, error: runError } = await supabase
      .from('payroll_runs')
      .select('id, status')
      .eq('id', run_id)
      .single();
    if (runError) throw new Error(runError.message);
    if (run.status !== 'locked')
      throw new Error('Run must be locked before export.');

    // Cross-employee reads need the service-role client. bank_details is fetched
    // separately (keyed by employee_id) rather than embedded off payslips —
    // there is no direct payslips → bank_details FK for PostgREST to follow.
    const { data: payslipData, error: payslipError } = await supabaseAdmin
      .from('payslips')
      .select('employee_id, total_pay, employees(full_name)')
      .eq('payroll_run_id', run_id);
    if (payslipError) throw new Error(payslipError.message);

    const rows = (payslipData ?? []) as ExportPayslipRow[];
    if (rows.length === 0) throw new Error('This run has no payslips to export.');

    const { data: bankData, error: bankError } = await supabaseAdmin
      .from('bank_details')
      .select('employee_id, account_holder, iban')
      .in(
        'employee_id',
        rows.map((row) => row.employee_id),
      );
    if (bankError) throw new Error(bankError.message);
    const bankByEmployee = new Map(
      (bankData ?? []).map((bank) => [bank.employee_id, bank]),
    );

    // Validate EVERY row first (missing currency / IBAN → hard error, no writes).
    const dataRows: (string | number)[][] = [];
    for (const row of rows) {
      const name = row.employees?.full_name ?? row.employee_id;
      const source = currencyByEmployee[row.employee_id];
      const bank = bankByEmployee.get(row.employee_id);
      if (!source) throw new Error(`Choose a source currency for ${name}.`);
      if (!bank?.iban)
        throw new Error(
          `Missing IBAN for ${name}. Add their bank details before exporting.`,
        );
      dataRows.push([
        bank.account_holder ?? name, // Bank Account Holder Name
        bank.iban, // Bank Account Number/IBAN
        source, // Payoneer Balance to Pay From
        '', // Amount to Pay (Payoneer derives from balance + FX)
        row.total_pay, // Amount Recipient Gets (whole PKR)
        'PKR', // Recipient Bank Account Currency (fixed)
        '', // Payment Reference (Optional)
        '', // Transaction Description (Optional)
      ]);
    }

    // Persist the chosen source currency onto each snapshot (one UPDATE per
    // distinct currency, run concurrently). Only reached once every row
    // validated, so a bad row never leaves a partial write behind.
    const employeesByCurrency = new Map<string, string[]>();
    for (const row of rows) {
      const source = currencyByEmployee[row.employee_id];
      employeesByCurrency.set(source, [
        ...(employeesByCurrency.get(source) ?? []),
        row.employee_id,
      ]);
    }
    const updates = await Promise.all(
      [...employeesByCurrency].map(([source, employeeIds]) =>
        supabaseAdmin
          .from('payslips')
          .update({ currency_balance: source })
          .eq('payroll_run_id', run_id)
          .in('employee_id', employeeIds),
      ),
    );
    const failedUpdate = updates.find((result) => result.error);
    if (failedUpdate?.error) throw new Error(failedUpdate.error.message);

    // Build the .xlsx from an array-of-arrays so column order === the header.
    const worksheet = XLSX.utils.aoa_to_sheet([
      [...PAYONEER_HEADER],
      ...dataRows,
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payoneer Template');
    // XLSX.write's return is typed `any`; the 'buffer' type yields a Node Buffer.
    const buffer: Buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    const filePath = `${run_id}/payoneer-${Date.now()}.xlsx`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(EXPORTS_BUCKET)
      .upload(filePath, buffer, { contentType: XLSX_MIME, upsert: false });
    if (uploadError) throw new Error(uploadError.message);

    // Record the artifact (via the RLS-scoped client — proves an admin session).
    const { error: insertError } = await supabase
      .from('payroll_exports')
      .insert({
        run_id,
        exported_by: authUser.user?.id,
        file_path: filePath,
      });
    if (insertError) throw new Error(insertError.message);

    const { data: signed } = await supabaseAdmin.storage
      .from(EXPORTS_BUCKET)
      .createSignedUrl(filePath, DOWNLOAD_TTL_SECONDS);

    return {
      file_path: filePath,
      signed_url: signed?.signedUrl ?? null,
      count: dataRows.length,
    };
  });
