import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { HrmSettings } from '@/types/hrm';

// The single `payroll_settings` row (RLS `settings_read`: any authenticated
// user can read it). Mapped onto the camelCase `HrmSettings` domain type so the
// settings forms, medical-balance display, and leave page consume it unchanged.
const fetchHrmSettings = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('payroll_settings')
    .select(
      'ot_multiplier_default, tax_rate_percent, leave_pool_days, medical_accrual_monthly, medical_cap',
    )
    .eq('id', true)
    .single();
  if (error) throw new Error(error.message);
  return {
    overtimeMultiplier: Number(data.ot_multiplier_default),
    taxRatePercent: Number(data.tax_rate_percent),
    leavePoolDays: data.leave_pool_days,
    medicalMonthlyAccrual: data.medical_accrual_monthly,
    medicalBalanceCap: data.medical_cap,
  } satisfies HrmSettings;
});

/** Module-wide payroll config admins can change (overtime multiplier, leave
 *  pool, medical accrual/cap). Backed by the `payroll_settings` singleton;
 *  saving invalidates this key (see `use-update-payroll-settings`). */
export const useHrmSettings = () =>
  useQuery({
    queryKey: [QueryKeys.HRM_SETTINGS],
    queryFn: () => fetchHrmSettings(),
  });
