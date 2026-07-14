import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useHrmSettings } from '@/hooks/queries/settings';

import { authQuery } from '@/lib/client/auth-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import { QueryKeys } from '@/constants/query-keys';

import { MedicalClaim } from '@/types/hrm';
import { type Tables } from '@/types/supabase';

/** Private bucket holding claim proof files at `<uid>/<claimId>/<file>`. */
export const MEDICAL_PROOFS_BUCKET = 'medical-proofs';
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1h — long enough to view a preview

type MedicalClaimRow = Tables<'medical_claims'> & {
  medical_claim_files?:
    | Pick<Tables<'medical_claim_files'>, 'storage_path' | 'file_name'>[]
    | null;
};

/** Map a `medical_claims` row (+ its joined files) onto the `MedicalClaim`
 *  domain type. `proofFiles` carries the storage paths; the UI mints signed URLs
 *  from them on demand (see `useMedicalProofUrls`). The admin queue passes the
 *  joined employee name; self reads leave it '' (not rendered there). */
export function toMedicalClaim(
  row: MedicalClaimRow,
  employeeName = '',
): MedicalClaim {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName,
    claimFor: row.claim_for,
    serviceType: row.service_type,
    description: row.description,
    amount: row.amount,
    expenseDate: row.expense_date,
    proofFiles: (row.medical_claim_files ?? []).map(
      (file) => file.storage_path,
    ),
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
  };
}

// One employee's claim history + proof paths. Admins resolve anyone
// (medical_admin_all); an employee resolves only themselves. Drives both the
// self /medical page and the admin employee-detail tab.
const fetchMedicalClaims = authQuery(
  async ({ supabase, params }) => {
    const { data, error } = await supabase
      .from('medical_claims')
      .select('*, medical_claim_files(storage_path, file_name)')
      .eq('employee_id', params.employeeId)
      .order('expense_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map((row) => toMedicalClaim(row));
  },
  { paramsSchema: z.object({ employeeId: z.string() }) },
);

export const useMedicalClaims = (employeeId?: string) =>
  useQuery({
    queryKey: [QueryKeys.MEDICAL_CLAIMS, employeeId],
    queryFn: () => fetchMedicalClaims({ employeeId: employeeId! }),
    enabled: !!employeeId,
  });

export type MedicalBalanceResult = {
  /** Tenure-based accrual, capped (PKR). */
  accrued: number;
  /** Sum of approved claims (PKR). */
  spent: number;
  /** accrued − spent, floored at 0 — the claimable amount. */
  available: number;
  /** Admin-configured cap (from settings, not the RPC). */
  cap: number;
  /** Admin-configured monthly accrual (from settings, not the RPC). */
  monthlyAccrual: number;
};

// Canonical medical balance for one employee, derived on every read by the
// medical_balance() RPC (SECURITY INVOKER → RLS applies). The cap and monthly
// accrual are admin-configurable settings, not per-employee, so they're merged
// in from useHrmSettings rather than returned by the RPC.
const fetchMedicalBalance = authQuery(
  async ({ supabase, params }) => {
    const { data, error } = await supabase
      .rpc('medical_balance', { p_employee: params.employeeId })
      .single();
    if (error) throw new Error(error.message);
    return {
      accrued: Number(data.accrued),
      spent: Number(data.spent),
      available: Number(data.available),
    };
  },
  { paramsSchema: z.object({ employeeId: z.string() }) },
);

export const useMedicalBalance = (employeeId?: string) => {
  const settings = useHrmSettings();
  const query = useQuery({
    queryKey: [QueryKeys.MEDICAL_BALANCE, employeeId],
    queryFn: () => fetchMedicalBalance({ employeeId: employeeId! }),
    enabled: !!employeeId,
  });

  return {
    ...query,
    data:
      query.data && settings.data
        ? ({
            ...query.data,
            cap: settings.data.medicalBalanceCap,
            monthlyAccrual: settings.data.medicalMonthlyAccrual,
          } satisfies MedicalBalanceResult)
        : undefined,
    isLoading: query.isLoading || settings.isLoading,
  };
};

export type MedicalProofFile = { path: string; url: string; name: string };

/** Short-lived signed URLs for a claim's proof files. Reads directly from the
 *  `medical-proofs` bucket, so the medproofs_own / medproofs_admin storage RLS
 *  gates access — an owner sees their own, an admin sees any. Names strip the
 *  upload-time `<index>-` prefix (added to keep same-named files distinct). */
export const useMedicalProofUrls = (paths: string[]) =>
  useQuery({
    queryKey: [QueryKeys.MEDICAL_PROOF_URLS, paths],
    enabled: paths.length > 0,
    // Keep URLs stable for most of their TTL so previews don't flicker; don't
    // refetch on focus (each fetch mints new URLs).
    staleTime: (SIGNED_URL_TTL_SECONDS - 5 * 60) * 1000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<MedicalProofFile[]> => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.storage
        .from(MEDICAL_PROOFS_BUCKET)
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
      if (error) throw new Error(error.message);
      return (data ?? [])
        .filter((item) => !!item.signedUrl && !!item.path)
        .map((item) => {
          const base = (item.path as string).split('/').pop() ?? 'proof';
          return {
            path: item.path as string,
            url: item.signedUrl,
            name: base.replace(/^\d+-/, ''),
          };
        });
    },
  });
